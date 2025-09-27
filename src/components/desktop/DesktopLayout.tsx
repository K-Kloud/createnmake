import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  Monitor, 
  Sidebar, 
  Settings, 
  Maximize2, 
  Minimize2, 
  X, 
  Menu, 
  Search, 
  Bell,
  User,
  Home,
  Palette,
  Database,
  BarChart3,
  FileText,
  Folder,
  Download,
  Upload
} from 'lucide-react';

interface DesktopLayoutProps {
  children: React.ReactNode;
  currentPage?: string;
}

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  category: 'main' | 'tools' | 'data';
}

export const DesktopLayout: React.FC<DesktopLayoutProps> = ({ children, currentPage = 'home' }) => {
  const { toast } = useToast();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [activePanel, setActivePanel] = useState<string | null>(null);

  const sidebarItems: SidebarItem[] = [
    // Main Navigation
    { id: 'home', label: 'Dashboard', icon: <Home className="h-4 w-4" />, category: 'main' },
    { id: 'design', label: 'Design Studio', icon: <Palette className="h-4 w-4" />, category: 'main' },
    { id: 'files', label: 'File Manager', icon: <Folder className="h-4 w-4" />, category: 'main' },
    { id: 'profile', label: 'Profile', icon: <User className="h-4 w-4" />, category: 'main' },
    
    // Tools
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="h-4 w-4" />, category: 'tools' },
    { id: 'reports', label: 'Reports', icon: <FileText className="h-4 w-4" />, category: 'tools' },
    
    // Data
    { id: 'database', label: 'Database', icon: <Database className="h-4 w-4" />, category: 'data' },
  ];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Keyboard shortcuts
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'b':
            e.preventDefault();
            setSidebarCollapsed(!sidebarCollapsed);
            break;
          case 'm':
            e.preventDefault();
            setIsMaximized(!isMaximized);
            break;
          case 'k':
            e.preventDefault();
            // Open command palette
            toast({
              title: "Command Palette",
              description: "Search functionality would open here",
            });
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sidebarCollapsed, isMaximized, toast]);

  const handleWindowControl = (action: 'minimize' | 'maximize' | 'close') => {
    switch (action) {
      case 'minimize':
        toast({
          title: "Minimize",
          description: "Window would be minimized in desktop app",
        });
        break;
      case 'maximize':
        setIsMaximized(!isMaximized);
        break;
      case 'close':
        toast({
          title: "Close",
          description: "Application would close in desktop app",
        });
        break;
    }
  };

  const groupedItems = sidebarItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, SidebarItem[]>);

  return (
    <div className={`flex h-screen bg-background ${isMaximized ? 'fixed inset-0 z-50' : ''}`}>
      {/* Title Bar */}
      <div className="fixed top-0 left-0 right-0 h-8 bg-muted/50 border-b flex items-center justify-between px-4 z-50 select-none">
        <div className="flex items-center gap-2">
          <Monitor className="h-4 w-4" />
          <span className="text-sm font-medium">OpenTek Desktop</span>
        </div>
        
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 hover:bg-muted"
            onClick={() => handleWindowControl('minimize')}
          >
            <Minimize2 className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 hover:bg-muted"
            onClick={() => handleWindowControl('maximize')}
          >
            <Maximize2 className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground"
            onClick={() => handleWindowControl('close')}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Sidebar */}
      <div className={`flex-shrink-0 ${sidebarCollapsed ? 'w-12' : 'w-64'} transition-all duration-300 border-r bg-muted/20 mt-8`}>
        <div className="p-4">
          <div className="flex items-center justify-between mb-6">
            {!sidebarCollapsed && (
              <h2 className="text-lg font-semibold">Navigation</h2>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            >
              {sidebarCollapsed ? <Menu className="h-4 w-4" /> : <Sidebar className="h-4 w-4" />}
            </Button>
          </div>

          <div className="space-y-6">
            {Object.entries(groupedItems).map(([category, items]) => (
              <div key={category}>
                {!sidebarCollapsed && (
                  <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                    {category}
                  </h3>
                )}
                <div className="space-y-1">
                  {items.map((item) => (
                    <Button
                      key={item.id}
                      variant={currentPage === item.id ? 'secondary' : 'ghost'}
                      className={`w-full justify-start ${sidebarCollapsed ? 'px-2' : 'px-3'}`}
                      onClick={() => setActivePanel(item.id)}
                    >
                      {item.icon}
                      {!sidebarCollapsed && (
                        <span className="ml-2">{item.label}</span>
                      )}
                    </Button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col mt-8">
        {/* Top Bar */}
        <div className="h-14 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold">
              {sidebarItems.find(item => item.id === currentPage)?.label || 'Desktop App'}
            </h1>
            <Badge variant="outline">Desktop Mode</Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <Search className="h-4 w-4" />
              <span className="ml-2 hidden md:inline">Search (Ctrl+K)</span>
            </Button>
            <Button variant="ghost" size="sm">
              <Bell className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {children}
        </div>

        {/* Status Bar */}
        <div className="h-6 border-t bg-muted/50 flex items-center justify-between px-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span>Ready</span>
            <span>•</span>
            <span>Desktop v1.0.0</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Sync: Active</span>
            <span>•</span>
            <span>{new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      </div>

      {/* Right Panel (Optional) */}
      {activePanel && (
        <div className="w-80 border-l bg-muted/20 mt-8">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Panel</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActivePanel(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Quick Actions</CardTitle>
                <CardDescription className="text-xs">
                  Common desktop operations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Upload className="h-4 w-4 mr-2" />
                  Import Files
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Download className="h-4 w-4 mr-2" />
                  Export Data
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Settings className="h-4 w-4 mr-2" />
                  Preferences
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};