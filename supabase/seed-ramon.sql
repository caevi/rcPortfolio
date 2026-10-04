-- =====================================================================
-- Seed data for Ramon Carlo Evidente's portfolio
-- Sources: github.com/caevi and LinkedIn (screenshots, Oct 2026).
-- Run in Supabase → SQL Editor AFTER schema.sql.
-- Safe to re-run, including if you already ran the earlier version:
-- it removes the dropped projects and never creates duplicates.
-- Everything here is editable later from /admin/dashboard.
-- =====================================================================

-- ---------- Profile ----------
update public.profile set
  full_name    = 'Ramon Carlo Evidente',
  headline     = 'Full Stack Developer',
  bio          = 'Software Engineering Technology graduate from Centennial College. I build full-stack web apps with React, Node.js, Spring Boot and .NET, ship to the cloud on Azure and AWS, and currently work as a Full Stack Developer and AI Prompt Engineer at Blockwork App.',
  location     = 'Toronto, Ontario',
  avatar_url   = 'https://avatars.githubusercontent.com/u/156107894?v=4',
  github_url   = 'https://github.com/caevi',
  linkedin_url = 'https://www.linkedin.com/in/ramon-evidente-368ab9229/'
where singleton;

-- ---------- Projects ----------
-- Remove the three projects you asked to drop (from the earlier seed).
delete from public.projects where github_url in (
  'https://github.com/caevi/trivia-game-react-app',
  'https://github.com/caevi/comp367-webapp',
  'https://github.com/caevi/ombd-crud'
);

insert into public.projects (title, description, tech_stack, github_url, live_url, featured, sort_order)
select v.title, v.description, v.tech_stack, v.github_url, v.live_url, v.featured, v.sort_order
from (values
  ('Blossom Notes',
   'A note-taking desktop app for macOS. Built with web technologies and packaged as a native app with Electron, distributed as a downloadable installer.',
   array['TypeScript','Electron','Vite'],
   'https://github.com/caevi/blossom-notes', null::text, true, 1),

  ('GameSphere — Game Database & Reviews',
   'Full-stack game discovery platform built by a team of four: browse and search a large game library, open detailed game pages, and save personal favourites, with Google Sign-In and login-aware navigation.',
   array['React','Node.js','Express','MongoDB Atlas','Google OAuth','Render'],
   'https://github.com/viernesviernes/COMP229-Game-Database-Review',
   'https://comp229f24-game-database.onrender.com/', true, 2),

  ('DJ Tooloud Website',
   'Full-stack website for a DJ business, with a React front end and an Express + MongoDB back end that sends booking inquiries by email.',
   array['React','Vite','React Router','Node.js','Express','MongoDB','Nodemailer'],
   'https://github.com/caevi/djtooloud-website', null, true, 3),

  ('Gym Tracker',
   'Workout tracking app built as a team project, with a C# .NET API, a separate core business-logic layer and a web client.',
   array['C#','.NET','REST API'],
   'https://github.com/caevi/COMP306-GymTracker-Application', null, true, 4)
) as v(title, description, tech_stack, github_url, live_url, featured, sort_order)
where not exists (select 1 from public.projects p where p.github_url = v.github_url);

-- Keep ordering correct if the earlier seed already inserted some of these.
update public.projects set sort_order = 3 where github_url = 'https://github.com/caevi/djtooloud-website';
update public.projects set sort_order = 4 where github_url = 'https://github.com/caevi/COMP306-GymTracker-Application';

-- Cover images (files in public/projects/, served at /projects/*.webp).
update public.projects set image_url = '/projects/blossom-notes.webp' where github_url = 'https://github.com/caevi/blossom-notes' and image_url is null;
update public.projects set image_url = '/projects/gamesphere.webp'    where github_url = 'https://github.com/viernesviernes/COMP229-Game-Database-Review' and image_url is null;
update public.projects set image_url = '/projects/dj-tooloud.webp'    where github_url = 'https://github.com/caevi/djtooloud-website' and image_url is null;
update public.projects set image_url = '/projects/gym-tracker.webp'   where github_url = 'https://github.com/caevi/COMP306-GymTracker-Application' and image_url is null;

-- ---------- Skills ----------
-- Proficiency left blank on purpose: set it in the dashboard if you want bars.
insert into public.skills (category, name, icon, sort_order) values
  ('Languages',    'TypeScript',   'typescript',  1),
  ('Languages',    'JavaScript',   'javascript',  2),
  ('Languages',    'Java',         'openjdk',     3),
  ('Languages',    'C#',           'dotnet',      4),
  ('Languages',    'SQL',          'postgresql',  5),
  ('Languages',    'HTML & CSS',   'html5',       6),

  ('Frontend',     'React',        'react',       1),
  ('Frontend',     'Next.js',      'nextdotjs',   2),
  ('Frontend',     'Tailwind CSS', 'tailwindcss', 3),
  ('Frontend',     'Vite',         'vite',        4),
  ('Frontend',     'Electron',     'electron',    5),

  ('Backend',      'Node.js',      'nodedotjs',   1),
  ('Backend',      'Express',      'express',     2),
  ('Backend',      'Spring Boot',  'springboot',  3),
  ('Backend',      '.NET',         'dotnet',      4),
  ('Backend',      'REST APIs',    null,          5),
  ('Backend',      'MongoDB',      'mongodb',     6),
  ('Backend',      'Supabase',     'supabase',    7),

  ('Cloud',        'Microsoft Azure', 'microsoftazure', 1),
  ('Cloud',        'AWS',          'amazonwebservices', 2),

  ('DevOps/Tools', 'Git & GitHub', 'github',      1),
  ('DevOps/Tools', 'Docker',       'docker',      2),
  ('DevOps/Tools', 'Jenkins',      'jenkins',     3),
  ('DevOps/Tools', 'Maven',        'apachemaven', 4),
  ('DevOps/Tools', 'Postman',      'postman',     5),

  ('IT & Support', 'Technical Support',     null, 1),
  ('IT & Support', 'System Administration', null, 2),
  ('IT & Support', 'Network Security',      null, 3),

  ('Other',        'AI Prompt Engineering', null, 1)
on conflict (category, name) do nothing;

-- ---------- Experience (from LinkedIn) ----------
-- No highlight bullets on LinkedIn yet: add 2–3 per role in the dashboard.
insert into public.experience (role, company, location, start_date, end_date, bullets, sort_order)
select v.role, v.company, v.location, v.start_date::date, v.end_date::date, '{}'::text[], v.sort_order
from (values
  ('Full Stack Developer / AI Prompt Engineer', 'Blockwork App', 'Remote · On-call',        '2026-10-01', null::text,   1),
  ('Assistant Manager',                        'TELUS',         'Toronto, Ontario',        '2026-09-01', null,         2),
  ('Wireless Sales Consultant & Keyholder',    'TELUS',         'Toronto, Ontario',        '2026-06-01', '2026-09-01', 3)
) as v(role, company, location, start_date, end_date, sort_order)
where not exists (
  select 1 from public.experience e where e.role = v.role and e.company = v.company
);

-- ---------- Education (from LinkedIn) ----------
insert into public.education_and_certifications (type, title, institution, issue_date, description, sort_order)
select 'education', 'Software Engineering Technology (Ontario College Advanced Diploma)', 'Centennial College', '2026-04-01',
       'Sep 2023 – Apr 2026. Coursework included full-stack MERN development (COMP 229), cloud and .NET application development (COMP 306) and DevOps / agile practices with Jenkins and Docker (COMP 367).', 1
where not exists (
  select 1 from public.education_and_certifications
  where type = 'education' and institution = 'Centennial College'
);

-- Upgrade the placeholder education row from the earlier seed, if present.
update public.education_and_certifications set
  title       = 'Software Engineering Technology (Ontario College Advanced Diploma)',
  issue_date  = '2026-04-01',
  description = 'Sep 2023 – Apr 2026. Coursework included full-stack MERN development (COMP 229), cloud and .NET application development (COMP 306) and DevOps / agile practices with Jenkins and Docker (COMP 367).'
where type = 'education' and institution = 'Centennial College' and title = 'Software Engineering';

-- ---------- Certifications (from LinkedIn) ----------
-- Credential links are behind LinkedIn's "Show credential" buttons:
-- paste them into the dashboard (Certifications → Edit → Credential URL).
insert into public.education_and_certifications (type, title, institution, issue_date, description, sort_order)
select 'certification', v.title, v.institution, v.issue_date::date, v.description, v.sort_order
from (values
  ('IT Customer Support Basics', 'Cisco', '2026-10-01',
   'Technical support and information technology fundamentals.', 1),
  ('Career Essentials in System Administration', 'Microsoft & LinkedIn', '2026-10-01',
   'System administration and network security fundamentals.', 2)
) as v(title, institution, issue_date, description, sort_order)
where not exists (
  select 1 from public.education_and_certifications c
  where c.type = 'certification' and c.title = v.title
);
