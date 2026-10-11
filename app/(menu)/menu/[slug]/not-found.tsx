import Link from "next/link";
import { buttonVariants, Icon } from "@/components/ui";

export default function MenuNotFound() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-space-md p-margin text-center">
      <span className="font-icon text-5xl text-outline">search_off</span>
      <h1 className="font-display text-headline-lg text-on-surface">
        Cardápio não encontrado
      </h1>
      <p className="text-body-md text-on-surface-variant">
        O restaurante que você procura não existe ou o link está incorreto.
      </p>
      <Link href="/menu" className={buttonVariants({ variant: "secondary" })}>
        <Icon name="arrow_back" />
        Voltar
      </Link>
    </main>
  );
}
