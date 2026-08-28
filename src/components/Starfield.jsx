import { useEffect, useRef } from 'react';

/**
 * A lightweight canvas starfield: drifting/twinkling stars with the occasional
 * shooting star. Fixed behind all content. Cheap (2D canvas, capped DPR) and
 * fully static when prefers-reduced-motion is set.
 */
export default function Starfield({ reducedMotion = false }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let stars = [];
    let shootingStars = [];
    let raf = 0;
    let running = true;

    const isSmall = window.matchMedia('(max-width: 640px)').matches;

    function build() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Density scales with area but is capped for mobile performance.
      const density = isSmall ? 0.00018 : 0.00028;
      const count = Math.min(isSmall ? 130 : 320, Math.floor(width * height * density));
      stars = new Array(count).fill(0).map(() => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 1.3 + 0.25,
        base: Math.random() * 0.5 + 0.35,
        // Twinkle phase/speed.
        tw: Math.random() * Math.PI * 2,
        tws: Math.random() * 0.9 + 0.25,
        // Subtle upward drift.
        vy: Math.random() * 0.02 + 0.006,
        hue: Math.random() < 0.22 ? 210 : Math.random() < 0.5 ? 260 : 220,
      }));
    }

    function spawnShootingStar() {
      // Randomise both where it starts and which way it flies, so streaks
      // never look like they come from the same few points.
      const goRight = Math.random() < 0.55; // mostly →, sometimes ←
      // Start anywhere across the top ~65% of the screen, on the side it
      // travels away from, so the whole streak stays visible.
      const startX = goRight
        ? Math.random() * width * 0.55
        : width * 0.45 + Math.random() * width * 0.55;
      const startY = Math.random() * height * 0.6;
      // Downward angle between ~20° and ~55°, mirrored for leftward stars.
      const angle = (20 + Math.random() * 35) * (Math.PI / 180);
      const speed = (isSmall ? 5 : 7.5) + Math.random() * 6;
      shootingStars.push({
        x: startX,
        y: startY,
        vx: Math.cos(angle) * speed * (goRight ? 1 : -1),
        vy: Math.sin(angle) * speed,
        len: 90 + Math.random() * 170,
        life: 0,
        maxLife: 55 + Math.random() * 40,
      });
    }

    let lastShoot = 0;
    function frame(t) {
      if (!running) return;
      ctx.clearRect(0, 0, width, height);

      // Stars
      for (const s of stars) {
        s.tw += s.tws * 0.02;
        s.y -= s.vy;
        if (s.y < -2) s.y = height + 2;
        const alpha = s.base + Math.sin(s.tw) * 0.3;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${s.hue}, 90%, 82%, ${Math.max(0.05, alpha)})`;
        ctx.fill();
      }

      // Occasional shooting star, with a randomised gap (~1.8–4.6s) so the
      // cadence itself varies too.
      if (t - lastShoot > 1800 + Math.random() * 2800 && shootingStars.length < 2) {
        spawnShootingStar();
        lastShoot = t;
      }

      shootingStars = shootingStars.filter((sh) => sh.life < sh.maxLife);
      for (const sh of shootingStars) {
        sh.life += 1;
        sh.x += sh.vx;
        sh.y += sh.vy;
        const fade = 1 - sh.life / sh.maxLife;
        const tailX = sh.x - sh.vx * (sh.len / 12);
        const tailY = sh.y - sh.vy * (sh.len / 12);
        const grad = ctx.createLinearGradient(sh.x, sh.y, tailX, tailY);
        grad.addColorStop(0, `rgba(190, 225, 255, ${0.9 * fade})`);
        grad.addColorStop(1, 'rgba(190, 225, 255, 0)');
        ctx.strokeStyle = grad;
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(sh.x, sh.y);
        ctx.lineTo(tailX, tailY);
        ctx.stroke();
        // Bright head
        ctx.beginPath();
        ctx.arc(sh.x, sh.y, 1.6, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${fade})`;
        ctx.fill();
      }

      raf = requestAnimationFrame(frame);
    }

    function drawStatic() {
      // Reduced-motion: paint a calm, still starfield once.
      ctx.clearRect(0, 0, width, height);
      for (const s of stars) {
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${s.hue}, 90%, 82%, ${s.base})`;
        ctx.fill();
      }
    }

    build();
    if (reducedMotion) {
      drawStatic();
    } else {
      raf = requestAnimationFrame(frame);
    }

    let resizeTimer;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        build();
        if (reducedMotion) drawStatic();
      }, 200);
    };
    window.addEventListener('resize', onResize);

    const onVisibility = () => {
      running = document.visibilityState === 'visible' && !reducedMotion;
      if (running) raf = requestAnimationFrame(frame);
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      clearTimeout(resizeTimer);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [reducedMotion]);

  return <canvas ref={canvasRef} className="starfield" aria-hidden="true" />;
}
