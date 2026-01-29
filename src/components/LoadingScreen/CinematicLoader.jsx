import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import './CinematicLoader.css';

export default function CinematicLoader({ onComplete }) {
  const [phase, setPhase] = useState('waiting'); // waiting, activated, transitioning, complete
  const [movementProgress, setMovementProgress] = useState(0);
  const [ripples, setRipples] = useState([]);
  const containerRef = useRef(null);
  const circleRef = useRef(null);
  const lastMousePos = useRef({ x: 0, y: 0 });
  const totalMovement = useRef(0);
  const requiredMovement = 500;

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (phase === 'waiting' || phase === 'activated') {
        const dx = e.clientX - lastMousePos.current.x;
        const dy = e.clientY - lastMousePos.current.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        totalMovement.current += distance;
        const progress = Math.min(totalMovement.current / requiredMovement, 1);
        setMovementProgress(progress);

        // Create ripple effect
        if (distance > 2) {
          const newRipple = {
            id: Date.now() + Math.random(),
            x: e.clientX,
            y: e.clientY,
          };
          setRipples((prev) => [...prev.slice(-5), newRipple]);
        }

        lastMousePos.current = { x: e.clientX, y: e.clientY };

        if (progress >= 1 && phase === 'waiting') {
          setPhase('activated');
        }
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [phase]);

  useEffect(() => {
    if (phase === 'activated') {
      gsap.to(circleRef.current, {
        scale: 1.5,
        opacity: 1,
        duration: 0.6,
        ease: 'power2.out',
        onComplete: () => {
          setPhase('transitioning');
          
          // White flash and transition
          gsap.to(containerRef.current, {
            backgroundColor: '#ffffff',
            duration: 0.3,
            ease: 'power2.inOut',
            onComplete: () => {
              setTimeout(() => {
                onComplete();
              }, 500);
            },
          });
        },
      });
    }
  }, [phase, onComplete]);

  // Clean up old ripples
  useEffect(() => {
    const timer = setTimeout(() => {
      setRipples((prev) => prev.slice(1));
    }, 1000);
    return () => clearTimeout(timer);
  }, [ripples]);

  return (
    <div ref={containerRef} className={`cinematic-loader phase-${phase}`}>
      {/* Grain texture */}
      <div className="grain-overlay"></div>

      {/* Ripples */}
      {ripples.map((ripple) => (
        <div
          key={ripple.id}
          className="ripple"
          style={{
            left: ripple.x,
            top: ripple.y,
          }}
        />
      ))}

      {/* Center content */}
      <div className="loader-content">
        {phase === 'waiting' && (
          <>
            <p className="loader-text fade-in">Initializing presence…</p>
            <p className="loader-instruction fade-in-delayed">Move to continue.</p>
            
            {/* Progress indicator */}
            <div className="movement-tracker">
              <div 
                className="movement-fill"
                style={{ width: `${movementProgress * 100}%` }}
              />
            </div>
          </>
        )}

        {phase === 'activated' && (
          <div ref={circleRef} className="activation-circle">
            <div className="circle-inner"></div>
          </div>
        )}
      </div>

      {/* Cursor line follower */}
      <svg className="cursor-line-svg">
        <line
          x1={lastMousePos.current.x}
          y1={lastMousePos.current.y}
          x2={lastMousePos.current.x}
          y2={lastMousePos.current.y}
          stroke="rgba(0, 212, 255, 0.3)"
          strokeWidth="2"
          className="cursor-line"
        />
      </svg>
    </div>
  );
}
