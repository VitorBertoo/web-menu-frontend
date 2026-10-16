import { RestaurantForm } from "@/features/admin/components/restaurant-form";
import { adminApi } from "@/lib/api/admin";

export const instant = false;

export default async function AdminRestaurantPage() {
  const restaurant = await adminApi.restaurant.get();

  return <RestaurantForm restaurant={restaurant} />;
}
