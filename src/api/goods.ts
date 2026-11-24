import { simulateRequest, getDataset } from './index'

export const getProducts = async (filters = {}, variant) => {
  let products = [...getDataset(variant).products];

  if (filters.categoryId) {
    products = products.filter((p) => p.category_id === Number(filters.categoryId));
  }

  if (filters.manufacturer) {
    products = products.filter((p) => p.manufacturer_name === filters.manufacturer);
  }

  if (filters.search) {
    const query = filters.search.trim().toLowerCase();
    products = products.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.composition.toLowerCase().includes(query) ||
        p.manufacturer_name.toLowerCase().includes(query)
    );
  }

  if (filters.inStockOnly) {
    products = products.filter((p) =>
      p.variants.some((v) => v.quantity > 0)
    );
  }

  if (filters.sortByPrice === 'asc') {
    products.sort((a, b) => a.base_price - b.base_price);
  } else if (filters.sortByPrice === 'desc') {
    products.sort((a, b) => b.base_price - a.base_price);
  }

  return simulateRequest(products);
};

export const getProductById = async (id, variant) => {
  const product = getDataset(variant).products.find((p) => p.id === Number(id)) || null;
  return simulateRequest(product);
};
