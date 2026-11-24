import {useNavigate} from 'react-router-dom'
import {getStoreInfo} from '../api/index'

import logo from '../assets/logo_SportLine.svg'
import { useEffect, useState } from 'react';

export default function Header () {
    const navigate = useNavigate();
    const [storeInfo, setStoreInfo] = useState({
        companyName: '',
        catalogTitle: '',
    });

    useEffect(() => {
        getStoreInfo().then((data) => {
        setStoreInfo(data);
        });
    }, []);

    return (
        <header className="app-header">
        <div
          className="brand"
          onClick={() => ("catalog")}
        >
          <img
            src={logo}
            alt="Логотип"
          />
          <div>
            <div className="brand-title">{storeInfo.companyName}</div>
            <div className="brand-subtitle">Система оформления заказов</div>
          </div>
        </div>

        <div className="header-actions">
          {/* {canManageOrders && (
            <button
              type="button"
              className="btn"
            //   onClick={() => navigateTo("orders")}
            >
              Заказы
            </button>
          )} */}

          {/* {user ? (
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
          )} */}
        </div>
      </header>
    )
}