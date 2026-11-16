import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './styles.css';

// 프로젝트 사이트(username.github.io/<저장소명>/)에서도 라우팅이 동작하도록 base 경로를 basename으로 사용합니다.
// 상세 URL 새로고침은 빌드 시 dist/404.html(= index.html 복사본)이 처리합니다.
const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || '/';

// A fresh home visit starts at the introduction instead of restoring a lower section.
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter basename={basename}>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
