import { useEffect, useRef, useState } from 'react';
import Reveal from './Reveal.jsx';
import { getTotals, getAgeInYears, formatFullDate } from '../utils/dateCalculations.js';
import { getGeneration, abbreviate } from '../utils/lifeExtras.js';
import { fmt } from '../utils/format.js';

const W = 1080;
const H = 1350;

function roundRectPath(ctx, x, y, w, h, r) {
  if (ctx.roundRect) {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
    return;
  }
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

const compact = (n) =>
  abbreviate(n).replace(' trillion', 'T').replace(' billion', 'B').replace(' million', 'M');

export default function ShareCard({ birthDate }) {
  const canvasRef = useRef(null);
  const [status, setStatus] = useState('');
  const [canShareFiles, setCanShareFiles] = useState(false);

  useEffect(() => {
    try {
      const t = new File([new Blob()], 't.png', { type: 'image/png' });
      setCanShareFiles(!!(navigator.canShare && navigator.canShare({ files: [t] })));
    } catch {
      setCanShareFiles(false);
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = W;
    canvas.height = H;

    const totals = getTotals(birthDate);
    const years = getAgeInYears(birthDate);
    const weeks = Math.floor(totals.days / 7);
    const gen = getGeneration(birthDate);
    const sans = 'Manrope, system-ui, sans-serif';
    const serif = 'Fraunces, Georgia, serif';

    const paint = () => {
      // Background
      const bg = ctx.createLinearGradient(0, 0, W, H);
      bg.addColorStop(0, '#060814');
      bg.addColorStop(0.5, '#0a0f22');
      bg.addColorStop(1, '#050609');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      // Glows
      const g1 = ctx.createRadialGradient(W * 0.85, H * 0.1, 40, W * 0.85, H * 0.1, 700);
      g1.addColorStop(0, 'rgba(91,140,255,0.45)');
      g1.addColorStop(1, 'rgba(91,140,255,0)');
      ctx.fillStyle = g1;
      ctx.fillRect(0, 0, W, H);
      const g2 = ctx.createRadialGradient(W * 0.05, H * 0.55, 20, W * 0.05, H * 0.55, 620);
      g2.addColorStop(0, 'rgba(185,140,255,0.28)');
      g2.addColorStop(1, 'rgba(185,140,255,0)');
      ctx.fillStyle = g2;
      ctx.fillRect(0, 0, W, H);

      // Stars (deterministic)
      for (let i = 0; i < 120; i++) {
        const x = Math.abs((Math.sin(i * 12.9898) * 43758.5453) % 1) * W;
        const y = Math.abs((Math.sin(i * 78.233) * 12543.734) % 1) * H;
        const r = Math.abs((Math.sin(i * 3.7) * 100) % 1) * 2 + 0.4;
        ctx.globalAlpha = 0.12 + Math.abs((Math.sin(i * 5.1) * 10) % 1) * 0.6;
        ctx.fillStyle = '#dbe8ff';
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Planet, bottom-right, mostly off-canvas — fills the lower corner.
      const pcx = W * 0.92;
      const pcy = H * 1.02;
      const pr = 360;
      const atmo = ctx.createRadialGradient(pcx, pcy, pr * 0.7, pcx, pcy, pr * 1.25);
      atmo.addColorStop(0, 'rgba(120,190,255,0.25)');
      atmo.addColorStop(1, 'rgba(120,190,255,0)');
      ctx.fillStyle = atmo;
      ctx.beginPath();
      ctx.arc(pcx, pcy, pr * 1.25, 0, Math.PI * 2);
      ctx.fill();
      const planet = ctx.createRadialGradient(pcx - pr * 0.35, pcy - pr * 0.4, pr * 0.1, pcx, pcy, pr);
      planet.addColorStop(0, '#6fb0ff');
      planet.addColorStop(0.5, '#2f66c8');
      planet.addColorStop(1, '#122a5e');
      ctx.fillStyle = planet;
      ctx.beginPath();
      ctx.arc(pcx, pcy, pr, 0, Math.PI * 2);
      ctx.fill();

      // Card border
      ctx.strokeStyle = 'rgba(255,255,255,0.10)';
      ctx.lineWidth = 2;
      roundRectPath(ctx, 40, 40, W - 80, H - 80, 44);
      ctx.stroke();

      ctx.textAlign = 'left';

      // Brand
      ctx.fillStyle = '#5b8cff';
      ctx.beginPath();
      ctx.arc(86, 138, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#eaf2ff';
      ctx.font = `500 48px ${serif}`;
      ctx.fillText('Lifeline', 108, 154);

      // Eyebrow
      ctx.fillStyle = '#8ad7ff';
      ctx.font = `700 30px ${sans}`;
      ctx.save();
      ctx.letterSpacing = '6px';
      ctx.fillText('I’VE BEEN ALIVE FOR', 96, 400);
      ctx.restore();

      // Big days
      const daysStr = fmt(totals.days);
      ctx.font = `800 200px ${sans}`;
      const grad = ctx.createLinearGradient(96, 430, 96, 640);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(1, '#bcd3ff');
      ctx.fillStyle = grad;
      ctx.fillText(daysStr, 92, 600);
      ctx.fillStyle = '#8ad7ff';
      ctx.font = `700 56px ${sans}`;
      ctx.fillText('days on Earth', 100, 672);

      // Filled stat pills
      const pills = [`${years} years`, `${compact(totals.seconds)} seconds`, `${fmt(weeks)} weeks`];
      let px = 96;
      const py = 760;
      const ph = 74;
      ctx.font = `700 34px ${sans}`;
      pills.forEach((label) => {
        const tw = ctx.measureText(label).width;
        const pw = tw + 56;
        ctx.fillStyle = 'rgba(138,215,255,0.12)';
        ctx.strokeStyle = 'rgba(138,215,255,0.32)';
        ctx.lineWidth = 1.5;
        roundRectPath(ctx, px, py, pw, ph, ph / 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#dbeaff';
        ctx.fillText(label, px + 28, py + ph / 2 + 12);
        px += pw + 18;
      });

      // Punchy line
      ctx.fillStyle = '#e6ecff';
      ctx.font = `italic 300 52px ${serif}`;
      ctx.fillText('Every single one, lived once —', 96, 940);
      ctx.fillText('and never again.', 96, 1004);

      // Divider
      ctx.strokeStyle = 'rgba(255,255,255,0.12)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(96, 1080);
      ctx.lineTo(W - 96, 1080);
      ctx.stroke();

      // Generation + born
      ctx.fillStyle = '#aab4d6';
      ctx.font = `600 34px ${sans}`;
      ctx.fillText(`${gen.name}  ·  born ${formatFullDate(birthDate)}`, 96, 1150);

      // Footer
      ctx.fillStyle = '#8ad7ff';
      ctx.font = `700 36px ${sans}`;
      ctx.fillText('lifeline.harmansharma.in', 96, H - 96);
      ctx.fillStyle = '#7a83a6';
      ctx.font = `500 30px ${sans}`;
      ctx.fillText('How many days have you lived?', 96, H - 54);
    };

    paint();
    if (document.fonts && document.fonts.ready) {
      Promise.all([
        document.fonts.load('800 200px Manrope'),
        document.fonts.load('700 34px Manrope'),
        document.fonts.load('italic 300 52px Fraunces'),
        document.fonts.load('500 48px Fraunces'),
      ]).then(() => paint()).catch(() => {});
    }
  }, [birthDate]);

  const getBlob = () => new Promise((res) => canvasRef.current.toBlob(res, 'image/png', 0.95));

  const shareText =
    'My life, measured in time. Every single day, lived once. See yours → lifeline.harmansharma.in';

  const handleDownload = async () => {
    const blob = await getBlob();
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'my-lifeline.png';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setStatus('Image saved');
    setTimeout(() => setStatus(''), 2500);
  };

  const handleShare = async () => {
    try {
      const blob = await getBlob();
      const file = new File([blob], 'my-lifeline.png', { type: 'image/png' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: 'My Lifeline', text: shareText });
      } else {
        await handleDownload();
      }
    } catch {
      /* cancelled */
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText('https://lifeline.harmansharma.in/');
      setStatus('Link copied');
    } catch {
      setStatus('Could not copy');
    }
    setTimeout(() => setStatus(''), 2500);
  };

  return (
    <section className="section" aria-labelledby="share-heading">
      <div className="container">
        <Reveal>
          <p className="eyebrow">Take it with you</p>
          <h2 className="section-title" id="share-heading">Share your Lifeline</h2>
          <p className="section-lede">
            A snapshot of your time so far. Save it, or send it to someone and ask them the
            question that started it all — how many days have you lived?
          </p>
        </Reveal>

        <Reveal className="share-wrap" style={{ marginTop: '1.8rem' }}>
          <div className="share-preview glass">
            <canvas ref={canvasRef} className="share-canvas" aria-label="Your Lifeline share card" />
          </div>
          <div className="share-actions">
            {canShareFiles && (
              <button type="button" className="btn" onClick={handleShare}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M12 3v13M12 3 8 7M12 3l4 4M5 12v7a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-7"
                    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Share
              </button>
            )}
            <button type="button" className={canShareFiles ? 'btn-ghost share-btn' : 'btn'} onClick={handleDownload}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 3v12m0 0 4-4m-4 4-4-4M5 21h14"
                  stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Download image
            </button>
            <button type="button" className="btn-ghost share-btn" onClick={handleCopy}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M9 9h10v10H9zM5 15V5h10" stroke="currentColor" strokeWidth="1.8"
                  strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Copy link
            </button>
            <span className="share-status" role="status" aria-live="polite">{status}</span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
