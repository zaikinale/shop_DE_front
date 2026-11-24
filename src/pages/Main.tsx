import { useEffect } from 'react';
import Filter from '../components/Filter';
import ProductCard from '../components/ProductCard';
import { useShopStore } from '../store/useShopStore';

export default function Main() {
    const products = useShopStore((state) => state.products);
    const isLoading = useShopStore((state) => state.isLoading);
    const fetchProducts = useShopStore((state) => state.fetchProducts);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    return (
        <div className="main">
            <Filter />
            <div className="main__container">
                {isLoading ? (
                    <p>Загрузка товаров...</p>
                ) : products.length === 0 ? (
                    <p>Товары не найдены</p>
                ) : (
                    products.map((product) => (
                        <ProductCard key={product.id} data={product} />
                    ))
                )}
            </div>
        </div>
    );
}