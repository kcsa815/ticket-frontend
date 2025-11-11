import MainBanner from '../components/home/MainBanner';
import MusicalSection from '../components/home/MusicalSection';

function HomePage() {
  return (
    <div>
      {/* 1. 메인 배너 */}
      <MainBanner />

      {/* 2. 뮤지컬 섹션 (1400px 중앙 정렬) */}
      <div className="content-wrapper">
        <MusicalSection 
          title="랭킹" 
          apiUrl="/api/musicals?sort=ranking" 
          layoutType="ranking"  /* 👈 랭킹 스타일 적용 */
          viewAllLink="/rankings"
        />
        
        <MusicalSection 
          title="오픈 예정" 
          apiUrl="/api/musicals?status=upcoming" 
          layoutType="comingSoon" /* 👈 오픈 예정 스타일 적용 */
          viewAllLink="/coming-soon"
        />
        
        <MusicalSection 
          title="할인 중" 
          apiUrl="/api/musicals?status=sale" 
          layoutType="default"  /* 👈 기본 4열 스타일 적용 */
          viewAllLink="/sales"
        />
      </div>
    </div>
  );
}

export default HomePage;