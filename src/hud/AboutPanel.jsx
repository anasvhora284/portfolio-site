import { useFocusTrap } from "../hooks/useFocusTrap.js";
import { siteSettings } from "../generated/content.manifest.js";
import AboutUsMyImg from "../assets/Images/AboutUsImage.png";
import "./HudPanels.css";

export function AboutPanel({ onClose }) {
  const trapRef = useFocusTrap(true, onClose);

  return (
    <aside
      ref={trapRef}
      className="hud-panel hud-panel--about"
      role="dialog"
      aria-modal="true"
      aria-labelledby="hud-about-title"
    >
      <div className="hud-panel__inner">
        <p className="hud-panel__eyebrow">Profile</p>
        <h2 id="hud-about-title" className="hud-panel__title">
          About me
        </h2>
        <p className="hud-panel__tagline">{siteSettings?.tagline}</p>
        <div className="hud-about__grid">
          <div className="hud-about__frame">
            <img src={AboutUsMyImg} alt="" />
          </div>
          <div className="hud-panel__body">
            <p>
              I&apos;m Anas Vhora, a Computer Engineering student at Gujarat Technological University with a
              passion for frontend development. I build dynamic web apps with React and ship full-stack tools
              when the problem needs it.
            </p>
            <p>
              From PWAs and dashboards to IoT experiments (gesture smart home, auto-balancing drone), I like
              learning by building. Always interested in meaningful collaborations.
            </p>
          </div>
        </div>
        <div className="hud-panel__actions">
          {siteSettings?.resumeUrl ? (
            <a className="hud-btn hud-btn--primary" href={siteSettings.resumeUrl} target="_blank" rel="noopener noreferrer">
              Resume
            </a>
          ) : null}
          {siteSettings?.cvUrl ? (
            <a className="hud-btn hud-btn--ghost" href={siteSettings.cvUrl} target="_blank" rel="noopener noreferrer">
              CV
            </a>
          ) : null}
        </div>
      </div>
    </aside>
  );
}
