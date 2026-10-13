import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// 切割滚动入场大标题：每个字母被独立切片包裹，
// 滚动进入视口前保持隐藏，触发后逐字母弹簧浮现，只播放一次。
export default function SplitHeading({ text, sub }) {
  const ref = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // fromTo 立即渲染初始隐藏态（yPercent 115），滚动到视口后逐字母弹簧浮现。
      // 可重复触发：每次进入视口重播，离开视口复位隐藏（不提前显示）
      gsap.fromTo(
        ref.current.querySelectorAll('.sh-inner'),
        { yPercent: 115 },
        {
          yPercent: 0,
          duration: 0.9,
          stagger: 0.045,
          ease: 'back.out(1.7)',
          scrollTrigger: { trigger: ref.current, start: 'top 86%', toggleActions: 'restart reset restart reset' }
        }
      );
      const zh = ref.current.querySelector('.zh');
      if (zh) {
        gsap.fromTo(
          zh,
          { opacity: 0, y: 12 },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            delay: 0.4,
            ease: 'power2.out',
            scrollTrigger: { trigger: ref.current, start: 'top 86%', toggleActions: 'restart reset restart reset' }
          }
        );
      }
    }, ref);
    return () => ctx.revert();
  }, [text]);

  return (
    <h2 className="section-heading" ref={ref}>
      {Array.from(text).map((ch, i) => (
        <span className="sh-slice" key={i} aria-hidden="true">
          <span className="sh-inner">{ch === ' ' ? '\u00A0' : ch}</span>
        </span>
      ))}
      <span className="sr-only">{text}</span>
      {sub && <span className="zh">{sub}</span>}
    </h2>
  );
}
