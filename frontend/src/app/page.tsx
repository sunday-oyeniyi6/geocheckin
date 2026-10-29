import { VolunteerCodeForm } from "@/components/volunteer-code-form";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col justify-center gap-8">
      <header className="flex flex-col gap-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight">GeoCheckin</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Émargement des volontaires Jambaar 26 — Stade Abdoulaye Wade
        </p>
      </header>
      <VolunteerCodeForm />
    </div>
  );
}
