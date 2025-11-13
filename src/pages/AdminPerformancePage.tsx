import React, { useState, useEffect } from 'react';
import axios, { AxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';
import styles from './AdminPage.module.css'; // (AdminPage CSS 재사용)

// --- (1) 백엔드 DTO와 맞추는 타입 정의 ---
// (GET /api/venues 응답 타입)
interface Venue {
  venueId: number;
  name: string;
}
// (GET /api/musicals 응답 타입)
interface Musical {
  musicalId: number;
  title: string;
}
// (POST /api/performances 요청 타입)
interface PerformanceSaveReqDto {
  musicalId: number | null;
  venueId: number | null;
  performanceDate: string;
  pricesByGrade: {
    [key: string]: number; // (수정) 등급을 유연하게 받도록 (VIP, R 등)
  };
}
interface ErrorResponse { message: string; }
// ------------------------------------

function AdminPerformancePage() {
  const navigate = useNavigate();

  // (2) 폼 데이터를 위한 State
  const [formData, setFormData] = useState<PerformanceSaveReqDto>({
    musicalId: null,
    venueId: null,
    performanceDate: '',
    pricesByGrade: {},
  });
  
  // (3) (핵심!) API로 불러온 목록 저장용 State
  const [musicals, setMusicals] = useState<Musical[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // (4) (핵심!) 페이지 로드 시, 드롭다운 목록 채우기
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        // 2개의 API를 동시에 호출
        const [musicalsRes, venuesRes] = await Promise.all([
          axios.get<Musical[]>('http://localhost:8080/api/musicals'),
          axios.get<Venue[]>('http://localhost:8080/api/venues')
        ]);
        
        // (중요!) 이 set... 함수가 state를 업데이트 -> React가 렌더링
        setMusicals(musicalsRes.data);
        setVenues(venuesRes.data);
        
      } catch (err) {
        setError("뮤지컬 또는 공연장 목록을 불러오는 데 실패했습니다.");
        console.error("드롭다운 데이터 로드 실패:", err);
      }
    };
    fetchDropdownData();
  }, []); // 페이지 로드 시 1회 실행

  // (5) 폼 입력 변경 핸들러
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value ? Number(value) : null, 
    }));
  };
  
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, performanceDate: e.target.value }));
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target; // name="VIP", value="150000"
    setFormData(prev => ({
      ...prev,
      pricesByGrade: {
        ...prev.pricesByGrade,
        [name]: Number(value) || 0,
      }
    }));
  };

  // (6) 폼 제출 핸들러
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await axios.post(
        'http://localhost:8080/api/performances',
        formData
      );
      
      setSuccess(`공연 회차(ID: ${response.data}) 등록 성공!`);
      // (폼 초기화)
      setFormData({
        musicalId: null,
        venueId: null,
        performanceDate: '',
        pricesByGrade: {},
      });

    } catch (err) {
      console.error('공연 회차 등록 실패:', err);
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
      <h2 className={styles.pageTitle}>관리자: 새 공연 회차 등록</h2>
      
      <form onSubmit={handleSubmit} className={styles.form}>
        
        {/* --- 뮤지컬 선택 드롭다운 --- */}
        <div>
          <label htmlFor="musicalId">뮤지컬 선택</label>
          <select 
            id="musicalId" 
            name="musicalId" 
            onChange={handleChange} 
            value={formData.musicalId || ''} 
            required
          >
            <option value="">-- 뮤지컬을 선택하세요 --</option>
            {/* (중요!) musicals state가 채워져야 이 map이 실행됨 */}
            {musicals.map(musical => (
              <option key={musical.musicalId} value={musical.musicalId}>
                {musical.title}
              </option>
            ))}
          </select>
        </div>
        
        {/* --- 공연장 선택 드롭다운 --- */}
        <div>
          <label htmlFor="venueId">공연장 선택</label>
          <select 
            id="venueId" 
            name="venueId" 
            onChange={handleChange} 
            value={formData.venueId || ''} 
            required
          >
            <option value="">-- 공연장을 선택하세요 --</option>
            {/* (중요!) venues state가 채워져야 이 map이 실행됨 */}
            {venues.map(venue => (
              <option key={venue.venueId} value={venue.venueId}>
                {venue.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="performanceDate">공연 날짜 및 시간</label>
          <input 
            id="performanceDate" 
            type="datetime-local"
            value={formData.performanceDate} 
            onChange={handleDateChange} 
            required 
          />
        </div>

        {/* 등급별 가격 입력 */}
        <fieldset style={{border: '1px solid #ddd', borderRadius: '5px'}}>
          <legend style={{fontWeight: 'bold', marginLeft: '10px'}}>등급별 가격</legend>
          <div>
            <label htmlFor="VIP">VIP</label>
            <input id="VIP" name="VIP" type="number" onChange={handlePriceChange} placeholder="150000" />
          </div>
          <div>
            <label htmlFor="R">R</label>
            <input id="R" name="R" type="number" onChange={handlePriceChange} placeholder="130000" />
          </div>
          <div>
            <label htmlFor="S">S</label>
            <input id="S" name="S" type="number" onChange={handlePriceChange} placeholder="100000" />
          </div>
          <div>
            <label htmlFor="A">A</label>
            <input id="A" name="A" type="number" onChange={handlePriceChange} placeholder="80000" />
          </div>
        </fieldset>
        
        <button type="submit" className={styles.submitButton} disabled={isLoading}>
          {isLoading ? "등록 중..." : "공연 회차 등록하기"}
        </button>
        
        {error && <p className={styles.error}>{error}</p>}
        {success && <p className={styles.success}>{success}</p>}
      </form>
    </div>
  );
}

export default AdminPerformancePage;