import { motion, Variants } from 'framer-motion';

// Animation variants for common patterns
export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' }
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.6, ease: 'easeOut' }
  },
};

export const slideInLeft: Variants = {
  hidden: { x: -50, opacity: 0 },
  visible: { 
    x: 0, 
    opacity: 1,
    transition: { duration: 0.6, ease: 'easeOut' }
  },
};

export const slideInRight: Variants = {
  hidden: { x: 50, opacity: 0 },
  visible: { 
    x: 0, 
    opacity: 1,
    transition: { duration: 0.6, ease: 'easeOut' }
  },
};

export const scaleIn: Variants = {
  hidden: { scale: 0.9, opacity: 0 },
  visible: { 
    scale: 1, 
    opacity: 1,
    transition: { duration: 0.6, ease: 'easeOut' }
  },
};

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' }
  },
};

// Check if user prefers reduced motion
export const prefersReducedMotion = () => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// Get animation duration based on motion preference
export const getAnimationDuration = (defaultDuration: number) => {
  return prefersReducedMotion() ? 0.01 : defaultDuration;
};

// Get animation variants with reduced motion support
export const getVariants = (variants: Variants) => {
  if (prefersReducedMotion()) {
    return {
      hidden: { ...variants.hidden },
      visible: { 
        ...variants.visible,
        transition: { duration: 0.01 }
      }
    };
  }
  return variants;
};

// Common animation props
export const animationProps = {
  initial: 'hidden',
  whileInView: 'visible',
  viewport: { once: true, margin: '-100px' },
};

// Hover animation variants
export const hoverScale: Variants = {
  rest: { scale: 1 },
  hover: { 
    scale: 1.05,
    transition: { duration: 0.2, ease: 'easeInOut' }
  },
};

export const hoverLift: Variants = {
  rest: { y: 0 },
  hover: { 
    y: -8,
    transition: { duration: 0.3, ease: 'easeInOut' }
  },
};

// Pulse animation
export const pulse: Variants = {
  animate: {
    scale: [1, 1.05, 1],
    opacity: [1, 0.8, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

// Typing animation for text
export const typingText = (text: string, delay: number = 0) => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delay,
      duration: 0.5,
    },
  },
});

// Counter animation
export const counterAnimation = (from: number, to: number, duration: number = 2) => ({
  initial: { count: from },
  animate: { 
    count: to,
    transition: {
      duration,
      ease: 'easeOut',
    },
  },
});
