"use client";

import { useState, type FormEvent } from "react";

/**
 * Saisie du code volontaire.
 * Placeholder : l'authentification sera branchée dans une issue dédiée.
 */
export function VolunteerCodeForm() {
  const [code, setCode] = useState("");
  const trimmed = code.trim();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <label htmlFor="volunteer-code" className="text-sm font-medium">
        Code volontaire
      </label>
      <input
        id="volunteer-code"
        name="volunteerCode"
        type="text"
        inputMode="text"
        autoComplete="off"
        autoCapitalize="characters"
        spellCheck={false}
        placeholder="Ex. JMB-12345"
        value={code}
        onChange={(event) => setCode(event.target.value.toUpperCase())}
        className="h-14 rounded-xl border border-zinc-300 bg-transparent px-4 text-lg tracking-wider outline-none focus:border-brand focus:ring-2 focus:ring-brand/30 dark:border-zinc-700"
      />
      <button
        type="submit"
        disabled={trimmed.length === 0}
        className="h-14 rounded-xl bg-brand text-lg font-semibold text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-40"
      >
        Continuer
      </button>
    </form>
  );
}
