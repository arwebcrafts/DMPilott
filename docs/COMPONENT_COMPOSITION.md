# DMPilot Landing Page - Component Composition Examples

This document provides examples of how to compose and use the landing page components effectively.

## Basic Section Composition

### Creating a New Section

Every section should follow this pattern:

```tsx
import { SectionContainer } from '@/components/landing/shared/SectionContainer';
import { SectionHeader } from '@/components/landing/shared/SectionHeader';
import { motion } from 'framer-motion';

export function YourSection() {
  return (
    <SectionContainer padding="xl" id="your-section">
      <SectionHeader
        title="Section Title"
        subtitle="Section Subtitle"
        description="Section description goes here"
        align="center"
        size="lg"
      />
      
      {/* Section content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mt-12"
      >
        {/* Your content */}
      </motion.div>
    </SectionContainer>
  );
}
```

## Shared Component Examples

### CTAButton Usage

```tsx
import { CTAButton } from '@/components/landing/shared/CTAButton';

// Primary button
<CTAButton variant="primary" size="lg" href="/signup">
  Start Free Trial
</CTAButton>

// Secondary button
<CTAButton variant="secondary" size="md" onClick={handleClick}>
  Learn More
</CTAButton>

// Outline button
<CTAButton variant="outline" size="sm" href="/docs">
  Documentation
</CTAButton>

// With loading state
<CTAButton isLoading={loading} disabled={loading}>
  {loading ? 'Processing...' : 'Submit'}
</CTAButton>
```

### EmailCapture Usage

```tsx
import { EmailCapture } from '@/components/landing/shared/EmailCapture';

<EmailCapture
  placeholder="Enter your email"
  buttonText="Get Started"
  onSubmit={(email) => {
    console.log('Email submitted:', email);
    // Handle submission
  }}
/>
```

### StatCard Usage

```tsx
import { StatCard } from '@/components/landing/shared/StatCard';

<StatCard
  value="10,000"
  label="Active Users"
  icon={<Users className="w-6 h-6" />}
  description="Growing daily"
  trend="up"
  trendValue="+25%"
/>

// Without trend
<StatCard
  value="500"
  label="Integrations"
  icon={<Zap className="w-6 h-6" />}
/>
```

### FeatureCard Usage

```tsx
import { FeatureCard } from '@/components/landing/shared/FeatureCard';

<FeatureCard
  icon={<MessageSquare className="w-8 h-8" />}
  title="Auto DM"
  description="Automatically send DMs to everyone who comments on your posts"
/>
```

### TestimonialCard Usage

```tsx
import { TestimonialCard } from '@/components/landing/shared/TestimonialCard';

<TestimonialCard
  quote="DMPilot has completely transformed how I engage with my audience. The automation is seamless and the results are incredible."
  author="Sarah Johnson"
  role="Content Creator"
  avatar="/avatars/sarah.jpg"
  rating={5}
/>
```

### IntegrationCard Usage

```tsx
import { IntegrationCard } from '@/components/landing/shared/IntegrationCard';

<IntegrationCard
  name="Instagram"
  logo="/integrations/instagram.png"
  description="Direct integration with Instagram API"
/>
```

## Data Visualization Examples

### Using TimelineChart

```tsx
import { TimelineChart } from '@/components/landing/data-viz/TimelineChart';

<TimelineChart
  data={[
    { month: 'Jan', value: 1000 },
    { month: 'Feb', value: 1500 },
    { month: 'Mar', value: 2200 },
    { month: 'Apr', value: 3100 },
  ]}
  title="Growth Over Time"
  color="#2563eb"
/>
```

### Using ConversionFunnel

```tsx
import { ConversionFunnel } from '@/components/landing/data-viz/ConversionFunnel';

<ConversionFunnel
  data={[
    { stage: 'Views', value: 10000 },
    { stage: 'Clicks', value: 5000 },
    { stage: 'Sign-ups', value: 1000 },
    { stage: 'Purchases', value: 500 },
  ]}
/>
```

## Section Composition Patterns

### Problem Section Pattern

```tsx
export function Problem() {
  const problems = [
    {
      icon: Clock,
      title: "Time-Consuming",
      description: "Manually responding to comments takes hours every day"
    },
    {
      icon: Users,
      title: "Missed Opportunities",
      description: "Lose potential customers while you're busy"
    },
    {
      icon: TrendingDown,
      title: "Inconsistent Engagement",
      description: "Response times vary, affecting conversion rates"
    }
  ];

  return (
    <SectionContainer padding="xl" id="problem">
      <SectionHeader
        title="The Problem"
        subtitle="Manual DMs Don't Scale"
        description="Creators are losing valuable opportunities by manually managing Instagram engagement"
        align="center"
        size="lg"
      />
      
      <div className="mt-16 grid md:grid-cols-3 gap-8">
        {problems.map((problem, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
          >
            <FeatureCard
              icon={<problem.icon className="w-8 h-8" />}
              title={problem.title}
              description={problem.description}
            />
          </motion.div>
        ))}
      </div>
    </SectionContainer>
  );
}
```

### Social Proof Section Pattern

```tsx
export function SocialProof() {
  const testimonials = [
    {
      quote: "DMPilot increased my conversion rate by 300%",
      author: "John Doe",
      role: "Creator",
      avatar: "/avatars/john.jpg",
      rating: 5
    },
    // ... more testimonials
  ];

  return (
    <SectionContainer padding="xl" id="social-proof">
      <SectionHeader
        title="Trusted by 500+ Creators"
        subtitle="See What Our Users Say"
        description="Join thousands of creators who have transformed their Instagram engagement"
        align="center"
        size="lg"
      />
      
      <div className="mt-16 grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {testimonials.map((testimonial, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
          >
            <TestimonialCard {...testimonial} />
          </motion.div>
        ))}
      </div>
    </SectionContainer>
  );
}
```

## Animation Composition

### Using Animation Utilities

```tsx
import { fadeInUp, staggerContainer, staggerItem, animationProps } from '@/lib/animation';

export function AnimatedSection() {
  const items = [
    { title: 'Item 1', description: 'Description 1' },
    { title: 'Item 2', description: 'Description 2' },
    { title: 'Item 3', description: 'Description 3' },
  ];

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
    >
      {items.map((item, index) => (
        <motion.div
          key={index}
          variants={staggerItem}
          className="p-4"
        >
          <h3>{item.title}</h3>
          <p>{item.description}</p>
        </motion.div>
      ))}
    </motion.div>
  );
}
```

## Responsive Composition

### Using Responsive Utilities

```tsx
import { responsive, isMobile, isDesktop } from '@/lib/responsive';

export function ResponsiveSection() {
  const padding = responsive({
    sm: 'py-8',
    md: 'py-12',
    lg: 'py-16',
    xl: 'py-20',
  }, 'py-12');

  return (
    <section className={padding}>
      {/* Content that adapts to screen size */}
    </section>
  );
}
```

## Error Handling Composition

### Using Error Boundary

```tsx
import { ErrorBoundary } from '@/components/landing/shared/ErrorBoundary';

export function SafeSection() {
  return (
    <ErrorBoundary
      fallback={
        <div className="p-8 text-center">
          <p>Failed to load section</p>
        </div>
      }
    >
      <YourComponent />
    </ErrorBoundary>
  );
}
```

## Complete Page Composition

### Landing Page Structure

```tsx
import { Navigation } from '@/components/landing/shared/Navigation';
import { Hero } from '@/components/landing/sections/Hero';
import { Problem } from '@/components/landing/sections/Problem';
import { Solution } from '@/components/landing/sections/Solution';
// ... other sections
import { Footer } from '@/components/landing/sections/Footer';

export default function LandingPage() {
  return (
    <main className="light-theme">
      <Navigation />
      <Hero />
      <Problem />
      <Solution />
      {/* ... other sections */}
      <Footer />
    </main>
  );
}
```

## Best Practices

### 1. Consistent Spacing
Always use `SectionContainer` for consistent padding across sections.

### 2. Semantic HTML
Use proper HTML elements (section, h1-h6, nav, footer) for accessibility.

### 3. Animation Performance
Use `viewport={{ once: true }}` to prevent re-animations on scroll.

### 4. Responsive Design
Test components on multiple screen sizes using the responsive utilities.

### 5. Error Handling
Wrap complex components in ErrorBoundary for graceful failure.

### 6. Accessibility
Always include ARIA labels and keyboard navigation support.

### 7. Performance
Use dynamic imports for heavy sections below the fold.

### 8. SEO
Include proper meta tags and structured data.

## Common Patterns

### Grid Layout with Staggered Animation

```tsx
<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
  {items.map((item, index) => (
    <motion.div
      key={index}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
    >
      <YourCard {...item} />
    </motion.div>
  ))}
</div>
```

### Centered Content with Max Width

```tsx
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
  {/* Content */}
</div>
```

### Gradient Background Section

```tsx
<section className="bg-gradient-to-br from-blue-600 to-purple-600 text-white">
  <SectionContainer padding="xl">
    {/* Content */}
  </SectionContainer>
</section>
```

---

**Last Updated**: June 2026
**Version**: 1.0
