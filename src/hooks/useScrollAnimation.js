import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const useScrollAnimation = (animationType = 'fadeIn', options = {}) => {
  const elementRef = useRef(null);

  useEffect(() => {
    if (!elementRef.current) return;

    const element = elementRef.current;
    const defaultOptions = {
      duration: 0.8,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: element,
        start: 'top 80%',
        toggleActions: 'play none none none',
      },
      ...options,
    };

    let animation;

    switch (animationType) {
      case 'fadeIn':
        gsap.set(element, { opacity: 0, y: 30 });
        animation = gsap.to(element, {
          opacity: 1,
          y: 0,
          ...defaultOptions,
        });
        break;

      case 'slideInLeft':
        gsap.set(element, { opacity: 0, x: -50 });
        animation = gsap.to(element, {
          opacity: 1,
          x: 0,
          ...defaultOptions,
        });
        break;

      case 'slideInRight':
        gsap.set(element, { opacity: 0, x: 50 });
        animation = gsap.to(element, {
          opacity: 1,
          x: 0,
          ...defaultOptions,
        });
        break;

      case 'scaleIn':
        gsap.set(element, { opacity: 0, scale: 0.8 });
        animation = gsap.to(element, {
          opacity: 1,
          scale: 1,
          ...defaultOptions,
        });
        break;

      default:
        break;
    }

    return () => {
      if (animation) animation.kill();
    };
  }, [animationType, options]);

  return elementRef;
};

export const useStaggerAnimation = (childSelector, options = {}) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const children = containerRef.current.querySelectorAll(childSelector);
    if (children.length === 0) return;

    const defaultOptions = {
      opacity: 0,
      y: 30,
      duration: 0.6,
      stagger: 0.1,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top 80%',
        toggleActions: 'play none none none',
      },
      ...options,
    };

    gsap.set(children, { opacity: 0, y: 30 });
    const animation = gsap.to(children, defaultOptions);

    return () => {
      animation.kill();
    };
  }, [childSelector, options]);

  return containerRef;
};

export const useParallax = (speed = 0.5) => {
  const elementRef = useRef(null);

  useEffect(() => {
    if (!elementRef.current) return;

    const element = elementRef.current;

    const animation = gsap.to(element, {
      y: () => window.innerHeight * speed,
      ease: 'none',
      scrollTrigger: {
        trigger: element,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
    });

    return () => {
      animation.kill();
    };
  }, [speed]);

  return elementRef;
};
