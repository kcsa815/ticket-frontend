import React, { useState, useEffect, useMemo } from 'react';
import axios, { AxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';

// --- 👇 [1. (핵심!) CSS Import 경로 변경] ---
import styles from './AdminPerformancePage.module.css'; 
// --- 👆 ---

// (Interface 정의)
interface Venue {
  venueId: number;
  name: string;
  region: string; 
}
interface Musical {
  musicalId: number;
  title: string;
}
interface PerformanceSaveReqDto {
  musicalId: number | null;
  venueId: number | null;
  performanceDate: string;
  pricesByGrade: {
    [key: string]: number;
  };
}
interface ErrorResponse { message: string; }


function AdminPerformancePage() {
  const navigate = useNavigate();

  // (useState 선언부)
  const [formData, setFormData] = useState<PerformanceSaveReqDto>({
    musicalId: null,
    venueId: null,
    performanceDate: '',
    pricesByGrade: {},
  });
  const [musicals, setMusicals] = useState<Musical[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // (useEffect - API 호출)
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const [musicalsRes, venuesRes] = await Promise.all([
          axios.get<Musical[]>('http://localhost:8080/api/musicals'),
          axios.get<Venue[]>('http://localhost:8080/api/venues')
        ]);
        setMusicals(musicalsRes.data);
        setVenues(venuesRes.data);
      } catch (err) {
        setError("뮤지컬 또는 공연장 목록을 불러오는 데 실패했습니다.");
      }
    };
    fetchDropdownData();
  }, []);

  // (폼 입력 변경 핸들러)
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
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      pricesByGrade: { ...prev.pricesByGrade, [name]: Number(value) || 0 }
    }));
  };

  // (지역 자동 선택)
  const selectedVenueRegion = useMemo(() => {
    if (!formData.venueId) return "";
    const foundVenue = venues.find(v => v.venueId === formData.venueId);
    return foundVenue ? foundVenue.region : ""; 
  }, [formData.venueId, venues]);

  // (폼 제출 핸들러)
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

  
  // --- 👇 [2. (핵심!) JSX가 "1단 CSS" 클래스를 사용하도록 수정] ---
  return (
    // [수정!] 2단 레이아웃 클래스(mainLayout 등) 제거
    <div className={`content-wrapper ${styles.pageContainer}`}> 
      
      <h2 className={styles.pageTitle}>관리자: 새 공연 회차 등록</h2>
      
      <form onSubmit={handleSubmit} className={styles.form}>
        
        <div className={styles.formGroup}>
          <label htmlFor="musicalId">뮤지컬 선택</label>
          <select 
            id="musicalId" 
            name="musicalId" 
            onChange={handleChange} 
            value={formData.musicalId || ''} 
            required
          >
            <option value="">-- 뮤지컬을 선택하세요 --</option>
            {musicals.map(musical => (
              <option key={musical.musicalId} value={musical.musicalId}>
                {musical.title}
              </option>
            ))}
          </select>
        </div>
        
        <div className={styles.formGroup}>
          <label htmlFor="venueId">공연장 선택</label>
          <select 
            id="venueId" 
            name="venueId" 
            onChange={handleChange} 
            value={formData.venueId || ''} 
            required
          >
            <option value="">-- 공연장을 선택하세요 --</option>
            {venues.map(venue => (
              <option key={venue.venueId} value={venue.venueId}>
                {venue.name} ({venue.region})
              </option>
            ))}
          </select>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="region">지역 (자동 선택)</label>
          <input
            id="region"
            type="text"
            value={selectedVenueRegion}
            readOnly
            className={styles.readOnlyInput} // (CSS에 .readOnlyInput 추가함)
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="performanceDate">공연 날짜 및 시간</label>
          <input 
            id="performanceDate" 
            type="datetime-local"
            value={formData.performanceDate} 
            onChange={handleDateChange} 
            required 
          />
        </div>

        <fieldset className={styles.fieldset}>
          <legend>등급별 가격</legend>
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