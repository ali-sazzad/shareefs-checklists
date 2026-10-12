import { Brand } from "@/components/Brand";
import { HomeCards } from "@/components/HomeCards";

export default function Home() {
  return (
    <main className="mx-auto max-w-2xl px-4 pb-10 pt-8">
      <div className="mb-6 text-center">
        <Brand />
        <h1 className="mt-4 font-display text-3xl text-brand">Daily Checklists</h1>
        <p className="mt-1 text-lg text-muted">Pick a list, tick tasks as you go. It saves automatically on this phone.</p>
      </div>
      <HomeCards />
    </main>
  );
}
