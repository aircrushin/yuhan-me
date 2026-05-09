# Repository Guidelines

## Project Structure & Module Organization

This is a TanStack Start portfolio app built with Vite, React 19, Tailwind 4, Drizzle ORM, and Paraglide i18n. Public and admin routes live in `src/routes`; route file names map to URLs, such as `projects.tsx` and `admin/_app/blog/$id.tsx`. Shared UI is split between `src/components/site`, `src/components/admin`, and `src/components/ui`. Database code is in `src/db`: `schema.ts`, `migrations`, and `seed.ts`. Server helpers live in `src/server`, utilities in `src/lib`, localized strings in `messages`, and static assets in `public`.

## Build, Test, and Development Commands

- `pnpm install`: install dependencies from `package-lock.json`.
- `pnpm run dev`: start the Vite dev server on `http://localhost:3000`.
- `pnpm run build`: create the production SSR/Nitro build.
- `pnpm run test`: run the Vitest suite.
- `pnpm run db:generate`: generate Drizzle migrations from `src/db/schema.ts`.
- `pnpm run db:push`: apply schema changes to the configured Postgres database.
- `pnpm run db:seed`: seed default profile, skills, and experience using `.env`.

## Coding Style & Naming Conventions

Use TypeScript and React function components. Follow the existing style: two-space indentation, single quotes, no semicolons, and named exports. Prefer `#/` or `@/` aliases over long relative imports. Component files use PascalCase (`Hero.tsx`), route files follow TanStack Router conventions, and utilities use descriptive lower-case names. Keep shadcn primitives in `src/components/ui`.

## Testing Guidelines

Vitest is configured, but there are currently few or no committed tests. Add tests near the code they cover using `*.test.ts` or `*.test.tsx`. Use React Testing Library for component behavior and prioritize admin mutations, auth/session logic, i18n fallbacks, and database helpers. Run `pnpm run test` before a PR; run `pnpm run build` when touching routes, server functions, or database code.

## Commit & Pull Request Guidelines

Recent history uses short imperative summaries, sometimes with a conventional prefix such as `feat:`. Keep commits focused, for example `feat: add project visibility controls` or `fix: handle missing profile copy`. PRs should include a summary, testing notes, linked issues when relevant, and screenshots for visible UI changes. Call out database migrations, new environment variables, and changes to admin auth or public rendering.

## Security & Configuration Tips

Do not commit `.env` or secrets. Required variables include `DATABASE_URL`, `ADMIN_PASSWORD`, and `ADMIN_SESSION_SECRET`; optional email and GitHub settings are documented in `README.md`. Treat migrations as reviewed artifacts: inspect generated SQL before applying it to shared or production databases.
