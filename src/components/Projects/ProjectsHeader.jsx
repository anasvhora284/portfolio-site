import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import './ProjectsHeader.css';

export default function ProjectsHeader() {
  const titleRef = useRef(null);
  const underlineRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      tl.from(titleRef.current, {
        opacity: 0,
        y: -30,
        duration: 0.8,
        ease: 'power3.out',
      });

      tl.to(
        underlineRef.current,
        {
          width: '100%',
          duration: 0.8,
          ease: 'power2.inOut',
        },
        '-=0.4'
      );
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="projects-header">
      <h1 className="projects-title" ref={titleRef}>
        My <span className="text-gradient">Projects</span>
        <div className="projects-underline" ref={underlineRef}></div>
      </h1>
    </div>
  );
}
