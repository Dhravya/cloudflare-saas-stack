import dynamic from "next/dynamic";
import { Button } from "@repo/ui/src/button"

// Theming that works perfectly with app router (no flicker, jumps etc!)
// Don't SSR the toggle since the value on the server will be different than the client
const SetThemeButton = dynamic(() => import("@repo/ui/src/theme-toggle"), {
  ssr: false,
  // Make sure to code a placeholder so the UI doesn't jump when the component loads
  loading: () => <div className="w-6 h-6" />,
});

export default function Page(): JSX.Element {
  return (
    <main className="flex flex-col">
      <SetThemeButton />

      <Button className="w-24">Click me</Button>
    </main>
  );
}
