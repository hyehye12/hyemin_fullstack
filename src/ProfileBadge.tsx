import { motion, useInView, useMotionValue, useSpring, useTransform } from 'motion/react';
import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { ArrowUpRight, RotateCw } from 'lucide-react';
import { profile } from './data/profile';

// public 폴더 경로에 배포 base(/hyemin_fullstack/)를 붙입니다.
const asset = (src: string) => src.startsWith('/') && !src.startsWith('//') ? import.meta.env.BASE_URL + src.slice(1) : src;
const githubUrl = 'https://github.com/hyehye12';

const stack = [
  ['FRONTEND', 'React · Next.js'],
  ['BACKEND', 'Node.js · NestJS'],
  ['DATA', 'Supabase · PostgreSQL'],
  ['DEVOPS', 'GitHub Actions · Vercel'],
] as const;

/**
 * 줄에 매달린 사원증처럼 흔들리는 각도를 계산합니다.
 * 스프링 하나로는 "툭 치면 몇 번 흔들리다 멈추는" 움직임이 어려워서, 감쇠 진동을 직접 적분합니다.
 * 움직임이 거의 없으면 루프를 멈춰 쉬는 동안에는 CPU를 쓰지 않습니다.
 */
function usePendulum() {
  const angle = useMotionValue(0);
  const velocity = useRef(0);
  const frame = useRef(0);
  const last = useRef(0);

  const tick = useCallback((now: number) => {
    const dt = Math.min(32, now - last.current) / 1000;
    last.current = now;
    const a = angle.get();
    velocity.current += (-30 * a - 2.2 * velocity.current) * dt;
    const next = Math.max(-16, Math.min(16, a + velocity.current * dt));
    if (Math.abs(next) < 0.03 && Math.abs(velocity.current) < 0.08) {
      angle.set(0);
      velocity.current = 0;
      frame.current = 0;
      return;
    }
    angle.set(next);
    frame.current = requestAnimationFrame(tick);
  }, [angle]);

  const kick = useCallback((impulse: number) => {
    velocity.current = Math.max(-140, Math.min(140, velocity.current + impulse));
    if (!frame.current) {
      last.current = performance.now();
      frame.current = requestAnimationFrame(tick);
    }
  }, [tick]);

  useEffect(() => () => cancelAnimationFrame(frame.current), []);
  return { angle, kick };
}

export default function ProfileBadge() {
  const stageRef = useRef<HTMLDivElement>(null);
  const inView = useInView(stageRef, { once: true, amount: 0.45 });
  const [flipped, setFlipped] = useState(false);
  const { angle, kick } = usePendulum();

  // 카드 위의 포인터 위치에 따라 살짝 기울어지는 값
  const spring = { stiffness: 160, damping: 18 };
  const tiltX = useSpring(0, spring);
  const tiltY = useSpring(0, spring);
  const flip = useSpring(0, { stiffness: 110, damping: 15 });
  const rotateY = useTransform(() => flip.get() + tiltY.get());
  const sheen = useTransform(tiltY, [-12, 12], ['0% 50%', '100% 50%']);
  const glare = useTransform(tiltY, [-12, 12], ['-30%', '30%']);

  useEffect(() => {
    const target = flipped ? 180 : 0;
    flip.set(target);
  }, [flipped, flip]);

  // 화면에 처음 들어오면 한 번 흔들리며 자리를 잡습니다.
  useEffect(() => { if (inView) kick(90); }, [inView, kick]);

  const onStageMove = (event: ReactPointerEvent) => {
    if (event.pointerType !== 'mouse') return;
    kick(event.movementX * 2.4);
  };
  const onCardMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'mouse') return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    tiltX.set(-y * 10);
    tiltY.set(x * 12);
  };
  const resetTilt = () => { tiltX.set(0); tiltY.set(0); };
  const toggle = () => {
    setFlipped(value => !value);
    kick(flipped ? -70 : 70);
  };

  const frontHidden = flipped;
  const initials = 'HM';

  return <div className="badge-stage" ref={stageRef} onPointerMove={onStageMove}>
    <span className="badge-wire" aria-hidden="true" />
    <motion.div className="badge-swing" style={{ rotate: angle }}
      initial={{ y: -90, opacity: 0 }}
      animate={inView ? { y: 0, opacity: 1 } : undefined}
      transition={{ type: 'spring', stiffness: 90, damping: 13 }}>
      <span className="badge-strap" aria-hidden="true"><span>HYE MIN KWAK · DEV · HYE MIN KWAK · DEV ·</span></span>
      <span className="badge-clip" aria-hidden="true" />
      <motion.div className="badge-card" style={{ rotateX: tiltX, rotateY }}
        onPointerMove={onCardMove} onPointerLeave={resetTilt}
        onClick={event => { if (!(event.target as HTMLElement).closest('a,button')) toggle(); }}>

        <div className="badge-face badge-front" aria-hidden={frontHidden}>
          <span className="badge-slot" aria-hidden="true" />
          <div className="badge-top"><span className="badge-mark">h.</span><span>PORTFOLIO · 2026</span></div>
          <div className="badge-photo">
            {profile.photo?.trim()
              ? <img src={asset(profile.photo)} alt={`${profile.name} 사진`} />
              : <span className="badge-monogram" aria-hidden="true">{initials}<i>.</i></span>}
            <motion.span className="badge-glare" style={{ x: glare }} aria-hidden="true" />
          </div>
          <div className="badge-name"><b>{profile.name}</b><span>Hye Min Kwak</span></div>
          <p className="badge-role">Full-Stack Developer</p>
          <div className="badge-foot">
            <span>SEOUL · KR</span>
            <button type="button" className="badge-flip" onClick={toggle} tabIndex={frontHidden ? -1 : 0}
              aria-label="카드 뒤집기: 기술 스택과 GitHub 보기" aria-pressed={flipped}><RotateCw size={15} strokeWidth={1.8} /></button>
          </div>
        </div>

        <motion.div className="badge-face badge-back" style={{ backgroundPosition: sheen }} aria-hidden={!frontHidden}>
          <span className="badge-slot" aria-hidden="true" />
          <div className="badge-top"><span className="badge-mark">h.</span><span>ID / FULL-STACK</span></div>
          <dl className="badge-stack">{stack.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
          <div className="badge-qr">
            <img src={asset('/images/github-qr.svg')} alt="GitHub 프로필 QR 코드" width={74} height={74} />
            <div>
              <span>SCAN / VISIT</span>
              <a href={githubUrl} target="_blank" rel="noreferrer" tabIndex={frontHidden ? 0 : -1}>github.com/hyehye12 <ArrowUpRight size={12} /></a>
              {profile.email.trim() && <a href={`mailto:${profile.email}`} tabIndex={frontHidden ? 0 : -1}>{profile.email}</a>}
            </div>
          </div>
          <div className="badge-foot">
            <span>TAP TO FLIP BACK</span>
            <button type="button" className="badge-flip" onClick={toggle} tabIndex={frontHidden ? 0 : -1}
              aria-label="카드 앞면으로 돌아가기"><RotateCw size={15} strokeWidth={1.8} /></button>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
    <p className="badge-hint" aria-hidden="true"><span className="hint-mouse">HOVER TO SWING · CLICK TO FLIP</span><span className="hint-touch">TAP TO FLIP</span></p>
  </div>;
}
