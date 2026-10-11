"use client";

import Image from "next/image";
import { Badge, Button, Icon } from "@/components/ui";
import type { Product } from "@/lib/types";
import { formatCurrency } from "../lib/pricing";

type ProductCardProps = {
  product: Product;
  disabled?: boolean;
  onSelect: (product: Product) => void;
};

export function ProductCard({ product, disabled, onSelect }: ProductCardProps) {
  const customizable = product.componentGroups.length > 0;

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-outline-variant/70 bg-surface-container-lowest shadow-level-1 transition-shadow hover:shadow-level-2">
      <div className="relative aspect-video w-full overflow-hidden bg-surface-container">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-outline">
            <Icon name="restaurant" size="xl" />
          </div>
        )}
        {!product.isAvailable ? (
          <div className="absolute inset-0 flex items-center justify-center bg-inverse-surface/60 backdrop-blur-sm">
            <Badge variant="required" size="lg">
              Indisponível
            </Badge>
          </div>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-space-xs p-space-md">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-headline-sm text-on-surface">
            {product.name}
          </h3>
          <span className="tabular whitespace-nowrap text-price-display text-primary">
            {formatCurrency(product.basePrice)}
          </span>
        </div>
        {product.description ? (
          <p className="line-clamp-2 text-body-sm text-on-surface-variant">
            {product.description}
          </p>
        ) : null}

        <div className="mt-auto pt-space-sm">
          <Button
            block
            disabled={disabled || !product.isAvailable}
            onClick={() => onSelect(product)}
          >
            <Icon name={customizable ? "tune" : "add"} />
            {customizable ? "Personalizar & Adicionar" : "Adicionar"}
          </Button>
        </div>
      </div>
    </article>
  );
}
