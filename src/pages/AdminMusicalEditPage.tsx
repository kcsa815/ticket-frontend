import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios, { AxiosError } from 'axios';
import styles from './AdminPage.module.css';

interface ErrorResponse { message: string; }

function AdminMusicalEditPage() {
  const { musicalId } = useParams<{ musicalId: string }>();
  const navigate = useNavigate();

  // --- (1) State 선언 ---
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [runningTime, setRunningTime] = useState('');
  const [ageRating, setAgeRating] = useState('');
  const [posterImage, setPosterImage] = useState<File | null>(null); // (새 파일)
  const [category, setCategory] = useState('DEFAULT');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // (ref는 '초기화' 및 '클릭'용으로 사용)
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // (미리보기용 State)
  const [currentPosterUrl, setCurrentPosterUrl] = useState(''); // (기존 이미지 URL)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null); // (새 이미지 미리보기)

  // --- (2) useEffect (기존 데이터 불러오기) ---
  // [수정!] "null" 버그 수정
  useEffect(() => {
    if (!musicalId) return;
    const fetchMusicalData = async () => {
      try {
        const response = await axios.get(
          `https://musical-backend.onrender.com`
        );
        const data = response.data; 
        
        // (null-safe하게 State 채우기)
        setTitle(data.title || "");
        setDescription(data.description || "");
        setRunningTime(data.runningTime ? data.runningTime.toString() : ""); // 👈 "null" 버그 수정
        setAgeRating(data.ageRating || "");
        setCategory(data.category || "DEFAULT");
        setCurrentPosterUrl(data.posterImageUrl || ""); 

      } catch (err) { 
        console.error("뮤지컬 정보 로드 실패:", err);
        setError("공연 정보를 불러오는 데 실패했습니다.");
      }
    };
    fetchMusicalData();
  }, [musicalId]);

  // --- (3) handleFileChange (미리보기) ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPosterImage(file);
      setPreviewUrl(URL.createObjectURL(file)); // (새 이미지 미리보기)
    } else {
      setPosterImage(null);
      setPreviewUrl(null);
    }
  };
  
  // (4) [삭제!] handlePosterClick (이제 <label>이 대신함)
  // const handlePosterClick = () => { ... };

  // --- (5) handleSubmit (수정 로직) ---
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("runningTime", runningTime);
    formData.append("ageRating", ageRating);
    formData.append("category", category);
    
    // (새 파일이 있을 때만 FormData에 추가)
    if (posterImage) { 
      formData.append('posterImage', posterImage);
    }

    try {
      await axios.put(
        `https://musical-backend.onrender.com`,
        formData
      );
      setSuccess(`뮤지컬(ID: ${musicalId}) 수정 성공!`);
      setTimeout(() =>{         
        navigate(`/musical/${musicalId}`);
      }, 1000); 

    } catch (err) {
      console.error("뮤지컬 수정 실패:", err);
      if (axios.isAxiosError<ErrorResponse>(err) && err.response) {
        setError(err.response.data.message || "수정에 실패했습니다.");
      } else {
        setError("알 수 없는 오류 발생 (API 실패)");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // --- (6) JSX 렌더링 (Req 1, 2) ---
  return (
    <div className={`content-wrapper ${styles.pageContainer}`}>
      <h2 className={styles.pageTitle}>뮤지컬 수정 (ID: {musicalId})</h2>
      
      <div className={styles.mainLayout}>
        
        {/* --- 1. 왼쪽 컬럼 (제목 + 포스터) --- */}
        <div className={styles.leftColumn}>
          
          {/* --- 👇 [핵심 수정!] div -> label --- */}
          {/* (1) 'div'를 'label'로 변경, 'htmlFor' 추가, 'onClick' 제거 */}
          <label htmlFor="posterImage" className={styles.posterPreview}>
            {previewUrl ? (
              <img src={previewUrl} alt="새 포스터 미리보기" />
            ) : 
            currentPosterUrl ? (
              <img src={`https://musical-backend.onrender.com`} alt="현재 포스터" />
            ) : (
              <span>포스터 (클릭하여 변경)</span>
            )}
          </label>
          
          {/* (2) "숨겨진" 파일 인풋 (id="posterImage"가 label과 연결됨) */}
          <input 
            id="posterImage" 
            type="file" 
            accept="image/*" 
            onChange={handleFileChange} 
            ref={fileInputRef} 
            className={styles.hiddenFileInput} // (CSS로 숨김)
            // (수정 폼에서는 'required'가 아님)
          />
          {/* --- 👆 --- */}
        </div>

        {/* --- 2. 오른쪽 컬럼 (폼) --- */}
        <div className={styles.rightColumn}>
          <form onSubmit={handleSubmit} className={styles.form}>
            
            <div className={styles.formGroup}>
              <label htmlFor="title">뮤지컬 제목</label>
              <input id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            
            {/* (Req 2) 오른쪽의 "포스터 이미지" 폼 그룹은 "삭제" */}

            <div className={styles.formGroup}>
              <label htmlFor="description">상세 정보 (HTML 가능)</label>
              <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder='<img src=""/>'/>
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="runningTime">관람 시간 (분)</label>
              <input id="runningTime" type="number" value={runningTime} onChange={(e) => setRunningTime(e.target.value)} placeholder="예: 180" required />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="ageRating">관람 등급</label>
              <input id="ageRating" type="text" value={ageRating} onChange={(e) => setAgeRating(e.target.value)} placeholder="15세 이상 관람 가능"/>
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="category">카테고리</label>
              <select id="category" value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="DEFAULT">일반</option>
                <option value="RANKING">랭킹</option>
                <option value="UPCOMING">오픈예정</option>
                <option value="SALE">할인 중</option>
              </select>
            </div>

            <button type="submit" className={styles.submitButton} disabled={isLoading}>
              {isLoading ? "수정 중..." : "뮤지컬 수정하기"}
            </button>
            
            {error && <p className={styles.error}>{error}</p>}
            {success && <p className={styles.success}>{success}</p>}
          </form>
        </div>
      </div>
    </div>
  );
}

export default AdminMusicalEditPage;