import { Suspense } from "react";
import { Skeleton } from "@/components/ui";
import { OrderTracker } from "@/features/menu/components/order-tracker";

async function OrderContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <main className="mx-auto w-full max-w-md p-margin pb-16">
      <OrderTracker orderId={id} />
    </main>
  );
}

export default function OrderTrackingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto flex w-full max-w-md flex-col gap-space-lg p-margin">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      }
    >
      <OrderContent params={params} />
    </Suspense>
  );
}
