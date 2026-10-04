-- Attach cover images to the seeded projects.
-- The image files live in your Next.js project at public/projects/*.webp,
-- so the site serves them at /projects/<name>.webp.
-- Run in Supabase → SQL Editor. Safe to re-run.

update public.projects set image_url = '/projects/blossom-notes.webp'
  where github_url = 'https://github.com/caevi/blossom-notes';

update public.projects set image_url = '/projects/gamesphere.webp'
  where github_url = 'https://github.com/viernesviernes/COMP229-Game-Database-Review';

update public.projects set image_url = '/projects/dj-tooloud.webp'
  where github_url = 'https://github.com/caevi/djtooloud-website';

update public.projects set image_url = '/projects/gym-tracker.webp'
  where github_url = 'https://github.com/caevi/COMP306-GymTracker-Application';

select title, image_url from public.projects order by sort_order;
