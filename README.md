# 🚀 Full-Stack Cloudflare SaaS Kit

**_Build and deploy scalable products on Cloudflare with ease._**

An opinionated, batteries-included starter kit for quickly building and deploying SaaS products on Cloudflare. This is a [Next.js](https://nextjs.org/) project bootstrapped with [`c3`](https://developers.cloudflare.com/pages/get-started/c3).

This is the same stack used to build [Supermemory.ai](https://Supermemory.ai) which is open source at [git.new/memory](https://git.new/memory)

Supermemory now has 20k+ users and it runs on $5/month. safe to say, it's _very_ effective.

## The stack includes:

- [Next.js](https://nextjs.org/) for frontend
- [TailwindCSS](https://tailwindcss.com/) for styling
- [Drizzle ORM](https://orm.drizzle.team/) for database access
- [NextAuth](https://next-auth.js.org/) for authentication
- [Cloudflare D1](https://www.cloudflare.com/developer-platform/d1/) for serverless databases
- [Cloudflare Pages](https://pages.cloudflare.com/) for hosting
- [ShadcnUI](https://shadcn.com/) as the component library

## Getting Started

1. Make sure that you have [Wrangler](https://developers.cloudflare.com/workers/wrangler/install-and-update/#installupdate-wrangler) installed. And also that you have logged in with `wrangler login` (You'll need a Cloudflare account)

2. Clone the repository and install dependencies:
   ```bash
   git clone https://github.com/Dhravya/cloudflare-saas-stack
   cd cloudflare-saas-stack
   npm i -g bun
   bun install
   bun run setup
   ```

3. Run the development server:
   ```bash
   bun run dev
   ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Cloudflare Integration

Besides the `dev` script, `c3` has added extra scripts for Cloudflare Pages integration:
- `pages:build`: Build the application for Pages using [`@cloudflare/next-on-pages`](https://github.com/cloudflare/next-on-pages) CLI
- `preview`: Locally preview your Pages application using [Wrangler](https://developers.cloudflare.com/workers/wrangler/) CLI
- `deploy`: Deploy your Pages application using Wrangler CLI
- `cf-typegen`: Generate typescript types for Cloudflare env.

> __Note:__ While the `dev` script is optimal for local development, you should preview your Pages application periodically to ensure it works properly in the Pages environment.

## Bindings

Cloudflare [Bindings](https://developers.cloudflare.com/pages/functions/bindings/) allow you to interact with Cloudflare Platform resources. You can use bindings during development, local preview, and in the deployed application.

For detailed instructions on setting up bindings, refer to the Cloudflare documentation.

## Database Migrations
Quick explaination of D1 set up:
- D1 is a serverless database that follows SQLite convention.
- Within Cloudflare pages and workers, you can directly query d1 with [client api](https://developers.cloudflare.com/d1/build-with-d1/d1-client-api/) exposed by bindings (eg. `env.BINDING`)
- You can also query d1 via [rest api](https://developers.cloudflare.com/api/operations/cloudflare-d1-create-database)
- Locally, wrangler auto generates sqlite files at `.wrangler/state/v3/d1` after `bun run dev`.
- Local dev environment (`bun run dev`) interact with [local d1 session](https://developers.cloudflare.com/d1/build-with-d1/local-development/#start-a-local-development-session), which is based on some SQlite files located at `.wrangler/state/v3/d1`.
- In dev mode (`bun run db:<migrate or studio>:dev`), Drizzle-kit (migrate and studio) directly modifies these files as regular SQlite db. While `bun run db:<migrate or studio>:prod` use d1-http driver to interact with remote d1 via rest api. Therefore we need to set env var at `.env.example`

To generate migrations files:
- `bun run db:generate`

To apply database migrations:
- For development: `bun run db:migrate:dev`
- For production: `bun run db:migrate:prd`

To inspect database:
- For local database `bun run db:studio:dev`
- For remote database `bun run db:studio:prod`

## Cloudflare R2 Bucket CORS / File Upload

Don't forget to add the CORS policy to the R2 bucket. The CORS policy should look like this:

```json
[
  {
    "AllowedOrigins": [
      "http://localhost:3000",
      "https://your-domain.com"
    ],
    "AllowedMethods": [
      "GET",
      "PUT"
    ],
    "AllowedHeaders": [
      "Content-Type"
    ],
    "ExposeHeaders": [
      "ETag"
    ]
  }
]
```

You can now even set up object upload.

## Manual Setup

If you prefer manual setup:

1. Create a Cloudflare account and install Wrangler CLI.
2. Create a D1 database: `bunx wrangler d1 create ${dbName}`
3. Create a `.dev.vars` file in the project root with your Google OAuth credentials and NextAuth secret.
   1. `AUTH_SECRET`, generate by command `openssl rand -base64 32` or `bunx auth secret`
   2. `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET` for google oauth.
      1. First create [OAuth consent screen](https://console.cloud.google.com/apis/credentials/consent). Tips: no wait time if you skip logo upload.
      2. Create [credential](https://console.cloud.google.com/apis/credentials). Put `https://your-domain` and `http://localhost:3000` at "Authorized JavaScript origins". Put `https://your-domain/api/auth/callback/google` and `http://localhost:3000/api/auth/callback/google` at "Authorized redirect URIs".
4. Generate db migration files: `bun run db:generate`
5. Run local migration: `bunx wrangler d1 execute ${dbName} --local --file=migrations/0000_setup.sql` or using drizzle `bun run db:migrate:dev`
6. Run remote migration: `bunx wrangler d1 execute ${dbName} --remote --file=migrations/0000_setup.sql` or using drizzle `bun run db:migrate:prod`
7. Start development server: `bun run dev`
8. Deploy: `bun run deploy`

## The Beauty of This Stack

- Fully scalable and composable
- No environment variables needed (use `env.DB`, `env.KV`, `env.Queue`, `env.AI`, etc.)
- Powerful tools like Wrangler for database management and migrations
- Cost-effective scaling (e.g., $5/month for multiple high-traffic projects)

Just change your Cloudflare account ID in the project settings, and you're good to go!

