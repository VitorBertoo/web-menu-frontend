import { notFound } from "next/navigation";
import { MenuApp } from "@/features/menu/components/menu-app";
import { loadPublicMenu } from "@/features/menu/data/get-public-menu";

export const instant = false;

type MenuPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ table?: string }>;
};

export default async function MenuPage({ params, searchParams }: MenuPageProps) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);

  const menu = await loadPublicMenu(slug);
  if (!menu) {
    notFound();
  }

  return <MenuApp menu={menu} tableToken={query.table ?? null} />;
}
