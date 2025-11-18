import React from "react";
import styles from "./Footer.module.css";

function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`content-wrapper`}>
        <div className={styles.footerContent}>
          <div>
            <h4>(주)^^ㅣㄱ뮤</h4>
            <p>대표 : 최수안</p>
            <p>주소 : 부산광역시 영도구 123</p>
            <p>
              사업자번호 : 123-45-6789 <a>사업자 정보 확인</a>
            </p>
          </div>
          <div>
            <h4>고객센터</h4>
            <p>이메일 : kcsa815@gmail.com</p>
            <p>전화번호 : 051-123-4567</p>
            <p>운영시간 : 평일 09:00 ~ 18:00 (점심시간 12:00 ~ 13:00)</p>
          </div>
          <div>
            <h4>전자금융거래 분쟁처리 담당정보</h4>
            <p>팩스 02-123-4567 | 이메일 ssickMu@example.com</p>
          </div>
        </div>
        <div className={styles.footerBottom}>
          (주)놀유니버스는 일부 상품의 통신판매중개자로서 통신판매의 당사자가
          아니므로, 상품의 예약, 이용 및 환불 등 거래와 관련된 의무와 책임은
          판매자에게 있으며 (주)놀유니버스는 일체 책임을 지지 않습니다.
          <br />ⓒ Nol Universe Co., Ltd. All rights reserved
        </div>
      </div>
    </footer>
  );
}

export default Footer;
