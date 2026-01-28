import { useScrollAnimation } from '../../hooks/useScrollAnimation';
import './ResumeSection.css';

export default function ResumeSection() {
  const sectionRef = useScrollAnimation('fadeIn');

  const handleDownloadResume = () => {
    console.log('Download Resume');
  };

  const handleViewCV = () => {
    console.log('View CV');
  };

  return (
    <div className="resume-section" ref={sectionRef}>
      <div className="resume-container glass-card">
        <h3 className="resume-title">
          Interested in <span className="text-gradient">Working Together</span>?
        </h3>
        <p className="resume-description">
          Check out my resume to learn more about my experience and skills.
        </p>

        <div className="resume-buttons">
          <button className="resume-button btn-primary" onClick={handleDownloadResume}>
            <span className="button-icon">📄</span>
            Download Resume
          </button>
          <button className="resume-button btn-secondary" onClick={handleViewCV}>
            <span className="button-icon">👁️</span>
            View CV
          </button>
        </div>
      </div>
    </div>
  );
}
