import { Button } from "@/components/ui/button";
import { sql } from "drizzle-orm";
import { auth, signIn, signOut } from "@/server/auth";
import { db } from "@/server/db";
import { comments } from "@/server/db/schema";
import { getThemeToggler } from "@/lib/theme/get-theme-button";

export const runtime = "edge";

export default async function Page() {
  const session = await auth();

  // Fetch comments from the database
  const commentList = await db.select().from(comments);

  const SetThemeButton = getThemeToggler();

  return (
    <main className="flex flex-col items-center justify-center min-h-screen">
      <div className="flex max-w-2xl justify-between w-full">
        <SetThemeButton />

        <div className="flex gap-2 items-center justify-center">
          <span className="italic">Cloudflare Next Saas Starter</span>
        </div>

        <div className="border border-black dark:border-white rounded-2xl p-2 flex items-center">
          Start by editing apps/web/page.tsx
        </div>
      </div>

      <div className="max-w-2xl text-start w-full mt-16">
        Welcome to Cloudflare Next Saas Starter. <br /> Built a full stack app
        using production-ready tools and frameworks, host on Cloudflare
        instantly.
        <br />
        An opinionated, batteries-included framework with{" "}
        <a
          className="text-transparent bg-clip-text bg-gradient-to-r from-[#a93d64] to-[#275ba9]"
          href="https://turbo.build"
        >
          Turborepo
        </a>{" "}
        and Nextjs. Fully Typesafe. Best practices followed by default.
        <br /> <br />
        Here&apos;s what the stack includes:
        <ul className="list-disc mt-4 prose dark:prose-invert">
          <li>
            Authentication with <code>next-auth</code>
          </li>
          <li>Database using Cloudflare&apos;s D1 serverless databases</li>
          <li>Drizzle ORM, already connected to your database ⚡</li>
          <li>Light/darkmode theming that works with server components (!)</li>
          <li>Styling using TailwindCSS and ShadcnUI</li>
          <li>Turborepo with a landing page and shared components</li>
          <li>Cloudflare wrangler for quick functions on the edge</li>
          <li>
            ... best part: everything&apos;s already set up for you. Just code!
          </li>
        </ul>
        <div className="mt-4 flex flex-col gap-2">
          <h2 className="text-xl font-bold">Comments</h2>
          {commentList.length > 0 ? (
            commentList.map((comment) => (
              <div key={comment.id} className="border p-2 my-2 rounded">
                <strong>{comment.author}</strong>
                <p>{comment.body}</p>
                <small className="text-gray-500">{comment.post_slug}</small>
              </div>
            ))
          ) : (
            <p>No comments yet.</p>
          )}
        </div>
        {session?.user?.email ? (
          <>
            <div className="mt-4 flex flex-col gap-2">
              <span>Hello {session.user.name} 👋</span>
              <span>{session.user.email}</span>
            </div>
            <form
              action={async () => {
                "use server";
                await signOut();
              }}
            >
              <Button className="mt-4">Sign out</Button>
            </form>
          </>
        ) : (
          <form
            action={async () => {
              "use server";
              await signIn("google");
            }}
          >
            <Button className="mt-4">Login with Google</Button>
          </form>
        )}
      </div>
    </main>
  );
}
