import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SSOProvider {
  id: string;
  name: string;
  type: 'saml' | 'oidc' | 'ldap';
  status: 'active' | 'inactive' | 'configuring';
  users: number;
  lastSync: Date;
  config: {
    domain?: string;
    entityId?: string;
    ssoUrl?: string;
    certificate?: string;
    clientId?: string;
    clientSecret?: string;
    serverUrl?: string;
  };
}

interface UserSession {
  id: string;
  userId: string;
  email: string;
  provider: string;
  loginTime: Date;
  lastActivity: Date;
  ipAddress: string;
  userAgent: string;
  mfaEnabled: boolean;
  deviceId?: string;
  location?: string;
}

interface MFASettings {
  enforced: boolean;
  methods: string[];
  gracePeriod: number;
  rememberDevice: boolean;
  backupCodes: boolean;
}

interface SecurityPolicy {
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
    expiryDays: number;
    historyCount: number;
  };
  sessionPolicy: {
    timeoutMinutes: number;
    maxConcurrentSessions: number;
    forceLogoutOnPasswordChange: boolean;
    rememberDeviceForMFA: boolean;
  };
  accessPolicy: {
    allowedIPs: string[];
    blockedIPs: string[];
    requireVPN: boolean;
    allowedCountries: string[];
  };
}

export const useEnterpriseAuth = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch SSO providers - mock data since tables don't exist yet
  const { data: ssoProviders, isLoading: providersLoading } = useQuery({
    queryKey: ['sso-providers'],
    queryFn: async (): Promise<SSOProvider[]> => {
      // Mock data until tables are created
      return [
        {
          id: '1',
          name: 'Corporate AD',
          type: 'ldap',
          status: 'active',
          users: 1247,
          lastSync: new Date(Date.now() - 30 * 60 * 1000),
          config: { domain: 'corp.company.com' }
        },
        {
          id: '2',
          name: 'Google Workspace',
          type: 'oidc',
          status: 'active',
          users: 892,
          lastSync: new Date(Date.now() - 15 * 60 * 1000),
          config: { domain: 'company.com' }
        }
      ];
    }
  });

  // Fetch user sessions - mock data
  const { data: userSessions, isLoading: sessionsLoading } = useQuery({
    queryKey: ['user-sessions'],
    queryFn: async (): Promise<UserSession[]> => {
      // Mock data until tables are created
      return [
        {
          id: '1',
          userId: 'user1',
          email: 'john.doe@company.com',
          provider: 'Corporate AD',
          loginTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
          lastActivity: new Date(Date.now() - 5 * 60 * 1000),
          ipAddress: '192.168.1.100',
          userAgent: 'Chrome/91.0.4472.124',
          mfaEnabled: true
        }
      ];
    }
  });

  // Fetch MFA settings
  const { data: mfaSettings, isLoading: mfaLoading } = useQuery({
    queryKey: ['mfa-settings'],
    queryFn: async (): Promise<MFASettings> => {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('setting_value')
        .eq('setting_key', 'mfa_settings')
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      return data?.setting_value || {
        enforced: false,
        methods: ['totp'],
        gracePeriod: 7,
        rememberDevice: true,
        backupCodes: true
      };
    }
  });

  // Fetch security policies
  const { data: securityPolicies, isLoading: policiesLoading } = useQuery({
    queryKey: ['security-policies'],
    queryFn: async (): Promise<SecurityPolicy> => {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('setting_value')
        .eq('setting_key', 'security_policies')
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      return data?.setting_value || {
        passwordPolicy: {
          minLength: 8,
          requireUppercase: true,
          requireLowercase: true,
          requireNumbers: true,
          requireSpecialChars: true,
          expiryDays: 90,
          historyCount: 5
        },
        sessionPolicy: {
          timeoutMinutes: 30,
          maxConcurrentSessions: 3,
          forceLogoutOnPasswordChange: true,
          rememberDeviceForMFA: true
        },
        accessPolicy: {
          allowedIPs: [],
          blockedIPs: [],
          requireVPN: false,
          allowedCountries: []
        }
      };
    }
  });

  // Create SSO provider mutation
  const createSSOProvider = useMutation({
    mutationFn: async (providerData: Omit<SSOProvider, 'id' | 'users' | 'lastSync'>) => {
      const { data, error } = await supabase
        .from('sso_providers')
        .insert({
          name: providerData.name,
          type: providerData.type,
          status: providerData.status,
          config: providerData.config
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "SSO Provider Created",
        description: "SSO provider has been successfully configured."
      });
      queryClient.invalidateQueries({ queryKey: ['sso-providers'] });
    },
    onError: (error) => {
      toast({
        title: "Configuration Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Update SSO provider mutation
  const updateSSOProvider = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<SSOProvider> & { id: string }) => {
      const { data, error } = await supabase
        .from('sso_providers')
        .update({
          name: updates.name,
          status: updates.status,
          config: updates.config
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Provider Updated",
        description: "SSO provider configuration has been updated."
      });
      queryClient.invalidateQueries({ queryKey: ['sso-providers'] });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Test SSO provider mutation
  const testSSOProvider = useMutation({
    mutationFn: async (providerId: string) => {
      const { data, error } = await supabase.functions.invoke('test-sso-provider', {
        body: { providerId }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast({
        title: "SSO Test Result",
        description: data.success ? "SSO configuration is working correctly." : `Test failed: ${data.error}`,
        variant: data.success ? "default" : "destructive"
      });
    },
    onError: (error) => {
      toast({
        title: "Test Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Update MFA settings mutation
  const updateMFASettings = useMutation({
    mutationFn: async (settings: MFASettings) => {
      const { data, error } = await supabase
        .from('admin_settings')
        .upsert({
          setting_key: 'mfa_settings',
          setting_value: settings
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "MFA Settings Updated",
        description: "Multi-factor authentication settings have been saved."
      });
      queryClient.invalidateQueries({ queryKey: ['mfa-settings'] });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Update security policies mutation
  const updateSecurityPolicies = useMutation({
    mutationFn: async (policies: SecurityPolicy) => {
      const { data, error } = await supabase
        .from('admin_settings')
        .upsert({
          setting_key: 'security_policies',
          setting_value: policies
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Security Policies Updated",
        description: "Security policies have been successfully updated."
      });
      queryClient.invalidateQueries({ queryKey: ['security-policies'] });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Terminate user session mutation
  const terminateSession = useMutation({
    mutationFn: async (sessionId: string) => {
      const { data, error } = await supabase
        .from('user_sessions')
        .update({ is_active: false, ended_at: new Date().toISOString() })
        .eq('session_id', sessionId);

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Session Terminated",
        description: "User session has been terminated."
      });
      queryClient.invalidateQueries({ queryKey: ['user-sessions'] });
    },
    onError: (error) => {
      toast({
        title: "Termination Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Sync SSO provider mutation
  const syncSSOProvider = useMutation({
    mutationFn: async (providerId: string) => {
      const { data, error } = await supabase.functions.invoke('sync-sso-provider', {
        body: { providerId }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast({
        title: "Sync Complete",
        description: `Synchronized ${data.userCount} users from SSO provider.`
      });
      queryClient.invalidateQueries({ queryKey: ['sso-providers'] });
      queryClient.invalidateQueries({ queryKey: ['user-sessions'] });
    },
    onError: (error) => {
      toast({
        title: "Sync Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  return {
    // Data
    ssoProviders,
    userSessions,
    mfaSettings,
    securityPolicies,

    // Loading states
    providersLoading,
    sessionsLoading,
    mfaLoading,
    policiesLoading,

    // Mutations
    createSSOProvider: createSSOProvider.mutate,
    isCreatingProvider: createSSOProvider.isPending,

    updateSSOProvider: updateSSOProvider.mutate,
    isUpdatingProvider: updateSSOProvider.isPending,

    testSSOProvider: testSSOProvider.mutate,
    isTestingProvider: testSSOProvider.isPending,

    updateMFASettings: updateMFASettings.mutate,
    isUpdatingMFA: updateMFASettings.isPending,

    updateSecurityPolicies: updateSecurityPolicies.mutate,
    isUpdatingPolicies: updateSecurityPolicies.isPending,

    terminateSession: terminateSession.mutate,
    isTerminatingSession: terminateSession.isPending,

    syncSSOProvider: syncSSOProvider.mutate,
    isSyncingProvider: syncSSOProvider.isPending
  };
};