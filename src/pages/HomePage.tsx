import MainBanner from '../components/home/MainBanner';
import MusicalSection from '../components/home/MusicalSection';

function HomePage(){
  return(
    <div>
      {/* 1. 메인 배너 */}
      <MainBanner />

        {/* 2. 뮤지컬 섹션들 ( 재사용 가능) */}
        <div className='content-wrapper'>
          <MusicalSection 
            title="지금 핫한 랭킹"
            apiUrl='/api/musicals?sort=ranking'
          />

          <MusicalSection 
            title="오픈 예정"
            apiUrl='/api/musicals?status=upcoming'
          />

          <MusicalSection 
            title="할인중 "
            apiUrl='/api/musicals?status=sale'
          />
        </div>
      </div>
  )
}

export default HomePage;