import { NavLink } from "react-router-dom";
import { projects, siteSettings } from "../generated/content.manifest.js";

export function ScreenReaderNav() {
  return (
    <nav className="sr-only" aria-label="Site and projects" tabIndex={-1}>
      <ul>
        <li>
          <NavLink to="/">Star map — home</NavLink>
        </li>
        <li>
          <NavLink to="/about">My ship — about</NavLink>
        </li>
        <li>
          <NavLink to="/contact">Contact HQ</NavLink>
        </li>
        {projects.map((p) => (
          <li key={p.slug}>
            <NavLink to={`/work/${p.slug}`}>{p.name}</NavLink>
          </li>
        ))}
      </ul>
      <p>
        Contact email: <a href={`mailto:${siteSettings?.contactEmail ?? ""}`}>{siteSettings?.contactEmail}</a>
      </p>
    </nav>
  );
}
