import React, { useState, useEffect } from "react";
import axios, { AxiosError } from "axios";
import { useParams, useNavigate, Link } from "react-router-dom";
import styles from "./MusicalDetailPage.module.css";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./CalendarCustom.css";
import BookingPage from "./BookingPage";

// 1. (GET /api/musicals/{id} 응답 타입)
interface MusicalDetail {
  musicalId: number;
  title: string;
  description: string;
  posterImageUrl: string;
  runningTime: number;
  ageRating: string;
  minPrice: number | null;
  maxPrice: number | null;
}

// 2. (GET /api/performances/musical/{id} 응답 타입)
interface PerformanceSimple {
  performanceId: number;
  performanceDate: string;
  venueName: string;
}

// 3. (에러 응답 타입)pageContainer
interface ErrorResponse {
  message: string;
}

const isSameDay = (dateA: Date, dateB: Date) => {
  return (
    dateA.getFullYear() === dateB.getFullYear() &&
    dateA.getMonth() === dateB.getMonth() &&
    dateA.getDate() === dateB.getDate()
  );
};

function MusicalDetailPage() {
  // --- (useState, useEffect 등 모든 로직은 위와 동일) ---
  const { musicalId } = useParams<{ musicalId: string }>();
  const [musical, setMusical] = useState<MusicalDetail | null>(null);
  const [performances, setPerformances] = useState<PerformanceSimple[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPerformanceId, setSelectedPerformanceId] = useState<
    number | null
  >(null);
  const navigate = useNavigate();

  //예매하기 버튼 클릭 핸들러
  const handleOpenModal = () => {
    if (selectedPerformanceId){
      setIsModalOpen(true);
    } else{
      alert("먼저 공연 회차를 선택해주세요.");
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false); // 모달 닫기
    setSelectedPerformanceId(null);
  };

  useEffect(() => {
    if (!musicalId) return;

    // (1) API 호출 함수 정의 (내용 복구)
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        // (API 2개 동시 호출)
        const musicalApiUrl = `http://localhost:8080/api/musicals/${musicalId}`;
        const performanceApiUrl = `http://localhost:8080/api/performances/musical/${musicalId}`;

        const [musicalResponse, performanceResponse] = await Promise.all([
          axios.get<MusicalDetail>(musicalApiUrl),
          axios.get<PerformanceSimple[]>(performanceApiUrl),
        ]);

        setMusical(musicalResponse.data);
        setPerformances(performanceResponse.data);
      } catch (err) {
        console.error("데이터 조회 실패:", err);
        if (axios.isAxiosError<ErrorResponse>(err) && err.response) {
          // (수정) 500 에러 대신, 백엔드 404 에러의 '진짜' 메시지를 표시
          setError(
            err.response.data.message || "데이터를 불러오지 못했습니다."
          );
        } else {
          setError("알 수 없는 오류가 발생했습니다.");
        }
      } finally {
        setLoading(false); // (중요!) 성공/실패 시 로딩 종료
      }
    };

    fetchData(); // (2) 함수 실행
  }, [musicalId]);

  const filteredPerformances = performances.filter((perf) => {
    const performanceDate = new Date(perf.performanceDate);
    return isSameDay(performanceDate, selectedDate);
  });

  const onDateChange = (date: any) => {
    if (date instanceof Date) {
      setSelectedDate(date);
      setSelectedPerformanceId(null);
    }
  };
  
  const handlePerfSelect = (performanceId: number) => {
    setSelectedPerformanceId(performanceId); // (클릭한 회차 ID 저장)
  };
  // --- (로직 끝) ---

  // --- (렌더링 JSX) ---
  if (loading)
    return <div className={styles.loading}>데이터를 불러오는 중...</div>;
  if (error) return <div className={styles.error}>에러: {error}</div>;
  if (!musical) return null;

  return (
    // (1200px 중앙 정렬 래퍼)
    <div className={`content-wrapper`}>
      <div className={styles.mainLayout}>
        {/* --- 2. 왼쪽 컬럼 (수정) --- */}
        <div className={styles.leftColumn}>
          {/* (1) (신규) 제목을 .topInfoSection 밖으로 이동 */}
          <h3 className={styles.title}>뮤지컬 &lt;{musical.title}&gt;</h3>

          {/* 2-1. (상단) 포스터 + (나머지) 기본 정보 */}
          <section className={styles.topInfoSection}>
            <img
              src={`http://localhost:8080${musical.posterImageUrl}`}
              alt={musical.title}
              className={styles.posterImage}
            />
            <div className={styles.metaInfo}>
              {performances.length > 0 && (
                <p>
                  <strong>공연장소:</strong> {performances[0].venueName}
                </p>
              )}
              <p>
                <strong>공연시간:</strong> {musical.runningTime}분(인터미션 20분
                포함)
              </p>
              <p>
                <strong>관람연령:</strong> {musical.ageRating}세 이상 관람 가능
              </p>
              {musical.minPrice && musical.maxPrice ? (
                <p>
                  <strong>가격: </strong> {musical.minPrice.toLocaleString()}원
                  ~ {musical.maxPrice.toLocaleString()}원
                </p>
              ) : (
                <p>
                  <strong>가격: </strong> (회차 선택)
                </p>
              )}
            </div>
          </section>

          {/* 2-2. (하단) 상세 정보 (스크롤) */}
          <section className={styles.fullDescriptionSection}>
            <h4>공연 상세 정보</h4>
            <div className={styles.descriptionBox}>
              <div dangerouslySetInnerHTML={{ __html: musical.description }} />
            </div>
          </section>
        </div>
        {/* --------------------------------- */}
        {/* --- 3. 오른쪽 컬럼 (Req 3, 4) --- */}
        {/* --------------------------------- */}
        <div className={styles.rightColumn}>
          <h3>공연 날짜 선택</h3>
          <div className={styles.calendarContainer}>
            <Calendar
              onChange={onDateChange}
              value={selectedDate}
              formatDay={(locale, date) => date.getDate().toString()}
            />
          </div>

          {/* 3-2. '필터링된' 회차 목록 */}
          <section className={styles.performanceSection}>
            <ul className={styles.performanceList}>
              <li className={styles.listHeader}>
                {selectedDate.toLocaleDateString("ko-KR")}
              </li>
              {filteredPerformances.length > 0 ? (
                filteredPerformances.map((perf) => (
                  <li
                    key={perf.performanceId}
                    className={styles.performanceItem}
                  >
                    <div className={styles.performanceInfo} onClick={() => handlePerfSelect(perf.performanceId)}>
                        <strong>
                          {new Date(perf.performanceDate).toLocaleTimeString(
                            "ko-KR",
                            { hour: "2-digit", minute: "2-digit" }
                          )}
                        </strong>
                      <span>{perf.venueName}</span>
                    </div>
                  </li>
                ))
              ) : (
                <li>선택한 날짜에 예매 가능한 회차가 없습니다.</li>
              )}
            </ul>
            <div className={styles.bookingActions}>
              <button
                onClick={handleOpenModal}
                className={styles.bookButton}
                disabled={!selectedPerformanceId} //선택 회차 없으면 비활성화
              >
                예매하기
              </button>
            </div>
          </section>
        </div>{" "}
        {/* (오른쪽 컬럼 끝) */}
      </div>{" "}
      {/* (메인 레이아웃 끝) */}
      {/* --- 모달 렌더링 --- */}
      {/* BookingPage는 이제 "페이지"가 아니라 여기에 "모달"로 렌더링됩니다.
        (isModalOpen이 true일 때만 열림)
      */}
      <BookingPage
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        performanceId={selectedPerformanceId}
      />
    </div> /* (content-wrapper 끝) */
  );
}

export default MusicalDetailPage;
