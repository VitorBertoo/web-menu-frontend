import { ProductManager } from "@/features/admin/components/product-manager";
import { adminApi } from "@/lib/api/admin";

export const instant = false;

export default async function AdminProductsPage() {
  const [products, categories] = await Promise.all([
    adminApi.products.list(),
    adminApi.categories.list(),
  ]);

  return <ProductManager products={products} categories={categories} />;
}
