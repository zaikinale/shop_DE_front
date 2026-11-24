import mockData from '../datas/mockData.json'
import type { Category, Order, Product, StoreInfo, User } from '../types';

export type VariantKey = 'variantA' | 'variantB';

export interface Dataset {
  companyName: string;
  catalogTitle: string;
  users: User[];
  categories: Category[];
  products: Product[];
  orders: Order[];
}

const datasets = mockData as unknown as Record<VariantKey, Dataset>;

// Выберите 'variantA' (СтепМаркет) или 'variantB' (СпортЛиния)
let activeVariant: VariantKey = 'variantB';

export function simulateRequest<T>(data: T, delay = 150): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(structuredClone(data)), delay);
  });
}

export function getDataset(variant: VariantKey = activeVariant): Dataset {
  const dataset = datasets[variant];
  if (!dataset) {
    throw new Error(`Вариант "${variant}" не найден в мок-файле`);
  }
  return dataset;
}

export function setVariant(variant: VariantKey): void {
  if (!datasets[variant]) {
    throw new Error(`Неизвестный вариант: ${variant}`);
  }
  activeVariant = variant;
}

export function getCurrentVariant(): VariantKey {
  return activeVariant;
}

export async function getStoreInfo(variant?: VariantKey): Promise<StoreInfo> {
  const { companyName, catalogTitle } = getDataset(variant);
  return simulateRequest({ companyName, catalogTitle });
}

// Реэкспорт всех API-функций из единой точки входа
export * from './goods';
export * from './orders';
export * from './users';