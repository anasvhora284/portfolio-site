import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PortableText } from "@portabletext/react";
import { projects } from "../generated/content.manifest.js";
import { setDiveOrigin, takeDiveOrigin } from "../store/universeStore.js";
import { useFocusTrap } from "../hooks/useFocusTrap.js";
import "./CaseStudyScreen.css";

const ordered = [...projects].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

/** "3,600+" → counts 0 → 3600, keeps the formatting and suffix. */
function CountUp({ value }) {
  const m = /^([^\d]*)([\d,.]+)(.*)$/.exec(value);
  const target = m ? Number(m[2].replace(/,/g, "")) : NaN;
  const [n, setN] = useState(Number.isFinite(target) ? 0 : null);
  const ref = useRef(null);
  useEffect(() => {
    if (!Number.isFinite(target) || !ref.current) return undefined;
    let raf = 0;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const start = performance.now();
      const tick = (now) => {
        const t = Math.min(1, (now - start) / 1100);
        setN(Math.round((1 - (1 - t) ** 3) * target));
        if (t < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    });
    io.observe(ref.current);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [target]);
  if (n == null) return <span ref={ref}>{value}</span>;
  return (
    <span ref={ref}>
      {m[1]}
      {n.toLocaleString("en-US")}
      {m[3] ? <small>{m[3]}</small> : null}
    </span>
  );
}

/** One editorial row: heading on the left, paragraph and/or list on the right. */
function Row({ title, text, items, variant }) {
  if (!text && !items?.length) return null;
  return (
    <section className={`case__row${variant ? ` case__row--${variant}` : ""}`} data-reveal>
      <h2>{title}</h2>
      <div className="case__row-body">
        {text ? <p>{text}</p> : null}
        {items?.length ? (
          <ul>
            {items.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}

export function CaseStudyScreen({ project, onClose }) {
  const navigate = useNavigate();
  const trapRef = useFocusTrap(true);
  const [origin] = useState(takeDiveOrigin);

  const index = ordered.findIndex((p) => p.slug === project.slug);
  const next = ordered[(index + 1) % ordered.length];
  const cs = project.caseStudy;
  const body = Array.isArray(project.body) ? project.body : [];
  const words = useMemo(() => project.name.split(" "), [project.name]);

  /** Reveal sections as they scroll into view (one shared observer). */
  useEffect(() => {
    const root = trapRef.current;
    if (!root) return undefined;
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        }),
      { root, threshold: 0.15 },
    );
    root.querySelectorAll("[data-reveal]").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [trapRef, project.slug]);

  const close = () => {
    onClose?.();
    navigate("/");
  };

  const goNext = (e) => {
    setDiveOrigin(e.clientX, e.clientY);
    navigate(`/work/${next.slug}`);
  };

  const plate = project.thumb ?? project.image;

  return (
    <>
      <div
        className="dive-warp"
        aria-hidden
        style={{ "--dive-x": `${origin.x}px`, "--dive-y": `${origin.y}px` }}
      />
      <section
        ref={trapRef}
        className="case"
        role="dialog"
        aria-modal="true"
        aria-labelledby="case-title"
        style={{ "--dive-x": `${origin.x}px`, "--dive-y": `${origin.y}px` }}
      >
        <header className="case__bar">
          <button type="button" className="case__back" data-magnetic onClick={close}>
            <span aria-hidden>←</span> Star map
          </button>
          <span className="case__count">
            {String(index + 1).padStart(2, "0")} / {String(ordered.length).padStart(2, "0")}
          </span>
          <button type="button" className="case__esc" onClick={close} aria-label="Close">
            Esc
          </button>
        </header>

        <div className="case__inner">
          <div className="case__head">
            <p className="case__meta">
              {[project.year, project.roles?.join(", ")].filter(Boolean).join(" · ")}
            </p>
            <h1 id="case-title" className="case__title">
              {words.map((w, i) => (
                <span className="case__word" key={`${w}-${i}`}>
                  <span style={{ animationDelay: `${520 + i * 90}ms` }}>{w}</span>
                </span>
              ))}
            </h1>
            {project.tagline ? <p className="case__tagline">{project.tagline}</p> : null}
            <div className="case__links">
              {project.link ? (
                <a className="case__btn case__btn--gold" data-magnetic href={project.link} target="_blank" rel="noopener noreferrer">
                  Open project <span aria-hidden>↗</span>
                </a>
              ) : null}
              {project.repoUrl && project.repoUrl !== project.link ? (
                <a className="case__btn" data-magnetic href={project.repoUrl} target="_blank" rel="noopener noreferrer">
                  Source code <span aria-hidden>↗</span>
                </a>
              ) : null}
            </div>
          </div>

          {plate ? (
            <figure className="case__plate">
              <img src={plate} alt="" decoding="async" />
            </figure>
          ) : null}

          {project.video ? (
            <figure className="case__demo" data-reveal>
              <video src={project.video} poster={project.poster} muted loop autoPlay playsInline preload="metadata" />
              <figcaption>Demo</figcaption>
            </figure>
          ) : null}

          {cs?.facts?.length ? (
            <dl className="case__facts" data-reveal>
              {cs.facts.map((f) => (
                <div key={f.label}>
                  <dt>{f.label}</dt>
                  <dd>{f.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}

          {cs?.metrics?.length ? (
            <dl className="case__metrics" data-reveal>
              {cs.metrics.map((m) => (
                <div key={m.label}>
                  <dt>{m.label}</dt>
                  <dd>
                    <CountUp value={m.value} />
                  </dd>
                </div>
              ))}
            </dl>
          ) : null}

          {cs ? (
            <div className="case__story">
              <Row title="The problem" text={cs.problem} />
              <Row title="What I built" items={cs.built} />
              <Row title="How it works" text={cs.architecture} items={cs.architectureList} />
              {cs.challenges?.length ? (
                <section className="case__row" data-reveal>
                  <h2>Challenges</h2>
                  <ol className="case__challenges">
                    {cs.challenges.map((c) => (
                      <li key={c.title}>
                        <h3>{c.title}</h3>
                        <p>{c.detail}</p>
                      </li>
                    ))}
                  </ol>
                </section>
              ) : (
                <Row title="The hard part" text={cs.hardPart} />
              )}
              <Row title="Outcome" text={cs.outcome} />
              <Row title="Known issues & limits" items={cs.issues} variant="issues" />
              <Row title="What I'd do next" items={cs.nextSteps} variant="next" />
              <Row title="Credits" items={cs.credits} />
            </div>
          ) : (
            <div className="case__story">
              <section className="case__row" data-reveal>
                <h2>Overview</h2>
                <div className="case__prose">
                  {body.length ? <PortableText value={body} /> : <p>{project.description}</p>}
                </div>
              </section>
            </div>
          )}

          {project.image && project.image !== plate ? (
            <figure
              className={`case__shot${project.imageKind === "logo" ? " case__shot--logo" : ""}`}
              data-reveal
            >
              <img
                src={project.image}
                alt={`${project.name} ${project.imageKind === "logo" ? "app icon" : "screenshot"}`}
                loading="lazy"
                decoding="async"
              />
              <figcaption>{project.imageKind === "logo" ? "App icon" : "The real thing"}</figcaption>
            </figure>
          ) : null}

          {project.stack?.length ? (
            <section className="case__row" data-reveal>
              <h2>Built with</h2>
              <ul className="case__stack">
                {project.stack.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </section>
          ) : null}

          {next && next.slug !== project.slug ? (
            <button type="button" className="case__next" onClick={goNext} data-reveal>
              <span className="case__next-label">Next star</span>
              <span className="case__next-name">
                {next.name} <span aria-hidden>→</span>
              </span>
            </button>
          ) : null}
        </div>
      </section>
    </>
  );
}
