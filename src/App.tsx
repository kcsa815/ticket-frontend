import { Routes, Route } from 'react-router-dom';

// (페이지 컴포넌트 임포트)
import HomePage from './pages/HomePage';
import MusicalDetailPage from './pages/MusicalDetailPage';
import LoginPage from './pages/LoginPage';
import MyBookingsPage from './pages/MyBookingsPage';
import AdminPage from './pages/AdminPage';
import AdminPerformancePage from './pages/AdminPerformancePage';
import AdminMusicalEditPage from './pages/AdminMusicalEditPage'; 
import MusicalListPage from './pages/MusicalListPage';
import RegionPage from './pages/RegionPage'; 
import SignUpPage from './pages/SignUpPage';
import AdminVenueEditorPage from './pages/AdminVenueEditorPage';

// (레이아웃 및 보호막 임포트)
import Header from './components/layout/Header';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ProtectedRoute from './components/auth/ProtectedRoute';
import './App.css'; 
import MusicalSection from './components/home/MusicalSection';

// ---  "임시" VenuesPage 선언만 남김] ---
const VenuesPage = () => <div><h2>공연장 목록 페이지(준비중)</h2></div>;


function App() {
  return(
    <div className='app-container'>
      <Header />
      <Navbar />
      <main className='main-content'>
        <Routes>
          {/* --- 공용 경로 --- */}
          <Route path='/' element={<HomePage />} />
          <Route path='/musical/:musicalId' element={<MusicalDetailPage />} />
          <Route path='/login' element={<LoginPage />} />
          <Route path='/signup' element={<SignUpPage />} />
          
          {/* --- 네비바 링크 연결 --- */}
          <Route path='/musicals' element ={<MusicalListPage />} />
          <Route path='/rankings' element={<MusicalListPage />} />
          <Route path='/coming-soon' element={<MusicalListPage />} />
          <Route path='/sales' element={<MusicalListPage />} />
          <Route path='/region' element={<RegionPage />} /> 
          <Route path='/venues' element={<VenuesPage />} />

          {/* <Route path='/rankings' element={<MusicalSection />} />
          <Route path='/coming-soon' element={<MusicalListPage />} />
          <Route path='/sales' element={<MusicalListPage />} /> */}
            
          {/* --- 보호된 경로 (USER) --- */}
          <Route 
            path='/my-bookings' 
            element={ <ProtectedRoute><MyBookingsPage /></ProtectedRoute> } 
          />
          {/* (BookingPage는 모달이므로 Route 없음) */}
          
          {/* --- 보호된 경로 (ADMIN) --- */}
          <Route
            path="/admin/add-musical"
            element={ <ProtectedRoute adminOnly={true}><AdminPage /></ProtectedRoute> }
          />
          <Route
            path="/admin/add-performance"
            element={ <ProtectedRoute adminOnly={true}><AdminPerformancePage /></ProtectedRoute> }
          />
          <Route
            path="/admin/musical/edit/:musicalId"
            element={ <ProtectedRoute adminOnly={true}><AdminMusicalEditPage /></ProtectedRoute> }
          />

          <Route 
            path="/admin/add-venue" // (공연장 등록 - 좌석 에디터)
            element={
              <ProtectedRoute adminOnly={true}>
                <AdminVenueEditorPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;