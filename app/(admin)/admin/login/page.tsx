import type { Metadata } from "next";
import { LoginForm } from "@/features/admin/components/login-form";

export const metadata: Metadata = {
  title: "Entrar",
};

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-dvh flex-1 items-center justify-center bg-surface-container-low p-margin">
      <div className="w-full max-w-sm rounded-xl border border-outline-variant bg-surface-container-lowest p-space-xl shadow-level-1">
        <h1 className="font-display text-headline-md text-on-surface">
          Entrar no painel
        </h1>
        <p className="mt-space-xs mb-space-lg text-body-sm text-on-surface-variant">
          Acesse com o e-mail e senha do administrador.
        </p>
        <LoginForm />
      </div>
    </main>
  );
}
