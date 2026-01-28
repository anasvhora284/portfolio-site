import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './Timeline.css';

gsap.registerPlugin(ScrollTrigger);

const timelineData = [
  {
    year: '2020',
    title: 'Started Learning Code',
    description: 'Began my journey into web development and programming.',
  },
  {
    year: '2021',
    title: 'First Projects',
    description: 'Built my first websites and web applications using HTML, CSS, and JavaScript.',
  },
  {
    year: '2022',
    title: 'Advanced Technologies',
    description: 'Learned React, Node.js, MongoDB and started building full-stack applications.',
  },
  {
    year: '2023',
    title: 'Hardware & IoT',
    description: 'Expanded into hardware projects with Arduino and IoT solutions.',
  },
  {
    year: '2024',
    title: 'Professional Growth',
    description: 'Multiple MERN stack projects, PWAs, and innovative solutions deployed.',
  },
];

export default function Timeline() {
  const timelineRef = useRef(null);
  const lineRef = useRef(null);

  useEffect(() => {
    const cards = timelineRef.current.querySelectorAll('.timeline-card');
    const line = lineRef.current;

    gsap.set(cards, { opacity: 0, x: (i) => (i % 2 === 0 ? -50 : 50) });

    ScrollTrigger.create({
      trigger: timelineRef.current,
      start: 'top 80%',
      end: 'bottom 20%',
      onEnter: () => {
        gsap.to(line, {
          height: '100%',
          duration: 2,
          ease: 'power2.inOut',
        });

        gsap.to(cards, {
          opacity: 1,
          x: 0,
          duration: 0.8,
          stagger: 0.2,
          ease: 'power3.out',
        });
      },
    });
  }, []);

  return (
    <div className="timeline-section" ref={timelineRef}>
      <h2 className="section-title">
        My <span className="text-gradient">Journey</span>
      </h2>

      <div className="timeline-container">
        <div className="timeline-line" ref={lineRef}></div>

        {timelineData.map((item, index) => (
          <div
            key={index}
            className={`timeline-item ${index % 2 === 0 ? 'left' : 'right'}`}
          >
            <div className="timeline-card glass-card">
              <div className="timeline-year">{item.year}</div>
              <h3 className="timeline-title">{item.title}</h3>
              <p className="timeline-description">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
