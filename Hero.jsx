import TechText from '../components/TechText.jsx';
import HeroBalls from '../components/HeroBalls.jsx';
import { useLang } from '../i18n.jsx';
import { content } from '../content.js';

export default function Hero() {
  const { t } = useLang();

  return (
    <section className="hero" id="top">
      {/* 海报风全屏背景：黑底白字半调海报 + 2 个粉色渐变球弹性碰撞（无像素交换动效） */}
      <HeroBalls />

      {/* 半透明黑遮罩：压暗海报背景，保证前景标题/文字可读 */}
      <div className="hero-veil-dark" aria-hidden="true" />

      <div className="hero-content">
        <div className="hero-title-wrap">          <TechText
            text={content.hero.title}
            fontWeight={800}
            fontSize={230}
            color="#f5f3ef"
            accentColor="#ff3cb0"
            letterSpacing={-0.04}
            reach={230}
            specks={14}
            strokeWidth={1.4}
            selection
            labels
            draggable
            sweep
          />
        </div>
        <div className="hero-meta" data-reveal>
          <h1 className="hero-name">{t(content.hero.name)}</h1>
          <p className="hero-tagline">{t(content.hero.tagline)}</p>
        </div>
      </div>

      {/* Hero 底部局部黑色向上渐变遮罩：底黑向上透明，与下方 AboutMe 黑色板块自然衔接 */}
      <div className="hero-fade-black" aria-hidden="true" />

      <div className="hero-bottom">
        {/* 仅保留流动光条作为视觉引导，不放任何小字操作提示 */}
        <div className="scroll-hint">
          <span className="line" />
        </div>
      </div>
    </section>
  );
}
