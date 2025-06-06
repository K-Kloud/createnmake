
import { Progress } from "@/components/ui/progress";
import { getPasswordStrengthScore, getPasswordStrengthLabel, getPasswordStrengthColor } from "@/utils/passwordValidation";

interface PasswordStrengthIndicatorProps {
  password: string;
  errors: string[];
}

export const PasswordStrengthIndicator = ({ password, errors }: PasswordStrengthIndicatorProps) => {
  const score = getPasswordStrengthScore(password);
  const label = getPasswordStrengthLabel(score);
  const colorClass = getPasswordStrengthColor(score);

  if (!password) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Password strength:</span>
        <span className={`font-medium ${score < 40 ? 'text-red-500' : score < 70 ? 'text-yellow-500' : score < 90 ? 'text-blue-500' : 'text-green-500'}`}>
          {label}
        </span>
      </div>
      <div className="relative">
        <Progress value={score} className="h-2" />
        <div 
          className={`absolute top-0 left-0 h-2 rounded-full transition-all duration-300 ${colorClass}`}
          style={{ width: `${score}%` }}
        />
      </div>
      {errors.length > 0 && (
        <ul className="text-xs text-red-500 space-y-1">
          {errors.map((error, index) => (
            <li key={index}>• {error}</li>
          ))}
        </ul>
      )}
    </div>
  );
};
