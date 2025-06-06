
import * as React from "react"

import { cn } from "@/lib/utils"
import { sanitizeHtml } from "@/utils/security"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      // Only sanitize text inputs, not passwords or other sensitive fields
      if (type === 'text' || type === 'email' || type === 'search' || !type) {
        const sanitizedValue = sanitizeHtml(e.target.value);
        if (sanitizedValue !== e.target.value) {
          e.target.value = sanitizedValue;
        }
      }
      props.onChange?.(e);
    };

    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
        onChange={handleChange}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
