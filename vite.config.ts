import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// 프로젝트 사이트(https://hyehye12.github.io/<저장소명>/)로 배포하므로 base를 저장소 이름으로 맞춥니다.
// GitHub Actions에서는 VITE_BASE를 자동으로 '/<저장소명>/'으로 넣어 주고, 로컬에서는 '/'로 동작합니다.
export default defineConfig({ plugins: [react()], base: process.env.VITE_BASE || '/' });
