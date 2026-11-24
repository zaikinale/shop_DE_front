import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStoreInfo } from '../api/index';
import { useAuthStore } from '../store/useAuthStore';
import { getPermissions } from '../utils/permissions';
import logo from '../assets/logo_SportLine.svg';

export default function Header() {
  const navigate = useNavigate();

  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const { canManageOrders } = getPermissions(user?.role_code);

  const [storeInfo, setStoreInfo] = useState({
    companyName: '',
    catalogTitle: '',
  });

  useEffect(() => {
    getStoreInfo().then((data) => {
      setStoreInfo(data);
    });
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="app-header">
      <div className="brand" onClick={() => navigate('/')}>
        <img src={logo} alt="Логотип" />
        <div>
          <div className="brand-title">{storeInfo.companyName}</div>
          <div className="brand-subtitle">Система оформления заказов</div>
        </div>
      </div>

      <div className="header-actions">
        {canManageOrders && (
          <button
            type="button"
            className="btn"
            onClick={() => navigate('/orders')}
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
            <button type="button" className="btn" onClick={handleLogout}>
              Выйти
            </button>
          </>
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