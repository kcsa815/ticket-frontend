import React, { useState, useEffect } from "react";
import axios, { AxiosError } from "axios";
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; 
import styles from './HomePage.module.css'; 
import { FaChevronRight } from "react-icons/fa"; // (어드민 버튼용)

// (타입 정의)
interface Musical {
  musicalId: number;
  title: string;
  posterImageUrl: string;
}
interface ErrorResponse { message: string; }


function MusicalListPage() {
  const [musicals, setMusicals] = useState<Musical[]>([]);
  const [title, setTitle] = useState('뮤지컬 목록');
  
  const location = useLocation(); 
  const navigate = useNavigate(); 
  const { userRole } = useAuth(); 

  useEffect(() => {
    // --- 👇 [핵심 수정!] URL에 맞는 API 주소 생성 ---
    let apiUrl = 'http://localhost:8080/api/musicals'; // (기본 = 전체 목록)
    let pageTitle = '전체 뮤지컬';

    // (URL 경로에 따라 API 쿼리와 제목을 변경)
    switch (location.pathname) {
      case '/rankings':
        pageTitle = '랭킹';
        apiUrl += '?section=ranking';
        break;
      case '/coming-soon':
        pageTitle = '오픈 예정';
        apiUrl += '?section=coming-soon';
        break;
      case '/sales':
        pageTitle = '할인중';
        apiUrl += '?section=sale';
        break;
      default:
        pageTitle = '뮤지컬 목록';
    }
    setTitle(pageTitle);
    // --- 👆 ---

    const fetchMusicals = async () => {
      try {
        // [수정!] 하드코딩된 주소 대신, 'apiUrl' 변수 사용
        const response = await axios.get(apiUrl); 
        
        // [수정!] .slice() 제거 (전체 목록)
        setMusicals(response.data); 
      } catch (err) {
        console.error(`${title} 목록 조회 실패`, err);
      }
    };

    fetchMusicals();
  }, [location.pathname, title]); // (의존성 배열 수정)

  // --- (수정/삭제 핸들러 - HomePage에서 복사) ---
  const handleDelete = async (e: React.MouseEvent, musicalId: number) => {
    e.preventDefault(); 
    if (window.confirm("정말 이 뮤지컬을 삭제하시겠습니까?")) {
      try {
        await axios.delete(`http://localhost:8080/api/musicals/${musicalId}`);
        alert("삭제되었습니다.");
        setMusicals(prev => prev.filter(m => m.musicalId !== musicalId));
      } catch (err) {
        alert("삭제에 실패했습니다.");
      }
    }
  };

  const handleEdit = (e: React.MouseEvent, musicalId: number) => {
    e.preventDefault(); 
    navigate(`/admin/musical/edit/${musicalId}`);
  };
  // --- 👆 ---

  return (
    <div className={`content-wrapper ${styles.pageContainer}`}>
      <h2 className={styles.pageTitle}>{title}</h2>
      
      <div className={styles.gridContainer}>
        {musicals.map((musical) => (
          <div key={musical.musicalId} className={styles.musicalCard}>
            
            <Link to={`/musical/${musical.musicalId}`}>
              <img 
                src={`http://localhost:8080${musical.posterImageUrl}`}
                alt={musical.title}
                className={styles.posterImage}
              />
            </Link>
            
            <div className={styles.info}>
              <Link to={`/musical/${musical.musicalId}`}>
                <h3 className={styles.title}>{musical.title}</h3>
              </Link>
              
              {/* --- (ADMIN 전용 버튼 추가) --- */}
              {userRole === 'ROLE_ADMIN' && (
                <div className={styles.adminButtons}>
                  <button onClick={(e) => handleEdit(e, musical.musicalId)}>수정</button>
                  <button onClick={(e) => handleDelete(e, musical.musicalId)}>삭제</button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MusicalListPage;