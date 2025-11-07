import React from "react";
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from "react-router-dom"; 
import App from "./App";
import './index.css'     //있어도 되고 없어도 됨
import { AuthProvider } from "./context/AuthContext";

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* 2. <App />을 <BrowserRouter>로 감싸고,
           <BrowserRouter>를 <AuthProvider>로 감싸야 합니다. */}
    <AuthProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>,
)