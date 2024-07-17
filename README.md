## Cloudflare SaaS Starter kit

This is a starter kit for quickly building SaaS products on Cloudflare.

To use, simply:

1. Make sure that you have [Wrangler](https://developers.cloudflare.com/workers/wrangler/install-and-update/#installupdate-wrangler) installed.

2. Run the following commands:
```
git clone https://github.com/Dhravya/cloudflare-saas-stack
cd cloudflare-saas-stack
npm i -g bun
bun install
bun run setup
```

That's it. You're ready to go!

Next time, you can just run `bun run dev` and start developing.

When you're ready to deploy, run `bun run deploy` to deploy to Cloudflare.

## About

Build a full stack app using production-ready tools and frameworks, host on Cloudflare instantly.
An opinionated, batteries-included framework with Turborepo and Nextjs. Fully Typesafe. Best practices followed by default.

Here's what the stack includes:
- Authentication with next-auth
- Database using Cloudflare's D1 serverless databases
- Drizzle ORM, already connected to your database and auth ⚡
- Light/darkmode theming that works with server components (!)
- Styling using TailwindCSS and ShadcnUI
- Turborepo with a landing page and shared components
- Cloudflare wrangler for quick functions on the edge
... best part: everything's already set up for you. Just code!