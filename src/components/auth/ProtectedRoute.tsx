import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isLoggedIn } = useAuth();
  const location = useLocation();

  if (!isLoggedIn) {
    // 로그인 안 됨 -> /login 페이지로 강제 이동
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 로그인 됨 -> 자식 컴포넌트(MyBookingsPage)를 보여줌
  return <>{children}</>;
}

export default ProtectedRoute;