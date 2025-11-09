import React, { useState, useEffect } from 'react';
import axios, { AxiosError } from 'axios';
import { Link } from 'react-router-dom';

// 1. (중요!) 방금 만든 CSS Module을 'styles'라는 이름으로 임포트
import styles from './HomePage.module.css'; 

// (타입 정의는 동일)
interface Musical {
  musicalId: number;
  title: string;
  description: string;
  posterImageUrl: string;
}
interface ErrorResponse {
  message: string;
}

function HomePage() {
  const [musicals, setMusicals] = useState<Musical[]>([]);
  const [error, setError] = useState('');

  // (API 호출 로직은 동일)
  const fetchMusicals = async () => {
    setError('');
    try {
      const response = await axios.get<Musical[]>('http://localhost:8080/api/musicals');
      setMusicals(response.data);
    } catch (err) {
      console.error('뮤지컬 목록 조회 실패:', err);
      if (axios.isAxiosError<ErrorResponse>(err) && err.response) {
        setError(err.response.data.message || '목록 조회에 실패했습니다.');
      } else {
        setError('뮤지컬 목록 조회 중 오류 발생');
      }
    }
  };

  useEffect(() => {
    fetchMusicals();
  }, []); 

  // --- 2. 렌더링 (JSX) 부분 수정 ---
  return (
    // 'pageContainer' 스타일 적용
    <div className={styles.pageContainer}> 
      <h2 className={styles.pageTitle}>뮤지컬 목록</h2>
      
      {error && <div style={{ color: 'red' }}><strong>에러:</strong> {error}</div>}
      
      {/* 3. (중요!) <ul> 대신 <div> 그리드 컨테이너 사용 */}
      <div className={styles.gridContainer}>
        {musicals.map((musical) => (
          
          // 4. (중요!) <li> 대신 <Link>를 카드로 활용
          // 'musicalCard' 스타일 적용
          <Link to={`/musical/${musical.musicalId}`} key={musical.musicalId} className={styles.musicalCard}>
            
            {/* 5. 포스터 이미지 */}
            {musical.posterImageUrl ? (
              <img 
                src={`http://localhost:8080${musical.posterImageUrl}`} 
                alt={musical.title} 
                className={styles.posterImage} // 'posterImage' 스타일 적용
              />
            ) : (
              // (대체 이미지) 이미지가 null일 경우
              <div 
                className={styles.posterImage} 
                style={{ background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                No Image
              </div>
            )}
            
            {/* 6. 뮤지컬 정보 */}
            <div className={styles.info}>
              <h3 className={styles.title}>{musical.title}</h3> 
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default HomePage;