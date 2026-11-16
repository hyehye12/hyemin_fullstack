# Full-Stack Developer Portfolio

곽혜민 풀스택 개발자 포트폴리오 사이트 (React + TypeScript + Tailwind CSS + Vite).
임베디드 포트폴리오(`hyehye12.github.io`)와 같은 디자인에 포인트 색만 파란색(`#3b82f6`)으로 바꾼 버전입니다.

## 실행

Node.js 20 이상 권장.

```bash
npm install
npm run dev
```

## 정적 빌드

```bash
npm run build
npm run preview
```

완성 파일은 `dist/`에 생성되고, 빌드 마지막에 `dist/404.html`(= `index.html` 복사본)이 만들어져 상세 URL을 새로고침해도 페이지가 열립니다.

## 수정할 곳

- `src/data/projects.ts`: 프로젝트명, 설명, 역할, 기술, 이미지, 주요 화면, 문제 해결
- `src/data/profile.ts`: About Me 기본 정보와 자기소개
- `src/data/site.ts`: 연락처, 이력서·기술서 링크, 교육·수상·인턴 경험
- `src/HeroIntro.tsx`: 첫 화면 소개 문구와 애니메이션
- `src/App.tsx`: 화면 구성, 기술 스택
- `src/styles.css`: 디자인 (포인트 색은 `--accent`, `--focus` 변수)
- `index.html`: 페이지 제목과 검색 메타데이터

## GitHub Pages 배포

GitHub 사용자 사이트(`hyehye12.github.io`)는 계정당 하나뿐이라, 이 포트폴리오는 **프로젝트 사이트**로 배포합니다.
저장소 이름: `hyemin_fullstack` → 주소: `https://hyehye12.github.io/hyemin_fullstack/`

1. GitHub에 새 저장소 `hyemin_fullstack` 생성 (Public)
2. 이 폴더의 git 원격 주소를 새 저장소로 변경
   ```bash
   git remote set-url origin https://github.com/hyehye12/hyemin_fullstack.git
   ```
3. 저장소 Settings → Pages → Build and deployment → **GitHub Actions** 선택
4. `main`에 push하면 `.github/workflows/deploy.yml`이 빌드·배포

워크플로가 저장소 이름으로 `VITE_BASE`를 자동 설정하므로 `vite.config.ts`를 따로 고칠 필요는 없습니다.
