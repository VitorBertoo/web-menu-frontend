import { Suspense } from "react";

function TrackingSkeleton() {
  return (
    <main className="mx-auto max-w-md p-margin">
      <div className="h-8 w-1/2 animate-pulse rounded-md bg-surface-container" />
      <div className="mt-space-sm h-5 w-3/4 animate-pulse rounded-md bg-surface-container" />
    </main>
  );
}

async function OrderTrackingContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <main className="mx-auto max-w-md p-margin">
      <h1 className="font-display text-headline-lg text-on-surface">Acompanhar pedido</h1>
      <p className="mt-space-sm text-body-md text-on-surface-variant">
        Pedido <span className="tabular">{id}</span>
      </p>
    </main>
  );
}

export default function OrderTrackingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<TrackingSkeleton />}>
      <OrderTrackingContent params={params} />
    </Suspense>
  );
}
