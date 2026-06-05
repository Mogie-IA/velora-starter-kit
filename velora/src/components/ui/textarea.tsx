import * as React from "react";
import { cn } from "@/lib/utils";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "w-full min-h-[88px] rounded-[14px] bg-white border border-[#c9c4d9] px-4 py-3 text-body-md text-[#1a1b21] placeholder:text-[#797588] outline-none transition-[border-color,box-shadow] duration-150 resize-none focus:border-[#5427e6] focus:shadow-[0_0_0_4px_rgba(84,39,230,0.12)]",
        className
      )}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";

export { Textarea };
