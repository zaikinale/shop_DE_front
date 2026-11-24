export type RoleCode = 'client' | 'manager' | 'admin';

export interface User {
  id: number;
  login: string;
  full_name: string;
  role_code: RoleCode;
  role_name: string;
}

export interface StoreInfo {
  companyName: string;
  catalogTitle: string;
}

export interface Category {
  id: number;
  name: string;
}

export interface ProductVariant {
  id: number;
  size: string;
  quantity: number;
}

export interface Product {
  id: number;
  name: string;
  category_id: number;
  category_name: string;
  manufacturer_name: string;
  composition: string;
  description: string;
  base_price: number;
  image: string;
  variants: ProductVariant[];
}

export interface OrderItem {
  id: number;
  variant_id: number;
  product_id: number;
  product_name: string;
  manufacturer_name: string;
  size: string;
  quantity: number;
  unit_price: number;
}

export interface Order {
  id: number;
  user_id: number;
  client_full_name: string;
  order_date: string;
  items: OrderItem[];
  total_price?: number;
}