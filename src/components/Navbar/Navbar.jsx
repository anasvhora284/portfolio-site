/* eslint-disable react/prop-types */
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./Navbar.css";

const Navbar = ({ className }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentRoute = location.pathname;

  return (
    <nav className={className}>
      <div className="logo" onClick={() => navigate("/home")}>
        <h1>Portfolio</h1>
      </div>
      <div className="links">
        <Link
          to="/"
          className={`home ${currentRoute === "/home" ? "active" : ""}`}
        >
          Home
        </Link>
        <Link
          to="/about"
          className={`home ${currentRoute === "/about" ? "active" : ""}`}
        >
          About
        </Link>
        <Link
          to="/contact"
          className={`home ${currentRoute === "/contact" ? "active" : ""}`}
        >
          Contact
        </Link>
        <Link
          to="/projects"
          className={`home ${currentRoute === "/projects" ? "active" : ""}`}
        >
          Projects
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
