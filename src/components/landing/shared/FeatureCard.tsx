'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  className?: string;
}

export function FeatureCard({
  icon,
  title,
  description,
  className,
}: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -4 }}
      className={cn(
        'p-6 border hover:shadow-lg transition-all duration-200',
        className
      )}
      style={{ background: 'var(--surface-1)', borderColor: 'var(--surface-2)', borderRadius: 'var(--radius-sm)', boxShadow: 'var(--shadow-sm)' }}
    >
      <div className="mb-4" style={{ color: 'var(--accent)' }}>{icon}</div>
      <h3 className="font-semibold mb-2" style={{ color: 'var(--text-primary)', fontSize: 'var(--font-lg)' }}>
        {title}
      </h3>
      <p className="leading-relaxed" style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-base)' }}>
        {description}
      </p>
    </motion.div>
  );
}
