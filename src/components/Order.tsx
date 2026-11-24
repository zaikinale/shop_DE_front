import type { Order as OrderType } from '../types';
import ProductItem from './ProductItem';

interface OrderProps {
  order: OrderType;
}

export default function Order({ order }: OrderProps) {
  const totalPrice =
    order.total_price ??
    order.items.reduce((sum, item) => sum + item.unit_price * item.quantity, 0);

  return (
    <div className="order">
      <div className="order__meta">
        <h3 className="order__title">Заказ №{order.id}</h3>
        <p className="order__client">ФИО заказчика: {order.client_full_name}</p>
        <p className="order__date">Дата заказа: {order.order_date}</p>
        <p className="order__total">
          Итого: {totalPrice.toLocaleString('ru-RU')} ₽
        </p>
      </div>

      <div className="order__basket">
        {order.items.map((item) => (
          <ProductItem key={item.id} data={item} />
        ))}
      </div>
    </div>
  );
}