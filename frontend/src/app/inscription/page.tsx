import type { Metadata } from "next";
import { Suspense } from "react";
import { SignUpForm } from "@/components/sign-up-form";

export const metadata: Metadata = {
  title: "Inscription — GeoCheckin",
};

export default function SignUpPage() {
  return (
    <div className="flex flex-1 flex-col justify-center gap-8">
      <header className="flex flex-col gap-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Créer mon compte</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Une seule fois : vous pourrez ensuite émarger avec votre code.
        </p>
      </header>
      {/* useSearchParams (code pré-rempli) est rendu côté client. */}
      <Suspense>
        <SignUpForm />
      </Suspense>
    </div>
  );
}
