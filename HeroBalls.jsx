import { useEffect, useRef } from 'react';

// 首屏海报风背景（Canvas 2D，素材 首屏背景.txt）：
// 纯黑底 + 超大白色粗体字母（半调网点质感、每行铺满全宽、裁切/重叠排版，静态背景层）
// + 2 个粉色渐变球体做物理弹性碰撞（球数恒为 2、半径固定、永不出画、能量不衰减）。
// 球体绘制在独立顶层画布（位于黑色遮罩之上、前景文字之下），保持参考图的鲜亮粉色。
// 无重力、无摩擦、无任何音频；requestAnimationFrame 驱动，devicePixelRatio 适配高清屏。
// 球体统一使用参考海报的粉球配色（中空高光质感）

export default function HeroBalls() {
  const bgRef = useRef(null);
  const ballRef = useRef(null);

  useEffect(() => {
    const bgCanvas = bgRef.current;
    const ballCanvas = ballRef.current;
    if (!bgCanvas || !ballCanvas) return undefined;
    const bgCtx = bgCanvas.getContext('2d');
    const ballCtx = ballCanvas.getContext('2d');
    if (!bgCtx || !ballCtx) return undefined;

    let raf = 0;
    let alive = true;
    let W = 0;
    let H = 0;
    let dpr = 1;

    // —— 海报文字层：黑底 + 超大白字 + 半调网点质感 ——
    const buildBackground = () => {
      const off = document.createElement('canvas');
      off.width = Math.max(1, Math.round(W * dpr));
      off.height = Math.max(1, Math.round(H * dpr));
      const o = off.getContext('2d');
      o.scale(dpr, dpr);

      // 文字排版：每行按测宽自适应字号，铺满并略超出整幅宽度（左右裁切），
      // 三行纵向交叠覆盖全部高度，海报式构图、中部不留任何空隙
      const rows = [
        { text: 'OPER', target: 1.08 * W, y: H * 0.32, tilt: -2.5 },
        { text: 'SiQi', target: 1.06 * W, y: H * 0.76, tilt: 2 },
        { text: 'RATE', target: 1.08 * W, y: H * 1.2, tilt: -1.2 }
      ];
      rows.forEach(r => {
        o.save();
        o.translate(W / 2, r.y);
        o.rotate((r.tilt * Math.PI) / 180);
        // 先用基准字号测宽，再按目标宽度等比缩放字号
        const probe = 100;
        o.font = `800 ${probe}px Archivo, 'Arial Black', 'Helvetica Neue', sans-serif`;
        const w0 = o.measureText(r.text).width || probe * r.text.length * 0.6;
        const size = (probe * r.target) / w0;
        o.font = `800 ${size}px Archivo, 'Arial Black', 'Helvetica Neue', sans-serif`;
        o.fillStyle = '#e3e3e3';
        o.textAlign = 'center';
        o.textBaseline = 'alphabetic';
        o.fillText(r.text, 0, 0);
        o.restore();
      });

      // 半调网点：网点图层铺满后用文字 alpha 抠出（destination-in），
      // 网点大小按对角渐变排布，复刻参考海报的圆点渐变质感
      const dots = document.createElement('canvas');
      dots.width = off.width;
      dots.height = off.height;
      const d = dots.getContext('2d');
      d.scale(dpr, dpr);
      d.fillStyle = '#ffffff';
      const step = Math.max(7, Math.round(Math.min(W, H) / 90));
      const diag = Math.sqrt(W * W + H * H);
      for (let y = step / 2; y < H; y += step) {
        for (let x = step / 2; x < W; x += step) {
          const t = Math.sqrt(x * x + y * y) / diag; // 左上→右下渐变
          const r = step * (0.52 - t * 0.4) * (0.85 + 0.3 * Math.sin(x * 0.021 + y * 0.017));
          if (r <= 0.35) continue;
          d.beginPath();
          d.arc(x, y, r, 0, Math.PI * 2);
          d.fill();
        }
      }
      d.globalCompositeOperation = 'destination-in';
      d.drawImage(off, 0, 0, W, H);

      // 黑底 + 半调网点白字 = 最终背景层，直接绘制到可见画布
      o.clearRect(0, 0, W, H);
      o.fillStyle = '#050505';
      o.fillRect(0, 0, W, H);
      o.drawImage(dots, 0, 0, W, H);

      bgCtx.clearRect(0, 0, W, H);
      bgCtx.drawImage(off, 0, 0, W, H);
    };

    // —— 球体状态：数量恒为 2，半径按画布比例固定 ——
    const balls = [
      { x: 0, y: 0, vx: 0, vy: 0, r: 0, squash: 0 },
      { x: 0, y: 0, vx: 0, vy: 0, r: 0, squash: 0 }
    ];
    let initialized = false;

    const initBalls = () => {
      const base = Math.min(W, H);
      balls.forEach((b, i) => {
        b.r = base * (i === 0 ? 0.17 : 0.15);
        // 初始位置对角分布，保证不重叠且完全在画布内
        b.x = W * (i === 0 ? 0.3 : 0.68);
        b.y = H * (i === 0 ? 0.34 : 0.66);
        const speed = base * 0.16; // 速度大小适中
        const a = (i === 0 ? 0.6 : 3.6) + i * 0.7;
        b.vx = Math.cos(a) * speed;
        b.vy = Math.sin(a) * speed;
        b.squash = 0;
      });
      initialized = true;
    };

    const resize = () => {
      const rect = bgCanvas.getBoundingClientRect();
      W = Math.max(1, rect.width);
      H = Math.max(1, rect.height);
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      [bgCanvas, ballCanvas].forEach(cv => {
        cv.width = Math.round(W * dpr);
        cv.height = Math.round(H * dpr);
      });
      bgCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ballCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildBackground();
      if (!initialized) initBalls();
      else {
        // 尺寸变化时把球夹回画布内，半径按新画布等比重设
        const base = Math.min(W, H);
        balls.forEach((b, i) => {
          b.r = base * (i === 0 ? 0.17 : 0.15);
          b.x = Math.min(Math.max(b.x, b.r), W - b.r);
          b.y = Math.min(Math.max(b.y, b.r), H - b.r);
        });
      }
      drawBalls();
    };

    const drawBalls = () => {
      ballCtx.clearRect(0, 0, W, H);
      balls.forEach(b => {
        // 轻微挤压形变（沿速度方向），碰撞瞬间最明显
        const ang = Math.atan2(b.vy, b.vx);
        const sq = b.squash;
        ballCtx.save();
        ballCtx.translate(b.x, b.y);
        ballCtx.rotate(ang);
        ballCtx.scale(1 + sq * 0.08, 1 - sq * 0.08);
        ballCtx.rotate(-ang);
        // 参考海报的「中空球」质感：高光核大而偏左上（占球体大半），
        // 中心接近白色，快速过渡到边缘的高饱和粉色环
        const hx = -b.r * 0.22;
        const hy = -b.r * 0.26;
        const g = ballCtx.createRadialGradient(hx, hy, b.r * 0.06, hx, hy, b.r * 1.16);
        g.addColorStop(0, '#ffffff');
        g.addColorStop(0.34, '#ffe4f3');
        g.addColorStop(0.58, '#ff9ed2');
        g.addColorStop(0.76, '#ff43a8');
        g.addColorStop(0.9, '#e4007c');
        g.addColorStop(1, '#b8005f');
        ballCtx.beginPath();
        ballCtx.arc(0, 0, b.r, 0, Math.PI * 2);
        ballCtx.fillStyle = g;
        ballCtx.fill();
        // 边缘微光
        ballCtx.beginPath();
        ballCtx.arc(0, 0, b.r, 0, Math.PI * 2);
        ballCtx.strokeStyle = 'rgba(255, 60, 176, 0.35)';
        ballCtx.lineWidth = 2;
        ballCtx.stroke();
        ballCtx.restore();
      });
    };

    const step = () => {
      if (!alive) return;
      // dt 固定按 60fps 步进：匀速运动、能量不衰减，浏览器节流时也不会加速失控
      const dt = 1 / 60;
      const damp = 0.9; // 挤压形变回弹衰减

      balls.forEach(b => {
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        // 边界反弹（圆心 + 半径始终留在画布内）
        if (b.x - b.r < 0) {
          b.x = b.r;
          b.vx = Math.abs(b.vx);
          b.squash = 1;
        } else if (b.x + b.r > W) {
          b.x = W - b.r;
          b.vx = -Math.abs(b.vx);
          b.squash = 1;
        }
        if (b.y - b.r < 0) {
          b.y = b.r;
          b.vy = Math.abs(b.vy);
          b.squash = 1;
        } else if (b.y + b.r > H) {
          b.y = H - b.r;
          b.vy = -Math.abs(b.vy);
          b.squash = 1;
        }
        b.squash *= damp;
      });

      // 两球弹性碰撞：沿法向交换速度分量（等质量），切向分量保留
      const [a, b] = balls;
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.hypot(dx, dy) || 0.0001;
      const overlap = a.r + b.r - dist;
      if (overlap > 0) {
        const nx = dx / dist;
        const ny = dy / dist;
        // 位置校正：把两球推开到刚好接触，杜绝粘连
        a.x -= nx * overlap * 0.5;
        a.y -= ny * overlap * 0.5;
        b.x += nx * overlap * 0.5;
        b.y += ny * overlap * 0.5;
        const van = a.vx * nx + a.vy * ny;
        const vbn = b.vx * nx + b.vy * ny;
        if (van - vbn > 0) {
          const dvn = van - vbn;
          a.vx -= dvn * nx;
          a.vy -= dvn * ny;
          b.vx += dvn * nx;
          b.vy += dvn * ny;
          a.squash = 1;
          b.squash = 1;
        }
      }

      drawBalls();
      raf = requestAnimationFrame(step);
    };

    const ro = new ResizeObserver(resize);
    ro.observe(bgCanvas);
    resize();
    raf = requestAnimationFrame(step);

    // 页面不可见时暂停动画，回到前台自动恢复（时间基于帧步进，不会跳变）
    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf);
        raf = 0;
      } else if (!raf && alive) {
        raf = requestAnimationFrame(step);
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return (
    <>
      <canvas ref={bgRef} className="hero-canvas" aria-hidden="true" />
      {/* 球体层：位于黑色遮罩之上、前景文字之下，保持鲜亮粉色 */}
      <canvas ref={ballRef} className="hero-canvas hero-canvas-balls" aria-hidden="true" />
    </>
  );
}
