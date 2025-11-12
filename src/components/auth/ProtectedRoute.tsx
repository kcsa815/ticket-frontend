import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';

interface Props{
  children: React.ReactNode;
  adminOnly? : boolean; //이 라우트가 Admin 전용인지?
}

function ProtectedRoute({ children, adminOnly=false }: Props) {
  const { isLoggedIn, isLoading, userRole} = useAuth();
  const location = useLocation();

  // 1. 토큰 확인 작업(로딩)이 아직 안끝났다면?
  if (isLoading){
    //기다려
    return <div>Loading authentication...</div>   //로딩 중 대기
  }

  // 2. 로딩이 끝났는데, 로그인을 안 했다면?
  if (!isLoggedIn) {
    ///login 페이지로 강제 이동
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Admin 전용 페이지인데, Admin권하이 아닌 경우
  if(adminOnly && userRole !== 'ROLE_ADMIN'){
    //홈으로 쫓아냄 or *권한 없음8 페이지
    alert("관리자만 접속 가능합니다.");
    return <Navigate to="/" replace />
  }

  // 3. 통과(로그인 o, 권한 o) -> 자식 컴포넌트를 보여줌
  return <>{children}</>;
}

export default ProtectedRoute;