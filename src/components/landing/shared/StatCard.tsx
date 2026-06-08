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
        'bg-white rounded-xl p-6 shadow-sm border border-gray-100',
        'hover:shadow-md transition-shadow duration-200',
        className
      )}
    >
      {icon && (
        <div className="mb-4 text-blue-600">{icon}</div>
      )}
      
      <div className="flex items-baseline gap-2">
        <h3 className="text-4xl font-bold text-gray-900">
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
      
      <p className="mt-2 text-lg font-medium text-gray-700">{label}</p>
      
      {description && (
        <p className="mt-2 text-sm text-gray-500">{description}</p>
      )}
    </motion.div>
  );
}
