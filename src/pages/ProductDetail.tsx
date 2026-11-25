import { useEffect, useState, type ChangeEvent, type SyntheticEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Notice, { type NoticeData } from '../components/Notice';
import { useAuthStore } from '../store/useAuthStore';
import { useShopStore } from '../store/useShopStore';
import { enrichProduct } from '../utils/catalogLogic';
import picture from '../assets/placeholder.png'

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const user = useAuthStore((state) => state.user);
  const products = useShopStore((state) => state.products);
  const categories = useShopStore((state) => state.categories);
  const orders = useShopStore((state) => state.orders);
  const draftItems = useShopStore((state) => state.draftItems);
  const isInitialized = useShopStore((state) => state.isInitialized);
  const initShopData = useShopStore((state) => state.initShopData);
  const addDraftItem = useShopStore((state) => state.addDraftItem);
  const removeDraftItem = useShopStore((state) => state.removeDraftItem);
  const clearDraft = useShopStore((state) => state.clearDraft);
  const confirmOrder = useShopStore((state) => state.confirmOrder);

  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(
    null
  );
  const [quantityInput, setQuantityInput] = useState<string>('1');
  const [fieldError, setFieldError] = useState<string>('');
  const [notice, setNotice] = useState<NoticeData | null>(null);

  useEffect(() => {
    initShopData();
  }, [initShopData]);

  const rawProduct = products.find((item) => item.id === Number(id));
  const product = rawProduct
    ? enrichProduct(rawProduct, categories, orders)
    : null;

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  if (!isInitialized) {
    return (
      <div className="container">
        <p>Загрузка товара...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container">
        <div className="page-bar">
          <h1>Товар не найден</h1>
          <button type="button" className="btn" onClick={handleBack}>
            ← Назад
          </button>
        </div>
        <Notice
          notice={{
            type: 'error',
            title: 'Ошибка',
            message: 'Товар с указанным идентификатором не найден в каталоге.',
          }}
        />
      </div>
    );
  }

  const getAvailableQuantity = (variantId: number, baseQuantity: number) => {
    const inDraft = draftItems.find((item) => item.variant_id === variantId);
    const reserved = inDraft ? inDraft.quantity : 0;
    return Math.max(0, baseQuantity - reserved);
  };

  const selectedVariant =
    product.variants.find((variant) => variant.id === selectedVariantId) ??
    null;

  const selectedAvailable = selectedVariant
    ? getAvailableQuantity(selectedVariant.id, selectedVariant.quantity)
    : 0;

  const imgSrc = product.image ? product.image : {picture};

  const handleImageError = (event: SyntheticEvent<HTMLImageElement>) => {
    event.currentTarget.onerror = null;
    event.currentTarget.src = picture;
  };

  const handleSelectVariant = (variantId: number) => {
    setSelectedVariantId(variantId);
    setQuantityInput('1');
    setFieldError('');
  };

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

  const handleAddToDraft = () => {
    if (!selectedVariant) {
      setFieldError('Выберите доступный размер/параметр.');
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

    addDraftItem({
      variant_id: selectedVariant.id,
      product_id: product.id,
      product_name: product.name,
      manufacturer_name: product.manufacturer_name,
      size: selectedVariant.size,
      quantity: parsed,
      unit_price: product.discountedPrice,
    });

    setFieldError('');
    setQuantityInput('1');
    setSelectedVariantId(null);
    setNotice({
      type: 'info',
      title: 'Позиция добавлена',
      message: `${product.name} (${selectedVariant.size}) — ${parsed} шт. добавлено в черновик заказа.`,
    });
  };

  const handleCancelOrder = () => {
    clearDraft();
    setNotice({
      type: 'warning',
      title: 'Заказ отменён',
      message: 'Черновик заказа очищен.',
    });
  };

  const handleConfirmOrder = () => {
    if (!user) {
      return;
    }

    const createdOrder = confirmOrder(user);

    if (!createdOrder) {
      setNotice({
        type: 'error',
        title: 'Пустой заказ',
        message: 'Добавьте хотя бы одну позицию перед подтверждением.',
      });
      return;
    }

    setSelectedVariantId(null);
    setQuantityInput('1');
    setNotice({
      type: 'info',
      title: `Заказ №${createdOrder.id} оформлен`,
      message: `Дата: ${createdOrder.order_date}. Остатки товаров обновлены и сохранены.`,
    });
  };

  const draftTotal = draftItems.reduce(
    (sum, item) => sum + item.unit_price * item.quantity,
    0
  );

  return (
    <div className="container sec">
      <div className="page-bar df jcsb aic g20">
        <h2>Карточка товара</h2>
        <button type="button" className="btn" onClick={handleBack}>
          ← Назад
        </button>
      </div>

      <Notice notice={notice} onClose={() => setNotice(null)} />

      <div className="panel df fdc">
        <div className="detail df g20">
          <img
            className="detail-image img--big"
            src={imgSrc}
            alt={product.name}
            onError={handleImageError}
          />

          <div>
            <h2 className="product-title tas">
              {product.manufacturer_name} | {product.name}
            </h2>

            <div className="product-meta df fdc g10 ais">
              <div>
                <strong>Категория:</strong> {product.category_name}
              </div>
              <div>
                <strong>Состав:</strong> {product.composition}
              </div>
              <div>
                <strong>Описание:</strong> {product.description}
              </div>
              <div>
                <strong>Наличие:</strong> {product.stockLabel} (всего{' '}
                {product.totalStock} шт.)
              </div>
            </div>

            <div className="df fdc ais g10 sec">
              {product.discountPercent > 0 && (
                <div className="df ais g10">
                  <span className="price-old">
                    {product.base_price.toLocaleString('ru-RU')} ₽
                  </span>{' '}
                  <span className="discount-badge">
                    Скидка - {product.discountPercent}%
                  </span>
                </div>
              )}
              <div className="price-current">
                {product.discountedPrice.toLocaleString('ru-RU')} ₽
              </div>
            </div>

            <div className="df fdc aic block g20">
              <strong>Доступные варианты:</strong>
              <div className="size-buttons df g10 ">
                {product.variants.map((variant) => {
                  const available = getAvailableQuantity(
                    variant.id,
                    variant.quantity
                  );
                  const isActive = selectedVariantId === variant.id;

                  return (
                    <button
                      key={variant.id}
                      type="button"
                      className={`size-btn ${isActive ? 'active' : ''}`}
                      disabled={!user || available === 0}
                      onClick={() => handleSelectVariant(variant.id)}
                    >
                      {variant.size} ({available} шт.)
                    </button>
                  );
                })}
              </div>
            </div>

            {user ? (
              <div >
                <div 
                  className="df g20 sec"
                  // style={{
                  //   display: 'flex',
                  //   gap: '12px',
                  //   alignItems: 'center',
                  //   maxWidth: '340px',
                  // }}
                >
                  <input
                    type="text"
                    inputMode="numeric"
                    className="input"
                    value={quantityInput}
                    disabled={!selectedVariant}
                    placeholder="Количество"
                    onChange={handleQuantityChange}
                  />
                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={!selectedVariant || Boolean(fieldError)}
                    onClick={handleAddToDraft}
                  >
                    Добавить
                  </button>
                </div>

                {fieldError && (
                  <p className="error-text" style={{ marginTop: '8px' }}>
                    {fieldError}
                  </p>
                )}

                {selectedVariant && !fieldError && (
                  <div className="field-hint">
                    Выбран вариант «{selectedVariant.size}», доступно{' '}
                    {selectedAvailable} шт.
                  </div>
                )}
              </div>
            ) : (
              <Notice
                notice={{
                  type: 'info',
                  title: 'Гостевой режим',
                  message:
                    'Для выбора варианта и оформления заказа выполните вход в систему.',
                }}
              />
            )}
          </div>
        </div>
      </div>

      {user && draftItems.length > 0 && (
        <div className="panel">
          <div className="page-bar">
            <h2>Черновик заказа</h2>
            <strong>Итого: {draftTotal.toLocaleString('ru-RU')} ₽</strong>
          </div>

          <table className="table">
            <thead>
              <tr>
                <th>Товар</th>
                <th>Вариант</th>
                <th>Кол-во</th>
                <th>Цена</th>
                <th>Сумма</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {draftItems.map((item) => (
                <tr key={item.variant_id}>
                  <td>
                    {item.manufacturer_name} | {item.product_name}
                  </td>
                  <td>{item.size}</td>
                  <td>{item.quantity}</td>
                  <td>{item.unit_price.toLocaleString('ru-RU')} ₽</td>
                  <td>
                    {(item.unit_price * item.quantity).toLocaleString('ru-RU')}{' '}
                    ₽
                  </td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={() => removeDraftItem(item.variant_id)}
                    >
                      Удалить
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div
            style={{
              display: 'flex',
              gap: '12px',
              marginTop: '16px',
            }}
          >
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleConfirmOrder}
            >
              Подтвердить заказ
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={handleCancelOrder}
            >
              Отказаться от заказа
            </button>
          </div>
        </div>
      )}
    </div>
  );
}