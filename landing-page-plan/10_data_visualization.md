# DMPilot Landing Page Implementation Plan
## Part 10: Data Visualization

---

## Table of Contents
- [Data Visualization Strategy](#data-visualization-strategy)
- [Recharts Setup](#recharts-setup)
- [Chart Components](#chart-components)
- [Data Sources](#data-sources)
- [Responsive Charts](#responsive-charts)
- [Accessibility](#accessibility)
- [Performance](#performance)

---

## Data Visualization Strategy

### Philosophy

Data visualizations on the DMPilot landing page serve to:
1. **Build Credibility**: Support claims with data
2. **Simplify Complexity**: Make complex data understandable
3. **Tell Stories**: Guide users through narratives with data
4. **Provide Context**: Show the problem and solution visually

### Principles

1. **Clarity Over Complexity**: Simple, clear charts
2. **Context Always**: Explain what the data means
3. **Source Attribution**: Always cite data sources
4. **Mobile First**: Charts must work on small screens
5. **Accessible**: Colorblind-friendly, keyboard navigable

---

## Recharts Setup

### Installation

```bash
npm install recharts
```

### Basic Configuration

```typescript
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
```

### Custom Tooltip

```typescript
'use client';

import { TooltipProps } from 'recharts';

export function CustomTooltip({ active, payload, label }: TooltipProps<any, any>) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
        <p className="text-sm font-medium text-gray-900">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm text-gray-600">
            <span style={{ color: entry.color }}>{entry.name}:</span>{' '}
            {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
}
```

---

## Chart Components

### 1. Timeline Chart (Line Chart)

**Purpose**: Show response time vs conversion rate over time.

**Data Structure**:
```typescript
interface TimelineData {
  label: string;
  before: number;
  after: number;
}

const timelineData: TimelineData[] = [
  { label: '0-1 hr', before: 45, after: 42 },
  { label: '1-4 hrs', before: 30, after: 28 },
  { label: '4-12 hrs', before: 15, after: 14 },
  { label: '12+ hrs', before: 5, after: 4 },
];
```

**Implementation**:
```typescript
'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { motion } from 'framer-motion';

export function TimelineChart({ data }: { data: TimelineData[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      className="w-full h-80"
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="label" 
            stroke="#6b7280"
            fontSize={12}
            tick={{ fill: '#6b7280' }}
          />
          <YAxis 
            stroke="#6b7280"
            fontSize={12}
            tick={{ fill: '#6b7280' }}
            label={{ value: 'Conversion %', angle: -90, position: 'insideLeft', style: { fill: '#6b7280' } }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="before" 
            stroke="#ef4444" 
            strokeWidth={2}
            name="Before DMPilot"
            dot={{ fill: '#ef4444', r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line 
            type="monotone" 
            dataKey="after" 
            stroke="#3b82f6" 
            strokeWidth={2}
            name="With DMPilot"
            dot={{ fill: '#3b82f6', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
```

### 2. Comparison Bar Chart

**Purpose**: Compare manual vs automated response times.

**Data Structure**:
```typescript
interface ComparisonData {
  label: string;
  hours: number;
}

const comparisonData: ComparisonData[] = [
  { label: 'Manual', hours: 12 },
  { label: 'DMPilot', hours: 0.08 }, // 5 minutes
];
```

**Implementation**:
```typescript
'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

export function ComparisonBarChart({ data }: { data: ComparisonData[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      className="w-full h-64"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            type="number"
            stroke="#6b7280"
            fontSize={12}
            tick={{ fill: '#6b7280' }}
          />
          <YAxis 
            type="category"
            dataKey="label"
            stroke="#6b7280"
            fontSize={12}
            tick={{ fill: '#6b7280' }}
            width={80}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="hours" radius={[0, 4, 4, 0]}>
            {data.map((entry, index) => (
              <defs key={index}>
                <linearGradient id={`gradient-${index}`} x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor={index === 0 ? '#9ca3af' : '#3b82f6'} stopOpacity={0.8} />
                  <stop offset="100%" stopColor={index === 0 ? '#6b7280' : '#2563eb'} stopOpacity={1} />
                </linearGradient>
              </defs>
            ))}
            {data.map((entry, index) => (
              <rect key={index} fill={`url(#gradient-${index})`} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
```

### 3. Conversion Funnel Chart

**Purpose**: Show the comment-to-customer journey.

**Data Structure**:
```typescript
interface FunnelData {
  stage: string;
  value: number;
  color: string;
}

const funnelData: FunnelData[] = [
  { stage: 'Comments', value: 1000, color: '#3b82f6' },
  { stage: 'DMs Sent', value: 800, color: '#60a5fa' },
  { stage: 'Responses', value: 600, color: '#93c5fd' },
  { stage: 'Sales', value: 300, color: '#bfdbfe' },
];
```

**Implementation**:
```typescript
'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

export function ConversionFunnel({ data }: { data: FunnelData[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="w-full h-80"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            type="number"
            stroke="#6b7280"
            fontSize={12}
            tick={{ fill: '#6b7280' }}
          />
          <YAxis 
            type="category"
            dataKey="stage"
            stroke="#6b7280"
            fontSize={12}
            tick={{ fill: '#6b7280' }}
            width={100}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
            {data.map((entry, index) => (
              <defs key={index}>
                <linearGradient id={`funnel-gradient-${index}`} x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor={entry.color} stopOpacity={0.8} />
                  <stop offset="100%" stopColor={entry.color} stopOpacity={1} />
                </linearGradient>
              </defs>
            ))}
            {data.map((entry, index) => (
              <rect key={index} fill={`url(#funnel-gradient-${index})`} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
```

### 4. Positioning Matrix (Scatter Chart)

**Purpose**: Position DMPilot against competitors on ease of use vs features.

**Data Structure**:
```typescript
interface CompetitorData {
  name: string;
  x: number; // Ease of use (0-100)
  y: number; // Features (0-100)
  color: string;
}

const competitorData: CompetitorData[] = [
  { name: 'DMPilot', x: 85, y: 90, color: '#3b82f6' },
  { name: 'Competitor A', x: 60, y: 70, color: '#9ca3af' },
  { name: 'Competitor B', x: 40, y: 80, color: '#9ca3af' },
  { name: 'Competitor C', x: 70, y: 50, color: '#9ca3af' },
];
```

**Implementation**:
```typescript
'use client';

import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

export function PositioningMatrix({ competitors }: { competitors: CompetitorData[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      className="w-full h-96"
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
            content={<CustomTooltip />}
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
```

### 5. Animated Statistic Display

**Purpose**: Display key statistics with animated counters.

**Implementation**:
```typescript
'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';

interface StatisticProps {
  value: number;
  label: string;
  prefix?: string;
  suffix?: string;
}

function AnimatedCounter({ value, prefix = '', suffix = '' }: StatisticProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (isInView) {
      const duration = 2000;
      const steps = 60;
      const increment = value / steps;
      let current = 0;
      
      const timer = setInterval(() => {
        current += increment;
        if (current >= value) {
          setCount(value);
          clearInterval(timer);
        } else {
          setCount(Math.floor(current));
        }
      }, duration / steps);
      
      return () => clearInterval(timer);
    }
  }, [isInView, value]);

  return (
    <span ref={ref}>
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
}

export function StatisticDisplay({ statistics }: { statistics: StatisticProps[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
      {statistics.map((stat, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.1 }}
          className="text-center"
        >
          <div className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
            <AnimatedCounter
              value={stat.value}
              prefix={stat.prefix}
              suffix={stat.suffix}
            />
          </div>
          <p className="text-gray-600">{stat.label}</p>
        </motion.div>
      ))}
    </div>
  );
}
```

---

## Data Sources

### Credible Sources

All data on the landing page should be sourced from credible sources:

1. **Instagram Business Survey** - Official Instagram data
2. **Harvard Business Review** - Peer-reviewed research
3. **DMPilot Internal Data** - Anonymized user data
4. **Industry Reports** - Social media industry benchmarks

### Data Attribution

Always include source attribution near data visualizations:

```typescript
const dataSource = {
  label: 'Source',
  value: 'Instagram Business Survey 2024',
};
```

Display source below charts:
```typescript
<p className="text-sm text-gray-500 mt-2">
  Source: Instagram Business Survey 2024
</p>
```

---

## Responsive Charts

### Mobile Optimization

Charts must work well on mobile devices:

1. **Simplify**: Reduce data points on mobile
2. **Resize**: Use ResponsiveContainer for automatic resizing
3. **Touch**: Ensure touch targets are large enough
4. **Orientation**: Support both portrait and landscape

### Responsive Data

```typescript
const getResponsiveData = (isMobile: boolean) => {
  if (isMobile) {
    // Simplified data for mobile
    return data.slice(0, 5);
  }
  return data;
};
```

### Responsive Typography

```typescript
<ResponsiveContainer width="100%" height="100%">
  <LineChart data={data}>
    <XAxis 
      dataKey="label" 
      fontSize={isMobile ? 10 : 12}
    />
    {/* ... */}
  </LineChart>
</ResponsiveContainer>
```

---

## Accessibility

### Color Blindness

Use colorblind-friendly palettes:

```typescript
const colorblindPalette = {
  blue: '#3b82f6',
  orange: '#f97316',
  green: '#22c55e',
  purple: '#a855f7',
  pink: '#ec4899',
};
```

### Keyboard Navigation

Charts should be keyboard accessible:

```typescript
<div role="img" aria-label="Line chart showing response time vs conversion rate">
  <LineChart />
</div>
```

### Screen Readers

Provide text alternatives:

```typescript
<div aria-hidden="true">
  <LineChart />
</div>

<div className="sr-only">
  Line chart showing response time vs conversion rate:
  - 0-1 hours: 45% conversion
  - 1-4 hours: 30% conversion
  - 4-12 hours: 15% conversion
  - 12+ hours: 5% conversion
</div>
```

---

## Performance

### Lazy Loading

Load charts only when needed:

```typescript
import dynamic from 'next/dynamic';

const TimelineChart = dynamic(
  () => import('./TimelineChart'),
  { 
    loading: () => <ChartSkeleton />,
    ssr: false 
  }
);
```

### Chart Skeleton

```typescript
export function ChartSkeleton() {
  return (
    <div className="w-full h-80 bg-gray-100 rounded-lg animate-pulse" />
  );
}
```

### Optimize Data

Keep data sets small:

```typescript
// Good - 10 data points
const goodData = Array.from({ length: 10 }, (_, i) => ({
  label: `Point ${i}`,
  value: Math.random() * 100,
}));

// Avoid - 1000 data points
const badData = Array.from({ length: 1000 }, (_, i) => ({
  label: `Point ${i}`,
  value: Math.random() * 100,
}));
```

---

## Data Visualization Best Practices

### Do's

1. **Keep it simple**: One message per chart
2. **Use consistent colors**: Same meaning across charts
3. **Label everything**: Axes, legends, tooltips
4. **Provide context**: Explain what the data means
5. **Cite sources**: Build trust with attribution
6. **Test on mobile**: Ensure charts work on small screens

### Don'ts

1. **Don't overcomplicate**: Avoid 3D, excessive decorations
2. **Don't mislead**: Use appropriate scales and baselines
3. **Don't clutter**: Remove unnecessary elements
4. **Don't use too many colors**: Stick to 3-5 colors max
5. **Don't ignore accessibility**: Ensure colorblind-friendly
6. **Don't forget context**: Data without meaning is useless
