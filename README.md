## 🚀 Full-Stack Cloudflare SaaS kit

**_Build and deploy scalable products on Cloudflare with ease._**

An opinionated, batteries-included starter kit for quickly building and deploying SaaS products on Cloudflare.

### The stack includes:
- [Turborepo](https://turbo.build/) for monorepo management
- [Next.js](https://nextjs.org/) for frontend
- [TailwindCSS](https://tailwindcss.com/) for styling
- [Drizzle ORM](https://drizzle.org/) for database access
- [NextAuth](https://next-auth.js.org/) for authentication
- [Cloudflare D1](https://www.cloudflare.com/developer-platform/d1/) for serverless databases
- [Cloudflare Pages](https://pages.cloudflare.com/) for hosting
- [Biome](https://biomejs.dev/) for formatting and linting
- [ShadcnUI](https://shadcn.com/) as the component library

... while still being minimal and composable.

## Getting started

To use, simply clone this repo and run the following commands:

1. Make sure that you have [Wrangler](https://developers.cloudflare.com/workers/wrangler/install-and-update/#installupdate-wrangler) installed.

2. Run the following commands:
```
git clone https://github.com/Dhravya/cloudflare-saas-stack
cd cloudflare-saas-stack
npm i -g bun
bun install
bun run setup
```

That's it. You're ready to go! Next time, you can just run `bun run dev` and start developing.

When you're ready to deploy, run `bun run deploy` to deploy to Cloudflare.

### Manual setup

An automatic setup script is provided, but you can also manually set up the following:

1. Create a Cloudflare account and install the [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/#installupdate-wrangler).
2. Create a D1 database under "Workers and Pages" in the Cloudflare dashboard, or run ``bunx wrangler d1 create ${dbName}`
3. Create a `.dev.vars` file in `apps/web` with the following content (Get these from google developer console):
```
GOOGLE_CLIENT_ID=${your-google-client-id}
GOOGLE_CLIENT_SECRET=${your-google-client-secret}
NEXTAUTH_SECRET=${your-secret}
```
4. In `apps/web`, run this command to make migrations to setup auth with database: `bunx wrangler d1 execute ${dbName} --local --file=migrations/0000_setup.sql`. This creates a local version of the database and creates the appropriate tables.
5. Run remote migration for the production database - same command without `--local`: `bunx wrangler d1 execute ${dbName} --file=migrations/0000_setup.sql`
6. Bun `bun run dev` to start the development server.
7. Run `bun run deploy` to deploy to Cloudflare.
