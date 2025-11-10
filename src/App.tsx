import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import MusicalDetailPage from './pages/MusicalDetailPage';

import Header from './components/layout/Header';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import './App.css';


/*로그인 로직*/
function App() {
  return(
    <div className='app-container'>
      {/* ---공통 레이아웃(헤더, 네비바)--- */}
      <Header />
      <Navbar />

      {/* ---페이지 컨텐츠(Url에 따라 바뀜) --- */}
      <main className='main-content'>
        <Routes>
          <Route path='/' element={<HomePage />} />
          <Route path='/musical/:musicalId' element={<MusicalDetailPage />} />
          {/* <Route path='/rankings' element={<RankingPage />} />
          <Route path='/coming-soon' element={<ComingSoonPage />} />
          <Route path='/sales' element={<ComingSoonPage />} />
          <Route path='/region' element={<RegionPage />} />
          <Route path='/venues' element={<VenuesPage />} />
          <Route path='/my-booking' element={<MyBookingPage />} /> */}
        </Routes>
      </main>

      {/* ---공통 레이아웃(푸터)--- */}
      <Footer />
    </div>
  );
}

export default App;