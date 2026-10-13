import { useEffect, useRef, useState } from 'react';
import { useLang } from '../i18n.jsx';
import { content } from '../content.js';
import TextPressure from '../components/TextPressure.jsx';
import SplitText from '../components/SplitText.jsx';
import AboutStack from '../components/AboutStack.jsx';

// —— ABOUT ME 大标题：TextPressure 可变字体压感动画（素材 文本压力-about me.txt），
//    颜色取参考图粉色，黑底上附加霓虹光晕。——
function AmPressure() {
  return (
    <TextPressure
      text="ABOUT ME"
      textColor="#ff2d95"
      width
      weight
      italic={false}
      flex
      minFontSize={36}
      maxFontSize={190}
    />
  );
}

// —— 四角装饰（参考图 JOYO 四角贴纸原图裁剪，与参考图完全一致） ——
// 贴纸从参考图对应四角裁剪导出：public/assets/stickers/*.png
const STICKERS = [
  { src: '/assets/stickers/sticker-cloud.png', cls: 's-cloud', delay: '0s' },
  { src: '/assets/stickers/sticker-fairy.png', cls: 's-butterfly', delay: '0.15s' },
  { src: '/assets/stickers/sticker-unicorn.png', cls: 's-unicorn', delay: '0.3s' },
  { src: '/assets/stickers/sticker-rabbit.png', cls: 's-rabbit', delay: '0.45s' }
];

export default function AboutMe() {
  const { t } = useLang();
  const rootRef = useRef(null);
  const btnRef = useRef(null);
  const pupilL = useRef(null);
  const pupilR = useRef(null);

  // 眼睛跟随鼠标
  useEffect(() => {
    const R = 5;
    const onMove = e => {
      const btn = btnRef.current;
      if (!btn || !pupilL.current || !pupilR.current) return;
      const rect = btn.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const angle = Math.atan2(e.clientY - cy, e.clientX - cx);
      const x = Math.cos(angle) * R;
      const y = Math.sin(angle) * R;
      pupilL.current.style.transform = `translate(${x}px, ${y}px)`;
      pupilR.current.style.transform = `translate(${x}px, ${y}px)`;
    };
    const onLeave = () => {
      if (pupilL.current && pupilR.current) {
        pupilL.current.style.transform = 'translate(0, 0)';
        pupilR.current.style.transform = 'translate(0, 0)';
      }
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    document.documentElement.addEventListener('mouseleave', onLeave);
    return () => {
      window.removeEventListener('mousemove', onMove);
      document.documentElement.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  // 四角贴纸滚动渐显（可重复触发：每次进入视口重新错峰浮现）
  // 注意 threshold 不能过高：板块高度可能超过视口，交叠比例达不到阈值会导致回调永不触发
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const stickers = root.querySelectorAll('.am-sticker');
    const io = new IntersectionObserver(
      ([entry]) => {
        stickers.forEach(s => s.classList.toggle('visible', entry.isIntersecting));
      },
      { threshold: 0.12 }
    );
    io.observe(root);
    return () => io.disconnect();
  }, []);

  const [cardOpen, setCardOpen] = useState(false);

  return (
    <section className="aboutme" id="about" ref={rootRef} aria-label="About Me">
      <div className="am-pressure">
        <AmPressure />
      </div>

      <SplitText
        className="am-text"
        text={t(content.about.quote)}
        delay={40}
        duration={1.1}
        ease="power3.out"
        from={{ opacity: 0, y: 36 }}
        to={{ opacity: 1, y: 0 }}
        tag="p"
      />

      <button className="am-btn" ref={btnRef} onClick={() => setCardOpen(true)}>
        <span className="am-btn-text">ABOUT ME</span>
        <span className="am-eyes" aria-hidden="true">
          <span className="am-eye">
            <span className="am-pupil" ref={pupilL} />
          </span>
          <span className="am-eye">
            <span className="am-pupil" ref={pupilR} />
          </span>
        </span>
      </button>

      {STICKERS.map(s => (
        <div key={s.cls} className={`am-sticker ${s.cls}`} style={{ transitionDelay: s.delay }}>
          <img src={s.src} alt="" aria-hidden="true" draggable="false" />
        </div>
      ))}

      {cardOpen && <AboutStack onClose={() => setCardOpen(false)} />}
    </section>
  );
}
