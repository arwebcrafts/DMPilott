'use client';

import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface IntegrationCardProps {
  name: string;
  logo: string;
  description?: string;
  className?: string;
}

export function IntegrationCard({
  name,
  logo,
  description,
  className,
}: IntegrationCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      whileHover={{ scale: 1.05 }}
      className={cn(
        'bg-white rounded-xl p-6 shadow-sm border border-gray-100',
        'hover:shadow-lg transition-all duration-200',
        'flex flex-col items-center justify-center text-center',
        className
      )}
    >
      <div className="w-16 h-16 mb-4 relative">
        <Image
          src={logo}
          alt={name}
          width={64}
          height={64}
          className="object-contain"
          unoptimized
        />
      </div>
      <h3 className="font-semibold text-gray-900 mb-1">{name}</h3>
      {description && (
        <p className="text-sm text-gray-500">{description}</p>
      )}
      <ExternalLink className="mt-3 h-4 w-4 text-gray-400" aria-hidden="true" />
    </motion.div>
  );
}
