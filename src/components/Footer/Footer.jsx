/* eslint-disable react/prop-types */
import GithubVector from "../../assets/Images/GithubVector.svg";
import LinkedInVector from "../../assets/Images/LinkedInVector.svg";
import EmailVector from "../../assets/Images/EmailVector.svg";
import InstagramVector from "../../assets/Images/ImageVector.svg";
import "./Footer.css";
import { Link } from "react-router-dom";

const Footer = ({ className }) => {
  return (
    <footer className={`footer ${className}`}>
      <div className="VectorContainer">
        <Link to="https://www.instagram.com/vhora_anas__/" target="_blank">
          <img src={InstagramVector} alt="InstagramVectorImmage" />
        </Link>
        <Link
          to="https://www.linkedin.com/in/anas-vhora-28455a1a1/"
          target="_blank"
        >
          <img src={LinkedInVector} alt="LinkedInVector" />
        </Link>
        <Link to="https://github.com/anasvhora284/" target="_blank">
          <img src={GithubVector} alt="GithubVector" />
        </Link>
        <Link to="mailto:vhoraanas08@gmail.com">
          <img src={EmailVector} alt="EmailVector" />
        </Link>
      </div>
      <div className="FooterText">
        <p>@Anas Vhora 2024</p>
      </div>
    </footer>
  );
};

export default Footer;
