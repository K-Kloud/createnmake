
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl font-rajdhani font-semibold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 active:scale-95 touch-manipulation",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary-hover hover:shadow-neon-green border border-primary/30 hover:border-primary",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:shadow-[0_0_20px_rgba(255,92,92,0.5)]",
        outline: "border border-white/20 bg-card/50 backdrop-blur-glass hover:bg-card hover:text-accent hover:border-accent hover:shadow-neon",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 backdrop-blur-glass border border-white/10",
        ghost: "hover:bg-card hover:text-accent transition-colors duration-300",
        link: "text-accent underline-offset-4 hover:underline font-medium",
        glass: "bg-glass backdrop-blur-glass border border-white/10 text-foreground hover:border-accent hover:shadow-neon",
        neon: "bg-gradient-to-r from-neon-cyan to-neon-purple text-background font-bold hover:from-neon-purple hover:to-neon-cyan hover:shadow-neon",
      },
      size: {
        default: "h-11 px-4 py-2 text-sm sm:h-12 sm:px-6 sm:py-3 sm:text-base [&_svg]:size-4 sm:[&_svg]:size-5",
        sm: "h-9 px-3 py-1 text-xs sm:h-10 sm:px-4 sm:text-sm rounded-xl [&_svg]:size-3 sm:[&_svg]:size-4",
        lg: "h-12 px-6 py-3 text-base sm:h-14 sm:px-8 sm:py-4 sm:text-lg rounded-2xl [&_svg]:size-5 sm:[&_svg]:size-6",
        icon: "h-11 w-11 sm:h-12 sm:w-12 [&_svg]:size-4 sm:[&_svg]:size-5",
        "icon-sm": "h-9 w-9 sm:h-10 sm:w-10 rounded-xl [&_svg]:size-3 sm:[&_svg]:size-4",
        "icon-lg": "h-12 w-12 sm:h-14 sm:w-14 rounded-2xl [&_svg]:size-5 sm:[&_svg]:size-6",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
