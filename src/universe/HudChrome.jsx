import { NavLink, useNavigate } from "react-router-dom";
import { useUniverseStore } from "../store/universeStore.js";
import { siteSettings } from "../generated/content.manifest.js";
import { MuteToggle } from "../hud/MuteToggle.jsx";
import "./HudChrome.css";

export function HudChrome() {
  const navigate = useNavigate();
  const panel = useUniverseStore((s) => s.panel);
  const closePanel = useUniverseStore((s) => s.closePanel);

  return (
    <header className="hud-chrome">
      <div className="hud-brand-stack">
        <button
          type="button"
          className="hud-brand"
          onClick={() => {
            closePanel();
            navigate("/");
          }}
        >
          <span className="hud-brand__mark">AV</span>
          <span className="hud-brand__text">Portfolio</span>
        </button>
        <div className="hud-brand-socials" aria-label="Social links">
          <a
            className="hud-social-link"
            href="https://github.com/anasvhora284/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub profile"
          >
            <span className="hud-social-link__icon" aria-hidden>
              <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2.1c-3.2.7-3.88-1.37-3.88-1.37-.52-1.34-1.28-1.7-1.28-1.7-1.05-.72.08-.71.08-.71 1.16.08 1.77 1.19 1.77 1.19 1.03 1.76 2.7 1.25 3.35.96.1-.75.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.05 11.05 0 0 1 5.79 0c2.21-1.49 3.18-1.18 3.18-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.42-2.69 5.39-5.25 5.67.41.35.78 1.04.78 2.11v3.12c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z" />
              </svg>
            </span>
            <span className="hud-social-link__label">GitHub</span>
          </a>
          <a
            className="hud-social-link"
            href="https://www.linkedin.com/in/anas-vhora-28455a1a1/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn profile"
          >
            <span className="hud-social-link__icon" aria-hidden>
              <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                <path d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5ZM.22 8h4.56v14H.22V8Zm7.26 0h4.38v2h.06c.61-1.15 2.1-2.35 4.32-2.35 4.62 0 5.48 3.04 5.48 6.99V22h-4.56v-5.6c0-1.34-.02-3.07-1.87-3.07s-2.16 1.46-2.16 2.97V22H7.48V8Z" />
              </svg>
            </span>
            <span className="hud-social-link__label">LinkedIn</span>
          </a>
        </div>
      </div>
      <div className="hud-status">
        <span className="hud-status__line">{siteSettings?.statusLine ?? "SYS / CONSTELLATION"}</span>
        {siteSettings?.availableForWork ? (
          <span className="hud-status__pill">Open to work</span>
        ) : null}
      </div>
      <nav className="hud-nav" aria-label="Primary">
        <NavLink end className="hud-nav__link" to="/" aria-label="Star map">
          <span className="hud-nav__glyph" aria-hidden>✦</span>
          <span className="hud-nav__label">Star map</span>
        </NavLink>
        <NavLink className="hud-nav__link" to="/about" aria-label="About me">
          <span className="hud-nav__glyph" aria-hidden>⬢</span>
          <span className="hud-nav__label">About me</span>
        </NavLink>
        <NavLink className="hud-nav__link" to="/contact" aria-label="Contact HQ">
          <span className="hud-nav__glyph" aria-hidden>◎</span>
          <span className="hud-nav__label">Contact HQ</span>
        </NavLink>
        <MuteToggle />
      </nav>
      {panel ? (
        <button type="button" className="hud-close" onClick={() => navigate("/")}>
          Close <span className="hud-close__key" aria-hidden>Esc</span>
        </button>
      ) : null}
    </header>
  );
}
