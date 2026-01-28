import { useState, useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import Loader3D from './3DLoader';
import './LoadingScreen.css';

export default function LoadingScreen({ onLoadingComplete }) {
  const [progress, setProgress] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const duration = 2000;
    const interval = 20;
    const increment = 100 / (duration / interval);
    
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return Math.min(prev + increment, 100);
      });
    }, interval);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (progress >= 100) {
      setTimeout(() => {
        setFadeOut(true);
        setTimeout(() => {
          onLoadingComplete();
        }, 1000);
      }, 500);
    }
  }, [progress, onLoadingComplete]);

  return (
    <div className={`loading-screen ${fadeOut ? 'fade-out' : ''}`}>
      <div className="loading-background">
        <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
          <Suspense fallback={null}>
            <Loader3D />
            <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
          </Suspense>
        </Canvas>
      </div>

      <div className="loading-content">
        <div className="progress-ring">
          <svg className="progress-svg" viewBox="0 0 120 120">
            <circle
              className="progress-ring-circle-bg"
              cx="60"
              cy="60"
              r="54"
            />
            <circle
              className="progress-ring-circle"
              cx="60"
              cy="60"
              r="54"
              style={{
                strokeDashoffset: 339.292 - (339.292 * progress) / 100,
              }}
            />
          </svg>
          <div className="progress-text">
            <span className="progress-number">{Math.round(progress)}%</span>
          </div>
        </div>

        <div className="loading-text">
          <span>Loading</span>
          <span className="loading-dots">
            <span className="dot">.</span>
            <span className="dot">.</span>
            <span className="dot">.</span>
          </span>
        </div>
      </div>
    </div>
  );
}
