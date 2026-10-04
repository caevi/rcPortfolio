"use client";

import { forwardRef, useRef, useState, type MouseEvent } from "react";
import { motion, useMotionTemplate, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import type { Project } from "@/lib/database.types";
import { techBadgeClass } from "@/lib/techBadge";

type Props = { project: Project; index: number };

/**
 * Animated project card:
 *  - staggered fade/slide in when scrolled into view
 *  - subtle 3D tilt + cursor-following spotlight on hover
 *  - respects prefers-reduced-motion
 * forwardRef is required because AnimatePresence mode="popLayout" measures the child.
 */
export const ProjectCard = forwardRef<HTMLLIElement, Props>(function ProjectCard(
  { project, index },
  ref
) {
  const reduceMotion = useReducedMotion();
  const cardRef = useRef<HTMLDivElement>(null);

  const mx = useMotionValue(50);
  const my = useMotionValue(50);
  const rotX = useSpring(0, { stiffness: 200, damping: 20 });
  const rotY = useSpring(0, { stiffness: 200, damping: 20 });
  const spotlight = useMotionTemplate`radial-gradient(420px circle at ${mx}% ${my}%, rgba(239,68,68,0.16), transparent 60%)`;

  function onMove(e: MouseEvent<HTMLDivElement>) {
    if (reduceMotion || !cardRef.current) return;
    const r = cardRef.current.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    mx.set(px * 100);
    my.set(py * 100);
    rotY.set((px - 0.5) * 8);
    rotX.set((0.5 - py) * 8);
  }

  function onLeave() {
    rotX.set(0);
    rotY.set(0);
  }

  return (
    <motion.li
      ref={ref}
      layout={!reduceMotion}
      initial={{ opacity: 0, y: reduceMotion ? 0 : 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.15 } }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.45, delay: Math.min(index * 0.06, 0.36), ease: [0.22, 1, 0.36, 1] }}
      style={{ perspective: 1000 }}
      className="h-full"
    >
      <motion.div
        ref={cardRef}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        style={reduceMotion ? undefined : { rotateX: rotX, rotateY: rotY }}
        whileHover={reduceMotion ? undefined : { y: -6 }}
        className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/60 backdrop-blur transition-colors hover:border-red-600/40"
      >
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{ background: spotlight }}
        />

        <ProjectCover project={project} />

        <div className="relative flex flex-1 flex-col p-6">
          <div className="mb-3 flex items-start justify-between gap-3">
            <h3 className="text-xl font-semibold tracking-tight text-neutral-50">{project.title}</h3>
            {project.featured && (
              <span className="shrink-0 rounded-full bg-red-500/10 px-2.5 py-0.5 font-mono text-[11px] uppercase tracking-wider text-red-400 ring-1 ring-inset ring-red-500/30">
                Featured
              </span>
            )}
          </div>

          {project.description && (
            <p className="mb-5 line-clamp-4 text-sm leading-relaxed text-neutral-400">{project.description}</p>
          )}

          {project.tech_stack.length > 0 && (
            <ul aria-label="Tech stack" className="mb-6 mt-auto flex flex-wrap gap-1.5">
              {project.tech_stack.map((tech) => (
                <li
                  key={tech}
                  className={`rounded-md px-2 py-0.5 font-mono text-xs ring-1 ring-inset ${techBadgeClass(tech)}`}
                >
                  {tech}
                </li>
              ))}
            </ul>
          )}

          <div className="flex gap-3">
            {project.live_url && (
              <a
                href={project.live_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3.5 py-2 text-sm font-medium text-white transition hover:bg-red-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
              >
                Live demo <ArrowIcon />
                <span className="sr-only"> for {project.title}</span>
              </a>
            )}
            {project.github_url && (
              <a
                href={project.github_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-700 px-3.5 py-2 text-sm font-medium text-neutral-200 transition hover:border-neutral-500 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
              >
                <GitHubIcon /> Code
                <span className="sr-only"> for {project.title} on GitHub</span>
              </a>
            )}
          </div>
        </div>
      </motion.div>
    </motion.li>
  );
});

/**
 * 16:9 cover. Uses the project's image (screenshot or logo) when set;
 * otherwise draws a branded placeholder so every card stays the same height.
 */
function ProjectCover({ project }: { project: Project }) {
  const [failed, setFailed] = useState(false);
  const showImage = !!project.image_url && !failed;

  return (
    <div className="relative aspect-[16/9] overflow-hidden border-b border-neutral-800 bg-neutral-950">
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element -- URLs come from the admin (Storage or /public); swap for next/image once domains are configured
        <img
          src={project.image_url!}
          alt={`${project.title} preview`}
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
          className="h-full w-full object-cover object-top transition-transform duration-500 ease-out group-hover:scale-[1.04]"
        />
      ) : (
        <FallbackCover title={project.title} />
      )}
      {/* Soft fade into the card body */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-neutral-900/80 to-transparent" />
    </div>
  );
}

const FALLBACK_GRADIENTS = [
  "from-red-600/30 via-red-600/10 to-neutral-950",
  "from-red-700/40 via-black to-black",
  "from-white/15 via-neutral-900 to-black",
  "from-red-500/25 via-neutral-950 to-black",
  "from-neutral-500/25 via-neutral-950 to-black",
];

function FallbackCover({ title }: { title: string }) {
  let hash = 0;
  for (let i = 0; i < title.length; i++) hash = (hash * 31 + title.charCodeAt(i)) | 0;
  const gradient = FALLBACK_GRADIENTS[Math.abs(hash) % FALLBACK_GRADIENTS.length];
  const initials = title
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <div className={`relative flex h-full w-full items-center justify-center bg-gradient-to-br ${gradient}`}>
      <div
        aria-hidden
        className="absolute inset-0 opacity-20 [background-image:linear-gradient(to_right,#525252_1px,transparent_1px),linear-gradient(to_bottom,#525252_1px,transparent_1px)] [background-size:32px_32px]"
      />
      <span className="relative font-mono text-5xl font-semibold tracking-tight text-neutral-100/90 transition-transform duration-500 group-hover:scale-110">
        {initials}
      </span>
    </div>
  );
}

function ArrowIcon() {
  return (
    <svg aria-hidden viewBox="0 0 16 16" className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 12 12 4M6 4h6v6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
      <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.42-2.69 5.39-5.26 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z" />
    </svg>
  );
}
