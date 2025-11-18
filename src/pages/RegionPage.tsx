import React, { useState } from "react";
import axios, { AxiosError } from "axios";
import { Link } from "react-router-dom";
import {
  Annotation,
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";
import styles from "./RegionPage.module.css";

// (1) 백엔드 DTO 타입
interface PerformanceSimple {
  musicalTitle: string;
  performanceId: number;
  performanceDate: string;
  venueName: string;
}
interface ErrorResponse {
  message: string;
}

// (2) 지도 데이터 파일 경로 (public 폴더 기준)
const KOREA_TOPO_JSON = "https://raw.githubusercontent.com/southkorea/southkorea-maps/master/kostat/2018/json/skorea-provinces-2018-geo.json";

function RegionPage() {
  const [selectedRegionKr, setSelectedRegionKr] = useState<string | null>(null);
  const [performances, setPerformances] = useState<PerformanceSimple[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // (3) 지도에서 지역 클릭 시
  const handleRegionClick = (geo: any) => {
  // 🔍 디버깅: 전체 속성 출력
  console.log("=== 클릭한 지역의 properties ===");
  console.log(JSON.stringify(geo.properties, null, 2));
  
  // 기존 코드...
  const regionNameEng = geo.properties.name || geo.properties.CTP_ENG_NM || "DEFAULT"; 
  const regionNameKor = geo.properties.nameKr || geo.properties.CTP_KOR_NM || regionNameEng;
  
  console.log("🔹 영어 이름:", regionNameEng);
  console.log("🔹 한글 이름:", regionNameKor);
  console.log("🔹 API 요청 URL:", `http://localhost:8080/api/performances/region?name=${regionNameEng.toUpperCase()}`);

  setSelectedRegionKr(regionNameKor);
  setIsLoading(true);
  setError("");

  axios
    .get(
      `http://localhost:8080/api/performances/region?name=${regionNameEng.toUpperCase()}`
    )
    .then((res) => {
      console.log("✅ API 응답 성공:", res.data);
      setPerformances(res.data);
    })
    .catch((err) => {
      console.error("❌ API 응답 실패:", err);
      console.error("❌ 에러 상세:", err.response?.data);
      setPerformances([]);
      setError("공연 정보를 불러오는 데 실패했습니다.");
    })
    .finally(() => setIsLoading(false));
};

  return (
    <div className={`content-wrapper ${styles.pageContainer}`}>
      <h2 className={styles.pageTitle}>지역별 공연</h2>

      <div className={styles.mainLayout}>
        {/* 1. 왼쪽 (지도) */}
        <div className={styles.mapContainer}>
          <ComposableMap
            projection="geoMercator"
            projectionConfig={{
              scale: 5500, // (지도 축척 - "경도/위도" 파일일 경우)
              center: [127.7669, 36.5], // (지도 중심: 대한민국)
            }}
            // (CSS가 크기를 100%로 제어하도록 style만 남김)
            style={{ width: "100%", height: "auto" }}
          >

            <ZoomableGroup center={[127.7669, 36.5]} zoom={1}>
              
              {/* (1) 지도 (안으로 이동) */}
              <Geographies geography={KOREA_TOPO_JSON}>
                {({ geographies }) =>
                  geographies.map((geo) => {
                    const regionNameEng = geo.properties.name || geo.properties.CTP_ENG_NM || "DEFAULT";
                    const regionNameKor = geo.properties.nameKr || geo.properties.CTP_KOR_NM || regionNameEng;
                    const isSelected = selectedRegionKr === regionNameKor;

                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        onClick={() => handleRegionClick(geo)}
                        className={
                          isSelected ? styles.geoSelected : styles.geoDefault
                        }
                      />
                    );
                  })
                }
              </Geographies>

              {/* (지도 데이터를 한 번 더 순회하며 "글자"만 렌더링) */}
              <Geographies geography={KOREA_TOPO_JSON}>
                {({ geographies }) =>
                  geographies.map((geo) => {
                    const regionNameKor = geo.properties.nameKr || geo.properties.CTP_KOR_NM || "N/A";
                    
                    // (Annotation을 위한 좌표 찾기 - GeoJSON 형식에 따라 다름)
                    // (여기서는 'properties.center'를 사용한다고 가정, 
                    //  없다면 path.centroid(geo) 등 다른 방법 사용 필요)
                    const center = geo.properties.center || [0, 0]; 

                    return (
                      <Annotation
                        key={geo.rsmKey}
                        subject={center}
                        dx={0}
                        dy={0}
                        connectorProps={{ stroke: "none" }} // (연결선 없음)
                      >
                        {/* (글자 스타일) */}
                        <text
                          fontSize={4} 
                          textAnchor="middle"
                          fill="#FFFFFF" // (흰색 글자)
                          style={{ pointerEvents: "none" }} // (글자가 클릭 방해 안 하도록)
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

        {/* 2. 오른쪽 (공연 목록) */}
        <div className={styles.listContainer}>
          <h3>{selectedRegionKr || "지도에서 지역을 선택하세요"}</h3>

          {/* ... (isLoading, error, performances.map(...) - 100% 동일) ... */}
        </div>
      </div>
    </div>
  );
}

export default RegionPage;