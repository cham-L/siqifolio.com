import { useState, useRef, useEffect } from 'react';
import { useLang } from '../i18n.jsx';
import { content } from '../content.js';
import Lanyard from '../components/Lanyard.jsx';

// 玻璃拟态悬浮胶囊导航（JOYO 样式）：深色磨砂胶囊 fixed 顶部，
// logo "siqi." 白色圆润发光字体；三个板块名 + 同级的第 4 个标题 "CLICK"，
// 点击 CLICK 弹出 3D 挂绳工牌（联系方式卡片），再点缩回。

// 挂绳卡片背面：个人形象照 + 底部深色渐变遮罩 + 联系方式（canvas 合成）
// 兜底：照片未就绪时使用纯联系卡 SVG
const fallbackBackImage = (() => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="900">
  <rect width="640" height="900" fill="#111111"/>
  <text x="320" y="270" font-family="Arial, sans-serif" font-size="64" font-weight="700" fill="#ffffff" text-anchor="middle" letter-spacing="4">siqi.</text>
  <line x1="140" y1="330" x2="500" y2="330" stroke="#ffffff" stroke-width="2" opacity="0.5"/>
  <text x="320" y="450" font-family="Arial, sans-serif" font-size="34" fill="#ffffff" text-anchor="middle" letter-spacing="6">PHONE</text>
  <text x="320" y="510" font-family="Arial, sans-serif" font-size="44" font-weight="600" fill="#ffffff" text-anchor="middle">18381075675</text>
  <text x="320" y="610" font-family="Arial, sans-serif" font-size="34" fill="#ffffff" text-anchor="middle" letter-spacing="6">EMAIL</text>
  <text x="320" y="670" font-family="Arial, sans-serif" font-size="38" font-weight="600" fill="#ffffff" text-anchor="middle">siqi-888@outlook.com</text>
  <text x="320" y="800" font-family="Arial, sans-serif" font-size="26" fill="#ffffff" text-anchor="middle" opacity="0.6" letter-spacing="8">CONTACT ME</text>
</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
})();

// 合成背面：上部形象照完整呈现，下部压暗渐变承载联系方式
const buildPortraitBackImage = () =>
  new Promise(resolve => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const W = 640;
        const H = 900;
        const canvas = document.createElement('canvas');
        canvas.width = W;
        canvas.height = H;
        const ctx = canvas.getContext('2d');
        // 形象照 cover 铺满整卡
        const scale = Math.max(W / img.naturalWidth, H / img.naturalHeight);
        const dw = img.naturalWidth * scale;
        const dh = img.naturalHeight * scale;
        ctx.drawImage(img, (W - dw) / 2, (H - dh) / 2 - 30, dw, dh);
        // 底部渐变遮罩：保证白字可读，上部保持照片原貌
        const grad = ctx.createLinearGradient(0, H * 0.42, 0, H);
        grad.addColorStop(0, 'rgba(10, 10, 12, 0)');
        grad.addColorStop(0.55, 'rgba(10, 10, 12, 0.72)');
        grad.addColorStop(1, 'rgba(10, 10, 12, 0.92)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);
        // 联系方式文字
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.font = '700 58px Arial, sans-serif';
        ctx.fillText('siqi.', W / 2, H * 0.585);
        ctx.font = '300 24px Arial, sans-serif';
        ctx.globalAlpha = 0.85;
        ctx.fillText('P H O N E', W / 2, H * 0.685);
        ctx.globalAlpha = 1;
        ctx.font = '600 40px Arial, sans-serif';
        ctx.fillText('183 8107 5675', W / 2, H * 0.745);
        ctx.font = '300 24px Arial, sans-serif';
        ctx.globalAlpha = 0.85;
        ctx.fillText('E M A I L', W / 2, H * 0.825);
        ctx.globalAlpha = 1;
        ctx.font = '600 34px Arial, sans-serif';
        ctx.fillText('siqi-888@outlook.com', W / 2, H * 0.88);
        ctx.font = '300 22px Arial, sans-serif';
        ctx.globalAlpha = 0.6;
        ctx.fillText('C O N T A C T   M E', W / 2, H * 0.955);
        resolve(canvas.toDataURL('image/jpeg', 0.92));
      } catch {
        resolve(fallbackBackImage);
      }
    };
    img.onerror = () => resolve(fallbackBackImage);
    img.src = '/assets/lanyard/portrait-back.jpg';
  });

export default function Nav() {
  const { lang, toggle, t } = useLang();
  // lanyard: null 关闭 / { anchorX, closing? } —— closing 时播放向上缩回动画后再卸载
  const [lanyard, setLanyard] = useState(null);
  const [backImage, setBackImage] = useState(fallbackBackImage);
  const toggleRef = useRef(null);
  const thumbRef = useRef(null);
  const lanyardBusyRef = useRef(false);

  // 预合成形象照背面
  useEffect(() => {
    let alive = true;
    buildPortraitBackImage().then(url => alive && setBackImage(url));
    return () => {
      alive = false;
    };
  }, []);

  // 语言切换滑块跟随
  useEffect(() => {
    const root = toggleRef.current;
    const thumb = thumbRef.current;
    if (!root || !thumb) return;
    const active = root.querySelector('span.active');
    if (active) {
      thumb.style.left = `${active.offsetLeft}px`;
      thumb.style.width = `${active.offsetWidth}px`;
    }
  }, [lang]);

  const items = [
    { label: t(content.nav.about), href: '#about' },
    { label: t(content.nav.works), href: '#works' },
    { label: t(content.nav.contact), href: '#contact' }
  ];

  const jump = (e, href) => {
    e.preventDefault();
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
  };

  const toggleLanyard = e => {
    e.stopPropagation();
    // 动画（掉落/缩回）播放期间禁用点击，避免重复触发
    if (lanyardBusyRef.current) return;
    if (lanyard) {
      // 收回：向上缩回 0.7s ease-in，动画结束后再卸载
      lanyardBusyRef.current = true;
      setLanyard({ ...lanyard, closing: true });
      setTimeout(() => {
        setLanyard(null);
        lanyardBusyRef.current = false;
      }, 720);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.min(Math.max(rect.left + rect.width / 2, 210), window.innerWidth - 210);
    setLanyard({ anchorX: x });
  };

  // ESC 关闭挂绳
  useEffect(() => {
    if (!lanyard) return;
    const onKey = e => e.key === 'Escape' && setLanyard(null);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lanyard]);

  return (
    <header className="nav">
      <div className="nav-pill">
        <a
          className="nav-logo"
          href="#top"
          onClick={e => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          aria-label="siqi"
        >
          <span className="lg l1">s</span>
          <span className="lg l2">i</span>
          <span className="lg l3">q</span>
          <span className="lg l4">i</span>
          <span className="nav-logo-dot">.</span>
        </a>

        <nav className="nav-menu" aria-label="Primary">
          {items.map(item => (
            <a className="nav-link" key={item.href} href={item.href} onClick={e => jump(e, item.href)}>
              {item.label}
            </a>
          ))}
          {/* 第 4 个同级标题：CLICK/点击 —— 点击弹出/缩回挂绳工牌（随全站中英切换） */}
          <button
            className={`nav-link nav-click ${lanyard ? 'on' : ''}`}
            onClick={toggleLanyard}
            aria-expanded={!!lanyard}
            aria-label="Lanyard contact card"
          >
            {t(content.nav.click)}
          </button>
        </nav>

        <button ref={toggleRef} className="lang-toggle" onClick={toggle} aria-label="Switch language">
          <span ref={thumbRef} className="thumb" aria-hidden="true" />
          <span className={lang === 'en' ? 'active' : ''}>EN</span>
          <span className={lang === 'zh' ? 'active' : ''}>中</span>
        </button>
      </div>

      {lanyard && (
        <div
          className={`lanyard-pop ${lanyard.closing ? 'closing' : ''}`}
          style={{ left: lanyard.anchorX }}
          aria-hidden="false"
        >
          <Lanyard
            frontImage="/assets/lanyard/person.jpg"
            backImage={backImage}
            imageFit="cover"
            cardColor="#ffffff"
            orientation="portrait"
            finish="glossy"
            cornerRadius={0.3}
            size={0.62}
            anchor="center"
            strapLength={0.5}
            strapColor="#1A1A1A"
            strapWidth={0.65}
            metal="silver"
            gravity={1}
            damping={0.5}
            elasticity={0.5}
            breeze={0.5}
            interactive
            intro
          />
        </div>
      )}
    </header>
  );
}
