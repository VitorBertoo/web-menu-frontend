"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Badge, Icon, Input } from "@/components/ui";
import { resolveSession } from "@/lib/api";
import type { Product, PublicMenu } from "@/lib/types";
import { cartItemCount, cartSubtotal } from "../lib/pricing";
import { useCartStore } from "../stores/cart";
import { CartBar } from "./cart-bar";
import { CartSheet } from "./cart-sheet";
import { CategoryNav } from "./category-nav";
import { CheckoutDialog } from "./checkout-dialog";
import { MenuHero } from "./menu-hero";
import { ProductCard } from "./product-card";
import { ProductCustomizer } from "./product-customizer";

type MenuAppProps = {
  menu: PublicMenu;
  tableToken: string | null;
};

type SessionInfo = { id: string; label: string };

export function MenuApp({ menu, tableToken }: MenuAppProps) {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(
    menu.categories[0]?.id ?? null,
  );
  const [customizing, setCustomizing] = useState<Product | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [session, setSession] = useState<SessionInfo | null>(null);
  const [sessionError, setSessionError] = useState<string | null>(null);

  const lines = useCartStore((state) => state.lines);
  const ensureSlug = useCartStore((state) => state.ensureSlug);
  const addLine = useCartStore((state) => state.addLine);
  const removeLine = useCartStore((state) => state.removeLine);
  const setQuantity = useCartStore((state) => state.setQuantity);
  const clear = useCartStore((state) => state.clear);

  const slug = menu.restaurant.slug;

  useEffect(() => {
    ensureSlug(slug);
  }, [slug, ensureSlug]);

  useEffect(() => {
    if (!tableToken) return;
    let active = true;
    resolveSession(tableToken)
      .then((response) => {
        if (!active) return;
        setSession({ id: response.session.id, label: response.table.label });
      })
      .catch(() => {
        if (!active) return;
        setSessionError("Não foi possível abrir a mesa. Escaneie o QR code novamente.");
      });
    return () => {
      active = false;
    };
  }, [tableToken]);

  const normalizedSearch = search.trim().toLowerCase();
  const visibleCategories = useMemo(() => {
    if (!normalizedSearch) return menu.categories;
    return menu.categories
      .map((category) => ({
        ...category,
        products: category.products.filter((product) =>
          product.name.toLowerCase().includes(normalizedSearch),
        ),
      }))
      .filter((category) => category.products.length > 0);
  }, [menu.categories, normalizedSearch]);

  const subtotal = cartSubtotal(lines);
  const itemCount = cartItemCount(lines);
  const orderingDisabled = !menu.restaurant.isOpen;

  const handleSelect = (product: Product) => {
    if (orderingDisabled) return;
    if (product.componentGroups.length === 0) {
      addLine({
        productId: product.id,
        name: product.name,
        imageUrl: product.imageUrl,
        basePrice: product.basePrice,
        quantity: 1,
        notes: "",
        components: [],
      });
      setCartOpen(true);
      return;
    }
    setCustomizing(product);
  };

  const scrollToCategory = (id: string) => {
    setActiveCategory(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="mx-auto w-full max-w-5xl p-margin pb-32">
      <MenuHero restaurant={menu.restaurant} tableLabel={session?.label} />

      {orderingDisabled ? (
        <div className="mt-space-lg flex items-center gap-space-sm rounded-xl bg-error-container p-space-md text-on-error-container">
          <Icon name="schedule" />
          <p className="text-body-md">
            O restaurante está fechado. Você pode ver o cardápio, mas não é possível pedir
            no momento.
          </p>
        </div>
      ) : null}

      {sessionError ? (
        <div className="mt-space-lg flex items-center gap-space-sm rounded-xl bg-amber-100 p-space-md text-amber-900">
          <Icon name="warning" />
          <p className="text-body-md">{sessionError}</p>
        </div>
      ) : null}

      <div className="sticky top-0 z-20 -mx-margin mt-space-lg bg-background/90 px-margin py-space-sm backdrop-blur md:mx-0 md:px-0">
        <Input
          leftIcon="search"
          placeholder="Buscar pratos, bebidas..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          aria-label="Buscar no cardápio"
        />
        {!normalizedSearch && visibleCategories.length > 0 ? (
          <div className="mt-space-sm">
            <CategoryNav
              categories={visibleCategories.map((category) => ({
                id: category.id,
                name: category.name,
              }))}
              activeId={activeCategory}
              onSelect={scrollToCategory}
            />
          </div>
        ) : null}
      </div>

      <div className="mt-space-lg flex flex-col gap-space-2xl">
        {visibleCategories.length === 0 && menu.uncategorized.length === 0 ? (
          <p className="py-space-2xl text-center text-body-md text-on-surface-variant">
            Nenhum item encontrado.
          </p>
        ) : null}

        {visibleCategories.map((category) => (
          <section
            key={category.id}
            id={category.id}
            className="scroll-mt-40 flex flex-col gap-space-md"
          >
            <div className="flex items-baseline gap-space-xs">
              <h2 className="font-display text-headline-md text-on-surface">
                {category.name}
              </h2>
              <span className="text-label-sm text-on-surface-variant">
                ({category.products.length})
              </span>
            </div>
            <div className="grid grid-cols-1 gap-space-md sm:grid-cols-2 lg:grid-cols-3">
              {category.products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  disabled={orderingDisabled}
                  onSelect={handleSelect}
                />
              ))}
            </div>
          </section>
        ))}

        {!normalizedSearch && menu.uncategorized.length > 0 ? (
          <section className="flex flex-col gap-space-md">
            <div className="flex items-center gap-space-xs">
              <h2 className="font-display text-headline-md text-on-surface">Outros</h2>
              <Badge variant="neutral">Sem categoria</Badge>
            </div>
            <div className="grid grid-cols-1 gap-space-md sm:grid-cols-2 lg:grid-cols-3">
              {menu.uncategorized.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  disabled={orderingDisabled}
                  onSelect={handleSelect}
                />
              ))}
            </div>
          </section>
        ) : null}
      </div>

      <CartBar
        itemCount={itemCount}
        subtotal={subtotal}
        onOpen={() => setCartOpen(true)}
      />

      <ProductCustomizer
        product={customizing}
        open={customizing !== null}
        onClose={() => setCustomizing(null)}
        onAdd={addLine}
      />

      <CartSheet
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        lines={lines}
        subtotal={subtotal}
        onSetQuantity={setQuantity}
        onRemove={removeLine}
        onCheckout={() => {
          setCartOpen(false);
          setCheckoutOpen(true);
        }}
      />

      <CheckoutDialog
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        slug={slug}
        deliveryFee={0}
        lines={lines}
        sessionId={session?.id ?? null}
        tableLabel={session?.label ?? null}
        onClearCart={clear}
        onSuccess={(orderId) => {
          setCheckoutOpen(false);
          router.push(`/menu/order/${orderId}`);
        }}
      />
    </div>
  );
}
