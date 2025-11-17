/**
 * 작성자 : suan
 * 공연 수정 페이지
 *
 * 최종 작성일  :2025-11-13
 */

import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios, { AxiosError } from 'axios';
import styles from './AdminPage.module.css'; // 👈 (CSS 재사용)

interface ErrorResponse { message: string; }

function AdminMusicalEditPage() {
  const { musicalId } = useParams<{ musicalId: string }>();
  const navigate = useNavigate();

  // --- (State 선언) ---
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [runningTime, setRunningTime] = useState('');
  const [ageRating, setAgeRating] = useState('');
  const [posterImage, setPosterImage] = useState<File | null>(null); // (새 파일)
  const [category, setCategory] = useState('DEFAULT');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // (수정 페이지용 State)
  const [currentPosterUrl, setCurrentPosterUrl] = useState(''); // (기존 이미지 URL)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null); // (새 이미지 미리보기)

  // --- (useEffect - 기존 데이터 불러오기) ---
  useEffect(() => {
    if (!musicalId) return;
    const fetchMusicalData = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8080/api/musicals/${musicalId}`
        );
        const data = response.data; 
        setTitle(data.title);
        setDescription(data.description || '');
        setRunningTime(data.runningTime.toString()); 
        setAgeRating(data.ageRating || '');
        setCategory(data.category || 'DEFAULT');
        setCurrentPosterUrl(data.posterImageUrl || ""); 
      } catch (err) { 
        console.error("뮤지컬 정보 로드 실패:", err);
        setError("공연 정보를 불러오는 데 실패했습니다.");
      }
    };
    fetchMusicalData();
  }, [musicalId]);

  // --- (handleFileChange - 미리보기 추가) ---
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

  // --- (handleSubmit - PUT 로직) ---
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
    if (posterImage) { // (새 파일이 있을 때만 추가)
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
        setError("알 수 없는 오류 발생 (API 실패)");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // --- 👇 [핵심!] JSX 렌더링 수정 ---
  return (
    <div className={`content-wrapper ${styles.pageContainer}`}>
      
      <div className={styles.mainLayout}>
        
        {/* --- 1. 왼쪽 컬럼 (제목 + 포스터) --- */}
        <div className={styles.leftColumn}>
          <h2 className={styles.pageTitle}>뮤지컬 수정 (ID: {musicalId})</h2>
          
          <div className={styles.posterPreview}>
            {/* (1순위: 새 이미지 미리보기) */}
            {previewUrl ? (
              <img src={previewUrl} alt="새 포스터 미리보기" />
            ) : 
            /* (2순위: 기존 이미지) */
            currentPosterUrl ? (
              <img src={`http://localhost:8080${currentPosterUrl}`} alt="현재 포스터" />
            ) : (
            /* (3순위: 플레이스홀더) */
              <span>포스터 이미지</span>
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
              <label htmlFor="posterImage">포스터 이미지 (변경 시에만 업로드)</label>
              <input id="posterImage" type="file" accept="image/*" onChange={handleFileChange} ref={fileInputRef} />
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