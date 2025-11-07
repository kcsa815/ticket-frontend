import {useState, useEffect} from "react";
import { Link } from "react-router-dom"; 
import axios from "axios";

interface Musical{
    musicalId : number;
    title : string;
    description : string;
    posterImageUrl : string;
}
interface ErrorResponse{
    message : string;
}

// "홈"페이지 컴포넌트
function HomePage(){
    const[musicals, setMusicals] = useState<Musical[]>([]);
    const [error, setError] = useState('');

    // 1. 뮤지컬 목록 조회" 핸들러
    const fetchMusicals = async () =>{
        setError('');
        try {
            const response = await axios.get<Musical[]>('http://localhost:8080/api/musicals');
            setMusicals(response.data);
        }
        catch (err) {
            console.error('뮤지컬 목록 조회 실패: ', err);
            if (axios.isAxiosError<ErrorResponse>(err)&& err.response) {
                setError(err.response.data.message || '목록 조회에 실패했습니다.');
            } else {
                setError('뮤지컬 목록 조회 중 오류 발생');
            }
        }
    };

    //2. 페이지가 처음 로드될 때, 1번만 뮤지컬 목록을 불러옴
    useEffect(() =>{
        fetchMusicals();
    }, []);  //[](빈 배열) : 컴포넌트 마운트 시 1회 실행 

    //3. 렌더링
    return(
        <div>
            <h2>뮤지컬 목록</h2>
            {error && <div style={{color: 'red'}}><strong>에러:</strong>{error}</div>}

            <ul style={{listStyle: 'none', padding:0}}>
                {musicals.map((musical) =>(
                    <li key={musical.musicalId} style={{borderBottom: '1px solid #eee', padding : '10px'}}>
                        {/* <>태그 대신 <link>태그 사용!!!! */}
                        {/* 이 링크를 누르명 /musical/1 , /musical/2 등으로 이동함 */}
                        <Link to={`/musical/${musical.musicalId}`} style={{textDecoration:'none', color : 'black'}}>
                            <strong>{musical.title}</strong>
                            {musical.posterImageUrl && (
                                <img
                                    src={`http://localhost:8080${musical.posterImageUrl}`}
                                    alt={musical.title}
                                    style={{width : '50px', marginLeft:'10px', verticalAlign:'middle'}}
                                />
                            )}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default HomePage;

