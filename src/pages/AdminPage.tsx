import React, { useState } from 'react';
import axios, { AxiosError } from 'axios';
import styles from './AdminPage.module.css';

interface ErrorResponse { message: string; }

function AdminPage() {
  // (1) 폼 데이터 State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState(''); // (HTML 상세설명)
  const [runningTime, setRunningTime] = useState(0);
  const [ageRating, setAgeRating] = useState('');
  const [posterImage, setPosterImage] = useState<File | null>(null); // (파일)

  // (2) 로딩 및 메시지 State
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // (3) 파일 선택 핸들러
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPosterImage(e.target.files[0]);
    }
  };

  // (4) 폼 제출 핸들러 (Postman 작업)
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!posterImage) {
      setError("포스터 이미지는 필수입니다.");
      return;
    }
    
    setIsLoading(true);
    setError('');
    setSuccess('');

    // (5) (핵심!) Postman의 form-data를 FormData 객체로 만듦
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description); // (HTML 상세설명)
    formData.append('runningTime', runningTime.toString());
    formData.append('ageRating', ageRating);
    formData.append('posterImage', posterImage); // (파일 객체)

    try {
      // (6) (핵심!) axios로 multipart/form-data 전송
      // (AuthContext가 ADMIN 토큰을 헤더에 자동으로 붙여줌)
      const response = await axios.post(
        'http://localhost:8080/api/musicals',
        formData,
        {
          headers: {
            // (중요!) axios가 자동으로 Content-Type을 multipart/form-data로 설정하게 둠
            // (절대 'Content-Type': 'application/json' 하지 말 것)
          }
        }
      );
      
      // (7) 성공
      setSuccess(`뮤지컬(ID: ${response.data.musicalId}) 등록 성공!`);
      // (폼 초기화)
      setTitle('');
      setDescription('');
      setPosterImage(null);
      // (input[type=file]은 코드로 초기화하기 복잡하므로 폼 자체를 reset)
      e.currentTarget.reset();

    } catch (err) {
      // (8) 실패
      console.error('뮤지컬 등록 실패:', err);
      if (axios.isAxiosError<ErrorResponse>(err) && err.response) {
        setError(err.response.data.message || '등록에 실패했습니다.');
      } else {
        setError('알 수 없는 오류 발생');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`content-wrapper ${styles.pageContainer}`}>
      <h2 className={styles.pageTitle}>관리자: 새 뮤지컬 등록</h2>
      
      <form onSubmit={handleSubmit} className={styles.form}>
        <div>
          <label htmlFor="title">뮤지컬 제목</label>
          <input id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        
        <div>
          <label htmlFor="posterImage">포스터 이미지</label>
          <input id="posterImage" type="file" accept="image/*" onChange={handleFileChange} required />
        </div>

        <div>
          <label htmlFor="description">상세 정보 (HTML 가능)</label>
          <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>

        <div>
          <label htmlFor="runningTime">관람 시간 (분) </label>
          <input id="runningTime" type="number" value={runningTime} onChange={(e) => setRunningTime(Number(e.target.value))} required />
        </div>

        <div>
          <label htmlFor="ageRating">관람 등급</label>
          <input id="ageRating" type="text" value={ageRating} onChange={(e) => setAgeRating(e.target.value)} />
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