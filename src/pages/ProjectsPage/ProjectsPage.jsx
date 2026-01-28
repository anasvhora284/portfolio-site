import Layout from "../../components/Layout/Layout";
import ProjectsHeader from "../../components/Projects/ProjectsHeader";
import ProjectsGrid from "../../components/Projects/ProjectsGrid";
import "./ProjectsPage.css";

const ProjectsPage = () => {
  return (
    <Layout>
      <div className="projects-page-container">
        <ProjectsHeader />
        <ProjectsGrid />
      </div>
    </Layout>
  );
};

export default ProjectsPage;
