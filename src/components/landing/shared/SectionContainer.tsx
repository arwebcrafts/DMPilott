'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SectionContainerProps {
  children: React.ReactNode;
  id?: string;
  className?: string;
  variant?: 'default' | 'light' | 'dark' | 'gradient';
  padding?: 'sm' | 'md' | 'lg' | 'xl';
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

const variants = {
  default: 'bg-white',
  light: 'bg-gray-50',
  dark: 'bg-gray-900',
  gradient: 'bg-gradient-to-b from-gray-50 to-white',
};

const paddings = {
  sm: 'py-12 md:py-16',
  md: 'py-16 md:py-24',
  lg: 'py-20 md:py-32',
  xl: 'py-24 md:py-40',
};

const maxWidths = {
  sm: 'max-w-3xl',
  md: 'max-w-4xl',
  lg: 'max-w-6xl',
  xl: 'max-w-7xl',
  full: 'max-w-full',
};

export function SectionContainer({
  children,
  id,
  className,
  variant = 'default',
  padding = 'lg',
  maxWidth = 'xl',
}: SectionContainerProps) {
  return (
    <section
      id={id}
      className={cn(
        variants[variant],
        paddings[padding],
        'w-full',
        className
      )}
    >
      <div className={cn('mx-auto px-4 sm:px-6 lg:px-8', maxWidths[maxWidth])}>
        {children}
      </div>
    </section>
  );
}
