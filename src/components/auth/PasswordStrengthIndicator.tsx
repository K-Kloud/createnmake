
import { getPasswordValidation, PasswordValidationResult } from "@/utils/passwordValidation";

interface PasswordStrengthIndicatorProps {
  password: string;
  errors?: string[];
}

export const PasswordStrengthIndicator = ({ password }: PasswordStrengthIndicatorProps) => {
  const validation: PasswordValidationResult = getPasswordValidation(password);
  
  if (!password) return null;

  const getStrengthColor = () => {
    switch (validation.strength) {
      case 'strong': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      default: return 'text-red-600';
    }
  };

  const getProgressValue = () => {
    switch (validation.strength) {
      case 'strong': return 100;
      case 'medium': return 66;
      default: return 33;
    }
  };

  return (
    <div className="mt-2 space-y-2">
      <div className="flex items-center gap-2">
        <div className="flex-1 bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all ${
              validation.strength === 'strong' ? 'bg-green-500' :
              validation.strength === 'medium' ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${getProgressValue()}%` }}
          />
        </div>
        <span className={`text-sm font-medium ${getStrengthColor()}`}>
          {validation.strength}
        </span>
      </div>
      
      {validation.errors.length > 0 && (
        <ul className="text-xs text-red-600 space-y-1">
          {validation.errors.map((error, index) => (
            <li key={index}>• {error}</li>
          ))}
        </ul>
      )}
    </div>
  );
};
