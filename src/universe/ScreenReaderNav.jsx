import { NavLink } from "react-router-dom";
import { projects, siteSettings } from "../generated/content.manifest.js";

export function ScreenReaderNav() {
  const linkedIn = siteSettings?.socialLinks?.find((s) => s.label?.toLowerCase() === "linkedin");
  const github = siteSettings?.socialLinks?.find((s) => s.label?.toLowerCase() === "github");

  return (
    <nav className="sr-only" aria-label="Site and projects" tabIndex={-1}>
      <ul>
        <li>
          <NavLink to="/">Star map — home</NavLink>
        </li>
        <li>
          <NavLink to="/about">About me</NavLink>
        </li>
        <li>
          <NavLink to="/contact">Contact HQ</NavLink>
        </li>
        {github?.url ? (
          <li>
            <a href={github.url} target="_blank" rel="noopener noreferrer">
              GitHub profile
            </a>
          </li>
        ) : null}
        {linkedIn?.url ? (
          <li>
            <a href={linkedIn.url} target="_blank" rel="noopener noreferrer">
              LinkedIn profile
            </a>
          </li>
        ) : null}
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
