import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

export default function Login() {
  const [loginValue, setLoginValue] = useState('');
  const navigate = useNavigate();

  const login = useAuthStore((state) => state.login);
  const error = useAuthStore((state) => state.error);
  const isLoading = useAuthStore((state) => state.isLoading);
  const clearError = useAuthStore((state) => state.clearError);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!loginValue.trim()) return;

    const success = await login(loginValue);
    if (success) {
      navigate('/');
    }
  };

  return (
    <div className="login-page">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Вход в систему</h2>

        <input
          type="text"
          placeholder="Логин (client1, manager1, admin1)"
          value={loginValue}
          onChange={(e) => {
            if (error) clearError();
            setLoginValue(e.target.value);
          }}
        />

        {error && <p className="error-text">{error}</p>}

        <button type="submit" className="btn btn-primary" disabled={isLoading}>
          {isLoading ? 'Вход...' : 'Войти'}
        </button>

        <button
          type="button"
          className="btn"
          onClick={() => navigate('/')}
        >
          Войти как гость
        </button>
      </form>
    </div>
  );
}