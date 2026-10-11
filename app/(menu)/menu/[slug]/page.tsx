import { Suspense } from "react";

function MenuSkeleton() {
  return (
    <main className="mx-auto max-w-5xl p-margin">
      <div className="h-10 w-1/3 animate-pulse rounded-md bg-surface-container" />
      <div className="mt-space-sm h-5 w-2/3 animate-pulse rounded-md bg-surface-container" />
    </main>
  );
}

async function MenuContent({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  return (
    <main className="mx-auto max-w-5xl p-margin">
      <h1 className="font-display text-headline-xl text-on-surface">{slug}</h1>
      <p className="mt-space-sm text-body-md text-on-surface-variant">
        O cardápio de <strong>{slug}</strong> será carregado aqui.
      </p>
    </main>
  );
}

export default function MenuPage({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <Suspense fallback={<MenuSkeleton />}>
      <MenuContent params={params} />
    </Suspense>
  );
}
