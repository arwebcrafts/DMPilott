'use client';

import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CompetitorData {
  name: string;
  x: number;
  y: number;
  color: string;
}

interface PositioningMatrixProps {
  competitors: CompetitorData[];
  className?: string;
}

export function PositioningMatrix({ competitors, className }: PositioningMatrixProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      className={cn('w-full h-96', className)}
    >
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            type="number" 
            dataKey="x" 
            name="Ease of Use"
            domain={[0, 100]}
            stroke="#6b7280"
            fontSize={12}
            tick={{ fill: '#6b7280' }}
            label={{ value: 'Ease of Use', position: 'bottom', style: { fill: '#6b7280' } }}
          />
          <YAxis 
            type="number" 
            dataKey="y" 
            name="Features"
            domain={[0, 100]}
            stroke="#6b7280"
            fontSize={12}
            tick={{ fill: '#6b7280' }}
            label={{ value: 'Features', angle: -90, position: 'insideLeft', style: { fill: '#6b7280' } }}
          />
          <Tooltip 
            cursor={{ strokeDasharray: '3 3' }}
            contentStyle={{ 
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
            }}
          />
          {competitors.map((competitor) => (
            <Scatter
              key={competitor.name}
              name={competitor.name}
              data={[competitor]}
              fill={competitor.color}
            />
          ))}
        </ScatterChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
