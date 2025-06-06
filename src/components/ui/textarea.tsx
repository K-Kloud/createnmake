
import * as React from "react"

import { cn } from "@/lib/utils"
import { sanitizeHtml } from "@/utils/security"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      // Sanitize textarea input to prevent XSS
      const sanitizedValue = sanitizeHtml(e.target.value);
      if (sanitizedValue !== e.target.value) {
        e.target.value = sanitizedValue;
      }
      props.onChange?.(e);
    };

    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
        onChange={handleChange}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
