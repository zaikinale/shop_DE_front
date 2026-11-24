import { Routes, Route } from 'react-router-dom';

import Main from './pages/Main';
import Login from './pages/Login';
import Error from './pages/Error';
import Catalog from './pages/Catalog';
import Orders from './pages/Orders';
import Header from './components/Header';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route index element={<Main />} />
        <Route path="/login" element={<Login />} />
        <Route path="/catalog" element={<Catalog />} />
        <Route
          path="/orders"
          element={
            <ProtectedRoute allowedRoles={['manager', 'admin']}>
              <Orders />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Error />} />
      </Routes>
    </>
  );
}