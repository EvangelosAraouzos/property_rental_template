import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionProps {
  children: ReactNode;
  className?: string;
  containerClassName?: string;
  /** Override the rendered element (default: "section"). */
  as?: ElementType;
  /** Constrains container to a reading-friendly max-width (~768px). */
  narrow?: boolean;
}

export default function Section({
  children,
  className,
  containerClassName,
  as: Element = "section",
  narrow = false,
}: SectionProps) {
  return (
    <Element className={cn("py-16 md:py-24", className)}>
      <div
        className={cn(
          "mx-auto px-4 sm:px-6 lg:px-8",
          narrow ? "max-w-3xl" : "max-w-7xl",
          containerClassName
        )}
      >
        {children}
      </div>
    </Element>
  );
}
