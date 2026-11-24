import type { Order } from '../types';
import { getDataset, simulateRequest, type VariantKey } from './index';

export interface OrderWithTotal extends Order {
  total_price: number;
}

export interface OrderFilters {
  userId?: number;
}

function withOrderTotal(order: Order): OrderWithTotal {
  return {
    ...order,
    total_price: order.items.reduce(
      (sum, item) => sum + item.unit_price * item.quantity,
      0
    ),
  };
}

export async function getOrders(
  { userId }: OrderFilters = {},
  variant?: VariantKey
): Promise<OrderWithTotal[]> {
  let orders = getDataset(variant).orders;

  if (userId) {
    orders = orders.filter((o) => o.user_id === Number(userId));
  }

  return simulateRequest(orders.map(withOrderTotal));
}

export async function getOrderById(
  id: number | string,
  variant?: VariantKey
): Promise<OrderWithTotal | null> {
  const order = getDataset(variant).orders.find((o) => o.id === Number(id));
  return simulateRequest(order ? withOrderTotal(order) : null);
}