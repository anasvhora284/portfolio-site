import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { projects, siteSettings } from "../generated/content.manifest.js";
import AboutUsMyImg from "../assets/Images/AboutUsImage.png";
import { useFocusTrap } from "../hooks/useFocusTrap.js";
import "./AboutScreen.css";

const EDUCATION = [
  {
    period: "2021",
    title: "Higher Secondary Education",
    org: "Gujarat Secondary and Higher Secondary Education Board (GSHSEB)",
    note: "Science stream · A-group foundation in math, physics, chemistry.",
  },
  {
    period: "2021 — Dec 2025",
    title: "Bachelor of Computer Engineering",
    org: "Gujarat Technological University",
    note: "Graduated · 8.61 CGPA · CE core alongside full-stack and IoT side missions.",
  },
];

const EXPERIENCE = [
  {
    period: "2021 — 2024",
    title: "Independent builder · Academic projects",
    org: "B.E. Computer Engineering journey",
    note: "Built web/mobile projects as part of coursework and personal practice before full-time internships.",
  },
  {
    period: "19 Jun — 19 Jul 2024",
    title: "Summer Intern",
    org: "BrainyBeam Info Pvt. Ltd.",
    note: "One-month dev sprint building web modules and shipping production tickets.",
  },
  {
    period: "13 Jan 2025 — Jul 2025",
    title: "Software Development Intern · 6 months",
    org: "Atharva Systems Pvt. Ltd.",
    note: "Moved from onboarding to owning features end-to-end across internal tools.",
  },
  {
    period: "Jul 2025 — Present",
    title: "Jr. Software Developer · Odoo",
    org: "Atharva Systems Pvt. Ltd.",
    note: "Building and customising Odoo modules, integrations, and client workflows.",
  },
];

const SKILLS = [
  { group: "Frontend", items: ["CSS", "GSAP", "HTML", "JavaScript", "React", "Vite"] },
  { group: "Backend & Odoo", items: ["Node.js", "Odoo", "OWL JS", "Python", "XML"] },
  { group: "Databases", items: ["MongoDB", "PostgreSQL"] },
  {
    group: "DevOps & Scripting",
    items: [
      "AWS EC2",
      "Bash",
      "CI/CD",
      "DNS",
      "GitHub Actions",
      "Linux",
      "Lua",
      "Nginx",
      "PM2",
      "Shell Script",
      "TCP/IP Networking",
    ],
  },
];

const TECH_ICONS = {
  HTML: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg",
  CSS: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg",
  JavaScript:
    "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg",
  React:
    "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg",
  Vite: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vitejs/vitejs-original.svg",
  "Node.js":
    "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg",
  Python:
    "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg",
  Odoo: "https://cdn.simpleicons.org/odoo/714B67",
  PostgreSQL:
    "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg",
  MongoDB:
    "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg",
  Linux:
    "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/linux/linux-original.svg",
  Nginx:
    "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nginx/nginx-original.svg",
  "GitHub Actions": "https://cdn.simpleicons.org/githubactions/2088FF",
  Lua: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/lua/lua-original.svg",
  Bash:
    "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/bash/bash-original.svg",
};

function useStaggerReveal(count, delay = 60) {
  const [revealed, setRevealed] = useState(0);
  useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setRevealed(i);
      if (i >= count) clearInterval(id);
    }, delay);
    return () => clearInterval(id);
  }, [count, delay]);
  return revealed;
}

function useCount(target, duration = 900) {
  const [n, setN] = useState(0);
  useEffect(() => {
    const start = performance.now();
    let raf = 0;
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - (1 - t) * (1 - t);
      setN(Math.round(eased * target));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return n;
}

export function AboutScreen({ onClose }) {
  const navigate = useNavigate();
  const trapRef = useFocusTrap(true, onClose);
  const close = () => {
    onClose?.();
    navigate("/");
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const featured = useMemo(
    () => projects.filter((p) => p.featured).length,
    [],
  );

  const stackCount = useMemo(() => {
    const s = new Set();
    projects.forEach((p) => (p.stack || []).forEach((t) => s.add(t)));
    return s.size;
  }, []);

  const projectsN = useCount(projects.length);
  const featuredN = useCount(featured);
  const stacksN = useCount(stackCount);
  const yearsN = useCount(5);

  const eduRevealed = useStaggerReveal(EDUCATION.length, 110);
  const expRevealed = useStaggerReveal(EXPERIENCE.length, 110);

  return (
    <section
      ref={trapRef}
      className="about-screen"
      role="dialog"
      aria-modal="true"
      aria-labelledby="about-screen-title"
    >
      <div className="about-screen__bg" aria-hidden>
        <div className="about-screen__grid" />
        <div className="about-screen__vignette" />
      </div>

      <header className="about-screen__topbar">
        <div className="about-screen__eyebrow">
          <span className="about-screen__dot" />
          ABOUT · VESSEL ANV-01 · ACTIVE
        </div>
        <button type="button" className="about-screen__close" onClick={close}>
          Back to star map <span aria-hidden>↵ Esc</span>
        </button>
      </header>

      <div className="about-screen__inner">
        <div className="about-screen__hero">
          <div className="about-screen__portrait-wrap">
            <div className="about-screen__portrait-frame">
              <img src={AboutUsMyImg} alt="" className="about-screen__portrait" />
            </div>
            <div className="about-screen__portrait-ring" aria-hidden />
            <div className="about-screen__portrait-ticks" aria-hidden>
              <span /><span /><span /><span />
            </div>
          </div>

          <div className="about-screen__hero-copy">
            <div className="about-screen__kicker">CAPTAIN · OPERATOR PROFILE</div>
            <h1 id="about-screen-title" className="about-screen__title">
              <span>Anas</span>
              <span className="about-screen__title-italic">Vhora</span>
            </h1>
            <p className="about-screen__tagline">{siteSettings?.tagline}</p>
            <p className="about-screen__bio">
              Computer Engineering student at Gujarat Technological University building
              expressive, production-grade web products. I move between React apps, mobile,
              and hardware &mdash; gesture-driven smart homes, self-balancing drones, PWAs
              that a family of non-profits actually uses. What I care about: craft, motion,
              and shipping things that feel inevitable.
            </p>
            <p className="about-screen__hobby">
              Outside work, I like tinkering with devices &mdash; flashing different mobile OS
              builds, testing custom setups, and learning how systems behave under the hood.
            </p>

            <div className="about-screen__cta-row">
              {siteSettings?.resumeUrl ? (
                <a
                  className="about-btn about-btn--primary"
                  href={siteSettings.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Download Resume <span aria-hidden>↗</span>
                </a>
              ) : null}
              {siteSettings?.cvUrl ? (
                <a
                  className="about-btn about-btn--ghost"
                  href={siteSettings.cvUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View CV <span aria-hidden>↗</span>
                </a>
              ) : null}
            </div>
          </div>
        </div>

        <section className="about-screen__stats" aria-label="Summary">
          <div className="stat-card">
            <div className="stat-card__num">{String(projectsN).padStart(2, "0")}</div>
            <div className="stat-card__label">Projects shipped</div>
          </div>
          <div className="stat-card">
            <div className="stat-card__num">{String(featuredN).padStart(2, "0")}</div>
            <div className="stat-card__label">Featured works</div>
          </div>
          <div className="stat-card">
            <div className="stat-card__num">{String(stacksN).padStart(2, "0")}</div>
            <div className="stat-card__label">Tech in stack</div>
          </div>
          <div className="stat-card">
            <div className="stat-card__num">{yearsN}+</div>
            <div className="stat-card__label">Years building products</div>
            <div className="stat-card__note">
              2021 — 2024 includes academic and personal projects before professional internships.
            </div>
          </div>
        </section>
        <p className="about-screen__stats-note">
          2021 — 2024 includes academic and personal projects before professional internships.
        </p>

        <section className="about-screen__grid-cols">
          <div className="about-panel">
            <header className="about-panel__head">
              <span className="about-panel__tag">01</span>
              <h2 className="about-panel__title">Education</h2>
              <span className="about-panel__rule" />
            </header>
            <ol className="timeline">
              {EDUCATION.map((t, i) => (
                <li
                  key={`edu-${t.period}-${t.title}`}
                  className={`timeline__item ${i < eduRevealed ? "is-in" : ""}`}
                  style={{ transitionDelay: `${i * 70}ms` }}
                >
                  <div className="timeline__year">{t.period}</div>
                  <div className="timeline__dot" aria-hidden />
                  <div className="timeline__body">
                    <div className="timeline__title">{t.title}</div>
                    <div className="timeline__org">{t.org}</div>
                    <div className="timeline__note">{t.note}</div>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="about-panel">
            <header className="about-panel__head">
              <span className="about-panel__tag">02</span>
              <h2 className="about-panel__title">Experience</h2>
              <span className="about-panel__rule" />
            </header>
            <ol className="timeline">
              {EXPERIENCE.map((t, i) => (
                <li
                  key={`exp-${t.period}-${t.title}`}
                  className={`timeline__item ${i < expRevealed ? "is-in" : ""}`}
                  style={{ transitionDelay: `${i * 70}ms` }}
                >
                  <div className="timeline__year">{t.period}</div>
                  <div className="timeline__dot" aria-hidden />
                  <div className="timeline__body">
                    <div className="timeline__title">{t.title}</div>
                    <div className="timeline__org">{t.org}</div>
                    <div className="timeline__note">{t.note}</div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="about-panel about-panel--wide">
          <header className="about-panel__head">
            <span className="about-panel__tag">03</span>
            <h2 className="about-panel__title">Stack &amp; tooling</h2>
            <span className="about-panel__rule" />
          </header>
          <div className="skills-grid skills-grid--wide">
            {SKILLS.map((s) => (
              <div className="skills-col" key={s.group}>
                <div className="skills-col__title">{s.group}</div>
                <ul className="skills-col__list">
                  {s.items.map((it) => (
                    <li key={it}>
                      {TECH_ICONS[it] ? (
                        <img
                          className="skills-col__icon"
                          src={TECH_ICONS[it]}
                          alt=""
                          loading="lazy"
                          decoding="async"
                          aria-hidden="true"
                        />
                      ) : null}
                      <span>{it}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section className="about-screen__cta">
          <div className="about-screen__cta-text">
            <span className="about-screen__cta-eyebrow">Have a mission?</span>
            <span className="about-screen__cta-title">Let’s make it feel inevitable.</span>
          </div>
          <button
            type="button"
            className="about-btn about-btn--primary"
            onClick={() => navigate("/contact")}
          >
            Hail HQ <span aria-hidden>→</span>
          </button>
        </section>
      </div>
    </section>
  );
}
