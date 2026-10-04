// Hand-written to match supabase/schema.sql.
// You can regenerate an equivalent file any time with:
//   npx supabase gen types typescript --project-id <your-project-ref> > lib/database.types.ts

type Timestamps = { created_at: string; updated_at: string };

export type Profile = Timestamps & {
  id: string;
  singleton: boolean;
  full_name: string;
  headline: string | null;
  bio: string | null;
  avatar_url: string | null;
  location: string | null;
  email: string | null;
  resume_url: string | null;
  github_url: string | null;
  linkedin_url: string | null;
  twitter_url: string | null;
  website_url: string | null;
};

export type Skill = Timestamps & {
  id: string;
  category: string;
  name: string;
  icon: string | null;
  proficiency: number | null;
  sort_order: number;
};

export type Project = Timestamps & {
  id: string;
  title: string;
  description: string | null;
  tech_stack: string[];
  github_url: string | null;
  live_url: string | null;
  image_url: string | null;
  featured: boolean;
  sort_order: number;
};

export type Experience = Timestamps & {
  id: string;
  role: string;
  company: string;
  company_url: string | null;
  location: string | null;
  start_date: string;
  end_date: string | null;
  bullets: string[];
  sort_order: number;
};

export type EducationOrCert = Timestamps & {
  id: string;
  type: "education" | "certification";
  title: string;
  institution: string;
  issue_date: string | null;
  credential_url: string | null;
  description: string | null;
  sort_order: number;
};

type Generated = "id" | "created_at" | "updated_at";
type Insert<T> = Omit<Partial<T>, Generated>;

type TableDef<Row, Req extends keyof Row> = {
  Row: Row;
  Insert: Insert<Row> & Pick<Row, Req>;
  Update: Insert<Row>;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      admins: {
        Row: { user_id: string; created_at: string };
        Insert: { user_id: string; created_at?: string };
        Update: { user_id?: string; created_at?: string };
        Relationships: [];
      };
      profile: TableDef<Profile, never>;
      skills: TableDef<Skill, "name">;
      projects: TableDef<Project, "title">;
      experience: TableDef<Experience, "role" | "company" | "start_date">;
      education_and_certifications: TableDef<EducationOrCert, "type" | "title" | "institution">;
    };
    Views: { [_ in never]: never };
    Functions: {
      is_admin: { Args: Record<string, never>; Returns: boolean };
    };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};

export type TableName = keyof Database["public"]["Tables"];
