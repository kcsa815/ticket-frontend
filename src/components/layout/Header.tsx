// components(구조, 뼈대 만들기) - layout(헤더, 네비게이션 바, 푸터)

// Header - login, logout 상태를 useAuth훅으로 받아와서 조건부 렌더링

import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";    //AuthContext경로 확인
import styles from './Header.module.css';               //헤더 스타일 가져오기
//react-icons 사용
import { FiSearch } from "react-icons/fi";
import { TbUser } from "react-icons/tb";
import { HiOutlineTicket } from "react-icons/hi";

function Header(){
    const {isLoggedIn, logout} = useAuth();     //AuthContext에서 로그인상태 가져오기

    return (
        <header className={styles.header}>
            <div className={`content-wrapper ${styles.headerContent}`}>
                <div className={styles.leftSection}>
                    {/*로고 영역*/}
                    <Link to="/" className={styles.logo}>
                        ^^ㅣㄱ뮤
                    </Link>

                    {/* 검색창 */}
                    <div className={styles.searchBar}>
                        <input type="text" placeholder="검색어를 입력하세요^^7"/>
                        <button><FiSearch /></button>
                    </div>
                </div>


                {/* 1. 로그인/로그아웃 버튼 (이 부분만 조건부 렌더링) */}
                <div className={styles.userName}>
                    {!isLoggedIn ? (
                    //나중에 '로그인 페이지'를 만들면 <Link to="/login">으로 감싸기
                    <button>
                        <TbUser />로그인
                    </button>
                    ) : (
                        <button onClick={logout}>
                            로그아웃
                        </button>
                    )}

                    {/* 2. 내 예약*/}
                    <Link to="/my-bookings">
                        <button>
                            <HiOutlineTicket />내 예약
                        </button>
                    </Link>
                </div>
            </div>
        </header>
    );
}

export default Header;