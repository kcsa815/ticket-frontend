import React from 'react';
// import { useAuth } from '../context/AuthContext'; // (나중에 API 호출 시 필요)

function MyBookingsPage() {
  // const { isLoggedIn } = useAuth(); // (확인용)

  return (
    <div>
      <h2>나의 예매 내역</h2>
      <p>이 페이지는 로그인한 사용자만 볼 수 있습니다.</p>
      {/* TODO (4일차): 여기에 /api/bookings/my API 호출 로직 추가 */}
    </div>
  );
}

export default MyBookingsPage;