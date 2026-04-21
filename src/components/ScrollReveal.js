'use client';

import React from 'react';
import styles from './ScrollReveal.module.css';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';

export default function ScrollReveal({ 
  children, 
  animation = 'fadeUp', // fadeUp, slideLeft, slideRight, scaleUp, fadeIn
  delay = 0, // 0, 100, 200, 300, 400, 500
  triggerOnce = true,
  threshold = 0.1,
  className = ''
}) {
  const [ref, isIntersecting] = useIntersectionObserver({ triggerOnce, threshold });

  const animationClass = styles[animation] || styles.fadeUp;
  const delayClass = delay > 0 ? styles[`delay${delay}`] : '';
  const revealedClass = isIntersecting ? styles.isReveled : '';

  return (
    <div 
      ref={ref} 
      className={`${styles.revealWrapper} ${animationClass} ${delayClass} ${revealedClass} ${className}`}
    >
      {children}
    </div>
  );
}
