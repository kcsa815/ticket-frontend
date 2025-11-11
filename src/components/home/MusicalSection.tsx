import React, {useState, useEffect} from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import styles from './MusicalSection.module.css';
import { FaChevronRight } from "react-icons/fa"; // "더보기" 아이콘

//인터페이스로 타입 정의
interface Musical {
    musicalId: number;
    title: string;
    posterImageUrl : string;
    // TODO: (오픈 예정) DTO가 달라지면 openDate?: string; 등 추가
}

interface Props{
    title : string;     // 섹션 제목
    apiUrl : string;    // 호출할 api주소
    layoutType: 'ranking' | 'comingSoon' | 'default'; // (신규!) 레이아웃 타입
    viewAllLink: string; // (신규!) "더보기" 버튼 링크
}

function MusicalSection({title, apiUrl, layoutType, viewAllLink}: Props){
    const [musicals, setMusicals] = useState<Musical[]>([]);

    useEffect(()=>{
        const fetchMusicals = async () => {
            try{
                const response = await axios.get(`http://localhost:8080${apiUrl}`);
                setMusicals(response.data);
            } catch(err){
                console.error(`${title} 목록 조회 실패 : `, err);
            }
        };
        fetchMusicals();
    }, [apiUrl, title]); // props가 바뀌면 api다시 호출

    // layoutType에 따라 동적으로 클래스 이름 결정
    const sectionClass = `${styles.section} ${layoutType === 'comingSoon' ? styles.comingSoon : ''}`;
    const gridClass = `${styles.gridContainer} ${styles[layoutType] || ''}`;
    const cardClass = `${styles.musicalCard} ${styles[layoutType] || ''}`;
    const posterClass = `${styles.posterImage} ${styles[layoutType] || ''}`;
    const infoClass = `${styles.info} ${styles[layoutType] || ''}`;
    const titleClass = `${styles.title} ${styles[layoutType] || ''}`;


    return(
        <section className={sectionClass}> {/* .section.comingSoon 적용 */}
            <h2 className={styles.sectionTitle}>{title}</h2>
            <div className={gridClass}> {/* .gridContainer.ranking 등 적용 */}
                {musicals.map((musical) => (
                    <Link to={`/musical/${musical.musicalId}`} key={musical.musicalId} className={cardClass}>
                    <img 
                        src={`http://localhost:8080${musical.posterImageUrl}`}
                        alt={musical.title}
                        className={posterClass} // 동적 클래스 적용
                    />
                    <div className={infoClass}>
                        <h3 className={titleClass}>{musical.title}</h3>
                        {/* TODO: (오픈 예정) .open-date 등 추가 정보 렌더링 */}
                    </div>
                </Link>
                ))}
            </div>

            {/* (신규!) "더보기" 버튼 추가 */}
            {viewAllLink && (
                <div className={styles.viewAllContainer}>
                    <Link to={viewAllLink} className={styles.viewAllButton}>
                        전체 보기 <FaChevronRight size={12} />
                    </Link>
                </div>
            )}
        </section>
    );
}

export default MusicalSection;