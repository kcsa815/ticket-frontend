import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import styles from './LoginPage.module.css';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/";

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    try {
      const response = await axios.post(
        'http://localhost:8080/api/users/login', 
        { email, password }
      );
      const accessToken = response.data.accessToken;
      login(accessToken); 
      navigate(from, { replace: true });
    } catch (err) {
      setError('로그인 실패. 이메일 또는 비밀번호를 확인하세요.');
    }
  };

  return (
    <div className={styles.loginPage}>
      <h2>로그인</h2>
      <form onSubmit={handleSubmit} className={styles.loginForm}>
        <div>
          <label>이메일</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label>비밀번호</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button type="submit" className={styles.loginButton}>로그인</button>
        {error && <p className={styles.error}>{error}</p>}
      </form>
      <div className={styles.signupLink}>
          아직 회원이 아니신가요? <Link to="/signup">회원가입</Link>
        </div>
    </div>
  );
}
export default LoginPage;