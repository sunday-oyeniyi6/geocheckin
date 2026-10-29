"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { genericErrorMessage, signUp, type SignUpInput } from "@/lib/api";
import {
  VOLUNTEER_CODE_REGEX,
  formatVolunteerCodeInput,
  isValidPersonName,
  isValidSenegalPhone,
  normalizePersonName,
  normalizeSenegalPhone,
} from "@/lib/formats";
import { errorTextClass, inputClass, primaryButtonClass } from "./ui";

type Field = keyof SignUpInput;
type FieldErrors = Partial<Record<Field, string>>;

function validate(values: SignUpInput): FieldErrors {
  const errors: FieldErrors = {};
  if (!isValidPersonName(values.firstName)) {
    errors.firstName = "Prénom invalide (2 à 50 lettres).";
  }
  if (!isValidPersonName(values.lastName)) {
    errors.lastName = "Nom invalide (2 à 50 lettres).";
  }
  if (!VOLUNTEER_CODE_REGEX.test(values.code)) {
    errors.code = "Le code doit être au format 012346-00.";
  }
  if (!isValidSenegalPhone(values.phone)) {
    errors.phone = "Numéro mobile sénégalais attendu (70, 75, 76, 77 ou 78).";
  }
  return errors;
}

const CONFLICT_MESSAGES: Record<"code" | "phone", string> = {
  code: "Ce code est déjà utilisé.",
  phone: "Ce numéro est déjà utilisé.",
};

/** Inscription d'un volontaire ; le code peut être pré-rempli via ?code=. */
export function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [values, setValues] = useState<SignUpInput>(() => ({
    firstName: "",
    lastName: "",
    code: formatVolunteerCodeInput(searchParams.get("code") ?? ""),
    phone: "",
  }));
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function update(field: Field, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setFormError(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fieldErrors = validate(values);
    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length > 0) return;

    setSubmitting(true);
    const result = await signUp({
      firstName: normalizePersonName(values.firstName),
      lastName: normalizePersonName(values.lastName),
      code: values.code,
      phone: normalizeSenegalPhone(values.phone),
    });
    if (result.ok) {
      router.push("/checkin");
      return;
    }

    setSubmitting(false);
    if (result.error.kind === "conflict" && result.error.fields.length > 0) {
      setErrors(
        Object.fromEntries(
          result.error.fields.map((field) => [field, CONFLICT_MESSAGES[field]]),
        ),
      );
    } else if (result.error.kind === "conflict") {
      setFormError("Ce code ou ce numéro est déjà utilisé.");
    } else {
      setFormError(genericErrorMessage(result.error));
    }
  }

  function field(
    name: Field,
    label: string,
    props: React.InputHTMLAttributes<HTMLInputElement>,
    format: (raw: string) => string = (raw) => raw,
  ) {
    const error = errors[name];
    return (
      <div className="flex flex-col gap-2">
        <label htmlFor={name} className="text-sm font-medium">
          {label}
        </label>
        <input
          id={name}
          name={name}
          value={values[name]}
          onChange={(event) => update(name, format(event.target.value))}
          aria-invalid={error !== undefined}
          aria-describedby={error ? `${name}-error` : undefined}
          className={inputClass}
          {...props}
        />
        {error && (
          <p id={`${name}-error`} className={errorTextClass}>
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      {field("firstName", "Prénom", { autoComplete: "given-name" })}
      {field("lastName", "Nom", { autoComplete: "family-name" })}
      {field(
        "code",
        "Code volontaire",
        {
          inputMode: "numeric",
          autoComplete: "off",
          maxLength: 9,
          placeholder: "012346-00",
          className: `${inputClass} tracking-widest`,
        },
        formatVolunteerCodeInput,
      )}
      {field("phone", "Téléphone", {
        type: "tel",
        inputMode: "tel",
        autoComplete: "tel-national",
        placeholder: "77 123 45 67",
      })}

      <button type="submit" disabled={submitting} className={primaryButtonClass}>
        {submitting ? "Création…" : "Créer mon compte"}
      </button>

      {formError && (
        <p role="alert" className={errorTextClass}>
          {formError}
        </p>
      )}

      <Link href="/" className="text-center text-sm text-brand underline">
        J&apos;ai déjà un compte
      </Link>
    </form>
  );
}
