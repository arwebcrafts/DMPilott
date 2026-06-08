'use client';

import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface TestimonialCardProps {
  quote: string;
  author: string;
  role?: string;
  avatar?: string;
  rating?: number;
  className?: string;
}

export function TestimonialCard({
  quote,
  author,
  role,
  avatar,
  rating = 5,
  className,
}: TestimonialCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={cn(
        'bg-white rounded-xl p-6 shadow-sm border border-gray-100',
        className
      )}
    >
      <div className="flex gap-1 mb-4" aria-label={`Rating: ${rating} out of 5 stars`}>
        {Array.from({ length: rating }).map((_, i) => (
          <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" aria-hidden="true" />
        ))}
      </div>
      
      <blockquote className="text-gray-700 leading-relaxed mb-6">
        "{quote}"
      </blockquote>
      
      <div className="flex items-center gap-3">
        {avatar && (
          <div className="w-12 h-12 relative">
            <Image
              src={avatar}
              alt={author}
              width={48}
              height={48}
              className="rounded-full object-cover"
              unoptimized
            />
          </div>
        )}
        <div>
          <p className="font-semibold text-gray-900">{author}</p>
          {role && <p className="text-sm text-gray-500">{role}</p>}
        </div>
      </div>
    </motion.div>
  );
}
