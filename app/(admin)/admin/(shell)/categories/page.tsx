import { CategoryManager } from "@/features/admin/components/category-manager";
import { adminApi } from "@/lib/api/admin";

export const instant = false;

export default async function AdminCategoriesPage() {
  const categories = await adminApi.categories.list();

  return <CategoryManager categories={categories} />;
}
