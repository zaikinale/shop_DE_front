import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo_SportLine.svg';
import { useAuthStore } from '../store/useAuthStore';
import { useShopStore } from '../store/useShopStore';
import { getPermissions } from '../utils/permissions';

export default function Header() {
  const navigate = useNavigate();

  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const storeInfo = useShopStore((state) => state.storeInfo);
  const initShopData = useShopStore((state) => state.initShopData);

  const { canManageOrders } = getPermissions(user?.role_code);

  useEffect(() => {
    initShopData();
  }, [initShopData]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="app-header">
      <div className="brand" onClick={() => navigate('/')}>
        <img src={logo} alt="Логотип" className="icn" />
        <div className="df fdc ais">
          <span className="brand-title">{storeInfo.companyName}</span>
          <span className="brand-subtitle">Система оформления заказов</span>
        </div>
      </div>

      <div className="header-actions">
        {user ? (
          <div className="df aic g20 fww">
            <div className="user-badge df fdc aie">
              <span className="user-fio">{user.full_name}</span>
              <span className="user-role">{user.role_name}</span>
            </div>

            <div className="df aic g10">
              {canManageOrders && (
                <button
                  type="button"
                  className="btn"
                  onClick={() => navigate('/orders')}
                >
                  Заказы
                </button>
              )}
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleLogout}
              >
                Выйти
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => navigate('/login')}
          >
            Войти
          </button>
        )}
      </div>
    </header>
  );
}