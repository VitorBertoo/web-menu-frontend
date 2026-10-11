import { cacheLife, cacheTag } from "next/cache";
import { ApiError, getPublicMenu } from "@/lib/api";
import type { PublicMenu } from "@/lib/types";

export async function loadPublicMenu(slug: string): Promise<PublicMenu | null> {
  "use cache";
  cacheTag(`menu:${slug}`);
  cacheLife("minutes");

  try {
    return await getPublicMenu(slug);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }
    throw error;
  }
}
