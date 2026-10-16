export type OrderType = "dine_in" | "pickup" | "delivery";

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "ready"
  | "out_for_delivery"
  | "delivered"
  | "completed"
  | "canceled";

export type TableSessionStatus = "open" | "closed";

export type WeekDay = "sun" | "mon" | "tue" | "wed" | "thu" | "fri" | "sat";

export type TimeRange = [opensAt: string, closesAt: string];

export type OpeningHours = Partial<Record<WeekDay, TimeRange[]>>;

export interface DeliveryAddress {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipcode: string;
  lat?: number;
  lng?: number;
  reference?: string;
}

export interface Restaurant {
  id: string;
  name: string;
  slug: string;
  phone: string | null;
  isOpen: boolean;
  deliveryFee: number;
  openingHours: OpeningHours;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  restaurantId: string;
  name: string;
  position: number;
  deletedAt: string | null;
}

export interface Component {
  id: string;
  componentGroupId: string;
  name: string;
  priceDelta: number;
  isAvailable: boolean;
  position: number;
}

export interface ComponentGroup {
  id: string;
  productId: string;
  name: string;
  minSelect: number;
  maxSelect: number;
  isRequired: boolean;
  position: number;
  components: Component[];
}

export interface Product {
  id: string;
  restaurantId: string;
  name: string;
  description: string | null;
  basePrice: number;
  imageUrl: string | null;
  isAvailable: boolean;
  deletedAt: string | null;
  createdAt: string;
  productCategories: ProductCategoryLink[];
  componentGroups: ComponentGroup[];
}

export interface ProductCategoryLink {
  productId: string;
  categoryId: string;
  category?: Category;
}

export interface Table {
  id: string;
  restaurantId: string;
  label: string;
  qrToken: string;
  isActive: boolean;
  createdAt: string;
}

export interface TableSession {
  id: string;
  tableId: string;
  status: TableSessionStatus;
  openedAt: string;
  closedAt: string | null;
  table?: Table;
}

export interface Order {
  id: string;
  restaurantId: string;
  type: OrderType;
  status: OrderStatus;
  tableSessionId: string | null;
  customerName: string | null;
  customerPhone: string | null;
  deliveryAddress: DeliveryAddress | null;
  subtotal: number;
  deliveryFee: number;
  total: number;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OrderStatusLog {
  id: string;
  orderId: string;
  status: OrderStatus;
  note: string | null;
  createdAt: string;
}

export interface OrderItemComponent {
  id: string;
  orderItemId: string;
  componentId: string;
  quantity: number;
  priceDelta: number;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  notes: string | null;
  components: OrderItemComponent[];
}

export interface OrderDetail extends Order {
  items: OrderItem[];
  statusLogs: OrderStatusLog[];
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  restaurantId: string;
}

export interface PublicRestaurant {
  id: string;
  name: string;
  slug: string;
  phone: string | null;
  isOpen: boolean;
  openingHours: OpeningHours | null;
}

export interface MenuCategory {
  id: string;
  name: string;
  position: number;
  products: Product[];
}

export interface PublicMenu {
  restaurant: PublicRestaurant;
  categories: MenuCategory[];
  uncategorized: Product[];
}

export interface ResolveSessionResponse {
  restaurant: Pick<PublicRestaurant, "id" | "name" | "slug" | "isOpen">;
  table: { id: string; label: string };
  session: { id: string; status: TableSessionStatus; openedAt: string };
}

export interface OrderItemInput {
  productId: string;
  quantity: number;
  notes?: string | null;
  components?: { componentId: string; quantity?: number }[];
}

interface CreateOrderBase {
  slug: string;
  notes?: string | null;
  items: OrderItemInput[];
}

export interface DineInOrderInput extends CreateOrderBase {
  type: "dine_in";
  tableSessionId: string;
}

export interface PickupOrderInput extends CreateOrderBase {
  type: "pickup";
  customerName: string;
  customerPhone: string;
}

export interface DeliveryOrderInput extends CreateOrderBase {
  type: "delivery";
  customerName: string;
  customerPhone: string;
  deliveryAddress: DeliveryAddress;
}

export type CreateOrderInput = DineInOrderInput | PickupOrderInput | DeliveryOrderInput;

export interface LoginInput {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  admin: AdminUser;
}

export interface UpdateRestaurantInput {
  name?: string;
  phone?: string | null;
  isOpen?: boolean;
  deliveryFee?: number;
  openingHours?: OpeningHours | null;
}

export interface CategoryInput {
  name?: string;
  position?: number;
}

export interface ComponentInput {
  name: string;
  priceDelta?: number;
  isAvailable?: boolean;
  position?: number;
}

export interface ComponentGroupInput {
  name: string;
  minSelect?: number;
  maxSelect?: number;
  isRequired?: boolean;
  position?: number;
  components: ComponentInput[];
}

export interface ProductInput {
  name?: string;
  description?: string | null;
  basePrice?: number;
  imageUrl?: string | null;
  isAvailable?: boolean;
  categoryIds?: string[];
  componentGroups?: ComponentGroupInput[];
}

export interface TableInput {
  label?: string;
  isActive?: boolean;
}

export interface OrderListQuery {
  status?: OrderStatus;
  type?: OrderType;
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface SalesReport {
  summary: {
    orders: number;
    revenue: number;
    canceled: number;
    averageTicket: number;
    byType: { type: OrderType; orders: number; revenue: number }[];
  };
  daily: { date: string; orders: number; revenue: number }[];
}

export interface CatalogReport {
  topProducts: {
    productId: string;
    name: string;
    quantity: number;
    revenue: number;
  }[];
  topComponents: { componentId: string; name: string; quantity: number }[];
}

export interface OperationsReport {
  prepTime: { ordersMeasured: number; averageMinutes: number };
  occupancy: {
    sessions: number;
    openSessions: number;
    averageMinutes: number;
  };
}
