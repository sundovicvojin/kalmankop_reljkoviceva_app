"use client";

import { useActionState } from "react";
import { loginAction } from "@/lib/actions/admin";
import type { LoginState } from "@/lib/actions/types";

const initialState: LoginState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <form className="admin-form" action={formAction}>
      <label className="field">
        <span>Korisnicko ime</span>
        <input className="input" name="username" autoComplete="username" required />
      </label>
      <label className="field">
        <span>Lozinka</span>
        <input className="input" name="password" type="password" autoComplete="current-password" required />
      </label>
      {state.error ? (
        <p role="alert" style={{ color: "var(--gold)", margin: 0 }}>
          {state.error}
        </p>
      ) : null}
      <button className="button-main" type="submit" disabled={pending}>
        {pending ? "Provera..." : "Prijava"}
      </button>
    </form>
  );
}
