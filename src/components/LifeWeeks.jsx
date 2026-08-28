import { useEffect, useMemo, useRef } from 'react';
import Reveal from './Reveal.jsx';
import { getLifeWeeks } from '../utils/lifeExtras.js';
import { fmt } from '../utils/format.js';

/**
 * "Life in weeks" — every square is one week, every row a year. Rendered on a
 * canvas so ~4,680 cells stay cheap and crisp on mobile.
 */
export default function LifeWeeks({ birthDate }) {
  const data = useMemo(() => getLifeWeeks(birthDate), [birthDate]);
  const canvasRef = useRef(null);
  const wrapRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return undefined;
    const ctx = canvas.getContext('2d');

    const draw = () => {
      const cols = data.weeksPerYear; // 52
      const rows = data.lifeYears; // 90
      const gap = 2;
      const availW = wrap.clientWidth;
      // Cell size from width; capped so desktop doesn't get huge.
      let cell = Math.floor((availW - (cols - 1) * gap) / cols);
      cell = Math.max(3, Math.min(cell, 15));
      const gridW = cols * cell + (cols - 1) * gap;
      const gridH = rows * cell + (rows - 1) * gap;
      const offsetX = Math.floor((availW - gridW) / 2);

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(availW * dpr);
      canvas.height = Math.floor(gridH * dpr);
      canvas.style.width = `${availW}px`;
      canvas.style.height = `${gridH}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, availW, gridH);

      const lived = data.weeksLived;
      const radius = Math.max(1, Math.floor(cell * 0.28));

      for (let i = 0; i < rows * cols; i++) {
        const r = Math.floor(i / cols);
        const c = i % cols;
        const x = offsetX + c * (cell + gap);
        const y = r * (cell + gap);
        const isLived = i < lived;
        const isCurrent = i === lived; // the week you're living now

        if (isCurrent) {
          ctx.fillStyle = '#ffffff';
          ctx.shadowColor = 'rgba(138,215,255,0.9)';
          ctx.shadowBlur = 8;
        } else if (isLived) {
          // Subtle vertical gradient of accent by row for depth.
          const t = r / rows;
          ctx.fillStyle = `rgba(${Math.round(120 + t * 40)}, ${Math.round(
            200 - t * 40,
          )}, 255, 0.92)`;
          ctx.shadowBlur = 0;
        } else {
          ctx.fillStyle = 'rgba(255,255,255,0.07)';
          ctx.shadowBlur = 0;
        }

        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(x, y, cell, cell, radius);
        } else {
          ctx.rect(x, y, cell, cell);
        }
        ctx.fill();
      }
      ctx.shadowBlur = 0;
    };

    draw();
    let t;
    const onResize = () => {
      clearTimeout(t);
      t = setTimeout(draw, 150);
    };
    window.addEventListener('resize', onResize);
    return () => {
      clearTimeout(t);
      window.removeEventListener('resize', onResize);
    };
  }, [data]);

  return (
    <section className="section" aria-labelledby="weeks-heading">
      <div className="container">
        <Reveal>
          <p className="eyebrow">A life, at a glance</p>
          <h2 className="section-title" id="weeks-heading">Your life in weeks</h2>
          <p className="section-lede">
            Every square is a single week. Every row is a year. The bright square is the week you’re
            living right now.
          </p>
        </Reveal>

        <Reveal className="glass weeks-card" style={{ marginTop: '1.8rem' }}>
          <div
            className="weeks-canvas-wrap"
            ref={wrapRef}
            role="img"
            aria-label={`Life in weeks grid. ${fmt(data.weeksLived)} weeks lived out of about ${fmt(
              data.totalWeeks,
            )} in a ${data.lifeYears}-year life.`}
          >
            <canvas ref={canvasRef} />
          </div>
          <div className="weeks-legend">
            <span className="wk"><span className="sw lived" /> {fmt(data.weeksLived)} weeks lived</span>
            <span className="wk"><span className="sw now" /> This week</span>
            <span className="wk"><span className="sw left" /> {fmt(data.totalWeeks - data.weeksLived)} ahead (to {data.lifeYears})</span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
