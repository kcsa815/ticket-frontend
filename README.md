<h3>뮤지컬 티켓팅 서비스(프론트엔드 코드)</h3>
<p>실시간 좌석 선택이 가능한 뮤지컬 예매 플랫폼입니다.<br>
사용자는 지역별/카테고리별 공연을 조회하고 예매할 수 있으며, 관리자는 공연 및 공연장을 시각적으로 관리할 수 있습니다.</p>
<br>
<hr>

## 🔗 배포 링크 (Live Demo)
<ul>
  <li>**Frontend:** [https://ticket-frontend-swart.vercel.app/](https://ticket-frontend-swart.vercel.app/)</li>
  <li>**Backend:** [https://musical-backend.onrender.com](https://musical-backend.onrender.com)</li>
  <li>**Test ID:** admin@test.com / admin123 (관리자 계정)</li>
</ul>
<br>

## 🛠 Tech Stack
### Frontend
- **Core:** <img src="https://img.shields.io/badge/react-61DAFB?style=flat&logo=react&logoColor=white"/> <img src="https://img.shields.io/badge/typescript-3178C6?style=flat&logo=typescript&logoColor=white"/>  <img src="https://img.shields.io/badge/vite-646CFF?style=flat&logo=vite&logoColor=white"/>
- **Styling:** <img src="https://img.shields.io/badge/cssmodules-000000?style=flat&logo=cssmodules&logoColor=white"/>
- **State Management:** <img src="https://img.shields.io/badge/Context API-000000?style=flat&logo=&logoColor=white"/>
- **Libraries:** <img src="https://img.shields.io/badge/axios-000000?style=flat&logo=axios&logoColor=white"/> 
                  <img src="https://img.shields.io/badge/Reactrouter-61DAFB?style=flat&logo=reactrouter&logoColor=white"/>
                  <img src="https://img.shields.io/badge/React Calendar-61DAFB?style=flat&logo=react&logoColor=white"/>
                  <img src="https://img.shields.io/badge/React Simple Maps-61DAFB?style=flat&logo=react&logoColor=white"/>
                  <img src="https://img.shields.io/badge/React Draggable-61DAFB?style=flat&logo=react&logoColor=white"/>
### Backend
- **Framework:** <img src="https://img.shields.io/badge/springboot-6DB33F?style=flat&logo=springboot&logoColor=white"/>
- **Security:** <img src="https://img.shields.io/badge/springsecurity-6DB33F?style=flat&logo=springsecurity&logoColor=white"/> <img src="https://img.shields.io/badge/jwt-6DB33F style=flat&logo=springboot&logoColor=white"/>
- **Database:** <img src="https://img.shields.io/badge/mysql-4479A1?style=flat&logo=mysql&logoColor=white"/> <img src="https://img.shields.io/badge/hibernate-59666C?style=flat&logo=hibernate&logoColor=white"/>
- **Build:** <img src="https://img.shields.io/badge/gradle-02303A?style=flat&logo=gradle&logoColor=white"/>

### DevOps
- **Deploy:** <img src="https://img.shields.io/badge/vercel-000000?style=flat&logo=vercel&logoColor=white"/>, <img src="https://img.shields.io/badge/render-000000?style=flat&logo=render&logoColor=white"/>
- **DB Hosting:** <img src="https://img.shields.io/badge/Aiven Cloud MySQL-000000?style=flat&logo=aiven&logoColor=white"/>
<br>

- ## ✨ Key Features (핵심 기능)

### 1. 🎫 좌석 예매 시스템 (Interactive Booking)
- 단순한 테이블 형태가 아닌, **좌표(X, Y) 기반**의 실제 공연장 좌석 배치도 구현
- `react-draggable`을 이용한 예매 팝업창 이동 기능
- 좌석 등급(VIP, R, S, A)별 색상 구분 및 실시간 잔여석 확인

### 2. 🗺️ 지역별 공연 조회 (Interactive Map)
- `TopoJSON` 데이터를 활용한 대한민국 지도 시각화
- 지역 클릭 시 해당 지역(`SEOUL`, `BUSAN` 등)의 공연 목록 비동기 조회

### 3. 👑 관리자(Admin) 기능
- **공연장 등록:** 이미지 위에 좌석을 배치하는 것이 아닌, 템플릿 기반 자동 생성 로직 구현
- **공연 등록:** 포스터 미리보기 및 상세 정보 에디터
- **회차 관리:** 날짜 및 등급별 가격 설정 시 좌석 자동 생성

## 🔥 Troubleshooting (문제 해결)

### 1. JPA N+1 문제 및 LazyInitializationException
- **문제:** 공연 상세 정보 조회 시, 연관된 `Venue`, `Cast` 정보를 가져올 때 N+1 쿼리가 발생하거나, 세션 종료 후 접근 에러 발생.
- **해결:** Repository에서 `@Query`와 `JOIN FETCH`를 사용하여 필요한 데이터를 한 번의 쿼리로 즉시 로딩(Eager Loading)하도록 최적화.

### 2. 배포 환경에서의 Docker 빌드 오류
- **문제:** 로컬(Windows)에서는 잘 되던 빌드가 Render(Linux)에서 `gradlew: Permission denied` 및 `JAVA_HOME` 에러 발생.
- **해결:** 1. `git update-index --chmod=+x gradlew`로 실행 권한 부여.
  2. `Dockerfile`을 작성하여 `eclipse-temurin:17-jdk` 이미지를 기반으로 빌드 환경 통일.

### 3. React와 Spring Boot 간의 CORS 및 데이터 매핑 이슈
- **문제:** 프론트엔드에서 보내는 JSON Key(`x`, `y`)와 백엔드 DTO(`xCoord`, `yCoord`) 불일치로 인한 400 Bad Request 발생.
- **해결:** DTO 필드명을 명확히 통일하고, Spring Security 설정에서 배포된 프론트엔드 도메인에 대한 CORS 허용 설정 추가.

 ## 📂 ERD
<img width="1323" height="714" alt="DB_ERD" src="https://github.com/user-attachments/assets/de1f1fc3-43ac-44e2-9dcc-234557ee34ff" />


## 🖥️ Screen Shots
(주요 기능 스크린샷을 3~4장 :메인화면, 좌석선택화면, 지도화면 등)
