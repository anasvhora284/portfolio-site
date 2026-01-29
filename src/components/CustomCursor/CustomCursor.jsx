import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import './CustomCursor.css';

export default function CustomCursor({ mode = 'default', label = '' }) {
  const cursorRef = useRef(null);
  const trailRefs = useRef([]);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const mousePos = useRef({ x: 0, y: 0 });
  const cursorPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    document.body.style.cursor = 'none';

    const handleMouseMove = (e) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      setPosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);

    const animate = () => {
      const dx = mousePos.current.x - cursorPos.current.x;
      const dy = mousePos.current.y - cursorPos.current.y;

      cursorPos.current.x += dx * 0.15;
      cursorPos.current.y += dy * 0.15;

      if (cursorRef.current) {
        gsap.to(cursorRef.current, {
          x: cursorPos.current.x,
          y: cursorPos.current.y,
          duration: 0,
          overwrite: 'auto',
        });
      }

      trailRefs.current.forEach((trail, index) => {
        if (trail) {
          const delay = (index + 1) * 0.03;
          const targetX = mousePos.current.x;
          const targetY = mousePos.current.y;

          gsap.to(trail, {
            x: targetX,
            y: targetY,
            duration: 0.3 + delay,
            ease: 'power2.out',
            overwrite: 'auto',
          });
        }
      });

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.body.style.cursor = 'auto';
    };
  }, []);

  useEffect(() => {
    if (cursorRef.current) {
      cursorRef.current.className = `custom-cursor cursor-${mode}`;
    }
  }, [mode]);

  return (
    <>
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          ref={(el) => (trailRefs.current[i] = el)}
          className="cursor-trail"
          style={{
            opacity: 1 - i * 0.15,
            transform: `translate(-50%, -50%) scale(${1 - i * 0.1})`,
          }}
        />
      ))}
      
      <div ref={cursorRef} className={`custom-cursor cursor-${mode}`}>
        <div className="cursor-inner">
          {label && <span className="cursor-label">{label}</span>}
        </div>
      </div>
    </>
  );
}
