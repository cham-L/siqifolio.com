import { useMemo } from 'react';
import SplitHeading from '../components/SplitHeading.jsx';
import { useLang } from '../i18n.jsx';
import { content } from '../content.js';

export default function About() {
  const { lang, t } = useLang();
  const a = content.about;

  const words = useMemo(() => {
    const text = t(a.quote);
    if (lang === 'zh') {
      return text
        .split(/(?<=，|；|。)/)
        .filter(Boolean)
        .map(w => w.trim());
    }
    return text.split(' ').filter(Boolean);
  }, [lang, t, a.quote]);

  return (
    <section className="section" id="about">
      <span className="ghost-num" aria-hidden="true">
        01
      </span>
      <p className="section-label" data-reveal>
        {t(a.label)}
      </p>
      <SplitHeading text="ABOUT ME" sub={lang === 'zh' ? '关 于 我' : 'WHO I AM'} />

      <div className="about-stage">
        <blockquote className="about-quote card-paper" data-quote>
          {words.map((w, i) => (
            <span className={`word ${i % 3 === 1 ? 'hl' : ''}`} key={i}>
              {w}
            </span>
          ))}
        </blockquote>

        <div className="about-profile-card card-paper" data-reveal>
          <h3 className="about-block-title">{t(a.profileTitle)}</h3>
          <p className="about-profile">{t(a.profile)}</p>
        </div>

        <div className="about-motto" data-reveal>
          {t(a.motto)}
        </div>

        <div className="honors-stage" data-stagger>
          {a.honors.map((h, i) => (
            <div className="honor-card card-paper" key={i}>
              <span className="no">{String(i + 1).padStart(2, '0')} / HONOR</span>
              {t(h)}
            </div>
          ))}
        </div>
      </div>

      <div className="skills-grid" data-stagger>
        {a.skills.map((s, i) => (
          <div className="skill-card card-paper" key={i}>
            <div className="idx">{String(i + 1).padStart(2, '0')}</div>
            <p>{t(s)}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
