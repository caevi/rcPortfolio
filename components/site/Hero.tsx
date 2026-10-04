"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { Profile } from "@/lib/database.types";
import { RcLogo3D } from "./RcLogo3D";

const ease = [0.22, 1, 0.36, 1] as const;

export function Hero({ profile }: { profile: Profile | null }) {
  const reduce = useReducedMotion();
  const name = profile?.full_name || "Your Name";
  const [first, ...rest] = name.split(" ");
  const words = (profile?.bio ?? "").split(/\s+/).filter(Boolean);

  const container: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: reduce ? 0 : 0.08, delayChildren: 0.1 } },
  };
  const item: Variants = {
    hidden: { opacity: 0, y: reduce ? 0 : 24 },
    show: { opacity: 1, y: 0, transition: { duration: 0.7, ease } },
  };

  const contactHref = profile?.email ? `mailto:${profile.email}` : "#contact";

  return (
    <section id="top" className="relative isolate flex min-h-dvh items-center overflow-hidden pt-16">
      {/* Background: faint grid + drifting glow */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 opacity-[0.15] [background-image:linear-gradient(to_right,#404040_1px,transparent_1px),linear-gradient(to_bottom,#404040_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]"
      />
      <motion.div
        aria-hidden
        className="absolute left-1/2 top-1/3 -z-10 h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-red-700/25 blur-[140px]"
        animate={reduce ? undefined : { x: ["-60%", "-40%", "-60%"], y: ["-10%", "10%", "-10%"] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="mx-auto grid w-full max-w-6xl items-center gap-6 px-4 py-16 sm:px-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-10 lg:py-20"
      >
        {/* 3D RC logo: above the name on mobile, beside it on desktop */}
        <motion.div
          variants={{
            hidden: { opacity: 0, scale: reduce ? 1 : 0.85, filter: reduce ? "none" : "blur(10px)" },
            show: { opacity: 1, scale: 1, filter: "blur(0px)", transition: { duration: 1.1, ease } },
          }}
          className="order-first -mx-4 flex justify-center lg:order-last lg:mx-0"
        >
          <RcLogo3D className="h-[230px] w-[260px] sm:h-[300px] sm:w-[340px] lg:h-[440px] lg:w-[480px]" />
        </motion.div>

        <div className="min-w-0">
        <motion.div variants={item} className="mb-8 flex items-center gap-4">
          {profile?.avatar_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.avatar_url}
              alt={name}
              className="h-14 w-14 rounded-full object-cover ring-2 ring-red-500/40 ring-offset-4 ring-offset-black"
            />
          )}
          <span className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/5 px-3 py-1 font-mono text-xs uppercase tracking-[0.18em] text-red-400">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-600 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-red-600" />
            </span>
            {profile?.location || "Open to opportunities"}
          </span>
        </motion.div>

        <motion.h1
          variants={item}
          className="text-[clamp(3rem,10vw,8rem)] font-semibold lg:text-[6.5rem] leading-[0.9] tracking-[-0.04em] text-neutral-50"
        >
          {first}
          {rest.length > 0 && (
            <>
              <br />
              <span className="bg-gradient-to-r from-red-500 via-red-600 to-red-700 bg-clip-text text-transparent">
                {rest.join(" ")}
              </span>
            </>
          )}
        </motion.h1>

        {profile?.headline && (
          <motion.p variants={item} className="mt-6 font-mono text-lg text-neutral-300 sm:text-xl">
            <span className="text-red-500">~/</span> {profile.headline}
          </motion.p>
        )}

        {words.length > 0 && (
          <motion.p
            className="mt-6 max-w-2xl text-lg leading-relaxed text-neutral-400"
            variants={{ hidden: {}, show: { transition: { staggerChildren: reduce ? 0 : 0.02, delayChildren: 0.5 } } }}
          >
            {words.map((w, i) => (
              <motion.span
                key={i}
                className="inline-block"
                variants={{
                  hidden: { opacity: 0, y: reduce ? 0 : 8, filter: reduce ? "none" : "blur(4px)" },
                  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.4 } },
                }}
              >
                {w}&nbsp;
              </motion.span>
            ))}
          </motion.p>
        )}

        <motion.div variants={item} className="mt-10 flex flex-wrap gap-3">
          {profile?.resume_url && (
            <CTA href={profile.resume_url} primary external>
              Resume <Arrow />
            </CTA>
          )}
          <CTA href={contactHref} primary={!profile?.resume_url}>
            Contact me
          </CTA>
          {profile?.github_url && (
            <CTA href={profile.github_url} external>
              GitHub
            </CTA>
          )}
          {profile?.linkedin_url && (
            <CTA href={profile.linkedin_url} external>
              LinkedIn
            </CTA>
          )}
        </motion.div>
        </div>
      </motion.div>

      <motion.a
        href="#skills"
        aria-label="Scroll to skills"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-neutral-500 hover:text-neutral-200"
        animate={reduce ? undefined : { y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </motion.a>
    </section>
  );
}

function CTA({
  href,
  children,
  primary,
  external,
}: {
  href: string;
  children: React.ReactNode;
  primary?: boolean;
  external?: boolean;
}) {
  return (
    <motion.a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.97 }}
      className={`group inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 ${
        primary
          ? "bg-red-600 text-white hover:bg-red-500"
          : "border border-neutral-700 text-neutral-200 hover:border-neutral-500 hover:text-white"
      }`}
    >
      {children}
    </motion.a>
  );
}

function Arrow() {
  return (
    <svg aria-hidden viewBox="0 0 16 16" className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 12 12 4M6 4h6v6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
