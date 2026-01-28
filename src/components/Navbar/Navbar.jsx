import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "./Navbar.css";
import { useMediaQuery } from "@mui/material";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentRoute = location.pathname;

  const isMobile = useMediaQuery("(max-width: 767px)");
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
      <div className="navbar-container">
        <div className="logo" onClick={() => navigate("/home")}>
          <span className="logo-text text-gradient">Portfolio</span>
        </div>

        {isMobile && (
          <div
            className={`hamburger ${menuOpen ? "open" : ""}`}
            onClick={toggleMenu}
          >
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
          </div>
        )}

        <div className={`nav-links ${menuOpen ? "open" : ""}`}>
          <Link
            to="/home"
            className={`nav-link ${currentRoute === "/home" ? "active" : ""}`}
            onClick={() => setMenuOpen(false)}
          >
            Home
          </Link>
          <Link
            to="/about"
            className={`nav-link ${currentRoute === "/about" ? "active" : ""}`}
            onClick={() => setMenuOpen(false)}
          >
            About
          </Link>
          <Link
            to="/projects"
            className={`nav-link ${currentRoute === "/projects" ? "active" : ""}`}
            onClick={() => setMenuOpen(false)}
          >
            Projects
          </Link>
          <Link
            to="/contact"
            className={`nav-link ${currentRoute === "/contact" ? "active" : ""}`}
            onClick={() => setMenuOpen(false)}
          >
            Contact
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
