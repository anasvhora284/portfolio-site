import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './PersonalStatement.css';

gsap.registerPlugin(ScrollTrigger);

export default function PersonalStatement() {
  const statementRef = useRef(null);

  useEffect(() => {
    const words = statementRef.current.querySelectorAll('.statement-word');

    gsap.set(words, { opacity: 0, y: 20 });

    ScrollTrigger.create({
      trigger: statementRef.current,
      start: 'top 70%',
      onEnter: () => {
        gsap.to(words, {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.05,
          ease: 'power2.out',
        });
      },
    });
  }, []);

  return (
    <div className="personal-statement-section">
      <div className="statement-container glass-card-heavy">
        <blockquote className="statement-quote" ref={statementRef}>
          <span className="statement-word">I</span>{' '}
          <span className="statement-word">believe</span>{' '}
          <span className="statement-word">in</span>{' '}
          <span className="statement-word">building</span>{' '}
          <span className="statement-word">not</span>{' '}
          <span className="statement-word">just</span>{' '}
          <span className="statement-word highlight">functional</span>,{' '}
          <span className="statement-word">but</span>{' '}
          <span className="statement-word highlight">beautiful</span>{' '}
          <span className="statement-word">and</span>{' '}
          <span className="statement-word highlight">intuitive</span>{' '}
          <span className="statement-word">experiences</span>{' '}
          <span className="statement-word">that</span>{' '}
          <span className="statement-word">make</span>{' '}
          <span className="statement-word">a</span>{' '}
          <span className="statement-word">difference</span>.
        </blockquote>
      </div>
    </div>
  );
}
