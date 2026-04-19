import { PortableText } from "@portabletext/react";
import { useFocusTrap } from "../hooks/useFocusTrap.js";
import { siteSettings } from "../generated/content.manifest.js";
import "./HudPanels.css";

export function ProjectPanel({ project, onClose }) {
  const active = Boolean(project);
  const trapRef = useFocusTrap(active, onClose);

  if (!project) return null;

  const body = Array.isArray(project.body) ? project.body : [];

  return (
    <aside
      ref={trapRef}
      className="hud-panel hud-panel--project"
      role="dialog"
      aria-modal="true"
      aria-labelledby="hud-project-title"
    >
      <div className="hud-panel__inner">
        <p className="hud-panel__eyebrow">Selected object</p>
        <h2 id="hud-project-title" className="hud-panel__title">
          {project.name}
        </h2>
        {project.tagline ? <p className="hud-panel__tagline">{project.tagline}</p> : null}
        <div className="hud-panel__meta">
          {project.year ? <span>{project.year}</span> : null}
          {project.roles?.length ? <span>{project.roles.join(" · ")}</span> : null}
        </div>
        {project.stack?.length ? (
          <ul className="hud-panel__chips">
            {project.stack.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        ) : null}
        {project.image ? (
          <figure
            className="hud-panel__media"
            data-kind={project.imageKind === "logo" ? "logo" : "screenshot"}
          >
            <span className="hud-panel__media-eyebrow">
              {project.imageKind === "logo" ? "Mark" : "Preview"} · {project.slug?.toUpperCase()}
            </span>
            <img
              src={project.image}
              alt={
                project.imageKind === "logo"
                  ? `${project.name} logo`
                  : `${project.name} screenshot`
              }
              loading="lazy"
              decoding="async"
            />
          </figure>
        ) : null}
        <div className="hud-panel__body">
          {body.length ? (
            <PortableText value={body} />
          ) : (
            <p>{project.description}</p>
          )}
        </div>
        <div className="hud-panel__actions">
          {project.link ? (
            <a className="hud-btn hud-btn--primary" href={project.link} target="_blank" rel="noopener noreferrer">
              Open project
            </a>
          ) : null}
          {project.repoUrl ? (
            <a className="hud-btn hud-btn--ghost" href={project.repoUrl} target="_blank" rel="noopener noreferrer">
              Repository
            </a>
          ) : null}
          {project.articleUrl ? (
            <a className="hud-btn hud-btn--ghost" href={project.articleUrl} target="_blank" rel="noopener noreferrer">
              Article
            </a>
          ) : null}
        </div>
        <p className="hud-panel__foot">
          Reach: <a href={`mailto:${siteSettings?.contactEmail}`}>{siteSettings?.contactEmail}</a>
        </p>
      </div>
    </aside>
  );
}
