import React from 'react'; // [수정] React 임포트
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import MusicalDetailPage from './pages/MusicalDetailPage';
import Header from './components/layout/Header';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import './App.css'; // (전역 CSS)
import MusicalListPage from './pages/MusicalListPage';

// [수정] 누락된 컴포넌트 임포트
import LoginPage from './pages/LoginPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import MyBookingsPage from './pages/MyBookingsPage'; 
import BookingPage from './pages/BookingPage';

// (준비중 페이지)
const VenuesPage = () => <div><h2>공연장 목록 페이지(준비중)</h2></div>;
const RegionPage = () => <div><h2>지역별 페이지(준비중)</h2></div>;

/*로그인 로직*/
function App() {
  return(
    <div className='app-container'>
      {/* ---공통 레이아웃(헤더, 네비바)--- */}
      <Header />
      <Navbar />
      <main className='main-content'>
        <Routes>
          {/* 공용 경로 */}
          <Route path='/' element={<HomePage />} />
          <Route path='/musical/:musicalId' element={<MusicalDetailPage />} />
          <Route path='/login' element={<LoginPage />} />
          
          {/* ---네비바 링크 연결--- */}
            <Route path='/musicals' element ={<MusicalListPage />} />
            <Route path='/rankings' element={<MusicalListPage />} />
            <Route path='/coming-soon' element={<MusicalListPage />} />
            <Route path='/sales' element={<MusicalListPage />} />

          {/* 준비중 페이지로 연결(아직 안만든거) */}
            <Route path='/region' element={<RegionPage />} />
            <Route path='/venues' element={<VenuesPage />} />
            
          {/* 보호된 경로 */}
          <Route 
            path='/my-bookings' 
            element={ <ProtectedRoute><MyBookingsPage /></ProtectedRoute> } 
          />
          
          {/* 2. (신규!) 좌석 선택 페이지 경로 추가 (보호됨) */}
          <Route 
            path='/booking/:performanceId' 
            element={ <ProtectedRoute><BookingPage /></ProtectedRoute> }
          />
          
        </Routes>
      </main>

      {/* ---공통 레이아웃(푸터)--- */}
      <Footer />
    </div>
  );
}

export default App;