"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SplitText } from "./motion";
import { driveEmbed, driveOpen, driveThumb, type Media } from "@/data/portfolio";

const Ctx = createContext<(m: Media, title?: string) => void>(() => {});
const isVideo = (m: Media) => m.kind === "video" || !!m.src;
export const useMedia = () => useContext(Ctx);

export function MediaProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<{ m: Media; title?: string } | null>(null);
  const open = useCallback((m: Media, title?: string) => {
    if (m.kind === "link" && m.url) {
      window.open(m.url, "_blank", "noopener");
      return;
    }
    setState({ m, title });
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setState(null);
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = state ? "hidden" : "";
    return () => window.removeEventListener("keydown", onKey);
  }, [state]);

  return (
    <Ctx.Provider value={open}>
      {children}
      <AnimatePresence>
        {state && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-3 backdrop-blur-sm sm:p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setState(null)}
          >
            {/* Videos stay 16:9 but never taller than the screen (landscape phones);
                reports/folders get a taller portrait frame on phones so a PDF page is readable. */}
            <motion.div
              className={`brackets relative w-full border border-line-strong bg-bg-2 ${
                isVideo(state.m) ? "max-w-[min(64rem,calc((100svh-5rem)*16/9))]" : "max-w-5xl"
              }`}
              initial={{ scale: 0.92, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 24 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between gap-3 border-b border-line px-3 py-3 font-mono text-[0.6875rem] uppercase tracking-widest text-muted sm:gap-4 sm:px-4 sm:text-xs">
                <span className="min-w-0 truncate">
                  <span className="text-orange">■</span> {state.title ? `${state.title} — ` : ""}
                  {state.m.label}
                </span>
                <div className="flex shrink-0 gap-3 sm:gap-4">
                  {state.m.drive ? (
                    <a href={driveOpen(state.m)} target="_blank" rel="noopener" className="py-1 hover:text-cyan">
                      <span className="hidden sm:inline">Open in </span>Drive ↗
                    </a>
                  ) : (
                    state.m.src && (
                      <a href={state.m.src} target="_blank" rel="noopener" className="py-1 hover:text-cyan">
                        <span className="hidden sm:inline">Open </span>File ↗
                      </a>
                    )
                  )}
                  <button onClick={() => setState(null)} className="py-1 hover:text-orange" aria-label="Close">
                    ✕<span className="hidden sm:inline"> Close</span>
                  </button>
                </div>
              </div>
              <div
                className={`relative w-full bg-black ${
                  isVideo(state.m) ? "aspect-video" : "aspect-[3/4] max-h-[calc(100svh-5rem)] sm:aspect-video"
                }`}
              >
                {state.m.src ? (
                  <video src={state.m.src} className="h-full w-full object-contain" controls autoPlay playsInline />
                ) : state.m.kind === "image" ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={driveThumb(state.m.drive!, 2000)} alt={state.m.label} className="h-full w-full object-contain" />
                ) : (
                  <iframe
                    src={driveEmbed(state.m)}
                    className="h-full w-full"
                    allow="autoplay; fullscreen"
                    allowFullScreen
                    title={state.m.label}
                  />
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Ctx.Provider>
  );
}

const icon: Record<Media["kind"], string> = {
  video: "▶",
  report: "▤",
  image: "◩",
  folder: "▶",
  certificate: "✦",
  link: "↗",
};

export function MediaButtons({ media, title }: { media?: Media[]; title?: string }) {
  const open = useMedia();
  if (!media?.length) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {media.map((m) => (
        <button
          key={m.label}
          onClick={(e) => {
            e.stopPropagation();
            open(m, title);
          }}
          className={`group/btn inline-flex items-center gap-2 border px-3 py-1.5 font-mono text-[0.6875rem] uppercase tracking-wider transition-colors ${
            m.kind === "video" || m.kind === "folder"
              ? "border-orange/60 text-orange hover:bg-orange hover:text-black"
              : "border-cyan/40 text-cyan hover:bg-cyan hover:text-black"
          }`}
        >
          <span>{icon[m.kind]}</span>
          {m.label}
        </button>
      ))}
    </div>
  );
}

/** Thumbnail with blueprint fallback if no image/Drive thumb is available. */
export function Thumb({ src, alt, label }: { src?: string; alt: string; label: string }) {
  const [ok, setOk] = useState(!!src);
  return (
    <div className="blueprint relative h-full w-full overflow-hidden bg-bg-2">
      {ok && src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setOk(false)}
          className="h-full w-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-105"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <svg viewBox="0 0 200 200" className="spin-slow h-28 w-28 text-orange/40" fill="none" stroke="currentColor" strokeWidth="1.2">
            <circle cx="100" cy="100" r="22" />
            <circle cx="100" cy="100" r="60" strokeDasharray="4 4" />
            {Array.from({ length: 16 }).map((_, i) => {
              const a = (i / 16) * Math.PI * 2;
              return (
                <rect
                  key={i}
                  x="94"
                  y="22"
                  width="12"
                  height="18"
                  transform={`rotate(${(a * 180) / Math.PI} 100 100)`}
                />
              );
            })}
            <circle cx="100" cy="100" r="62" />
          </svg>
          <span className="absolute bottom-3 left-3 font-mono text-[0.625rem] uppercase tracking-widest text-muted">
            FIG. {label}
          </span>
        </div>
      )}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-bg via-bg/20 to-transparent" />
    </div>
  );
}

export function SectionHeading({ index, kicker, title, children }: { index: string; kicker: string; title: string; children?: React.ReactNode }) {
  return (
    <div className="relative mb-14">
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: false, amount: 0.8 }}
        className="mb-4 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.3em] text-cyan"
      >
        <motion.span variants={{ hidden: { opacity: 0, scale: 0 }, show: { opacity: 1, scale: 1 } }} className="text-orange">
          {index}
        </motion.span>
        <motion.span
          variants={{ hidden: { scaleX: 0 }, show: { scaleX: 1, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } } }}
          className="h-px w-12 origin-left bg-orange/70"
        />
        <motion.span variants={{ hidden: { opacity: 0, x: -10 }, show: { opacity: 1, x: 0, transition: { delay: 0.3 } } }}>{kicker}</motion.span>
      </motion.div>
      <h2 className="font-display text-5xl uppercase leading-[0.95] md:text-7xl">
        <SplitText text={title} />
      </h2>
      {children && (
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.8 }}
          transition={{ delay: 0.3, duration: 0.7 }}
          className="mt-4 max-w-2xl text-muted"
        >
          {children}
        </motion.p>
      )}
    </div>
  );
}
