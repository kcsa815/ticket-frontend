/**
 * 작성자 : suan
 * 공연 수정 페이지
 *
 * 최종 작성일  :2025-11-13
 */

import React, { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./AdminPage.module.css";

interface ErrorResponse {
  message: string;
}

function AdminMusicalEditPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [runningTime, setRunningTime] = useState("");
  const [ageRating, setAgeRating] = useState("");
  const [posterImage, setPosterImage] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [category, setCategory] = useState("DEFAULT");
  const { musicalId } = useParams<{ musicalId: string }>();
  const navigate = useNavigate(); //수정 완료 후 이동용
  const [currentPosterUrl, setCurrentPosterUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null); // (1) <input type="file">을 가리킬 ref

  useEffect(() => {
    if (!musicalId) return; 

    const fetchMusicalData = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8080/api/musicals/${musicalId}`
        );
        const data = response.data; 

        setTitle(data.title);
        setDescription(data.description || ''); // (null 방지)
        setRunningTime(data.runningTime.toString()); 
        setAgeRating(data.ageRating || ''); // (null 방지)
        setCategory(data.category || 'DEFAULT'); // (null 방지)
        setCurrentPosterUrl(data.posterImageUrl || ""); 
      } catch (err) {
        console.error("뮤지컬 정보 로드 실패:", err);
        setError("공연 정보를 불러오는 데 실패했습니다.");
      }
    };
    fetchMusicalData();
  }, [musicalId]);

  /**
   * handleFileChange 핸들러
   */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPosterImage(e.target.files[0]);
    }
  };

  /**
   * handleSubmit 
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("runningTime", runningTime); // (string state이므로 .toString() 불필요)
    formData.append("ageRating", ageRating);
    formData.append("category", category);

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
      // (실패 로직)
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

  return (
    <div className={`content-wrapper ${styles.pageContainer}`}>
      <h2 className={styles.pageTitle}>관리자: 공연 수정 (ID: {musicalId})</h2>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div>
          <label htmlFor="title">뮤지컬 제목</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="posterImage">포스터 이미지</label>
          <input
            id="posterImage"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            ref={fileInputRef}
          />
        </div>
        {/* 현재 이미지 미리보기 */}
        {currentPosterUrl && !posterImage && (
            <div style={{marginTop: '10px'}}>
                <p>현재 이미지: </p>
                <img src={`http://localhost:8080${currentPosterUrl}`} alt="Current Poster" style={{width:'150px'}}/>
            </div>
        )}

        <div>
          <label htmlFor="description">상세 정보 (HTML 가능)</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder='<img src=""/>'
          />
        </div>

        <div>
          <label htmlFor="runningTime">관람 시간 (분) </label>
          <input
            id="runningTime"
            type="number"
            value={runningTime}
            onChange={(e) => setRunningTime(e.target.value)}
            placeholder="160분(인터미션 20분 포함) *숫자만 입력*"
            required
          />
        </div>

        <div>
          <label htmlFor="ageRating">관람 등급</label>
          <input
            id="ageRating"
            type="text"
            value={ageRating}
            onChange={(e) => setAgeRating(e.target.value)}
            placeholder="15세 이상 관람 가능 *숫자만 입력*"
          />
        </div>

        <div>
          <label htmlFor="category">카테고리</label>
          <select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="DEFAULT">일반</option>
          <option value="RANKING">랭킹</option>
          <option value="COMINGSOON">오픈예정</option>
          <option value="SALE">할인 중</option>
        </select>
        </div>

        <button
          type="submit"
          className={styles.submitButton}
          disabled={isLoading}
        >
          {isLoading ? "등록 중..." : "공연 수정하기"}
        </button>

        {error && <p className={styles.error}>{error}</p>}
        {success && <p className={styles.success}>{success}</p>}
      </form>
    </div>
  );
}

export default AdminMusicalEditPage;
