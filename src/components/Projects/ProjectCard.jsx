import { useRef } from 'react';
import { motion } from 'framer-motion';
import './ProjectCard.css';

export default function ProjectCard({ project, index }) {
  const cardRef = useRef(null);

  const getTechBadgeColor = (name) => {
    if (name.toLowerCase().includes('react')) return '#00d4ff';
    if (name.toLowerCase().includes('mern')) return '#a855f7';
    if (name.toLowerCase().includes('hardware')) return '#ff006e';
    return '#00d4ff';
  };

  const getTechStack = (description) => {
    const techs = [];
    if (description.toLowerCase().includes('react native')) techs.push('React Native');
    else if (description.toLowerCase().includes('react')) techs.push('React');
    if (description.toLowerCase().includes('node')) techs.push('Node.js');
    if (description.toLowerCase().includes('mongodb')) techs.push('MongoDB');
    if (description.toLowerCase().includes('express')) techs.push('Express');
    if (description.toLowerCase().includes('arduino')) techs.push('Arduino');
    if (description.toLowerCase().includes('pwa')) techs.push('PWA');
    if (description.toLowerCase().includes('figma')) techs.push('Figma');
    if (description.toLowerCase().includes('mern')) techs.push('MERN');
    if (techs.length === 0) techs.push('Web Dev');
    return techs;
  };

  const techStack = getTechStack(project.description);

  return (
    <motion.div
      className="project-card glass-card"
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{
        duration: 0.6,
        delay: index * 0.1,
        ease: [0.23, 1, 0.32, 1],
      }}
      whileHover={{
        y: -8,
        scale: 1.02,
      }}
      ref={cardRef}
    >
      <div className="project-image-container">
        <img src={project.image} alt={project.name} className="project-image" />
        <div className="project-overlay">
          <span className="view-text">View Project</span>
        </div>
        <div className="project-badge" style={{ borderColor: getTechBadgeColor(project.name) }}>
          {techStack[0]}
        </div>
      </div>

      <div className="project-content">
        <h3 className="project-name">{project.name}</h3>
        <p className="project-description">{project.description}</p>

        <div className="project-tech-stack">
          {techStack.map((tech, i) => (
            <span key={i} className="tech-badge">
              {tech}
            </span>
          ))}
        </div>

        <a
          href={project.link}
          target="_blank"
          rel="noopener noreferrer"
          className="project-link btn-secondary"
        >
          View Project →
        </a>
      </div>
    </motion.div>
  );
}
