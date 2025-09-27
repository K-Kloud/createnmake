import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Building, 
  Shield, 
  Key, 
  Users, 
  Settings,
  CheckCircle,
  AlertTriangle,
  Globe,
  Lock,
  UserCheck,
  Server
} from 'lucide-react';

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
}

export const EnterpriseAuth: React.FC = () => {
  const [ssoProviders, setSsoProviders] = useState<SSOProvider[]>([]);
  const [userSessions, setUserSessions] = useState<UserSession[]>([]);
  const [mfaSettings, setMfaSettings] = useState({
    enforced: true,
    methods: ['totp', 'sms', 'email'],
    gracePeriod: 7
  });

  useEffect(() => {
    // Mock data - in real app, fetch from enterprise auth API
    const mockProviders: SSOProvider[] = [
      {
        id: '1',
        name: 'Corporate AD',
        type: 'ldap',
        status: 'active',
        users: 1247,
        lastSync: new Date(Date.now() - 30 * 60 * 1000),
        config: {
          domain: 'corp.company.com'
        }
      },
      {
        id: '2',
        name: 'Google Workspace',
        type: 'oidc',
        status: 'active',
        users: 892,
        lastSync: new Date(Date.now() - 15 * 60 * 1000),
        config: {
          domain: 'company.com'
        }
      },
      {
        id: '3',
        name: 'Azure AD',
        type: 'saml',
        status: 'configuring',
        users: 0,
        lastSync: new Date(),
        config: {
          entityId: 'https://company.com/saml',
          ssoUrl: 'https://login.microsoftonline.com/tenant/saml2'
        }
      }
    ];

    const mockSessions: UserSession[] = [
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
      },
      {
        id: '2',
        userId: 'user2',
        email: 'jane.smith@company.com',
        provider: 'Google Workspace',
        loginTime: new Date(Date.now() - 4 * 60 * 60 * 1000),
        lastActivity: new Date(Date.now() - 10 * 60 * 1000),
        ipAddress: '10.0.1.50',
        userAgent: 'Safari/14.1.1',
        mfaEnabled: false
      }
    ];

    setSsoProviders(mockProviders);
    setUserSessions(mockSessions);
  }, []);

  const getProviderIcon = (type: string) => {
    switch (type) {
      case 'ldap': return <Server className="h-4 w-4" />;
      case 'oidc': return <Globe className="h-4 w-4" />;
      case 'saml': return <Shield className="h-4 w-4" />;
      default: return <Key className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'inactive': return 'secondary';
      case 'configuring': return 'outline';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Enterprise Authentication</h2>
          <p className="text-muted-foreground">
            Manage SSO providers, MFA settings, and user sessions
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <Building className="h-4 w-4" />
          Add SSO Provider
        </Button>
      </div>

      <Tabs defaultValue="sso" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="sso">SSO Providers</TabsTrigger>
          <TabsTrigger value="mfa">MFA Settings</TabsTrigger>
          <TabsTrigger value="sessions">User Sessions</TabsTrigger>
          <TabsTrigger value="policies">Security Policies</TabsTrigger>
        </TabsList>

        <TabsContent value="sso" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ssoProviders.map((provider) => (
              <Card key={provider.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {getProviderIcon(provider.type)}
                    {provider.name}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant={getStatusColor(provider.status)}>
                      {provider.status}
                    </Badge>
                    <Badge variant="outline">{provider.type.toUpperCase()}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Users</span>
                      <span className="font-medium">{provider.users.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Last Sync</span>
                      <span className="text-sm">{provider.lastSync.toLocaleTimeString()}</span>
                    </div>
                    {provider.config.domain && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Domain</span>
                        <span className="text-sm font-mono">{provider.config.domain}</span>
                      </div>
                    )}
                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        Configure
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        Test
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="mfa" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Multi-Factor Authentication Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Enforce MFA for all users</Label>
                    <p className="text-sm text-muted-foreground">
                      Require all users to set up multi-factor authentication
                    </p>
                  </div>
                  <Switch 
                    checked={mfaSettings.enforced}
                    onCheckedChange={(checked) => 
                      setMfaSettings(prev => ({ ...prev, enforced: checked }))
                    }
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-base">Allowed MFA Methods</Label>
                  <div className="space-y-2">
                    {[
                      { id: 'totp', label: 'Authenticator App (TOTP)', description: 'Google Authenticator, Authy, etc.' },
                      { id: 'sms', label: 'SMS Verification', description: 'Text message to phone number' },
                      { id: 'email', label: 'Email Verification', description: 'Code sent to email address' },
                      { id: 'hardware', label: 'Hardware Keys', description: 'YubiKey, FIDO2 devices' }
                    ].map((method) => (
                      <div key={method.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                        <Switch 
                          checked={mfaSettings.methods.includes(method.id)}
                          onCheckedChange={(checked) => {
                            setMfaSettings(prev => ({
                              ...prev,
                              methods: checked 
                                ? [...prev.methods, method.id]
                                : prev.methods.filter(m => m !== method.id)
                            }));
                          }}
                        />
                        <div>
                          <div className="font-medium">{method.label}</div>
                          <div className="text-sm text-muted-foreground">{method.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="grace-period">Grace Period (days)</Label>
                  <Select value={mfaSettings.gracePeriod.toString()}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">No grace period</SelectItem>
                      <SelectItem value="3">3 days</SelectItem>
                      <SelectItem value="7">7 days</SelectItem>
                      <SelectItem value="14">14 days</SelectItem>
                      <SelectItem value="30">30 days</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    Time users have to set up MFA after first login
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button>Save MFA Settings</Button>
                <Button variant="outline">Send MFA Reminder</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sessions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Active User Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userSessions.map((session) => (
                  <div key={session.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{session.email}</span>
                          <Badge variant="secondary">{session.provider}</Badge>
                          {session.mfaEnabled ? (
                            <Badge variant="default" className="flex items-center gap-1">
                              <UserCheck className="h-3 w-3" />
                              MFA
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="flex items-center gap-1">
                              <AlertTriangle className="h-3 w-3" />
                              No MFA
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Login: {session.loginTime.toLocaleString()} • 
                          Last Activity: {session.lastActivity.toLocaleString()}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          IP: {session.ipAddress} • {session.userAgent}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                        <Button variant="destructive" size="sm">
                          Terminate
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="policies" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Password Policy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Minimum Length</Label>
                  <Input type="number" defaultValue="12" />
                </div>
                <div className="space-y-2">
                  <Label>Complexity Requirements</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Switch defaultChecked />
                      <Label>Uppercase letters</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch defaultChecked />
                      <Label>Lowercase letters</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch defaultChecked />
                      <Label>Numbers</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch defaultChecked />
                      <Label>Special characters</Label>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Password Expiry (days)</Label>
                  <Input type="number" defaultValue="90" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Session Policy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Session Timeout (minutes)</Label>
                  <Input type="number" defaultValue="30" />
                </div>
                <div className="space-y-2">
                  <Label>Maximum Concurrent Sessions</Label>
                  <Input type="number" defaultValue="3" />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch defaultChecked />
                  <Label>Force logout on password change</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch defaultChecked />
                  <Label>Remember device for MFA</Label>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>IP Restrictions</CardTitle>
            </CardHeader>
            <CardContent>
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Configure IP whitelist/blacklist for enhanced security. 
                  Be careful not to lock yourself out.
                </AlertDescription>
              </Alert>
              <div className="mt-4 space-y-2">
                <Label>Allowed IP Ranges</Label>
                <Input placeholder="192.168.1.0/24, 10.0.0.0/8" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};