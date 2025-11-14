import MainBanner from "../components/home/MainBanner";
import MusicalSection from "../components/home/MusicalSection";

function HomePage() {
  return (
    <div>
      {/* 1. 메인 배너 */}
      <MainBanner />

      {/* 2. 뮤지컬 섹션 (1400px 중앙 정렬) */}
      <div className="content-wrapper">
        <MusicalSection
          title="랭킹"
          apiUrl="/api/musicals?section=ranking"
          layoutType="ranking"
          viewAllLink="/rankings"
        />

        <MusicalSection
          title="오픈 예정"
          apiUrl="/api/musicals?section=upcoming"
          layoutType="comingSoon"
          viewAllLink="/coming-soon"
        />

        <MusicalSection
          title="지금 할인 중!"
          apiUrl="/api/musicals?section=sale"
          layoutType="default"
          viewAllLink="/sales"
        />
      </div>
    </div>
  );
}

export default HomePage;
