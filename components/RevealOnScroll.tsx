"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

interface RevealOnScrollProps {
  children: React.ReactNode;
  className?: string;
  /** Stagger delay in seconds. */
  delay?: number;
  direction?: "up" | "down" | "left" | "right";
  /** Animate only once (default true). */
  once?: boolean;
}

const offsets: Record<string, { x: number; y: number }> = {
  up:    { x: 0,   y: 28 },
  down:  { x: 0,   y: -28 },
  left:  { x: 28,  y: 0 },
  right: { x: -28, y: 0 },
};

export default function RevealOnScroll({
  children,
  className,
  delay = 0,
  direction = "up",
  once = true,
}: RevealOnScrollProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref, { once, margin: "-8% 0px" });
  const reduced = useReducedMotion();

  const { x, y } = offsets[direction];

  return (
    <motion.div
      ref={ref}
      initial={reduced ? { opacity: 1 } : { opacity: 0, x, y }}
      animate={
        inView
          ? { opacity: 1, x: 0, y: 0 }
          : reduced
          ? { opacity: 1 }
          : { opacity: 0, x, y }
      }
      transition={
        reduced
          ? { duration: 0 }
          : { duration: 0.55, delay, ease: [0.25, 0.1, 0.25, 1] }
      }
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}
