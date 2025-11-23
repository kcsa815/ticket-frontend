# 💃 공연 예매 페이지 프론트엔드(React/Vite)

## 🌟 프로젝트 시연 (Demo)
![리드미_시연영상_진짜최종](https://github.com/user-attachments/assets/d8e39674-c682-4b27-bfd1-f53bc09b3d4b)
<br>
## 🔗 배포 링크
**Frontend:** [https://ticket-frontend-swart.vercel.app/](https://ticket-frontend-swart.vercel.app/)

<br>

## 🛠️ 기술 스택
- **Core:** <img src="https://img.shields.io/badge/react-61DAFB?style=flat&logo=react&logoColor=white"/> <img src="https://img.shields.io/badge/typescript-3178C6?style=flat&logo=typescript&logoColor=white"/>  <img src="https://img.shields.io/badge/vite-646CFF?style=flat&logo=vite&logoColor=white"/>
- **Styling:** <img src="https://img.shields.io/badge/cssmodules-000000?style=flat&logo=cssmodules&logoColor=white"/>
- **State Management:** <img src="https://img.shields.io/badge/Context API-000000?style=flat&logo=&logoColor=white"/>
- **Libraries:** <img src="https://img.shields.io/badge/axios-000000?style=flat&logo=axios&logoColor=white"/> 
                  <img src="https://img.shields.io/badge/Reactrouter-61DAFB?style=flat&logo=reactrouter&logoColor=white"/>
                  <img src="https://img.shields.io/badge/React Calendar-61DAFB?style=flat&logo=react&logoColor=white"/>
                  <img src="https://img.shields.io/badge/React Simple Maps-61DAFB?style=flat&logo=react&logoColor=white"/>
                  <img src="https://img.shields.io/badge/React Draggable-61DAFB?style=flat&logo=react&logoColor=white"/>
<br>

## ✨ Frontend Key Features

### 1. 좌석 시스템 시각화 및 UX
<img width="600" height="auto" alt="image" src="https://github.com/user-attachments/assets/a7ef2a1d-bbcf-4f22-8338-dc04801452fb" />
<p> **절대 좌표 렌더링:** 데이터베이스의 `xCoord, yCoord` 값을 이용한 정밀한 좌석 배치</p>
<p> **모달 UX:** Draggable Modal을 활용하여 사용자가 좌석 선택 중 화면을 자유롭게 이동할 수 있도록 구현</p>

<br>

### 2. 인터랙티브 지역별 조회
<img width="600" height="auto" alt="image" src="https://github.com/user-attachments/assets/40b6562b-328c-4212-a212-1bf7342b4372" />
<p>**GeoJSON 처리:** `react-simple-maps`를 이용해 지도 데이터를 시각화하고, 클릭한 지역(예: SEOUL)에 해당하는 데이터만 실시간으로 필터링하여 출력.</p>
<br>

### 3. 관리자 포스터 에디터
<img width="600" height="auto" alt="image" src="https://github.com/user-attachments/assets/3de3d64c-df54-4862-bd42-fb583bc64fac" />
<p>**File I/O Abstraction:** `Blob` 객체와 `FormData`를 활용하여 복잡한 이미지 파일과 JSON 데이터를 동시에 백엔드 API로 전송하는 로직 구현.</p>
<br>

## 💥 트러블 슈팅 (Frontend Focus)
<p>**CORS/401 에러 해결:** 로컬/배포 환경에 따른 `SecurityConfig.java`의 `allowedOrigin` 문제와 `OPTIONS` 메서드 차단 이슈를 해결하고 최종적으로 클라이언트가 안전하게 통신하도록 설정</p>
<p>**JS 런타임 오류:** API 데이터 `null` 값 (`data.runningTime`)이 `toString()` 호출 시 앱을 크래시시키는 오류를 `null-safe` 로직으로 방어</p>
