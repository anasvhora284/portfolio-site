/* eslint-disable react/prop-types */
import Navbar from "../Navbar/Navbar.jsx";
import Footer from "../Footer/Footer.jsx";
import "./Layout.css";

const Layout = ({ children }) => {
  return (
    <div className="layout">
      <Navbar className="NavbarComponent" />
      {children}
      <Footer className="FooterComponent" />
    </div>
  );
};

export default Layout;
