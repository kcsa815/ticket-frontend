import React, { useState, useRef } from 'react';
import axios from 'axios';
import styles from './AdminPage.module.css';
/**
 * 작성자 : suan
 * 공연 등록 페이지
 * 
 * 최종 작성일  :2025-11-13
 */
interface ErrorResponse { message: string; }

function AdminPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [runningTime, setRunningTime] = useState('');
  const [ageRating, setAgeRating] = useState('');
  const [posterImage, setPosterImage] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [category, setCategory] = useState('DEFAULT');
  
  // (1) <input type="file">을 가리킬 ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPosterImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
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
    formData.append('posterImage', posterImage!);
    formData.append('category', category);

    try {
      const response = await axios.post(
        'http://localhost:8080/api/musicals',
        formData
        // (headers는 axios가 FormData를 보고 자동으로 설정하므로 생략)
      );
      
      // (7) 성공
      setSuccess(`뮤지컬(ID: ${response.data.musicalId}) 등록 성공!`);
      
      /**
       * 폼 초기화
       */

      // 텍스트, 숫자 State 초기화
      setTitle('');
      setDescription('');
      setRunningTime('');
      setAgeRating('');
      setCategory('DEFAULT');
      setPosterImage(null);
      
      // (핵심!) <input type="file">의 DOM 값을 '수동'으로 초기화
      if (fileInputRef.current) {
        fileInputRef.current.value = ""; // (파일 선택을 비움)
      }

    } catch (err) {
      // 실패
      console.error('뮤지컬 등록 실패:', err);
      if (axios.isAxiosError<ErrorResponse>(err) && err.response) {
        setError(err.response.data.message || '등록에 실패했습니다.');
      } else {
        // (catch 블록으로 넘어온 것은 API 실패 또는 네트워크 오류임)
        setError('알 수 없는 오류 발생 (API 실패)');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`content-wrapper ${styles.pageContainer}`}>
      <h2 className={styles.pageTitle}>관리자: 새 뮤지컬 등록</h2>
      
      {/* <form> 태그에는 ref가 필요 없음 */}
      <form onSubmit={handleSubmit} className={styles.form}>
        <div>
          <label htmlFor="title">뮤지컬 제목</label>
          <input id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        
        <div>
          <label htmlFor="posterImage">포스터 이미지</label>
          {/* (ref가 fileInputRef에 올바르게 연결되어 있는지 확인) */}
          <input id="posterImage" type="file" accept="image/*" onChange={handleFileChange} ref={fileInputRef} required />
        </div>

        <div>
          <label htmlFor="description">상세 정보 (HTML 가능)</label>
          <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder='<img src=""/>'/>
        </div>

        <div>
          <label htmlFor="runningTime">관람 시간 (분) </label>
          <input id="runningTime" type="number" value={runningTime} onChange={(e) => setRunningTime(e.target.value)} placeholder="160분(인터미션 20분 포함) *숫자만 입력*" required />
        </div>

        <div>
          <label htmlFor="ageRating">관람 등급</label>
          <input id="ageRating" type="text" value={ageRating} onChange={(e) => setAgeRating(e.target.value)} placeholder="15세 이상 관람 가능 *숫자만 입력*"/>
        </div>

        <div>
          <label htmlFor="category">카테고리</label>
            <select
              id = "category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="DEFAULT">일반</option>
              <option value="RANKING">랭킹</option>
              <option value="COMINGSOON">오픈예정</option>
              <option value="SALE">할인 중</option>
            </select>
        </div>

        <button type="submit" className={styles.submitButton} disabled={isLoading}>
          {isLoading ? "등록 중..." : "뮤지컬 등록하기"}
        </button>
        
        {error && <p className={styles.error}>{error}</p>}
        {success && <p className={styles.success}>{success}</p>}
      </form>
    </div>
  );
}

export default AdminPage;