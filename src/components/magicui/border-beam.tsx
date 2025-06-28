"use client";

import { cn } from "../../lib/utils";
import { motion, type MotionStyle, type Transition } from "motion/react";

interface BorderBeamProps {
  /**
   * The size of the border beam.
   */
  size?: number;
  /**
   * The duration of the border beam.
   */
  duration?: number;
  /**
   * The delay of the border beam.
   */
  delay?: number;
  /**
   * The color of the border beam from.
   */
  colorFrom?: string;
  /**
   * The color of the border beam to.
   */
  colorTo?: string;
  /**
   * The motion transition of the border beam.
   */
  transition?: Transition;
  /**
   * The class name of the border beam.
   */
  className?: string;
  /**
   * The style of the border beam.
   */
  style?: React.CSSProperties;
  /**
   * Whether to reverse the animation direction.
   */
  reverse?: boolean;
  /**
   * The initial offset position (0-100).
   */
  initialOffset?: number;
}

export const BorderBeam = ({
  className,
  size: _size = 50,
  delay = 0,
  duration = 6,
  colorFrom = "#ffaa40",
  colorTo = "#9c40ff",
  transition,
  style,
  reverse = false,
  initialOffset: _initialOffset = 0,
}: BorderBeamProps) => {
  return (
    <motion.div
      className={cn(
        "pointer-events-none absolute inset-0 rounded-[inherit]",
        className,
      )}
      style={{
        background: `linear-gradient(90deg, transparent, transparent, ${colorFrom}, ${colorTo}, transparent, transparent)`,
        backgroundSize: '300% 300%',
        mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
        WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
        WebkitMaskComposite: 'xor',
        maskComposite: 'exclude',
        padding: '2px',
        ...style,
      } as MotionStyle}
      animate={{
        backgroundPosition: reverse ? ['300% 0%', '-300% 0%'] : ['-300% 0%', '300% 0%'],
      }}
      transition={{
        repeat: Infinity,
        ease: "linear",
        duration,
        delay: -delay,
        ...transition,
      }}
    />
  );
};
