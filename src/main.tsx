import React from "react";
import ReactDOM from 'react-dom/client'
// 1. 브라우저라우터 임포트
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import './index.css'     //있어도 되고 없어도 됨

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)