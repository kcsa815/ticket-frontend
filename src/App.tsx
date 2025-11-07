import React, { useState } from 'react';
import axios from 'axios';
import { Routes, Route, Link } from 'react-router-dom';

// 1. 우리가 만든 페이지 컴포넌트들 임포트
import HomePage from './pages/HomePage';
import MusicalDetailPage from './pages/MusicalDetailPage';

// (참고: 로그인 폼은 나중에 별도 'LoginPage.tsx'로 분리하는 것이 좋습니다)
// (App.tsx에 있던 로그인 로직을 임시로 가져옵니다)

function App() {
  // --- (App.tsx에 임시로 로그인 로직 유지) ---
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setToken(null);

    try {
      const response = await axios.post('http://localhost:8080/api/users/login', { email, password });
      const accessToken = response.data.accessToken;
      setToken(accessToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      // localStorage.setItem('token', accessToken);
    } catch (err) {
      setError('로그인 실패 (ID/PW 확인)');
    }
  };
  // --- (로그인 로직 끝) ---

  return (
    <div style={{ padding: '20px' }}>
      {/* --- 1. 헤더/네비게이션 (모든 페이지 공통) --- */}
      <header style={{ borderBottom: '2px solid black', paddingBottom: '10px' }}>
        <Link to="/"> {/* "/" (홈)으로 가는 링크 */}
          <h1>뮤지컬 예매 사이트</h1>
        </Link>
        {/* (간단한 로그인 폼) */}
        {!token ? (
          <form onSubmit={handleSubmit} style={{ float: 'right' }}>
            <input type="email" placeholder="이메일" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input type="password" placeholder="비밀번호" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button type="submit">로그인</button>
            {error && <div style={{ color: 'red', fontSize: '12px' }}>{error}</div>}
          </form>
        ) : (
          <div style={{ float: 'right' }}>
            <strong>로그인 성공!</strong>
            {/* TODO: 여기에 "내 정보" 또는 "로그아웃" 버튼 추가 */}
          </div>
        )}
      </header>

      {/* --- 2. 메인 컨텐츠 (페이지 영역) --- */}
      <main style={{ marginTop: '20px' }}>
        {/* (중요!) 여기가 페이지가 교체되는 영역입니다 */}
        <Routes>
          {/* Route 1: 
            URL 경로(path)가 "/" (홈)이면, 
            HomePage 컴포넌트(element)를 보여줘
          */}
          <Route path="/" element={<HomePage />} />

          {/* Route 2: 
            URL 경로(path)가 "/musical/숫자" 형태이면,
            (예: /musical/1, /musical/100)
            MusicalDetailPage 컴포넌트(element)를 보여줘
          */}
          <Route path="/musical/:musicalId" element={<MusicalDetailPage />} />
          
          {/* TODO: 나중에 "예매 페이지", "내 예매 내역 페이지" 등도 여기에 추가
          <Route path="/booking/:performanceId" element={<BookingPage />} />
          <Route path="/my-bookings" element={<MyBookingsPage />} />
          */}
        </Routes>
      </main>
    </div>
  );
}

export default App;