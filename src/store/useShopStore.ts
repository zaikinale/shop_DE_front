import { create } from 'zustand';
import {
  getStoreInfo,
  getCategories,
  getProducts,
  getOrders,
  type ProductFilters,
} from '../api';
import type { StoreInfo, Category, Product, Order } from '../types';

interface ShopState {
  storeInfo: StoreInfo;
  categories: Category[];
  products: Product[];
  orders: Order[];
  filters: ProductFilters;
  isLoading: boolean;

  fetchStoreInfo: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  fetchProducts: (customFilters?: ProductFilters) => Promise<void>;
  setFilters: (patch: Partial<ProductFilters>) => Promise<void>;
  resetFilters: () => Promise<void>;
  fetchOrders: (userId?: number) => Promise<void>;
}

const initialFilters: ProductFilters = {
  search: '',
  categoryId: undefined,
  sortByPrice: 'asc',
};

let productsRequestId = 0;

export const useShopStore = create<ShopState>()((set, get) => ({
  storeInfo: { companyName: '', catalogTitle: '' },
  categories: [],
  products: [],
  orders: [],
  filters: initialFilters,
  isLoading: false,

  fetchStoreInfo: async () => {
    const storeInfo = await getStoreInfo();
    set({ storeInfo });
  },

  fetchCategories: async () => {
    const categories = await getCategories();
    set({ categories });
  },

  fetchProducts: async (customFilters) => {
    const requestId = ++productsRequestId;
    const activeFilters = customFilters ?? get().filters;

    if (get().products.length === 0) {
      set({ isLoading: true });
    }

    const products = await getProducts(activeFilters);

    if (requestId === productsRequestId) {
      set({ products, isLoading: false });
    }
  },

  setFilters: async (patch) => {
    const nextFilters = { ...get().filters, ...patch };
    set({ filters: nextFilters });
    await get().fetchProducts(nextFilters);
  },

  resetFilters: async () => {
    set({ filters: initialFilters });
    await get().fetchProducts(initialFilters);
  },

  fetchOrders: async (userId) => {
    set({ isLoading: true });
    const orders = await getOrders(userId ? { userId } : {});
    set({ orders, isLoading: false });
  },
}));