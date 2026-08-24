"use client";

import { useActionState } from "react";
import { signIn } from "@/app/admin/login/actions";

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(signIn, { error: null });

  return (
    <form action={formAction} className="mt-6 flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-medium text-ink">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="username"
          className="min-h-11 rounded-md border border-cream-200 bg-cream-50 px-3 text-base text-ink outline-none focus:border-rosewood"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-sm font-medium text-ink">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="min-h-11 rounded-md border border-cream-200 bg-cream-50 px-3 text-base text-ink outline-none focus:border-rosewood"
        />
      </div>

      {state.error ? <p className="text-sm text-rosewood-d">{state.error}</p> : null}

      <button
        type="submit"
        disabled={isPending}
        className="mt-2 min-h-11 rounded-md bg-ghee px-4 text-sm font-medium text-cream-50 transition-colors hover:bg-ghee/90 disabled:opacity-60"
      >
        {isPending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
