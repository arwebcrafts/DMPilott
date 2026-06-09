'use client';

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  value: string | number;
  label: string;
  icon?: React.ReactNode;
  description?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  className?: string;
}

export function StatCard({
  value,
  label,
  icon,
  description,
  trend,
  trendValue,
  className,
}: StatCardProps) {
  const trendIcons = {
    up: <TrendingUp className="h-4 w-4 text-green-600" />,
    down: <TrendingDown className="h-4 w-4 text-red-600" />,
    neutral: <Minus className="h-4 w-4 text-gray-400" />,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={cn(
        'p-6 border hover:shadow-md transition-shadow duration-200',
        className
      )}
      style={{ background: 'var(--surface-1)', borderColor: 'var(--surface-2)', borderRadius: 'var(--radius-sm)', boxShadow: 'var(--shadow-sm)' }}
    >
      {icon && (
        <div className="mb-4" style={{ color: 'var(--accent)' }}>{icon}</div>
      )}
      
      <div className="flex items-baseline gap-2">
        <h3 className="font-bold" style={{ color: 'var(--text-primary)', fontSize: 'clamp(2rem, 4vw, 3rem)' }}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </h3>
        {trend && trendValue && (
          <div className="flex items-center gap-1 text-sm">
            {trendIcons[trend]}
            <span className={cn(
              trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-400'
            )}>
              {trendValue}
            </span>
          </div>
        )}
      </div>
      
      <p className="mt-2 font-medium" style={{ color: 'var(--text-primary)', fontSize: 'var(--font-lg)' }}>
        {label}
      </p>
      
      {description && (
        <p className="mt-2" style={{ color: 'var(--text-muted)', fontSize: 'var(--font-sm)' }}>
          {description}
        </p>
      )}
    </motion.div>
  );
}
