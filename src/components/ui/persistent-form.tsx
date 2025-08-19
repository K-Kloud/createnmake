import React, { useCallback, useRef } from 'react';
import { useFormPersistence } from '@/hooks/useFormPersistence';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Save, Trash2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FormField {
  name: string;
  type: 'text' | 'email' | 'tel' | 'textarea' | 'number';
  label: string;
  placeholder?: string;
  required?: boolean;
  validation?: (value: string) => string | null;
}

interface PersistentFormProps {
  formId: string;
  fields: FormField[];
  onSubmit: (data: Record<string, string>) => void | Promise<void>;
  className?: string;
  autoSave?: boolean;
  storage?: 'localStorage' | 'sessionStorage';
}

export const PersistentForm: React.FC<PersistentFormProps> = ({
  formId,
  fields,
  onSubmit,
  className,
  autoSave = true,
  storage = 'localStorage',
}) => {
  const formRef = useRef<HTMLFormElement>(null);
  const [formData, setFormData] = React.useState<Record<string, string>>({});
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const {
    data: persistedData,
    saveData,
    clearData,
    hasPersistedData,
  } = useFormPersistence<Record<string, string>>({
    key: `form-${formId}`,
    storage,
  });

  // Initialize form data from persisted data
  React.useEffect(() => {
    if (persistedData) {
      setFormData(persistedData);
    }
  }, [persistedData]);

  const validateField = useCallback((field: FormField, value: string): string | null => {
    if (field.required && !value.trim()) {
      return `${field.label} is required`;
    }

    if (field.type === 'email' && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return 'Please enter a valid email address';
      }
    }

    if (field.type === 'tel' && value) {
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      if (!phoneRegex.test(value.replace(/\s/g, ''))) {
        return 'Please enter a valid phone number';
      }
    }

    if (field.validation) {
      return field.validation(value);
    }

    return null;
  }, []);

  const handleFieldChange = useCallback((fieldName: string, value: string) => {
    const newFormData = { ...formData, [fieldName]: value };
    setFormData(newFormData);

    // Clear field error when user starts typing
    if (errors[fieldName]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }

    // Auto-save if enabled
    if (autoSave) {
      saveData(newFormData);
    }
  }, [formData, errors, autoSave, saveData]);

  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    fields.forEach(field => {
      const value = formData[field.name] || '';
      const error = validateField(field, value);
      if (error) {
        newErrors[field.name] = error;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [fields, formData, validateField]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      clearData(); // Clear persisted data after successful submission
      setFormData({});
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [validateForm, onSubmit, formData, clearData]);

  const handleManualSave = useCallback(() => {
    saveData(formData);
  }, [saveData, formData]);

  const handleClearData = useCallback(() => {
    clearData();
    setFormData({});
    setErrors({});
  }, [clearData]);

  const renderField = (field: FormField) => {
    const value = formData[field.name] || '';
    const error = errors[field.name];
    const fieldId = `${formId}-${field.name}`;

    return (
      <div key={field.name} className="space-y-2">
        <Label htmlFor={fieldId} className="flex items-center gap-2">
          {field.label}
          {field.required && <span className="text-destructive">*</span>}
        </Label>
        
        {field.type === 'textarea' ? (
          <Textarea
            id={fieldId}
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            className={cn(error && 'border-destructive focus-visible:ring-destructive')}
            rows={4}
          />
        ) : (
          <Input
            id={fieldId}
            type={field.type}
            value={value}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            className={cn(error && 'border-destructive focus-visible:ring-destructive')}
          />
        )}
        
        {error && (
          <p className="text-sm text-destructive flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {error}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Persistence Status */}
      {hasPersistedData && (
        <Alert>
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>Form data has been restored from a previous session.</span>
            <Badge variant="secondary">Auto-saved</Badge>
          </AlertDescription>
        </Alert>
      )}

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
        {fields.map(renderField)}

        <div className="flex justify-between items-center pt-4 border-t">
          <div className="flex gap-2">
            {!autoSave && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleManualSave}
              >
                <Save className="w-4 h-4 mr-1" />
                Save Draft
              </Button>
            )}
            
            {hasPersistedData && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleClearData}
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Clear Saved Data
              </Button>
            )}
          </div>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                Submitting...
              </>
            ) : (
              'Submit'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};