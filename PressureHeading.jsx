import TextPressure from './TextPressure.jsx';

// 区块大标题：TextPressure 可变字体压感效果（鼠标靠近处字重/字宽变大），
// 黑色，保留滚动入场（data-reveal 由 App 统一驱动，可重复触发）。
export default function PressureHeading({ text, sub }) {
  return (
    <div className="section-heading pressure-heading" data-reveal>
      <div className="pressure-box">
        <TextPressure text={text} textColor="#1a1917" width weight italic={false} flex minFontSize={36} maxFontSize={140} />
      </div>
      {sub && <span className="zh">{sub}</span>}
    </div>
  );
}
