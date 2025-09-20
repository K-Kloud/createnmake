import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Lightbulb,
  DollarSign,
  Wrench,
  Clock,
  TrendingUp
} from 'lucide-react';
import { DesignValidationResult, DesignQualityMetrics } from '@/services/designIntelligence';

interface DesignValidatorProps {
  validationResult?: DesignValidationResult | null;
  qualityMetrics?: DesignQualityMetrics | null;
  isValidating?: boolean;
  isAnalyzing?: boolean;
  onValidate?: () => void;
  onAnalyze?: () => void;
  onOptimize?: () => void;
}

const getIssueIcon = (type: string) => {
  switch (type) {
    case 'error':
      return <XCircle className="h-4 w-4 text-destructive" />;
    case 'warning':
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    case 'suggestion':
      return <Lightbulb className="h-4 w-4 text-blue-500" />;
    default:
      return <CheckCircle className="h-4 w-4 text-green-500" />;
  }
};

const getSeverityBadge = (severity: string) => {
  const variants = {
    high: 'destructive',
    medium: 'default',
    low: 'secondary'
  };
  
  return (
    <Badge variant={variants[severity as keyof typeof variants] as any} className="text-xs">
      {severity}
    </Badge>
  );
};

const getDifficultyColor = (difficulty: string) => {
  const colors = {
    easy: 'text-green-600',
    medium: 'text-yellow-600',
    hard: 'text-orange-600',
    expert: 'text-red-600'
  };
  
  return colors[difficulty as keyof typeof colors] || 'text-gray-600';
};

export const DesignValidator: React.FC<DesignValidatorProps> = ({
  validationResult,
  qualityMetrics,
  isValidating = false,
  isAnalyzing = false,
  onValidate,
  onAnalyze,
  onOptimize
}) => {
  return (
    <div className="space-y-6">
      {/* Action Buttons */}
      <div className="flex gap-2 flex-wrap">
        <Button
          onClick={onValidate}
          disabled={isValidating}
          variant="outline"
          size="sm"
        >
          {isValidating ? 'Validating...' : 'Validate Design'}
        </Button>
        
        <Button
          onClick={onAnalyze}
          disabled={isAnalyzing}
          variant="outline"
          size="sm"
        >
          {isAnalyzing ? 'Analyzing...' : 'Analyze Quality'}
        </Button>
        
        {validationResult && (
          <Button
            onClick={onOptimize}
            variant="outline"
            size="sm"
          >
            Optimize Design
          </Button>
        )}
      </div>

      {/* Quality Metrics */}
      {qualityMetrics && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Quality Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <div className="text-sm font-medium">Feasibility</div>
                <div className="flex items-center gap-2">
                  <Progress value={qualityMetrics.feasibilityScore * 10} className="flex-1" />
                  <span className="text-sm font-mono">{qualityMetrics.feasibilityScore.toFixed(1)}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm font-medium">Complexity</div>
                <div className="flex items-center gap-2">
                  <Progress value={qualityMetrics.complexityScore * 10} className="flex-1" />
                  <span className="text-sm font-mono">{qualityMetrics.complexityScore.toFixed(1)}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm font-medium">Manufacturability</div>
                <div className="flex items-center gap-2">
                  <Progress value={qualityMetrics.manufacturabilityScore * 10} className="flex-1" />
                  <span className="text-sm font-mono">{qualityMetrics.manufacturabilityScore.toFixed(1)}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="text-sm font-medium">Cost Efficiency</div>
                <div className="flex items-center gap-2">
                  <Progress value={qualityMetrics.costEfficiencyScore * 10} className="flex-1" />
                  <span className="text-sm font-mono">{qualityMetrics.costEfficiencyScore.toFixed(1)}</span>
                </div>
              </div>
            </div>

            <Separator />

            <div className="flex items-center gap-4">
              <div className="text-2xl font-bold">
                Overall Score: {qualityMetrics.overallScore.toFixed(1)}/10
              </div>
              <Badge 
                variant={qualityMetrics.overallScore >= 8 ? 'default' : qualityMetrics.overallScore >= 6 ? 'secondary' : 'destructive'}
              >
                {qualityMetrics.overallScore >= 8 ? 'Excellent' : qualityMetrics.overallScore >= 6 ? 'Good' : 'Needs Improvement'}
              </Badge>
            </div>

            {qualityMetrics.recommendations.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm font-medium">Recommendations:</div>
                <ul className="space-y-1">
                  {qualityMetrics.recommendations.map((rec, index) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                      <Lightbulb className="h-3 w-3 mt-0.5 text-blue-500" />
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Validation Results */}
      {validationResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Design Validation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Overall Status */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                {validationResult.isValid ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-destructive" />
                )}
                <span className="font-medium">
                  {validationResult.isValid ? 'Valid Design' : 'Issues Found'}
                </span>
              </div>
              <Badge variant={validationResult.isValid ? 'default' : 'destructive'}>
                Score: {validationResult.score.toFixed(1)}/10
              </Badge>
            </div>

            {/* Issues */}
            {validationResult.issues.length > 0 && (
              <div className="space-y-3">
                <div className="text-sm font-medium">Issues & Suggestions:</div>
                <div className="space-y-2">
                  {validationResult.issues.map((issue, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                      {getIssueIcon(issue.type)}
                      <div className="flex-1 space-y-1">
                        <div className="text-sm">{issue.message}</div>
                        <div className="flex gap-2">
                          <Badge variant="outline" className="text-xs capitalize">
                            {issue.type}
                          </Badge>
                          {getSeverityBadge(issue.severity)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            {/* Technical Feasibility */}
            <div className="space-y-3">
              <div className="text-sm font-medium flex items-center gap-2">
                <Wrench className="h-4 w-4" />
                Technical Feasibility
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Can Manufacture</span>
                    <Badge variant={validationResult.technicalFeasibility.canManufacture ? 'default' : 'destructive'}>
                      {validationResult.technicalFeasibility.canManufacture ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Difficulty</span>
                    <span className={`text-sm font-medium ${getDifficultyColor(validationResult.technicalFeasibility.estimatedDifficulty)}`}>
                      {validationResult.technicalFeasibility.estimatedDifficulty}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div>
                    <div className="text-sm font-medium mb-1">Required Tools:</div>
                    <div className="flex flex-wrap gap-1">
                      {validationResult.technicalFeasibility.requiredTools.map((tool, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tool}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium mb-1">Required Skills:</div>
                    <div className="flex flex-wrap gap-1">
                      {validationResult.technicalFeasibility.requiredSkills.map((skill, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Material Compatibility */}
            <div className="space-y-3">
              <div className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Material & Cost Analysis
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div>
                    <div className="text-sm font-medium mb-1">Recommended Materials:</div>
                    <div className="flex flex-wrap gap-1">
                      {validationResult.materialCompatibility.recommendedMaterials.map((material, index) => (
                        <Badge key={index} variant="default" className="text-xs">
                          {material}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  {validationResult.materialCompatibility.incompatibleMaterials.length > 0 && (
                    <div>
                      <div className="text-sm font-medium mb-1">Incompatible Materials:</div>
                      <div className="flex flex-wrap gap-1">
                        {validationResult.materialCompatibility.incompatibleMaterials.map((material, index) => (
                          <Badge key={index} variant="destructive" className="text-xs">
                            {material}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <div className="text-sm font-medium">Estimated Cost Range:</div>
                  <div className="text-lg font-bold">
                    ${validationResult.materialCompatibility.estimatedCost.min} - ${validationResult.materialCompatibility.estimatedCost.max} {validationResult.materialCompatibility.estimatedCost.currency}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};