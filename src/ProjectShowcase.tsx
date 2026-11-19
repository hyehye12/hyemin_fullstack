import { motion, useScroll, useTransform, type MotionValue } from 'motion/react';
import { useRef, useSyncExternalStore } from 'react';
import { Link } from 'react-router-dom';

const asset = (src: string) => import.meta.env.BASE_URL + src.replace(/^\//, '');

type Shot = {
  src: string; label: string; slug: string; title: string;
  side: 'left' | 'right'; offset: number; top: number; width: number;
  speed: number; tilt: number;
};

// side/offset: 쇼케이스 가장자리에서의 거리(%), top: 시작 높이(%), width: 쇼케이스 너비 대비 크기(%),
// speed: 스크롤에 따라 올라가는 속도(클수록 가까이 있는 카드처럼 빨리 지나갑니다)
const shots: Shot[] = [
  { src: '/images/showcase/cinetrip-main.webp', title: 'CineTrip', label: '메인 피드', slug: 'cinetrip', side: 'left', offset: 4, top: 6, width: 22, speed: 1, tilt: -2 },
  { src: '/images/showcase/emotional-main.webp', title: 'EmotionalMusic', label: '감정 입력', slug: 'emotional-music', side: 'right', offset: 5, top: 0, width: 21, speed: 1.2, tilt: 1.5 },
  { src: '/images/showcase/emotional-result.webp', title: 'EmotionalMusic', label: 'AI 감정 분석', slug: 'emotional-music', side: 'left', offset: 13, top: 58, width: 15, speed: 1.45, tilt: 2 },
  { src: '/images/showcase/cinetrip-gallery.webp', title: 'CineTrip', label: '갤러리', slug: 'cinetrip', side: 'right', offset: 7, top: 52, width: 21, speed: 0.85, tilt: -1.5 },
  { src: '/images/showcase/woodpecker.webp', title: '딱다구리', label: '서비스 소개', slug: 'woodpecker', side: 'left', offset: 3, top: 96, width: 21, speed: 0.9, tilt: 1 },
  { src: '/images/showcase/emotional-music.webp', title: 'EmotionalMusic', label: '음악 추천', slug: 'emotional-music', side: 'right', offset: 13, top: 92, width: 15, speed: 1.3, tilt: 2.5 },
  { src: '/images/showcase/cinetrip-movie.webp', title: 'CineTrip', label: '영화 검색', slug: 'cinetrip', side: 'right', offset: 4, top: 128, width: 17, speed: 1.05, tilt: -1 },
];

const desktopShots: Shot[] = [
  { ...shots[0], offset: 3, top: 6, width: 24 },
  { ...shots[1], offset: 3, top: 6, width: 24 },
  { ...shots[4], offset: 7, top: 65, width: 23 },
  { ...shots[3], offset: 7, top: 65, width: 23 },
];

const query = '(max-width: 760px)';
const subscribe = (callback: () => void) => {
  const media = window.matchMedia(query);
  media.addEventListener('change', callback);
  return () => media.removeEventListener('change', callback);
};

function FloatingShot({ shot, progress, index }: { shot: Shot; progress: MotionValue<number>; index: number }) {
  // 중앙 배치는 유지하면서 카드마다 다른 속도로 흐르고 기울어집니다.
  const y = useTransform(progress, [0, 1], [140 * shot.speed, -140 * shot.speed]);
  const rotate = useTransform(progress, [0, 1], [shot.tilt, -shot.tilt]);
  return <motion.div className="showcase-shot" style={{
    [shot.side]: `${shot.offset}%`, top: `${shot.top}%`, width: `${shot.width}%`,
    y, rotate, zIndex: Math.round(shot.speed * 10),
  }}>
    <Link to={`/projects/${shot.slug}`} tabIndex={-1} className="showcase-link">
      <img src={asset(shot.src)} alt="" loading={index < 4 ? 'eager' : 'lazy'} decoding="async" />
      <span className="showcase-caption"><b>{shot.title}</b>{shot.label}</span>
    </Link>
  </motion.div>;
}

export default function ProjectShowcase({ featured, total }: { featured: number; total: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const simple = useSyncExternalStore(subscribe, () => window.matchMedia(query).matches, () => true);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });

  const heading = <div className="showcase-title">
    <div className="section-label">01 / SELECTED WORK</div>
    <h2>Selected <span>Projects.</span></h2>
    <p>프로젝트별 구현 내용과 담당 업무를 정리했습니다.</p>
    <span className="section-counter">{String(featured).padStart(2, '0')} FEATURED / {String(total).padStart(2, '0')} TOTAL</span>
  </div>;

  // 모바일에서는 스크롤을 붙잡지 않고 가로로 넘겨 보는 띠로 보여줍니다.
  if (simple) return <div className="showcase showcase-simple">
    <div className="page-width">{heading}</div>
    <div className="showcase-strip" aria-hidden="true">
      {shots.slice(0, 6).map(shot => <Link key={shot.src + shot.label} to={`/projects/${shot.slug}`} tabIndex={-1} className="showcase-strip-item">
        <img src={asset(shot.src)} alt="" loading="lazy" decoding="async" />
        <span className="showcase-caption"><b>{shot.title}</b>{shot.label}</span>
      </Link>)}
    </div>
  </div>;

  return <div className="showcase" ref={ref}>
    <div className="showcase-sticky">
      {heading}
      <div className="showcase-layer" aria-hidden="true">
        {desktopShots.map((shot, index) => <FloatingShot key={shot.src + shot.label} shot={shot} progress={scrollYProgress} index={index} />)}
      </div>
    </div>
  </div>;
}
