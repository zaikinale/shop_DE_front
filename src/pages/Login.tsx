import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import Notice, { type NoticeData } from '../components/Notice';
import { useAuthStore } from '../store/useAuthStore';

export default function Login() {
  const [loginValue, setLoginValue] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const navigate = useNavigate();

  const login = useAuthStore((state) => state.login);
  const error = useAuthStore((state) => state.error);
  const isLoading = useAuthStore((state) => state.isLoading);
  const clearError = useAuthStore((state) => state.clearError);

  const errorMessage = localError || error;
  const notice: NoticeData | null = errorMessage
    ? {
        type: 'error',
        title: 'Ошибка входа',
        message: errorMessage,
      }
    : null;

  const handleCloseNotice = () => {
    setLocalError(null);
    clearError();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!loginValue.trim()) {
      setLocalError('Введите логин пользователя (например: client1, manager1 или admin1).');
      return;
    }

    setLocalError(null);
    const success = await login(loginValue);

    if (success) {
      navigate('/');
    }
  };

  return (
    <main className="login-page">
      <div className="page-bar">
        <h1>Вход в систему</h1>
        <button type="button" className="btn" onClick={() => navigate('/')}>
          ← Назад
        </button>
      </div>

      <Notice notice={notice} onClose={handleCloseNotice} />

      <form className="box df fdc g10" onSubmit={handleSubmit}>
        <label htmlFor="login-input" className="muted">
          Логин пользователя
        </label>

        <input
          id="login-input"
          className="input"
          type="text"
          placeholder="client1, manager1, admin1"
          value={loginValue}
          onChange={(e) => {
            if (error || localError) {
              handleCloseNotice();
            }
            setLoginValue(e.target.value);
          }}
        />

        <button
          type="submit"
          className="btn btn-primary w100"
          disabled={isLoading}
        >
          {isLoading ? 'Вход...' : 'Войти'}
        </button>

        <button
          type="button"
          className="btn btn-secondary w100"
          onClick={() => navigate('/')}
        >
          Войти как гость
        </button>
      </form>
    </main>
  );
}