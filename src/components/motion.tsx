"use client";

import Lenis from "lenis";
import { motion, useScroll, useSpring, useTransform, type MotionValue, type Variants } from "framer-motion";
import { useEffect, useRef } from "react";

/* ───────── Smooth inertial scrolling (Lenis) ───────── */
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({ duration: 1.15, smoothWheel: true, anchors: { offset: -70 } });
    let raf = 0;
    const loop = (t: number) => {
      lenis.raf(t);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
    };
  }, []);
  return null;
}

/* ───────── Red scroll-progress bar ───────── */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const x = useSpring(scrollYProgress, { stiffness: 120, damping: 25 });
  return <motion.div style={{ scaleX: x }} className="fixed inset-x-0 top-0 z-[60] h-[3px] origin-left bg-orange shadow-[0_0_12px_#e3122b]" />;
}

/* ───────── Reveal on enter (replays when scrolled back) ───────── */
type Dir = "up" | "left" | "right" | "scale" | "clip" | "flip";
const variants: Record<Dir, Variants> = {
  up: { hidden: { opacity: 0, y: 60, filter: "blur(8px)" }, show: { opacity: 1, y: 0, filter: "blur(0px)" } },
  left: { hidden: { opacity: 0, x: -80, filter: "blur(6px)" }, show: { opacity: 1, x: 0, filter: "blur(0px)" } },
  right: { hidden: { opacity: 0, x: 80, filter: "blur(6px)" }, show: { opacity: 1, x: 0, filter: "blur(0px)" } },
  scale: { hidden: { opacity: 0, scale: 0.8 }, show: { opacity: 1, scale: 1 } },
  clip: { hidden: { clipPath: "inset(100% 0% 0% 0%)", y: 40 }, show: { clipPath: "inset(0% 0% 0% 0%)", y: 0 } },
  flip: { hidden: { opacity: 0, rotateX: -70, y: 50 }, show: { opacity: 1, rotateX: 0, y: 0 } },
};

export function Reveal({
  children,
  dir = "up",
  delay = 0,
  duration = 0.8,
  className,
  once = false,
}: {
  children: React.ReactNode;
  dir?: Dir;
  delay?: number;
  duration?: number;
  className?: string;
  once?: boolean;
}) {
  // The outer wrapper is what the IntersectionObserver watches (it is never
  // clipped or transformed); the inner one carries the visual animation.
  return (
    <motion.div initial="hidden" whileInView="show" viewport={{ once, amount: 0.15 }} className={className}>
      <motion.div
        variants={variants[dir]}
        transition={{ duration, delay, ease: [0.16, 1, 0.3, 1] }}
        style={dir === "flip" ? { transformPerspective: 900 } : undefined}
        className="h-full"
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

/* Container + item for staggered children */
export const stagger = (gap = 0.08): Variants => ({ hidden: {}, show: { transition: { staggerChildren: gap } } });
export const item: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.9 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

/* ───────── Headline: words rise out of a mask ───────── */
export function SplitText({ text, className, delay = 0 }: { text: string; className?: string; delay?: number }) {
  const words = text.split(" ");
  return (
    <motion.span
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: false, amount: 0.6 }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07, delayChildren: delay } } }}
      aria-label={text}
    >
      {words.map((w, i) => (
        <span key={i} className="inline-block overflow-hidden pb-[0.08em] align-bottom" aria-hidden>
          <motion.span
            className="inline-block"
            variants={{
              hidden: { y: "110%", rotate: 6 },
              show: { y: "0%", rotate: 0, transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] } },
            }}
          >
            {w}
            {i < words.length - 1 ? " " : ""}
          </motion.span>
        </span>
      ))}
    </motion.span>
  );
}

/* ───────── Paragraph that "lights up" word-by-word as you scroll ───────── */
function ScrubWord({ children, progress, range }: { children: string; progress: MotionValue<number>; range: [number, number] }) {
  const opacity = useTransform(progress, range, [0.15, 1]);
  const color = useTransform(progress, [range[0], range[1]], ["#a39894", "#f4ede9"]);
  return (
    <motion.span style={{ opacity, color }} className="inline-block">
      {children}&nbsp;
    </motion.span>
  );
}

export function ScrubText({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 85%", "end 45%"] });
  const words = text.split(" ");
  return (
    <p ref={ref} className={className}>
      {words.map((w, i) => (
        <ScrubWord key={i} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]}>
          {w}
        </ScrubWord>
      ))}
    </p>
  );
}

/* ───────── Parallax: element drifts relative to scroll ───────── */
export function Parallax({
  children,
  speed = 80,
  rotate = 0,
  className,
}: {
  children: React.ReactNode;
  speed?: number;
  rotate?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [speed, -speed]);
  const r = useTransform(scrollYProgress, [0, 1], [-rotate, rotate]);
  return (
    <motion.div ref={ref} style={{ y, rotate: r }} className={className}>
      {children}
    </motion.div>
  );
}

/* ───────── Giant outline text band that slides with scroll ───────── */
export function ScrollBand({ words, reverse = false }: { words: string[]; reverse?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const x = useTransform(scrollYProgress, [0, 1], reverse ? ["-30%", "0%"] : ["0%", "-30%"]);
  const row = [...words, ...words, ...words];
  return (
    <div ref={ref} className="relative overflow-hidden border-y border-line py-6">
      <motion.div style={{ x }} className="flex w-max gap-10 whitespace-nowrap font-display text-[13vw] uppercase leading-none md:text-[8vw]">
        {row.map((w, i) => (
          <span key={i} className="flex items-center gap-10">
            <span className={i % 2 ? "text-orange" : "outline-text"}>{w}</span>
            <span className="text-[0.4em] text-orange">✦</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}

/* ───────── Vertical line that fills as the target scrolls through ───────── */
export function ScrollLine({ target, className }: { target: React.RefObject<HTMLElement | null>; className?: string }) {
  const { scrollYProgress } = useScroll({ target, offset: ["start 70%", "end 60%"] });
  const scaleY = useSpring(scrollYProgress, { stiffness: 100, damping: 25 });
  return (
    <div className={`absolute w-px bg-line-strong ${className ?? ""}`}>
      <motion.div style={{ scaleY }} className="absolute inset-0 origin-top bg-orange shadow-[0_0_10px_#e3122b]" />
    </div>
  );
}
