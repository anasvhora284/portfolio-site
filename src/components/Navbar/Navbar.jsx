import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import "./Navbar.css";
import { useMediaQuery } from "@mui/material";

const Navbar = ({ className }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentRoute = location.pathname;

  const isMobile = useMediaQuery("(max-width: 767px)");
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <nav className={className}>
      <div className="logo" onClick={() => navigate("/home")}>
        <h1>Portfolio</h1>
      </div>
      {isMobile ? (
        <div
          className={`nav_bar ${menuOpen ? "open" : ""}`}
          onClick={toggleMenu}
        >
          <div className="bar1"></div>
          <div className="bar2"></div>
          <div className="bar3_h"></div>
          <div className="bar4"></div>
        </div>
      ) : (
        ""
      )}
      <div className={`links ${menuOpen ? "open" : ""}`}>
        <div className="links-container-div">
          <Link
            to="/"
            className={`home ${currentRoute === "/home" ? "active" : ""}`}
            onClick={() => setMenuOpen(false)}
          >
            Home
          </Link>
          <Link
            to="/about"
            className={`home ${currentRoute === "/about" ? "active" : ""}`}
            onClick={() => setMenuOpen(false)}
          >
            About
          </Link>
          <Link
            to="/contact"
            className={`home ${currentRoute === "/contact" ? "active" : ""}`}
            onClick={() => setMenuOpen(false)}
          >
            Contact
          </Link>
          <Link
            to="/projects"
            className={`home ${currentRoute === "/projects" ? "active" : ""}`}
            onClick={() => setMenuOpen(false)}
          >
            Projects
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
