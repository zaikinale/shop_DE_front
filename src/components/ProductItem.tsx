import type { OrderItem } from '../types';

interface ProductItemProps {
  data: OrderItem;
}

export default function ProductItem({ data }: ProductItemProps) {
  const lineTotal = data.unit_price * data.quantity;

  return (
    <div className="order-item">
      <div className="order-item__info">
        <p className="order-item__name">
          {data.manufacturer_name} | {data.product_name}
        </p>
        <p className="order-item__size">Размер: {data.size}</p>
      </div>

      <div className="order-item__pricing">
        <p className="order-item__qty">
          {data.quantity} шт. × {data.unit_price.toLocaleString('ru-RU')} ₽
        </p>
        <p className="order-item__sum">
          {lineTotal.toLocaleString('ru-RU')} ₽
        </p>
      </div>
    </div>
  );
}