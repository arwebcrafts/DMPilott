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
    title: 'text-2xl md:text-3xl',
    subtitle: 'text-lg',
  },
  md: {
    title: 'text-3xl md:text-4xl',
    subtitle: 'text-xl',
  },
  lg: {
    title: 'text-4xl md:text-5xl',
    subtitle: 'text-2xl',
  },
  xl: {
    title: 'text-5xl md:text-6xl',
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
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
            {badge}
          </span>
        </motion.div>
      )}
      
      <motion.h2
        variants={itemVariants}
        className={cn(
          sizes[size].title,
          'font-bold text-gray-900 tracking-tight',
          align === 'center' && 'mx-auto max-w-3xl'
        )}
      >
        {title}
      </motion.h2>
      
      {subtitle && (
        <motion.p
          variants={itemVariants}
          className={cn(
            sizes[size].subtitle,
            'mt-4 text-gray-600',
            align === 'center' && 'mx-auto max-w-2xl'
          )}
        >
          {subtitle}
        </motion.p>
      )}
      
      {description && (
        <motion.p
          variants={itemVariants}
          className={cn(
            'mt-4 text-lg text-gray-500 leading-relaxed',
            align === 'center' && 'mx-auto max-w-3xl'
          )}
        >
          {description}
        </motion.p>
      )}
    </motion.div>
  );
}
