import type { SyntheticEvent } from 'react';
import { Link } from 'react-router-dom';
import picture from '../assets/placeholder.png';
import type { EnrichedProduct } from '../types';

interface ProductCardProps {
  data: EnrichedProduct;
}

export default function ProductCard({ data }: ProductCardProps) {
  const imgSrc = data.image ? data.image : picture;
  const cardClass = data.isLowStock ? 'card low-stock' : 'card';

  const handleImageError = (event: SyntheticEvent<HTMLImageElement>) => {
    event.currentTarget.onerror = null;
    event.currentTarget.src = picture;
  };

  return (
    <Link to={`/product/${data.id}`} className={cardClass}>
      <img
        className="card__img"
        src={imgSrc}
        alt={data.name}
        onError={handleImageError}
      />

      <div className="card__content">
        <div className="content__desc">
          <h3>
            {data.manufacturer_name} | {data.name}
          </h3>
          <p>
            <strong>Категория:</strong> {data.category_name}
          </p>
          <p>
            <strong>Количество:</strong> {data.stockLabel}
          </p>
          <p>
            <strong>Состав:</strong> {data.composition}
          </p>
        </div>

        <div className="content__price">
          {data.discountPercent > 0 && (
            <span className="price__old">
              {data.base_price.toLocaleString('ru-RU')} ₽
            </span>
          )}

          <span className="price__now">
            {data.discountedPrice.toLocaleString('ru-RU')} ₽
          </span>

          {data.discountPercent > 0 ? (
            <span className="price__discount">
              Скидка −{data.discountPercent}%
            </span>
          ) : (
            <span className="field-hint">Без скидки</span>
          )}
        </div>
      </div>
    </Link>
  );
}