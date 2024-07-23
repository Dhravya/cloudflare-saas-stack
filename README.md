## 🚀 Full-Stack Cloudflare SaaS kit

**_Build and deploy scalable products on Cloudflare with ease._**

An opinionated, batteries-included starter kit for quickly building and deploying SaaS products on Cloudflare.

This is the same stack I used to build [Supermemory.ai](https://Supermemory.ai) which is open source at [git.new/memory](https://git.new/memory)

### The stack includes:
- [Turborepo](https://turbo.build/) for monorepo management
- [Next.js](https://nextjs.org/) for frontend
- [TailwindCSS](https://tailwindcss.com/) for styling
- [Drizzle ORM](https://orm.drizzle.team/) for database access
- [NextAuth](https://next-auth.js.org/) for authentication
- [Cloudflare D1](https://www.cloudflare.com/developer-platform/d1/) for serverless databases
- [Cloudflare Pages](https://pages.cloudflare.com/) for hosting
- [Biome](https://biomejs.dev/) for formatting and linting
- [ShadcnUI](https://shadcn.com/) as the component library

... while still being minimal and composable.

## Getting started

To use, simply clone this repo by running the following commands:

1. Make sure that you have [Wrangler](https://developers.cloudflare.com/workers/wrangler/install-and-update/#installupdate-wrangler) installed. And also that you have logged in with `wrangler login` (You'll need a Cloudflare account)

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

> If it fails, get your account id using these [steps](https://github.com/Dhravya/cloudflare-saas-stack/issues/11#issuecomment-2246060464) and set the `CLOUDFLARE_ACCOUNT_ID` environment variable to your account id. See [this issue](https://github.com/Dhravya/cloudflare-saas-stack/issues/11) for details.

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


### The beauty of this stack

It's fully scalable and composable. 
Want to add a backend hono worker, or a python backend? sure! Just put it in the monorepo and deploy. 

there's no environment variables.
want to use database? just env.DB. Want a Key-value instance? env.KV. want a queue? env.Queue.

want AI? env. AI

tools are incredible. there's wrangler - you can use wrangler to create/delete databases run migrations and all sorts.

Getting a lot of traffic? me too. I pay $5/month, for all of my projects hosted at the same time. (see https://supermemory.ai, https://md.dhr.wtf and more)
