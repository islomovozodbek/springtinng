import { useEffect, useState, useRef } from 'react';

export function useIntersectionObserver(options = {}) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const targetRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      // If we only want the animation to happen once:
      if (entry.isIntersecting) {
        setIsIntersecting(true);
        if (options.triggerOnce && targetRef.current) {
          observer.unobserve(targetRef.current);
        }
      } else if (!options.triggerOnce) {
        setIsIntersecting(false);
      }
    }, {
      root: options.root || null,
      rootMargin: options.rootMargin || '0px',
      threshold: options.threshold || 0.1,
    });

    const currentRef = targetRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [options.root, options.rootMargin, options.threshold, options.triggerOnce]);

  return [targetRef, isIntersecting];
}
