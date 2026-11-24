import { useEffect, useState } from "react";
import rawMockData from "./datas/mockData.json";

// Выберите ваш вариант: "variantA" (обувь) или "variantB" (спортинвентарь)
const ACTIVE_VARIANT = "variantA";
const STORAGE_KEY = `pr_de_state_${ACTIVE_VARIANT}`;

const initialDataset = rawMockData[ACTIVE_VARIANT];
const COMPANY_NAME = initialDataset.companyName;

const PAGE_TITLES = {
  catalog: `${COMPANY_NAME} — ${initialDataset.catalogTitle}`,
  detail: `${COMPANY_NAME} — Карточка товара`,
  login: `${COMPANY_NAME} — Авторизация`,
  orders: `${COMPANY_NAME} — Управление заказами`,
};

function loadInitialState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {
    // Если данные в localStorage повреждены — используем стартовый mockData.json
  }

  return {
    products: initialDataset.products,
    orders: initialDataset.orders,
  };
}

export default function App() {
  const [initialState] = useState(loadInitialState);

  // Основные данные приложения (синхронизируются с localStorage)
  const [products, setProducts] = useState(initialState.products);
  const [orders, setOrders] = useState(initialState.orders);
  const users = initialDataset.users;
  const categories = initialDataset.categories;

  // Текущий авторизованный пользователь (null = Гость)
  const [user, setUser] = useState(null);
  const [loginInput, setLoginInput] = useState("");

  // Многоэкранная навигация: "catalog" | "detail" | "login" | "orders"
  const [screen, setScreen] = useState("catalog");
  const [prevScreen, setPrevScreen] = useState("catalog");
  const [selectedProductId, setSelectedProductId] = useState(null);

  // Фильтры каталога (доступны авторизованному пользователю)
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("all");
  const [sortBy, setSortBy] = useState("");

  // Черновик текущего заказа и клиент, на которого он оформляется
  const [draftItems, setDraftItems] = useState([]);
  const [targetClient, setTargetClient] = useState(null);

  // Единое уведомление (type: "info" | "warning" | "error")
  const [notice, setNotice] = useState(null);

  // 1. Динамический заголовок вкладки браузера
  useEffect(() => {
    document.title = PAGE_TITLES[screen] || COMPANY_NAME;
  }, [screen]);

  // 2. Сохранение товаров и заказов в localStorage при любых изменениях
  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ products, orders })
    );
  }, [products, orders]);

  // Навигация между экранами с запоминанием предыдущего экрана для кнопки «Назад»
  const navigateTo = (nextScreen) => {
    setPrevScreen(screen);
    setScreen(nextScreen);
  };

  const handleBack = () => {
    if (prevScreen && prevScreen !== screen) {
      setScreen(prevScreen);
    } else {
      setScreen("catalog");
    }
  };

  // Авторизация только по логину (без пароля)
  const handleLogin = (event) => {
    event.preventDefault();
    const cleanedLogin = loginInput.trim();
    const foundUser = users.find((item) => item.login === cleanedLogin);

    if (!foundUser) {
      setNotice({
        type: "error",
        title: "Ошибка авторизации",
        message: "Пользователь с таким логином не найден.",
      });
      return;
    }

    setUser(foundUser);
    setTargetClient(foundUser);
    setLoginInput("");
    setScreen("catalog");
    setNotice({
      type: "info",
      title: "Вход выполнен",
      message: `Добро пожаловать, ${foundUser.full_name} (${foundUser.role_name}).`,
    });
  };

  // Выход из аккаунта и сброс фильтров
  const handleLogout = () => {
    setUser(null);
    setTargetClient(null);
    setDraftItems([]);
    setSearch("");
    setCategoryId("all");
    setSortBy("");
    setScreen("catalog");
  };

  // Подтверждение заказа (допишите списание остатков в массиве products)
  const handleConfirmOrder = () => {
    const orderOwner = targetClient || user;
    if (!orderOwner || draftItems.length === 0) {
      return;
    }

    const nextOrderId =
      orders.length > 0
        ? Math.max(...orders.map((order) => order.id)) + 1
        : 1;

    const newOrder = {
      id: nextOrderId,
      user_id: orderOwner.id,
      client_full_name: orderOwner.full_name,
      order_date: new Date().toISOString().slice(0, 10),
      items: draftItems.map((item, index) => ({
        id: Date.now() + index,
        variant_id: item.variant_id,
        product_id: item.product_id,
        product_name: item.product_name,
        manufacturer_name: item.manufacturer_name,
        size: item.size,
        quantity: item.quantity,
        unit_price: item.unit_price,
      })),
    };

    // TODO: обновите состояние products через setProducts(...),
    // уменьшив quantity у каждого заказанного варианта (variant_id)
    // на заказанное количество, чтобы остатки в каталоге пересчитались.

    setOrders((prev) => [newOrder, ...prev]);
    setDraftItems([]);
    setTargetClient(user);
    setScreen("catalog");
    setNotice({
      type: "info",
      title: "Заказ оформлен",
      message: `Заказ №${newOrder.id} успешно сохранён.`,
    });
  };

  const canManageOrders =
    user !== null &&
    (user.role_code === "manager" || user.role_code === "admin");

  return (
    <div>
      {/* Шапка приложения: логотип, название, кнопки ролей и ФИО в правом верхнем углу */}
      <header className="app-header">
        <div
          className="brand"
          onClick={() => navigateTo("catalog")}
        >
          <img
            src="/logo.png"
            alt="Логотип"
          />
          <div>
            <div className="brand-title">{COMPANY_NAME}</div>
            <div className="brand-subtitle">Система оформления заказов</div>
          </div>
        </div>

        <div className="header-actions">
          {canManageOrders && (
            <button
              type="button"
              className="btn"
              onClick={() => navigateTo("orders")}
            >
              Заказы
            </button>
          )}

          {user ? (
            <>
              <div className="user-badge">
                <div className="user-fio">{user.full_name}</div>
                <div className="user-role">{user.role_name}</div>
              </div>
              <button
                type="button"
                className="btn"
                onClick={handleLogout}
              >
                Выйти
              </button>
            </>
          ) : (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => navigateTo("login")}
            >
              Войти
            </button>
          )}
        </div>
      </header>

      <main className="container">
        {/* TODO: подключите компонент NoticeBanner для показа notice */}
        {notice && (
          <div className={`notice notice-${notice.type}`}>
            <div className="notice-body">
              <strong>{notice.title}: </strong>
              <span>{notice.message}</span>
            </div>
            <button
              type="button"
              className="btn"
              onClick={() => setNotice(null)}
            >
              Закрыть
            </button>
          </div>
        )}

        {/* Экран 1: Авторизация */}
        {screen === "login" && (
          <div className="panel login-box">
            <div className="page-bar">
              <h1>Авторизация</h1>
              <button
                type="button"
                className="btn"
                onClick={handleBack}
              >
                ← Назад
              </button>
            </div>
            <form onSubmit={handleLogin}>
              <label htmlFor="login-input">
                <strong>Логин пользователя:</strong>
              </label>
              <input
                id="login-input"
                className="input"
                value={loginInput}
                onChange={(event) => setLoginInput(event.target.value)}
                placeholder="Например: client1, manager1, admin1"
              />
              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: "100%", marginTop: 12 }}
              >
                Войти
              </button>
            </form>
          </div>
        )}

        {/* Экран 2: Главный каталог */}
        {screen === "catalog" && (
          <div>
            <div className="page-bar">
              <h1>{initialDataset.catalogTitle}</h1>
            </div>

            {/* TODO: добавьте панель поиска, фильтрации (с «Все категории») и сортировки для user !== null */}
            {/* TODO: вычислите скидку 25% и остатки через src/utils/catalogLogic.js и отрендерите ProductCard */}
            <div className="panel">
              Загружено товаров из mockData.json: {products.length}. Замените этот блок на список карточек ProductCard.
            </div>
          </div>
        )}

        {/* Экран 3: Карточка просмотра товара */}
        {screen === "detail" && (
          <div className="panel">
            <div className="page-bar">
              <h1>Карточка товара (ID: {selectedProductId})</h1>
              <button
                type="button"
                className="btn"
                onClick={handleBack}
              >
                ← Назад
              </button>
            </div>
            {/* TODO: подключите компонент ProductDetailView */}
          </div>
        )}

        {/* Экран 4: Управление заказами (Менеджер / Администратор) */}
        {screen === "orders" && canManageOrders && (
          <div className="panel">
            <div className="page-bar">
              <h1>Управление заказами ({user.role_name})</h1>
              <button
                type="button"
                className="btn"
                onClick={handleBack}
              >
                ← Назад
              </button>
            </div>
            {/* TODO: подключите компонент OrdersView */}
          </div>
        )}
      </main>
    </div>
  );
}
