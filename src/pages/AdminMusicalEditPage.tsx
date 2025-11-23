import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios, { AxiosError } from 'axios';
import styles from './AdminPage.module.css';

interface ErrorResponse { message: string; }

function AdminMusicalEditPage() {
  const { musicalId } = useParams<{ musicalId: string }>();
  const navigate = useNavigate();

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentPosterUrl, setCurrentPosterUrl] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // --- (1) 기존 데이터 불러오기 (Null-Safe Fix) ---
  useEffect(() => {
    if (!musicalId) return;
    const fetchMusicalData = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8080/api/musicals/${musicalId}` 
        );
        const data = response.data; 
        
        // 👇👇👇 [핵심 FIX!] null이면 toString() 호출하지 않도록 방어 👇👇👇
        setTitle(data.title || '');
        setDescription(data.description || '');
        
        // FIX: null/undefined가 아닐 때만 toString() 호출, 아니면 빈 문자열
        setRunningTime(data.runningTime ? data.runningTime.toString() : ''); 
        
        setAgeRating(data.ageRating || '');
        setCategory(data.category || 'DEFAULT');
        setCurrentPosterUrl(data.posterImageUrl || ""); 
        // 👆👆👆

      } catch (err) { 
        console.error("뮤지컬 정보 로드 실패:", err);
        setError("공연 정보를 불러오는 데 실패했습니다. (API 확인 필요)");
      }
    };
    fetchMusicalData();
  }, [musicalId]);

  // --- (2) handleFileChange (미리보기) ---
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
  
  // --- (3) handleSubmit (수정 로직) ---
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    // FormData 생성 및 데이터 추가 (동일)
    const musicalDtoData = {
        title: title,
        description: description,
        runningTime: Number(runningTime),
        ageRating: ageRating,
        category: category,
    };
    
    const formData = new FormData();
    formData.append('musicalDto', JSON.stringify(musicalDtoData));
    
    if (posterImage) { 
      formData.append('posterImage', posterImage);
    }

    try {
      await axios.put(
        `http://localhost:8080/api/musicals/${musicalId}`,
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
        setError("알 수 없는 오류 발생");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // --- (4) JSX 렌더링 ---
  return (
    <div className={`content-wrapper ${styles.pageContainer}`}>
      <h2 className={styles.pageTitle}>뮤지컬 수정 (ID: {musicalId})</h2>
      
      <div className={styles.mainLayout}>
        
        {/* --- 1. 왼쪽 컬럼 (포스터) --- */}
        <div className={styles.leftColumn}>
          
          <label htmlFor="posterImage" className={styles.posterPreview}>
            {previewUrl ? (
              <img src={previewUrl} alt="새 포스터 미리보기" />
            ) : 
            currentPosterUrl ? (
              <img src={`http://localhost:8080${currentPosterUrl}`} alt="현재 포스터" />
            ) : (
              <span>포스터 (클릭하여 변경)</span>
            )}
          </label>
          
          <input 
            id="posterImage" 
            type="file" 
            accept="image/*" 
            onChange={handleFileChange} 
            ref={fileInputRef} 
            className={styles.hiddenFileInput} 
          />
        </div>

        {/* --- 2. 오른쪽 컬럼 (폼) --- */}
        <div className={styles.rightColumn}>
          <form onSubmit={handleSubmit} className={styles.form}>
            
            <div className={styles.formGroup}>
              <label htmlFor="title">뮤지컬 제목</label>
              <input id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            
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