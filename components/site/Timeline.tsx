"use client";

import { useMemo, useRef, useState } from "react";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion, useScroll, useSpring } from "framer-motion";
import type { EducationOrCert, Experience } from "@/lib/database.types";
import { SectionHeader } from "./SectionHeader";

type Kind = "work" | "education" | "certification";

type Item = {
  id: string;
  kind: Kind;
  title: string;
  org: string;
  orgUrl: string | null;
  date: string | null; // sort key
  when: string;
  location: string | null;
  bullets: string[];
  description: string | null;
  credentialUrl: string | null;
  current: boolean;
};

const FILTERS: { key: "all" | Kind; label: string }[] = [
  { key: "all", label: "All" },
  { key: "work", label: "Work" },
  { key: "education", label: "Education" },
  { key: "certification", label: "Certifications" },
];

const KIND_STYLE: Record<Kind, { label: string; dot: string; chip: string }> = {
  work: { label: "Work", dot: "bg-red-600", chip: "text-red-400 bg-red-500/10 ring-red-500/30" },
  education: { label: "Education", dot: "bg-white", chip: "text-white bg-white/10 ring-white/30" },
  certification: { label: "Certification", dot: "bg-neutral-400", chip: "text-neutral-300 bg-neutral-400/10 ring-neutral-400/30" },
};

function fmt(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function duration(start: string, end: string | null) {
  const s = new Date(start + "T00:00:00");
  const e = end ? new Date(end + "T00:00:00") : new Date();
  const months = Math.max(1, (e.getFullYear() - s.getFullYear()) * 12 + e.getMonth() - s.getMonth() + (end ? 0 : 1));
  const y = Math.floor(months / 12);
  const m = months % 12;
  return [y && `${y} yr${y > 1 ? "s" : ""}`, m && `${m} mo${m > 1 ? "s" : ""}`].filter(Boolean).join(" ");
}

export function Timeline({ experience, eduCerts }: { experience: Experience[]; eduCerts: EducationOrCert[] }) {
  const reduce = useReducedMotion();
  const [filter, setFilter] = useState<"all" | Kind>("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: listRef, offset: ["start 75%", "end 60%"] });
  const lineScale = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });

  const items = useMemo<Item[]>(() => {
    const work: Item[] = experience.map((e) => ({
      id: e.id,
      kind: "work",
      title: e.role,
      org: e.company,
      orgUrl: e.company_url,
      date: e.start_date,
      when: `${fmt(e.start_date)} – ${e.end_date ? fmt(e.end_date) : "Present"} · ${duration(e.start_date, e.end_date)}`,
      location: e.location,
      bullets: e.bullets,
      description: null,
      credentialUrl: null,
      current: !e.end_date,
    }));
    const edu: Item[] = eduCerts.map((c) => ({
      id: c.id,
      kind: c.type,
      title: c.title,
      org: c.institution,
      orgUrl: null,
      date: c.issue_date,
      when: c.issue_date ? (c.type === "certification" ? `Issued ${fmt(c.issue_date)}` : fmt(c.issue_date)) : "",
      location: null,
      bullets: [],
      description: c.description,
      credentialUrl: c.credential_url,
      current: false,
    }));
    return [...work, ...edu].sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));
  }, [experience, eduCerts]);

  if (items.length === 0) return null;

  const counts = { all: items.length, work: 0, education: 0, certification: 0 } as Record<"all" | Kind, number>;
  for (const i of items) counts[i.kind]++;
  const visible = filter === "all" ? items : items.filter((i) => i.kind === filter);

  return (
    <section id="experience" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-24 sm:px-6">
      <SectionHeader eyebrow="Experience & education" title="Where I've been" />

      <LayoutGroup>
        <div role="tablist" aria-label="Filter timeline" className="mb-12 flex flex-wrap gap-2">
          {FILTERS.filter((f) => counts[f.key] > 0).map((f) => {
            const selected = f.key === filter;
            return (
              <button
                key={f.key}
                role="tab"
                aria-selected={selected}
                onClick={() => setFilter(f.key)}
                className={`relative rounded-full px-4 py-1.5 text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 ${
                  selected ? "text-white" : "text-neutral-400 hover:text-neutral-100"
                }`}
              >
                {selected && (
                  <motion.span
                    layoutId="timeline-filter-pill"
                    className="absolute inset-0 rounded-full bg-red-600"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                <span className="relative">
                  {f.label} <span className={selected ? "text-red-100" : "text-neutral-600"}>{counts[f.key]}</span>
                </span>
              </button>
            );
          })}
        </div>

        <div ref={listRef} className="relative">
          {/* Rail + scroll-driven progress line */}
          <div aria-hidden className="absolute bottom-2 left-[7px] top-2 w-px bg-neutral-800 sm:left-[159px]" />
          <motion.div
            aria-hidden
            style={{ scaleY: reduce ? 1 : lineScale }}
            className="absolute bottom-2 left-[7px] top-2 w-px origin-top bg-gradient-to-b from-red-600 via-red-500 to-white/60 sm:left-[159px]"
          />

          <motion.ol layout={!reduce} className="space-y-4">
            <AnimatePresence mode="popLayout" initial={false}>
              {visible.map((item, i) => {
                const style = KIND_STYLE[item.kind];
                const expandable = item.bullets.length > 0 || !!item.description;
                const open = openId === item.id;
                return (
                  <motion.li
                    key={item.id}
                    layout={!reduce}
                    initial={{ opacity: 0, x: reduce ? 0 : -16 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, transition: { duration: 0.15 } }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ duration: 0.45, delay: Math.min(i * 0.05, 0.3) }}
                    className="relative grid grid-cols-[16px_1fr] gap-x-5 sm:grid-cols-[136px_16px_1fr] sm:gap-x-4"
                  >
                    {/* Date column (desktop) */}
                    <p className="hidden pt-5 text-right font-mono text-xs leading-5 text-neutral-500 sm:block">
                      {item.date ? fmt(item.date) : "—"}
                    </p>

                    {/* Dot */}
                    <span className="relative flex justify-center pt-6">
                      <span className={`relative z-10 h-3.5 w-3.5 rounded-full ring-4 ring-neutral-950 ${style.dot}`} />
                      {item.current && (
                        <span className={`absolute top-6 h-3.5 w-3.5 animate-ping rounded-full opacity-50 ${style.dot}`} />
                      )}
                    </span>

                    {/* Card */}
                    <div
                      className={`rounded-2xl border bg-neutral-900/50 transition-colors ${
                        open ? "border-neutral-700" : "border-neutral-800 hover:border-neutral-700"
                      }`}
                    >
                      <button
                        type="button"
                        disabled={!expandable}
                        onClick={() => setOpenId(open ? null : item.id)}
                        aria-expanded={expandable ? open : undefined}
                        className="flex w-full items-start justify-between gap-4 p-5 text-left disabled:cursor-default"
                      >
                        <div className="min-w-0">
                          <div className="mb-2 flex flex-wrap items-center gap-2">
                            <span className={`rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider ring-1 ring-inset ${style.chip}`}>
                              {style.label}
                            </span>
                            {item.current && (
                              <span className="rounded-full bg-neutral-800 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-neutral-300">
                                Current
                              </span>
                            )}
                          </div>
                          <h3 className="text-lg font-semibold leading-snug text-neutral-50">{item.title}</h3>
                          <p className="mt-0.5 text-sm text-neutral-300">
                            {item.orgUrl ? (
                              <a href={item.orgUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="hover:text-red-400">
                                {item.org}
                              </a>
                            ) : (
                              item.org
                            )}
                            {item.location && <span className="text-neutral-500"> · {item.location}</span>}
                          </p>
                          {item.when && <p className="mt-1 font-mono text-xs text-neutral-500">{item.when}</p>}
                        </div>
                        {expandable && (
                          <motion.svg
                            animate={{ rotate: open ? 180 : 0 }}
                            viewBox="0 0 24 24"
                            className="mt-1 h-5 w-5 shrink-0 text-neutral-500"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            aria-hidden
                          >
                            <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                          </motion.svg>
                        )}
                      </button>

                      <AnimatePresence initial={false}>
                        {open && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            className="overflow-hidden"
                          >
                            <div className="border-t border-neutral-800 px-5 pb-5 pt-4">
                              {item.description && <p className="text-sm leading-relaxed text-neutral-400">{item.description}</p>}
                              {item.bullets.length > 0 && (
                                <ul className="space-y-2">
                                  {item.bullets.map((b, bi) => (
                                    <li key={bi} className="flex gap-3 text-sm leading-relaxed text-neutral-400">
                                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-red-600" />
                                      {b}
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {item.credentialUrl && (
                        <div className="px-5 pb-5">
                          <a
                            href={item.credentialUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-700 px-3 py-1.5 text-xs font-medium text-neutral-200 transition hover:border-red-500/60 hover:text-red-300"
                          >
                            Show credential
                            <svg aria-hidden viewBox="0 0 16 16" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M4 12 12 4M6 4h6v6" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </a>
                        </div>
                      )}
                    </div>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </motion.ol>
        </div>
      </LayoutGroup>
    </section>
  );
}
