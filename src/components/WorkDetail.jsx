import { useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';

// 作品详情弹窗（用户定稿：不要全屏滚动详情页，改弹窗；动效要新颖高级，不套模板）：
// 入场 = FLIP 形变——面板从被点击卡片的真实位置/尺寸，平滑形变飞入屏幕中央，
// 配合一次性斜向光扫 + 内容错峰浮现；退场反向缩回。
// 面板本身沿用玻璃质感：左侧深色玻璃身份区 + 右侧内容区（内部滚动）。
export default function WorkDetail({ project, w, t, onClose }) {
  const backdropRef = useRef(null);
  const panelRef = useRef(null);
  const bodyRef = useRef(null);
  const sectionRefs = useRef({});
  const tlRef = useRef(null);

  // 右侧内容区章节（弹窗内全部呈现，无需滚动翻章）
  const sections = useMemo(
    () => [
      { key: 'overview', label: t(w.overview), node: t(project.overview).map((p, i) => <p key={i}>{p}</p>) },
      {
        key: 'highlights',
        label: t(w.highlights),
        node: (
          <ul>
            {t(project.highlights).map((h, i) => (
              <li key={i}>{h}</li>
            ))}
          </ul>
        )
      },
      { key: 'tools', label: t(w.tools), node: <p className="wdo-tools">{t(project.tools)}</p> },
      {
        key: 'gallery',
        label: t(w.gallery),
        node: (
          <div className="wdo-last">
            {project.images && (
              <div className="wdo-gallery">
                {project.images.map((src, i) => (
                  <img key={i} src={src} alt={`${t(project.title)} ${i + 1}`} loading="lazy" />
                ))}
              </div>
            )}
            {project.link && (
              <div className="wdo-actions">
                <a className="btn btn-primary" href={project.link.url} target="_blank" rel="noreferrer">
                  {project.link.type === 'video' ? t(w.watchVideo) : t(w.viewNote)} ↗
                </a>
                {project.link.code && (
                  <span className="wdo-code">
                    {t(w.extractCode)} <b>{project.link.code}</b>
                  </span>
                )}
              </div>
            )}
          </div>
        )
      }
    ],
    [project, w, t]
  );

  // FLIP 入场 / 反向退场
  useEffect(() => {
    const panel = panelRef.current;
    const backdrop = backdropRef.current;
    if (!panel || !backdrop) return undefined;

    // 起点：被点击的聚焦卡片（找不到则退化为轮播区中心）
    const originEl = document.querySelector('.flex-carousel__item.is-focused, .flex-carousel__item.is-active') || document.querySelector('.carousel-wrap');
    const from = originEl?.getBoundingClientRect() || { left: window.innerWidth / 2 - 200, top: window.innerHeight / 2 - 140, width: 400, height: 280 };
    // 终点：面板自身布局位置（居中）
    const to = panel.getBoundingClientRect();

    const dx = from.left + from.width / 2 - (to.left + to.width / 2);
    const dy = from.top + from.height / 2 - (to.top + to.height / 2);
    const sx = Math.max(0.06, from.width / to.width);
    const sy = Math.max(0.06, from.height / to.height);

    gsap.set(panel, { x: dx, y: dy, scaleX: sx, scaleY: sy, opacity: 0.4, transformOrigin: 'center center' });
    gsap.set(backdrop, { opacity: 0 });

    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
    tl.to(backdrop, { opacity: 1, duration: 0.45, ease: 'power2.out' }, 0)
      // 形变飞入：先快后缓，轻微过冲的高级手感
      .to(panel, { x: 0, y: 0, scaleX: 1, scaleY: 1, opacity: 1, duration: 0.85 }, 0.02)
      // 内容错峰浮现
      .fromTo(
        bodyRef.current?.children || [],
        { opacity: 0, y: 26 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.07, ease: 'power3.out' },
        0.38
      );
    tlRef.current = tl;

    document.body.style.overflow = 'hidden';
    const onKey = e => e.key === 'Escape' && close();
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      tl.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const close = () => {
    const panel = panelRef.current;
    const backdrop = backdropRef.current;
    if (!panel) return onClose();
    const tl = gsap.timeline({ onComplete: onClose });
    tl.to(panel, { opacity: 0, scale: 0.92, y: 24, duration: 0.32, ease: 'power2.in' }, 0)
      .to(backdrop, { opacity: 0, duration: 0.3, ease: 'power2.in' }, 0.05);
  };

  const jumpTo = key => {
    const el = sectionRefs.current[key];
    const body = bodyRef.current;
    if (el && body) body.scrollTo({ top: el.offsetTop - 18, behavior: 'smooth' });
  };

  return createPortal(
    <div className="wdo" role="dialog" aria-modal="true" aria-label={t(project.title)}>
      <div className="wdo-backdrop" ref={backdropRef} onClick={close} aria-hidden="true" />
      <div className="wdo-panel" ref={panelRef}>
        {/* 一次性斜向光扫（入场高级感点睛） */}
        <span className="wdo-sweep" aria-hidden="true" />
        {/* 左侧 38% 深色玻璃身份区 */}
        <aside className="wdo-side">
          <div className="wdo-side-bg" style={{ backgroundImage: `url(${project.cover})` }} aria-hidden="true" />
          <div className="wdo-side-veil" aria-hidden="true" />
          <div className="wdo-side-inner">
            <span className="wdo-tag">{t(project.tag)}</span>
            <h3 className="wdo-title">{t(project.title)}</h3>
            <p className="wdo-subtitle">{t(project.subtitle)}</p>
            <div className="wdo-meta">
              <div>
                <b>{t(w.role)}</b>
                {t(project.role)}
              </div>
              <div>
                <b>YEAR</b>
                {project.year}
              </div>
            </div>
            {project.award && <div className="wdo-award">🏆 {t(project.award)}</div>}
            <nav className="wdo-nav" aria-label="Sections">
              {sections.map((s, i) => (
                <button key={s.key} type="button" onClick={() => jumpTo(s.key)}>
                  <i>{String(i + 1).padStart(2, '0')}</i>
                  {s.label}
                </button>
              ))}
            </nav>
          </div>
        </aside>
        {/* 右侧内容区（内部滚动） */}
        <div className="wdo-body" ref={bodyRef}>
          <div className="wdo-showcase" ref={el => (sectionRefs.current.showcase = el)}>
            <img src={project.cover} alt={t(project.title)} />
          </div>
          {sections.map(s => (
            <section key={s.key} ref={el => (sectionRefs.current[s.key] = el)} className="wdo-sec">
              <h4>{s.label}</h4>
              {s.node}
            </section>
          ))}
        </div>
        <button className="wdo-close" onClick={close} aria-label={t(w.close)}>
          ✕
        </button>
      </div>
    </div>,
    document.body
  );
}
