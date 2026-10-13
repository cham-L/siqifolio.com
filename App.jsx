import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Nav from './sections/Nav.jsx';
import Hero from './sections/Hero.jsx';
import AboutMe from './sections/AboutMe.jsx';
import Interlude from './sections/Interlude.jsx';
import Works from './sections/Works.jsx';
import Contact from './sections/Contact.jsx';
import PaperWorld from './components/PaperWorld.jsx';
import Preloader from './components/Preloader.jsx';
import { useLang } from './i18n.jsx';
import { content } from './content.js';

gsap.registerPlugin(ScrollTrigger);

export default function App() {
  const { lang, t } = useLang();

  useEffect(() => {
    // 语言切换时正文轻微回弹提示内容已切换
    gsap.fromTo('main', { opacity: 0.3, y: 10 }, { opacity: 1, y: 0, duration: 0.7, ease: 'back.out(1.6)' });
  }, [lang]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // 通用元素：弹簧上浮进入（不触碰 rotation，保留散落布局的静态倾斜）
      // 可重复触发：进入视口重播，离开视口复位隐藏
      gsap.utils.toArray('[data-reveal]').forEach(el => {
        gsap.fromTo(
          el,
          { y: 56, opacity: 0, scale: 0.96 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 1.15,
            ease: 'back.out(1.5)',
            scrollTrigger: { trigger: el, start: 'top 90%', toggleActions: 'restart reset restart reset' }
          }
        );
      });

      // 组内元素：stagger 交错 + 弹簧（保留各自的 CSS 静态旋转）
      gsap.utils.toArray('[data-stagger]').forEach(group => {
        gsap.fromTo(
          group.children,
          { y: 60, opacity: 0, scale: 0.9 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 1.05,
            stagger: 0.11,
            ease: 'back.out(1.7)',
            scrollTrigger: { trigger: group, start: 'top 86%', toggleActions: 'restart reset restart reset' }
          }
        );
      });

      // 主旨句逐词弹簧浮现
      const quote = document.querySelector('[data-quote]');
      if (quote) {
        gsap.fromTo(
          quote.querySelectorAll('.word'),
          { y: 30, opacity: 0, rotateX: -50 },
          {
            y: 0,
            opacity: 1,
            rotateX: 0,
            duration: 1,
            stagger: 0.09,
            ease: 'back.out(2)',
            scrollTrigger: { trigger: quote, start: 'top 84%', toggleActions: 'restart reset restart reset' }
          }
        );
      }

      // 大标题 3D 视差：上移 + 轻微 rotateX 翻转，滚动时产生纵深倾斜
      gsap.utils.toArray('.section-heading').forEach(h => {
        gsap.fromTo(
          h,
          { yPercent: 6, rotateX: -5, transformPerspective: 900 },
          {
            yPercent: -7,
            rotateX: 5,
            ease: 'none',
            transformOrigin: 'center center',
            scrollTrigger: { trigger: h, start: 'top bottom', end: 'bottom top', scrub: 0.6 }
          }
        );
      });

      // 全站 3D 视差：data-parallax 元素按速度分层纵深位移 + rotateX
      // 速度越大滚动时位移越明显，形成近快远慢的立体层次
      gsap.utils.toArray('[data-parallax]').forEach(el => {
        const speed = parseFloat(el.dataset.parallax) || 0.2;
        gsap.fromTo(
          el,
          { yPercent: speed * 24, rotateX: speed * 8, transformPerspective: 900 },
          {
            yPercent: speed * -24,
            rotateX: speed * -8,
            ease: 'none',
            transformOrigin: 'center center',
            scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 0.8 }
          }
        );
      });
    });
    return () => ctx.revert();
  }, []);

  return (
    <>
      <Preloader />
      <PaperWorld />
      <div className="paper-grain" aria-hidden="true" />
      <Nav />
      <main>
        <Hero />
        {/* 首屏与 ABOUT ME 均为黑底，直接衔接，过渡自然（原白色撕边/渐变过渡带已移除） */}
        <AboutMe />
        <Interlude />
        {/* creations 与 contact me 板块：纯白画面背景（遮住 3D 纸张世界与纸纹） */}
        <div className="plain-zone">
          <Works />
          <Contact />
        </div>
      </main>
      <footer className="footer">
        <span>{t(content.footer.text)}</span>
        <span>React · Vite · GSAP · Three.js</span>
      </footer>
    </>
  );
}
