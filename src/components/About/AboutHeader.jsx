import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import './AboutHeader.css';

export default function AboutHeader() {
  const headerRef = useRef(null);
  const underlineRef = useRef(null);
  const bioRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      tl.from(headerRef.current, {
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

      tl.from(
        bioRef.current,
        {
          opacity: 0,
          y: 20,
          duration: 0.8,
          ease: 'power2.out',
        },
        '-=0.4'
      );
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="about-header">
      <div className="about-header-content">
        <h1 className="about-title" ref={headerRef}>
          About <span className="text-gradient">Me</span>
          <div className="title-underline" ref={underlineRef}></div>
        </h1>

        <p className="about-bio" ref={bioRef}>
          I&apos;m a passionate developer who loves creating innovative solutions that combine 
          beautiful design with powerful functionality. My journey in tech has been driven by 
          curiosity and a desire to build things that make a difference.
        </p>
      </div>
    </div>
  );
}
