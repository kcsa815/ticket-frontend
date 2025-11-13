import React, {useState, useEffect} from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import styles from './MusicalSection.module.css';
import { FaChevronRight } from "react-icons/fa"; // "더보기" 아이콘
import { useAuth } from "../../context/AuthContext";

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
    const {userRole} = useAuth();
    const navigate = useNavigate();

    useEffect(()=>{
        const fetchMusicals = async () => {
            try{
                const response = await axios.get(`http://localhost:8080${apiUrl}`);
                const sliceCount = layoutType === 'ranking' ? 5 : 4;
                setMusicals(response.data.slice(0, sliceCount));
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

    /**
     * 관리자 - 공연 삭제 핸들러
     */
    const handleDelete = async(e: React.MouseEvent, musicalId: number) =>{
        e.preventDefault(); //링크 이동 방지
        if(window.confirm("정말 이 공연을 삭제하시겠습니까?")){
            try {
                await axios.delete(`http://localhost:8080/api/musicals/${musicalId}`);
                alert("삭제되었습니다.");
                //화면 갱신(state에서 제거)
                setMusicals(prev => prev.filter(m => m.musicalId !== musicalId));
            } catch (err) {
                alert("삭제에 실패했습니다.");
            }
        }
    }

    /**
     * 관리자 - 공연 수정 핸들러
     */
    const handleEdit = (e: React.MouseEvent, musicalId: number) => {
        e.preventDefault();  //Link이동 방지
        navigate(`/admin/musical/edit/${musicalId}`);
    };

    return(
        <section className={sectionClass}> {/* .section.comingSoon 적용 */}
            <h2 className={styles.sectionTitle}>{title}</h2>
            <div className={gridClass}> {/* .gridContainer.ranking 등 적용 */}
                {musicals.map((musical) => (
                    <div key={musical.musicalId} className={cardClass}>
                        <Link to={`/musical/${musical.musicalId}`}>
                            <img 
                                src={`http://localhost:8080${musical.posterImageUrl}`}
                                alt={musical.title}
                                className={posterClass} // 동적 클래스 적용
                            />
                        </Link>
                        <div className={infoClass}>
                            <Link to={`/musical/%{musicalId}`}>
                                <h3 className={titleClass}>{musical.title}</h3>
                            </Link>         
                        </div>

                        {/* ADMIN 전용 버튼 */}
                        {userRole === 'ROLE_ADMIN' && (
                            <div className={styles.adminButtons}>
                                <button onClick={(e) => handleEdit(e, musical.musicalId)}>수정</button>
                                <button onClick={(e) => handleDelete(e, musical.musicalId)}>삭제</button>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* "더보기" 버튼 */}
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