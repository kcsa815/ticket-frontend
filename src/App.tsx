import React, { useState } from 'react';
import axios from 'axios';
import { Routes, Route, Link } from 'react-router-dom';
import HomePage from './pages/HomePage';
import MusicalDetailPage from './pages/MusicalDetailPage';
import { useAuth } from './context/AuthContext';

/* import.meta.env.VITE_API_URL는
 * '개발 중'(npm run dev)에는 undefined 이고,
 * '배포 시'(npm run build)에는 'https://api.my-musical.com'이 됨*/
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';


/*로그인 로직*/
function App() {
  const {isLoggedIn, login, logout} = useAuth();
  // 로그인 폼을 위한 로컬 state(이메일, 비밀번호, 에러)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');


  //로그인 핸들러
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    try {
      const response = await axios.post('http://localhost:8080/api/users/login', { email, password });
      const accessToken = response.data.accessToken;
     
      //AuthContext의 login함수 호출
      // 이 함수가 토큰을 state와 localStorage에 모두 저장해 줌
      login(accessToken);

      //폼 초기화
      setEmail('');
      setPassword('');

    } catch (err) {
      setError('로그인 실패 (ID/PW 확인)');
    }
  };

  //로그아웃 핸들러
  const handleLogout = () =>{
    logout();  //Context의 logout함수 호출
  };


  return (
    <div style={{ padding: '20px' }}>
      {/* --- 1. 헤더/네비게이션 (모든 페이지 공통) --- */}
      <header style={{ borderBottom: '2px solid black', paddingBottom: '10px' }}>
        <Link to="/"> <h1>뮤지컬 예매 사이트</h1></Link>
        
        {/* lsLoggedIn 값에 따라 로그인 폼 또는 로그아웃 버튼 표시 */}
        {!isLoggedIn?(
          <form onSubmit={handleSubmit} style={{float:'right'}}>
            <input type='email' placeholder='이메일' value={email} onChange={(e) => setEmail(e.target.value)} />
            <input type='password' placeholder='비밀번호' value={password} onChange={(e) => setPassword(e.target.value)} />
            <button type="submit">로그인</button>
            {error && <div style={{color:'red', fontSize:'12px'}}>{error}</div>}
          </form>
        ) : (
          <div>
            <strong>로그인 되었습니다!</strong>
            <button onClick={handleLogout} style={{marginLeft: '10px'}}>로그아웃</button>
            {/*여기에 마이페이지 링크 추가할거임*/}
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