import { lazy, Suspense, useCallback, useEffect, useMemo, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { useLocation, useNavigate } from "react-router-dom";
import { projects, siteSettings } from "../generated/content.manifest.js";
import { useUniverseStore } from "../store/universeStore.js";
import {
  useCinematicAudio,
  playDoorOpen,
  playDoorClose,
} from "../audio/useCinematicAudio.js";
import { BootSequence } from "./BootSequence.jsx";
import { CustomCursor } from "./CustomCursor.jsx";
import { HudChrome } from "./HudChrome.jsx";
import { HeroOverlay } from "./HeroOverlay.jsx";
import { ScreenReaderNav } from "./ScreenReaderNav.jsx";
import { ProjectPanel } from "../hud/ProjectPanel.jsx";
import { AboutScreen } from "./AboutScreen.jsx";
import { ContactScreen } from "./ContactScreen.jsx";
import "./UniverseShell.css";

const LazyCanvas = lazy(() => import("../canvas/UniverseCanvas.jsx"));

export default function UniverseShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const bootPhase = useUniverseStore((s) => s.bootPhase);
  const panel = useUniverseStore((s) => s.panel);
  const targetSlug = useUniverseStore((s) => s.targetSlug);

  const { playWarp } = useCinematicAudio();

  /**
   * Panel transitions → door sounds. Store `panel` changes from:
   *   null → 'project'|'about'|'contact'  : door slides open
   *   anything → null                     : door slides closed
   *   'about' → 'project' etc.            : treat as close+open
   */
  const prevPanelRef = useRef(panel);
  useEffect(() => {
    const prev = prevPanelRef.current;
    if (prev === panel) return;
    if (prev && !panel) playDoorClose();
    else if (!prev && panel) playDoorOpen();
    else if (prev && panel) {
      playDoorClose();
      window.setTimeout(() => playDoorOpen(), 260);
    }
    prevPanelRef.current = panel;
  }, [panel]);

  /**
   * Every project is reachable via scroll / arrows / click — not just featured ones.
   * (The "4th/6th/8th node unreachable by keyboard" bug was because they weren't featured.)
   */
  const navProjects = useMemo(
    () =>
      [...projects].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)),
    [],
  );
  const featIndex = useRef(0);
  const wheelAccumRef = useRef(0);
  const wheelLockRef = useRef(false);
  const touchYRef = useRef(0);
  const touchAccumRef = useRef(0);
  const touchLockRef = useRef(false);

  useEffect(() => {
    useUniverseStore.getState().setFocusedSlug(navProjects[0]?.slug ?? null);
  }, [navProjects]);

  const advanceFocus = useCallback(
    (dir, options = {}) => {
      const playNavSound = Boolean(options.playNavSound);
      const st = useUniverseStore.getState();
      if (st.panel || navProjects.length < 2) return false;
      featIndex.current =
        (featIndex.current + dir + navProjects.length) % navProjects.length;
      const slug = navProjects[featIndex.current]?.slug;
      if (!slug) return false;
      st.setFocusedSlug(slug);
      if (playNavSound) playWarp();
      return true;
    },
    [navProjects, playWarp],
  );

  const dockHeroOnMobile = useCallback(() => {
    if (!window.matchMedia("(max-width: 720px)").matches) return;
    const st = useUniverseStore.getState();
    if (st.heroDocked) return;
    st.setHeroDocked(true);
  }, []);

  const syncRoute = useCallback(() => {
    const path = location.pathname;
    const st = useUniverseStore.getState();

    const m = path.match(/^\/work\/([^/]+)\/?$/);
    if (m) {
      st.setPanel("project", m[1]);
      st.setFocusedSlug(m[1]);
      return;
    }
    if (path === "/about") {
      st.setPanel("about", null);
      return;
    }
    if (path === "/contact") {
      st.setPanel("contact", null);
      return;
    }
    st.closePanel();
  }, [location.pathname]);

  useEffect(() => {
    syncRoute();
  }, [syncRoute]);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mobile = window.matchMedia("(max-width: 768px)").matches;
    const cpu = navigator.hardwareConcurrency || 8;
    const saveData = navigator.connection?.saveData;
    let tier = "cinema";
    if (reduce || saveData) tier = "lite";
    else if (mobile || cpu <= 4) tier = "balanced";
    useUniverseStore.getState().setQualityTier(tier);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 720px)");
    const syncHeroDock = () => {
      useUniverseStore.getState().setHeroDocked(mq.matches);
    };
    syncHeroDock();
    mq.addEventListener("change", syncHeroDock);
    return () => mq.removeEventListener("change", syncHeroDock);
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      const st = useUniverseStore.getState();
      if (e.key === "Escape" && st.panel) {
        st.closePanel();
        navigate("/");
        return;
      }
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      const dir = e.key === "ArrowRight" ? 1 : -1;
      advanceFocus(dir, { playNavSound: true });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [advanceFocus, navigate]);

  useEffect(() => {
    const onWheel = (e) => {
      const st = useUniverseStore.getState();
      if (st.panel || navProjects.length < 2) return;
      e.preventDefault();
      wheelAccumRef.current += e.deltaY;
      if (wheelLockRef.current) return;
      if (Math.abs(wheelAccumRef.current) < 40) return;
      const dir = Math.sign(wheelAccumRef.current);
      wheelAccumRef.current = 0;
      wheelLockRef.current = true;
      setTimeout(() => {
        wheelLockRef.current = false;
      }, 360);
      if (advanceFocus(dir)) dockHeroOnMobile();
    };
    window.addEventListener("wheel", onWheel, { passive: false });
    return () => window.removeEventListener("wheel", onWheel);
  }, [advanceFocus, dockHeroOnMobile, navProjects.length]);

  useEffect(() => {
    const onTouchStart = (e) => {
      if (!e.touches?.length) return;
      touchYRef.current = e.touches[0].clientY;
      touchAccumRef.current = 0;
    };
    const onTouchMove = (e) => {
      const st = useUniverseStore.getState();
      if (st.panel || navProjects.length < 2 || !e.touches?.length) return;
      const y = e.touches[0].clientY;
      const delta = touchYRef.current - y;
      touchYRef.current = y;
      touchAccumRef.current += delta;
      if (touchLockRef.current) return;
      if (Math.abs(touchAccumRef.current) < 28) return;
      const dir = Math.sign(touchAccumRef.current);
      touchAccumRef.current = 0;
      touchLockRef.current = true;
      setTimeout(() => {
        touchLockRef.current = false;
      }, 360);
      if (advanceFocus(dir)) {
        dockHeroOnMobile();
        e.preventDefault();
      }
    };
    const onTouchEnd = () => {
      touchAccumRef.current = 0;
    };
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("touchcancel", onTouchEnd, { passive: true });
    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("touchcancel", onTouchEnd);
    };
  }, [advanceFocus, dockHeroOnMobile, navProjects.length]);

  useEffect(() => {
    let raf = 0;
    let nx = 0;
    let ny = 0;
    const onMove = (e) => {
      const w = window.innerWidth || 1;
      const h = window.innerHeight || 1;
      nx = (e.clientX / w) * 2 - 1;
      ny = -((e.clientY / h) * 2 - 1);
      if (!raf) {
        raf = requestAnimationFrame(() => {
          useUniverseStore.getState().setPointer(nx, ny);
          raf = 0;
        });
      }
    };
    const onLeave = () => useUniverseStore.getState().setPointer(0, 0);
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseleave", onLeave);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  /**
   * Canvas click → just set the active/focused node and play warp.
   * Opening the full project panel is a separate action (NOW VIEWING card).
   */
  const onStarSelect = useCallback(
    (slug, options = {}) => {
      const open = Boolean(options?.open);
      const st = useUniverseStore.getState();
      if (open) {
        st.setFocusedSlug(slug);
        const idx = navProjects.findIndex((p) => p.slug === slug);
        if (idx >= 0) featIndex.current = idx;
        navigate(`/work/${slug}`);
        return;
      }
      if (st.focusedSlug === slug) {
        navigate(`/work/${slug}`);
        return;
      }
      st.setFocusedSlug(slug);
      const idx = navProjects.findIndex((p) => p.slug === slug);
      if (idx >= 0) featIndex.current = idx;
    },
    [navProjects, navigate],
  );

  const closeAll = useCallback(() => {
    useUniverseStore.getState().closePanel();
    navigate("/");
  }, [navigate]);

  const activeProject = useMemo(() => {
    if (panel !== "project" || !targetSlug) return null;
    return projects.find((p) => p.slug === targetSlug) ?? null;
  }, [panel, targetSlug]);

  /** Route-aware metadata — titles, descriptions, OG + Twitter tags, canonical. */
  const meta = useMemo(() => {
    const siteName = siteSettings?.siteTitle ?? "Anas Vhora — Portfolio";
    const baseUrl = (siteSettings?.siteUrl ?? "https://anasvhora.dev").replace(/\/$/, "");
    const ogRel = siteSettings?.ogImage ?? "/og-image.svg";
    const ogImage = ogRel.startsWith("http") ? ogRel : `${baseUrl}${ogRel}`;
    const defaultDesc = siteSettings?.defaultMetaDescription ?? "";

    if (activeProject) {
      const desc =
        activeProject.tagline || activeProject.description?.slice(0, 180) || defaultDesc;
      return {
        title: `${activeProject.name} · ${siteName}`,
        description: desc,
        url: `${baseUrl}/work/${activeProject.slug}`,
        image: ogImage,
        type: "article",
      };
    }
    if (panel === "about") {
      return {
        title: `About · ${siteName}`,
        description:
          "About Anas Vhora — captain, career timeline, stack, and the mission behind the portfolio.",
        url: `${baseUrl}/about`,
        image: ogImage,
        type: "profile",
      };
    }
    if (panel === "contact") {
      return {
        title: `Contact HQ · ${siteName}`,
        description:
          "Hail HQ — email, social channels, and a direct transmit form to reach Anas Vhora.",
        url: `${baseUrl}/contact`,
        image: ogImage,
        type: "website",
      };
    }
    return {
      title: `${siteName} · Full-stack & Odoo Developer`,
      description: defaultDesc,
      url: `${baseUrl}/`,
      image: ogImage,
      type: "website",
    };
  }, [activeProject, panel]);

  return (
    <div className="universe-root">
      <Helmet prioritizeSeoTags>
        <title>{meta.title}</title>
        <meta name="description" content={meta.description} />
        <link rel="canonical" href={meta.url} />
        <meta property="og:type" content={meta.type} />
        <meta property="og:title" content={meta.title} />
        <meta property="og:description" content={meta.description} />
        <meta property="og:url" content={meta.url} />
        <meta property="og:image" content={meta.image} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={meta.title} />
        <meta name="twitter:description" content={meta.description} />
        <meta name="twitter:image" content={meta.image} />
      </Helmet>
      <ScreenReaderNav />
      <CustomCursor />
      <BootSequence />
      {bootPhase === "ready" ? (
        <>
          <div className="universe-canvas-wrap">
            <Suspense fallback={<div className="universe-canvas-fallback" aria-hidden />}>
              <LazyCanvas projects={projects} onStarSelect={onStarSelect} />
            </Suspense>
            <div className="universe-depth-overlay" aria-hidden />
          </div>
          <HeroOverlay />
          <HudChrome />
          {panel === "project" ? <ProjectPanel project={activeProject} onClose={closeAll} /> : null}
          {panel === "about" ? <AboutScreen onClose={closeAll} /> : null}
          {panel === "contact" ? <ContactScreen onClose={closeAll} /> : null}
        </>
      ) : null}
    </div>
  );
}
