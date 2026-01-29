import { useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import gsap from 'gsap';
import AbstractShape from './AbstractShape';
import './FloatingLettersHero.css';

export default function FloatingLettersHero() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const heroRef = useRef(null);
  const lettersRefs = useRef([]);

  const name = "ANAS VHORA";
  const letters = name.split('');

  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      setMousePos({ x, y });

      // Magnetic repulsion effect for letters
      lettersRefs.current.forEach((letter, index) => {
        if (letter) {
          const rect = letter.getBoundingClientRect();
          const letterX = rect.left + rect.width / 2;
          const letterY = rect.top + rect.height / 2;

          const dx = e.clientX - letterX;
          const dy = e.clientY - letterY;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const maxDistance = 150;

          if (distance < maxDistance) {
            const force = (maxDistance - distance) / maxDistance;
            const repelX = -(dx / distance) * force * 30;
            const repelY = -(dy / distance) * force * 30;

            gsap.to(letter, {
              x: repelX,
              y: repelY,
              duration: 0.3,
              ease: 'power2.out',
            });
          } else {
            gsap.to(letter, {
              x: 0,
              y: 0,
              duration: 0.5,
              ease: 'elastic.out(1, 0.5)',
            });
          }
        }
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    // Entry animation
    const tl = gsap.timeline();

    tl.from(lettersRefs.current, {
      opacity: 0,
      scale: 0,
      y: 100,
      rotation: () => gsap.utils.random(-45, 45),
      duration: 1,
      stagger: {
        each: 0.05,
        from: 'random',
      },
      ease: 'back.out(2)',
    });

    tl.from('.hero-subtitle', {
      opacity: 0,
      y: 30,
      duration: 0.8,
      ease: 'power2.out',
    }, '-=0.5');

  }, []);

  return (
    <div className="floating-letters-hero" ref={heroRef}>
      {/* Background gradient with noise */}
      <div className="hero-background">
        <div className="gradient-layer"></div>
        <div className="noise-layer"></div>
      </div>

      {/* 3D Abstract Shape */}
      <div className="abstract-shape-container">
        <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
          <AbstractShape mousePosition={mousePos} />
        </Canvas>
      </div>

      {/* Floating scattered letters */}
      <div className="letters-container">
        {letters.map((letter, index) => (
          <span
            key={index}
            ref={(el) => (lettersRefs.current[index] = el)}
            className={`floating-letter ${letter === ' ' ? 'space' : ''}`}
            style={{
              '--initial-x': `${gsap.utils.random(-20, 20)}px`,
              '--initial-y': `${gsap.utils.random(-20, 20)}px`,
              '--initial-rotation': `${gsap.utils.random(-5, 5)}deg`,
            }}
          >
            {letter}
          </span>
        ))}
      </div>

      {/* Subtitle with blur effect */}
      <p className="hero-subtitle">
        Creative Developer<br/>
        Designing interactions, not pages.
      </p>

      {/* Edge navigation hints */}
      <div className="edge-hints">
        <div className="edge-hint edge-left" data-label="Back"></div>
        <div className="edge-hint edge-right" data-label="Work"></div>
        <div className="edge-hint edge-top" data-label="About"></div>
        <div className="edge-hint edge-bottom" data-label="Contact"></div>
      </div>

      {/* Explore whisper */}
      <div className="explore-hint">
        <span>Explore →</span>
      </div>
    </div>
  );
}
