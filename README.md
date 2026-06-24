# Ember & Oak — Restaurant Website

A fine dining restaurant website with table bookings, party enquiries, contact form, and admin dashboard.

## Project Structure

```
Ember-Oak/
├── index.html      ← All HTML pages (SPA with JS navigation)
├── style.css       ← All styles
├── script.js       ← All JavaScript (bookings, admin, routing)
├── vercel.json     ← Vercel deployment config
├── images/         ← Add your images here
└── README.md
```

## Deploy to Vercel via GitHub

### Step 1 — Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit — Ember & Oak website"
git remote add origin https://github.com/YOUR_USERNAME/ember-oak.git
git push -u origin main
```

### Step 2 — Deploy on Vercel
1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **Add New Project**
3. Import your `ember-oak` repository
4. Leave all settings as default (Vercel auto-detects static sites)
5. Click **Deploy** — your site will be live in ~30 seconds

### Step 3 — Connect Supabase (for real data persistence)

The site currently uses `localStorage` for bookings/messages. To upgrade to Supabase:

1. Create a project at [supabase.com](https://supabase.com)
2. Run this SQL in the Supabase SQL editor:

```sql
create table table_bookings (
  id text primary key,
  ref text,
  first_name text,
  last_name text,
  email text,
  phone text,
  date date,
  time text,
  guests text,
  occasion text,
  diet text,
  notes text,
  add_ons text[],
  status text default 'pending',
  created timestamptz default now()
);

create table party_bookings (
  id text primary key,
  ref text,
  first_name text,
  last_name text,
  email text,
  phone text,
  event_type text,
  date date,
  time text,
  guests text,
  budget text,
  diet text,
  notes text,
  add_ons text[],
  status text default 'pending',
  created timestamptz default now()
);

create table messages (
  id text primary key,
  name text,
  email text,
  subject text,
  message text,
  read boolean default false,
  created timestamptz default now()
);
```

3. Copy your **Project URL** and **anon key** from Supabase → Settings → API
4. Add the Supabase JS client to `index.html` (in `<head>`):
```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
```
5. Replace the `DB` object in `script.js` with Supabase calls
6. Add your keys as Vercel Environment Variables (Settings → Environment Variables):
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`

## Local Development

Just open `index.html` in a browser — no build step needed.

Or use a local server:
```bash
npx serve .
# or
python3 -m http.server 3000
```
