import projectsData from '../../utils/Projectsdata';
import ProjectCard from './ProjectCard';
import './ProjectsGrid.css';

export default function ProjectsGrid() {
  return (
    <div className="projects-grid-section">
      <div className="projects-grid">
        {projectsData.map((project, index) => (
          <ProjectCard key={index} project={project} index={index} />
        ))}
      </div>

      <div className="projects-footer">
        <p className="footer-text">More projects coming soon...</p>
      </div>
    </div>
  );
}
