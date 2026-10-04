import { getSupabaseServerClient } from "@/lib/supabaseServer";
import { ProjectsGrid } from "./ProjectsGrid";

/**
 * Server Component: fetches projects at request/revalidate time and hands
 * them to the animated client grid. No loading spinners, good SEO.
 *
 * Usage in app/page.tsx:   <ProjectsSection />
 * Featured-only variant:   <ProjectsSection featuredOnly />
 */
export async function ProjectsSection({ featuredOnly = false }: { featuredOnly?: boolean }) {
  const supabase = await getSupabaseServerClient();

  let query = supabase
    .from("projects")
    .select("*")
    .order("featured", { ascending: false })
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (featuredOnly) query = query.eq("featured", true);

  const { data: projects, error } = await query;

  if (error) {
    // Shows up in the terminal running `npm run dev` (and in Vercel logs).
    console.error("[ProjectsSection] Supabase error:", error);
  }
  const isDev = process.env.NODE_ENV === "development";

  return (
    <section id="projects" className="relative mx-auto max-w-6xl scroll-mt-24 px-4 py-24 sm:px-6">
      <header className="mb-12 max-w-2xl">
        <p className="mb-3 font-mono text-sm uppercase tracking-[0.2em] text-red-500">
          Selected work
        </p>
        <h2 className="text-4xl font-semibold tracking-tight text-neutral-50 sm:text-5xl">
          Projects I&apos;ve built
        </h2>
      </header>

      {error ? (
        <p className="rounded-xl border border-red-500/30 bg-red-500/5 p-4 text-sm text-red-300">
          Couldn&apos;t load projects right now. Please try again later.
          {isDev && (
            <span className="mt-2 block font-mono text-xs text-red-200/80">
              {error.code ? `[${error.code}] ` : ""}
              {error.message}
              {error.hint ? ` — ${error.hint}` : ""}
            </span>
          )}
        </p>
      ) : !projects?.length ? (
        <p className="text-neutral-400">Projects coming soon.</p>
      ) : (
        <ProjectsGrid projects={projects} />
      )}
    </section>
  );
}
