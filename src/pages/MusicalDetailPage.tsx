import { useParams } from "react-router-dom";

//"상세" 페이지 컴포넌트
function MusicalDetailPage(){
    /*
    1. URL의 파라미터 값(musicalId)을 가져온다
        ex) /musical/1 이면 {musicalId: '1'}을 반환
    */
   const {musicalId} = useParams<{musicalId : string}>();

   return(
    <div>
        <h2>뮤지컬 상세 정보</h2>
        <p>당신이 선택한 뮤지컬의 ID는 <strong>{musicalId}</strong>입니다.</p>

        {/* 여기에 백엔드API (/api/musicals/{musicalId})에서
            가져온 '상세 정보 회차 목록'(/api/performances/musical/{musicalId})을 표시해야됨
        */}
    </div>
   );
}
export default MusicalDetailPage;