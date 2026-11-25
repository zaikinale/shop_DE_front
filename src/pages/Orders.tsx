import { useEffect, useMemo, useState, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import Notice, { type NoticeData } from '../components/Notice';
import Order from '../components/Order';
import { useAuthStore } from '../store/useAuthStore';
import { useShopStore } from '../store/useShopStore';
import type { DraftOrderItem } from '../types';
import { enrichProduct } from '../utils/catalogLogic';

export default function Orders() {
  const navigate = useNavigate();

  const user = useAuthStore((state) => state.user);
  const products = useShopStore((state) => state.products);
  const categories = useShopStore((state) => state.categories);
  const orders = useShopStore((state) => state.orders);
  const isLoading = useShopStore((state) => state.isLoading);
  const initShopData = useShopStore((state) => state.initShopData);
  const createOrder = useShopStore((state) => state.createOrder);
  const deleteOrder = useShopStore((state) => state.deleteOrder);
  const updateOrderDate = useShopStore((state) => state.updateOrderDate);
  const deleteOrderItem = useShopStore((state) => state.deleteOrderItem);

  const [notice, setNotice] = useState<NoticeData | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Состояние формы добавления заказа
  const [clientName, setClientName] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [selectedProductId, setSelectedProductId] = useState<number | null>(
    null
  );
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(
    null
  );
  const [quantityInput, setQuantityInput] = useState('1');
  const [fieldError, setFieldError] = useState('');
  const [newOrderItems, setNewOrderItems] = useState<DraftOrderItem[]>([]);

  useEffect(() => {
    initShopData();
  }, [initShopData]);

  const isAdmin = user?.role_code === 'admin';

  const enrichedProducts = useMemo(() => {
    return products.map((product) => enrichProduct(product, categories, orders));
  }, [products, categories, orders]);

  const filteredProducts = useMemo(() => {
    const query = productSearch.trim().toLowerCase();

    if (!query) {
      return enrichedProducts;
    }

    return enrichedProducts.filter((product) =>
      product.name.toLowerCase().includes(query)
    );
  }, [enrichedProducts, productSearch]);

  const selectedProduct =
    enrichedProducts.find((product) => product.id === selectedProductId) ??
    null;

  const getAvailableQuantity = (variantId: number, baseQuantity: number) => {
    const reserved = newOrderItems.find((item) => item.variant_id === variantId);
    const used = reserved ? reserved.quantity : 0;
    return Math.max(0, baseQuantity - used);
  };

  const selectedVariant =
    selectedProduct?.variants.find((v) => v.id === selectedVariantId) ?? null;

  const selectedAvailable = selectedVariant
    ? getAvailableQuantity(selectedVariant.id, selectedVariant.quantity)
    : 0;

  const handleQuantityChange = (event: ChangeEvent<HTMLInputElement>) => {
    const raw = event.target.value;

    if (!/^\d*$/.test(raw)) {
      setFieldError('Введите целое положительное число.');
      return;
    }

    setQuantityInput(raw);

    if (raw === '') {
      setFieldError('Укажите количество.');
      return;
    }

    const parsed = Number(raw);

    if (parsed <= 0) {
      setFieldError('Количество должно быть больше нуля.');
      return;
    }

    if (selectedVariant && parsed > selectedAvailable) {
      setFieldError(`Доступно не более ${selectedAvailable} шт.`);
      return;
    }

    setFieldError('');
  };

  const handleAddPosition = () => {
    if (!selectedProduct || !selectedVariant) {
      setFieldError('Выберите товар и доступный вариант.');
      return;
    }

    const parsed = Number(quantityInput);

    if (!quantityInput || !Number.isInteger(parsed) || parsed <= 0) {
      setFieldError('Введите целое число больше нуля.');
      return;
    }

    if (parsed > selectedAvailable) {
      setFieldError(`Доступно не более ${selectedAvailable} шт.`);
      return;
    }

    setNewOrderItems((prev) => {
      const existing = prev.find(
        (item) => item.variant_id === selectedVariant.id
      );

      if (existing) {
        return prev.map((item) => {
          if (item.variant_id !== selectedVariant.id) {
            return item;
          }

          return {
            ...item,
            quantity: item.quantity + parsed,
          };
        });
      }

      return [
        ...prev,
        {
          variant_id: selectedVariant.id,
          product_id: selectedProduct.id,
          product_name: selectedProduct.name,
          manufacturer_name: selectedProduct.manufacturer_name,
          size: selectedVariant.size,
          quantity: parsed,
          unit_price: selectedProduct.discountedPrice,
        },
      ];
    });

    setSelectedVariantId(null);
    setQuantityInput('1');
    setFieldError('');
  };

  const resetCreateForm = () => {
    setIsCreating(false);
    setClientName('');
    setProductSearch('');
    setSelectedProductId(null);
    setSelectedVariantId(null);
    setQuantityInput('1');
    setFieldError('');
    setNewOrderItems([]);
  };

  const handleSaveOrder = () => {
    if (!clientName.trim()) {
      setFieldError('Укажите ФИО клиента.');
      return;
    }

    if (newOrderItems.length === 0) {
      setFieldError('Добавьте хотя бы одну позицию в заказ.');
      return;
    }

    const created = createOrder(clientName, newOrderItems, user?.id ?? 0);

    if (created) {
      resetCreateForm();
      setNotice({
        type: 'info',
        title: `Заказ №${created.id} создан`,
        message: 'Остатки товаров списаны и сохранены.',
      });
    }
  };

  const handleDeleteOrder = (orderId: number) => {
    deleteOrder(orderId);
    setNotice({
      type: 'warning',
      title: `Заказ №${orderId} удалён`,
      message: 'Списанные товары возвращены в остатки каталога.',
    });
  };

  const handleChangeDate = (orderId: number, newDate: string) => {
    updateOrderDate(orderId, newDate);
    setNotice({
      type: 'info',
      title: 'Дата обновлена',
      message: `Для заказа №${orderId} установлена дата ${newDate}.`,
    });
  };

  const handleDeleteItem = (orderId: number, itemId: number) => {
    deleteOrderItem(orderId, itemId);
    setNotice({
      type: 'warning',
      title: 'Позиция удалена',
      message: `Позиция удалена из заказа №${orderId}, остаток возвращён в каталог.`,
    });
  };

  const newOrderTotal = newOrderItems.reduce(
    (sum, item) => sum + item.unit_price * item.quantity,
    0
  );

  return (
    <main className="container">
      <div className="page-bar">
        <h1>Управление заказами</h1>
        <div className="df g10">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setIsCreating((prev) => !prev)}
          >
            {isCreating ? 'Скрыть форму' : '+ Новый заказ'}
          </button>
          <button type="button" className="btn" onClick={() => navigate('/')}>
            ← Назад
          </button>
        </div>
      </div>

      <Notice notice={notice} onClose={() => setNotice(null)} />

      {isCreating && (
        <section className="box df fdc g10">
          <h2>Новый заказ</h2>

          <input
            type="text"
            className="input"
            placeholder="ФИО клиента"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
          />

          <input
            type="text"
            className="input"
            placeholder="Поиск товара по наименованию..."
            value={productSearch}
            onChange={(e) => setProductSearch(e.target.value)}
          />

          <div className="size-buttons">
            {filteredProducts.map((product) => (
              <button
                key={product.id}
                type="button"
                className={`size-btn ${
                  selectedProductId === product.id ? 'active' : ''
                }`}
                onClick={() => {
                  setSelectedProductId(product.id);
                  setSelectedVariantId(null);
                  setQuantityInput('1');
                  setFieldError('');
                }}
              >
                {product.manufacturer_name} | {product.name} (
                {product.discountedPrice.toLocaleString('ru-RU')} ₽)
              </button>
            ))}
          </div>

          {selectedProduct && (
            <div className="df fdc g10">
              <span className="muted">Выберите вариант:</span>
              <div className="size-buttons">
                {selectedProduct.variants.map((variant) => {
                  const available = getAvailableQuantity(
                    variant.id,
                    variant.quantity
                  );

                  return (
                    <button
                      key={variant.id}
                      type="button"
                      className={`size-btn ${
                        selectedVariantId === variant.id ? 'active' : ''
                      }`}
                      disabled={available === 0}
                      onClick={() => {
                        setSelectedVariantId(variant.id);
                        setQuantityInput('1');
                        setFieldError('');
                      }}
                    >
                      {variant.size} ({available} шт.)
                    </button>
                  );
                })}
              </div>

              <div className="df g10 aic">
                <input
                  type="text"
                  inputMode="numeric"
                  className="input"
                  placeholder="Количество"
                  value={quantityInput}
                  disabled={!selectedVariant}
                  onChange={handleQuantityChange}
                />
                <button
                  type="button"
                  className="btn btn-secondary"
                  disabled={!selectedVariant || Boolean(fieldError)}
                  onClick={handleAddPosition}
                >
                  Добавить позицию
                </button>
              </div>
            </div>
          )}

          {fieldError && <div className="error-text">{fieldError}</div>}

          {newOrderItems.length > 0 && (
            <table className="table">
              <thead>
                <tr>
                  <th>Товар</th>
                  <th>Вариант</th>
                  <th>Кол-во</th>
                  <th>Сумма</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {newOrderItems.map((item) => (
                  <tr key={item.variant_id}>
                    <td>
                      {item.manufacturer_name} | {item.product_name}
                    </td>
                    <td>{item.size}</td>
                    <td>{item.quantity}</td>
                    <td>
                      {(item.unit_price * item.quantity).toLocaleString(
                        'ru-RU'
                      )}{' '}
                      ₽
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-danger"
                        onClick={() =>
                          setNewOrderItems((prev) =>
                            prev.filter(
                              (entry) => entry.variant_id !== item.variant_id
                            )
                          )
                        }
                      >
                        Убрать
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <div className="df jcsb aic fww g10">
            <strong>
              Итого: {newOrderTotal.toLocaleString('ru-RU')} ₽
            </strong>
            <div className="df g10">
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSaveOrder}
              >
                Создать заказ
              </button>
              <button
                type="button"
                className="btn"
                onClick={resetCreateForm}
              >
                Отмена
              </button>
            </div>
          </div>
        </section>
      )}

      {isLoading ? (
        <div className="box muted">Загрузка заказов...</div>
      ) : orders.length === 0 ? (
        <div className="box muted">Заказов пока нет</div>
      ) : (
        <div className="stack">
          {orders.map((order) => (
            <Order
              key={order.id}
              order={order}
              isAdmin={isAdmin}
              onDeleteOrder={handleDeleteOrder}
              onChangeDate={handleChangeDate}
              onDeleteItem={handleDeleteItem}
            />
          ))}
        </div>
      )}
    </main>
  );
}