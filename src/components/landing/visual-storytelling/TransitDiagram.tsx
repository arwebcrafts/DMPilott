'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

interface TransitLine {
  name: string;
  color: string;
  description: string;
}

const lines: TransitLine[] = [
  { name: 'Instagram', color: '#E1306C', description: 'DMs & Comments' },
  { name: 'Slack', color: '#4A154B', description: 'Team notifications' },
  { name: 'Gmail', color: '#EA4335', description: 'Email sync' },
  { name: 'Notion', color: '#000000', description: 'Task tracking' },
  { name: 'Mobile', color: '#666666', description: 'On the go' },
  { name: 'Web & Mac', color: '#999999', description: 'Desktop app' },
];

export function TransitDiagram() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const positions = lines.map((_, index) => {
    const angle = (index / lines.length) * 360;
    const radius = 150;
    const x = Math.cos((angle * Math.PI) / 180) * radius;
    const y = Math.sin((angle * Math.PI) / 180) * radius;
    return { x, y };
  });

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 text-green-700 text-sm font-medium">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          DMPilot TRANSIT · LIVE
        </div>
        <p className="mt-2 text-gray-600">All lines running</p>
      </div>
      
      <div className="relative h-96">
        {/* Central hub */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-gray-900 rounded-full flex items-center justify-center z-10">
          <span className="text-white font-bold text-sm">DMPilot</span>
        </div>
        
        {/* Transit lines */}
        {mounted && lines.map((line, index) => {
          const { x, y } = positions[index];
          
          return (
            <motion.div
              key={line.name}
              initial={{ opacity: 0, scale: 0 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="absolute"
              style={{
                left: `calc(50% + ${x}px)`,
                top: `calc(50% + ${y}px)`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <div className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xs"
                style={{ backgroundColor: line.color }}
              >
                {line.name}
              </div>
              <div className="mt-2 text-center">
                <p className="text-xs text-gray-600">{line.description}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
      
      <div className="mt-12 text-center">
        <p className="text-lg font-medium text-gray-900">Six places it can come from.</p>
        <p className="text-gray-600">One inbox it lands in.</p>
      </div>
    </div>
  );
}
