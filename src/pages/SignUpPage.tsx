import React, { useState } from 'react';
import axios, { AxiosError } from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import styles from './SignUpPage.module.css'; // 👈 (새로운 CSS 임포트)

// (백엔드 DTO와 타입을 맞춥니다)
interface SignUpResponse {
  userId: number;
  email: string;
  username: string;
}
interface ErrorResponse {
  message: string;
}

function SignUpPage() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // (폼 제출 핸들러)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // (1) 비밀번호 확인
    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    setIsLoading(true);

    try {
      // (2) 백엔드 API 호출
      const response = await axios.post<SignUpResponse>(
        'https://musical-backend.onrender.com/api/users/signup',
        {
          email: email,
          password: password,
          username: username,
        }
      );

      // (3) 회원가입 성공
      console.log('회원가입 성공:', response.data);
      alert('회원가입이 완료되었습니다! 로그인 페이지로 이동합니다.');
      
      // (4) 로그인 페이지로 이동
      navigate('/login');

    } catch (err) {
      // (4) 회원가입 실패 (예: 이메일 중복)
      console.error('회원가입 실패:', err);
      if (axios.isAxiosError<ErrorResponse>(err) && err.response) {
        setError(err.response.data.message || '회원가입에 실패했습니다.');
      } else {
        setError('알 수 없는 오류가 발생했습니다.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`content-wrapper ${styles.pageContainer}`}>
      <div className={styles.signupBox}>
        <h2>회원가입</h2>
        <form onSubmit={handleSubmit} className={styles.signupForm}>
          
          <div className={styles.formGroup}>
            <label htmlFor="email">이메일</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="username">이름 (닉네임)</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password">비밀번호</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="confirmPassword">비밀번호 확인</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className={styles.error}>{error}</p>}
          
          <button type="submit" className={styles.signupButton} disabled={isLoading}>
            {isLoading ? '가입 중...' : '회원가입'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default SignUpPage;