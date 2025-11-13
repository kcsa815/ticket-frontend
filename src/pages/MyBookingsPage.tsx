/**
 * 부킹페이지(예매하기) -> 결제창(아직 구현 안함 / 결제 완료) ->했을 때 나오는 내가 예약 페이지 
 */
import { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './MyBookingsPage.module.css'; // 방금 만든 CSS
import { useAuth } from '../context/AuthContext'; // (토큰 확인용)

// --- (1) 백엔드 DTO와 맞추는 타입 정의 ---
// (GET /api/bookings/my 응답은 BookingResDto[] 입니다)

interface UserRes { email: string; username: string; }
interface PerformanceSimpleRes { musicalTitle: string; performanceDate: string; venueName: string; posterImageUrl: string; }
interface SeatRes { seatNumber: string; seatGrade: string; price: number; }

interface BookingResDto {
  bookingId: number;
  user: UserRes;
  performance: PerformanceSimpleRes;
  bookingStatus: 'COMPLETED' | 'CANCELED'; // 예매 상태
  totalPrice: number;
  bookingDate: string; // (createdAt)
  bookedSeats: SeatRes[];
}

interface ErrorResponse { message: string; }
// ------------------------------------

function MyBookingsPage() {
  const { isLoggedIn } = useAuth(); // (확인용)
  const [bookings, setBookings] = useState<BookingResDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // (2) (핵심!) 페이지가 로드될 때 API를 호출하는 로직
  useEffect(() => {
    // (방어 코드) 로그인이 안 되어있으면 API를 호출하지 않음
    // (App.tsx의 ProtectedRoute가 이미 막아주지만, 이중 확인)
    if (!isLoggedIn) {
      setLoading(false);
      setError("로그인이 필요합니다.");
      return;
    }

    const fetchMyBookings = async () => {
      setLoading(true);
      setError('');
      try {
        // (중요!) axios는 AuthContext가 설정한 토큰을 헤더에 자동으로 포함
        const response = await axios.get<BookingResDto[]>('http://localhost:8080/api/bookings/my');
        setBookings(response.data);
      } catch (err) {
        console.error('예매 내역 조회 실패:', err);
        if (axios.isAxiosError<ErrorResponse>(err) && err.response) {
          setError(err.response.data.message || '데이터를 불러오지 못했습니다.');
        } else {
          setError('알 수 없는 오류가 발생했습니다.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMyBookings();
  }, [isLoggedIn]); // isLoggedIn 상태가 바뀔 때(로그인/아웃)도 다시 호출

  // (3)예매 취소 핸들러
  const handleCancelBooking = async (bookingId: number) => {
    console.log(`5일차: ${bookingId}번 예매 취소 API 호출`);
    
    // 1. 사용자에게 취소 여부 재확인
    if (!window.confirm("정말 이 예매를 취소하시겠습니까?")) {
      return; // *취소* 누르면 함수 종료 
    }

    try {   //2. (중요!)백엔드 취소 API호출
      // AuthContext 가 토큰을 헤더에 자동으로 포함시킴
      await axios.delete(`http://localhost:8080/api/bookings/${bookingId}`);

      //3. API 호출 성공 시
      alert("예매가 성공적으로 취소되었습니다.");

      //4. (중요!) 화면 갱신 : 목록을 새로고침하는 대신, state에서 해당 목록의 'bookingStatus'만 'CANCELED'로 변경
      setBookings(prevBookings =>
        prevBookings.map(booking =>
          booking.bookingId ===bookingId
          ?{...booking, bookingStatus : 'CANCELED'}
          :booking
        )
      );
    } catch (err) {
      //5. API 호출 실패 시
      console.error('예매 취소 실패 : ', err);
      if(axios.isAxiosError<ErrorResponse>(err) && err.response) {
        //백엔드에서 만들었던 에러 메세지 표시
        alert(`취소 실패 : ${err.response.data.message}`);
      }else{
        alert('예매 취소 중 알 수 없는 오류가 발생했습니다.');
      }
    }
  };


  // --- (4) 렌더링(JSX) ---
  if (loading) return <div className={styles.loading}>예매 내역을 불러오는 중...</div>;
  if (error) return <div className={styles.error}>에러: {error}</div>;

  return (
    <div className={`content-wrapper ${styles.pageContainer}`}>
      <h2 className={styles.pageTitle}>나의 예매 내역</h2>

      {bookings.length === 0 ? (
        <p className={styles.noBookings}>예매 내역이 없습니다.</p>
      ) : (
        <div className={styles.bookingList}>
          {bookings.map((booking) => {
            // (신규) 취소된 예매는 흐리게 처리
            const isCanceled = booking.bookingStatus === 'CANCELED';
            const cardClass = `${styles.bookingCard} ${isCanceled ? styles.canceled : ''}`;

            return (
              <div key={booking.bookingId} className={cardClass}>
                
                {/* 1. 왼쪽 (포스터) */}
                <img 
                  src={`http://localhost:8080${booking.performance.posterImageUrl}`}
                  alt={booking.performance.musicalTitle}
                  className={styles.posterImage}
                />
                
                {/* 2. 중간 (예매 정보) */}
                <div className={styles.bookingInfo}>
                  <h3 className={styles.musicalTitle}>
                    뮤지컬 &lt;{booking.performance.musicalTitle}&gt;
                  </h3>
                  <p className={styles.infoLine}>
                    <strong>관람 일시:</strong> {new Date(booking.performance.performanceDate).toLocaleString('ko-KR')}
                  </p>
                  <p className={styles.infoLine}>
                    <strong>관람 장소:</strong> {booking.performance.venueName}
                  </p>
                  <p className={styles.infoLine}>
                    <strong>예매 좌석:</strong> 
                    {booking.bookedSeats?.map(seat => `${seat.seatNumber}(${seat.seatGrade})`).join(', ')}
                  </p>
                  <p className={styles.infoLine}>
                    <strong>총 결제액:</strong> {booking.totalPrice.toLocaleString()}원
                  </p>
                  <p className={styles.infoLine}>
                    <strong>예매 상태:</strong> 
                    <span className={isCanceled ? styles.statusCanceled : styles.statusCompleted}>
                      {isCanceled ? "취소 완료" : "예매 완료"}
                    </span>
                  </p>
                </div>

                {/* 3. 오른쪽 (취소 버튼 ) */}
                <div className={styles.actions}>
                  <button 
                    className={styles.cancelButton}
                    onClick={() => handleCancelBooking(booking.bookingId)}
                    disabled={isCanceled} // 이미 취소됐으면 비활성화
                  >
                    예매 취소
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default MyBookingsPage;