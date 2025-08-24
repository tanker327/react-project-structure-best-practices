import { Routes, Route, Navigate } from 'react-router-dom';
import { HomePage } from '@/pages/Home';
import { ProductsPage } from '@/pages/Products';
import { LoginPage } from '@/pages/Login';
import { DashboardPage } from '@/pages/Dashboard';

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/products" element={<ProductsPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};