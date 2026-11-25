import type { Category, EnrichedProduct, Order, Product } from '../types';

export function hasOrdersInPreviousMonth(
  productId: number,
  orders: Order[],
  today: Date = new Date()
): boolean {
  const prevMonthDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const targetYear = prevMonthDate.getFullYear();
  const targetMonth = prevMonthDate.getMonth() + 1;

  return orders.some((order) => {
    const [orderYear, orderMonth] = order.order_date.split('-').map(Number);
    const samePrevMonth =
      orderYear === targetYear && orderMonth === targetMonth;

    if (!samePrevMonth) {
      return false;
    }

    return order.items.some((item) => item.product_id === productId);
  });
}

export function enrichProduct(
  product: Product,
  categories: Category[],
  orders: Order[]
): EnrichedProduct {
  const totalStock = product.variants.reduce(
    (sum, variant) => sum + variant.quantity,
    0
  );
  const hasPrevOrders = hasOrdersInPreviousMonth(product.id, orders);
  const discountPercent = hasPrevOrders ? 0 : 25;
  const discountedPrice = Math.round(
    product.base_price * (1 - discountPercent / 100)
  );
  const category = categories.find((c) => c.id === product.category_id);

  return {
    ...product,
    category_name: category ? category.name : product.category_name,
    totalStock,
    stockLabel: totalStock > 5 ? 'много' : 'мало',
    isLowStock: totalStock <= 3,
    discountPercent,
    discountedPrice,
  };
}

export function getTodayIsoDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}