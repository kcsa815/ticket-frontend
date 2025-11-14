import React from "react";
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from "react-router-dom"; 
import App from "./App";
import './index.css'     //있어도 되고 없어도 됨
import { AuthProvider } from "./context/AuthContext";
import Modal from 'react-modal';
import './index.css';

Modal.setAppElement('#root');   //모달이 앱의 루트 요소를 알도록 설정

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>,
)