"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

export const MOTION_DURATION = 0.22;
export const MOTION_EASE = [0.25, 0.1, 0.25, 1] as const;

export function useMotionEnabled() {
  return !useReducedMotion();
}

export function StaggerList({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const enabled = useMotionEnabled();
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="show"
      variants={{
        hidden: {},
        show: {
          transition: { staggerChildren: enabled ? 0.04 : 0 },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const enabled = useMotionEnabled();
  return (
    <motion.div
      className={className}
      variants={{
        hidden: enabled ? { opacity: 0, y: 8 } : { opacity: 1, y: 0 },
        show: {
          opacity: 1,
          y: 0,
          transition: { duration: MOTION_DURATION, ease: MOTION_EASE },
        },
      }}
    >
      {children}
    </motion.div>
  );
}
