"use server";

import { redirect } from "next/navigation";
import { createSession, destroySession, loginWithCredentials } from "@/lib/auth";
import type { ActionResult } from "../lib/action-result";
import { messageForError } from "../lib/errors";
import { loginSchema } from "../lib/schemas";

export async function loginAction(input: {
  email: string;
  password: string;
}): Promise<ActionResult> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Informe e-mail e senha." };
  }

  let token: string;
  try {
    const response = await loginWithCredentials(parsed.data);
    token = response.token;
  } catch (error) {
    return { ok: false, error: messageForError(error, "E-mail ou senha inválidos.") };
  }

  await createSession(token);
  redirect("/admin");
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/admin/login");
}
