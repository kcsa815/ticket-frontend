import React, { useState, useEffect, useMemo, useRef } from 'react';
import axios, { AxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';
import styles from './BookingPage.module.css';
import Modal from 'react-modal';
import Draggable from 'react-draggable';

// --- (타입 정의 - xCoord, yCoord 포함) ---
interface PerformanceSeat {
  performanceSeatId: number;
  seatNumber: string;
  seatGrade: string;
  price: number;
  isReserved: boolean;
  xcoord: number; 
  ycoord: number;
}
interface PerformanceDetail {
  performanceId: number;
  musicalTitle: string;
  venueName: string;
  performanceDate: string;
  seats: PerformanceSeat[];
}
interface ErrorResponse {
  message: string;
}
// ------------------------------------

interface BookingPageProps {
  isOpen: boolean;
  onClose: () => void;
  performanceId: number | null;
}

/**
 * 드래그 가능한 모달 Wrapper
 */
const DraggableModal = (props: any) =>{
  const nodeRef = useRef(null);
  return(
    <Draggable handle=".dragHandle" nodeRef={nodeRef}>
      <div ref={nodeRef}>{props.children}</div>
    </Draggable>
  )
}

const customModalStyles: Modal.Styles = {
  // 1. 뒷 배경 (오버레이)
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    display: 'flex', 
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000,
  },
  // 2. 모달 창 본체 (팝업)
  content: {
    position: 'relative', 
    inset: 'auto', 
    padding: '0', 
    border: 'none',
    background: 'none',
    width: 'auto', // (너비는 Draggable이 제어)
    overflow: 'visible', // (Draggable이 보이도록)
  },
};

function BookingPage({ isOpen, onClose, performanceId }: BookingPageProps) {
  const navigate = useNavigate();
  const [performance, setPerformance] = useState<PerformanceDetail | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedSeatIds, setSelectedSeatIds] = useState<Set<number>>(
    new Set()
  );
  const [isBookingLoading, setIsBookingLoading] = useState(false);
  const nodeRef = useRef(null);

  // (useEffect API 호출 - 동일)
  useEffect(() => {
    // (1) 모달이 열렸고, ID가 정상적으로 들어왔을 때만 API 호출
    if (isOpen && performanceId) {
      
      const fetchPerformanceDetails = async () => {
        setLoading(true);
        // ...
        try {
          const response = await axios.get<PerformanceDetail>(
            `http://localhost:8080/api/performances/${performanceId}`
          );
          
          console.log("✅ 백엔드 응답 데이터:", response.data);
          console.log("✅ 첫 번째 좌석 좌표:", response.data.seats[0]);

          
          setPerformance(response.data);
        } catch (err) {
          // (에러 처리)
          if (axios.isAxiosError<ErrorResponse>(err) && err.response) {
            setError(err.response.data.message || '데이터를 불러오지 못했습니다.');
          } else {
            setError('알 수 없는 오류가 발생했습니다.');
          }
        } finally {
          setLoading(false); // (API 호출 '완료' 시 로딩 종료)
        }
      };

      fetchPerformanceDetails();
    } 
    // (2) 모달이 닫힐 때 (isOpen: false)
    else if (!isOpen) {
      // (모든 상태를 깨끗하게 초기화)
      setLoading(false);
      setError('');
      setPerformance(null);
      setSelectedSeatIds(new Set());
    }
  }, [isOpen, performanceId]); // (isOpen 또는 performanceId가 '바뀔 때마다' 실행)

  // (6) (핵심!) 좌석 클릭 핸들러
  const handleSeatClick = (seat: PerformanceSeat) => {
    // 6-1. 이미 예약된 좌석이거나, 현재 예매 API가 실행 중이면 클릭 무시
    if (seat.isReserved || isBookingLoading) {
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

  // (7) (핵심!) [예매하기] 버튼 핸들러 (API 연동)
  const handleBookingSubmit = async () => {
    if (selectedSeatIds.size === 0) {
      alert("좌석을 하나 이상 선택해주세요.");
      return;
    }
    
    // (1) 로딩 상태 활성화 (중복 클릭 방지)
    setIsBookingLoading(true);
    setError(''); // 이전 에러 초기화

    // (2) Set을 배열로 변환
    const seatIdsArray = Array.from(selectedSeatIds);

    try {
      // (3) 백엔드 예매 API 호출
      // (AuthContext가 axios 기본 헤더에 토큰을 넣어주고 있음)
      const response = await axios.post(
        'http://localhost:8080/api/bookings', 
        {
          performanceSeatIds: seatIdsArray // BookingReqDto 형식
        }
      );

      // (4) 예매 성공!
      console.log("예매 성공:", response.data);
      alert("예매가 성공적으로 완료되었습니다!");
      
      // (5) 모달 닫기 및 예매 내역 페이지로 이동
      onClose(); 
      navigate('/my-bookings');

    } catch (err) {
      // (6) 예매 실패 (동시성 문제, DB 오류 등)
      console.error('예매 실패:', err);
      if (axios.isAxiosError<ErrorResponse>(err) && err.response) {
        // (백엔드 6단계에서 만든 에러 메시지 표시)
        // 예: "이미 예약된 좌석입니다." (SEAT_ALREADY_RESERVED)
        alert(`예매 실패: ${err.response.data.message}`);
      } else {
        alert('예매 중 알 수 없는 오류가 발생했습니다.');
      }
      
      // (7) 로딩 상태 해제 (실패 시에만)
      setIsBookingLoading(false);
    }
  };

  // --- [ Req 3: 잔여석/가격 계산] ---
  // (useMemo: performance state가 바뀔 때만 1번 재계산)
  const seatInfo = useMemo(() => {
    if (!performance) return { counts: [], prices: [] };

    // JS의 Map을 사용하여 등급별로 집계
    const counts = new Map<string, number>(); // 잔여석
    const prices = new Map<string, number>(); // 등급별 가격

    for (const seat of performance.seats) {
      // (1) 가격 설정
      if (!prices.has(seat.seatGrade)) {
        prices.set(seat.seatGrade, seat.price);
      }
      // (2) 잔여석 집계
      if (!seat.isReserved) {
        counts.set(seat.seatGrade, (counts.get(seat.seatGrade) || 0) + 1);
      }
    }
    // Map을 [key, value] 배열로 변환
    return {
      counts: Array.from(counts.entries()),
      prices: Array.from(prices.entries()),
    };
  }, [performance]);

  // --- 3: 선택 좌석 정보 계산] ---
  const selectedSeatsDetails = useMemo(() => {
    if (!performance) return [];
    return performance.seats.filter((seat) =>
      selectedSeatIds.has(seat.performanceSeatId)
    );
  }, [selectedSeatIds, performance]);

  // --- 렌더링: <Draggable> 및 새 JSX 구조 적용 ---
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      style={customModalStyles}
    >
      {/* (1) Draggable이 모달 컨텐츠 전체를 감쌈 */}
      <Draggable handle=".dragHandle" nodeRef={nodeRef}>
        
        {/* (2) ref를 Draggable의 유일한 자식 div에 연결 */}
        <div className={styles.modalContent} ref={nodeRef}>
          
          {loading ? (
            <div className={styles.loading}>좌석 맵을 불러오는 중...</div>
          ) : error ? (
            <div className={styles.error}>에러: {error}</div>
          ) : performance ? (
            <>
              {/* (상단 바 - 드래그 핸들) */}
              <div className={`${styles.topBar} dragHandle`}>
                <div className={styles.topBarTitle}>좌석선택</div>
                <div className={styles.topBarInfo}>
                  <h3>뮤지컬 &lt;{performance.musicalTitle}&gt;</h3>
                  <p>
                    {new Date(performance.performanceDate).toLocaleString('ko-KR')}
                    ({performance.venueName})
                  </p>
                  <button onClick={onClose} style={{ position: 'absolute', top: '10px', right: '15px', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>
                    &times;
                  </button>
                </div>
              </div>

              {/* (중단 컨텐츠) */}
              <div className={styles.mainContent}>
                
                {/* (왼쪽 좌석 맵) */}
                <div className={styles.leftContent}>
                  <div className={styles.seatMapContainer}>
                    {performance.seats.map((seat) => {
                      const isSelected = selectedSeatIds.has(seat.performanceSeatId);
                      const seatClass = `${styles.seat} ${styles[seat.seatGrade]} ${seat.isReserved ? styles.reserved : ''} ${isSelected ? styles.selected : ''}`;
                      
                      return (
                        <button
                          key={seat.performanceSeatId} 
                          className={seatClass}
                          onClick={() => handleSeatClick(seat)}
                          disabled={seat.isReserved || isBookingLoading}
                          style={{
                            left: `${seat.xcoord + 30}px`,  /* 오른쪽으로 30px 이동 */
                            top: `${seat.ycoord + 130}px`,   /* 아래쪽으로 130px 이동 */
                          }}
                        >
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* (오른쪽 정보란) */}
                <div className={styles.rightContent}>
                  {/* (좌석 등급 / 잔여석) */}
                  <div className={styles.seatInfoBox}>
                    <h4>좌석등급 / 잔여석</h4>
                    {seatInfo.prices.map(([grade, price]) => (
                      <div key={grade} className={styles.gradeInfo}>
                        <span>
                          {grade}석{" "}
                          <span className={styles.count}>
                            (
                            {seatInfo.counts.find(([g]) => g === grade)?.[1] ||
                              0}
                            석)
                          </span>
                        </span>
                        <span className={styles.price}>
                          {price.toLocaleString()}원
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* (선택한 좌석) */}
                  <div className={styles.selectedSeatsBox}>
                    <h4>선택 좌석</h4>
                    <ul className={styles.selectedList}>
                      {selectedSeatsDetails.length > 0 ? (
                        selectedSeatsDetails.map((seat) => (
                          <li key={seat.performanceSeatId}>
                            {seat.seatNumber} ({seat.seatGrade} /{" "}
                            {seat.price.toLocaleString()}원)
                          </li>
                        ))
                      ) : (
                        <li style={{ background: "none" }}>
                          좌석을 선택해 주세요.
                        </li>
                      )}
                    </ul>
                  </div>

                  {/* (예매하기 버튼) */}
                  <div className={styles.bookingActions}>
                    <button
                      className={styles.bookButton}
                      onClick={handleBookingSubmit}
                      disabled={
                        isBookingLoading || selectedSeatsDetails.length === 0
                      }
                    >
                      {isBookingLoading
                        ? "예매 처리 중..."
                        : `예매하기 (${selectedSeatsDetails.length}석)`}
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </Draggable>
    </Modal>
  );
}

export default BookingPage;