# A Little Adventure — Treasure Form

A mobile-friendly, multi-page HTML/CSS/JavaScript form using GitHub Pages for hosting and Supabase PostgreSQL for response storage.

## Files

- `index.html` — page content and form structure
- `style.css` — parchment / treasure-map styling and responsive layout
- `script.js` — page navigation, validation, button interactions, and Supabase inserts
- `supabase-config.js` — your Supabase Project URL and publishable key (placeholders initially)
- `database-setup.sql` — SQL schema and Row Level Security policy used by this form

## 1. Configure Supabase

Open `supabase-config.js` and replace:

- `SUPABASE_URL` is pre-filled from the project URL visible in your Supabase dashboard screenshot. Check that it matches your project.
- `YOUR_SUPABASE_PUBLISHABLE_KEY` with the `sb_publishable_...` key from Project Settings → API Keys

Do not put an `sb_secret_...` key or a `service_role` key in this file. GitHub Pages serves browser files publicly.

The page loads `@supabase/supabase-js` v2 from jsDelivr. No npm install or framework is required.

## 2. Database table and permissions

The `database-setup.sql` file creates `public.form_responses` and allows anonymous inserts only. Row Level Security is enabled. The public browser role is not granted SELECT, UPDATE, or DELETE access by this script.

Run the SQL in the Supabase SQL Editor if you have not already created the table. If the table already exists from the earlier setup, do not needlessly run schema changes; compare it with this file first. The current website expects these columns:

- `full_name` (text, required)
- `recent_days` (text, nullable)
- `invitation_choice` (text: `yes`, `interested`, or `no`)
- `transport_choice` (text: `pickup`, `meet_there`, or null)
- `work_finish_time` (time, nullable)
- `preferred_meeting_time` (time, nullable)
- `interested_reason` (text, nullable)
- `submitted_at` (timestamptz, default now)

If Supabase reports that the table is not exposed through the Data API, open Project Settings → API / Data API and ensure `public` is an exposed schema and `form_responses` is available to the Data API. Keep RLS enabled and retain the least-privilege grants/policy in the SQL file.

## 3. Preview locally

For a quick preview, open `index.html` in a browser. Some browser security settings may limit scripts on `file://`; a local static server is more reliable. For example, with Python installed, open a terminal in this folder and run:

```bash
python -m http.server 8000
```

Then visit `http://localhost:8000`.

You can preview the page flow before configuring Supabase, but responses will not be stored until the URL and publishable key are configured and the database policy is working.

## 4. Publish with GitHub Pages

1. Create a public GitHub repository, for example `treasure-form`.
2. Upload all files from this folder to the repository root (not the parent folder).
3. Open repository Settings → Pages.
4. Under Build and deployment, choose `Deploy from a branch`.
5. Choose branch `main` and folder `/ (root)`, then save.
6. Wait for deployment. The site URL will be `https://YOUR-USERNAME.github.io/treasure-form/`.

## Form flow included

1. Welcome page: Proceed or a playful No button. The No button moves twice; the third click ends this path.
2. Apology note with only a next arrow.
3. Full name.
4. “How have your days been lately?” text response.
5. Friday dinner invitation (Friday, 27 November 2026).
6. If Yes: choose pick-up or meet there.
7. Pick-up and meet-there go to separate pages with separate time fields.
8. “I'm interested, but...” opens a reason text box.
9. Invitation “No” opens a playful confirmation with a crying emoji; choosing “No, I'm sure” confirms the response and ends with a thank-you message. “Let me think again” closes the confirmation and returns to the invitation.

## Privacy and security notes

- The site tells visitors that answers are stored for the form owner to review.
- The public browser key is visible in the deployed site by design. Security depends on the RLS policy and database grants, not hiding that key.
- This setup allows public submissions but does not let anonymous visitors read other responses.
- View responses through the Supabase Table Editor. A private web admin dashboard would require a separate authenticated admin flow and policies; it is not included in this first version.
- Do not collect sensitive personal information in a public form unless there is a clear need and appropriate safeguards.
