
import { Link } from "react-router-dom";
import styles from './Navbar.module.css';

function Navbar(){
    return(
        <nav className={styles.navbar}>
            <div className={`content-wrapper ${styles.navbarContent}`}>
                {/* className={styles.navLink} 추가 */}
                <Link to="/musicals" className={styles.navLink}>뮤지컬 목록</Link>
                <Link to="/rankings" className={styles.navLink}>랭킹</Link>
                <Link to="/coming-soon" className={styles.navLink}>오픈 예정</Link>
                <Link to="/sales" className={styles.navLink}>할인중</Link>
                <Link to="/region" className={styles.navLink}>지역별</Link>
                <Link to="/venues" className={styles.navLink}>공연장</Link>
            </div>
        </nav>
    );
}

export default Navbar;