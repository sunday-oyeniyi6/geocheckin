"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { genericErrorMessage, getMe, logout, type Me } from "@/lib/api";
import { errorTextClass, primaryButtonClass, secondaryButtonClass } from "./ui";

type State =
  | { kind: "loading" }
  | { kind: "ready"; me: Me }
  | { kind: "error"; message: string };

/** Placeholder de l'étape d'émargement : vérifie la session et salue le volontaire. */
export function CheckinGreeting() {
  const router = useRouter();
  const [state, setState] = useState<State>({ kind: "loading" });
  // Incrémenté par « Réessayer » pour relancer le chargement.
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    getMe().then((result) => {
      if (cancelled) return;
      if (result.ok) {
        setState({ kind: "ready", me: result.data });
      } else if (result.error.kind === "unauthenticated") {
        router.replace("/");
      } else {
        setState({ kind: "error", message: genericErrorMessage(result.error) });
      }
    });
    return () => {
      cancelled = true;
    };
  }, [router, attempt]);

  async function handleLogout() {
    await logout();
    router.replace("/");
  }

  if (state.kind === "loading") {
    return <p className="text-center text-zinc-500">Chargement…</p>;
  }

  if (state.kind === "error") {
    return (
      <div className="flex flex-col gap-4">
        <p role="alert" className={errorTextClass}>
          {state.message}
        </p>
        <button
          type="button"
          className={primaryButtonClass}
          onClick={() => {
            setState({ kind: "loading" });
            setAttempt((n) => n + 1);
          }}
        >
          Réessayer
        </button>
      </div>
    );
  }

  const { me } = state;
  return (
    <div className="flex flex-col gap-6 text-center">
      <h1 className="text-3xl font-bold tracking-tight">Bonjour {me.firstName}</h1>
      <p className="text-zinc-600 dark:text-zinc-400">Code volontaire {me.code}</p>
      {me.checkedInToday ? (
        <p role="status" className="rounded-xl bg-brand/10 p-4 font-medium text-brand">
          Vous avez déjà émargé aujourd&apos;hui.
        </p>
      ) : (
        <p className="rounded-xl bg-zinc-100 p-4 dark:bg-zinc-900">
          L&apos;émargement (position, photo du badge, signature) arrive bientôt.
        </p>
      )}
      <button type="button" onClick={handleLogout} className={secondaryButtonClass}>
        Se déconnecter
      </button>
    </div>
  );
}
