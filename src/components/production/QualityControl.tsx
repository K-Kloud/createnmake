import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Star,
  Camera,
  FileText,
  TrendingUp,
  Award
} from 'lucide-react';

interface QualityCheckpoint {
  id: string;
  name: string;
  description: string;
  category: 'visual' | 'functional' | 'material' | 'dimensional' | 'finishing';
  required: boolean;
  status: 'pending' | 'passed' | 'failed' | 'attention_needed';
  score?: number; // 1-10
  notes?: string;
  images?: string[];
  inspector?: string;
  checkedAt?: string;
}

interface QualityControlProps {
  taskId: string;
  productType: string;
  qualityLevel: 'basic' | 'premium' | 'luxury';
  onQualityUpdate?: (score: number, status: string, notes: string) => void;
}

export const QualityControl: React.FC<QualityControlProps> = ({
  taskId,
  productType,
  qualityLevel,
  onQualityUpdate
}) => {
  const [checkpoints, setCheckpoints] = useState<QualityCheckpoint[]>([
    {
      id: 'visual-inspection',
      name: 'Visual Inspection',
      description: 'Overall appearance, color consistency, and visual defects',
      category: 'visual',
      required: true,
      status: 'pending'
    },
    {
      id: 'material-quality',
      name: 'Material Quality',
      description: 'Fabric quality, texture, and material consistency',
      category: 'material',
      required: true,
      status: 'pending'
    },
    {
      id: 'construction',
      name: 'Construction Quality',
      description: 'Seam strength, stitching quality, and structural integrity',
      category: 'functional',
      required: true,
      status: 'pending'
    },
    {
      id: 'dimensions',
      name: 'Dimensional Accuracy',
      description: 'Size measurements and fit specifications',
      category: 'dimensional',
      required: qualityLevel !== 'basic',
      status: 'pending'
    },
    {
      id: 'finishing',
      name: 'Finishing Details',
      description: 'Edge finishing, button placement, and final touches',
      category: 'finishing',
      required: qualityLevel === 'luxury',
      status: 'pending'
    }
  ]);

  const [overallNotes, setOverallNotes] = useState('');
  const [inspector, setInspector] = useState('');

  const updateCheckpoint = (checkpointId: string, updates: Partial<QualityCheckpoint>) => {
    setCheckpoints(prev => prev.map(checkpoint => 
      checkpoint.id === checkpointId 
        ? { ...checkpoint, ...updates, checkedAt: new Date().toISOString(), inspector }
        : checkpoint
    ));
  };

  const calculateOverallScore = () => {
    const completedCheckpoints = checkpoints.filter(c => c.score !== undefined);
    if (completedCheckpoints.length === 0) return 0;
    
    const totalScore = completedCheckpoints.reduce((sum, c) => sum + (c.score || 0), 0);
    return Math.round((totalScore / completedCheckpoints.length) * 10) / 10;
  };

  const getCompletionPercentage = () => {
    const requiredCheckpoints = checkpoints.filter(c => c.required);
    const completedRequired = requiredCheckpoints.filter(c => c.status !== 'pending');
    return Math.round((completedRequired.length / requiredCheckpoints.length) * 100);
  };

  const getOverallStatus = (): 'pending' | 'passed' | 'failed' | 'attention_needed' => {
    const requiredCheckpoints = checkpoints.filter(c => c.required);
    const failedRequired = requiredCheckpoints.filter(c => c.status === 'failed');
    const attentionNeeded = requiredCheckpoints.filter(c => c.status === 'attention_needed');
    
    if (failedRequired.length > 0) return 'failed';
    if (attentionNeeded.length > 0) return 'attention_needed';
    if (requiredCheckpoints.every(c => c.status === 'passed')) return 'passed';
    return 'pending';
  };

  const handleSubmitQuality = () => {
    const overallScore = calculateOverallScore();
    const status = getOverallStatus();
    
    onQualityUpdate?.(overallScore, status, overallNotes);
  };

  const getStatusIcon = (status: QualityCheckpoint['status']) => {
    switch (status) {
      case 'passed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'attention_needed': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default: return <div className="h-4 w-4 rounded-full border-2 border-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: QualityCheckpoint['status']) => {
    switch (status) {
      case 'passed': return <Badge className="bg-green-500">Passed</Badge>;
      case 'failed': return <Badge variant="destructive">Failed</Badge>;
      case 'attention_needed': return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Attention Needed</Badge>;
      default: return <Badge variant="outline">Pending</Badge>;
    }
  };

  const getCategoryIcon = (category: QualityCheckpoint['category']) => {
    switch (category) {
      case 'visual': return <Camera className="h-4 w-4" />;
      case 'functional': return <Shield className="h-4 w-4" />;
      case 'material': return <FileText className="h-4 w-4" />;
      case 'dimensional': return <TrendingUp className="h-4 w-4" />;
      case 'finishing': return <Award className="h-4 w-4" />;
      default: return <Shield className="h-4 w-4" />;
    }
  };

  const overallScore = calculateOverallScore();
  const completionPercentage = getCompletionPercentage();
  const overallStatus = getOverallStatus();

  return (
    <div className="space-y-6">
      {/* Quality Control Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Quality Control - {productType}
            </CardTitle>
            <Badge variant="outline" className="text-sm">
              {qualityLevel} Level
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {overallScore > 0 ? overallScore : '--'}
              </div>
              <div className="text-sm text-muted-foreground">Overall Score</div>
              <div className="flex justify-center mt-1">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star 
                    key={i} 
                    className={`h-4 w-4 ${
                      i < Math.round(overallScore / 2) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                    }`} 
                  />
                ))}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{completionPercentage}%</div>
              <div className="text-sm text-muted-foreground">Completion</div>
              <Progress value={completionPercentage} className="mt-2" />
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {getStatusBadge(overallStatus)}
              </div>
              <div className="text-sm text-muted-foreground mt-2">Status</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Inspector Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Inspector Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="inspector">Inspector Name</Label>
              <Input
                id="inspector"
                value={inspector}
                onChange={(e) => setInspector(e.target.value)}
                placeholder="Enter inspector name"
              />
            </div>
            <div>
              <Label htmlFor="task-id">Task ID</Label>
              <Input
                id="task-id"
                value={taskId}
                disabled
                className="bg-muted"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quality Checkpoints */}
      <Card>
        <CardHeader>
          <CardTitle>Quality Checkpoints</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {checkpoints.map((checkpoint, index) => (
              <div key={checkpoint.id}>
                <div className="flex items-start gap-4">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    {getCategoryIcon(checkpoint.category)}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{checkpoint.name}</h4>
                        {checkpoint.required && (
                          <Badge variant="outline">Required</Badge>
                        )}
                        {getStatusIcon(checkpoint.status)}
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {checkpoint.description}
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Score Input */}
                        <div>
                          <Label className="text-xs">Score (1-10)</Label>
                          <Input
                            type="number"
                            min="1"
                            max="10"
                            value={checkpoint.score || ''}
                            onChange={(e) => updateCheckpoint(checkpoint.id, {
                              score: e.target.value ? Number(e.target.value) : undefined
                            })}
                            className="mt-1"
                          />
                        </div>
                        
                        {/* Status Selection */}
                        <div>
                          <Label className="text-xs">Status</Label>
                          <div className="flex gap-1 mt-1">
                            <Button
                              size="sm"
                              variant={checkpoint.status === 'passed' ? 'default' : 'outline'}
                              onClick={() => updateCheckpoint(checkpoint.id, { status: 'passed' })}
                              className="flex-1"
                            >
                              <CheckCircle className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant={checkpoint.status === 'attention_needed' ? 'default' : 'outline'}
                              onClick={() => updateCheckpoint(checkpoint.id, { status: 'attention_needed' })}
                              className="flex-1"
                            >
                              <AlertTriangle className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant={checkpoint.status === 'failed' ? 'destructive' : 'outline'}
                              onClick={() => updateCheckpoint(checkpoint.id, { status: 'failed' })}
                              className="flex-1"
                            >
                              <XCircle className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        
                        {/* Current Status */}
                        <div>
                          <Label className="text-xs">Current Status</Label>
                          <div className="mt-1">
                            {getStatusBadge(checkpoint.status)}
                          </div>
                        </div>
                      </div>
                      
                      {/* Notes */}
                      <div className="mt-3">
                        <Label className="text-xs">Notes</Label>
                        <Textarea
                          value={checkpoint.notes || ''}
                          onChange={(e) => updateCheckpoint(checkpoint.id, { notes: e.target.value })}
                          placeholder="Add inspection notes..."
                          rows={2}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                {index < checkpoints.length - 1 && <Separator className="mt-6" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Overall Assessment */}
      <Card>
        <CardHeader>
          <CardTitle>Overall Assessment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="overall-notes">Overall Quality Notes</Label>
            <Textarea
              id="overall-notes"
              value={overallNotes}
              onChange={(e) => setOverallNotes(e.target.value)}
              placeholder="Provide overall assessment and recommendations..."
              rows={4}
            />
          </div>

          <div className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              {checkpoints.filter(c => c.status !== 'pending').length} of {checkpoints.length} checkpoints completed
            </div>
            
            <Button 
              onClick={handleSubmitQuality}
              disabled={completionPercentage < 100 || !inspector.trim()}
              size="lg"
            >
              <Shield className="mr-2 h-4 w-4" />
              Submit Quality Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};