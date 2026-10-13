import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';
import { useLang } from '../i18n.jsx';
import { content } from '../content.js';

const PINK = '#ff2d95';
// 碎纸颜色：白 + 深浅不一的灰（纸的正反面），偶见文件夹板灰与粉色
const STRIP_COLORS = ['#ffffff', '#f4f4f4', '#ececf0', '#e0e0e6', '#d8d8de', '#ffffff', '#f0f0f0', '#ffd9ea'];

// 个人资料卡弹窗：文件夹板 + 简历纸 + 会员卡拼贴。
// 退出为五阶段：点击关闭 → 揉皱成纸团(0.6s) → 纸团可拖动 → 松开搅碎成纸条(0.5s) → 碎片消散(1.2s)。
export default function ProfileCard({ onClose }) {
  const { t } = useLang();
  const pc = content.profileCard;
  const overlayRef = useRef(null);
  const cardRef = useRef(null);
  const innerRef = useRef(null);
  const wrinkleRef = useRef(null);
  const stageRef = useRef(null);
  // phase: enter → open → crumpling → ball → shredding → gone
  const [phase, setPhase] = useState('enter');
  const [strips, setStrips] = useState(null);
  const drag = useRef({ active: false, startX: 0, startY: 0, x: 0, y: 0, moved: false });
  const closingRef = useRef(false);

  // 入场 + 滚动锁定 + ESC
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: 'power2.out' });
    gsap.fromTo(
      cardRef.current,
      { y: 60, scale: 0.85, opacity: 0 },
      { y: 0, scale: 1, opacity: 1, duration: 0.45, ease: 'power3.out', onComplete: () => setPhase('open') }
    );
    const onKey = e => e.key === 'Escape' && startCrumple();
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 阶段二：揉皱成纸团（0.6s，扭曲抖动 + 褶皱浮现 + 内容淡出）
  const startCrumple = useCallback(() => {
    if (closingRef.current || phase === 'crumpling' || phase === 'ball' || phase === 'shredding') return;
    closingRef.current = true;
    setPhase('crumpling');
    const card = cardRef.current;
    gsap.to(innerRef.current, { opacity: 0, duration: 0.32, ease: 'power1.in' });
    gsap.to(wrinkleRef.current, { opacity: 1, duration: 0.45, ease: 'power1.in' });
    gsap
      .timeline({ onComplete: () => setPhase('ball') })
      .to(card, { scale: 0.72, rotation: -4, skewX: 3, duration: 0.2, ease: 'power2.in' })
      .to(card, { scale: 0.5, rotation: 5, skewX: -4, skewY: 2, duration: 0.18, ease: 'power1.inOut' })
      .to(card, { scale: 0.3, rotation: -7, skewX: 2, duration: 0.12, ease: 'power1.inOut' })
      .to(card, { scale: 0.19, rotation: 9, skewX: 0, skewY: 0, duration: 0.1, ease: 'power2.out' });
  }, [phase]);

  // 阶段四/五：松开后搅碎成纸条，随后消散
  const shred = useCallback(() => {
    setPhase('shredding');
    const stage = stageRef.current;
    const card = cardRef.current;
    const stageRect = stage.getBoundingClientRect();
    const rect = card.getBoundingClientRect();
    const cx = rect.left - stageRect.left + rect.width / 2;
    const cy = rect.top - stageRect.top + rect.height / 2;

    // 生成 16 条宽窄不一的纸条碎片
    const list = Array.from({ length: 16 }, (_, i) => {
      const angle = Math.random() * Math.PI * 2;
      const speed = 90 + Math.random() * 210;
      return {
        id: i,
        x: cx,
        y: cy,
        w: 5 + Math.random() * 11,
        h: 46 + Math.random() * 74,
        color: STRIP_COLORS[Math.floor(Math.random() * STRIP_COLORS.length)],
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 70,
        rot: (Math.random() - 0.5) * 520
      };
    });
    setStrips(list);
    gsap.set(card, { opacity: 0 });

    // 轻微画面震动，增强"被搅碎"的冲击感
    gsap.fromTo(
      stage,
      { x: 0 },
      { x: 5, duration: 0.05, repeat: 7, yoyo: true, ease: 'none', onComplete: () => gsap.set(stage, { x: 0 }) }
    );

    // 遮罩同步淡出，全部结束后移除弹窗
    gsap.to(overlayRef.current, {
      opacity: 0,
      duration: 0.55,
      delay: 0.75,
      ease: 'power2.inOut',
      onComplete: onClose
    });
  }, [onClose]);

  // 碎片生成后：0.5s 散开旋转坠落 → 再飘落淡出
  useEffect(() => {
    if (!strips) return;
    const els = stageRef.current.querySelectorAll('.pc-strip');
    els.forEach((el, i) => {
      const s = strips[i];
      gsap.to(el, { x: s.vx, y: s.vy, rotation: s.rot, duration: 0.5, ease: 'power2.out' });
      gsap.to(el, { y: `+=${240 + Math.random() * 160}`, opacity: 0, rotation: `+=${(Math.random() - 0.5) * 240}`, duration: 0.85, delay: 0.5, ease: 'power1.in' });
    });
  }, [strips]);

  // 阶段三：纸团拖动（鼠标 + 触屏，跟随移动并轻微旋转）
  const onBallDown = e => {
    if (phase !== 'ball') return;
    e.preventDefault();
    const d = drag.current;
    d.active = true;
    d.moved = false;
    d.startX = e.clientX - d.x;
    d.startY = e.clientY - d.y;
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };
  const onBallMove = e => {
    const d = drag.current;
    if (!d.active) return;
    d.moved = true;
    d.x = e.clientX - d.startX;
    d.y = e.clientY - d.startY;
    gsap.set(cardRef.current, { x: d.x, y: d.y, rotation: 9 + d.x * 0.04 });
  };
  const onBallUp = () => {
    const d = drag.current;
    if (!d.active) return;
    d.active = false;
    shred();
  };

  return createPortal(
    <div className="pc-overlay" ref={overlayRef} onClick={e => e.target === overlayRef.current && startCrumple()}>
      <div className="pc-stage" ref={stageRef}>
        <div
          className={`pc-card ${phase === 'ball' || phase === 'shredding' ? 'is-ball' : ''}`}
          ref={cardRef}
          role="dialog"
          aria-modal="true"
          onPointerDown={onBallDown}
          onPointerMove={onBallMove}
          onPointerUp={onBallUp}
          onPointerCancel={onBallUp}
          style={phase === 'ball' ? { cursor: 'grab', touchAction: 'none' } : undefined}
        >
          {/* 揉碎阶段的褶皱纹理覆盖层 */}
          <div className="pc-wrinkle" ref={wrinkleRef} aria-hidden="true" />

          <div className="pc-inner" ref={innerRef}>
            <button className="pc-close" onClick={startCrumple} aria-label={t(pc.close)}>
              ✕
            </button>

            {/* 左侧竖版会员卡 */}
            <div className="pc-member">
              <span className="pc-member-card-label">{pc.member.card}</span>
              <img className="pc-member-photo" src="/assets/portrait.jpg" alt={t(pc.member.name)} />
              <div className="pc-member-info">
                <p>
                  <b>{t(pc.member.nameLabel)}:</b> {t(pc.member.name)}
                </p>
                <p>
                  <b>{t(pc.member.roleLabel)}:</b> {t(pc.member.role)}
                </p>
                <p>
                  <b>{t(pc.member.cityLabel)}:</b> {t(pc.member.city)}
                </p>
              </div>
              <span className="pc-member-no">{pc.member.no}</span>
              <span className="pc-member-sign">Siqi</span>
            </div>

            {/* 白色简历纸 */}
            <div className="pc-paper">
              <span className="pc-clip c1" aria-hidden="true" />
              <span className="pc-clip c2" aria-hidden="true" />
              <span className="pc-pin" aria-hidden="true" />

              <header className="pc-head">
                <h3>{t(pc.member.name)}</h3>
                <p>{t(pc.titleLine)}</p>
              </header>

              <section className="pc-sec">
                <h4>{t(pc.aboutTitle)}</h4>
                <p className="pc-about">{t(content.about.profile)}</p>
              </section>

              <div className="pc-cols">
                <section className="pc-sec">
                  <h4>{t(pc.workTitle)}</h4>
                  <ul className="pc-work">
                    {pc.work.map((w, i) => (
                      <li key={i}>
                        <b>{t(w.role)}</b>
                        <span>{t(w.desc)}</span>
                      </li>
                    ))}
                  </ul>
                </section>
                <section className="pc-sec">
                  <h4>{t(pc.schoolTitle)}</h4>
                  <p>{t(pc.school)}</p>
                  <h4 style={{ marginTop: 14 }}>{t(pc.awardsTitle)}</h4>
                  <ul className="pc-awards">
                    {pc.awards.map((a, i) => (
                      <li key={i}>{t(a)}</li>
                    ))}
                  </ul>
                </section>
              </div>

              <section className="pc-sec">
                <h4>{t(pc.skillsTitle)}</h4>
                <div className="pc-skills">
                  {pc.skills.map((s, i) => (
                    <span key={i} className="pc-skill">
                      {typeof s === 'string' ? s : t(s)}
                    </span>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>

        {/* 搅碎纸条碎片层 */}
        {strips && (
          <div className="pc-strips" aria-hidden="true">
            {strips.map(s => (
              <i
                key={s.id}
                className="pc-strip"
                style={{ left: s.x, top: s.y, width: s.w, height: s.h, background: s.color }}
              />
            ))}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
