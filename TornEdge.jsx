// 撕纸过渡（素材 黑白页面撕纸过渡修正提示词.txt）：
// 白色纸面下边缘 = 用力撕开的尖锐锯齿纸边，直接露出下方纯黑区块，
// 黑白两色在裂口处直接相接，没有任何灰色渐变/模糊缓冲。
// 锯齿起伏 40-100px、点密集、有尖有钝，带细碎纸纤维缺口；
// 仅 1-2px 极淡内侧阴影提供纸缘厚度，不用 filter: blur / 渐变。
// 填充从视口上方 y=-90 开始延伸，重叠 Hero 底部，无接缝。

// 伪随机锯齿：种子固定保证每次渲染形状一致
// 注意：MAIN 与 FIBER 必须使用不同种子——种子相同会让纤维层成为主缘的
// 等距白色副本，远看就是一条贯穿整页的 2px 白线（曾被误认为板块接缝）
const tearPath = (seedInit) => {
  let seed = seedInit;
  const rnd = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
  // 注意：起点必须带完整坐标 L0,58，写成 'L0,' 会导致路径解析失败、锯齿整条不渲染
  let d = 'M0,-90 L0,58';
  let x = 0;
  let y = 58;
  while (x < 1440) {
    const step = 7 + Math.floor(rnd() * 22); // 点间距 7-29px，密集
    x = Math.min(1440, x + step);
    // 高低落差 40-100px：基准 58 上下波动
    y = 40 + rnd() * 60 + (rnd() > 0.86 ? 18 : 0); // 少数点更深（裂口）
    d += ` L${x},${y.toFixed(1)}`;
  }
  d += ' L1440,-90 Z';
  return d;
};

const MAIN = tearPath(20261010);
const FIBER = tearPath(7765311); // 纤维连丝层：独立种子，与主缘错开的细碎短齿

export default function TornEdge() {
  // 注意：不加 data-reveal —— 入场动画的 translateY 位移会让撕纸层
  // 与下方 AboutMe 黑区之间露出 1px 白线（body 白底透出），破坏滚动流畅感
  return (
    <div className="torn-edge" aria-hidden="true">
      <svg viewBox="0 0 1440 150" preserveAspectRatio="none">
        {/* 1-2px 深色内阴影层：比主缘低 2px 的深灰细线，模拟纸缘厚度（非渐变） */}
        <path fill="#3a3a3a" transform="translate(0,2.2)" d={MAIN} />
        {/* 纸纤维连丝层：细碎短齿从主缘伸出，颜色纯白，形成毛边缺口 */}
        <path fill="#ffffff" transform="translate(0,5)" d={FIBER} />
        {/* 主纸面：纯白，尖锐锯齿下缘 */}
        <path fill="#ffffff" d={MAIN} />
      </svg>
    </div>
  );
}
