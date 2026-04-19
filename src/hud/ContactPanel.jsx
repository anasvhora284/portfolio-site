import { useState } from "react";
import { useFocusTrap } from "../hooks/useFocusTrap.js";
import { siteSettings } from "../generated/content.manifest.js";
import "./HudPanels.css";

export function ContactPanel({ onClose }) {
  const trapRef = useFocusTrap(true, onClose);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [nameError, setNameError] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [messageError, setMessageError] = useState(false);

  const emailTo = siteSettings?.contactEmail || "vhoraanas08@gmail.com";

  const validateEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  const handleSubmit = (e) => {
    e.preventDefault();
    let ok = true;
    if (!name.trim()) {
      setNameError(true);
      ok = false;
    } else setNameError(false);
    if (!email.trim() || !validateEmail(email)) {
      setEmailError(true);
      ok = false;
    } else setEmailError(false);
    if (!message.trim()) {
      setMessageError(true);
      ok = false;
    } else setMessageError(false);
    if (!ok) return;
    const mailto = `mailto:${emailTo}?subject=${encodeURIComponent(`Contact from ${name}`)}&body=${encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\n\n${message}`,
    )}`;
    window.location.href = mailto;
  };

  return (
    <aside
      ref={trapRef}
      className="hud-panel hud-panel--contact"
      role="dialog"
      aria-modal="true"
      aria-labelledby="hud-contact-title"
    >
      <div className="hud-panel__inner">
        <p className="hud-panel__eyebrow">Signal</p>
        <h2 id="hud-contact-title" className="hud-panel__title">
          Contact
        </h2>
        <p className="hud-panel__tagline">Open your mail client with a pre-filled message.</p>
        <form className="hud-contact-form" onSubmit={handleSubmit} noValidate>
          <label className="hud-field">
            <span>Name</span>
            <input
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (nameError) setNameError(false);
              }}
              className={nameError ? "has-error" : ""}
            />
            {nameError ? <small className="hud-field__err">Required</small> : null}
          </label>
          <label className="hud-field">
            <span>Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailError) setEmailError(false);
              }}
              className={emailError ? "has-error" : ""}
            />
            {emailError ? <small className="hud-field__err">Valid email required</small> : null}
          </label>
          <label className="hud-field hud-field--full">
            <span>Message</span>
            <textarea
              rows={4}
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                if (messageError) setMessageError(false);
              }}
              className={messageError ? "has-error" : ""}
            />
            {messageError ? <small className="hud-field__err">Required</small> : null}
          </label>
          <button type="submit" className="hud-btn hud-btn--primary">
            Open email client
          </button>
        </form>
      </div>
    </aside>
  );
}
