import "./Footer.css";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-section">
            <h3 className="footer-title text-gradient">Portfolio</h3>
            <p className="footer-tagline">
              Building beautiful digital experiences
            </p>
          </div>

          <div className="footer-section">
            <h4 className="footer-heading">Quick Links</h4>
            <div className="footer-links">
              <Link to="/home" className="footer-link">Home</Link>
              <Link to="/about" className="footer-link">About</Link>
              <Link to="/projects" className="footer-link">Projects</Link>
              <Link to="/contact" className="footer-link">Contact</Link>
            </div>
          </div>

          <div className="footer-section">
            <h4 className="footer-heading">Connect</h4>
            <div className="social-links">
              <a
                href="https://github.com/anasvhora284/"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link glass-card-light"
                aria-label="GitHub"
              >
                <span className="social-icon">🐙</span>
              </a>
              <a
                href="https://www.linkedin.com/in/anas-vhora-28455a1a1/"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link glass-card-light"
                aria-label="LinkedIn"
              >
                <span className="social-icon">💼</span>
              </a>
              <a
                href="https://www.instagram.com/vhora_anas__/"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link glass-card-light"
                aria-label="Instagram"
              >
                <span className="social-icon">📸</span>
              </a>
              <a
                href="mailto:vhoraanas08@gmail.com"
                className="social-link glass-card-light"
                aria-label="Email"
              >
                <span className="social-icon">📧</span>
              </a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-divider"></div>
          <p className="footer-copyright">
            © 2024 Anas Vhora. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
