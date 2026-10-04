"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "framer-motion";
import type { Skill } from "@/lib/database.types";
import { SectionHeader } from "./SectionHeader";
import { SkillIcon } from "./SkillIcon";

// Preferred display order; any new category from the dashboard is appended.
const CATEGORY_ORDER = ["Frontend", "Backend", "Languages", "Cloud", "DevOps/Tools", "IT & Support", "Other"];

export function SkillsSection({ skills }: { skills: Skill[] }) {
  const reduce = useReducedMotion();
  const [active, setActive] = useState("All");

  const groups = useMemo(() => {
    const map = new Map<string, Skill[]>();
    for (const s of skills) map.set(s.category, [...(map.get(s.category) ?? []), s]);
    const rank = (c: string) => (CATEGORY_ORDER.indexOf(c) + 1 || 99);
    return [...map.entries()]
      .sort((a, b) => rank(a[0]) - rank(b[0]) || a[0].localeCompare(b[0]))
      .map(([category, items]) => ({ category, items: items.sort((a, b) => a.sort_order - b.sort_order) }));
  }, [skills]);

  if (skills.length === 0) return null;

  const visible = active === "All" ? groups : groups.filter((g) => g.category === active);

  return (
    <section id="skills" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-24 sm:px-6">
      <SectionHeader eyebrow="Tech stack & knowledge" title="What I work with" />

      <LayoutGroup>
        <div role="tablist" aria-label="Filter skills by category" className="mb-10 flex flex-wrap gap-2">
          {["All", ...groups.map((g) => g.category)].map((c) => {
            const selected = c === active;
            return (
              <button
                key={c}
                role="tab"
                aria-selected={selected}
                onClick={() => setActive(c)}
                className={`relative rounded-full px-4 py-1.5 text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 ${
                  selected ? "text-white" : "text-neutral-400 hover:text-neutral-100"
                }`}
              >
                {selected && (
                  <motion.span
                    layoutId="skills-filter-pill"
                    className="absolute inset-0 rounded-full bg-red-600"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                <span className="relative">{c}</span>
              </button>
            );
          })}
        </div>

        <motion.div layout={!reduce} className="grid gap-6 md:grid-cols-2">
          <AnimatePresence mode="popLayout">
            {visible.map((g, gi) => (
              <motion.div
                key={g.category}
                layout={!reduce}
                initial={{ opacity: 0, y: reduce ? 0 : 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.15 } }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.45, delay: Math.min(gi * 0.05, 0.25) }}
                className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6"
              >
                <h3 className="mb-4 flex items-center justify-between font-mono text-xs uppercase tracking-[0.18em] text-neutral-500">
                  {g.category}
                  <span className="text-neutral-600">{String(g.items.length).padStart(2, "0")}</span>
                </h3>
                <ul className="flex flex-wrap gap-2">
                  {g.items.map((s, i) => (
                    <motion.li
                      key={s.id}
                      initial={{ opacity: 0, scale: reduce ? 1 : 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.25, delay: Math.min(i * 0.03, 0.3) }}
                      whileHover={reduce ? undefined : { y: -3 }}
                      className="group relative flex items-center gap-2 overflow-hidden rounded-lg border border-neutral-800 bg-neutral-950/60 px-3 py-2 text-sm text-neutral-200 transition-colors hover:border-red-500/40"
                      title={s.proficiency != null ? `${s.name} · ${s.proficiency}%` : s.name}
                    >
                      <SkillIcon icon={s.icon} name={s.name} />
                      <span>{s.name}</span>
                      {s.proficiency != null && (
                        <span
                          aria-hidden
                          className="absolute bottom-0 left-0 h-0.5 bg-red-500/70"
                          style={{ width: `${s.proficiency}%` }}
                        />
                      )}
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </LayoutGroup>
    </section>
  );
}
