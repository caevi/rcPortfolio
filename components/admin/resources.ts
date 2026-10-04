import type { Database } from "@/lib/database.types";

export type FieldType =
  | "text"
  | "textarea"
  | "url"
  | "email"
  | "number"
  | "date"
  | "checkbox"
  | "select"
  | "image" // URL field with upload-to-Storage button and preview
  | "tags" // text[] edited as comma-separated chips
  | "lines"; // text[] edited one item per line (bullet points)

export type Field = {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  help?: string;
  options?: { value: string; label: string }[];
  min?: number;
  max?: number;
  /** Span both columns of the form grid. */
  wide?: boolean;
};

export type ListTable = Exclude<keyof Database["public"]["Tables"], "admins" | "profile">;

export type Resource = {
  key: string;
  label: string;
  table: ListTable;
  singular: string;
  fields: Field[];
  /** Fixed values merged into every insert and used to filter the list. */
  scope?: Record<string, string>;
  orderBy: { column: string; ascending: boolean }[];
  /** Short summary for the list row. */
  summary: (row: Record<string, unknown>) => { title: string; subtitle?: string; tags?: string[] };
};

const SKILL_CATEGORIES = [
  "Frontend",
  "Backend",
  "Languages",
  "Cloud",
  "DevOps/Tools",
  "IT & Support",
  "Other",
].map((c) => ({
  value: c,
  label: c,
}));

const order = (...cols: string[]) => cols.map((c) => ({ column: c, ascending: c !== "start_date" && c !== "issue_date" }));

const fmtDate = (d: unknown) =>
  typeof d === "string" && d
    ? new Date(d + "T00:00:00").toLocaleDateString(undefined, { month: "short", year: "numeric" })
    : "";

export const RESOURCES: Resource[] = [
  {
    key: "projects",
    label: "Projects",
    table: "projects",
    singular: "project",
    orderBy: order("sort_order"),
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "sort_order", label: "Order", type: "number", help: "Lower numbers appear first." },
      { name: "description", label: "Description", type: "textarea", wide: true },
      { name: "tech_stack", label: "Tech stack", type: "tags", placeholder: "React, Supabase, Tailwind", wide: true },
      { name: "github_url", label: "GitHub URL", type: "url", placeholder: "https://github.com/…" },
      { name: "live_url", label: "Live demo URL", type: "url", placeholder: "https://…" },
      {
        name: "image_url",
        label: "Cover image",
        type: "image",
        wide: true,
        help: "Screenshot or logo, ideally 16:9 (e.g. 1200×675). Upload a file or paste a URL.",
      },
      { name: "featured", label: "Featured on homepage", type: "checkbox" },
    ],
    summary: (r) => ({
      title: String(r.title),
      subtitle: r.featured ? "★ Featured" : undefined,
      tags: r.tech_stack as string[],
    }),
  },
  {
    key: "skills",
    label: "Skills",
    table: "skills",
    singular: "skill",
    orderBy: order("category", "sort_order"),
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "category", label: "Category", type: "select", required: true, options: SKILL_CATEGORIES },
      { name: "icon", label: "Icon", type: "text", placeholder: "react, ⚛️ or https://…", help: "Simple Icons slug, emoji or image URL." },
      { name: "proficiency", label: "Proficiency (0–100)", type: "number", min: 0, max: 100 },
      { name: "sort_order", label: "Order", type: "number" },
    ],
    summary: (r) => ({
      title: `${r.icon && String(r.icon).length <= 2 ? r.icon + " " : ""}${r.name}`,
      subtitle: [r.category, r.proficiency != null ? `${r.proficiency}%` : null].filter(Boolean).join(" · "),
    }),
  },
  {
    key: "experience",
    label: "Experience",
    table: "experience",
    singular: "role",
    orderBy: order("sort_order", "start_date"),
    fields: [
      { name: "role", label: "Role", type: "text", required: true },
      { name: "company", label: "Company", type: "text", required: true },
      { name: "start_date", label: "Start date", type: "date", required: true },
      { name: "end_date", label: "End date", type: "date", help: "Leave empty if this is your current role." },
      { name: "location", label: "Location", type: "text" },
      { name: "company_url", label: "Company URL", type: "url" },
      { name: "bullets", label: "Highlights", type: "lines", help: "One bullet point per line.", wide: true },
      { name: "sort_order", label: "Order", type: "number" },
    ],
    summary: (r) => ({
      title: `${r.role} · ${r.company}`,
      subtitle: `${fmtDate(r.start_date)} – ${r.end_date ? fmtDate(r.end_date) : "Present"}`,
    }),
  },
  {
    key: "education",
    label: "Education",
    table: "education_and_certifications",
    singular: "education entry",
    scope: { type: "education" },
    orderBy: order("sort_order", "issue_date"),
    fields: [
      { name: "title", label: "Degree / program", type: "text", required: true },
      { name: "institution", label: "Institution", type: "text", required: true },
      { name: "issue_date", label: "Completion date", type: "date" },
      { name: "credential_url", label: "Link", type: "url" },
      { name: "description", label: "Description", type: "textarea", wide: true },
      { name: "sort_order", label: "Order", type: "number" },
    ],
    summary: (r) => ({ title: String(r.title), subtitle: [r.institution, fmtDate(r.issue_date)].filter(Boolean).join(" · ") }),
  },
  {
    key: "certifications",
    label: "Certifications",
    table: "education_and_certifications",
    singular: "certification",
    scope: { type: "certification" },
    orderBy: order("sort_order", "issue_date"),
    fields: [
      { name: "title", label: "Certification", type: "text", required: true },
      { name: "institution", label: "Issuer", type: "text", required: true },
      { name: "issue_date", label: "Issue date", type: "date" },
      { name: "credential_url", label: "Credential URL", type: "url" },
      { name: "description", label: "Description", type: "textarea", wide: true },
      { name: "sort_order", label: "Order", type: "number" },
    ],
    summary: (r) => ({ title: String(r.title), subtitle: [r.institution, fmtDate(r.issue_date)].filter(Boolean).join(" · ") }),
  },
];

export const PROFILE_FIELDS: Field[] = [
  { name: "full_name", label: "Full name", type: "text", required: true },
  { name: "headline", label: "Headline", type: "text", placeholder: "Full-stack engineer" },
  { name: "bio", label: "Bio", type: "textarea", wide: true },
  { name: "location", label: "Location", type: "text" },
  { name: "email", label: "Contact email", type: "email" },
  { name: "avatar_url", label: "Avatar URL", type: "url" },
  { name: "resume_url", label: "Resume URL", type: "url", help: "Upload below or paste a link." },
  { name: "github_url", label: "GitHub", type: "url" },
  { name: "linkedin_url", label: "LinkedIn", type: "url" },
  { name: "twitter_url", label: "X / Twitter", type: "url" },
  { name: "website_url", label: "Website", type: "url" },
];
