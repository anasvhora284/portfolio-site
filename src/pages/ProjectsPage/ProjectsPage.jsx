/* eslint-disable react/no-unescaped-entities */
import Layout from "../../components/Layout/Layout";
import { Button, useMediaQuery } from "@mui/material";
import projectsData from "../../utils/Projectsdata";
import "./ProjectsPage.css";

const ProjectsPage = () => {
  const isMobile = useMediaQuery("(max-width: 768px)");

  return (
    <Layout>
      <div className="project-page-main-div">
        <div className="SectionHeading">Projects</div>
        <div className="project-list-div">
          {projectsData.map((project, index) => (
            <div
              key={index}
              className={`project-container ${project.name} ${
                index % 2 === 0 && !isMobile ? "even" : ""
              }`}
            >
              <div className="project-details">
                <div>
                  <div className="project-name">{project.name}</div>
                  <div className="project-description">
                    {project.description.split("\n").map((line, index) => (
                      <p key={index}>{line}</p>
                    ))}
                  </div>
                  <div className="view-more-btn">
                    <Button
                      variant="outlined"
                      className="view-more-btn"
                      href={project.link}
                    >
                      View Project
                    </Button>
                  </div>
                </div>
              </div>
              <img
                src={project.image}
                alt={`${project.name} Image`}
                className={`${(project.name + " Image").replace(/\s+/g, "-")}`}
              />
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default ProjectsPage;
