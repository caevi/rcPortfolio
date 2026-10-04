"use client";

import { motion } from "framer-motion";
import type { Profile } from "@/lib/database.types";

export function Footer({ profile }: { profile: Profile | null }) {
  const links = [
    profile?.email && { label: "Email", href: `mailto:${profile.email}`, icon: <MailIcon /> },
    profile?.github_url && { label: "GitHub", href: profile.github_url, icon: <GitHubIcon /> },
    profile?.linkedin_url && { label: "LinkedIn", href: profile.linkedin_url, icon: <LinkedInIcon /> },
    profile?.twitter_url && { label: "X", href: profile.twitter_url, icon: <XIcon /> },
    profile?.website_url && { label: "Website", href: profile.website_url, icon: <GlobeIcon /> },
  ].filter(Boolean) as { label: string; href: string; icon: React.ReactNode }[];

  const primary = profile?.email ? `mailto:${profile.email}` : profile?.linkedin_url;

  return (
    <footer id="contact" className="relative mt-12 scroll-mt-24 overflow-hidden border-t border-neutral-800">
      <div aria-hidden className="absolute -bottom-40 left-1/2 h-80 w-[40rem] -translate-x-1/2 rounded-full bg-red-600/10 blur-[100px]" />

      <div className="relative mx-auto max-w-6xl px-4 py-24 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-3xl"
        >
          <p className="mb-3 font-mono text-sm uppercase tracking-[0.2em] text-red-500">Contact</p>
          <h2 className="text-4xl font-semibold tracking-tight text-neutral-50 sm:text-6xl">
            Let&apos;s build something <span className="text-red-400">together.</span>
          </h2>
          <p className="mt-5 max-w-xl text-lg text-neutral-400">
            Open to full-time roles, freelance work and interesting side projects. The fastest way to reach me is below.
          </p>

          {primary && (
            <motion.a
              href={primary}
              {...(primary.startsWith("mailto:") ? {} : { target: "_blank", rel: "noopener noreferrer" })}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-red-600 px-6 py-3.5 font-medium text-white transition-colors hover:bg-red-500"
            >
              {profile?.email ? `Say hi — ${profile.email}` : "Message me on LinkedIn"}
            </motion.a>
          )}
        </motion.div>

        <div className="mt-20 flex flex-col-reverse items-start justify-between gap-6 border-t border-neutral-800/80 pt-8 sm:flex-row sm:items-center">
          <p className="text-sm text-neutral-500">
            © {new Date().getFullYear()} {profile?.full_name || ""}. Built with Next.js, Supabase & Framer Motion.
          </p>
          <ul className="flex gap-2">
            {links.map((l) => (
              <li key={l.label}>
                <motion.a
                  href={l.href}
                  {...(l.href.startsWith("mailto:") ? {} : { target: "_blank", rel: "noopener noreferrer" })}
                  aria-label={l.label}
                  title={l.label}
                  whileHover={{ y: -3 }}
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-neutral-800 text-neutral-400 transition-colors hover:border-red-500/50 hover:text-red-400"
                >
                  {l.icon}
                </motion.a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}

const iconCls = "h-[18px] w-[18px]";

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" className={iconCls} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" className={iconCls} fill="currentColor" aria-hidden>
      <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.42-2.69 5.39-5.26 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z" />
    </svg>
  );
}
function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" className={iconCls} fill="currentColor" aria-hidden>
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.36V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z" />
    </svg>
  );
}
function XIcon() {
  return (
    <svg viewBox="0 0 24 24" className={iconCls} fill="currentColor" aria-hidden>
      <path d="M18.24 2.25h3.31l-7.23 8.26 8.5 11.24h-6.66l-5.21-6.82-5.97 6.82H1.67l7.73-8.84L1.25 2.25h6.83l4.71 6.23 5.45-6.23Zm-1.16 17.52h1.83L7.08 4.13H5.12l11.96 15.64Z" />
    </svg>
  );
}
function GlobeIcon() {
  return (
    <svg viewBox="0 0 24 24" className={iconCls} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
    </svg>
  );
}
