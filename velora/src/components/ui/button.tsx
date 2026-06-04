"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5427e6] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-45",
  {
    variants: {
      variant: {
        primary: "btn-primary",
        secondary: "btn-secondary",
        ghost: "btn-ghost",
        destructive:
          "h-12 px-6 rounded-[16px] bg-[#ffdad6] text-[#ba1a1a] border border-[#ffdad6] hover:bg-[#ba1a1a]/10 hover:border-[#ba1a1a]/30",
        link: "text-[#5427e6] underline-offset-4 hover:underline h-auto p-0 font-medium text-label-md",
      },
      size: {
        default: "h-12 px-6 text-body-md rounded-[16px]",
        sm: "h-9 px-4 text-label-md rounded-[12px]",
        lg: "btn-primary-lg rounded-[16px]",
        icon: "h-10 w-10 rounded-[12px] p-0",
        "icon-sm": "h-8 w-8 rounded-[10px] p-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
