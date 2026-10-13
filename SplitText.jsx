import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// 素材 分割文本.txt（SplitText）的自研实现：
// 不依赖 GSAP 付费 SplitText 插件，手动按「单词 > 字符」两级切分（避免单词内断行），
// 字符从 { opacity: 0, y: 40 } 依次入场（stagger = delay）。
// 遵循全站可重复触发约定：toggleActions 'restart reset restart reset'，每次滚入都重播。
const SplitText = ({
  text,
  className = '',
  delay = 50,
  duration = 1.25,
  ease = 'power3.out',
  from = { opacity: 0, y: 40 },
  to = { opacity: 1, y: 0 },
  start = 'top 85%',
  tag = 'p',
  textAlign = 'center'
}) => {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !text) return undefined;

    const words = el.querySelectorAll('.st-word');
    const chars = el.querySelectorAll('.st-char');
    // paused：由 ScrollTrigger 的 toggleActions 接管播放/复位（可重复触发）
    const tween = gsap.fromTo(chars, { ...from }, { ...to, duration, ease, stagger: delay / 1000, paused: true });
    const trigger = ScrollTrigger.create({
      trigger: el,
      start,
      toggleActions: 'restart reset restart reset',
      animation: tween
    });
    // words 仅用于布局断行，动画作用在字符上
    void words;

    return () => {
      trigger.kill();
      tween.kill();
      gsap.set(chars, { clearProps: 'all' });
    };
  }, [text, delay, duration, ease, start]);

  const Tag = tag;
  const words = String(text).split(/(\s+)/); // 保留空白，维持原空格
  // 中文/全角字符：整句无空格，若包进 nowrap 的 st-word 会导致整段无法换行溢出。
  // CJK 逐字直接排版（中文允许任意断行），英文单词仍按「词 > 字符」两级切分避免词内断行。
  const isCJK = /[\u2e80-\u9fff\u3000-\u303f\uff00-\uffef\u2014\u2018-\u201d\u2026]/;

  return (
    <Tag ref={ref} className={`split-parent ${className}`.trim()} style={{ textAlign }}>
      {words.map((word, wi) =>
        /^\s+$/.test(word) ? (
          <span key={wi}>{' '}</span>
        ) : isCJK.test(word) ? (
          <span key={wi} style={{ display: 'inline' }}>
            {[...word].map((ch, ci) => (
              <span className="st-char" key={ci} style={{ display: 'inline-block', willChange: 'transform, opacity' }}>
                {ch}
              </span>
            ))}
          </span>
        ) : (
          <span className="st-word" key={wi} style={{ display: 'inline-block', whiteSpace: 'nowrap' }}>
            {[...word].map((ch, ci) => (
              <span className="st-char" key={ci} style={{ display: 'inline-block', willChange: 'transform, opacity' }}>
                {ch}
              </span>
            ))}
          </span>
        )
      )}
    </Tag>
  );
};

export default SplitText;
