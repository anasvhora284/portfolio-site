import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './SkillsGrid.css';

gsap.registerPlugin(ScrollTrigger);

const skillsData = [
  { name: 'React', proficiency: 90, icon: '⚛️' },
  { name: 'Node.js', proficiency: 85, icon: '🟢' },
  { name: 'MongoDB', proficiency: 80, icon: '🍃' },
  { name: 'JavaScript', proficiency: 90, icon: '📜' },
  { name: 'Three.js', proficiency: 75, icon: '🎨' },
  { name: 'GSAP', proficiency: 80, icon: '✨' },
  { name: 'React Native', proficiency: 85, icon: '📱' },
  { name: 'Express.js', proficiency: 85, icon: '🚂' },
  { name: 'Arduino', proficiency: 70, icon: '🔧' },
  { name: 'Git & GitHub', proficiency: 90, icon: '📦' },
  { name: 'Material-UI', proficiency: 85, icon: '🎨' },
  { name: 'REST APIs', proficiency: 88, icon: '🔌' },
];

export default function SkillsGrid() {
  const gridRef = useRef(null);

  useEffect(() => {
    const cards = gridRef.current.querySelectorAll('.skill-card');
    const bars = gridRef.current.querySelectorAll('.skill-bar-fill');

    gsap.set(cards, { opacity: 0, y: 30, scale: 0.9 });
    gsap.set(bars, { width: 0 });

    ScrollTrigger.create({
      trigger: gridRef.current,
      start: 'top 70%',
      onEnter: () => {
        gsap.to(cards, {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          stagger: 0.08,
          ease: 'back.out(1.7)',
        });

        gsap.to(bars, {
          width: (i) => `${skillsData[i].proficiency}%`,
          duration: 1.5,
          delay: 0.3,
          stagger: 0.08,
          ease: 'power2.out',
        });
      },
    });
  }, []);

  return (
    <div className="skills-section">
      <h2 className="section-title">
        Technical <span className="text-gradient">Skills</span>
      </h2>

      <div className="skills-grid" ref={gridRef}>
        {skillsData.map((skill, index) => (
          <div key={index} className="skill-card glass-card">
            <div className="skill-header">
              <span className="skill-icon">{skill.icon}</span>
              <h3 className="skill-name">{skill.name}</h3>
            </div>

            <div className="skill-bar-container">
              <div className="skill-bar-fill"></div>
            </div>

            <div className="skill-percentage">{skill.proficiency}%</div>
          </div>
        ))}
      </div>
    </div>
  );
}
