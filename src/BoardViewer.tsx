import { animate, motion, useMotionValue } from 'motion/react';
import { useRef, useState, type MouseEvent as ReactMouseEvent, type PointerEvent as ReactPointerEvent } from 'react';
import { ArrowUpRight, Maximize2, Minus, Plus } from 'lucide-react';

const asset = (src: string) => import.meta.env.BASE_URL + src.replace(/^\//, '');

export type Board = {
  label: string;
  caption: string;
  src: string; // 기본 이미지 (작은 해상도)
  full: string; // 확대했을 때 불러올 고해상도 이미지
  width: number;
  height: number;
  link?: { label: string; url: string };
};

const MIN = 1;
const MAX = 5;
const STEP = 1.6;

/**
 * Figma 보드처럼 큰 이미지를 확대·드래그해서 보는 뷰어.
 * 처음엔 작은 이미지를 보여주고, 확대하면 고해상도 이미지로 바꿔 글씨까지 읽히게 합니다.
 */
export default function BoardViewer({ board }: { board: Board }) {
  const frame = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const scale = useMotionValue(1);
  const [zoom, setZoom] = useState(1);
  const [hiRes, setHiRes] = useState(false);
  const drag = useRef<{ id: number; sx: number; sy: number; ox: number; oy: number; moved: boolean } | null>(null);

  const clamp = (value: number, s: number, size: number) => {
    const limit = ((s - 1) * size) / 2;
    return Math.max(-limit, Math.min(limit, value));
  };

  // (px, py): 프레임 중심 기준 좌표. 그 지점이 화면에서 제자리에 있도록 확대합니다.
  const zoomTo = (next: number, px = 0, py = 0) => {
    const el = frame.current;
    if (!el) return;
    const s1 = scale.get();
    const s2 = Math.max(MIN, Math.min(MAX, next));
    const { width, height } = el.getBoundingClientRect();
    const nx = clamp(px - (px - x.get()) * (s2 / s1), s2, width);
    const ny = clamp(py - (py - y.get()) * (s2 / s1), s2, height);
    const opts = { type: 'spring' as const, stiffness: 260, damping: 30 };
    animate(scale, s2, opts);
    animate(x, nx, opts);
    animate(y, ny, opts);
    setZoom(s2);
    if (s2 > 1.4) setHiRes(true);
  };

  const fromCenter = (clientX: number, clientY: number) => {
    const rect = frame.current!.getBoundingClientRect();
    return [clientX - rect.left - rect.width / 2, clientY - rect.top - rect.height / 2] as const;
  };

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (scale.get() <= 1 || (event.target as HTMLElement).closest('button,a')) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { id: event.pointerId, sx: event.clientX, sy: event.clientY, ox: x.get(), oy: y.get(), moved: false };
  };
  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || d.id !== event.pointerId) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const s = scale.get();
    if (Math.abs(event.clientX - d.sx) + Math.abs(event.clientY - d.sy) > 4) d.moved = true;
    x.set(clamp(d.ox + event.clientX - d.sx, s, rect.width));
    y.set(clamp(d.oy + event.clientY - d.sy, s, rect.height));
  };
  const onPointerUp = () => { drag.current = null; };
  const onDoubleClick = (event: ReactMouseEvent) => {
    const [px, py] = fromCenter(event.clientX, event.clientY);
    zoomTo(zoom >= MAX - 0.01 ? 1 : zoom * STEP * 1.25, px, py);
  };

  return <figure className="board">
    <div ref={frame} className={`board-frame ${zoom > 1 ? 'is-zoomed' : ''}`} style={{ aspectRatio: `${board.width} / ${board.height}` }}
      onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp}
      onDoubleClick={onDoubleClick}>
      <motion.img src={asset(hiRes ? board.full : board.src)} alt={`${board.label} — ${board.caption}`} draggable={false}
        style={{ x, y, scale }} loading="lazy" decoding="async" />
      <div className="board-tools">
        <button type="button" onClick={() => zoomTo(zoom / STEP)} disabled={zoom <= MIN} aria-label="축소"><Minus size={15} /></button>
        <span aria-live="polite">{Math.round(zoom * 100)}%</span>
        <button type="button" onClick={() => zoomTo(zoom * STEP)} disabled={zoom >= MAX} aria-label="확대"><Plus size={15} /></button>
        <button type="button" onClick={() => zoomTo(1)} disabled={zoom === 1} aria-label="전체 보기"><Maximize2 size={14} /></button>
      </div>
      {zoom === 1 && <span className="board-hint" aria-hidden="true">더블클릭하거나 + 버튼으로 확대 · 확대 후 드래그로 이동</span>}
    </div>
    <figcaption>
      <div><b>{board.label}</b><span>{board.caption}</span></div>
      <div className="board-links">
        <a href={asset(board.full)} target="_blank" rel="noreferrer">원본 크게 보기 <ArrowUpRight size={14} /></a>
        {board.link && <a href={board.link.url} target="_blank" rel="noreferrer">{board.link.label} <ArrowUpRight size={14} /></a>}
      </div>
    </figcaption>
  </figure>;
}
