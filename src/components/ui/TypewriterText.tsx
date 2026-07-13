"use client";

import { useMemo } from "react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

/**
 * TypewriterText — reveals text character-by-character when it scrolls into view.
 * Drop-in replacement for static heading text. Wraps in a <span> so it can live
 * inside any h1/h2/p without breaking semantics.
 */
export default function TypewriterText({
  text,
  delay = 0,
  charDelay = 0.04,
  className,
}: {
  text: string;
  delay?: number;
  charDelay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const chars = useMemo(() => text.split(""), [text]);

  return (
    <span ref={ref} className={`inline-flex flex-wrap ${className || ""}`}>
      {chars.map((ch, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.03, delay: delay + i * charDelay }}
        >
          {ch === " " ? "\u00A0" : ch}
        </motion.span>
      ))}
    </span>
  );
}
