import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "chip",
  {
    variants: {
      variant: {
        default: "chip-primary",
        secondary: "chip-neutral",
        success: "chip-success",
        warning: "chip-warning",
        error: "chip-error",
        destructive: "chip-error",
        outline:
          "bg-transparent border border-[#c9c4d9] text-[#484556]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
