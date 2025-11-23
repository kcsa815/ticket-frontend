# 🎵 Musical Ticketing Frontend (React/Vite)

## 🌟 프로젝트 시연 (Demo)
![Uploading 리드미 시연영상.gif…]()


## 🔗 배포 링크
## 🛠️ 기술 스택
- **FE Core:** React.js, TypeScript, Vite
- **Networking:** Axios
- **UI/Map:** CSS Modules, react-simple-maps, lucide-react (Icons)

## ✨ Frontend Key Features

### 1. 좌석 시스템 시각화 및 UX
- **절대 좌표 렌더링:** 데이터베이스의 `xCoord, yCoord` 값을 이용한 정밀한 좌석 배치.
- **모달 UX:** Draggable Modal을 활용하여 사용자가 좌석 선택 중 화면을 자유롭게 이동할 수 있도록 구현.

### 2. 인터랙티브 지역별 조회
- **GeoJSON 처리:** `react-simple-maps`를 이용해 지도 데이터를 시각화하고, 클릭한 지역(예: SEOUL)에 해당하는 데이터만 실시간으로 필터링하여 출력.

### 3. 관리자 포스터 에디터
- **File I/O Abstraction:** `Blob` 객체와 `FormData`를 활용하여 복잡한 이미지 파일과 JSON 데이터를 동시에 백엔드 API로 전송하는 로직 구현.

## 💥 트러블 슈팅 (Frontend Focus)
- **CORS/401 에러 해결:** 로컬/배포 환경에 따른 `SecurityConfig.java`의 `allowedOrigin` 문제와 `OPTIONS` 메서드 차단 이슈를 해결하고 최종적으로 클라이언트가 안전하게 통신하도록 설정.
- **JS 런타임 오류:** API 데이터 `null` 값 (`data.runningTime`)이 `toString()` 호출 시 앱을 크래시시키는 오류를 `null-safe` 로직으로 방어.
