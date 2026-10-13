import { useEffect, useRef, useState } from 'react';

// 装饰性 Preloader：深灰黑底 + 呼吸名字 + 旋转小图标 + 粉色百分比（先快后慢），
// 100% 停留 0.25s 后整体上滑退出，总时长约 2.3s，每次加载只播一次。
export default function Preloader() {
  const [leaving, setLeaving] = useState(false);
  const [done, setDone] = useState(false);
  const pctRef = useRef(null);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    let raf = 0;
    let holdTimer = 0;
    let exitTimer = 0;
    const start = performance.now();

    const tick = now => {
      const p = Math.min(1, (now - start) / 1500);
      // 先快后慢：前段冲得快，后段放缓，模拟真实加载手感
      const eased = 1 - Math.pow(1 - p, 2.4);
      if (pctRef.current) pctRef.current.textContent = `${Math.round(eased * 100)}%`;
      if (p < 1) {
        raf = requestAnimationFrame(tick);
        return;
      }
      if (pctRef.current) pctRef.current.textContent = '100%';
      holdTimer = window.setTimeout(() => {
        setLeaving(true);
        exitTimer = window.setTimeout(() => {
          setDone(true);
          document.body.style.overflow = '';
        }, 580);
      }, 250);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(holdTimer);
      clearTimeout(exitTimer);
      document.body.style.overflow = '';
    };
  }, []);

  if (done) return null;

  return (
    <div className={`preloader ${leaving ? 'leaving' : ''}`} aria-hidden="true">
      <div className="preloader-name" aria-label="Siqi.">
        <span className="pl-l l1">S</span>
        <span className="pl-l l2">i</span>
        <span className="pl-l l3">q</span>
        <span className="pl-l l4">i</span>
        <span className="pl-l pl-dot">.</span>
      </div>
      <div className="preloader-icon">
        <svg viewBox="0 0 32 32" width="28" height="28" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round">
          <path d="M16 4v8M16 20v8M4 16h8M20 16h8M8 8l5 5M19 19l5 5M24 8l-5 5M13 19l-5 5" />
        </svg>
      </div>
      <div className="preloader-pct" ref={pctRef}>0%</div>
    </div>
  );
}
