// components(구조, 뼈대 만들기) - layout(헤더, 네비게이션 바, 푸터)

// Header - login, logout 상태를 useAuth훅으로 받아와서 조건부 렌더링
/**
 * UserRole을 확인해서 Admin일때만 **관리자페이지** 버튼이 보일 수 있게 설정
 */

import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext"; //AuthContext경로 확인
import styles from "./Header.module.css"; //헤더 스타일 가져오기
import logoImage from '../../assets/images/logo.png'; //로고 이미지
//react-icons 사용
import { FiSearch } from "react-icons/fi";
import { BiUser } from "react-icons/bi";
import { HiOutlineTicket } from "react-icons/hi";
import { MdLogout } from "react-icons/md";
import { GrUserAdmin } from "react-icons/gr";

function Header() {
  const { isLoggedIn, logout, userRole } = useAuth(); //AuthContext에서 로그인상태 가져오기

  return (
    <header className={styles.header}>
      <div className={`content-wrapper ${styles.headerContent}`}>
        <div className={styles.leftSection}>
          {/*로고 영역*/}
          <Link to="/" className={styles.logo}>
            <img src={logoImage} alt="Logo" />
          </Link>

          {/* 검색창 */}
          <div className={styles.searchBar}>
            <input type="text" placeholder="검색어를 입력하세요" />
            <button>
              <FiSearch />
            </button>
          </div>
        </div>

        {/* Admin일경우 관리자 버튼 표시 */}
        {isLoggedIn && userRole === "ROLE_ADMIN" && (
          <>
            <Link to="/admin/add-musical" className={styles.adminButton}>
              <GrUserAdmin />
              공연 등록
            </Link>
            <Link to="/admin/add-performance" className={styles.adminButton}>
              <GrUserAdmin />
              공연 회차 등록
            </Link>
          </>
        )}

        {/* 1. 로그인/로그아웃 버튼 (이 부분만 조건부 렌더링) */}
        <div className={styles.userName}>
          {!isLoggedIn ? (
            <Link to="/login" className={styles.headerButton}>
              <BiUser size={20} />
              <span style={{ marginLeft: "5px" }}>로그인</span>
            </Link>
          ) : (
            <button onClick={logout}>
              <MdLogout />
              로그아웃
            </button>
          )}

          {/* 2. 내 예약*/}
          <Link to="/my-bookings">
            <HiOutlineTicket size={20} />
            <span style={{ marginLeft: "5px" }}>내 예약</span>
          </Link>
        </div>
      </div>
    </header>
  );
}

export default Header;
