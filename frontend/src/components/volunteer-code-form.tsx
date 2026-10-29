"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { genericErrorMessage, login } from "@/lib/api";
import { VOLUNTEER_CODE_REGEX, formatVolunteerCodeInput } from "@/lib/formats";
import {
  errorTextClass,
  inputClass,
  primaryButtonClass,
  secondaryButtonClass,
} from "./ui";

type Status =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "not_found"; code: string }
  | { kind: "error"; message: string };

/** Connexion par code volontaire ; propose l'inscription si aucun compte n'existe. */
export function VolunteerCodeForm() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [touched, setTouched] = useState(false);
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  const isValid = VOLUNTEER_CODE_REGEX.test(code);
  const showFormatError = touched && code.length > 0 && !isValid;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTouched(true);
    if (!isValid) return;

    setStatus({ kind: "submitting" });
    const result = await login(code);
    if (result.ok) {
      router.push("/checkin");
    } else if (result.error.kind === "not_found") {
      setStatus({ kind: "not_found", code });
    } else {
      setStatus({ kind: "error", message: genericErrorMessage(result.error) });
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <label htmlFor="volunteer-code" className="text-sm font-medium">
        Code volontaire
      </label>
      <input
        id="volunteer-code"
        name="volunteerCode"
        type="text"
        inputMode="numeric"
        autoComplete="off"
        spellCheck={false}
        maxLength={9}
        placeholder="012346-00"
        value={code}
        aria-invalid={showFormatError}
        aria-describedby={showFormatError ? "volunteer-code-error" : undefined}
        onChange={(event) => {
          setCode(formatVolunteerCodeInput(event.target.value));
          setStatus({ kind: "idle" });
        }}
        onBlur={() => setTouched(true)}
        className={`${inputClass} tracking-widest`}
      />
      {showFormatError && (
        <p id="volunteer-code-error" className={errorTextClass}>
          Le code doit être au format 012346-00.
        </p>
      )}

      <button
        type="submit"
        disabled={!isValid || status.kind === "submitting"}
        className={primaryButtonClass}
      >
        {status.kind === "submitting" ? "Vérification…" : "Continuer"}
      </button>

      {status.kind === "error" && (
        <p role="alert" className={errorTextClass}>
          {status.message}
        </p>
      )}

      {status.kind === "not_found" && (
        <div
          role="alert"
          className="flex flex-col gap-3 rounded-xl bg-zinc-100 p-4 dark:bg-zinc-900"
        >
          <p>
            Aucun compte pour le code <strong>{status.code}</strong>.
          </p>
          <Link
            href={`/inscription?code=${encodeURIComponent(status.code)}`}
            className={secondaryButtonClass}
          >
            Créer mon compte
          </Link>
        </div>
      )}
    </form>
  );
}
