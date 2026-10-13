import { useCallback, useMemo, useRef, useState } from 'react';
import FlexCarousel from '../components/FlexCarousel.jsx';
import PressureHeading from '../components/PressureHeading.jsx';
import WorkDetail from '../components/WorkDetail.jsx';
import { useLang } from '../i18n.jsx';
import { content, projects } from '../content.js';

// 标题与作品之间的动态板块：无限跑马灯词条带（双行相向运动）
function WorksTicker({ reverse = false }) {
  const { t } = useLang();
  const words = t(content.works.ticker);
  const row = [...words, ...words];
  return (
    <div className={`works-ticker ${reverse ? 'is-reverse' : ''}`} aria-hidden="true">
      <div className={`works-ticker-track ${reverse ? 'reverse' : ''}`}>
        {row.map((word, i) => (
          <span className="works-ticker-item" key={i}>
            {word}
            <i>✦</i>
          </span>
        ))}
      </div>
    </div>
  );
}

// 旋转环形文字徽章（SVG textPath）
function WorksBadge() {
  const { t } = useLang();
  const text = t(content.works.badgeText);
  return (
    <div className="works-badge" data-parallax="0.16" aria-hidden="true">
      <svg viewBox="0 0 160 160">
        <defs>
          <path id="works-badge-circle" d="M80,80 m-58,0 a58,58 0 1,1 116,0 a58,58 0 1,1 -116,0" />
        </defs>
        <text className="works-badge-text">
          <textPath href="#works-badge-circle">{text + text}</textPath>
        </text>
        <path
          d="M80 58C83 71 89 77 102 80C89 83 83 89 80 102C77 89 71 83 58 80C71 77 77 71 80 58Z"
          fill="#ff2d95"
        />
      </svg>
    </div>
  );
}

// 精选作品：FlexCarousel 液态旋转木马（素材 Flex旋转木马.txt 原味参数：liquid 预设
// bend 0.34 / tilt 62° / dispersion 0.45 液态透镜形变）。
// 点击居中封面放大 → 两侧退开 → 全屏滚动详情页（WorkDetail 组件）。
export default function Works() {
  const { lang, t } = useLang();
  const w = content.works;
  const engineRef = useRef(null);
  const [detail, setDetail] = useState({ open: false, index: -1 });

  const items = useMemo(
    () =>
      projects.map(p => ({
        src: p.cover,
        alt: t(p.title),
        title: t(p.title),
        subtitle: t(p.subtitle)
      })),
    [lang, t]
  );

  const handleFocusChange = useCallback((open, index) => {
    setDetail({ open, index });
  }, []);

  const closeDetail = useCallback(() => {
    engineRef.current?.closeFocus();
  }, []);

  const project = detail.index >= 0 ? projects[detail.index] : null;

  return (
    <section className="section section-works" id="works">
      <span className="ghost-num" data-parallax="0.3" aria-hidden="true">
        02
      </span>
      <div className="works-head">
        <PressureHeading text="SELECTED WORKS" sub={lang === 'zh' ? '精 选 作 品' : 'CASE STUDIES'} />
      </div>

      {/* 标题与作品之间的动态板块：双行相向跑马灯 + 旋转徽章 + 漂浮星芒 */}
      <div className="works-interlude">
        <WorksTicker />
        <WorksTicker reverse />
        <WorksBadge />
        <span className="works-spark sp-1" aria-hidden="true">
          ✦
        </span>
        <span className="works-spark sp-2" aria-hidden="true">
          ✦
        </span>
        <span className="works-spark sp-3" aria-hidden="true">
          ✦
        </span>
      </div>

      <div className={`carousel-wrap ${detail.open ? 'detail-open' : ''}`} data-reveal>
        <FlexCarousel
          engineRef={engineRef}
          items={items}
          preset="liquid"
          intro="rise"
          cardHeight={0.56}
          gap={12}
          squeeze={0.2}
          focusOnClick
          captions
          fit="natural"
          radius={0}
          captureWheel
          focusDetail
          onFocusChange={handleFocusChange}
        />
      </div>

      {detail.open && project && <WorkDetail project={project} w={w} t={t} onClose={closeDetail} />}
    </section>
  );
}
