import React from "react";
import styles from './Footer.module.css';

function Footer(){
    return(
            <footer className={styles.footer}>
                <p>(주)^^ㅣㄱ뮤 | 대표 : 옥주현 | 사업자번호 : 123-45-6789</p>
                <p>주소 : 부산광역시 영도구 123 | 고객센터 : 1588-8000</p>
            </footer>
    );
}

export default Footer;