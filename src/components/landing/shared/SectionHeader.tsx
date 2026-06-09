'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  description?: string;
  align?: 'left' | 'center' | 'right';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  badge?: string;
  className?: string;
}

const sizes = {
  sm: {
    title: 'text-3xl md:text-4xl',
    subtitle: 'text-lg',
  },
  md: {
    title: 'text-4xl md:text-5xl',
    subtitle: 'text-xl',
  },
  lg: {
    title: 'text-5xl md:text-6xl lg:text-7xl',
    subtitle: 'text-2xl',
  },
  xl: {
    title: 'text-6xl md:text-7xl lg:text-8xl',
    subtitle: 'text-3xl',
  },
};

const alignments = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

export function SectionHeader({
  title,
  subtitle,
  description,
  align = 'center',
  size = 'lg',
  badge,
  className,
}: SectionHeaderProps) {
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-100px' }}
      variants={containerVariants}
      className={cn(alignments[align], 'mb-12 md:mb-16', className)}
    >
      {badge && (
        <motion.div
          variants={itemVariants}
          className="inline-block mb-4"
        >
          <span className="inline-flex items-center px-4 py-2 rounded-full font-medium"
            style={{ background: 'var(--surface-0)', color: 'var(--text-secondary)', fontSize: 'var(--font-sm)', borderRadius: 'var(--radius-md)' }}>
            {badge}
          </span>
        </motion.div>
      )}
      
      <motion.h2
        variants={itemVariants}
        className={cn(
          'font-bold tracking-tight',
          align === 'center' && 'mx-auto max-w-3xl'
        )}
        style={{ color: 'var(--text-primary)', fontSize: size === 'xl' ? 'clamp(2.5rem, 6vw, 5rem)' : size === 'lg' ? 'clamp(2rem, 5vw, 4rem)' : size === 'md' ? 'clamp(1.5rem, 4vw, 3rem)' : 'clamp(1.25rem, 3vw, 2.5rem)' }}
      >
        {title}
      </motion.h2>
      
      {subtitle && (
        <motion.p
          variants={itemVariants}
          className={cn(
            'mt-4',
            align === 'center' && 'mx-auto max-w-2xl'
          )}
          style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-base)' }}
        >
          {subtitle}
        </motion.p>
      )}
      
      {description && (
        <motion.p
          variants={itemVariants}
          className={cn(
            'mt-4 leading-relaxed',
            align === 'center' && 'mx-auto max-w-3xl'
          )}
          style={{ color: 'var(--text-muted)', fontSize: 'var(--font-base)' }}
        >
          {description}
        </motion.p>
      )}
    </motion.div>
  );
}
