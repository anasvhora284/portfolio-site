import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { siteSettings } from "../generated/content.manifest.js";
import { useFocusTrap } from "../hooks/useFocusTrap.js";
import "./ContactScreen.css";

function useClock() {
  const [t, setT] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setT(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return t;
}

function SocialIcon({ label }) {
  const id = (label || "").toLowerCase();
  if (id === "github") {
    return (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden>
        <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2.1c-3.2.7-3.88-1.37-3.88-1.37-.52-1.34-1.28-1.7-1.28-1.7-1.05-.72.08-.71.08-.71 1.16.08 1.77 1.19 1.77 1.19 1.03 1.76 2.7 1.25 3.35.96.1-.75.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.05 11.05 0 0 1 5.79 0c2.21-1.49 3.18-1.18 3.18-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.42-2.69 5.39-5.25 5.67.41.35.78 1.04.78 2.11v3.12c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z" />
      </svg>
    );
  }
  if (id === "linkedin") {
    return (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden>
        <path d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5ZM.22 8h4.56v14H.22V8Zm7.26 0h4.38v2h.06c.61-1.15 2.1-2.35 4.32-2.35 4.62 0 5.48 3.04 5.48 6.99V22h-4.56v-5.6c0-1.34-.02-3.07-1.87-3.07s-2.16 1.46-2.16 2.97V22H7.48V8Z" />
      </svg>
    );
  }
  if (id === "instagram") {
    return (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <path d="M4 4h16v16H4z" />
    </svg>
  );
}

export function ContactScreen({ onClose }) {
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

  const emailTo = siteSettings?.contactEmail || "vhoraanas08@gmail.com";
  const socials = siteSettings?.socialLinks || [];
  const clock = useClock();

  const [copied, setCopied] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [errs, setErrs] = useState({});

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(emailTo);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      window.prompt("Copy email:", emailTo);
    }
  };

  const validateEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  const handleSubmit = (e) => {
    e.preventDefault();
    const next = {};
    if (!name.trim()) next.name = "Required";
    if (!email.trim() || !validateEmail(email)) next.email = "Valid email required";
    if (!message.trim()) next.message = "Required";
    setErrs(next);
    if (Object.keys(next).length) return;

    setSending(true);
    setTimeout(() => {
      const mailto = `mailto:${emailTo}?subject=${encodeURIComponent(
        `Signal from ${name}`,
      )}&body=${encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`)}`;
      window.location.href = mailto;
      setSending(false);
      setSent(true);
      setTimeout(() => setSent(false), 2400);
    }, 700);
  };

  return (
    <section
      ref={trapRef}
      className="contact-screen"
      role="dialog"
      aria-modal="true"
      aria-labelledby="contact-screen-title"
    >
      <div className="contact-screen__bg" aria-hidden>
        <div className="contact-screen__rays" />
        <div className="contact-screen__vignette" />
        <div className="contact-screen__grid" />
      </div>

      <header className="contact-screen__topbar">
        <div className="contact-screen__eyebrow">
          <span className="contact-screen__dot" />
          CONTACT HQ · OPEN CHANNEL · {emailTo.split("@")[1]?.toUpperCase()}
        </div>
        <div className="contact-screen__clock">
          {clock.toISOString().slice(11, 19)} UTC
        </div>
        <button type="button" className="contact-screen__close" onClick={close}>
          Back to star map <span aria-hidden>↵ Esc</span>
        </button>
      </header>

      <div className="contact-screen__inner">
        <div className="contact-screen__hero">
          <div className="contact-screen__kicker">CONTACT HQ · TRANSMIT</div>
          <h1 id="contact-screen-title" className="contact-screen__title">
            <span>Let’s build</span>
            <span className="contact-screen__title-italic">something ambitious</span>
          </h1>
          <p className="contact-screen__lede">
            I read every message. Replies land within a day or two — faster if the
            signal’s strong. Pitch a product, a collaboration, or just say hi.
          </p>
        </div>

        <div className="contact-screen__grid-cols">
          <section className="contact-col">
            <header className="contact-col__head">
              <span className="contact-col__tag">01</span>
              <h2 className="contact-col__title">Direct line</h2>
              <span className="contact-col__rule" />
            </header>

            <button
              type="button"
              className={`email-card ${copied ? "is-copied" : ""}`}
              onClick={copyEmail}
              aria-label="Copy email to clipboard"
            >
              <span className="email-card__label">EMAIL · PRIMARY</span>
              <span className="email-card__addr">{emailTo}</span>
              <span className="email-card__action">
                {copied ? "COPIED ✓" : "Click to copy"}
              </span>
              <span className="email-card__ripple" aria-hidden />
            </button>

            <div className="channels">
              <div className="channels__title">OPEN CHANNELS</div>
              <div className="channels__list">
                {socials.map((s) => (
                  <a
                    key={s.url}
                    className="channel"
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span className="channel__icon" aria-hidden>
                      <SocialIcon label={s.label} />
                    </span>
                    <span className="channel__body">
                      <span className="channel__label">{s.label.toUpperCase()}</span>
                      <span className="channel__meta">
                        {s.url.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                      </span>
                    </span>
                    <span className="channel__arrow" aria-hidden>↗</span>
                  </a>
                ))}
              </div>
            </div>

            <div className="availability">
              <div className="availability__row">
                <span className="availability__dot" />
                <span>Available for work · {clock.getFullYear()}</span>
              </div>
              <div className="availability__row availability__row--muted">
                <span>Based in IST · GMT+5:30</span>
              </div>
            </div>
          </section>

          <section className="contact-col">
            <header className="contact-col__head">
              <span className="contact-col__tag">02</span>
              <h2 className="contact-col__title">Transmit a mission</h2>
              <span className="contact-col__rule" />
            </header>

            <form className="transmit" onSubmit={handleSubmit} noValidate>
              <div className="transmit__row">
                <label className={`transmit__field ${errs.name ? "is-err" : ""}`}>
                  <span className="transmit__label">CALL SIGN</span>
                  <input
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (errs.name) setErrs((p) => ({ ...p, name: undefined }));
                    }}
                    placeholder="e.g. Anas"
                    autoComplete="name"
                  />
                  {errs.name ? <span className="transmit__err">{errs.name}</span> : null}
                </label>
                <label className={`transmit__field ${errs.email ? "is-err" : ""}`}>
                  <span className="transmit__label">FREQUENCY · EMAIL</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errs.email) setErrs((p) => ({ ...p, email: undefined }));
                    }}
                    placeholder="you@example.com"
                    autoComplete="email"
                  />
                  {errs.email ? <span className="transmit__err">{errs.email}</span> : null}
                </label>
              </div>

              <label className={`transmit__field ${errs.message ? "is-err" : ""}`}>
                <span className="transmit__label">MESSAGE PAYLOAD</span>
                <textarea
                  rows={5}
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value);
                    if (errs.message)
                      setErrs((p) => ({ ...p, message: undefined }));
                  }}
                  placeholder="Pitch the mission — goals, timeline, vibe."
                />
                {errs.message ? <span className="transmit__err">{errs.message}</span> : null}
              </label>

              <div className="transmit__footer">
                <div className="transmit__hint">
                  Opens your mail client with the message pre-loaded.
                </div>
                <button
                  type="submit"
                  className={`transmit__btn ${sending ? "is-sending" : ""} ${sent ? "is-sent" : ""}`}
                  disabled={sending}
                >
                  <span className="transmit__btn-text">
                    {sent ? "SIGNAL SENT ✓" : sending ? "TRANSMITTING…" : "Transmit signal"}
                  </span>
                  <span className="transmit__btn-arrow" aria-hidden>
                    →
                  </span>
                </button>
              </div>
            </form>
          </section>
        </div>

        <footer className="contact-screen__foot">
          <span>END OF TRANSMISSION</span>
          <span className="contact-screen__foot-bar" aria-hidden />
          <span>{siteSettings?.statusLine ?? "SYS / CONSTELLATION"}</span>
        </footer>
      </div>
    </section>
  );
}
