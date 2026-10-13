import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';
import { useLang } from '../i18n.jsx';
import { content } from '../content.js';
import ScrollStack, { ScrollStackItem } from './ScrollStack.jsx';

// —— 卡片导航式手风琴（素材 卡片导航.txt 的 GSAP 动画移植）：
// 点击条目 → 容器高度 power3.out 弹开 + 成果行 {y:50,opacity:0}→{y:0,opacity:1} 错峰上浮，
// 与 CardNav 展开导航卡片的手感一致；单开模式，展开后再点收起。 ——
function WorkAccordion({ items }) {
  const { t } = useLang();
  const [openIdx, setOpenIdx] = useState(-1);
  const bodiesRef = useRef([]);
  const listsRef = useRef([]);

  const toggleItem = i => {
    const closing = openIdx === i;
    // 收起当前展开项
    if (openIdx >= 0 && bodiesRef.current[openIdx]) {
      gsap.to(bodiesRef.current[openIdx], { height: 0, opacity: 0, duration: 0.42, ease: 'power3.inOut' });
    }
    const next = closing ? -1 : i;
    setOpenIdx(next);
    if (!closing) {
      const body = bodiesRef.current[i];
      const rows = listsRef.current[i]?.querySelectorAll('.wx-point');
      if (body) gsap.to(body, { height: 'auto', opacity: 1, duration: 0.55, ease: 'power3.out' });
      if (rows?.length) {
        gsap.fromTo(
          rows,
          { y: 26, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out', stagger: 0.09, delay: 0.1, overwrite: 'auto' }
        );
      }
    }
  };

  return (
    <div className="wx-accordion">
      {items.map((item, i) => (
        <div className={`wx-item ${openIdx === i ? 'open' : ''}`} key={i}>
          <button
            type="button"
            className="wx-head"
            onClick={() => toggleItem(i)}
            aria-expanded={openIdx === i}
          >
            <span className="wx-title">{t(item.title)}</span>
            <span className="wx-arrow" aria-hidden="true">
              ▾
            </span>
          </button>
          <div className="wx-body" ref={el => (bodiesRef.current[i] = el)}>
            <ul className="wx-points" ref={el => (listsRef.current[i] = el)}>
              {item.points.map((p, j) => (
                <li className="wx-point" key={j}>
                  {t(p)}
                </li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </div>
  );
}

// ABOUT ME 点击后的衔接画面（素材 About详情页5张卷轴堆叠卡片提示词.txt）：
// ScrollStack 5 张卡片直接堆叠在深色背景（#0A0A0A + 紫色玫红渐变氛围）上，
// 无任何外框包裹；滚动时逐层收拢堆叠，后面的卡片轻微缩小并轻度模糊。
// 内容全部走 content.aboutStack 双语文案，跟随全站语言切换。
// 无任何小字操作提示；关闭方式：ESC / 点击右上角关闭点。

export default function AboutStack({ onClose }) {
  const overlayRef = useRef(null);
  // 注意：lang / toggle 必须解构——此前只取 t，JSX 里引用 toggle/lang 直接 ReferenceError，
  // 整个弹窗组件崩溃（表现为点击 ABOUT ME 按钮毫无反应）
  const { lang, toggle, t } = useLang();
  const cards = content.aboutStack.cards;

  useEffect(() => {
    gsap.fromTo(
      overlayRef.current,
      { opacity: 0, scale: 1.04 },
      { opacity: 1, scale: 1, duration: 0.55, ease: 'power3.out' }
    );
    const onKey = e => e.key === 'Escape' && close();
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const close = () => {
    gsap.to(overlayRef.current, { opacity: 0, duration: 0.3, ease: 'power2.in', onComplete: onClose });
  };

  return createPortal(
    <div className="ab-overlay" ref={overlayRef} role="dialog" aria-modal="true" aria-label="About me">
      <div className="ab-topbar">
        {/* 覆盖层自带中英切换（盖住了导航，需要独立入口） */}
        <button className="ab-lang" onClick={toggle} aria-label="Switch language">
          {lang === 'zh' ? 'EN' : '中'}
        </button>
        <button className="ab-close" onClick={close} aria-label="Close">
          ✕
        </button>
      </div>
      {/* stackPosition 14%：卡片钉住点上移，配合卡片高度适配视口，
          保证任何卡片（含展开手风琴后）的底部都不会被下一张卡永久盖住 */}
      <ScrollStack
        className="ab-stack"
        itemDistance={90}
        baseScale={0.86}
        itemStackDistance={26}
        stackPosition="14%"
        blurAmount={2}
      >
        {cards.map((card, i) => (
          <ScrollStackItem itemClassName={`ab-card ${card.items ? 'wx-card' : ''}`} key={i}>
            <span className="ab-tag">{t(card.tag)}</span>
            {card.lead && <p className="ab-lead">{t(card.lead)}</p>}
            {card.quote && <p className="ab-quote">{t(card.quote)}</p>}
            {card.items && <WorkAccordion items={card.items} />}
            {card.list && (
              <ul className="ab-list">
                {card.list.map((it, j) => (
                  <li key={j}>
                    <b>{t(it.k)}</b>
                    <span>{t(it.v)}</span>
                  </li>
                ))}
              </ul>
            )}
            {card.skills && (
              <div className="ab-skills">
                {card.skills.map((s, j) => (
                  <span className="ab-skill" key={j}>
                    <i>{s.short}</i>
                    {t(s.name)}
                  </span>
                ))}
              </div>
            )}
          </ScrollStackItem>
        ))}
      </ScrollStack>
    </div>,
    document.body
  );
}
