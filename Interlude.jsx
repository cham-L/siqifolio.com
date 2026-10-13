import { useEffect, useRef, useState } from 'react';
import ParticleText from '../components/ParticleText.jsx';
import WebThreads from '../components/WebThreads.jsx';

// 间页：纯黑背景 + 两行粒子汇聚文字（分行展示，字号加大，页面高度加高）。
// 固定英文，不参与中英切换。进入视口时挂载（离开卸载），每次进入都会重播汇聚动画。
// 粒子文字动画播放完后，「网络线程」WebThreads 渐显在文字下方（配色与文字一致：白→粉）；
// 元素离开视口即卸载复位，再次进入时整套动画完整重放。
const THREADS_DELAY = 2400; // 粒子汇聚完成时长 ≈ stagger 上限 380ms + gatherDuration 1700ms + 余量

export default function Interlude() {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  const [threadsOn, setThreadsOn] = useState(false);

  useEffect(() => {
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.3 });
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);

  // 粒子文字汇聚完成后再渐显 WebThreads；离开视口立即复位，重进完整重放
  useEffect(() => {
    if (!inView) {
      setThreadsOn(false);
      return undefined;
    }
    const timer = window.setTimeout(() => setThreadsOn(true), THREADS_DELAY);
    return () => window.clearTimeout(timer);
  }, [inView]);

  return (
    <section className="interlude" ref={ref}>
      {inView && (
        <div className="interlude-lines">
          <ParticleText
            text="Heard is the start."
            particleSize={2.4}
            density={4}
            color="#f8fafc"
            highlightColor="#ff2d95"
            scatter={210}
            gatherDuration={1700}
            stagger={380}
            pointerRepel={48}
            repelRadius={130}
            idleDrift={0.9}
            trigger="mount"
            fontSize="clamp(2.4rem, 7vw, 6rem)"
            fontWeight={800}
            fontFamily="inherit"
            glow
          />

          {/* 网络线程：夹在两行文字中间、左右通铺至屏幕两侧（无边界），粒子文字动画播完后渐显
              speed 提升至 0.85（原素材 0.2 的相位推进约 31s/周期，肉眼近似静止），
              开启 shimmer 让每根线束额外错峰起伏，动效清晰可见 */}
          <div className={`interlude-threads ${threadsOn ? 'on' : ''}`} aria-hidden="true">
            <WebThreads
              color1="#ffffff"
              color2="#ff2d95"
              color3="#ffffff"
              speed={0.85}
              threadCount={6}
              frequency={5}
              spread={0.18}
              taper={0.35}
              position={0.5}
              fanMode="center"
              glow={0.012}
              falloff={1.1}
              thickness={0.5}
              brightness={0.8}
              opacity={1}
              mirror
              shimmer
              grain
              grainIntensity={0.05}
              mouseInteraction
              mouseStrength={0.45}
            />
          </div>

          <ParticleText
            text="Shared is the goal."
            particleSize={2.4}
            density={4}
            color="#f8fafc"
            highlightColor="#ff2d95"
            scatter={210}
            gatherDuration={1700}
            stagger={380}
            pointerRepel={48}
            repelRadius={130}
            idleDrift={0.9}
            trigger="mount"
            fontSize="clamp(2.4rem, 7vw, 6rem)"
            fontWeight={800}
            fontFamily="inherit"
            glow
          />
        </div>
      )}
    </section>
  );
}
