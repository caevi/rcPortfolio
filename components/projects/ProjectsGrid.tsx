"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "framer-motion";
import type { Project } from "@/lib/database.types";
import { ProjectCard } from "./ProjectCard";

/**
 * Client grid with a tech-stack filter bar. Filter chips are generated from
 * whatever technologies exist in the data, so nothing is hard-coded.
 */
export function ProjectsGrid({ projects }: { projects: Project[] }) {
  const [active, setActive] = useState<string>("All");
  const reduceMotion = useReducedMotion();

  const techs = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of projects) for (const t of p.tech_stack) counts.set(t, (counts.get(t) ?? 0) + 1);
    // Most-used first, then alphabetical; cap to keep the bar tidy.
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, 8)
      .map(([t]) => t);
  }, [projects]);

  const visible = useMemo(
    () => (active === "All" ? projects : projects.filter((p) => p.tech_stack.includes(active))),
    [projects, active]
  );

  return (
    <LayoutGroup>
      {techs.length > 1 && (
        <div role="tablist" aria-label="Filter projects by technology" className="mb-10 flex flex-wrap gap-2">
          {["All", ...techs].map((tech) => {
            const selected = tech === active;
            return (
              <button
                key={tech}
                role="tab"
                aria-selected={selected}
                onClick={() => setActive(tech)}
                className={`relative rounded-full px-4 py-1.5 text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 ${
                  selected ? "text-white" : "text-neutral-400 hover:text-neutral-100"
                }`}
              >
                {selected && (
                  <motion.span
                    layoutId="project-filter-pill"
                    className="absolute inset-0 rounded-full bg-red-600"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                <span className="relative">{tech}</span>
              </button>
            );
          })}
        </div>
      )}

      <motion.ul layout={!reduceMotion} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {visible.map((project, i) => (
            <ProjectCard key={project.id} project={project} index={i} />
          ))}
        </AnimatePresence>
      </motion.ul>
    </LayoutGroup>
  );
}
