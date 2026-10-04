# Portfolio + Admin Dashboard — Setup

Next.js (App Router) · Tailwind CSS · Framer Motion · Supabase

## 1. Create the Supabase project

1. Go to <https://supabase.com/dashboard> → **New project**. Pick a region near your visitors and save the database password somewhere safe.
2. Open **SQL Editor → New query**, paste the whole of `supabase/schema.sql`, and click **Run**. This creates:
   - the five content tables (`profile`, `skills`, `projects`, `experience`, `education_and_certifications`)
   - an `admins` allow-list table and an `is_admin()` function
   - RLS policies: anyone can **read**; only signed-in users listed in `admins` can **insert / update / delete**
   - a public `portfolio` storage bucket (resume PDF, avatar) that only admins can write to
3. **Turn off public sign-ups** so nobody else can create an account: **Authentication → Sign In / Providers → Email** → disable **Allow new users to sign up** (keep the Email provider itself enabled).
4. **Create your admin user**: **Authentication → Users → Add user → Create new user**, enter your email and a strong password, tick **Auto Confirm User**.
5. **Grant that user admin rights** — run in the SQL Editor (use your email):

   ```sql
   insert into public.admins (user_id)
   select id from auth.users where email = 'you@example.com';
   ```

   Without this row the account can sign in but every write is rejected by RLS. That's the point: being authenticated isn't enough.

6. Copy your keys from **Project Settings → API**: the **Project URL** and the **anon / public** key.

## 2. Create the Next.js app

```bash
npx create-next-app@latest portfolio --typescript --tailwind --eslint --app --no-src-dir --import-alias "@/*"
cd portfolio
npm install @supabase/supabase-js @supabase/ssr framer-motion server-only
```

Copy the starter files into the project root, keeping the folder structure (`app/`, `components/`, `lib/`, `middleware.ts`, `supabase/`). Let them overwrite `app/layout.tsx`, `app/page.tsx` and `app/globals.css`.

> The code targets Next.js 15 (async `cookies()`); it also runs on 14. `globals.css` uses Tailwind v4 syntax, which `create-next-app` installs by default — on Tailwind v3 use the `@tailwind base/components/utilities` directives instead.

## 3. Connect your Supabase credentials

```bash
cp .env.local.example .env.local
```

Fill in the two values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
```

The anon key is meant to be public — RLS is what protects your data. **Never** put the `service_role` key in a `NEXT_PUBLIC_` variable or commit it.

## 4. Run it

```bash
npm run dev
```

- <http://localhost:3000> — the public portfolio
- <http://localhost:3000/admin/login> — sign in with the admin user from step 1.4
- After signing in you land on `/admin/dashboard`. Fill in **Profile** first, then add projects, skills, experience, education and certifications.

Edits appear on the homepage on the next page load (the homepage renders dynamically).

## 5. Optional: regenerate DB types

`lib/database.types.ts` is hand-written to match the schema. If you change the schema, regenerate it:

```bash
npx supabase login
npx supabase gen types typescript --project-id YOUR-PROJECT-REF > lib/database.types.ts
```

## 6. Deploy (Vercel)

1. Push to GitHub and import the repo at <https://vercel.com/new>.
2. Add the same two environment variables in **Project → Settings → Environment Variables**.
3. In Supabase **Authentication → URL Configuration**, set **Site URL** to your production URL.

## How the security fits together

| Layer | What it does |
| --- | --- |
| **RLS + `is_admin()`** (database) | The real boundary. Public `SELECT`; writes require `auth.uid()` to be in `admins`. Applies to every request, including direct API calls with the anon key. |
| **Sign-ups disabled** | No one can create an account to try their luck. |
| `middleware.ts` | Refreshes the auth cookie and redirects signed-out visitors away from `/admin/*`. UX only. |
| `app/admin/dashboard/page.tsx` | Server-side check that the user is signed in **and** an admin before rendering the dashboard. |

## File map

```
supabase/schema.sql                    tables, RLS, storage bucket, seed
lib/supabaseClient.ts                  browser client (Client Components)
lib/supabaseServer.ts                  server client + getAdminUser()
lib/database.types.ts                  typed rows for all tables
lib/techBadge.ts                       dynamic colours for tech badges
middleware.ts                          session refresh + /admin guard
components/projects/ProjectsSection    server fetch of projects
components/projects/ProjectsGrid       animated tech filter + grid
components/projects/ProjectCard        tilt/spotlight card with badges & links
app/admin/login/page.tsx               email/password sign-in
app/admin/dashboard/page.tsx           admin-gated dashboard route
components/admin/AdminDashboard        sidebar shell + toasts
components/admin/ResourceManager       generic list/create/edit/delete
components/admin/ProfileEditor         profile form + resume/avatar upload
components/admin/resources.ts          field config per table (add fields here)
```

To add a field later (say, `projects.year`): add the column in SQL, add it to the type in `lib/database.types.ts`, and add one line to that resource's `fields` array in `components/admin/resources.ts`. The form, list and save logic pick it up automatically.
