import { Badge, Icon } from "@/components/ui";
import type { PublicRestaurant } from "@/lib/types";
import { cn } from "@/lib/utils";

type MenuHeroProps = {
  restaurant: PublicRestaurant;
  tableLabel?: string | null;
};

export function MenuHero({ restaurant, tableLabel }: MenuHeroProps) {
  return (
    <section className="relative w-full overflow-hidden rounded-2xl bg-surface-container-low p-space-md shadow-level-1 md:p-space-xl">
      <div className="relative z-10 flex flex-col justify-between gap-space-lg md:flex-row md:items-center">
        <div className="max-w-2xl">
          <div className="mb-space-xs flex flex-wrap items-center gap-space-xs">
            <Badge variant={restaurant.isOpen ? "optional" : "danger"} size="lg">
              <span
                className={cn(
                  "h-2 w-2 rounded-full",
                  restaurant.isOpen ? "animate-pulse bg-secondary" : "bg-error",
                )}
              />
              {restaurant.isOpen ? "Aberto para pedidos" : "Fechado"}
            </Badge>
            {tableLabel ? (
              <Badge variant="neutral" size="lg">
                <Icon name="table_restaurant" size="sm" />
                {tableLabel}
              </Badge>
            ) : null}
          </div>
          <h1 className="font-display text-headline-lg tracking-tight text-on-surface md:text-headline-xl">
            {restaurant.name}
          </h1>
          <p className="mt-1 max-w-xl text-body-md text-on-surface-variant">
            Monte seu pedido digitando ou escaneando o QR code da mesa.
          </p>
        </div>
      </div>
      <div className="pointer-events-none absolute -right-16 -top-16 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
    </section>
  );
}
