/* 뮤지컬 디테일 페이지(상세페이지) 에서 날짜선택(공연회차 선택) 후 '예매하기'버튼을 클릭했을 때 넘어가는
  좌석선택 + 예매( ->결제창으로 넘어감) 창!!!!!
   */


import React, { useState, useEffect } from 'react';
import axios, { AxiosError } from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './BookingPage.module.css';
import Modal from 'react-modal';

// (타입 정의)
interface PerformanceSeat {
  performanceSeatId: number;
  seatNumber: string;
  seatGrade: string;
  price: number;
  isReserved: boolean;
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

interface BookingPageProps{
  isOpen: boolean; //모달이 이미 열려있는지 여부
  onClose:() => void //모달을 닫는 함수
  performanceId : number | null;   //예매할 공연 아이디
}

const customModalStyles: Modal.Styles ={
  //1. 뒷배경(오버레이)
  overlay: {
    backgroundColor:'rgba(0, 0, 0, 0.75)',
    display: 'flex',
    alignItems: 'center', 
    justifyContent: 'center', 
    zIndex: 2000
  },
  //2. 모달 창 본체
  content : {
    position: 'relative',
    inset: 'auto',
    
    width: '90%',
    maxWidth: '900px',
    maxHeight: '90vh',
    overflowY: 'auto',
    
    background: '#fff',
    borderRadius: '8px',
    padding: '0',
    boxShadow: '0 5px 15px rgba(0,0,0,0.5)'
  }
};

function BookingPage({isOpen, onClose, performanceId}: BookingPageProps) {
  const navigate = useNavigate();

  const [performance, setPerformance] = useState<PerformanceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSeatIds, setSelectedSeatIds] = useState<Set<number>>(new Set());
  const [isBookingLoading, setIsBookingLoading] = useState(false);  // API 요청 중복 방지용 state

  // (API 호출 로직)
  useEffect(() => {
    if (!isOpen || !performanceId){ //모달이 닫히거나, 아이디가 없으면 api호출 안함.
      setLoading(false); //로딩 중지
      return;
    }

    const fetchPerformanceDetails = async () => {
      setLoading(true);
      setError('');
      //모달이 열릴 때마다 좌석 초기화
      setSelectedSeatIds(new Set());
      try {
        const response = await axios.get<PerformanceDetail>(
          `http://localhost:8080/api/performances/${performanceId}`
        );
        setPerformance(response.data);
      } catch (err) {
        // (에러 처리)
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
  }, [isOpen, performanceId]);

  // (좌석 클릭 핸들러)
  const handleSeatClick = (seat: PerformanceSeat) => {
    if (seat.isReserved || isBookingLoading) return; // (수정) 예매 중 클릭 방지

    const newSelectedIds = new Set(selectedSeatIds);
    if (newSelectedIds.has(seat.performanceSeatId)) {
      newSelectedIds.delete(seat.performanceSeatId);
    } else {
      newSelectedIds.add(seat.performanceSeatId);
    }
    setSelectedSeatIds(newSelectedIds);
  };
  
  // --- [예매하기] 버튼 핸들러 ---
  const handleBookingSubmit = async () => {
    if (selectedSeatIds.size === 0) {
      alert("좌석을 하나 이상 선택해주세요.");
      return;
    }
    
    // (1) 로딩 상태 활성화 (중복 클릭 방지)
    setIsBookingLoading(true);
    setError(''); // 이전 에러 초기화
    const seatIdsArray = Array.from(selectedSeatIds);   // (2) Set을 배열로 변환

    try {
      // (3) (핵심!) 백엔드 예매 API 호출
      // (AuthContext가 axios 기본 헤더에 토큰을 넣어주고 있음)
     await axios.post('http://localhost:8080/api/bookings', {
          performanceSeatIds: seatIdsArray // BookingReqDto 형식
        });

      // (4) 예매 성공!
      alert("예매가 성공적으로 완료되었습니다!");
      onClose();  //모달 닫기
      navigate('/my-bookings')    // (5) 예매 내역 페이지로 이동

    } catch (err) {
      // (6) 예매 실패 (동시성 문제, DB 오류 등)
      console.error('예매 실패:', err);
      if (axios.isAxiosError<ErrorResponse>(err) && err.response) {
        // (중요!) 백엔드 6단계에서 만든 에러 메시지 표시
        // 예: "이미 예약된 좌석입니다." (SEAT_ALREADY_RESERVED)
        alert(`예매 실패: ${err.response.data.message}`);
      } else {
        alert('예매 중 알 수 없는 오류가 발생했습니다.');
      }  
      setIsBookingLoading(false);      // (7) 로딩 상태 해제
    }
  };

  // 렌더링 : <Modal> 컴포넌트로 감싸기
  return(
    <Modal
      isOpen={isOpen}             //부모(MusicalDetailPage)가 제어
      onRequestClose={onClose}    //ESC, 배경 클릭시 닫힘
      style={customModalStyles}   //위에서 정의한 모달 스타일 사용
    >
        {/* 닫기 버튼 */}
        <div className={styles.pageContainer}> 
          <button onClick={onClose} style={{float:'right', background:'none', border:'none', fontSize:'1.5em', cursor:'pointer'}}>
            &times;
          </button>

        {/* 렌더링 로직 */}
        {loading ?(
          <div className={styles.loading}>좌석 맵을 불러오는 중...</div>
        ) : error ?(
          <div className={styles.error}>에러: {error}</div>
        ) : performance ?(
          <>
          <h2 className={styles.title}>뮤지컬 &lt;{performance.musicalTitle}&gt;</h2>
          <p className={styles.subTitle}>
          {new Date(performance.performanceDate).toLocaleString('ko-KR')} ({performance.venueName})
        </p>

        <div className={styles.seatGrid}>
          {performance.seats.map((seat) => {
            const isSelected = selectedSeatIds.has(seat.performanceSeatId);
            const seatClass = `${styles.seat} ${seat.isReserved ? styles.reserved : ''} ${isSelected ? styles.selected : ''}`;

            return (
              <button
                key={seat.performanceSeatId}
                className={seatClass}
                onClick={() => handleSeatClick(seat)}
                disabled={seat.isReserved || isBookingLoading} // (수정)
              >
                {seat.seatNumber}
              </button>
            );
          })}
        </div>

        {/* 예매하기 버튼 */}
        <div className={styles.bookingActions}>
          <p>선택된 좌석 수: {selectedSeatIds.size}개</p>
          <button 
            className={styles.bookButton} 
            onClick={handleBookingSubmit}
            disabled={isBookingLoading} // (수정)
          >
            {isBookingLoading ? "예매 처리 중..." : "예매하기"}
          </button>
        </div>
        </>
        ) : null} 
      </div>
    </Modal>
  );
}

export default BookingPage;