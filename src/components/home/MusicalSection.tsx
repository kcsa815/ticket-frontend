import React, {useState, useEffect} from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import styles from './MusicalSection.module.css';

//인터페이스로 타입 정의
interface Musical {
    musicalId: number;
    title: string;
    posterImageUrl : string;
}

interface Props{
    title : string;     //섹션 제목(ex : 랭킹)
    apiUrl : string;   //호출할 api주소(ex : "/api/musicals?sort=ranking")
}

function MusicalSection({title, apiUrl}:Props){
    const [musicals, setMusicals] = useState<Musical[]>([]);

    useEffect(()=>{
        //apiUrl로 실제 api호출
        const fetchMusicals = async () => {
            try{
                const response = await axios.get('http://localhost:8080/api/musicals');
                setMusicals(response.data.slice(0, 4)); //4개만 잘라서 보여주기
            } catch(err){
                console.error(`${title} 목록 조회 실패 : `, err);
            }
        };
        fetchMusicals();
    }, [apiUrl, title]); //props가 바뀌면 api다시 호출

    return(
        <section className={styles.section}>
            <h2 className={styles.sectionTitle}>{title}</h2>
            <div className={styles.gridContainer}>
                {musicals.map((musical) => (
                    <Link to={`/musical/${musical.musicalId}`} key={musical.musicalId} className={styles.musicalCard}>
                    <img 
                        src={`http://localhost:8080${musical.posterImageUrl}`}
                        alt={musical.title}
                        className={styles.posterImage}
                    />
                    <div className={styles.info}>
                        <h3 className={styles.title}>{musical.title}</h3>
                    </div>
                </Link>
                ))}
            </div>
        </section>
    );
}

export default MusicalSection;