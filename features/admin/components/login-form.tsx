"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button, Icon, Input } from "@/components/ui";
import { loginAction } from "../actions/auth";
import { type LoginFormValues, loginSchema } from "../lib/schemas";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setError(null);
    const result = await loginAction(values);
    if (result && !result.ok) {
      setError(result.error);
      return;
    }
    router.replace("/admin");
    router.refresh();
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-space-md">
      <Input
        label="E-mail"
        type="email"
        autoComplete="email"
        placeholder="admin@restaurante.com"
        error={form.formState.errors.email?.message}
        {...form.register("email")}
      />
      <Input
        label="Senha"
        type="password"
        autoComplete="current-password"
        placeholder="••••••••"
        error={form.formState.errors.password?.message}
        {...form.register("password")}
      />
      {error ? <p className="text-label-sm text-error">{error}</p> : null}
      <Button type="submit" size="lg" block disabled={form.formState.isSubmitting}>
        <Icon name="login" />
        {form.formState.isSubmitting ? "Entrando..." : "Entrar"}
      </Button>
    </form>
  );
}
