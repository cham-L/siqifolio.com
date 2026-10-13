import { useEffect, useRef, useState } from 'react';
import { useLang } from '../i18n.jsx';
import { content } from '../content.js';
import TextPressure from '../components/TextPressure.jsx';
import SplitText from '../components/SplitText.jsx';

// 联系我（JOYO 式页尾）：
// 页面顶部与上一白色页面以圆弧衔接（黑色板块圆弧上拱盖住白页）；
// CONTACT ME 大标题用 TextPressure 可变字体压感动画
// （鼠标驱动字重/字宽变化，白色填充 + 粉色描边 = 白粉结合）；
// 联系方式放进一面「悬浮墙」：玻璃质感 3D 倾斜 + 鼠标跟随 + 上下悬浮 + 背后星云光斑。
// 星芒（含左下角粉色那颗）作为整个板块「最后一批」入场：悬浮墙出现后才错峰亮起。

export default function Contact() {
  const { lang, t } = useLang();
  const c = content.contact;
  const wallRef = useRef(null);
  const sectionRef = useRef(null);
  const [sparksOn, setSparksOn] = useState(false);

  // 星芒压轴登场：板块进入视口且悬浮墙渐显启动后，再延迟点亮星芒
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return undefined;
    let timer = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        timer = window.setTimeout(() => setSparksOn(true), 1400);
        io.disconnect();
      },
      { threshold: 0.25 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      if (timer) window.clearTimeout(timer);
    };
  }, []);

  // 悬浮墙鼠标跟随 3D 倾斜（写入 CSS 变量，外层 transform 消费）
  useEffect(() => {
    const wall = wallRef.current;
    if (!wall) return undefined;
    let raf = 0;
    const onMove = e => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const rect = wall.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = Math.max(-1, Math.min(1, (e.clientX - cx) / (window.innerWidth * 0.55)));
        const dy = Math.max(-1, Math.min(1, (e.clientY - cy) / (window.innerHeight * 0.55)));
        wall.style.setProperty('--ct-tilt-x', `${(-dy * 6.5).toFixed(2)}deg`);
        wall.style.setProperty('--ct-tilt-y', `${(dx * 8).toFixed(2)}deg`);
      });
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className={`section section-contact${sparksOn ? ' ct-sparks-on' : ''}`}
      id="contact"
    >
      <span className="ghost-num" data-parallax="0.3" aria-hidden="true">
        03
      </span>

      <div className="ct-head">
        {/* CONTACT ME：TextPressure 压感动画（白填充 + 粉描边，鼠标驱动字重字宽） */}
        <div className="ct-pressure">
          <TextPressure
            text="CONTACT ME"
            textColor="#ffffff"
            strokeColor="#ff2d95"
            width
            weight
            italic={false}
            flex
            stroke
            minFontSize={28}
            maxFontSize={118}
          />
        </div>
        <p className="ct-sub">{lang === 'zh' ? '联 系 我' : 'GET IN TOUCH'}</p>
        {/* intro：Split Text + Stagger（字符错开时序入场，可重复触发） */}
        <SplitText
          className="ct-intro"
          text={t(c.intro)}
          delay={22}
          duration={0.85}
          ease="power3.out"
          from={{ opacity: 0, y: 26 }}
          to={{ opacity: 1, y: 0 }}
          tag="p"
          start="top 92%"
        />
      </div>

      {/* 悬浮墙场景：透视容器 + 星云光斑 */}
      <div className="ct-scene">
        <div className="ct-nebula" aria-hidden="true">
          <span className="ct-neb n1" />
          <span className="ct-neb n2" />
          <span className="ct-neb n3" />
        </div>

        <div className="ct-wall" ref={wallRef} data-reveal>
          {/* 背景画面：粉紫色球体海报 + 半透明黑遮罩，文字浮在上层保证可读 */}
          <img className="ct-wall-bg" src="/assets/contact/wall-bg.png" alt="" aria-hidden="true" />
          <div className="ct-wall-shade" aria-hidden="true" />
          <div className="ct-wall-inner">
            <div className="ct-col ct-col-brand">
              <span className="ct-brand">siqi.</span>
              <p>{t(c.cta)}</p>
            </div>
            <div className="ct-col">
              <h5>RESUME</h5>
              <a className="ct-link" href="/assets/resume/resume-cn.pdf" download="廖思淇-简历.pdf">
                {t(c.resumeCn)} ↓
              </a>
              <a className="ct-link" href="/assets/resume/resume-en.pdf" download="LIAO-SIQI-Resume.pdf">
                {t(c.resumeEn)} ↓
              </a>
            </div>
            <div className="ct-col">
              <h5>CONTACT</h5>
              <a className="ct-link big" href="tel:18381075675">
                183 8107 5675
              </a>
              <a className="ct-link big" href="mailto:siqi-888@outlook.com">
                siqi-888@outlook.com
              </a>
            </div>
          </div>
          <div className="ct-wall-shine" aria-hidden="true" />
        </div>

        <div className="ct-floor-glow" aria-hidden="true" />
      </div>

      {/* 漂浮星芒 */}
      <span className="ct-spark s1" data-parallax="0.22" aria-hidden="true">
        ✦
      </span>
      <span className="ct-spark s2" data-parallax="0.38" aria-hidden="true">
        ✦
      </span>
      <span className="ct-spark s3" data-parallax="0.14" aria-hidden="true">
        ✦
      </span>
      <span className="ct-spark s4" data-parallax="0.3" aria-hidden="true">
        ✦
      </span>
    </section>
  );
}
