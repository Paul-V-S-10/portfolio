"use client";

import dynamic from "next/dynamic";
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { profile } from "@/data/portfolio";

const HeroScene = dynamic(() => import("./three/HeroScene"), { ssr: false });

const links = [
  ["01", "About", "#about"],
  ["02", "Experience", "#experience"],
  ["03", "Projects", "#projects"],
  ["04", "Achievements", "#achievements"],
  ["05", "Leadership", "#leadership"],
  ["06", "Contact", "#contact"],
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const f = () => setScrolled(window.scrollY > 40);
    f();
    window.addEventListener("scroll", f, { passive: true });
    return () => window.removeEventListener("scroll", f);
  }, []);
  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all ${scrolled || open ? "border-b border-line bg-bg/85 backdrop-blur-md" : ""}`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4">
        <a href="#top" className="shrink-0 whitespace-nowrap leading-tight">
          <div className="font-mono text-[0.625rem] uppercase tracking-[0.2em] text-orange sm:text-[0.6875rem]">Mechanical Engineer</div>
          <div className="font-mono text-[0.625rem] uppercase tracking-[0.2em] text-muted sm:text-[0.6875rem]">Propulsion · Automation</div>
        </a>
        {/* Full link pill only where it fits (≥1024px); tablets and phones get the menu. */}
        <ul className="hidden items-center gap-1 rounded-full border border-line bg-bg-2/70 px-2 py-1.5 backdrop-blur lg:flex">
          {links.map(([, l, h]) => (
            <li key={h}>
              <a
                href={h}
                className="whitespace-nowrap rounded-full px-3 py-1.5 text-[0.8125rem] text-muted transition-colors hover:bg-line hover:text-ink xl:px-3.5"
              >
                {l}
              </a>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-4">
          <a
            href={profile.resume}
            target="_blank"
            className="hidden whitespace-nowrap rounded-full bg-orange px-5 py-2 text-[0.8125rem] font-semibold text-white shadow-[0_0_24px_rgba(227,18,43,0.45)] transition-transform hover:-translate-y-0.5 sm:inline-block"
          >
            Resume ↓
          </a>
          <button
            className="whitespace-nowrap py-2 font-mono text-xs uppercase tracking-widest lg:hidden"
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? "✕ Close" : "≡ Menu"}
          </button>
        </div>
      </nav>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden border-t border-line px-5 lg:hidden"
          >
            <ul className="mx-auto grid max-w-7xl gap-x-8 py-4 sm:grid-cols-2">
              {[...links, ["↓", "Resume", profile.resume]].map(([n, l, h]) => (
                <li key={h}>
                  <a
                    href={h}
                    target={h === profile.resume ? "_blank" : undefined}
                    onClick={() => setOpen(false)}
                    className="block border-b border-line py-3 font-mono text-sm uppercase tracking-widest"
                  >
                    <span className="mr-3 text-orange">{n}</span>
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function GearSvg({ className = "", teeth = 18 }: { className?: string; teeth?: number }) {
  return (
    <svg viewBox="0 0 200 200" className={className} fill="none" stroke="currentColor" strokeWidth="1">
      <circle cx="100" cy="100" r="18" />
      <circle cx="100" cy="100" r="62" strokeDasharray="3 5" />
      <circle cx="100" cy="100" r="78" />
      {Array.from({ length: teeth }).map((_, i) => (
        <rect key={i} x="93" y="8" width="14" height="14" transform={`rotate(${(i * 360) / teeth} 100 100)`} />
      ))}
    </svg>
  );
}

const heroStats = [
  ["4", "Engineering", "internships"],
  ["3", "National-level", "rankings"],
  ["13+", "Projects", "built & flown"],
];

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const bigY = useTransform(scrollYProgress, [0, 1], [0, 160]);
  const photoY = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const photoScale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);
  const bigScale = useTransform(scrollYProgress, [0, 1], [1, 1.25]);
  const bigOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0.15]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, -140]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  return (
    <section
      ref={ref}
      id="top"
      className="grain relative min-h-[100svh] overflow-hidden bg-bg"
      style={
        {
          /* Stacked (<1024px) layout, all derived from three numbers so phones, tablets and
             landscape phones line up the same way:
             --ew:   font size of "ENGINEER" — 27vw, but capped by screen height on landscape phones
             --ptop: where the portrait starts (overlapping the bottom of the word)
             --pw:   portrait width — capped by width, by 520px and by the screen height
                     (so a landscape phone isn't one giant face). The image is 1000×1239.
             Keep in sync with the drone placement in three/Drone.tsx. */
          "--ew": "min(27vw, 42svh)",
          "--ptop": "calc(56px + var(--ew) * 0.7)",
          "--pw": "min(80vw, 520px, 95svh)",
        } as React.CSSProperties
      }
    >
      {/* red studio glow */}
      <div className="pointer-events-none absolute left-1/2 top-[38%] h-[min(900px,180vw)] w-[min(900px,180vw)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(227,18,43,0.38)_0%,rgba(227,18,43,0.12)_35%,transparent_65%)]" />
      <div className="blueprint pointer-events-none absolute inset-0 opacity-50 [mask-image:radial-gradient(ellipse_at_center,#000_20%,transparent_75%)]" />

      {/* giant display word */}
      <motion.div
        style={{ y: bigY, scale: bigScale, opacity: bigOpacity }}
        className="pointer-events-none absolute inset-x-0 top-[calc(56px+var(--ew)*0.15)] select-none text-center lg:top-[9%]"
      >
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.2, 0.8, 0.2, 1] }}
          className="bg-gradient-to-b from-[#ff2a3a] via-[#c0101f] to-[#5a0610] bg-clip-text font-display text-[length:var(--ew)] uppercase leading-[0.8] tracking-tight text-transparent lg:text-[20vw]"
        >
          Engineer
        </motion.div>
      </motion.div>

      {/* rotating gears behind portrait */}
      <GearSvg
        className="spin-slow pointer-events-none absolute left-1/2 top-[30%] h-[min(520px,120vw)] w-[min(520px,120vw)] -translate-x-[70%] text-white/[0.06]"
        teeth={24}
      />
      <GearSvg
        className="spin-rev pointer-events-none absolute left-1/2 top-[18%] h-[min(260px,60vw)] w-[min(260px,60vw)] translate-x-[45%] text-orange/20"
        teeth={14}
      />

      {/* portrait: stacked under the word on phones/tablets, standing on the floor on desktop */}
      <motion.div
        style={{ y: photoY, scale: photoScale }}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.1, delay: 0.2, ease: [0.2, 0.8, 0.2, 1] }}
        className="pointer-events-none absolute left-1/2 top-[var(--ptop)] w-[var(--pw)] -translate-x-1/2 lg:bottom-0 lg:top-auto lg:w-[min(40vw,62svh)]"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/me/profile-bw.webp" alt={profile.name} className="fade-bottom h-auto w-full" />
      </motion.div>

      {/* 3D drone layer, above portrait */}
      <div className="pointer-events-none absolute inset-0 z-10">
        <HeroScene eventSource={ref} />
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-48 bg-gradient-to-t from-bg via-bg/80 to-transparent" />

      {/* content */}
      {/* Stacked: text starts ~68% down the portrait, over its faded bottom.
          ≥768px the stats move beside the text; ≥1024px the desktop composition. */}
      <motion.div
        style={{ y: textY, opacity: textOpacity }}
        className="relative z-20 mx-auto flex min-h-[100svh] max-w-7xl flex-col px-5 pb-24 pt-[calc(var(--ptop)+var(--pw)*0.84)] md:flex-row md:items-start md:justify-between md:gap-10 lg:items-end lg:pb-20 lg:pt-28"
      >
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="max-w-sm"
        >
          <div className="font-script text-[clamp(2.5rem,12vw,3rem)] text-ink md:text-6xl">Hello, I&apos;m</div>
          <h1 className="mt-1 font-display text-[clamp(3rem,16vw,3.75rem)] uppercase leading-[0.9] md:text-7xl">
            Paul Varghese
            <br />
            Shibu
          </h1>
          <div className="mt-4 text-lg font-semibold uppercase tracking-wide text-orange">
            Mechanical Engineer &amp;
            <br />
            Aerospace · Automation
          </div>
          <p className="mt-4 text-sm leading-relaxed text-muted">
            I design thrusters, fly autonomous drones and teach robot arms to move — from ISRO&apos;s semi-cryogenic stage to
            green-propellant RCS at IIT Madras Research Park.
          </p>
          <div className="mt-5 flex items-center gap-2 font-mono text-[0.6875rem] uppercase tracking-widest text-muted">
            <span className="h-2 w-2 rounded-full bg-orange shadow-[0_0_10px_#e3122b]" />
            NIT Calicut
          </div>
        </motion.div>

        {/* Stats: a 3-up strip under the text on phones, a column on tablet/desktop */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7, duration: 0.8 }}
          className="mt-8 w-full md:mt-4 md:w-56 md:shrink-0 lg:mt-10"
        >
          <div className="mb-8 hidden items-start gap-3 text-sm text-ink/80 md:flex">
            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line-strong text-orange">✦</span>
            Turning simulations into hardware that flies.
          </div>
          <div className="grid grid-cols-3 border-t border-line md:block">
            {heroStats.map(([n, a, b], i) => (
              <div
                key={a}
                className={`flex flex-col gap-1 py-4 md:flex-row md:items-center md:gap-4 md:border-t md:border-line ${
                  i ? "border-l border-line pl-3 md:border-l-0 md:pl-0" : ""
                } ${i === 0 ? "md:border-t-0" : ""}`}
              >
                <span className="font-display text-3xl text-orange md:w-16 md:text-4xl">{n}</span>
                <span className="font-mono text-[0.5625rem] uppercase leading-relaxed tracking-wider text-muted sm:text-[0.625rem] md:tracking-widest">
                  {a}
                  <br />
                  {b}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>

      {/* marquee strip */}
      <div className="absolute inset-x-0 bottom-0 z-30 overflow-hidden border-y border-line bg-bg/90 py-2.5 backdrop-blur">
        <div className="marquee flex w-max gap-10 whitespace-nowrap font-mono text-xs uppercase tracking-[0.25em] text-muted">
          {Array.from({ length: 2 }).map((_, k) => (
            <div key={k} className="flex gap-10">
              {["ISRO · LPSC", "Inbound Aerospace", "SAE ADDC · AIR 2", "CFD · ANSYS Fluent", "ArduPilot", "LeRobot · VLA", "CNC · CAM", "PINNs", "OpenFOAM + RL", "Fixed-Wing UAV"].map((t) => (
                <span key={t} className="flex items-center gap-10">
                  {t}
                  <span className="text-orange">✦</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
