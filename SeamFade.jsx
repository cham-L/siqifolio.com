import { useEffect, useRef } from 'react';

// 黑白板块过渡（素材 黑白页面撕纸过渡修正提示词.txt 的替代方案，用户定稿）：
// 取消撕纸锯齿，改为「滚动跟随渐变遮罩」——
// 一条 白→黑 的 s 曲线渐变带横跨 Hero 底部与 AboutMe 顶部的重叠区，
// 渐变带随滚动进度缓慢迁移（贴 Hero 柔边 → 贴第二板块柔边），
// 两个板块接缝永远有一层渐变融合，没有任何硬切割。
export default function SeamFade() {
  const wrapRef = useRef(null);
  const bandRef = useRef(null);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const wrap = wrapRef.current;
      const band = bandRef.current;
      if (!wrap || !band) return;
      const r = wrap.getBoundingClientRect();
      const vh = window.innerHeight;
      // 接缝区穿过视口的进度 0 → 1
      const p = Math.min(1, Math.max(0, (vh - r.top) / (r.height + vh)));
      // 渐变带随滚动迁移：从贴 Hero 柔边平滑翻转到贴 AboutMe 柔边
      const travel = r.height * 0.24;
      band.style.transform = `translate3d(0, ${((p - 0.5) * 2 * travel).toFixed(1)}px, 0)`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="seam-fade" ref={wrapRef} aria-hidden="true">
      <div className="seam-band" ref={bandRef} />
    </div>
  );
}
