import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  FileText,
  Calendar,
  Download,
  Eye,
  Clock,
  Users,
  Database,
  Lock,
  Globe
} from 'lucide-react';

interface ComplianceFramework {
  id: string;
  name: string;
  description: string;
  status: 'compliant' | 'non-compliant' | 'in-progress' | 'not-assessed';
  score: number;
  lastAssessment: Date;
  nextAssessment: Date;
  requirements: ComplianceRequirement[];
  certificationStatus?: 'certified' | 'expired' | 'pending';
}

interface ComplianceRequirement {
  id: string;
  title: string;
  description: string;
  status: 'compliant' | 'non-compliant' | 'partial' | 'not-assessed';
  category: string;
  priority: 'high' | 'medium' | 'low';
  evidence: string[];
  lastReview: Date;
  assignedTo: string;
  dueDate?: Date;
}

interface ComplianceReport {
  id: string;
  framework: string;
  type: 'assessment' | 'audit' | 'certification';
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  createdDate: Date;
  submittedDate?: Date;
  approvedDate?: Date;
  createdBy: string;
  findings: number;
  score: number;
}

export const ComplianceManagement: React.FC = () => {
  const [frameworks, setFrameworks] = useState<ComplianceFramework[]>([]);
  const [reports, setReports] = useState<ComplianceReport[]>([]);
  const [selectedFramework, setSelectedFramework] = useState<string>('');

  useEffect(() => {
    // Mock data - in real app, fetch from compliance API
    const mockFrameworks: ComplianceFramework[] = [
      {
        id: 'gdpr',
        name: 'GDPR',
        description: 'General Data Protection Regulation',
        status: 'compliant',
        score: 94,
        lastAssessment: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        nextAssessment: new Date(Date.now() + 335 * 24 * 60 * 60 * 1000),
        certificationStatus: 'certified',
        requirements: [
          {
            id: 'gdpr-1',
            title: 'Data Processing Records',
            description: 'Maintain records of all data processing activities',
            status: 'compliant',
            category: 'Documentation',
            priority: 'high',
            evidence: ['processing-records.pdf', 'data-flow-diagram.pdf'],
            lastReview: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
            assignedTo: 'privacy@company.com'
          },
          {
            id: 'gdpr-2',
            title: 'Right to Erasure',
            description: 'Implement data deletion capabilities',
            status: 'compliant',
            category: 'Technical',
            priority: 'high',
            evidence: ['deletion-process.pdf', 'test-results.pdf'],
            lastReview: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
            assignedTo: 'engineering@company.com'
          },
          {
            id: 'gdpr-3',
            title: 'Data Breach Notification',
            description: 'Establish 72-hour breach notification process',
            status: 'partial',
            category: 'Process',
            priority: 'high',
            evidence: ['incident-response-plan.pdf'],
            lastReview: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
            assignedTo: 'security@company.com',
            dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
          }
        ]
      },
      {
        id: 'sox',
        name: 'SOX',
        description: 'Sarbanes-Oxley Act',
        status: 'in-progress',
        score: 78,
        lastAssessment: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
        nextAssessment: new Date(Date.now() + 320 * 24 * 60 * 60 * 1000),
        certificationStatus: 'pending',
        requirements: [
          {
            id: 'sox-1',
            title: 'Internal Controls',
            description: 'Establish internal controls over financial reporting',
            status: 'compliant',
            category: 'Financial',
            priority: 'high',
            evidence: ['control-documentation.pdf'],
            lastReview: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            assignedTo: 'finance@company.com'
          },
          {
            id: 'sox-2',
            title: 'Access Controls',
            description: 'Implement proper access controls for financial systems',
            status: 'non-compliant',
            category: 'Technical',
            priority: 'high',
            evidence: [],
            lastReview: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            assignedTo: 'it@company.com',
            dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000)
          }
        ]
      },
      {
        id: 'iso27001',
        name: 'ISO 27001',
        description: 'Information Security Management',
        status: 'non-compliant',
        score: 65,
        lastAssessment: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        nextAssessment: new Date(Date.now() + 275 * 24 * 60 * 60 * 1000),
        certificationStatus: 'expired',
        requirements: [
          {
            id: 'iso-1',
            title: 'Information Security Policy',
            description: 'Establish and maintain information security policy',
            status: 'compliant',
            category: 'Policy',
            priority: 'high',
            evidence: ['security-policy.pdf'],
            lastReview: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
            assignedTo: 'security@company.com'
          },
          {
            id: 'iso-2',
            title: 'Risk Assessment',
            description: 'Conduct regular risk assessments',
            status: 'non-compliant',
            category: 'Risk Management',
            priority: 'high',
            evidence: [],
            lastReview: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
            assignedTo: 'security@company.com',
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          }
        ]
      }
    ];

    const mockReports: ComplianceReport[] = [
      {
        id: '1',
        framework: 'GDPR',
        type: 'assessment',
        status: 'approved',
        createdDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        submittedDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
        approvedDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
        createdBy: 'privacy@company.com',
        findings: 3,
        score: 94
      },
      {
        id: '2',
        framework: 'SOX',
        type: 'audit',
        status: 'submitted',
        createdDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        submittedDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        createdBy: 'finance@company.com',
        findings: 5,
        score: 78
      },
      {
        id: '3',
        framework: 'ISO 27001',
        type: 'certification',
        status: 'draft',
        createdDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        createdBy: 'security@company.com',
        findings: 8,
        score: 65
      }
    ];

    setFrameworks(mockFrameworks);
    setReports(mockReports);
    setSelectedFramework('gdpr');
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'default';
      case 'non-compliant': return 'destructive';
      case 'partial': return 'default';
      case 'in-progress': return 'outline';
      case 'not-assessed': return 'secondary';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'non-compliant': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'partial': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'in-progress': return <Clock className="h-4 w-4 text-blue-600" />;
      case 'not-assessed': return <AlertTriangle className="h-4 w-4 text-gray-600" />;
      default: return <AlertTriangle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const selectedFrameworkData = frameworks.find(f => f.id === selectedFramework);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Compliance Management</h2>
          <p className="text-muted-foreground">
            Manage compliance frameworks, requirements, and assessments
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Generate Report
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Frameworks</p>
                <p className="text-2xl font-bold">{frameworks.length}</p>
              </div>
              <Shield className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Compliant</p>
                <p className="text-2xl font-bold text-green-600">
                  {frameworks.filter(f => f.status === 'compliant').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Non-Compliant</p>
                <p className="text-2xl font-bold text-red-600">
                  {frameworks.filter(f => f.status === 'non-compliant').length}
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
                <p className="text-sm font-medium text-muted-foreground">Avg. Score</p>
                <p className="text-2xl font-bold">
                  {Math.round(frameworks.reduce((acc, f) => acc + f.score, 0) / frameworks.length)}%
                </p>
              </div>
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="frameworks" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="frameworks">Frameworks</TabsTrigger>
          <TabsTrigger value="requirements">Requirements</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="assessments">Assessments</TabsTrigger>
        </TabsList>

        <TabsContent value="frameworks" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {frameworks.map((framework) => (
              <Card 
                key={framework.id} 
                className={`cursor-pointer transition-all ${
                  selectedFramework === framework.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setSelectedFramework(framework.id)}
              >
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{framework.name}</span>
                    {getStatusIcon(framework.status)}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant={getStatusColor(framework.status)}>
                      {framework.status}
                    </Badge>
                    {framework.certificationStatus && (
                      <Badge variant="outline">
                        {framework.certificationStatus}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      {framework.description}
                    </p>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Compliance Score</span>
                        <span className="text-sm font-bold">{framework.score}%</span>
                      </div>
                      <Progress value={framework.score} className="h-2" />
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <div>Last Assessment: {framework.lastAssessment.toLocaleDateString()}</div>
                      <div>Next Assessment: {framework.nextAssessment.toLocaleDateString()}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="requirements" className="space-y-4">
          {selectedFrameworkData && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  {selectedFrameworkData.name} Requirements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {selectedFrameworkData.requirements.map((requirement) => (
                    <div key={requirement.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-3">
                            {getStatusIcon(requirement.status)}
                            <span className="font-semibold">{requirement.title}</span>
                            <Badge variant={getStatusColor(requirement.status)}>
                              {requirement.status}
                            </Badge>
                            <Badge variant={getPriorityColor(requirement.priority)}>
                              {requirement.priority}
                            </Badge>
                            <Badge variant="outline">{requirement.category}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {requirement.description}
                          </p>
                          <div className="text-sm text-muted-foreground">
                            <div>Assigned to: {requirement.assignedTo}</div>
                            <div>Last Review: {requirement.lastReview.toLocaleDateString()}</div>
                            {requirement.dueDate && (
                              <div>Due Date: {requirement.dueDate.toLocaleDateString()}</div>
                            )}
                          </div>
                          {requirement.evidence.length > 0 && (
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-sm font-medium">Evidence:</span>
                              {requirement.evidence.map((evidence, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {evidence}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-3 w-3 mr-1" />
                            Review
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="h-3 w-3 mr-1" />
                            Evidence
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Compliance Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reports.map((report) => (
                  <div key={report.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <span className="font-semibold">{report.framework} {report.type}</span>
                          <Badge variant={getStatusColor(report.status)}>
                            {report.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <div>Created: {report.createdDate.toLocaleDateString()} by {report.createdBy}</div>
                          {report.submittedDate && (
                            <div>Submitted: {report.submittedDate.toLocaleDateString()}</div>
                          )}
                          {report.approvedDate && (
                            <div>Approved: {report.approvedDate.toLocaleDateString()}</div>
                          )}
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-sm">
                            <strong>Score:</strong> {report.score}%
                          </span>
                          <span className="text-sm">
                            <strong>Findings:</strong> {report.findings}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="h-3 w-3 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assessments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Assessment Schedule
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {frameworks.map((framework) => (
                  <div key={framework.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(framework.status)}
                      <div>
                        <div className="font-medium">{framework.name}</div>
                        <div className="text-sm text-muted-foreground">
                          Last: {framework.lastAssessment.toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        {framework.nextAssessment.toLocaleDateString()}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {Math.ceil((framework.nextAssessment.getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Schedule
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};