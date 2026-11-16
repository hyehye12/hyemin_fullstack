export type Solving = {
  // issue: 실제로 겪은 문제 → 화면에 "문제 해결"로 표시
  // design: 설계할 때 미리 고려한 점 → 화면에 "설계 고려"로 표시
  kind: 'issue' | 'design';
  title: string;
  problem: string;
  cause?: string;
  solution: string;
  result?: string;
};

export type Project = {
  slug: string;
  index: string;
  title: string;
  subtitle: string;
  summary: string;
  description: string;
  tags: string[];
  category: string;
  image?: string;
  videos?: { label: string; src: string }[];
  // 이미지가 없거나 불러오지 못했을 때 보여줄 아이콘 종류
  fallback: 'web' | 'server' | 'mobile' | 'ai';
  github?: string;
  role: string;
  features: string[];
  repositoryNote?: string;
  resources?: { label: string; url: string }[];
  // 아래 항목은 값을 채운 경우에만 화면에 표시됩니다.
  period?: string; // 예: '2026.03 ~ 2026.04 (4주)'
  team?: string; // 예: '4인 팀 프로젝트' 또는 '개인 프로젝트'
  screens?: { label: string; src: string }[]; // 주요 화면 · 구성도 이미지
  solving?: Solving[];
};

export const projects: Project[] = [
  {
    slug: 'woodpecker', index: '01', title: '딱다구리 (Woodpecker)',
    subtitle: '노트 기록과 복습을 연결하는 학습 플랫폼',
    summary: '노트 에디터, 복습 스케줄링 RPC, 웹 푸시 알림, CI/CD 파이프라인 담당',
    description: '노트를 저장하면 복습 일정이 자동으로 만들어지고, 복습 시점에 웹 푸시 알림을 받아 백지 테스트와 AI 퀴즈로 기억을 확인하는 학습 서비스입니다. Next.js App Router와 Supabase(Postgres·Auth·RLS·RPC)로 구성했고, 저는 노트 에디터와 복습·알림 흐름, 그리고 이를 뒷받침하는 DB 함수와 CI/CD를 맡았습니다.',
    category: 'FULL-STACK / NEXT.JS · SUPABASE',
    tags: ['Next.js 15', 'React 19', 'TypeScript', 'Supabase', 'PostgreSQL', 'TipTap', 'Web Push', 'Vitest', 'Playwright', 'GitHub Actions'],
    image: 'https://raw.githubusercontent.com/T-in-meet/Woodpecker/main/public/og-image.png',
    fallback: 'web', github: 'https://github.com/T-in-meet/Woodpecker',
    role: '노트 에디터 · 복습 스케줄링 · 알림 · CI/CD',
    period: '2026.03 ~ 2026.05', team: '팀 프로젝트',
    features: [
      'GitHub Actions CI/CD 구성 — main 머지 시 Supabase DB 마이그레이션 자동 적용, Prettier 포맷 체크·Dependency Review·Lighthouse CI 추가',
      'TipTap 기반 노트 에디터 — 툴바, 슬래시 커맨드, 링크 편집, 실행 취소/다시 실행, 체크리스트·GFM 표의 마크다운 직렬화',
      '노트 생성과 첫 복습 일정 생성을 하나의 Postgres RPC로 묶어 원자적으로 처리',
      '백지 테스트 흐름과 복습 완료 RPC 구현, KST 기준 노트별 하루 1회 완료 제한을 DB 제약으로 보장',
      '복습 알림 시간 설정, 알림 server layer(actions·queries·schema)와 Cron 디스패처·Web Push 래퍼, 서비스 워커 푸시 구독 구현',
      'Server Action에 인증·소유권·이메일 인증 가드를 적용하고 Vitest·Testing Library·pgTAP으로 테스트 작성'
    ],
    solving: [
      {
        kind: 'issue', title: '알림 시간을 오전으로 바꾸면 복습일이 하루 뒤로 밀림',
        problem: '노트의 알림 시간을 오전으로 지정하면 예정된 복습 날짜가 다음 날로 밀려 표시되고 알림도 하루 늦게 발송됐습니다.',
        cause: '복습 완료 시 간격이 짧아지지 않도록 "기준 시각보다 이르면 다음 날로 미루는" 시간 적용 로직을, 사용자가 알림 시간만 바꾸는 경우에도 그대로 사용하고 있었습니다.',
        solution: '알림 시간 변경 RPC(update_notification_time_of_day)를 분리해 원래 예정일(KST)은 그대로 두고 시각만 적용하도록 마이그레이션을 작성했고, pgTAP 테스트로 같은 날짜가 유지되는지 확인했습니다.'
      },
      {
        kind: 'issue', title: '배포 환경과 로컬의 시간 표시 불일치',
        problem: 'Vercel에 배포한 화면의 날짜·시간이 로컬 개발 환경과 다르게 출력됐습니다.',
        cause: '서버 렌더링 시 날짜 포맷이 실행 환경의 시간대(UTC)를 기준으로 계산되고 있었습니다.',
        solution: '날짜 포맷 함수에 timeZone: "Asia/Seoul"을 명시하고, 시간대에 따른 출력 테스트를 추가했습니다.'
      },
      {
        kind: 'design', title: '노트는 저장됐는데 복습 일정이 없는 상태 막기',
        problem: '노트를 insert한 뒤 첫 복습 기록을 따로 insert하면, 두 번째 요청이 실패했을 때 앱 코드에서 롤백해야 하고 롤백마저 실패하면 일정 없는 노트가 남습니다.',
        solution: '두 작업을 create_note_with_initial_review_log RPC 하나로 옮겨 한 트랜잭션에서 처리하고, 앱 코드의 수동 롤백 로직을 제거했습니다.'
      },
      {
        kind: 'design', title: '같은 날 복습 완료가 여러 번 반영되는 경우',
        problem: '하루에 여러 번 완료 처리되면 복습 간격(1→3→7→14→30일)이 비정상적으로 빨리 늘어납니다.',
        solution: 'KST 날짜 기준 노트별 1회만 완료되도록 UNIQUE 제약과 RPC 검사를 추가하고, 화면에서도 오늘 완료 여부를 조회해 버튼을 막았습니다. 조회가 실패하면 화면은 열어 두고(fail-open) 최종 방어는 DB가 맡도록 했습니다.'
      },
      {
        kind: 'issue', title: '마이그레이션 타임스탬프 충돌로 로컬 DB 기동 실패',
        problem: 'supabase start가 schema_migrations 기본키 충돌로 실패했습니다.',
        cause: '서로 다른 두 마이그레이션 파일이 같은 타임스탬프를 사용하고 있었습니다.',
        solution: '원격 DB 적용 이력을 확인해, 아직 적용되지 않은 파일의 타임스탬프만 뒤로 미뤄 충돌을 해소했습니다.'
      }
    ],
    resources: [{ label: '서비스 바로가기', url: 'https://woodpecker-blue.vercel.app' }],
    repositoryNote: '링크는 팀 프로젝트 저장소입니다. 인증·AI 퀴즈·노트 챗봇·관리자 기능 등은 다른 팀원이 담당했습니다.'
  },
  {
    slug: 'cinetrip', index: '02', title: 'CineTrip',
    subtitle: '영화 속 촬영지를 찾아 여행을 기록하는 커뮤니티',
    summary: '프론트엔드 구조와 주요 페이지, LLM 촬영지 추천·북마크 API 담당',
    description: '영화 속 장소를 직접 찾아가고 싶은 사람들이 촬영지 정보를 확인하고, 다녀온 사진을 공유하는 커뮤니티입니다. React 프론트엔드와 NestJS 백엔드로 구성했으며, 프론트엔드 구조 설계와 공통 컴포넌트·주요 페이지, 그리고 LLM으로 영화별 촬영지를 받아오는 API와 북마크 기능을 맡았습니다.',
    category: 'FULL-STACK / REACT · NESTJS',
    tags: ['React', 'TypeScript', 'Tailwind CSS', 'NestJS', 'TypeORM', 'MySQL', 'OpenAI API', 'TMDB API', 'Zod'],
    image: 'https://github.com/user-attachments/assets/813c2753-09a3-4e94-a10e-f4ac88879a60',
    fallback: 'web', github: 'https://github.com/chiro-J/Project-CineTrip',
    role: '프론트엔드 구조 · 공통 컴포넌트 · 페이지 · 촬영지/북마크 API',
    period: '2025.08 ~ 2025.09', team: '팀 프로젝트',
    features: [
      '프론트엔드 아키텍처 문서를 작성해 폴더 구조와 컴포넌트 규칙 정리',
      'Avatar·Header·UserDropdown·Nav·Checklist 공통 컴포넌트 구현',
      '갤러리, 마이 프로필, 검색 결과, 포스트 모달 페이지 구현 및 데이터가 없을 때의 화면 처리',
      'TMDB API를 연동해 영화 검색과 상세 정보 표시',
      'OpenAI API로 영화별 촬영지 5곳을 받아 Zod 스키마로 검증하고 DB에 저장해 상세 페이지에 표시',
      '영화 북마크 기능을 프론트엔드와 백엔드(bookmark 모듈)까지 구현'
    ],
    screens: [
      { label: '메인 피드', src: 'https://github.com/user-attachments/assets/a0fbf36b-32e8-407d-96a1-7e5544510a8d' },
      { label: '영화 검색', src: 'https://github.com/user-attachments/assets/5be01ca0-7f6c-41dd-833b-b7bc0ab33e99' },
      { label: '갤러리', src: 'https://github.com/user-attachments/assets/d0192722-542c-4a61-9ed5-ea6f5ef54ad0' },
      { label: '내 프로필', src: 'https://github.com/user-attachments/assets/12939295-d90f-4978-8ce4-6c6e752a52df' }
    ],
    solving: [
      {
        kind: 'design', title: '형식이 일정하지 않은 LLM 응답 다루기',
        problem: 'LLM 응답이 순수 JSON이 아니거나, 필드가 빠지고 개수가 넘치는 경우가 있어 그대로 저장하면 지도·상세 화면이 깨질 수 있습니다.',
        solution: 'JSON 파싱이 실패하면 응답에서 JSON 블록만 추출해 다시 파싱하고, Zod 스키마로 이름·주소·위경도 타입과 최대 5개 조건을 검증한 뒤에만 저장했습니다. 검증에 실패하면 구체적인 오류를 반환합니다.'
      },
      {
        kind: 'design', title: '같은 영화에 대한 반복 LLM 호출 줄이기',
        problem: '상세 페이지를 열 때마다 LLM을 호출하면 응답이 느리고 비용이 늘며, 볼 때마다 촬영지가 달라질 수 있습니다.',
        solution: '먼저 DB에서 해당 영화의 촬영지를 조회하고, 없거나 재생성을 요청한 경우에만 LLM을 호출하도록 했습니다. 저장할 때는 같은 장소가 있으면 갱신하고 없으면 새로 추가합니다.'
      }
    ],
    repositoryNote: '링크는 팀 프로젝트 저장소입니다. 인증, 사진 업로드(S3), 팔로우·댓글 등은 다른 팀원이 담당했습니다.'
  },
  {
    slug: 'emotional-music', index: '03', title: 'EmotionalMusic',
    subtitle: '감정 분석 기반 음악 추천 웹앱',
    summary: '기획부터 프론트엔드·API 서버·배포까지 혼자 구현한 개인 프로젝트',
    description: '사용자가 쓴 글이나 일기의 감정을 OpenAI API로 분석하고, 감정에 맞는 음악을 iTunes에서 찾아 추천하는 웹앱입니다. 감정 일기를 저장하고 대시보드로 감정 변화를 확인할 수 있습니다. AI 연동과 웹 서비스의 전체 흐름을 직접 익히는 것을 목표로 혼자 개발했습니다.',
    category: 'FULL-STACK / PERSONAL',
    tags: ['React', 'TypeScript', 'Tailwind CSS', 'Express', 'Supabase', 'JWT', 'OpenAI API', 'iTunes Search API', 'Vercel'],
    image: 'https://github.com/user-attachments/assets/a22738c0-1138-4cc0-9f13-db151c3ff2d8',
    fallback: 'ai', github: 'https://github.com/hyehye12/EmotionalMusic',
    role: '전체 구현 (기획 · 프론트엔드 · 백엔드 · 배포)',
    period: '2025.07 ~ 2025.08', team: '개인 프로젝트',
    features: [
      'OpenAI API로 텍스트·일기의 감정 레이블과 강도를 분석하는 파이프라인 구현',
      '감정 레이블을 장르·분위기 키워드로 매핑해 iTunes Search API로 음악 추천, 30초 미리듣기 제공',
      '감정 일기 작성·조회·수정·삭제 API와 화면 구현',
      '감정 분포와 기간별 추이를 보여주는 대시보드 구현',
      'Express API 서버에 JWT 인증 미들웨어를 적용해 사용자별 데이터 분리',
      'Vercel에 프론트엔드와 API를 함께 배포'
    ],
    screens: [
      { label: 'AI 감정 분석 결과', src: 'https://github.com/user-attachments/assets/7b0a6692-2263-4cb8-8e37-209bd66532e5' },
      { label: '음악 추천 결과', src: 'https://github.com/user-attachments/assets/bf3e874c-a9ca-492b-a1f2-011e53dae89e' },
      { label: '대시보드', src: 'https://github.com/user-attachments/assets/5363fbbc-01aa-4776-9c1f-22287268bfa4' }
    ],
    solving: [
      {
        kind: 'issue', title: '추천 결과의 일관성',
        problem: 'OpenAI 응답 형식이 매번 조금씩 달랐고, iTunes 검색 결과의 품질 편차가 커서 같은 감정에도 추천이 들쭉날쭉했습니다.',
        solution: '감정 레이블 종류를 좁혀 응답 형식을 고정하고, 감정별로 사용할 검색 키워드를 매핑 테이블로 명시했습니다.',
        result: '같은 감정에 대해 비슷한 분위기의 음악이 추천되도록 정리했습니다.'
      }
    ],
    resources: [{ label: '배포 사이트', url: 'https://emotional-music.vercel.app' }]
  },
  {
    slug: 'team-cucumber', index: '04', title: 'Team Cucumber',
    subtitle: '중고거래 서비스 모바일 웹 프론트엔드',
    summary: '페이지 전환·바텀시트 등 재사용 UI 컴포넌트 담당',
    description: '중고거래 서비스의 모바일 웹 화면을 React로 구현한 팀 프로젝트입니다. 프로젝트 초기 세팅과 라우트를 구성하고, 화면 전체에서 함께 쓰는 페이지 전환 애니메이션, 바텀시트, 토글 버튼, 상품 카드 컴포넌트를 맡았습니다.',
    category: 'FRONTEND / UI COMPONENTS',
    tags: ['React 19', 'TypeScript', 'Vite', 'Tailwind CSS', 'React Router', 'react-transition-group', 'Zustand'],
    fallback: 'mobile', github: 'https://github.com/hyehye12/TeamProject_Cucumber',
    role: '초기 세팅 · 라우트 · 공통 UI 컴포넌트',
    period: '2025.10 ~ 2025.11', team: '팀 프로젝트',
    features: [
      'Vite·기본 라이브러리 세팅과 페이지 라우트 구성',
      'react-transition-group으로 페이지 전환(slide) 컴포넌트 구현, 전환 후 스크롤 위치 초기화',
      '기존 Modal을 재사용한 바텀시트 컴포넌트 — Portal 렌더링, 배경 스크롤 잠금, 배경 클릭 시 닫기, 올라오는 애니메이션',
      'tailwind-merge로 스타일을 덮어쓸 수 있는 토글 버튼 컴포넌트 구현',
      '합성 컴포넌트 패턴으로 상품 카드 컴포넌트 구현'
    ],
    solving: [
      {
        kind: 'design', title: '페이지 전환 중 나가는 화면이 새 화면으로 바뀌는 문제',
        problem: '전환 애니메이션 동안 나가는 페이지와 들어오는 페이지가 동시에 렌더링되는데, 둘 다 현재 URL을 기준으로 그리면 나가는 페이지도 새 화면 내용으로 바뀝니다.',
        solution: '각 페이지가 자신이 렌더링될 때의 location을 받아 Routes에 전달하도록 하고(render prop), location.key마다 별도의 nodeRef를 만들어 들어오고 나가는 DOM을 각각 애니메이션했습니다.'
      }
    ],
    repositoryNote: '링크는 팀 프로젝트 저장소입니다. 신고 화면, 탭·토스트·아이콘 등은 다른 팀원이 담당했습니다.'
  }
];
