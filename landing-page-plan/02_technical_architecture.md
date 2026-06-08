# DMPilot Landing Page Implementation Plan
## Part 2: Technical Architecture

---

## Table of Contents
- [Tech Stack Overview](#tech-stack-overview)
- [Project Structure](#project-structure)
- [Next.js Configuration](#nextjs-configuration)
- [Component Architecture](#component-architecture)
- [State Management](#state-management)
- [Data Flow](#data-flow)
- [API Integration](#api-integration)
- [Performance Considerations](#performance-considerations)
- [Security Considerations](#security-considerations)

---

## Tech Stack Overview

### Core Framework
- **Next.js 16.2.3**: React framework with App Router for server-side rendering, static generation, and API routes
- **React 19.2.4**: UI library with latest features including Server Components and improved hooks

### Styling
- **Tailwind CSS 4**: Utility-first CSS framework with JIT compiler for optimal performance
- **PostCSS**: CSS transformation tool for Tailwind processing

### UI Components
- **Radix UI**: Unstyled, accessible component primitives
  - @radix-ui/react-dialog
  - @radix-ui/react-dropdown-menu
  - @radix-ui/react-select
  - @radix-ui/react-tabs
  - @radix-ui/react-tooltip
  - @radix-ui/react-accordion
- **Lucide React**: Icon library with 1000+ consistent icons

### Animation
- **Framer Motion**: Production-ready motion library for React
  - Smooth animations and transitions
  - Gesture support
  - Scroll-triggered animations
  - Layout animations

### Data Visualization
- **Recharts**: Composable charting library built on D3
  - Line charts for timeline data
  - Bar charts for comparisons
  - Pie charts for distributions
  - Custom components for specialized visualizations

### State Management
- **Zustand**: Lightweight state management
  - User authentication state
  - Form state
  - UI state (modals, accordions)

### Backend Services
- **Supabase**: Backend-as-a-Service
  - Authentication
  - Database
  - Real-time subscriptions
  - Edge functions

### Development Tools
- **TypeScript**: Type safety and better developer experience
- **ESLint**: Code linting and formatting
- **Prettier**: Code formatting

---

## Project Structure

```
dmpilot-2/
├── src/
│   ├── app/
│   │   ├── (landing)/
│   │   │   ├── page.tsx              # Main landing page
│   │   │   ├── layout.tsx            # Landing page layout
│   │   │   └── globals.css           # Landing page styles
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   └── [...nextauth]/
│   │   │   │       └── route.ts      # NextAuth configuration
│   │   │   ├── waitlist/
│   │   │   │   └── route.ts          # Waitlist signup endpoint
│   │   │   └── analytics/
│   │   │       └── route.ts          # Analytics tracking endpoint
│   │   └── layout.tsx                # Root layout
│   ├── components/
│   │   ├── landing/
│   │   │   ├── sections/
│   │   │   │   ├── Hero.tsx
│   │   │   │   ├── Problem.tsx
│   │   │   │   ├── DataVisualization.tsx
│   │   │   │   ├── Solution.tsx
│   │   │   │   ├── ProductDemo.tsx
│   │   │   │   ├── TargetAudience.tsx
│   │   │   │   ├── Values.tsx
│   │   │   │   ├── Comparison.tsx
│   │   │   │   ├── Integrations.tsx
│   │   │   │   ├── SocialProof.tsx
│   │   │   │   ├── FAQ.tsx
│   │   │   │   ├── FinalCTA.tsx
│   │   │   │   └── Footer.tsx
│   │   │   ├── shared/
│   │   │   │   ├── SectionContainer.tsx
│   │   │   │   ├── SectionHeader.tsx
│   │   │   │   ├── CTAButton.tsx
│   │   │   │   ├── EmailCapture.tsx
│   │   │   │   ├── StatCard.tsx
│   │   │   │   ├── FeatureCard.tsx
│   │   │   │   ├── TestimonialCard.tsx
│   │   │   │   └── IntegrationCard.tsx
│   │   │   └── data-viz/
│   │   │       ├── TimelineChart.tsx
│   │   │       ├── PositioningMatrix.tsx
│   │   │       ├── ConversionFunnel.tsx
│   │   │       ├── IntegrationMap.tsx
│   │   │       └── StatisticDisplay.tsx
│   │   └── ui/                      # Radix UI components
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts            # Supabase client
│   │   │   ├── server.ts            # Supabase server client
│   │   │   └── auth.ts              # Auth utilities
│   │   ├── analytics.ts             # Analytics tracking
│   │   └── utils.ts                 # Utility functions
│   ├── stores/
│   │   ├── landingStore.ts          # Landing page state
│   │   └── userStore.ts             # User state
│   └── types/
│       ├── landing.ts               # Landing page types
│       └── api.ts                   # API types
├── public/
│   ├── images/
│   │   ├── hero/
│   │   ├── demo/
│   │   └── logos/
│   └── fonts/
├── landing-page-plan/               # Implementation plan docs
└── package.json
```

---

## Next.js Configuration

### next.config.ts
```typescript
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Image optimization
  images: {
    domains: ['images.unsplash.com', 'cdn.dmpilot.com'],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
  },

  // Performance optimizations
  compress: true,
  swcMinify: true,
  
  // Experimental features
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion', 'recharts'],
  },

  // Headers for security and caching
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
        ],
      },
    ];
  },
};

export default nextConfig;
```

### App Router Structure
The landing page uses Next.js App Router with:
- **Server Components** by default for optimal performance
- **Client Components** only where interactivity is needed (animations, forms)
- **Static Generation** for the landing page (no dynamic data needed)
- **Streaming** for progressive content loading

---

## Component Architecture

### Component Hierarchy

```
LandingPage (Server Component)
├── Navigation (Client Component)
├── Hero (Client Component - animations)
├── Problem (Server Component)
├── DataVisualization (Client Component - charts)
├── Solution (Server Component)
├── ProductDemo (Client Component - interactive demo)
├── TargetAudience (Server Component)
├── Values (Server Component)
├── Comparison (Client Component - interactive comparison)
├── Integrations (Client Component - hover effects)
├── SocialProof (Server Component)
├── FAQ (Client Component - accordion)
├── FinalCTA (Client Component - form)
└── Footer (Server Component)
```

### Component Design Principles

1. **Server-First Approach**
   - Use Server Components by default
   - Only use Client Components when necessary
   - Minimize client-side JavaScript

2. **Component Composition**
   - Build complex components from smaller, reusable pieces
   - Use shared components (SectionContainer, SectionHeader)
   - Maintain clear component boundaries

3. **Props Interface**
   - Define clear TypeScript interfaces for all props
   - Use optional props with sensible defaults
   - Document component usage with JSDoc

4. **Error Boundaries**
   - Wrap sections in error boundaries
   - Provide fallback UI for failed components
   - Log errors for debugging

---

## State Management

### Zustand Store Structure

#### landingStore.ts
```typescript
import { create } from 'zustand';

interface LandingState {
  // UI State
  activeSection: string;
  isMobileMenuOpen: boolean;
  
  // Form State
  email: string;
  isSubmitting: boolean;
  submitError: string | null;
  
  // Analytics State
  scrollDepth: number;
  timeOnPage: number;
  sectionsViewed: string[];
  
  // Actions
  setActiveSection: (section: string) => void;
  setMobileMenuOpen: (open: boolean) => void;
  setEmail: (email: string) => void;
  setSubmitting: (submitting: boolean) => void;
  setSubmitError: (error: string | null) => void;
  recordScrollDepth: (depth: number) => void;
  recordSectionView: (section: string) => void;
}

export const useLandingStore = create<LandingState>((set) => ({
  activeSection: 'hero',
  isMobileMenuOpen: false,
  email: '',
  isSubmitting: false,
  submitError: null,
  scrollDepth: 0,
  timeOnPage: 0,
  sectionsViewed: [],
  
  setActiveSection: (section) => set({ activeSection: section }),
  setMobileMenuOpen: (open) => set({ isMobileMenuOpen: open }),
  setEmail: (email) => set({ email }),
  setSubmitting: (submitting) => set({ isSubmitting: submitting }),
  setSubmitError: (error) => set({ submitError: error }),
  recordScrollDepth: (depth) => set((state) => ({ 
    scrollDepth: Math.max(state.scrollDepth, depth) 
  })),
  recordSectionView: (section) => set((state) => ({
    sectionsViewed: state.sectionsViewed.includes(section) 
      ? state.sectionsViewed 
      : [...state.sectionsViewed, section]
  })),
}));
```

### Local State vs Global State

**Use Local State (useState) for:**
- Form inputs in isolated components
- UI toggles (modals, dropdowns)
- Temporary UI states

**Use Global State (Zustand) for:**
- Cross-component data sharing
- Analytics tracking
- User authentication state
- Persistent UI state (mobile menu)

---

## Data Flow

### Static Data Flow
```typescript
// Data stored in TypeScript files
// src/data/landing-data.ts

export const heroData = {
  headline: "Turn Comments into Customers",
  subheadline: "Intelligent DM automation that feels personal",
  cta: {
    primary: "Start Free Trial",
    secondary: "Watch Demo"
  }
};

export const problemData = {
  statistics: [
    { value: "73%", label: "of commenters expect a response within 1 hour" },
    { value: "45%", label: "of sales are lost to slow response times" },
    { value: "12hrs", label: "average response time for creators" }
  ],
  painPoints: [
    "Drowning in DMs from commenters",
    "Can't respond quickly enough",
    "Missing sales opportunities",
    "Burnout from constant engagement"
  ]
};
```

### Dynamic Data Flow
```typescript
// API routes for dynamic data
// src/app/api/analytics/route.ts

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const body = await request.json();
  
  // Track analytics event
  await trackEvent(body.event, body.properties);
  
  return NextResponse.json({ success: true });
}
```

### Form Submission Flow
```typescript
// Email capture form submission
// src/components/landing/shared/EmailCapture.tsx

const handleSubmit = async (email: string) => {
  setSubmitting(true);
  setSubmitError(null);
  
  try {
    const response = await fetch('/api/waitlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    
    if (!response.ok) throw new Error('Submission failed');
    
    // Track conversion
    trackEvent('waitlist_signup', { email });
    
    // Show success state
    setSuccess(true);
  } catch (error) {
    setSubmitError('Something went wrong. Please try again.');
  } finally {
    setSubmitting(false);
  }
};
```

---

## API Integration

### Supabase Client Configuration

#### client.ts
```typescript
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export const createClient = () => {
  return createClientComponentClient();
};
```

#### server.ts
```typescript
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export const createServerClient = () => {
  const cookieStore = cookies();
  return createServerComponentClient({ cookies: cookieStore });
};
```

### API Routes

#### Waitlist Signup
```typescript
// src/app/api/waitlist/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/client';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    
    const supabase = createClient();
    
    const { error } = await supabase
      .from('waitlist')
      .insert({ email, created_at: new Date().toISOString() });
    
    if (error) throw error;
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to join waitlist' },
      { status: 500 }
    );
  }
}
```

#### Analytics Tracking
```typescript
// src/app/api/analytics/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { event, properties } = await request.json();
  
  // Integrate with analytics provider (e.g., Plausible, PostHog)
  // For now, log to console
  console.log('Analytics:', { event, properties });
  
  return NextResponse.json({ success: true });
}
```

---

## Performance Considerations

### Code Splitting
- **Route-based splitting**: Automatic with Next.js App Router
- **Component-based splitting**: Use dynamic imports for heavy components
- **Lazy loading**: Load charts and animations on demand

```typescript
// Dynamic import for heavy components
const ProductDemo = dynamic(
  () => import('@/components/landing/sections/ProductDemo'),
  { 
    loading: () => <DemoSkeleton />,
    ssr: false // Client-side only for interactive demo
  }
);
```

### Image Optimization
- Use Next.js Image component for all images
- Implement responsive images with srcset
- Use WebP/AVIF formats with fallbacks
- Lazy load below-the-fold images

```typescript
import Image from 'next/image';

<Image
  src="/images/hero/dashboard.png"
  alt="DMPilot Dashboard"
  width={1200}
  height={800}
  priority // For above-the-fold images
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>
```

### Font Optimization
- Use `next/font` for automatic font optimization
- Subset fonts to include only needed characters
- Use font-display: swap for faster rendering

```typescript
import { Inter, Outfit } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});
```

### Bundle Size Optimization
- Tree-shake unused imports
- Use `optimizePackageImports` in next.config.ts
- Analyze bundle with `@next/bundle-analyzer`

---

## Security Considerations

### Content Security Policy
```typescript
// next.config.ts
const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  img-src 'self' blob: data:;
  font-src 'self';
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
`;

const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: cspHeader.replace(/\n/g, ''),
          },
        ],
      },
    ];
  },
};
```

### Input Validation
- Validate all form inputs on client and server
- Sanitize user-generated content
- Use parameterized queries for database operations

### Authentication
- Use Supabase Auth for user authentication
- Implement session management
- Protect API routes with authentication checks

### Rate Limiting
- Implement rate limiting on API routes
- Use Redis or database-backed rate limiting
- Prevent abuse of waitlist signup

---

## Monitoring & Analytics

### Error Tracking
- Integrate Sentry for error tracking
- Log client-side errors
- Monitor server-side errors

### Performance Monitoring
- Use Web Vitals for performance metrics
- Monitor Core Web Vitals (LCP, FID, CLS)
- Track custom performance metrics

### User Analytics
- Track page views and scroll depth
- Monitor conversion funnel
- Track user interactions (CTA clicks, form submissions)

---

## Deployment Architecture

### Vercel Deployment
- **Environment Variables**: Configure in Vercel dashboard
- **Edge Functions**: Deploy API routes as edge functions
- **CDN**: Leverage Vercel's global CDN
- **Preview Deployments**: Automatic on git push

### Environment Configuration
```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_ANALYTICS_ID=your_analytics_id
```

### CI/CD Pipeline
- Automated testing on PR
- Automated deployment on merge to main
- Rollback capability for quick fixes
