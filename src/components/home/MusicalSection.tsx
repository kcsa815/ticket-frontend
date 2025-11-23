import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { FaChevronRight } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import styles from "../../pages/HomePage.module.css";

// (1) [수정!] Interface에 필드 추가
interface Musical {
  musicalId: number;
  title: string;
  posterImageUrl: string;
  venueName: string | null;
  minPrice: number | null;
  maxPrice: number | null;
}

interface Props {
  title: string;
  apiUrl: string;
  layoutType: "ranking" | "comingSoon" | "default";
  viewAllLink: string;
}

function MusicalSection({ title, apiUrl, layoutType, viewAllLink }: Props) {
  const [musicals, setMusicals] = useState<Musical[]>([]);
  const { userRole } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMusicals = async () => {
      try {
        // (1) 백엔드에서 '카테고리 전체' 목록을 가져옴
        const response = await axios.get(`http://localhost:8080${apiUrl}`);

        // --- 5개로 자르는 로직 명시 ---
        const sliceCount = 5;

        // (2) 전체 데이터 중 최대 5개만 잘라서 화면에 표시
        setMusicals(response.data.slice(0, sliceCount));
      } catch (err) {
        console.error(`${title} 목록 조회 실패 : `, err);
        setMusicals([]); // 에러 시 빈 배열로 설정 (화면 크래시 방지)
      }
    };
    fetchMusicals();
  }, [apiUrl, title, layoutType]);

  // (handleDelete, handleEdit 함수는 동일)
  const handleDelete = async (e: React.MouseEvent, musicalId: number) => {
    /* ... */
  };
  const handleEdit = (e: React.MouseEvent, musicalId: number) => {
    /* ... */
  };

  return (
    <section className={styles.musicalSection}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>{title}</h2>
      </div>

      {/* --- 5열 그리드와 데이터 매핑 --- */}
      <div className={styles.gridContainer}>
        {musicals &&
          musicals.map(
            (
              musical // [안전 확인]
            ) => (
              <div key={musical.musicalId} className={styles.musicalCard}>
                <Link to={`/musical/${musical.musicalId}`}>
                  <img
                    src={`http://localhost:8080${musical.posterImageUrl}`}
                    alt={musical.title}
                    className={styles.posterImage}
                  />
                </Link>
                <div className={styles.info}>
                  <Link to={`/musical/${musical.musicalId}`}>
                    <h3 className={styles.title}>
                      뮤지컬 &lt;{musical.title}&gt;
                    </h3>
                  </Link>

                  <p className={styles.infoText}>
                    {musical.venueName || "공연장 미정"}
                  </p>
                  <p className={styles.priceText}>
                    {musical.minPrice
                      ? `${musical.minPrice.toLocaleString()}원 ~`
                      : "가격 미정"}
                  </p>

                  {userRole === "ROLE_ADMIN" && (
                    <div className={styles.adminButtons}>
                      <button onClick={(e) => handleEdit(e, musical.musicalId)}>
                        수정
                      </button>
                      <button
                        onClick={(e) => handleDelete(e, musical.musicalId)}
                      >
                        삭제
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          )}
      </div>

      {/* (섹션 하단 간격 유지를 위한 컨테이너) */}
      <div className={styles.viewAllContainer}>
        <Link to={viewAllLink} className={styles.viewAllButton}>
            전체보기 <FaChevronRight size={12} />
        </Link>
      </div>
    </section>
  );
}

export default MusicalSection;
