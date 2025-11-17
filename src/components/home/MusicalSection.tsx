import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { FaChevronRight } from "react-icons/fa"; 
import { useAuth } from "../../context/AuthContext";

// [1. (핵심!)] CSS 파일을 ListPage와 동일한 것을 사용 (경로 확인)
import styles from '../../pages/HomePage.module.css'; 

// (Interface - 동일)
interface Musical {
  musicalId: number;
  title: string;
  posterImageUrl: string;
  venueName: string | null;
  minPrice: number | null;
  maxPrice: number | null;
}

interface Props {
  title: string; 
  apiUrl: string; 
  layoutType: "ranking" | "comingSoon" | "default";
  viewAllLink: string;
}

function MusicalSection({ title, apiUrl, layoutType, viewAllLink }: Props) {
  const [musicals, setMusicals] = useState<Musical[]>([]);
  const { userRole } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMusicals = async () => {
      try {
        const response = await axios.get(`http://localhost:8080${apiUrl}`);
        
        // (HomePage용 'limit')
        const sliceCount = layoutType === "ranking" ? 5 : 4;
        setMusicals(response.data.slice(0, sliceCount));
        
      } catch (err) {
        console.error(`${title} 목록 조회 실패 : `, err);
      }
    };
    fetchMusicals();
  }, [apiUrl, title, layoutType]); // [수정!] (의존성 복구)

  // ... (handleDelete, handleEdit 함수는 동일)
  const handleDelete = async (e: React.MouseEvent, musicalId: number) => { /* ... */ };
  const handleEdit = (e: React.MouseEvent, musicalId: number) => { /* ... */ };


  // (모든 섹션이 'HomePage.module.css'의 "단일" 스타일을 사용)
  return (
    <section className={styles.musicalSection}> 
      
      {/* (섹션 제목) */}
      <h2 className={styles.sectionTitle}>{title}</h2>
      
      {/* (그리드) */}
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
                <h3 className={styles.title}>뮤지컬 &lt;{musical.title}&gt;</h3>
              </Link>
              <p className={styles.infoText}>
                {musical.venueName || '공연장 미정'}
              </p>
              <p className={styles.priceText}>
                {musical.minPrice ? 
                  `${musical.minPrice.toLocaleString()}원 ~` : 
                  '가격 미정'}
              </p>
              
              {/* --- 👇 [핵심!] 이 부분이 복구되었습니다! --- */}
              {userRole === "ROLE_ADMIN" && (
                <div className={styles.adminButtons}>
                  <button onClick={(e) => handleEdit(e, musical.musicalId)}>수정</button>
                  <button onClick={(e) => handleDelete(e, musical.musicalId)}>삭제</button>
                </div>
              )}
              {/* --- 👆 --- */}
            </div>
          </div>
        ))}
      </div>

      {/* ("더보기" 버튼 - 하단 배치) */}
      {viewAllLink && (
        <div className={styles.viewAllContainer}>
          <Link to={viewAllLink} className={styles.viewAllButton}>
            전체 보기 <FaChevronRight size={12} />
          </Link>
        </div>
      )}
    </section>
  );
}

export default MusicalSection;