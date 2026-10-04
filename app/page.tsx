import { getPortfolio } from "@/lib/getPortfolio";
import { Navbar } from "@/components/site/Navbar";
import { Hero } from "@/components/site/Hero";
import { SkillsSection } from "@/components/site/SkillsSection";
import { Timeline } from "@/components/site/Timeline";
import { ProjectsSection } from "@/components/projects/ProjectsSection";
import { Footer } from "@/components/site/Footer";

// Content comes from Supabase on each request, so admin edits show up immediately.
// For a mostly-static site, swap this for `export const revalidate = 60`.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { profile, skills, experience, eduCerts } = await getPortfolio();

  return (
    <>
      <Navbar name={profile?.full_name ?? ""} />
      <main>
        <Hero profile={profile} />
        <SkillsSection skills={skills} />
        <Timeline experience={experience} eduCerts={eduCerts} />
        <ProjectsSection />
      </main>
      <Footer profile={profile} />
    </>
  );
}
