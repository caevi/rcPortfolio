import "server-only";

import { getSupabaseServerClient } from "./supabaseServer";
import type { EducationOrCert, Experience, Profile, Skill } from "./database.types";

/**
 * Loads everything the homepage needs (except projects, which
 * ProjectsSection fetches itself) in parallel. Each part fails
 * independently so one bad query doesn't blank the whole page.
 */
export async function getPortfolio() {
  const supabase = await getSupabaseServerClient();

  const [profile, skills, experience, eduCerts] = await Promise.all([
    supabase.from("profile").select("*").maybeSingle(),
    supabase.from("skills").select("*").order("category").order("sort_order"),
    supabase.from("experience").select("*").order("start_date", { ascending: false }),
    supabase
      .from("education_and_certifications")
      .select("*")
      .order("issue_date", { ascending: false, nullsFirst: false }),
  ]);

  for (const [name, res] of Object.entries({ profile, skills, experience, eduCerts })) {
    if (res.error) console.error(`[getPortfolio] ${name}:`, res.error);
  }

  return {
    profile: (profile.data ?? null) as Profile | null,
    skills: (skills.data ?? []) as Skill[],
    experience: (experience.data ?? []) as Experience[],
    eduCerts: (eduCerts.data ?? []) as EducationOrCert[],
  };
}
