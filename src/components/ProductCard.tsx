import type { Product } from '../types';

import placeholder from '../assets/placeholder.png'

interface ProductCardProps {
    data: Product;
}

export default function ProductCard({ data }: ProductCardProps) {
    const totalQuantity = data.variants.reduce((sum, v) => sum + v.quantity, 0);

    return (
        <div className="card">
            <img
                className="card__img"
                src={data.image || placeholder}
                alt={data.name}
            />    
            <div className="card__content">
                <div className="content__desc">
                    <h3 className="desc__title">
                        {data.manufacturer_name} | {data.name}
                    </h3>
                    <p className="desc__category">Категория: {data.category_name}</p>
                    <p className="desc__quantity">Количество: {totalQuantity} шт.</p>
                    <p className="desc__composition">Состав: {data.composition}</p>
                </div>

                <div className="content__price">
                    <p className="price__now">
                        {data.base_price.toLocaleString('ru-RU')} ₽
                    </p>
                </div>
            </div>
        </div>
    );
}