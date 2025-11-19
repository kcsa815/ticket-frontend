import React, { useState, useRef } from "react";
import axios, { AxiosError } from "axios";
import styles from "./AdminPage.module.css";

interface ErrorResponse {
  message: string;
}

function AdminPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [runningTime, setRunningTime] = useState("");
  const [ageRating, setAgeRating] = useState("");
  const [posterImage, setPosterImage] = useState<File | null>(null);
  const [category, setCategory] = useState("DEFAULT");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // (1) <input type="file">을 가리킬 ref
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // (2) 파일 선택 핸들러
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPosterImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPosterImage(null);
      setPreviewUrl(null);
    }
  };

  // (4) 폼 제출 핸들러
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!posterImage) {
      setError("포스터 이미지는 필수입니다.");
      return;
    }
    setIsLoading(true);
    // ... (FormData 생성 및 API 호출 로직) ...
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("runningTime", runningTime);
    formData.append("ageRating", ageRating);
    formData.append("category", category);
    formData.append("posterImage", posterImage); // (if문 제거, 1차 가드 통과했으므로)

    try {
      const response = await axios.post(
        "https://musical-backend.onrender.com/api/musicals",
        formData
      );
      setSuccess(`뮤지컬(ID: ${response.data.musicalId}) 등록 성공!`);
      // (폼 초기화)
      setTitle("");
      setDescription("");
      setRunningTime("");
      setAgeRating("");
      setCategory("DEFAULT");
      setPosterImage(null);
      setPreviewUrl(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      console.error("뮤지컬 등록 실패:", err);
      if (axios.isAxiosError<ErrorResponse>(err) && err.response) {
        setError(err.response.data.message || "등록에 실패했습니다.");
      } else {
        setError("알 수 없는 오류 발생 (API 실패)");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // --- (5) JSX 렌더링 ---
  return (
    <div className={`content-wrapper ${styles.pageContainer}`}>
      <h2 className={styles.pageTitle}>새 공연 등록</h2>

      <div className={styles.mainLayout}>
        {/* --- 1. 왼쪽 컬럼 (제목 + 포스터) --- */}
        <div className={styles.leftColumn}>
          {/* (Req 1) 클릭 가능한 포스터 미리보기 */}
          <label htmlFor="posterImage" className={styles.posterPreview}>
            {previewUrl ? (
              <img src={previewUrl} alt="포스터 미리보기" />
            ) : (
              <span>포스터 (클릭하여 업로드)</span>
            )}
          </label>

          {/* (2) "숨겨진" 파일 인풋 (id="posterImage"가 label과 연결됨) */}
          <input
            id="posterImage" // 👈 (htmlFor와 일치)
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            ref={fileInputRef}
            required
            className={styles.hiddenFileInput} // (CSS로 숨김)
          />
        </div>

        {/* --- 2. 오른쪽 컬럼 (폼) --- */}
        <div className={styles.rightColumn}>
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="title">뮤지컬 제목</label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            {/* (Req 2) 오른쪽의 "포스터 이미지" 폼 그룹은 "삭제" (의도대로) */}

            <div className={styles.formGroup}>
              <label htmlFor="description">상세 정보 (HTML 가능)</label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder='<img src=""/>'
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="runningTime">관람 시간 (분)</label>
              <input
                id="runningTime"
                type="number"
                value={runningTime}
                onChange={(e) => setRunningTime(e.target.value)}
                placeholder="예: 180"
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="ageRating">관람 등급</label>
              <input
                id="ageRating"
                type="text"
                value={ageRating}
                onChange={(e) => setAgeRating(e.target.value)}
                placeholder="15세 이상 관람 가능"
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="category">카테고리</label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="DEFAULT">일반</option>
                <option value="RANKING">랭킹</option>
                <option value="UPCOMING">오픈예정</option>
                <option value="SALE">할인 중</option>
              </select>
            </div>

            <button
              type="submit"
              className={styles.submitButton}
              disabled={isLoading}
            >
              {isLoading ? "등록 중..." : "공연 등록하기"}
            </button>

            {error && <p className={styles.error}>{error}</p>}
            {success && <p className={styles.success}>{success}</p>}
          </form>
        </div>
      </div>
    </div>
  );
}

export default AdminPage;
