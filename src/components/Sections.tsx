"use client";

import dynamic from "next/dynamic";
import { motion, useInView, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import {
  achievements,
  driveThumb,
  education,
  experience,
  leadership,
  profile,
  projects,
  skills,
  stats,
  type Project,
} from "@/data/portfolio";
import { MediaButtons, SectionHeading, Thumb, useMedia } from "./Media";
import { Parallax, Reveal, ScrollLine, ScrubText, item, stagger } from "./motion";

const EngineScene = dynamic(() => import("./three/EngineScene"), { ssr: false });

const fade = {
  initial: { opacity: 0, y: 50, filter: "blur(6px)" },
  whileInView: { opacity: 1, y: 0, filter: "blur(0px)" },
  viewport: { once: false, amount: 0.2 },
  transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const },
};

/* ───────────── About ───────────── */
function Counter({ n, suffix }: { n: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min((t - start) / 1400, 1);
      setV(Math.round(n * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, n]);
  return (
    <span ref={ref} className="tabular-nums">
      {v}
      {suffix}
    </span>
  );
}

export function About() {
  return (
    <section id="about" className="relative mx-auto max-w-7xl px-5 py-28">
      <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-12">
        <Parallax speed={60} rotate={4} className="relative mx-auto w-64 lg:col-span-4 lg:w-full lg:max-w-xs">
        <motion.div
          initial={{ opacity: 0, rotate: -14, scale: 0.7, y: 80 }}
          whileInView={{ opacity: 1, rotate: -3, scale: 1, y: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ type: "spring", stiffness: 70, damping: 12 }}
          className="relative"
        >
          <div className="absolute -inset-6 -z-10 rounded-full bg-[radial-gradient(circle,rgba(227,18,43,0.35),transparent_70%)]" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={profile.photo} alt={profile.name} className="sticker w-full" />
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 rotate-3 bg-orange px-4 py-1.5 font-display text-xl uppercase tracking-wide whitespace-nowrap text-white shadow-lg">
            Paul V. S.
          </div>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
            className="absolute -right-4 top-6 font-display text-3xl text-ink"
          >
            ✦
          </motion.div>
        </motion.div>
        </Parallax>

        <div className="lg:col-span-8">
          <SectionHeading index="01" kicker="Spec Sheet" title="Hello." />
          <ScrubText text={profile.summary} className="-mt-6 text-xl leading-relaxed md:text-2xl" />
          <motion.div
            variants={stagger(0.12)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: false, amount: 0.4 }}
            className="mt-10 grid grid-cols-2 gap-px border border-line bg-line md:grid-cols-4"
          >
            {stats.map((s) => (
              <motion.div variants={item} key={s.label} className="bg-bg p-5">
                <div className="font-display text-4xl text-orange md:text-5xl">
                  <Counter n={s.n} suffix={s.suffix} />
                </div>
                <div className="mt-2 font-mono text-[0.625rem] uppercase leading-snug tracking-widest text-muted">{s.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      <div className="mt-20">
        <Reveal dir="left">
          <div className="mb-6 font-display text-3xl uppercase">Education</div>
        </Reveal>
        <div className="grid grid-cols-1 gap-px border border-line bg-line md:grid-cols-3">
          {education.map((e, i) => (
            <Reveal key={e.school} dir="clip" delay={i * 0.12} className="group relative bg-bg p-6 transition-colors hover:bg-bg-2">
              <div className="flex items-baseline justify-between">
                <span className="font-display text-3xl text-orange/80">0{i + 1}</span>
                <span className="font-mono text-[0.6875rem] uppercase tracking-widest text-muted">{e.period}</span>
              </div>
              <div className="mt-4 font-semibold">{e.school}</div>
              <div className="text-sm text-muted">{e.degree}</div>
              <div className="mt-3 font-display text-2xl text-cyan">{e.score}</div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────────── Process (engineering workflow) ───────────── */
// (not named `process` — that would shadow Node's global and break the production build)
const processSteps = [
  ["Define", "Mission requirements, constraints and test criteria."],
  ["Simulate", "CFD in ANSYS Fluent / OpenFOAM, PINNs and RL for flow."],
  ["Design", "CAD in Fusion 360 & SolidWorks, from orifices to airframes."],
  ["Build", "CNC, 3D printing, welding and avionics integration."],
  ["Test", "Cold-flow rigs, load cells and flight trials, then iterate."],
];

export function Process() {
  const listRef = useRef<HTMLOListElement>(null);
  return (
    <section className="border-y border-line bg-bg-2">
      <div className="mx-auto grid max-w-7xl grid-cols-1 lg:grid-cols-12">
        <div className="px-5 py-20 lg:col-span-8 lg:pr-12">
          <SectionHeading index="◆" kicker="How I work" title="Engineering Process" />
          <ol ref={listRef} className="relative space-y-1">
            <ScrollLine target={listRef} className="bottom-6 left-[4.8125rem] top-6" />
            {processSteps.map(([t, d], i) => (
              <motion.li
                key={t}
                initial={{ opacity: 0, x: -60 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: false, amount: 0.8 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="group relative flex items-center gap-5 border-b border-line py-4"
              >
                <span className="w-10 font-display text-2xl text-orange">0{i + 1}</span>
                <span className="relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-orange/60 bg-bg-2 text-orange transition-colors group-hover:bg-orange group-hover:text-white">
                  <GearIcon />
                </span>
                <div>
                  <div className="font-semibold uppercase tracking-wide text-orange">{t}</div>
                  <div className="text-sm text-muted">{d}</div>
                </div>
              </motion.li>
            ))}
          </ol>
        </div>
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: false, amount: 0.3 }}
          className="relative flex flex-col justify-between overflow-hidden bg-gradient-to-br from-[#c0101f] to-[#4a0610] p-8 sm:p-10 lg:col-span-4"
        >
          {/* shutter that slides away to reveal the panel */}
          <motion.div
            variants={{ hidden: { scaleX: 1 }, show: { scaleX: 0, transition: { duration: 1.1, ease: [0.76, 0, 0.24, 1] } } }}
            className="absolute inset-0 z-20 origin-right bg-bg-2"
          />
          <div className="spin-slow pointer-events-none absolute -bottom-20 -right-20 h-72 w-72 rounded-full border-[30px] border-dashed border-white/10" />
          <div className="font-display text-7xl leading-none text-white/90">&ldquo;</div>
          <motion.p
            variants={stagger(0.25)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: false, amount: 0.6 }}
            className="relative mt-4 text-3xl font-semibold leading-snug text-white"
          >
            {["Simulate it.", "Build it.", "Fly it."].map((t) => (
              <motion.span key={t} variants={{ hidden: { opacity: 0, x: 40 }, show: { opacity: 1, x: 0, transition: { duration: 0.6 } } }} className="block">
                {t}
              </motion.span>
            ))}
          </motion.p>
          <motion.div
            variants={{ hidden: { opacity: 0, x: -30, rotate: -6 }, show: { opacity: 1, x: 0, rotate: 0, transition: { duration: 1, delay: 1 } } }}
            className="relative mt-10 font-script text-6xl text-white"
          >
            Paul
          </motion.div>
          <div className="relative mt-6 font-mono text-[0.6875rem] uppercase tracking-widest text-white/70">
            Let&apos;s build something
            <br />
            that leaves the ground.
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function GearIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
      <path d="M12 8a4 4 0 100 8 4 4 0 000-8zm9.4 5.2l-2-.3a7.6 7.6 0 01-.7 1.7l1.2 1.6-1.9 1.9-1.6-1.2c-.5.3-1.1.6-1.7.7l-.3 2h-2.7l-.3-2a7.6 7.6 0 01-1.7-.7l-1.6 1.2-1.9-1.9 1.2-1.6a7.6 7.6 0 01-.7-1.7l-2-.3v-2.7l2-.3c.1-.6.4-1.2.7-1.7L4.3 6.3l1.9-1.9 1.6 1.2c.5-.3 1.1-.6 1.7-.7l.3-2h2.7l.3 2c.6.1 1.2.4 1.7.7l1.6-1.2 1.9 1.9-1.2 1.6c.3.5.6 1.1.7 1.7l2 .3v2.7z" />
    </svg>
  );
}

/* ───────────── Experience ───────────── */
const domainColor: Record<string, string> = {
  propulsion: "text-orange border-orange/50",
  manufacturing: "text-steel border-steel/40",
  ml: "text-cyan border-cyan/50",
  software: "text-muted border-line-strong",
};

export function Experience() {
  const listRef = useRef<HTMLDivElement>(null);
  return (
    <section id="experience" className="blueprint relative border-y border-line py-28">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-5 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-24">
            <SectionHeading index="02" kicker="Flight Log" title="Internships">
              From hot-gas roll control at ISRO to pulsed green-propellant thrusters and CNC impeller lines.
            </SectionHeading>
            {/* Engine figure: a landscape panel above the timeline on phones/tablets, a tall sticky panel on desktop */}
            <div className="brackets relative h-[min(24rem,95vw)] border border-line bg-bg/60 sm:h-[26rem] lg:h-[28.75rem]">
              <EngineScene />
              <div className="pointer-events-none absolute left-3 right-3 top-3 font-mono text-[0.625rem] uppercase tracking-widest text-muted">
                FIG. 2 — Kerolox engine hot-fire<span className="pointer-coarse:hidden"> · drag to orbit</span>
              </div>
              <div className="pointer-events-none absolute bottom-3 right-3 font-mono text-[0.625rem] uppercase tracking-widest text-orange">
                ● Hot fire
              </div>
            </div>
          </div>
        </div>
        <div ref={listRef} className="relative space-y-6 pl-8 lg:col-span-8">
          <ScrollLine target={listRef} className="bottom-0 left-2 top-0" />
          {experience.map((e, i) => (
            <motion.article
              key={e.org}
              initial={{ opacity: 0, x: 120, rotateY: -18, filter: "blur(6px)" }}
              whileInView={{ opacity: 1, x: 0, rotateY: 0, filter: "blur(0px)" }}
              viewport={{ once: false, amount: 0.25 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              style={{ transformPerspective: 1200 }}
              className="brackets group relative border border-line bg-panel p-6 backdrop-blur md:p-8"
            >
              <motion.span
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: false, amount: 0.5 }}
                transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.3 }}
                className="absolute -left-[1.9375rem] top-8 h-3.5 w-3.5 rotate-45 border-2 border-orange bg-bg shadow-[0_0_10px_#e3122b]"
              />
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="font-mono text-[0.6875rem] uppercase tracking-widest text-muted">{e.period}</div>
                  <h3 className="mt-2 text-2xl font-bold uppercase tracking-tight">{e.org}</h3>
                  {e.sub && <div className="text-sm text-muted">{e.sub}</div>}
                  <div className="mt-2 font-medium text-cyan">{e.role}</div>
                </div>
                <span className={`border px-2.5 py-1 font-mono text-[0.625rem] uppercase tracking-widest ${domainColor[e.domain]}`}>
                  {e.code}
                </span>
              </div>
              <motion.ul
                variants={stagger(0.1)}
                initial="hidden"
                whileInView="show"
                viewport={{ once: false, amount: 0.4 }}
                className="mt-5 space-y-2.5"
              >
                {e.points.map((p) => (
                  <motion.li
                    key={p}
                    variants={{ hidden: { opacity: 0, x: 30 }, show: { opacity: 1, x: 0, transition: { duration: 0.5 } } }}
                    className="flex gap-3 text-ink/85"
                  >
                    <span className="mt-2 h-1 w-3 shrink-0 bg-orange" />
                    <span>{p}</span>
                  </motion.li>
                ))}
              </motion.ul>
              {e.media && (
                <div className="mt-6">
                  <MediaButtons media={e.media} title={e.org} />
                </div>
              )}
              <div className="absolute right-6 top-1/2 hidden -translate-y-1/2 font-mono text-7xl font-bold text-line opacity-0 transition-opacity group-hover:opacity-100 md:block">
                {String(i + 1).padStart(2, "0")}
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────────── Projects ───────────── */
function TiltCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rx = useSpring(useTransform(y, [-0.5, 0.5], [7, -7]), { stiffness: 200, damping: 20 });
  const ry = useSpring(useTransform(x, [-0.5, 0.5], [-7, 7]), { stiffness: 200, damping: 20 });
  return (
    <motion.div
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 900 }}
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        x.set((e.clientX - r.left) / r.width - 0.5);
        y.set((e.clientY - r.top) / r.height - 0.5);
      }}
      onMouseLeave={() => {
        x.set(0);
        y.set(0);
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function ProjectCard({ p, big, wide = p.wide, n }: { p: Project; big?: boolean; wide?: boolean; n?: number }) {
  const open = useMedia();
  const cover = p.image ?? (p.thumbDrive ? driveThumb(p.thumbDrive) : undefined);
  const primary = p.media?.find((m) => m.kind === "video") ?? p.media?.[0];
  return (
    <TiltCard className="h-full">
      <article className="brackets group flex h-full flex-col border border-line bg-panel backdrop-blur">
        <button
          onClick={() => primary && open(primary, p.title)}
          className={`relative block w-full overflow-hidden ${wide ? "aspect-[16/9] md:aspect-[32/10]" : big ? "aspect-[16/9]" : "aspect-[16/10]"} ${primary ? "cursor-pointer" : "cursor-default"}`}
          aria-label={primary ? `Open ${primary.label}` : p.title}
        >
          <motion.div
            initial={{ scale: 1.35 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
            className="h-full w-full"
          >
            {p.video ? (
              <div className="relative h-full w-full">
                <video
                  src={p.video}
                  poster={p.image}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="h-full w-full object-cover object-[25%_50%] transition-transform duration-700 group-hover:scale-105"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-bg via-transparent to-transparent" />
                <span className="absolute bottom-3 right-3 flex items-center gap-2 font-mono text-[0.625rem] uppercase tracking-widest text-white/80">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-orange" /> Live sim · U magnitude
                </span>
              </div>
            ) : (
              <Thumb src={cover} alt={p.title} label={p.slug.toUpperCase()} />
            )}
          </motion.div>
          {primary?.kind === "video" && (
            <span className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-orange/70 bg-bg/60 text-xl text-orange backdrop-blur transition-all group-hover:scale-110 group-hover:bg-orange group-hover:text-black">
              <svg viewBox="0 0 24 24" className="ml-1 h-6 w-6" fill="currentColor">
                <path d="M6 4l14 8-14 8z" />
              </svg>
            </span>
          )}
          <span className="absolute left-3 top-3 border border-line-strong bg-bg/70 px-2 py-1 font-mono text-[0.625rem] uppercase tracking-widest text-cyan backdrop-blur">
            {p.category}
          </span>
        </button>
        <div className="flex flex-1 flex-col p-5 sm:p-6">
          <div className="flex items-start gap-3 sm:gap-4">
            {n !== undefined && (
              <span className="font-display text-3xl leading-none text-orange sm:text-4xl">{String(n).padStart(2, "0")}</span>
            )}
            {/* min-w-0 + hyphens let long words ("REINFORCEMENT") wrap instead of widening the card on phones */}
            <div className="min-w-0 flex-1">
              <div className="font-mono text-[0.625rem] uppercase tracking-widest text-cyan sm:text-[0.6875rem]">{p.tag}</div>
              <h3
                className={`mt-1 font-bold uppercase leading-tight hyphens-auto [overflow-wrap:anywhere] ${
                  big ? "text-xl sm:text-2xl md:text-3xl" : "text-lg"
                }`}
              >
                {p.title}
              </h3>
            </div>
            <span className="hidden text-2xl text-muted transition-all group-hover:translate-x-1 group-hover:text-orange sm:inline">→</span>
          </div>
          {p.award && (
            <div className="mt-4 flex gap-2 border-l-2 border-orange bg-orange/5 px-3 py-2 text-sm text-ink/90">
              <span className="text-orange">★</span>
              <span>{p.award}</span>
            </div>
          )}
          <ul className="mt-4 space-y-2 text-sm text-muted">
            {p.points.map((pt) => (
              <li key={pt} className="flex gap-2">
                <span className="text-cyan">›</span>
                {pt}
              </li>
            ))}
          </ul>
          {p.stack && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {p.stack.map((s) => (
                <span key={s} className="bg-line px-2 py-0.5 font-mono text-[0.625rem] uppercase tracking-wider text-steel">
                  {s}
                </span>
              ))}
            </div>
          )}
          <div className="mt-auto pt-6">
            <MediaButtons media={p.media} title={p.title} />
          </div>
        </div>
      </article>
    </TiltCard>
  );
}

const cats = ["All", "Aerial Robotics", "Robotics & AI", "CFD & ML", "Manufacturing", "Software"] as const;
type Cat = (typeof cats)[number];
const inCat = (p: Project, c: Cat) => c === "All" || p.category === c;

/**
  Bento layout for whichever featured projects survive the filter
  (1 col on phones, 2 on tablets, 6 on desktop):
  3+ → one big tile (full row on tablets, 4×2 on desktop) with the others beside/below it;
  2 → side by side; 1 → full-width banner.
  Projects marked `wide` (the RL-CFD sim) always take a full-width row.
*/
function featuredLayout(list: Project[]) {
  const regular = list.filter((p) => !p.wide);
  const k = regular.length;
  const full = "md:col-span-2 lg:col-span-6";
  return list.map((p) => {
    if (p.wide) return { p, span: full, big: false, wide: true };
    const j = regular.indexOf(p);
    if (k === 1) return { p, span: full, big: true, wide: true };
    if (k === 2) return { p, span: "lg:col-span-3", big: true, wide: false };
    return {
      p,
      span: j === 0 ? "md:col-span-2 lg:col-span-4 lg:row-span-2" : "lg:col-span-2",
      big: j === 0,
      wide: false,
    };
  });
}

export function Projects() {
  const [cat, setCat] = useState<Cat>("All");
  const featured = featuredLayout(projects.filter((p) => p.featured && inCat(p, cat)));
  const rest = projects.filter((p) => !p.featured && inCat(p, cat));
  return (
    <section id="projects" className="mx-auto max-w-7xl px-5 py-28">
      <SectionHeading index="03" kicker="Hangar" title="Projects">
        Autonomous aircraft, VLA-driven manipulators, physics-informed networks and parts made on the shop floor. Click a
        card to play its flight video or open its report.
      </SectionHeading>

      <div className="mb-10 flex flex-wrap items-center gap-2">
        <span className="mr-3 font-mono text-xs uppercase tracking-widest text-muted">Filter ▸</span>
        {cats.map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            aria-pressed={cat === c}
            className={`border px-3 py-1.5 font-mono text-[0.6875rem] uppercase tracking-wider transition-colors ${
              cat === c ? "border-orange bg-orange text-black" : "border-line-strong text-muted hover:text-ink"
            }`}
          >
            {c}
            <span className={`ml-2 ${cat === c ? "text-black/60" : "text-muted/60"}`}>
              {projects.filter((p) => inCat(p, c)).length}
            </span>
          </button>
        ))}
      </div>

      {/* Keyed by category so the cards re-deal with their entrance animation on every filter change. */}
      <div key={cat}>
        {featured.length > 0 && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-6">
            {featured.map(({ p, span, big, wide }, i) => (
              <Reveal key={p.slug} dir="clip" duration={1.1} delay={i * 0.15} className={span}>
                <ProjectCard p={p} big={big} wide={wide} n={projects.indexOf(p) + 1} />
              </Reveal>
            ))}
          </div>
        )}

        {rest.length > 0 && (
          <div className={`grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 ${featured.length ? "mt-6" : ""}`}>
            {rest.map((p, i) => (
              <motion.div
                key={p.slug}
                initial={{ opacity: 0, y: 80, rotate: i % 2 ? 3 : -3, scale: 0.92 }}
                whileInView={{ opacity: 1, y: 0, rotate: 0, scale: 1 }}
                viewport={{ once: false, amount: 0.15 }}
                transition={{ duration: 0.8, delay: (i % 3) * 0.1, ease: [0.16, 1, 0.3, 1] }}
              >
                <ProjectCard p={p} n={projects.indexOf(p) + 1} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/* ───────────── Achievements ───────────── */
const tier: Record<string, string> = {
  gold: "from-[#ffcf5a] to-[#ff7a1a]",
  silver: "from-[#e6eef8] to-[#8ea3bd]",
  bronze: "from-[#ffb07a] to-[#b5652d]",
  steel: "from-[#ff6a3d] to-[#8a1a10]",
};

export function Achievements() {
  return (
    <section id="achievements" className="relative overflow-hidden border-y border-line bg-bg-2 py-28">
      <div className="hazard absolute inset-x-0 top-0 h-1.5 opacity-60" />
      <div className="mx-auto max-w-7xl px-5">
        <SectionHeading index="04" kicker="Podium" title="Achievements">
          National-level finishes with Club Aerounwired at SAE and NIT drone and aeromodelling challenges.
        </SectionHeading>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {achievements.map((a, i) => (
            <motion.div
              key={a.label + a.event}
              initial={{ opacity: 0, rotateX: -80, y: 80 }}
              whileInView={{ opacity: 1, rotateX: 0, y: 0 }}
              viewport={{ once: false, amount: 0.4 }}
              transition={{ duration: 0.9, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -8 }}
              style={{ transformPerspective: 800 }}
              className="brackets group relative overflow-hidden border border-line bg-bg p-7"
            >
              <svg viewBox="0 0 100 100" className="spin-slow absolute -right-8 -top-8 h-36 w-36 text-line" fill="none" stroke="currentColor">
                <circle cx="50" cy="50" r="30" strokeWidth="10" strokeDasharray="6 5" />
                <circle cx="50" cy="50" r="12" strokeWidth="1" />
              </svg>
              {/* The untransformed wrapper is the in-view target; the number inside
                  scales down from 2.2x (which overflows the card, so it can't be its own target). */}
              <motion.div initial="hidden" whileInView="show" viewport={{ once: false, amount: 0.5 }}>
                <motion.div
                  variants={{
                    hidden: { scale: 2.2, opacity: 0 },
                    show: {
                      scale: 1,
                      opacity: 1,
                      transition: { type: "spring", stiffness: 160, damping: 14, delay: 0.25 + i * 0.15 },
                    },
                  }}
                  className={`inline-block origin-left bg-gradient-to-br bg-clip-text font-display text-7xl leading-none text-transparent ${tier[a.tier]}`}
                >
                  {a.value}
                </motion.div>
              </motion.div>
              <div className="mt-4 text-lg font-semibold">{a.label}</div>
              <div className="mt-1 font-mono text-xs uppercase tracking-widest text-muted">{a.event}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────────── Leadership ───────────── */
export function Leadership() {
  return (
    <section id="leadership" className="mx-auto max-w-7xl px-5 py-28">
      <SectionHeading index="05" kicker="Crew" title="Leadership" />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {leadership.map((l, i) => (
          <motion.article
            key={l.org}
            initial={{ opacity: 0, x: i % 2 ? 100 : -100, filter: "blur(8px)" }}
            whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            viewport={{ once: false, amount: 0.25 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="brackets border border-line bg-panel p-7"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="font-display text-3xl uppercase">{l.org}</h3>
              <span className="font-mono text-[0.6875rem] uppercase tracking-widest text-muted">{l.period}</span>
            </div>
            <div className="mt-1 text-cyan">{l.role}</div>
            <ul className="mt-5 space-y-2 text-sm text-ink/85">
              {l.points.map((p) => (
                <li key={p} className="flex gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rotate-45 bg-orange" />
                  {p}
                </li>
              ))}
            </ul>
            {l.media && (
              <div className="mt-6">
                <MediaButtons media={l.media} title={l.org} />
              </div>
            )}
          </motion.article>
        ))}
      </div>
    </section>
  );
}

/* ───────────── Skills ───────────── */
export function Skills() {
  return (
    <section className="blueprint border-y border-line py-24">
      <div className="mx-auto max-w-7xl px-5">
        <SectionHeading index="06" kicker="Toolbox" title="Skills" />
        <div className="grid grid-cols-1 gap-px border border-line bg-line md:grid-cols-2 lg:grid-cols-4">
          {skills.map((s, i) => (
            <motion.div key={s.group} {...fade} transition={{ duration: 0.5, delay: i * 0.08 }} className="bg-bg p-6">
              <div className="mb-4 flex items-center justify-between font-mono text-xs uppercase tracking-widest text-orange">
                {s.group}
                <span className="text-muted">0{i + 1}</span>
              </div>
              <motion.div
                variants={stagger(0.05)}
                initial="hidden"
                whileInView="show"
                viewport={{ once: false, amount: 0.5 }}
                className="flex flex-wrap gap-2"
              >
                {s.items.map((it) => (
                  <motion.span
                    key={it}
                    variants={item}
                    whileHover={{ scale: 1.08, y: -2 }}
                    className="border border-line-strong px-2.5 py-1 text-sm transition-colors hover:border-cyan hover:text-cyan"
                  >
                    {it}
                  </motion.span>
                ))}
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────────── Contact ───────────── */
export function Contact() {
  return (
    <section id="contact" className="relative mx-auto max-w-7xl px-5 py-32">
      <SectionHeading index="07" kicker="Uplink" title="Let's work together" />
      <motion.div
        variants={stagger(0.1)}
        initial="hidden"
        whileInView="show"
        viewport={{ once: false, amount: 0.4 }}
        className="grid grid-cols-1 gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-4"
      >
        {[
          ["Email", profile.email, `mailto:${profile.email}`],
          ["Phone", profile.phone, `tel:${profile.phone.replace(/\s/g, "")}`],
          ["LinkedIn", "paul-varghese-shibu", profile.links.linkedin],
          ["GitHub", "Paul-V-S-10", profile.links.github],
        ].map(([k, v, h]) => (
          <motion.a variants={item} key={k} href={h} target="_blank" rel="noopener" className="group bg-bg p-6 transition-colors hover:bg-bg-2">
            <div className="font-mono text-[0.6875rem] uppercase tracking-widest text-muted">{k}</div>
            <div className="mt-2 text-base [overflow-wrap:anywhere] transition-colors lg:text-lg group-hover:text-orange">{v} ↗</div>
          </motion.a>
        ))}
      </motion.div>
      <div className="mt-6 flex flex-wrap gap-4">
        <a href={profile.resume} target="_blank" className="bg-orange px-6 py-3 font-mono text-sm font-semibold uppercase tracking-widest text-black">
          Download Resume ↓
        </a>
      </div>
      <footer className="mt-24 flex flex-wrap justify-between gap-4 border-t border-line pt-6 font-mono text-[0.6875rem] uppercase tracking-widest text-muted">
        <span>© {new Date().getFullYear()} {profile.name}</span>
        <span>{profile.location}</span>
        <span>Built with Next.js · Three.js</span>
      </footer>
    </section>
  );
}
