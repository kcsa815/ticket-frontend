import React, { useState, useRef } from 'react';
import axios, { AxiosError } from 'axios';
import styles from './AdminPage.module.css';

interface ErrorResponse { message: string; }

function AdminPage() {
  // --- (1) 폼 데이터 State 선언 ---
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [runningTime, setRunningTime] = useState('');
  const [ageRating, setAgeRating] = useState('');
  const [posterImage, setPosterImage] = useState<File | null>(null);
  const [category, setCategory] = useState('DEFAULT');
  
  // (로딩 및 메시지 State)
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // (파일 인풋/미리보기 State)
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // --- (2) 파일 선택 핸들러 (미리보기 포함) ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // (크기가 0바이트면 경고 후 중지)
      if (file.size === 0) {
        alert("파일 크기가 0바이트입니다. 다른 파일을 선택해주세요.");
        e.target.value = ''; // 인풋 초기화
        return;
      }

      setPosterImage(file);
      setPreviewUrl(URL.createObjectURL(file)); // (미리보기 URL 생성)
    } else {
      setPosterImage(null);
      setPreviewUrl(null);
    }
  };
  
  // --- (3) 폼 제출 핸들러 ---
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!posterImage) {
      setError("포스터 이미지는 필수입니다.");
      return;
    }
    
    setIsLoading(true);
    setError('');
    setSuccess('');

    // 1. JSON 데이터 객체 생성 (FormData에 담기 위해)
    const musicalDtoData = {
        title: title,
        description: description,
        runningTime: runningTime === '' ? 0 : Number(runningTime),
        ageRating: ageRating,
        category: category
    };

    console.log("FINAL DTO PAYLOAD:", musicalDtoData);
    
    const musicalDtoBlob = new Blob([JSON.stringify(musicalDtoData)], { 
        type: 'application/json' 
    });

    const formData = new FormData();
    
    // (1) JSON Blob 파트 (Key: "musicalDto")
    formData.append('musicalDto', musicalDtoBlob); 
    
    // (2) 파일 파트 (Key: "posterImage")
    if (posterImage) { 
      formData.append('posterImage', posterImage);
    }
    
    try {
      // 3. API 호출 (로컬 주소 사용)
      const response = await axios.post(
        'http://localhost:8080/api/musicals',
        formData
      );
      
      setSuccess(`뮤지컬(ID: ${response.data.musicalId}) 등록 성공!`);
      
      // 4. 폼 초기화
      setTitle('');
      setDescription('');
      setRunningTime('');
      setAgeRating('');
      setCategory('DEFAULT');
      setPosterImage(null);
      setPreviewUrl(null); 
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

  // --- (4) JSX 렌더링 (2단 레이아웃) ---
  return (
    <div className={`content-wrapper ${styles.pageContainer}`}>
      <h2 className={styles.pageTitle}>새 뮤지컬 등록</h2>
      
      <div className={styles.mainLayout}>
        
        {/* --- 1. 왼쪽 컬럼 (제목 + 포스터) --- */}
        <div className={styles.leftColumn}>
          
          {/* (1) 클릭 가능한 포스터 미리보기 (<label>이 Input을 대신 클릭함) */}
          <label htmlFor="posterImage" className={styles.posterPreview}>
            {previewUrl ? (
              <img src={previewUrl} alt="포스터 미리보기" />
            ) : (
              <span>포스터 (클릭하여 업로드)</span>
            )}
          </label>
          
          {/* (2) "숨겨진" 파일 인풋 (label과 연결됨) */}
          <input 
            id="posterImage" 
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