import React, {useState, useEffect} from "react";
import axios from "axios";
import {Link, useLocation} from 'react-router-dom';
// (참고) HomePage.module.css 또는 MusicalSection.module.css 중
// '카드 스타일'이 정의된 CSS 파일을 정확히 임포트해야 합니다.
import styles from './HomePage.module.css'; 

interface Musical {
    musicalId : number;
    title : string;
    posterImageUrl : string;
}

function MusicalListPage(){
    // [수정 1] useState 구문 오류 수정
    const [musicals, setMusicals] = useState<Musical[]>([]);
    const [title, setTitle] = useState('뮤지컬 목록');
    
    // [수정 2] useLocation() Hook 호출
    const location = useLocation(); //현재 url경로를 가져옴

    useEffect(() => {
        //1. url경로에 따라 api와 제목을 다르게 설정
        switch (location.pathname){
            case '/rankings':
                setTitle('랭킹');
                // TODO: 백엔드에 랭킹 API 준비되면 API 주소 변경
                break;
            case '/coming-soon' :
                setTitle('오픈 예정');
                break;
            case '/sales':
                setTitle('할인중');
                break;
            default :
                setTitle('뮤지컬 목록');
        }

        //2. API 호출
        const fetchMusicals = async () => {
            try{
                // (임시) 현재는 모든 경로가 동일한 API를 호출합니다.
                const response = await axios.get('http://localhost:8080/api/musicals');
                setMusicals(response.data); //전체 목록을 가져옴
            }catch (err){
                console.error('목록 조회 실패', err)
            }
        };
        fetchMusicals();
    }, [location.pathname]); // 경로가 바뀔 때마다 실행

    return(
        <div className={`content-wrapper`}> 
            <div className={styles.pageContainer}>
                <h2 className={styles.pageTitle}>{title}</h2> {/* 동적 제목 */}

                <div className={styles.gridContainer}>
                    {musicals.map((musical) => (
                        <Link to={`/musical/${musical.musicalId}`} key={musical.musicalId} className={styles.musicalCard}>
                            <img 
                                src={`http://localhost:8080${musical.posterImageUrl}`}
                                alt={musical.title}
                                // [수정 3] "posterImageUrl" -> "posterImage"
                                className={styles.posterImage}
                            />
                            <div className={styles.info}>
                                <h3 className={styles.title}>{musical.title}</h3>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default MusicalListPage;