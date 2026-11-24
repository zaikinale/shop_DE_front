import { useEffect } from 'react';
import Order from '../components/Order';
import { useAuthStore } from '../store/useAuthStore';
import { useShopStore } from '../store/useShopStore';

export default function Orders() {
  const user = useAuthStore((state) => state.user);
  const orders = useShopStore((state) => state.orders);
  const isLoading = useShopStore((state) => state.isLoading);
  const fetchOrders = useShopStore((state) => state.fetchOrders);

  useEffect(() => {
    const userId = user?.role_code === 'client' ? user.id : undefined;
    fetchOrders(userId);
  }, [user, fetchOrders]);

  if (isLoading) {
    return <p>Загрузка заказов...</p>;
  }

  return (
    <div className="orders-page">
      <h2>Заказы</h2>
      {orders.length === 0 ? (
        <p>Заказов пока нет</p>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <Order key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}