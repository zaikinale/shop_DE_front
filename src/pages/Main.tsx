import { useEffect, useMemo } from 'react';
import Filter from '../components/Filter';
import ProductCard from '../components/ProductCard';
import { useAuthStore } from '../store/useAuthStore';
import { useShopStore } from '../store/useShopStore';
import { enrichProduct } from '../utils/catalogLogic';

export default function Main() {
  const user = useAuthStore((state) => state.user);
  const storeInfo = useShopStore((state) => state.storeInfo);
  const products = useShopStore((state) => state.products);
  const categories = useShopStore((state) => state.categories);
  const orders = useShopStore((state) => state.orders);
  const filters = useShopStore((state) => state.filters);
  const isLoading = useShopStore((state) => state.isLoading);
  const initShopData = useShopStore((state) => state.initShopData);

  useEffect(() => {
    initShopData();
  }, [initShopData]);

  const visibleProducts = useMemo(() => {
    const enriched = products.map((product) =>
      enrichProduct(product, categories, orders)
    );

    if (!user) {
      return enriched;
    }

    const query = (filters.search ?? '').trim().toLowerCase();

    return enriched
      .filter((item) => {
        if (filters.categoryId && item.category_id !== filters.categoryId) {
          return false;
        }

        if (!query) {
          return true;
        }

        return (
          item.name.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query)
        );
      })
      .sort((a, b) => {
        if (filters.sortByPrice === 'asc') {
          return a.discountedPrice - b.discountedPrice;
        }

        if (filters.sortByPrice === 'desc') {
          return b.discountedPrice - a.discountedPrice;
        }

        return 0;
      });
  }, [products, categories, orders, filters, user]);

  return (
    <main className="container">
      <div className="page-bar">
        <h1>{storeInfo.catalogTitle || 'Каталог товаров'}</h1>
        <span className="muted">Найдено: {visibleProducts.length}</span>
      </div>

      {user && <Filter />}

      <div className="stack">
        {isLoading ? (
          <div className="box muted">Загрузка товаров...</div>
        ) : visibleProducts.length === 0 ? (
          <div className="box muted">Товары не найдены</div>
        ) : (
          visibleProducts.map((product) => (
            <ProductCard key={product.id} data={product} />
          ))
        )}
      </div>
    </main>
  );
}