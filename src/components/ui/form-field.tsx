
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  description?: string;
  icon?: React.ReactNode;
}

export const FormField = React.forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, error, description, className, icon, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        <Label htmlFor={props.id || props.name}>
          {label}
        </Label>
        
        <div className="relative">
          {icon && (
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-muted-foreground">
              {icon}
            </div>
          )}
          
          <Input
            ref={ref}
            className={cn(
              icon && "pl-10",
              error && "border-destructive focus-visible:ring-destructive",
              className
            )}
            aria-invalid={!!error}
            aria-describedby={
              error
                ? `${props.id || props.name}-error`
                : description
                ? `${props.id || props.name}-description`
                : undefined
            }
            {...props}
          />
        </div>
        
        {error ? (
          <p
            id={`${props.id || props.name}-error`}
            className="text-sm font-medium text-destructive"
          >
            {error}
          </p>
        ) : description ? (
          <p
            id={`${props.id || props.name}-description`}
            className="text-sm text-muted-foreground"
          >
            {description}
          </p>
        ) : null}
      </div>
    );
  }
);

FormField.displayName = "FormField";
