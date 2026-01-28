import { useState, useEffect, useRef, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import Hero3DModel from './Hero3DModel';
import './HeroSection.css';

export default function HeroSection() {
  const navigate = useNavigate();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const headlineRef = useRef(null);
  const subheadingRef = useRef(null);
  const buttonsRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -(e.clientY / window.innerHeight) * 2 + 1,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      tl.from('.hero-headline .word', {
        opacity: 0,
        y: 50,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power3.out',
      });

      tl.from(
        subheadingRef.current,
        {
          opacity: 0,
          y: 30,
          duration: 0.8,
          ease: 'power3.out',
        },
        '-=0.4'
      );

      tl.from(
        '.hero-button',
        {
          opacity: 0,
          y: 20,
          scale: 0.9,
          duration: 0.6,
          stagger: 0.15,
          ease: 'back.out(1.7)',
        },
        '-=0.4'
      );

      tl.from(
        '.stat-card',
        {
          opacity: 0,
          scale: 0.8,
          y: 30,
          duration: 0.6,
          stagger: 0.1,
          ease: 'back.out(1.7)',
        },
        '-=0.3'
      );

      tl.from(
        '.scroll-indicator',
        {
          opacity: 0,
          y: -20,
          duration: 0.8,
          ease: 'power2.out',
        },
        '-=0.2'
      );
    });

    return () => ctx.revert();
  }, []);

  const handleViewWork = () => {
    navigate('/projects');
  };

  const handleContact = () => {
    navigate('/contact');
  };

  return (
    <div className="hero-section">
      <div className="hero-content">
        <div className="hero-text">
          <h1 className="hero-headline" ref={headlineRef}>
            <span className="word">Creative</span>{' '}
            <span className="word text-gradient">Developer</span>
            <br />
            <span className="word">&</span>{' '}
            <span className="word text-gradient">Innovator</span>
          </h1>

          <p className="hero-subheading" ref={subheadingRef}>
            Building beautiful, functional, and innovative web experiences with cutting-edge
            technologies and creative design.
          </p>

          <div className="hero-buttons" ref={buttonsRef}>
            <button className="hero-button btn-primary" onClick={handleViewWork}>
              View My Work
            </button>
            <button className="hero-button btn-secondary" onClick={handleContact}>
              Let&apos;s Talk
            </button>
          </div>
        </div>

        <div className="hero-3d">
          <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
            <Suspense fallback={null}>
              <Hero3DModel mousePosition={mousePosition} />
              <OrbitControls
                enableZoom={false}
                enablePan={false}
                autoRotate
                autoRotateSpeed={0.5}
              />
            </Suspense>
          </Canvas>
        </div>
      </div>

      <div className="floating-cards">
        <div className="stat-card glass-card">
          <h3 className="stat-number text-gradient">8+</h3>
          <p className="stat-label">Projects</p>
        </div>
        <div className="stat-card glass-card">
          <h3 className="stat-number text-gradient">5+</h3>
          <p className="stat-label">Tech Stacks</p>
        </div>
        <div className="stat-card glass-card">
          <h3 className="stat-number text-gradient">∞</h3>
          <p className="stat-label">Always Learning</p>
        </div>
      </div>

      <div className="scroll-indicator">
        <div className="scroll-arrow"></div>
        <span className="scroll-text">Scroll Down</span>
      </div>
    </div>
  );
}
