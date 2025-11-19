import React, { useState } from "react";
import axios, { AxiosError } from "axios";
import { Link } from "react-router-dom"; // 👈 Link 임포트 확인
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
  Annotation,
} from "react-simple-maps";
import styles from "./RegionPage.module.css";

// (1) 백엔드 DTO 타입 (필드 추가됨)
interface PerformanceSimple {
  musicalTitle: string;
  performanceId: number;
  performanceDate: string;
  venueName: string;
  musicalId: number; // 👈 [신규]
  posterImageUrl: string; // 👈 [신규]
}
interface ErrorResponse { message: string; }

const KOREA_TOPO_JSON = "/korea-provinces-topo.json";
const REGION_ENGLISH_NAME: { [key: string]: string } = {
  "서울특별시": "SEOUL",
  "부산광역시": "BUSAN",
  "대구광역시": "DAEGU",
  "인천광역시": "INCHEON",
  "광주광역시": "GWANGJU",
  "대전광역시": "DAEJEON",
  "울산광역시": "ULSAN",
  "세종특별자치시": "SEJONG",
  "경기도": "GYEONGGI",
  "강원도": "GANGWON",
  "충청북도": "CHUNGBUK",
  "충청남도": "CHUNGNAM",
  "전라북도": "JEONBUK",
  "전라남도": "JEONNAM",
  "경상북도": "GYEONGBUK",
  "경상남도": "GYEONGNAM",
  "제주특별자치도": "JEJU",
  "강원특별자치도": "GANGWON",
  "전북특별자치도": "JEONBUK",
};

function RegionPage() {
  const [selectedRegionKr, setSelectedRegionKr] = useState<string | null>(null);
  const [performances, setPerformances] = useState<PerformanceSimple[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegionClick = (geo: any) => {
    const rawName = geo.properties.name || geo.properties.CTP_KOR_NM || geo.properties.nameKr || "DEFAULT";
    const regionNameKor = rawName;
    const regionNameEng = REGION_ENGLISH_NAME[regionNameKor] || "DEFAULT";

    setSelectedRegionKr(regionNameKor);
    setIsLoading(true);
    setError("");

    axios
      .get(
        `https://musical-backend.onrender.com/api/performances/region?name=${regionNameEng}`
      )
      .then((res) => {
        setPerformances(res.data);
      })
      .catch((err) => {
        console.error("지역별 공연 로드 실패:", err);
        setPerformances([]);
        setError("공연 정보를 불러오는 데 실패했습니다.");
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <div className={`content-wrapper ${styles.pageContainer}`}>
      <h2 className={styles.pageTitle}>지역별 공연</h2>

      <div className={styles.mainLayout}>
        {/* 1. 왼쪽 (지도) - 동일 */}
        <div className={styles.mapContainer}>
          <ComposableMap
            projection="geoMercator"
            projectionConfig={{ scale: 5500, center: [127.7669, 36.5] }}
            style={{ width: "100%", height: "auto" }}
          >
            <ZoomableGroup center={[127.7669, 36.5]} zoom={1}>
              <Geographies geography={KOREA_TOPO_JSON}>
                {({ geographies }) =>
                  geographies.map((geo) => {
                    const rawName = geo.properties.name || geo.properties.CTP_KOR_NM || "DEFAULT";
                    const isSelected = selectedRegionKr === rawName;
                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        onClick={() => handleRegionClick(geo)}
                        className={isSelected ? styles.geoSelected : styles.geoDefault}
                      />
                    );
                  })
                }
              </Geographies>
              <Geographies geography={KOREA_TOPO_JSON}>
                {({ geographies }) =>
                  geographies.map((geo) => {
                    const regionNameKor = geo.properties.name || geo.properties.CTP_KOR_NM || "";
                    const center = geo.properties.center;
                    if (!center || !regionNameKor) return null;
                    return (
                      <Annotation
                        key={`${geo.rsmKey}-text`}
                        subject={center}
                        dx={0} dy={0}
                        connectorProps={{ stroke: "none" }}
                      >
                        <text
                          fontSize={10} textAnchor="middle" fill="#333"
                          style={{ pointerEvents: "none", fontWeight: "bold" }}
                        >
                          {regionNameKor}
                        </text>
                      </Annotation>
                    );
                  })
                }
              </Geographies>
            </ZoomableGroup>
          </ComposableMap>
        </div>

        {/* 2. 오른쪽 (공연 목록) - 수정! */}
        <div className={styles.listContainer}>
          <h3>{selectedRegionKr || "지도에서 지역을 선택하세요"}</h3>

          {isLoading ? (
            <p>공연 목록을 불러오는 중...</p>
          ) : error ? (
            <p style={{ color: "red" }}>{error}</p>
          ) : (
            <ul className={styles.performanceList}>
              {performances.length > 0 ? (
                performances.map((perf) => (
                  <li key={perf.performanceId} className={styles.performanceItem}>
                    
                    {/* --- 👇 [핵심 수정!] Link로 감싸고 포스터 추가 --- */}
                    <Link to={`/musical/${perf.musicalId}`} className={styles.itemLink}>
                      
                      {/* (포스터 이미지) */}
                      <img 
                        src={`https://musical-backend.onrender.com${perf.posterImageUrl}`} 
                        alt={perf.musicalTitle} 
                        className={styles.posterThumb}
                      />
                      
                      {/* (텍스트 정보) */}
                      <div className={styles.itemInfo}>
                        <strong>{perf.musicalTitle}</strong>
                        <p>{perf.venueName}</p>
                        <span className={styles.date}>
                          {new Date(perf.performanceDate).toLocaleDateString()} {new Date(perf.performanceDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      </div>

                    </Link>
                    {/* --- 👆 --- */}

                  </li>
                ))
              ) : (
                <p>선택한 지역에 공연 정보가 없습니다.</p>
              )}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default RegionPage;