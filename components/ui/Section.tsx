"use client";
import { cn } from "../../lib/utils";
import { motion, useAnimation } from "framer-motion";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";

interface SectionProps {
  sectionId?: string;
  className?: string;
  children: React.ReactNode;
  threshold?: number;
  delay?: number;
  initialY?: number;
}
export default function Section({
  sectionId,
  children,
  className,
  threshold = 0.2,
  delay = 0.2,
  initialY = 50,
}: SectionProps) {
  const controls = useAnimation();
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold,
  });

  useEffect(() => {
    if (inView) {
      controls.start({ y: 0, opacity: 1 });
    } else {
      controls.start({ y: initialY, opacity: 0 });
    }
  }, [controls, inView, initialY]);

  return (
    <motion.section
      ref={ref}
      initial={{ y: initialY, opacity: 0 }}
      animate={controls}
      transition={{
        ease: "easeOut",
        delay,
        // duration: 0.5,
        ...(typeof window !== "undefined" && window.innerWidth < 768
          ? { duration: 0.3 }
          : { duration: 0.5 }),
      }}
      id={sectionId}
      className={cn(
        "w-full",
        "px-4 sm:px-6 md:px-8",
        "py-12 sm:py-16 md:py-20 Desktop:py-24 ",
        className,
      )}
    >
      {children}
    </motion.section>
  );
}
