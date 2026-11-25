import { useState } from 'react';
import type { OrderItem } from '../types';

interface ProductItemProps {
  data: OrderItem;
  isAdmin: boolean;
  onDeleteItem: (itemId: number) => void;
}

export default function ProductItem({
  data,
  isAdmin,
  onDeleteItem,
}: ProductItemProps) {
  const [confirming, setConfirming] = useState(false);
  const lineTotal = data.unit_price * data.quantity;

  const handleConfirmDelete = () => {
    onDeleteItem(data.id);
    setConfirming(false);
  };

  return (
    <div className="order-item">
      <div className="df fdc g8">
        <strong>
          {data.manufacturer_name} | {data.product_name}
        </strong>
        <span className="muted">Вариант: {data.size}</span>
      </div>

      <div className="df aic g10 fww">
        <div className="df fdc aie">
          <span className="muted">
            {data.quantity} шт. × {data.unit_price.toLocaleString('ru-RU')} ₽
          </span>
          <strong>{lineTotal.toLocaleString('ru-RU')} ₽</strong>
        </div>

        {isAdmin && !confirming && (
          <button
            type="button"
            className="btn btn-danger"
            onClick={() => setConfirming(true)}
          >
            Удалить позицию
          </button>
        )}

        {isAdmin && confirming && (
          <div className="df aic g8 fww">
            <span className="muted">Необратимо. Удалить?</span>
            <button
              type="button"
              className="btn btn-danger"
              onClick={handleConfirmDelete}
            >
              Да, удалить
            </button>
            <button
              type="button"
              className="btn"
              onClick={() => setConfirming(false)}
            >
              Отмена
            </button>
          </div>
        )}
      </div>
    </div>
  );
}