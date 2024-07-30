/* eslint-disable react/no-unescaped-entities */
import { Button } from "@mui/material";

const AboutUsPageInfo = () => {
  return (
    <div className="Text">
      <div className="Heading">
        <h3>About me</h3>
      </div>
      <div className="DescriptionText">
        <p>
          Hey there! I'm Anas Vhora, a Computer Engineering student at Gujarat
          Technological University with a passion for frontend development. I
          specialize in creating dynamic web applications using HTML, CSS,
          JavaScript, and React JS. My projects, such as a Maths Problem Solver
          Web App and an E-Waste Facility Locator Website, highlight my skills
          and dedication.
        </p>
        <p>
          I have also made some projects in the field of IoT architecture. For
          example, I created a smart home automation system controlled through
          hand gestures and voice commands. Additionally, my very first project
          was an auto-balancing drone for which I designed a flight controller
          and applied a PID algorithm for stability. I'm always eager to learn,
          explore new technologies, and collaborate on exciting projects.
        </p>
      </div>
      <div className="AboutUsBtnContainer">
        <Button
          variant="contained"
          className="ResumeBtn"
          target="_blank"
          href="https://drive.google.com/file/d/1bbXazOqb2v563sgleU7-CjNW_1ySZTjb/view?usp=sharing"
        >
          Download Resume
        </Button>
        <Button
          variant="outlined"
          className="CvBtn"
          about="_blank"
          target="_blank"
          href="https://drive.google.com/file/d/10Gos7TdLObxwLZRW10CAmF3hfLByM8V1/view?usp=sharing"
        >
          Download CV
        </Button>
      </div>
    </div>
  );
};

export default AboutUsPageInfo;
