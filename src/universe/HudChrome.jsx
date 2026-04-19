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
        <NavLink className="hud-nav__link" to="/about" aria-label="My ship">
          <span className="hud-nav__glyph" aria-hidden>⬢</span>
          <span className="hud-nav__label">My ship</span>
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
