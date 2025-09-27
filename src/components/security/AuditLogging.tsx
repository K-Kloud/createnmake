import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { 
  FileText, 
  Download, 
  Search, 
  Filter,
  Eye,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Database,
  Shield,
  Settings
} from 'lucide-react';
import { DateRange } from 'react-day-picker';

interface AuditEvent {
  id: string;
  timestamp: Date;
  user: {
    id: string;
    email: string;
    name: string;
  };
  action: string;
  category: 'authentication' | 'data' | 'admin' | 'security' | 'system';
  severity: 'info' | 'warning' | 'error' | 'critical';
  resource: string;
  details: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  success: boolean;
}

export const AuditLogging: React.FC = () => {
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<AuditEvent[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    // Mock audit events - in real app, fetch from audit API
    const mockEvents: AuditEvent[] = [
      {
        id: '1',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        user: {
          id: 'user1',
          email: 'admin@company.com',
          name: 'John Admin'
        },
        action: 'User Role Changed',
        category: 'admin',
        severity: 'warning',
        resource: '/admin/users/user2',
        details: {
          targetUser: 'jane@company.com',
          oldRole: 'user',
          newRole: 'admin',
          reason: 'Promotion to team lead'
        },
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        success: true
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        user: {
          id: 'user2',
          email: 'jane@company.com',
          name: 'Jane Smith'
        },
        action: 'Failed Login Attempt',
        category: 'authentication',
        severity: 'error',
        resource: '/auth/login',
        details: {
          reason: 'Invalid password',
          attemptCount: 3,
          accountLocked: false
        },
        ipAddress: '203.0.113.45',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        success: false
      },
      {
        id: '3',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
        user: {
          id: 'system',
          email: 'system@company.com',
          name: 'System'
        },
        action: 'Database Backup Completed',
        category: 'system',
        severity: 'info',
        resource: '/system/backup',
        details: {
          backupSize: '2.5GB',
          duration: '5m 23s',
          location: 's3://backups/daily/2024-01-15.sql.gz'
        },
        ipAddress: '10.0.0.1',
        userAgent: 'System Process',
        success: true
      },
      {
        id: '4',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
        user: {
          id: 'user3',
          email: 'bob@company.com',
          name: 'Bob Wilson'
        },
        action: 'Sensitive Data Access',
        category: 'data',
        severity: 'warning',
        resource: '/api/customers/export',
        details: {
          recordCount: 1500,
          dataType: 'customer_personal_info',
          exportFormat: 'CSV',
          justification: 'Monthly compliance report'
        },
        ipAddress: '192.168.1.150',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        success: true
      },
      {
        id: '5',
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
        user: {
          id: 'user4',
          email: 'security@company.com',
          name: 'Security System'
        },
        action: 'Security Policy Updated',
        category: 'security',
        severity: 'critical',
        resource: '/admin/security/policies',
        details: {
          policyType: 'password_policy',
          changes: {
            minLength: { old: 8, new: 12 },
            complexity: { old: 'medium', new: 'high' }
          }
        },
        ipAddress: '10.0.0.5',
        userAgent: 'Security Service',
        success: true
      }
    ];

    setAuditEvents(mockEvents);
    setFilteredEvents(mockEvents);
  }, []);

  useEffect(() => {
    let filtered = auditEvents;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(event =>
        event.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.resource.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(event => event.category === selectedCategory);
    }

    // Apply severity filter
    if (selectedSeverity !== 'all') {
      filtered = filtered.filter(event => event.severity === selectedSeverity);
    }

    // Apply date range filter
    if (dateRange?.from && dateRange?.to) {
      filtered = filtered.filter(event =>
        event.timestamp >= dateRange.from! && event.timestamp <= dateRange.to!
      );
    }

    setFilteredEvents(filtered);
  }, [auditEvents, searchQuery, selectedCategory, selectedSeverity, dateRange]);

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'info': return <CheckCircle className="h-4 w-4 text-blue-500" />;
      default: return <CheckCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'error': return 'destructive';
      case 'warning': return 'default';
      case 'info': return 'secondary';
      default: return 'secondary';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'authentication': return <User className="h-4 w-4" />;
      case 'data': return <Database className="h-4 w-4" />;
      case 'admin': return <Settings className="h-4 w-4" />;
      case 'security': return <Shield className="h-4 w-4" />;
      case 'system': return <Settings className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    // Simulate export process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Create and download CSV
    const csvContent = [
      ['Timestamp', 'User', 'Action', 'Category', 'Severity', 'Resource', 'Success', 'IP Address'].join(','),
      ...filteredEvents.map(event => [
        event.timestamp.toISOString(),
        event.user.email,
        event.action,
        event.category,
        event.severity,
        event.resource,
        event.success.toString(),
        event.ipAddress
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-log-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    setIsExporting(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Audit Logging</h2>
          <p className="text-muted-foreground">
            Track and monitor all system activities for compliance and security
          </p>
        </div>
        <Button 
          onClick={handleExport} 
          disabled={isExporting}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          {isExporting ? 'Exporting...' : 'Export Logs'}
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search events..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="authentication">Authentication</SelectItem>
                  <SelectItem value="data">Data Access</SelectItem>
                  <SelectItem value="admin">Administration</SelectItem>
                  <SelectItem value="security">Security</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Severity</Label>
              <Select value={selectedSeverity} onValueChange={setSelectedSeverity}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severities</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Date Range</Label>
              <DatePickerWithRange
                value={dateRange}
                onChange={setDateRange}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Events</p>
                <p className="text-2xl font-bold">{filteredEvents.length}</p>
              </div>
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Failed Events</p>
                <p className="text-2xl font-bold text-red-600">
                  {filteredEvents.filter(e => !e.success).length}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Critical Events</p>
                <p className="text-2xl font-bold text-red-600">
                  {filteredEvents.filter(e => e.severity === 'critical').length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Unique Users</p>
                <p className="text-2xl font-bold">
                  {new Set(filteredEvents.map(e => e.user.id)).size}
                </p>
              </div>
              <User className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Audit Events */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Audit Events
            <Badge variant="secondary">{filteredEvents.length} events</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredEvents.map((event) => (
              <div key={event.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      {getSeverityIcon(event.severity)}
                      <span className="font-semibold">{event.action}</span>
                      <Badge variant={getSeverityColor(event.severity)}>
                        {event.severity.toUpperCase()}
                      </Badge>
                      <Badge variant="outline" className="flex items-center gap-1">
                        {getCategoryIcon(event.category)}
                        {event.category}
                      </Badge>
                      {event.success ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                    </div>

                    <div className="text-sm text-muted-foreground">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {event.user.name} ({event.user.email})
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {event.timestamp.toLocaleString()}
                        </span>
                      </div>
                      <div className="mt-1">
                        Resource: <code className="text-xs bg-muted px-1 py-0.5 rounded">{event.resource}</code>
                      </div>
                      <div className="mt-1">
                        IP: {event.ipAddress} • {event.userAgent}
                      </div>
                    </div>

                    {Object.keys(event.details).length > 0 && (
                      <div className="mt-3 p-3 bg-muted rounded-lg">
                        <h4 className="text-sm font-medium mb-2">Event Details</h4>
                        <pre className="text-xs text-muted-foreground whitespace-pre-wrap">
                          {JSON.stringify(event.details, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>

                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    Details
                  </Button>
                </div>
              </div>
            ))}

            {filteredEvents.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No audit events found matching your filters.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};