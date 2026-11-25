import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  getCategories,
  getOrders,
  getProducts,
  getStoreInfo,
  type ProductFilters,
} from '../api';
import type {
  Category,
  DraftOrderItem,
  Order,
  Product,
  StoreInfo,
  User,
} from '../types';
import { getTodayIsoDate } from '../utils/catalogLogic';

interface StockChangeItem {
  variant_id: number;
  quantity: number;
}

interface ShopState {
  isInitialized: boolean;
  storeInfo: StoreInfo;
  categories: Category[];
  products: Product[];
  orders: Order[];
  draftItems: DraftOrderItem[];
  filters: ProductFilters;
  isLoading: boolean;

  initShopData: () => Promise<void>;
  fetchStoreInfo: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  fetchProducts: () => Promise<void>;
  fetchOrders: () => Promise<void>;
  setFilters: (patch: Partial<ProductFilters>) => void;
  resetFilters: () => void;

  addDraftItem: (item: DraftOrderItem) => void;
  removeDraftItem: (variantId: number) => void;
  clearDraft: () => void;
  confirmOrder: (user: User) => Order | null;

  createOrder: (
    clientFullName: string,
    items: DraftOrderItem[],
    userId?: number
  ) => Order | null;
  deleteOrder: (orderId: number) => void;
  updateOrderDate: (orderId: number, newDate: string) => void;
  deleteOrderItem: (orderId: number, itemId: number) => void;
}

const initialFilters: ProductFilters = {
  search: '',
  categoryId: undefined,
  sortByPrice: 'asc',
};

function adjustProductStock(
  products: Product[],
  items: StockChangeItem[],
  direction: 'deduct' | 'restore'
): Product[] {
  const factor = direction === 'deduct' ? -1 : 1;

  return products.map((product) => ({
    ...product,
    variants: product.variants.map((variant) => {
      const delta = items
        .filter((item) => item.variant_id === variant.id)
        .reduce((sum, item) => sum + item.quantity, 0);

      if (delta === 0) {
        return variant;
      }

      return {
        ...variant,
        quantity: Math.max(0, variant.quantity + delta * factor),
      };
    }),
  }));
}

export const useShopStore = create<ShopState>()(
  persist(
    (set, get) => ({
      isInitialized: false,
      storeInfo: { companyName: '', catalogTitle: '' },
      categories: [],
      products: [],
      orders: [],
      draftItems: [],
      filters: initialFilters,
      isLoading: false,

      initShopData: async () => {
        if (get().isInitialized || get().isLoading) {
          return;
        }

        set({ isLoading: true });
        try {
          const [storeInfo, categories, products, orders] = await Promise.all([
            getStoreInfo(),
            getCategories(),
            getProducts(),
            getOrders(),
          ]);

          set({
            storeInfo,
            categories,
            products,
            orders,
            isInitialized: true,
            isLoading: false,
          });
        } catch {
          set({ isLoading: false });
        }
      },

      fetchStoreInfo: async () => {
        await get().initShopData();
      },

      fetchCategories: async () => {
        await get().initShopData();
      },

      fetchProducts: async () => {
        await get().initShopData();
      },

      fetchOrders: async () => {
        await get().initShopData();
      },

      setFilters: (patch) => {
        set((state) => ({
          filters: { ...state.filters, ...patch },
        }));
      },

      resetFilters: () => {
        set({ filters: initialFilters });
      },

      addDraftItem: (newItem) => {
        set((state) => {
          const existing = state.draftItems.find(
            (item) => item.variant_id === newItem.variant_id
          );

          if (existing) {
            return {
              draftItems: state.draftItems.map((item) => {
                if (item.variant_id !== newItem.variant_id) {
                  return item;
                }
                return {
                  ...item,
                  quantity: item.quantity + newItem.quantity,
                };
              }),
            };
          }

          return {
            draftItems: [...state.draftItems, newItem],
          };
        });
      },

      removeDraftItem: (variantId) => {
        set((state) => ({
          draftItems: state.draftItems.filter(
            (item) => item.variant_id !== variantId
          ),
        }));
      },

      clearDraft: () => {
        set({ draftItems: [] });
      },

      createOrder: (clientFullName, items, userId = 0) => {
        const { orders, products } = get();

        if (items.length === 0) {
          return null;
        }

        const nextOrderId =
          orders.reduce((maxId, order) => Math.max(maxId, order.id), 0) + 1;

        const maxItemId = orders.reduce((maxId, order) => {
          const orderMax = order.items.reduce(
            (m, item) => Math.max(m, item.id),
            0
          );
          return Math.max(maxId, orderMax);
        }, 2000);

        const orderItems = items.map((item, index) => ({
          ...item,
          id: maxItemId + index + 1,
        }));

        const totalPrice = orderItems.reduce(
          (sum, item) => sum + item.unit_price * item.quantity,
          0
        );

        const newOrder: Order = {
          id: nextOrderId,
          user_id: userId,
          client_full_name: clientFullName.trim(),
          order_date: getTodayIsoDate(),
          items: orderItems,
          total_price: totalPrice,
        };

        set({
          orders: [newOrder, ...orders],
          products: adjustProductStock(products, items, 'deduct'),
        });

        return newOrder;
      },

      confirmOrder: (user) => {
        const { draftItems, createOrder } = get();
        const createdOrder = createOrder(user.full_name, draftItems, user.id);

        if (createdOrder) {
          set({ draftItems: [] });
        }

        return createdOrder;
      },

      deleteOrder: (orderId) => {
        const { orders, products } = get();
        const targetOrder = orders.find((order) => order.id === orderId);

        if (!targetOrder) {
          return;
        }

        set({
          orders: orders.filter((order) => order.id !== orderId),
          products: adjustProductStock(products, targetOrder.items, 'restore'),
        });
      },

      updateOrderDate: (orderId, newDate) => {
        if (!newDate) {
          return;
        }

        set((state) => ({
          orders: state.orders.map((order) => {
            if (order.id !== orderId) {
              return order;
            }

            return {
              ...order,
              order_date: newDate,
            };
          }),
        }));
      },

      deleteOrderItem: (orderId, itemId) => {
        const { orders, products } = get();
        const targetOrder = orders.find((order) => order.id === orderId);

        if (!targetOrder) {
          return;
        }

        const removedItem = targetOrder.items.find(
          (item) => item.id === itemId
        );

        if (!removedItem) {
          return;
        }

        const updatedOrders = orders.map((order) => {
          if (order.id !== orderId) {
            return order;
          }

          const remainingItems = order.items.filter(
            (item) => item.id !== itemId
          );
          const nextTotal = remainingItems.reduce(
            (sum, item) => sum + item.unit_price * item.quantity,
            0
          );

          return {
            ...order,
            items: remainingItems,
            total_price: nextTotal,
          };
        });

        set({
          orders: updatedOrders,
          products: adjustProductStock(products, [removedItem], 'restore'),
        });
      },
    }),
    {
      name: 'shop-storage',
      partialize: (state) => ({
        isInitialized: state.isInitialized,
        storeInfo: state.storeInfo,
        categories: state.categories,
        products: state.products,
        orders: state.orders,
        draftItems: state.draftItems,
      }),
    }
  )
);