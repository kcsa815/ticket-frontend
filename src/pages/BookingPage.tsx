import React, { useState, useEffect } from 'react';
import axios, { AxiosError } from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './BookingPage.module.css'; // 방금 만든 CSS

// --- (1) 백엔드 DTO와 맞추는 타입 정의 ---
// (GET /api/performances/{id} 응답 타입)

// 개별 좌석 타입 (가장 중요)
interface PerformanceSeat {
  performanceSeatId: number;
  seatNumber: string;
  seatGrade: string;
  price: number;
  isReserved: boolean;
}

// 공연 상세 정보 타입
interface PerformanceDetail {
  performanceId: number;
  musicalTitle: string;
  venueName: string;
  performanceDate: string;
  seats: PerformanceSeat[]; // (핵심) 좌석 맵
}

interface ErrorResponse { message: string; }
// ------------------------------------

function BookingPage() {
  // (2) URL 파라미터(performanceId) 및 페이지 이동 Hook
  const { performanceId } = useParams<{ performanceId: string }>();
  const navigate = useNavigate();

  // (3) State 관리
  const [performance, setPerformance] = useState<PerformanceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // (4) (핵심!) 선택된 좌석 ID들을 저장할 State (Set 사용)
  // Set: 중복을 허용하지 않는 자료구조 (추가/삭제가 배열보다 편리함)
  const [selectedSeatIds, setSelectedSeatIds] = useState<Set<number>>(new Set());

  // (5) API 호출 로직 (페이지 로드 시 1회 실행)
  useEffect(() => {
    if (!performanceId) return;

    const fetchPerformanceDetails = async () => {
      setLoading(true);
      try {
        const response = await axios.get<PerformanceDetail>(
          `http://localhost:8080/api/performances/${performanceId}`
        );
        setPerformance(response.data);
      } catch (err) {
        console.error('공연 상세/좌석 맵 조회 실패:', err);
        if (axios.isAxiosError<ErrorResponse>(err) && err.response) {
          setError(err.response.data.message || '데이터를 불러오지 못했습니다.');
        } else {
          setError('알 수 없는 오류가 발생했습니다.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPerformanceDetails();
  }, [performanceId]); // performanceId가 바뀔 때마다 실행

  // (6) (핵심!) 좌석 클릭 핸들러
  const handleSeatClick = (seat: PerformanceSeat) => {
    // 6-1. 이미 예약된 좌석은 클릭 무시
    if (seat.isReserved) {
      alert("이미 예약된 좌석입니다.");
      return;
    }

    // 6-2. Set 자료구조를 복사 (React 불변성)
    const newSelectedIds = new Set(selectedSeatIds);

    // 6-3. 이미 선택된 좌석인지 확인
    if (newSelectedIds.has(seat.performanceSeatId)) {
      // 이미 선택됨 -> 선택 해제 (Set에서 제거)
      newSelectedIds.delete(seat.performanceSeatId);
    } else {
      // 선택 안 됨 -> 선택 (Set에 추가)
      newSelectedIds.add(seat.performanceSeatId);
    }

    // 6-4. state 갱신 -> React가 화면을 다시 그림
    setSelectedSeatIds(newSelectedIds);
  };
  
  // (7) 3일차(내일)에 구현할 "예매하기" 버튼 핸들러 (임시)
  const handleBookingSubmit = () => {
    if (selectedSeatIds.size === 0) {
      alert("좌석을 하나 이상 선택해주세요.");
      return;
    }
    // Set을 배열로 변환
    const seatIdsArray = Array.from(selectedSeatIds);
    console.log("3일차: 이 ID로 예매 API 호출:", seatIdsArray);
    
    // (TODO - 3일차)
    // axios.post('/api/bookings', { performanceSeatIds: seatIdsArray })
    //   .then(res => {
    //     alert("예매 성공!");
    //     navigate("/my-bookings");
    //   })
    //   .catch(err => ...);
  };


  // --- (8) 렌더링(JSX) ---
  if (loading) return <div className={styles.loading}>좌석 맵을 불러오는 중...</div>;
  if (error) return <div className={styles.error}>에러: {error}</div>;
  if (!performance) return null; // 데이터 없음

  return (
    <div className={styles.pageContainer}>
      <h2 className={styles.title}>{performance.musicalTitle}</h2>
      <p className={styles.subTitle}>
        {new Date(performance.performanceDate).toLocaleString('ko-KR')} ({performance.venueName})
      </p>

      {/* 좌석 맵 렌더링 */}
      <div className={styles.seatGrid}>
        {performance.seats.map((seat) => {
          
          // (핵심) 좌석의 현재 상태에 따라 CSS 클래스를 동적으로 결정
          const isSelected = selectedSeatIds.has(seat.performanceSeatId);
          const seatClass = `${styles.seat} ${seat.isReserved ? styles.reserved : ''} ${isSelected ? styles.selected : ''}`;

          return (
            <button
              key={seat.performanceSeatId}
              className={seatClass}
              onClick={() => handleSeatClick(seat)}
              disabled={seat.isReserved} // 예약된 좌석은 'disabled' (클릭 안 됨)
            >
              {seat.seatNumber}
            </button>
          );
        })}
      </div>

      {/* (3일차) 예매하기 버튼 */}
      <div className={styles.bookingActions}>
        <p>선택된 좌석 수: {selectedSeatIds.size}개</p>
        <button className={styles.bookButton} onClick={handleBookingSubmit}>
          예매하기 (3일차)
        </button>
      </div>

    </div>
  );
}

export default BookingPage;