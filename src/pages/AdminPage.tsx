import React, { useState, useRef } from 'react'; // 👈 [1. (필수!)] "useRef"를 'react'에서 임포트
import axios, { AxiosError } from 'axios';
import styles from './AdminPage.module.css';

interface ErrorResponse { message: string; }

function AdminPage() {
  // --- (State 선언) ---
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [runningTime, setRunningTime] = useState('');
  const [ageRating, setAgeRating] = useState('');
  const [posterImage, setPosterImage] = useState<File | null>(null);
  const [category, setCategory] = useState('DEFAULT');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // --- 👇 [2. (필수!)] "fileInputRef" 변수 선언 ---
  const fileInputRef = useRef<HTMLInputElement>(null);
  // --- 👆 ---

  // (신규) 포스터 이미지 "미리보기"용 URL state
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // --- (handleFileChange 수정) ---
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

  // --- (handleSubmit 수정) ---
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // (1) 1차 가드 (null 체크)
    if (!posterImage) {
      setError("포스터 이미지는 필수입니다.");
      return;
    }
    
    setIsLoading(true);
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('runningTime', runningTime);
    formData.append('ageRating', ageRating);
    formData.append('category', category);
    
    // (2) 2차 가드 (IDE 꼬임 우회)
    if (posterImage) {
      formData.append('posterImage', posterImage);
    } else {
      setError("포스터 이미지 오류. 다시 선택해주세요.");
      setIsLoading(false);
      return; 
    }

    try {
      const response = await axios.post(
        'http://localhost:8080/api/musicals',
        formData
      );
      
      setSuccess(`뮤지컬(ID: ${response.data.musicalId}) 등록 성공!`);
      
      // (폼 초기화)
      setTitle('');
      setDescription('');
      setRunningTime('');
      setAgeRating('');
      setCategory('DEFAULT');
      setPosterImage(null);
      setPreviewUrl(null); // (미리보기 URL 초기화)
      
      // (3) "fileInputRef" 사용 (정상)
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

    } catch (err) { 
      console.error('뮤지컬 등록 실패:', err);
      if (axios.isAxiosError<ErrorResponse>(err) && err.response) {
        setError(err.response.data.message || '등록에 실패했습니다.');
      } else {
        setError('알 수 없는 오류 발생 (API 실패)');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // --- (JSX 렌더링) ---
  return (
    <div className={`content-wrapper ${styles.pageContainer}`}>
      
      <div className={styles.mainLayout}>
        
        {/* --- 1. 왼쪽 컬럼 (제목 + 포스터) --- */}
        <div className={styles.leftColumn}>
          <h2 className={styles.pageTitle}>새 뮤지컬 등록</h2>
          
          <div className={styles.posterPreview}>
            {previewUrl ? (
              <img src={previewUrl} alt="포스터 미리보기" />
            ) : (
              <span>포스터 미리보기</span>
            )}
          </div>
        </div>

        {/* --- 2. 오른쪽 컬럼 (폼) --- */}
        <div className={styles.rightColumn}>
          <form onSubmit={handleSubmit} className={styles.form}>
            
            <div className={styles.formGroup}>
              <label htmlFor="title">뮤지컬 제목</label>
              <input id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="posterImage">포스터 이미지</label>
              {/* (4) "fileInputRef" 사용 (정상) */}
              <input id="posterImage" type="file" accept="image/*" onChange={handleFileChange} ref={fileInputRef} required />
            </div>

            {/* ... (description, runningTime, ageRating, category ...) ... */}

            <button type="submit" className={styles.submitButton} disabled={isLoading}>
              {isLoading ? "등록 중..." : "뮤지컬 등록하기"}
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