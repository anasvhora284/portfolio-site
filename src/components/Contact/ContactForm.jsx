import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import './ContactForm.css';

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const formRef = useRef(null);
  const fieldsRef = useRef([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(fieldsRef.current, {
        opacity: 0,
        x: -30,
        duration: 0.6,
        stagger: 0.15,
        ease: 'power3.out',
      });
    });

    return () => ctx.revert();
  }, []);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const subject = `Message from ${formData.name}`;
      const body = `Name: ${formData.name}%0D%0AEmail: ${formData.email}%0D%0A%0D%0AMessage:%0D%0A${formData.message}`;
      window.location.href = `mailto:your-email@example.com?subject=${subject}&body=${body}`;

      setIsSubmitting(false);
      setSubmitSuccess(true);

      setTimeout(() => {
        setSubmitSuccess(false);
        setFormData({ name: '', email: '', message: '' });
      }, 3000);
    }, 1000);
  };

  return (
    <div className="contact-form-container">
      <form ref={formRef} onSubmit={handleSubmit} className="contact-form glass-card-heavy">
        <h2 className="form-title">
          Get in <span className="text-gradient">Touch</span>
        </h2>
        <p className="form-subtitle">
          Have a question or want to work together? Drop me a message!
        </p>

        <div className="form-field" ref={(el) => (fieldsRef.current[0] = el)}>
          <label htmlFor="name" className="field-label">
            Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`field-input ${errors.name ? 'error' : ''}`}
            placeholder="Your Name"
          />
          {errors.name && <span className="error-message">{errors.name}</span>}
        </div>

        <div className="form-field" ref={(el) => (fieldsRef.current[1] = el)}>
          <label htmlFor="email" className="field-label">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`field-input ${errors.email ? 'error' : ''}`}
            placeholder="your.email@example.com"
          />
          {errors.email && <span className="error-message">{errors.email}</span>}
        </div>

        <div className="form-field" ref={(el) => (fieldsRef.current[2] = el)}>
          <label htmlFor="message" className="field-label">
            Message
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            className={`field-input field-textarea ${errors.message ? 'error' : ''}`}
            placeholder="Your message..."
            rows="6"
          />
          {errors.message && <span className="error-message">{errors.message}</span>}
        </div>

        <button
          type="submit"
          className={`submit-button btn-primary ${isSubmitting || submitSuccess ? 'disabled' : ''}`}
          disabled={isSubmitting || submitSuccess}
          ref={(el) => (fieldsRef.current[3] = el)}
        >
          {isSubmitting ? (
            <>
              <span className="spinner"></span>
              Sending...
            </>
          ) : submitSuccess ? (
            <>
              <span className="checkmark">✓</span>
              Message Sent!
            </>
          ) : (
            <>
              Send Message
              <span className="send-icon">📧</span>
            </>
          )}
        </button>
      </form>

      <div className="contact-info">
        <a
          href="mailto:your-email@example.com"
          className="contact-info-card glass-card"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span className="info-icon">📧</span>
          <span className="info-text">Email</span>
        </a>
        <a
          href="https://linkedin.com"
          className="contact-info-card glass-card"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span className="info-icon">💼</span>
          <span className="info-text">LinkedIn</span>
        </a>
        <a
          href="https://github.com"
          className="contact-info-card glass-card"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span className="info-icon">🐙</span>
          <span className="info-text">GitHub</span>
        </a>
      </div>
    </div>
  );
}
