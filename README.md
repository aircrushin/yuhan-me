# aircrushin — personal portfolio

A TanStack Start (Vite + React 19) personal site with:

- A public marketing-style landing page (Hero, About, Skills, Projects, Experience, Blog, Contact).
- A `/projects` gallery driven by your **GitHub** repos (synced into Postgres so you can curate them).
- A `/blog` powered by markdown stored in the database.
- A **password-gated `/admin`** to toggle visibility, pin highlights, edit titles/covers, manage experience/skills/posts/profile, and read contact-form messages.
- i18n out of the box (`en` and `zh`) via Paraglide.

Everything persists in **Neon Postgres** through Drizzle ORM.

## Getting started

```bash
npm install
cp .env.example .env  # then fill it in
npm run db:push       # creates tables on your Neon DB
npm run db:seed       # writes a default profile row + initial skills/experience
npm run dev
```

Open <http://localhost:3000>.

### Required environment variables

| Name | Purpose |
| --- | --- |
| `DATABASE_URL` | Neon Postgres connection string |
| `ADMIN_PASSWORD` | Owner password for `/admin` |
| `ADMIN_SESSION_SECRET` | 32-byte random hex used to sign the admin cookie |

Optional:

| Name | Purpose |
| --- | --- |
| `GITHUB_TOKEN` | Bumps the GitHub API rate limit during admin "Sync now" |
| `RESEND_API_KEY`, `CONTACT_FORWARD_TO`, `CONTACT_FROM` | If set, the contact form forwards submissions by email |

## Using the admin panel

1. Visit `/admin/login` and paste your `ADMIN_PASSWORD`.
2. On the dashboard, click **Sync from GitHub** — it pages through `https://api.github.com/users/aircrushin/repos` and upserts every repo into the database. Your curation fields (`is_visible`, `is_pinned`, custom title/description/cover) are preserved across syncs.
3. Open **Projects** and toggle the repos you want shown publicly. Pin a few you're proud of, reorder with the arrows, and optionally override titles, descriptions, and cover images.
4. Edit your **Profile** (hero copy, location, social links).
5. Add timeline entries on **Experience**, manage your **Skills** chips, and write notes on **Blog**.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Vite dev server on port 3000 |
| `npm run build` | Production SSR build via Nitro |
| `npm run db:generate` | Generate a new Drizzle migration from `src/db/schema.ts` |
| `npm run db:push` | Push the schema to your Postgres |
| `npm run db:studio` | Open Drizzle Studio against your DB |
| `npm run db:seed` | Insert default profile / sample skills / experience |
| `npm run test` | Run the Vitest suite |

## Stack

- [TanStack Start](https://tanstack.com/start) (Vite + Nitro) for SSR + server functions
- [Tailwind 4](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com) (`new-york` style)
- [Drizzle ORM](https://orm.drizzle.team) on [Neon Postgres](https://neon.tech)
- [Paraglide JS](https://inlang.com/m/gerre34r/library-inlang-paraglideJs) for i18n
- [react-markdown](https://github.com/remarkjs/react-markdown) + remark-gfm for blog rendering

## Deployment

Build with `npm run build` and run `node dist/server/index.mjs` (Nitro produces a self-contained Node server). Vercel, Render, Fly.io, Railway, your own VPS — all fine. Just be sure the env vars above are set on the host.
