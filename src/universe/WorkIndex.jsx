import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { projects } from "../generated/content.manifest.js";
import { setDiveOrigin } from "../store/universeStore.js";
import { useFocusTrap } from "../hooks/useFocusTrap.js";
import "./WorkIndex.css";

const byNewest = [...projects].sort(
  (a, b) => (b.year ?? 0) - (a.year ?? 0) || (b.sortOrder ?? 0) - (a.sortOrder ?? 0),
);

export function WorkIndex({ onClose }) {
  const navigate = useNavigate();
  const trapRef = useFocusTrap(true, onClose);
  const [filter, setFilter] = useState("selected");
  const [hover, setHover] = useState(null);
  const previewRef = useRef(null);

  const list = filter === "selected" ? byNewest.filter((p) => p.featured) : byNewest;

  /** The plate trails the cursor with a little lag (lerp in rAF). */
  useEffect(() => {
    const el = previewRef.current;
    if (!el || !window.matchMedia("(hover: hover)").matches) return undefined;
    let tx = window.innerWidth / 2;
    let ty = window.innerHeight / 2;
    let x = tx;
    let y = ty;
    let raf = 0;
    const onMove = (e) => {
      tx = e.clientX;
      ty = e.clientY;
    };
    const loop = () => {
      x += (tx - x) * 0.14;
      y += (ty - y) * 0.14;
      const tilt = Math.max(-8, Math.min(8, (tx - x) * 0.08));
      el.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%) rotate(${tilt}deg)`;
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  const open = (e, slug) => {
    e.preventDefault();
    setDiveOrigin(e.clientX || window.innerWidth / 2, e.clientY || window.innerHeight / 2);
    navigate(`/work/${slug}`);
  };

  const close = () => {
    onClose?.();
    navigate("/");
  };

  const hovered = hover ? projects.find((p) => p.slug === hover) : null;
  const hoveredArt = hovered ? hovered.thumb ?? hovered.image : null;

  return (
    <section
      ref={trapRef}
      className="work"
      role="dialog"
      aria-modal="true"
      aria-labelledby="work-title"
    >
      <header className="work__bar">
        <button type="button" className="work__back" data-magnetic onClick={close}>
          <span aria-hidden>←</span> Star map
        </button>
        <div className="work__tabs" role="group" aria-label="Filter projects">
          <button
            type="button"
            aria-pressed={filter === "selected"}
            onClick={() => setFilter("selected")}
          >
            Selected
          </button>
          <button type="button" aria-pressed={filter === "all"} onClick={() => setFilter("all")}>
            All {projects.length}
          </button>
        </div>
      </header>

      <div className="work__inner">
        <h1 id="work-title" className="work__title">
          Work
        </h1>
        <ol className="work__list" onPointerLeave={() => setHover(null)}>
          {list.map((p, i) => (
            <li key={p.slug} style={{ animationDelay: `${120 + i * 45}ms` }}>
              <a
                href={`/work/${p.slug}`}
                className="work__row"
                onClick={(e) => open(e, p.slug)}
                onPointerEnter={() => setHover(p.slug)}
                onFocus={() => setHover(p.slug)}
              >
                <span className="work__year">{p.year}</span>
                <span className="work__name">{p.name}</span>
                <span className="work__roles">{p.roles?.join(", ")}</span>
                <span className="work__arrow" aria-hidden>
                  →
                </span>
              </a>
            </li>
          ))}
        </ol>
      </div>

      <div ref={previewRef} className={`work__preview${hoveredArt ? " is-on" : ""}`} aria-hidden>
        {hoveredArt ? <img src={hoveredArt} alt="" key={hoveredArt} /> : null}
      </div>
    </section>
  );
}
