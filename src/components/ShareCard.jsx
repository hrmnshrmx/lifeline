import { useEffect, useRef, useState } from 'react';
import Reveal from './Reveal.jsx';
import { getTotals, getAgeInYears, formatFullDate } from '../utils/dateCalculations.js';
import { getGeneration } from '../utils/lifeExtras.js';
import { fmt } from '../utils/format.js';

const W = 1080;
const H = 1350;

function roundRect(ctx, x, y, w, h, r) {
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

export default function ShareCard({ birthDate }) {
  const canvasRef = useRef(null);
  const [status, setStatus] = useState('');
  const [canShareFiles, setCanShareFiles] = useState(false);

  useEffect(() => {
    try {
      const testFile = new File([new Blob()], 't.png', { type: 'image/png' });
      setCanShareFiles(!!(navigator.canShare && navigator.canShare({ files: [testFile] })));
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
    const gen = getGeneration(birthDate);

    const paint = () => {
      // Background
      const bg = ctx.createLinearGradient(0, 0, W, H);
      bg.addColorStop(0, '#05060c');
      bg.addColorStop(0.55, '#080c1c');
      bg.addColorStop(1, '#04050a');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      // Glow top-right
      const glow = ctx.createRadialGradient(W * 0.82, H * 0.12, 40, W * 0.82, H * 0.12, 620);
      glow.addColorStop(0, 'rgba(91,140,255,0.42)');
      glow.addColorStop(1, 'rgba(91,140,255,0)');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, W, H);
      const glow2 = ctx.createRadialGradient(W * 0.1, H * 0.9, 20, W * 0.1, H * 0.9, 560);
      glow2.addColorStop(0, 'rgba(185,140,255,0.3)');
      glow2.addColorStop(1, 'rgba(185,140,255,0)');
      ctx.fillStyle = glow2;
      ctx.fillRect(0, 0, W, H);

      // Star dots
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      for (let i = 0; i < 90; i++) {
        const x = (Math.sin(i * 12.9898) * 43758.5453) % 1;
        const y = (Math.sin(i * 78.233) * 12543.734) % 1;
        const px = Math.abs(x) * W;
        const py = Math.abs(y) * H;
        ctx.globalAlpha = 0.15 + (Math.abs(x) * 0.5);
        ctx.beginPath();
        ctx.arc(px, py, Math.abs(y) * 2 + 0.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Card border
      ctx.strokeStyle = 'rgba(255,255,255,0.10)';
      ctx.lineWidth = 2;
      roundRect(ctx, 40, 40, W - 80, H - 80, 40);
      ctx.stroke();

      const sans = 'Manrope, system-ui, sans-serif';
      const serif = 'Fraunces, Georgia, serif';
      ctx.textAlign = 'left';

      // Wordmark
      ctx.fillStyle = '#e8f2ff';
      ctx.font = `500 46px ${serif}`;
      ctx.fillText('Lifeline', 96, 150);
      ctx.fillStyle = '#5b8cff';
      ctx.beginPath();
      ctx.arc(84, 136, 9, 0, Math.PI * 2);
      ctx.fill();

      // "I have been alive for"
      ctx.fillStyle = '#aab4d6';
      ctx.font = `600 34px ${sans}`;
      ctx.fillText('I have been alive for', 96, 430);

      // Big days number (gradient)
      const daysStr = fmt(totals.days);
      ctx.font = `800 210px ${sans}`;
      const grad = ctx.createLinearGradient(96, 460, 96, 660);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(1, '#bcd3ff');
      ctx.fillStyle = grad;
      ctx.fillText(daysStr, 92, 620);

      ctx.fillStyle = '#8ad7ff';
      ctx.font = `600 60px ${sans}`;
      ctx.fillText('days', 100, 700);

      // Seconds + born line
      ctx.fillStyle = '#c7cfe8';
      ctx.font = `500 34px ${sans}`;
      ctx.fillText(`${fmt(totals.seconds)} seconds  ·  ${years} years`, 96, 800);
      ctx.fillStyle = '#8b93b4';
      ctx.font = `500 30px ${sans}`;
      ctx.fillText(`Born ${formatFullDate(birthDate)}`, 96, 850);

      // Divider
      ctx.strokeStyle = 'rgba(255,255,255,0.12)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(96, 930);
      ctx.lineTo(W - 96, 930);
      ctx.stroke();

      // Generation chip line
      ctx.fillStyle = '#aab4d6';
      ctx.font = `600 34px ${sans}`;
      ctx.fillText(`${gen.name}  ·  born in the ${gen.decade}`, 96, 1010);

      // Footer
      ctx.fillStyle = '#8ad7ff';
      ctx.font = `600 34px ${sans}`;
      ctx.fillText('lifeline.harmansharma.in', 96, H - 110);
      ctx.fillStyle = '#6d7699';
      ctx.font = `500 28px ${sans}`;
      ctx.fillText('Your life, measured in time.', 96, H - 68);
    };

    // Paint immediately, then repaint once web fonts are ready for crisp type.
    paint();
    if (document.fonts && document.fonts.ready) {
      Promise.all([
        document.fonts.load('800 210px Manrope'),
        document.fonts.load('600 34px Manrope'),
        document.fonts.load('500 46px Fraunces'),
      ])
        .then(() => paint())
        .catch(() => {});
    }
  }, [birthDate]);

  const getBlob = () =>
    new Promise((resolve) => canvasRef.current.toBlob(resolve, 'image/png', 0.95));

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
    setStatus('Image downloaded');
    setTimeout(() => setStatus(''), 2500);
  };

  const handleShare = async () => {
    try {
      const blob = await getBlob();
      const file = new File([blob], 'my-lifeline.png', { type: 'image/png' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'My Lifeline',
          text: 'My life, measured in time — lifeline.harmansharma.in',
        });
      } else {
        await handleDownload();
      }
    } catch {
      /* user cancelled — no-op */
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
            A little snapshot of your time so far — save it, or send it to someone who’ll feel it too.
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
