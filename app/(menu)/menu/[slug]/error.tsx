"use client";

import { useEffect } from "react";
import { Button, Icon } from "@/components/ui";

export default function MenuError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-space-md p-margin text-center">
      <span className="font-icon text-5xl text-error">cloud_off</span>
      <h1 className="font-display text-headline-lg text-on-surface">
        Cardápio indisponível
      </h1>
      <p className="text-body-md text-on-surface-variant">
        Não conseguimos carregar o cardápio agora. Tente novamente em instantes.
      </p>
      <Button onClick={reset}>
        <Icon name="refresh" />
        Tentar novamente
      </Button>
    </main>
  );
}
