import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import './EdgeNavigation.css';

export default function EdgeNavigation() {
  const navigate = useNavigate();
  const [activeEdge, setActiveEdge] = useState(null);
  const [tiltAmount, setTiltAmount] = useState({ x: 0, y: 0 });
  const sceneRef = useRef(null);

  const edges = {
    left: { label: 'Back', action: () => window.history.back() },
    right: { label: 'Work', action: () => navigate('/projects') },
    top: { label: 'About', action: () => navigate('/about') },
    bottom: { label: 'Contact', action: () => navigate('/contact') },
  };

  useEffect(() => {
    const edgeThreshold = 50; // pixels from edge
    const tiltStrength = 3; // degrees

    const handleMouseMove = (e) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;

      let edge = null;
      let tilt = { x: 0, y: 0 };

      // Check edges
      if (clientX < edgeThreshold) {
        edge = 'left';
        tilt.y = -((edgeThreshold - clientX) / edgeThreshold) * tiltStrength;
      } else if (clientX > innerWidth - edgeThreshold) {
        edge = 'right';
        tilt.y = ((clientX - (innerWidth - edgeThreshold)) / edgeThreshold) * tiltStrength;
      }

      if (clientY < edgeThreshold) {
        edge = 'top';
        tilt.x = ((edgeThreshold - clientY) / edgeThreshold) * tiltStrength;
      } else if (clientY > innerHeight - edgeThreshold) {
        edge = 'bottom';
        tilt.x = -((clientY - (innerHeight - edgeThreshold)) / edgeThreshold) * tiltStrength;
      }

      setActiveEdge(edge);
      setTiltAmount(tilt);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    if (sceneRef.current) {
      gsap.to(sceneRef.current, {
        rotateX: tiltAmount.x,
        rotateY: tiltAmount.y,
        duration: 0.5,
        ease: 'power2.out',
      });
    }
  }, [tiltAmount]);

  const handleEdgeClick = (edge) => {
    if (edges[edge]) {
      // Animate transition
      gsap.to('.edge-nav-scene', {
        scale: 0.95,
        opacity: 0,
        duration: 0.3,
        onComplete: () => {
          edges[edge].action();
        },
      });
    }
  };

  return (
    <div className="edge-navigation">
      <div ref={sceneRef} className="edge-nav-scene">
        {Object.entries(edges).map(([position, { label }]) => (
          <div
            key={position}
            className={`edge-zone edge-${position} ${activeEdge === position ? 'active' : ''}`}
            onClick={() => handleEdgeClick(position)}
          >
            <div className="edge-content">
              <span className="edge-label">{label}</span>
              <div className="edge-indicator"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
