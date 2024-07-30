/* eslint-disable react/no-unescaped-entities */
/* eslint-disable react/prop-types */
import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

const HomePageInfo = ({ className }) => {
  const navigate = useNavigate();

  function handleProjectClick() {
    navigate("/projects");
  }

  return (
    <div className={`InfoTextContainer ${className}`}>
      <div className="MyHomepageInfo">
        <div>
          <h3>Fullstack Web Developer</h3>
        </div>
        <div className="MainInfoTextDiv">
          <p className="HelloText">Hello! My Name Is Anas Vhora!</p>
          <p className="Mydescription">
            I'm an enthusiastic Frontend Developer passionate about crafting
            engaging user experiences. With a background in Computer Engineering
            and hands-on experience in web development and other similar
            domains!
          </p>
        </div>
        <div className="HomePageButtonsContainer">
          <Button
            variant="contained"
            className="ProjectsBtn"
            onClick={handleProjectClick}
          >
            Projects
          </Button>
          <Button
            variant="outlined"
            className="LinkedInBtn"
            target="_blank"
            href="https://www.linkedin.com/in/anas-vhora-28455a1a1/"
          >
            LinkedIn
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HomePageInfo;
