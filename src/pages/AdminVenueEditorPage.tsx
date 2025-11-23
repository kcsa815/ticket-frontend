import React, { useState, useRef, useEffect, useMemo } from "react";
import axios, { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import {
  Download,
  Upload,
  Plus,
  Trash2,
  Save,
  Grid,
  MousePointer,
} from "lucide-react";
import styles from "./AdminVenueEditor.module.css";

// --- (타입 정의) ---
interface Seat {
  id: number;
  seatNumber: number;
  x: number;
  y: number;
  grade: string;
  color: string;
}
interface VenueSaveReqDto {
  name: string;
  location: string;
  region: string;
  seats: {
    seatNumber: string;
    seatGrade: string;
    xCoord: number;
    yCoord: number;
  }[];
}
interface ErrorResponse {
  message: string;
}
// --------------------

const SeatLayoutEditor = () => {
  const [seats, setSeats] = useState<Seat[]>([]);
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [selectedGrade, setSelectedGrade] = useState("VIP");
  const [mode, setMode] = useState("add");
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);
  const [scale, setScale] = useState(1);
  const [seatCounter, setSeatCounter] = useState(1);
  const [seatSize, setSeatSize] = useState(32);
  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const importFileInputRef = useRef<HTMLInputElement>(null);

  // API 연동을 위한 State
  const [venueName, setVenueName] = useState("새 공연장");
  const [venueLocation, setVenueLocation] = useState("서울");
  const [venueRegion, setVenueRegion] = useState("SEOUL");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");
  const [apiSuccess, setApiSuccess] = useState("");
  const navigate = useNavigate();

  // 등급/가격 정의
  const grades = [
    { name: "VIP", color: "#c93d79", price: 170000 },
    { name: "R", color: "#4a9ff5", price: 150000 },
    { name: "S", color: "#5cb85c", price: 120000 },
    { name: "A", color: "#f0ad4e", price: 90000 },
  ];

  // 이미지 업로드
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setBackgroundImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // 캔버스 클릭
  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;

    if (mode === "add") {
      const newSeat: Seat = {
        id: Date.now(),
        seatNumber: seatCounter,
        x: Math.round(x),
        y: Math.round(y),
        grade: selectedGrade,
        color: grades.find((g) => g.name === selectedGrade)!.color,
      };
      setSeats([...seats, newSeat]);
      setSeatCounter(seatCounter + 1);
    } else if (mode === "delete") {
      const clickedSeat = seats.find((seat) => {
        const distance = Math.sqrt(
          Math.pow(seat.x - x, 2) + Math.pow(seat.y - y, 2)
        );
        return distance < seatSize / 2 / scale;
      });
      if (clickedSeat) {
        setSeats(seats.filter((s) => s.id !== clickedSeat.id));
      }
    }
  };

  // 좌석 클릭
  const handleSeatClick = (seat: Seat, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedSeat(seat);
  };

  // 등급 변경
  const updateSeatGrade = (seatId: number, newGrade: string) => {
    setSeats(
      seats.map((seat) =>
        seat.id === seatId
          ? {
              ...seat,
              grade: newGrade,
              color: grades.find((g) => g.name === newGrade)!.color,
            }
          : seat
      )
    );
    if (selectedSeat && selectedSeat.id === seatId) {
      setSelectedSeat((prev) =>
        prev
          ? {
              ...prev,
              grade: newGrade,
              color: grades.find((g) => g.name === newGrade)!.color,
            }
          : null
      );
    }
  };

  // JSON 내보내기 (수정: x, y → xCoord, yCoord)
  const exportData = () => {
    const data = {
      seats: seats.map(({ id, x, y, ...rest }) => ({
        ...rest,
        xCoord: Math.round(x),
        yCoord: Math.round(y), 
      })),
      backgroundImage: backgroundImage,
      timestamp: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `seat-layout-${Date.now()}.json`;
    a.click();
  };

  // JSON 불러오기 (수정: xCoord, yCoord → x, y)
  const importData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event: ProgressEvent<FileReader>) => {
      try {
        const result = event.target?.result;
        
        // 1. 타입 검증
        if (typeof result !== "string") {
          throw new Error("파일을 읽을 수 없습니다.");
        }

        // 2. JSON 파싱
        const data = JSON.parse(result);

        // 3. seats 배열 검증
        if (!data || !Array.isArray(data.seats)) {
          throw new Error("JSON 파일의 형식이 올바르지 않습니다. (seats 배열 누락)");
        }

        // 4. 좌석 데이터 변환 (xCoord, yCoord → x, y)
        let maxSeatNum = 0;
        const newSeats = data.seats.map((seat: any, index: number) => {
          const seatNumber = parseInt(seat.seatNumber, 10);

          // 좌표 변환: xCoord, yCoord → x, y (호환성 유지)
          const x = seat.xCoord !== undefined ? seat.xCoord : (seat.x || 0);
          const y = seat.yCoord !== undefined ? seat.yCoord : (seat.y || 0);

          if (isNaN(seatNumber)) {
            maxSeatNum = Math.max(maxSeatNum, seatCounter + index);
            return {
              ...seat,
              id: Date.now() + Math.random(),
              seatNumber: seatCounter + index,
              x: x,  
              y: y 
            };
          } else {
            maxSeatNum = Math.max(maxSeatNum, seatNumber);
            return {
              ...seat,
              id: Date.now() + Math.random(),
              seatNumber: seatNumber,
              x: x,  
              y: y
            };
          }
        });

        setSeats(newSeats);
        setBackgroundImage(data.backgroundImage || null);
        setSeatCounter(maxSeatNum + 1);
        
      } catch (error) {
        console.error("파일 불러오기 실패:", error);
        
        let errorMessage = "파일을 불러오는데 실패했습니다.";
        if (error instanceof Error) {
          errorMessage = error.message;
        } else if (typeof error === "string") {
          errorMessage = error;
        }
        
        alert(errorMessage);
      }
    };
    
    reader.onerror = () => {
      alert("파일을 읽는데 실패했습니다.");
    };
    
    reader.readAsText(file);
  };

  const clearAll = () => {
    if (window.confirm("모든 좌석을 삭제하시겠습니까?")) {
      setSeats([]);
      setSeatCounter(1);
    }
  };

  // API 서버로 저장 (POST /api/venues)
  const handleSaveToApi = async () => {
    if (seats.length === 0) {
      setApiError("최소 1개 이상의 좌석을 등록해야 합니다.");
      return;
    }
    
    setIsSubmitting(true);
    setApiError('');
    setApiSuccess('');

    // (1) 이 에디터의 State를 백엔드 DTO 형식으로 "변환"
    const venueDto: VenueSaveReqDto = {
      name: venueName,
      location: venueLocation,
      region: venueRegion,
      
      seats: seats.map(seat => ({
        seatNumber: String(seat.seatNumber), // (숫자 -> 문자열)
        seatGrade: seat.grade,
        xCoord: Math.round(seat.x),
        yCoord: Math.round(seat.y),
      }))
    };

    // (2) Postman의 'multipart/form-data' 요청을 FormData로 생성
    const formData = new FormData();
    
    // (A) JSON 파트 (Key: "venueDto" - Controller와 일치)
    formData.append("venueDto", new Blob([JSON.stringify(venueDto)], { type: "application/json" }));
    
    // (B) 이미지 파일 파트 (Key: "layoutImage")
    if (backgroundImage) {
      const response = await fetch(backgroundImage);
      const blob = await response.blob();
      const file = new File([blob], "layoutImage.png", { type: blob.type });
      formData.append("layoutImage", file);
    }

    try {
      // (3) API 호출
      const response = await axios.post(
        'http://localhost:8080/api/venues',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      
      setApiSuccess(`공연장(ID: ${response.data.venueId}) 등록 성공!`);
      // (성공 시 폼 초기화)
      setSeats([]);
      setSeatCounter(1);
      setBackgroundImage(null);
      setVenueName('새 공연장');
      setVenueLocation('서울');
      setVenueRegion('SEOUL');

    } catch (err) {
      console.error("공연장 등록 실패:", err);
      if (axios.isAxiosError<ErrorResponse>(err) && err.response) {
        // (400 에러의 "xCoord는..." 메시지가 여기에 표시됨)
        setApiError(err.response.data.message || '등록에 실패했습니다.');
      } else {
        setApiError('알 수 없는 오류 발생');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // 좌석 통계 계산
  const seatStats = useMemo(() => {
    const counts = new Map<string, number>();
    for (const grade of grades) {
      counts.set(grade.name, 0);
    }
    for (const seat of seats) {
      counts.set(seat.grade, (counts.get(seat.grade) || 0) + 1);
    }
    return Array.from(counts.entries());
  }, [seats, grades]);

  return (
    <div className={`content-wrapper`}>
      <div className={styles.pageContainer}>
        {/* 상단 툴바 */}
        <div className={styles.toolbar}>
          <div className={styles.toolbarInner}>
            {/* 좌측: 이미지 업로드 */}
            <div className={styles.toolbarGroup}>
              <button
                onClick={() => fileInputRef.current?.click()}
                className={`${styles.button} ${styles.blue}`}
              >
                <Upload size={16} />
                배치도 이미지 업로드
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className={styles.hiddenInput}
              />
            </div>

            {/* 중앙: 모드 선택 */}
            <div className={styles.toolbarGroup}>
              <button
                onClick={() => setMode("add")}
                className={`${styles.button} ${
                  mode === "add" ? styles.activeGreen : styles.gray
                }`}
              >
                <Plus size={16} /> 좌석 추가
              </button>
              <button
                onClick={() => setMode("delete")}
                className={`${styles.button} ${
                  mode === "delete" ? styles.activeRed : styles.gray
                }`}
              >
                <Trash2 size={16} /> 좌석 삭제
              </button>
            </div>

            {/* 우측: 저장/불러오기/삭제 */}
            <div className={styles.toolbarGroup}>
              <input
                type="file"
                accept=".json"
                onChange={importData}
                className={styles.hiddenInput}
                ref={importFileInputRef}
                id="import-file"
              />
              <label
                htmlFor="import-file"
                className={`${styles.button} ${styles.gray}`}
              >
                <Upload size={16} /> JSON 불러오기
              </label>
              <button
                onClick={exportData}
                className={`${styles.button} ${styles.purple}`}
              >
                <Download size={16} /> JSON 내보내기
              </button>
              <button
                onClick={clearAll}
                className={`${styles.button} ${styles.red}`}
              >
                <Trash2 size={16} /> 전체 삭제
              </button>
            </div>
          </div>

          {/* 툴바 (2번째 줄 - 등급 선택) */}
          {mode === "add" && (
            <div className={styles.gradeSelector}>
              <span>좌석 등급:</span>
              {grades.map((grade) => (
                <button
                  key={grade.name}
                  onClick={() => setSelectedGrade(grade.name)}
                  className={`${styles.gradeButton} ${
                    selectedGrade === grade.name ? styles.gradeButtonActive : ""
                  }`}
                  style={{ backgroundColor: grade.color }}
                >
                  {grade.name}
                </button>
              ))}
              <div style={{ marginLeft: "auto" }}>
                <span>좌석 크기:</span>
                <input
                  type="range"
                  min="16"
                  max="48"
                  value={seatSize}
                  onChange={(e) => setSeatSize(Number(e.target.value))}
                  style={{ verticalAlign: "middle", marginLeft: "10px" }}
                />
              </div>
            </div>
          )}
        </div>

        {/* 메인 캔버스 영역 */}
        <div className={styles.mainContent}>
          {/* 캔버스 */}
          <div className={styles.canvasWrapper}>
            <div
              ref={canvasRef}
              onClick={handleCanvasClick}
              className={styles.canvas}
              style={{
                transform: `scale(${scale})`,
                cursor: mode === "add" ? "crosshair" : "not-allowed",
              }}
            >
              {/* 배경 이미지 */}
              {backgroundImage && (
                <img
                  src={backgroundImage}
                  alt="Seat Layout"
                  className={styles.canvasBackground}
                />
              )}
              {/* 안내 메시지 */}
              {!backgroundImage && (
                <div className={styles.placeholder}>
                  <Grid size={64} />
                  <p>배치도 이미지를 업로드하세요</p>
                </div>
              )}
              {/* 좌석들 */}
              {seats.map((seat) => (
                <div
                  key={seat.id}
                  onClick={(e) => handleSeatClick(seat, e)}
                  className={styles.seat}
                  style={{
                    left: `${seat.x}px`,
                    top: `${seat.y}px`,
                  }}
                >
                  <div
                    className={styles.seatInner}
                    style={{
                      backgroundColor: seat.color,
                      width: `${seatSize}px`,
                      height: `${seatSize}px`,
                    }}
                  >
                    {seat.seatNumber}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 우측 사이드바 */}
          <div className={styles.sidebar}>
            {/* API 저장 폼 */}
            <div className={styles.sidebarBox}>
              <h3>1. 공연장 정보 입력</h3>
              <div
                className={styles.formGroup}
                style={{ marginBottom: "10px" }}
              >
                <label htmlFor="venueName">공연장 이름</label>
                <input
                  type="text"
                  id="venueName"
                  value={venueName}
                  onChange={(e) => setVenueName(e.target.value)}
                />
              </div>
              <div
                className={styles.formGroup}
                style={{ marginBottom: "10px" }}
              >
                <label htmlFor="venueLocation">주소</label>
                <input
                  type="text"
                  id="venueLocation"
                  value={venueLocation}
                  onChange={(e) => setVenueLocation(e.target.value)}
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="venueRegion">지역 (DB와 일치해야 함)</label>
                <input
                  type="text"
                  id="venueRegion"
                  value={venueRegion}
                  onChange={(e) => setVenueRegion(e.target.value.toUpperCase())}
                  placeholder="예: SEOUL"
                />
              </div>
            </div>

            <div className={styles.sidebarBox}>
              <h3>2. 좌석 통계</h3>
              <div className={styles.infoRow}>
                <span>총 좌석:</span>
                <span>{seats.length}석</span>
              </div>
              {seatStats.map(([grade, count]) => (
                <div key={grade} className={styles.infoRow}>
                  <span
                    style={{
                      color: grades.find((g) => g.name === grade)!.color,
                    }}
                  >
                    {grade}석:
                  </span>
                  <span>{count}석</span>
                </div>
              ))}
            </div>

            {/* 선택된 좌석 정보 */}
            {selectedSeat && (
              <div className={styles.sidebarBox}>
                <h3>3. 선택 좌석 수정</h3>
                <div className={styles.infoRow}>
                  <span>좌석 번호:</span>
                  <span>{selectedSeat.seatNumber}</span>
                </div>
                <div className={styles.infoRow}>
                  <span>좌표 (X, Y):</span>
                  <span>
                    {Math.round(selectedSeat.x)}, {Math.round(selectedSeat.y)}
                  </span>
                </div>
                <div style={{ marginTop: "15px" }}>
                  <label>등급 변경:</label>
                  <select
                    value={selectedSeat.grade}
                    onChange={(e) =>
                      updateSeatGrade(selectedSeat.id, e.target.value)
                    }
                  >
                    {grades.map((grade) => (
                      <option key={grade.name} value={grade.name}>
                        {grade.name} - {grade.price.toLocaleString()}원
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* 저장 버튼 */}
            <div style={{ marginTop: "30px" }}>
              <button
                onClick={handleSaveToApi}
                className={`${styles.button} ${styles.blue}`}
                style={{ width: "100%", padding: "15px" }}
                disabled={isSubmitting}
              >
                <Save size={18} />
                {isSubmitting ? "저장 중..." : "이 공연장 DB에 저장하기"}
              </button>
              {apiError && (
                <p style={{ color: "#d9534f", marginTop: "10px" }}>
                  {apiError}
                </p>
              )}
              {apiSuccess && (
                <p style={{ color: "#58a65c", marginTop: "10px" }}>
                  {apiSuccess}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatLayoutEditor;