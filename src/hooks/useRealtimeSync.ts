import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useMultiStackServices } from './useMultiStackServices';

export interface SyncState {
  isConnected: boolean;
  lastSync: Date | null;
  pendingChanges: number;
  conflictResolution: 'auto' | 'manual';
}

export interface SyncOptions {
  tableName: string;
  userId?: string;
  syncInterval?: number;
  conflictResolution?: 'auto' | 'manual';
  enableRealtime?: boolean;
}

export const useRealtimeSync = (options: SyncOptions) => {
  const [syncState, setSyncState] = useState<SyncState>({
    isConnected: false,
    lastSync: null,
    pendingChanges: 0,
    conflictResolution: options.conflictResolution || 'auto'
  });

  const [localData, setLocalData] = useState<any[]>([]);
  const [conflicts, setConflicts] = useState<any[]>([]);
  const pendingChangesRef = useRef<Map<string, any>>(new Map());
  const channelRef = useRef<any>(null);
  const syncTimeoutRef = useRef<NodeJS.Timeout>();

  const { performanceOperation } = useMultiStackServices();

  // Initialize sync connection
  const connect = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Load initial data
      const { data, error } = await supabase
        .from(options.tableName as any)
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      setLocalData(data || []);
      setSyncState(prev => ({ 
        ...prev, 
        isConnected: true, 
        lastSync: new Date() 
      }));

      // Set up realtime subscription if enabled
      if (options.enableRealtime) {
        setupRealtimeSubscription();
      }

      // Set up periodic sync
      if (options.syncInterval) {
        setupPeriodicSync();
      }

    } catch (error) {
      console.error('Failed to connect sync:', error);
      setSyncState(prev => ({ ...prev, isConnected: false }));
    }
  }, [options.tableName, options.enableRealtime, options.syncInterval]);

  // Set up realtime subscription
  const setupRealtimeSubscription = useCallback(() => {
    const channel = supabase
      .channel(`sync:${options.tableName}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: options.tableName,
          filter: options.userId ? `user_id=eq.${options.userId}` : undefined
        },
        (payload) => {
          handleRealtimeChange(payload);
        }
      )
      .subscribe();

    channelRef.current = channel;
  }, [options.tableName, options.userId]);

  // Handle realtime changes
  const handleRealtimeChange = useCallback((payload: any) => {
    const { eventType, new: newRecord, old: oldRecord } = payload;

    setLocalData(prev => {
      switch (eventType) {
        case 'INSERT':
          return [...prev, newRecord];
        
        case 'UPDATE':
          return prev.map(item => 
            item.id === newRecord.id ? { ...item, ...newRecord } : item
          );
        
        case 'DELETE':
          return prev.filter(item => item.id !== oldRecord.id);
        
        default:
          return prev;
      }
    });

    setSyncState(prev => ({ ...prev, lastSync: new Date() }));
  }, []);

  // Set up periodic sync
  const setupPeriodicSync = useCallback(() => {
    const syncData = async () => {
      try {
        await performFullSync();
      } catch (error) {
        console.error('Periodic sync failed:', error);
      }
    };

    syncTimeoutRef.current = setInterval(syncData, options.syncInterval || 30000);
  }, [options.syncInterval]);

  // Perform full synchronization
  const performFullSync = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get pending changes
      const pendingChanges = Array.from(pendingChangesRef.current.values());
      
      if (pendingChanges.length > 0) {
        // Use Go performance service for efficient batch sync
        const syncResult = await performanceOperation('batch-sync', {
          table: options.tableName,
          changes: pendingChanges,
          user_id: user.id,
          conflict_resolution: syncState.conflictResolution
        });

        // Handle sync conflicts
        if (syncResult.conflicts && syncResult.conflicts.length > 0) {
          setConflicts(syncResult.conflicts);
          
          if (syncState.conflictResolution === 'auto') {
            await resolveConflictsAutomatically(syncResult.conflicts);
          }
        }

        // Clear pending changes
        pendingChangesRef.current.clear();
        setSyncState(prev => ({ 
          ...prev, 
          pendingChanges: 0, 
          lastSync: new Date() 
        }));
      }

      // Fetch latest data
      const { data, error } = await supabase
        .from(options.tableName as any)
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      setLocalData(data || []);

    } catch (error) {
      console.error('Full sync failed:', error);
      throw error;
    }
  }, [options.tableName, syncState.conflictResolution, performanceOperation]);

  // Add pending change
  const addPendingChange = useCallback((id: string, change: any) => {
    pendingChangesRef.current.set(id, {
      id,
      ...change,
      timestamp: new Date().toISOString(),
      user_id: options.userId
    });

    setSyncState(prev => ({ 
      ...prev, 
      pendingChanges: pendingChangesRef.current.size 
    }));
  }, [options.userId]);

  // Update local data and queue sync
  const updateData = useCallback((id: string, updates: any) => {
    setLocalData(prev => 
      prev.map(item => 
        item.id === id ? { ...item, ...updates } : item
      )
    );

    addPendingChange(id, updates);
  }, [addPendingChange]);

  // Add new data and queue sync
  const addData = useCallback((newItem: any) => {
    const id = newItem.id || `temp-${Date.now()}`;
    const itemWithId = { ...newItem, id };

    setLocalData(prev => [...prev, itemWithId]);
    addPendingChange(id, itemWithId);

    return id;
  }, [addPendingChange]);

  // Remove data and queue sync
  const removeData = useCallback((id: string) => {
    setLocalData(prev => prev.filter(item => item.id !== id));
    addPendingChange(id, { deleted: true });
  }, [addPendingChange]);

  // Resolve conflicts automatically
  const resolveConflictsAutomatically = useCallback(async (conflicts: any[]) => {
    for (const conflict of conflicts) {
      // Simple last-write-wins strategy
      const resolution = conflict.remote_version.updated_at > conflict.local_version.updated_at
        ? conflict.remote_version
        : conflict.local_version;

        await supabase
        .from(options.tableName as any)
        .upsert(resolution);
    }
    
    setConflicts([]);
  }, [options.tableName]);

  // Manual conflict resolution
  const resolveConflict = useCallback(async (conflictId: string, resolution: 'local' | 'remote' | 'merge', mergeData?: any) => {
    const conflict = conflicts.find(c => c.id === conflictId);
    if (!conflict) return;

    let resolvedData;
    switch (resolution) {
      case 'local':
        resolvedData = conflict.local_version;
        break;
      case 'remote':
        resolvedData = conflict.remote_version;
        break;
      case 'merge':
        resolvedData = mergeData || { ...conflict.remote_version, ...conflict.local_version };
        break;
    }

    await supabase
      .from(options.tableName as any)
      .upsert(resolvedData);

    setConflicts(prev => prev.filter(c => c.id !== conflictId));
  }, [conflicts, options.tableName]);

  // Disconnect sync
  const disconnect = useCallback(() => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    if (syncTimeoutRef.current) {
      clearInterval(syncTimeoutRef.current);
      syncTimeoutRef.current = undefined;
    }

    setSyncState(prev => ({ ...prev, isConnected: false }));
  }, []);

  // Force sync
  const forceSync = useCallback(async () => {
    await performFullSync();
  }, [performFullSync]);

  // Initialize on mount
  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    // State
    syncState,
    localData,
    conflicts,
    
    // Actions
    updateData,
    addData,
    removeData,
    forceSync,
    resolveConflict,
    connect,
    disconnect,
    
    // Utils
    isConnected: syncState.isConnected,
    hasPendingChanges: syncState.pendingChanges > 0,
    hasConflicts: conflicts.length > 0
  };
};