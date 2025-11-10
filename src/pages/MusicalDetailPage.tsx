import React, {useState, useEffect} from "react";
import axios from 'axios';
import { useParams, Link } from "react-router-dom";
import styles from './MusicalDetailPage.module.css';

// 1. 백엔드 DTO와 맞추는 타입 정의
// GET  /api/musicals/{id} 응답 타입
interface MusicalDetail{
    musicalId :number;
    title: string;
    description : string;
    posterImageUrl:string;
    runningTime: number;
    ageRating: string;
}

// GET  /api/performances/musical/{id} 응답 타입
interface PerformanceSimple{
    performanceId: number;
    performanceDate : string;      //날짜는 string으로 받아서 포맷팅
    venueName: string;
}

interface ErrorResponse{
    message: string;
}

//-----------------------------------------------

//"상세" 페이지 컴포넌트
function MusicalDetailPage(){
    /*
    1. URL의 파라미터 값(musicalId)을 가져옴
        ex) /musical/1 이면 {musicalId: '1'}을 반환
    */
   const {musicalId} = useParams<{musicalId : string}>();

    // 2. API 결과를 저장할 State
    const [musical, setMusical] = useState<MusicalDetail | null>(null);
    const [performances, setPerformances] = useState<PerformanceSimple[]>([]);

    //3. 로딩 및 에러 상태 관리
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    //4. 페이지가 로드될 때 API를 호출하는 로직
    useEffect(() => {
        if (!musicalId) return;   //musicalId가 없으면 아무것도 안함

        //API 호출용 비동기 함수
        const fetchData = async () =>{
            setLoading(true);
            setError('');
            try {
                //API 2개를 동시에 요청!!(Promise.all)
                const musicalApiUrl = `http://localhost:8080/api/musicals/${musicalId}`;
                const performanceApiUrl = `http://localhost:8080/api/performances/musical/${musicalId}`;

                const [musicalResponse, performanceResponse] = await Promise.all([
                    axios.get<MusicalDetail>(musicalApiUrl),
                    axios.get<PerformanceSimple[]>(performanceApiUrl)
                ]);

                //6. 성공 시 State에 데이터 저장
                setMusical(musicalResponse.data);
                setPerformances(performanceResponse.data);

            } catch (err) {
                console.error('데이터 조회 실패 : ', err);
                if(axios.isAxiosError<ErrorResponse>(err) && err.response) {
                    setError(err.response.data.message || '데이터를 불러오지 못했습니다.');
                } else{
                    setError('알 수 없는 오류가 발생했습니다.');
                }
            } finally{
                //7. 성공/실패 여부와 관계 없이 로딩 종료
                setLoading(false);
            }
        };

            fetchData();    //함수 실행

        }, [musicalId]);    //musicalId가 바뀔 때마다 이 useEffect를 다시 실행

        // 8. 렌더링(JSX)

        //8-1. 로딩 중일 때
        if(loading){
            return <div className={styles.loading}>데이터를 불러오는 중...</div>;
        }

        //8-2. 에러 발생 시
        if(error){
            return<div className={styles.error}>에러 : {error}</div>;
        }

        //8-3. 데이터가 없을 때 (정상적이지만 데이터가 null)
        if(!musical){
            return <div className={styles.loading}>뮤지컬 정보를 찾을 수 없습니다.</div>;
        }

        //8-4. (성공) 데이터 렌더링
        return(
            <div className={styles.pageContainer}>
                {/* 상단 - 뮤지컬 상세 정보 */}
                <section className={styles.detailsContainer}>
                    <img 
                        src={`http://localhost:8080${musical.posterImageUrl}`}
                        alt={musical.title}
                        className={styles.posterImage}
                    />
                    <div className={styles.infoContainer}>
                        <h2 className={styles.title}>{musical.title}</h2>
                        <p className={styles.description}>{musical.description}</p>
                        <div className={styles.metaInfo}>
                            <p><strong>관람 시간 : </strong>{musical.runningTime}분</p>
                            <p><strong>관람 등급 : </strong>{musical.ageRating}</p>
                        </div>
                    </div>
                </section>

                {/* 하단 - 공연 회차 목록 */}
                <section className={styles.performanceSection}>
                    <h3>공연 회차 선택</h3>
                    <ul className={styles.performanceList}>
                        {performances.length > 0 ? (
                            performances.map((perf) => (
                                <li key={perf.performanceId} className={styles.performanceItem}>
                                    <div className={styles.performanceInfo}>
                                        {/* 날짜 포맷팅 (YYYY-MM-DD HH:mm) */}
                                        <strong>{new Date(perf.performanceDate).toLocaleString('ko-KR', {year:'numeric', month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit'})}</strong>
                                        <span>{perf.venueName}</span>
                                    </div>
                                    {/* 좌석페이지 / 링크만 걸어둔 상태 */}
                                    <Link to={`/booking/${perf.performanceId}`} className={styles.bookButton}>
                                        예매하기
                                    </Link>
                                </li>
                            ))
                        ) : (
                            <li>예매 가능한 공연 회차가 없습니다.</li>
                        )}
                    </ul>
                </section>
            </div>
        );

}

export default MusicalDetailPage;