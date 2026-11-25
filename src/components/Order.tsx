import type { Order as OrderType } from '../types';
import ProductItem from './ProductItem';

interface OrderProps {
  order: OrderType;
  isAdmin: boolean;
  onDeleteOrder: (orderId: number) => void;
  onChangeDate: (orderId: number, newDate: string) => void;
  onDeleteItem: (orderId: number, itemId: number) => void;
}

export default function Order({
  order,
  isAdmin,
  onDeleteOrder,
  onChangeDate,
  onDeleteItem,
}: OrderProps) {
  const totalPrice =
    order.total_price ??
    order.items.reduce((sum, item) => sum + item.unit_price * item.quantity, 0);

  return (
    <article className="order">
      <div className="order__meta">
        <div className="df fdc g8">
          <h3>Заказ №{order.id}</h3>
          <span className="muted">Клиент: {order.client_full_name}</span>
        </div>

        <div className="df aic g10 fww">
          {isAdmin ? (
            <label className="df aic g8">
              <span className="muted">Дата:</span>
              <input
                type="date"
                className="input"
                value={order.order_date}
                onChange={(e) => onChangeDate(order.id, e.target.value)}
              />
            </label>
          ) : (
            <span className="muted">Дата: {order.order_date}</span>
          )}

          <span className="order__total">
            {totalPrice.toLocaleString('ru-RU')} ₽
          </span>

          <button
            type="button"
            className="btn btn-danger"
            onClick={() => onDeleteOrder(order.id)}
          >
            Удалить заказ
          </button>
        </div>
      </div>

      {order.items.length === 0 ? (
        <p className="muted">В заказе не осталось позиций.</p>
      ) : (
        <div className="order__basket">
          {order.items.map((item) => (
            <ProductItem
              key={item.id}
              data={item}
              isAdmin={isAdmin}
              onDeleteItem={(itemId) => onDeleteItem(order.id, itemId)}
            />
          ))}
        </div>
      )}
    </article>
  );
}