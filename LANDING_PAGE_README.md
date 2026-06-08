# DMPilot Landing Page

A modern, high-performance landing page for DMPilot - an Instagram DM automation platform. Built with Next.js 16, React 19, Tailwind CSS 4, and Framer Motion.

## Features

- **Modern Design**: Clean, professional UI inspired by modern SaaS landing pages
- **Performance Optimized**: Code splitting, image optimization, font optimization
- **SEO Ready**: Comprehensive metadata, OpenGraph tags, structured data
- **Accessible**: WCAG AA compliant with keyboard navigation and screen reader support
- **Responsive**: Mobile-first design that works on all devices
- **Animated**: Smooth scroll animations and micro-interactions with reduced motion support
- **Data Visualization**: Interactive charts and statistics display
- **Email Capture**: Integrated waitlist API endpoint

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI Library**: React 19
- **Styling**: Tailwind CSS 4
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Charts**: Recharts
- **State Management**: Zustand
- **Backend**: Supabase
- **Testing**: Jest, React Testing Library, Playwright

## Project Structure

```
src/
├── app/
│   ├── page.tsx                 # Landing page entry point
│   ├── layout.tsx               # Root layout with font optimization
│   ├── globals.css              # Global styles and design tokens
│   └── api/
│       └── waitlist/
│           └── route.ts         # Email capture API endpoint
├── components/
│   └── landing/
│       ├── shared/              # Reusable components
│       │   ├── CTAButton.tsx
│       │   ├── SectionContainer.tsx
│       │   ├── SectionHeader.tsx
│       │   ├── EmailCapture.tsx
│       │   ├── StatCard.tsx
│       │   ├── FeatureCard.tsx
│       │   ├── TestimonialCard.tsx
│       │   ├── IntegrationCard.tsx
│       │   ├── Navigation.tsx
│       │   └── ErrorBoundary.tsx
│       ├── sections/            # Page sections
│       │   ├── Hero.tsx
│       │   ├── Problem.tsx
│       │   ├── Solution.tsx
│       │   ├── ProductDemo.tsx
│       │   ├── TargetAudience.tsx
│       │   ├── Values.tsx
│       │   ├── Comparison.tsx
│       │   ├── Integrations.tsx
│       │   ├── SocialProof.tsx
│       │   ├── FAQ.tsx
│       │   ├── FinalCTA.tsx
│       │   └── Footer.tsx
│       └── data-viz/            # Data visualization components
│           ├── TimelineChart.tsx
│           ├── ConversionFunnel.tsx
│           ├── PositioningMatrix.tsx
│           ├── IntegrationMap.tsx
│           └── StatisticDisplay.tsx
└── lib/
    └── utils.ts                 # Utility functions
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account (for waitlist functionality)

### Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_GA_MEASUREMENT_ID=your_ga_id (optional)
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm test             # Run unit tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage
npm run test:e2e     # Run E2E tests
npm run test:e2e:ui  # Run E2E tests with UI
```

## Design System

### Colors

The landing page uses a light theme with the following color palette:

- **Primary**: Blue (#2563eb)
- **Secondary**: Gray (#1f2937)
- **Accent**: Brand gradient (orange, pink, purple)
- **Surfaces**: White (#ffffff) to gray (#f3f4f6)
- **Text**: Primary (#111827), Secondary (#6b7280), Muted (#9ca3af)

### Typography

- **Font Family**: Inter (body), Outfit (headings)
- **Sizes**: 12px to 64px scale
- **Weights**: 400 to 900

### Spacing

Consistent spacing scale from 4px to 96px:
- `--space-1`: 4px
- `--space-2`: 8px
- `--space-4`: 16px
- `--space-6`: 24px
- `--space-8`: 32px
- `--space-12`: 48px
- `--space-16`: 64px

### Border Radius

- `--radius-sm`: 4px
- `--radius-md`: 6px
- `--radius-lg`: 8px
- `--radius-xl`: 12px
- `--radius-2xl`: 16px
- `--radius-full`: 9999px

### Shadows

- `--shadow-sm`: Subtle shadow
- `--shadow-md`: Medium shadow
- `--shadow-lg`: Large shadow
- `--shadow-xl`: Extra large shadow
- `--shadow-2xl`: Massive shadow

## Components

### Shared Components

#### CTAButton
Primary call-to-action button with variants (primary, secondary, outline, ghost) and sizes (sm, md, lg).

```tsx
<CTAButton variant="primary" size="lg" href="/signup">
  Start Free
</CTAButton>
```

#### SectionContainer
Wrapper component for page sections with configurable padding.

```tsx
<SectionContainer padding="xl" id="features">
  <YourContent />
</SectionContainer>
```

#### SectionHeader
Consistent section headers with title, subtitle, description, and optional badge.

```tsx
<SectionHeader
  title="Features"
  subtitle="Everything you need"
  description="Comprehensive feature set"
  align="center"
  size="lg"
/>
```

#### EmailCapture
Email capture form with validation and API integration.

```tsx
<EmailCapture
  placeholder="Enter your email"
  buttonText="Get Started"
  onSubmit={(email) => console.log(email)}
/>
```

#### StatCard
Statistic display card with optional trend indicator.

```tsx
<StatCard
  value="10,000"
  label="Active Users"
  trend="up"
  trendValue="+25%"
/>
```

#### FeatureCard
Feature highlight card with icon, title, and description.

```tsx
<FeatureCard
  icon={<Icon />}
  title="Feature Name"
  description="Feature description"
/>
```

#### TestimonialCard
Customer testimonial card with avatar, quote, and rating.

```tsx
<TestimonialCard
  quote="Great product!"
  author="John Doe"
  role="CEO"
  avatar="/avatar.jpg"
  rating={5}
/>
```

#### IntegrationCard
Integration showcase card with logo and description.

```tsx
<IntegrationCard
  name="Instagram"
  logo="/instagram-logo.png"
  description="Direct integration"
/>
```

#### Navigation
Responsive navigation with desktop and mobile menus.

```tsx
<Navigation />
```

#### ErrorBoundary
Error boundary component for graceful error handling.

```tsx
<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
```

### Section Components

#### Hero
Hero section with headline, subheadline, and primary CTA.

#### Problem
Problem section highlighting pain points with statistics.

#### Solution
Solution section explaining how DMPilot solves the problem.

#### ProductDemo
Interactive product demonstration section.

#### TargetAudience
Target audience section with creator segments.

#### Values
Core values and commitments section.

#### Comparison
Competitive comparison table.

#### Integrations
Tool ecosystem and integrations showcase.

#### SocialProof
Testimonials and social proof section.

#### FAQ
Accordion-style FAQ section.

#### FinalCTA
Final call-to-action section.

#### Footer
Footer with navigation and legal links.

### Data Visualization Components

#### TimelineChart
Timeline visualization for growth metrics.

#### ConversionFunnel
Conversion funnel chart.

#### PositioningMatrix
Positioning matrix for competitive analysis.

#### IntegrationMap
Integration ecosystem visualization.

#### StatisticDisplay
Animated statistic display with counter.

## Performance

### Optimization Techniques

1. **Code Splitting**: Dynamic imports for heavy sections
2. **Image Optimization**: Next.js Image component
3. **Font Optimization**: next/font/google with display:swap
4. **Bundle Analysis**: Optimized bundle size
5. **Caching**: Vercel edge caching
6. **Minification**: Production builds are minified

### Core Web Vitals

- **LCP**: < 2.5s
- **FID**: < 100ms
- **CLS**: < 0.1

## Accessibility

### Features

- **Skip Link**: Keyboard-accessible skip to main content
- **ARIA Labels**: Proper ARIA attributes on interactive elements
- **Keyboard Navigation**: Full keyboard support
- **Screen Reader**: Screen reader compatible
- **Color Contrast**: WCAG AA compliant
- **Reduced Motion**: Respects prefers-reduced-motion

### Testing

Run accessibility tests with:
```bash
npm run test:e2e
```

## SEO

### Metadata

- Title tags optimized for search
- Meta descriptions
- OpenGraph tags for social sharing
- Twitter Card tags
- Structured data (JSON-LD)
- Robots.txt configuration
- Sitemap generation

### Verification

Use Google Rich Results Test to verify structured data.

## Deployment

### Vercel

The project is configured for Vercel deployment:

1. Connect your GitHub repository to Vercel
2. Configure environment variables
3. Deploy automatically on push

### Environment Variables

Required:
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

Optional:
- `NEXT_PUBLIC_GA_MEASUREMENT_ID`

### Build Configuration

See `vercel.json` for deployment configuration including:
- Security headers
- Caching rules
- Cron jobs
- Rewrites

## Testing

### Unit Tests

```bash
npm test
```

### E2E Tests

```bash
npm run test:e2e
```

### Test Coverage

```bash
npm run test:coverage
```

## Documentation

- [Deployment Checklist](./DEPLOYMENT_CHECKLIST.md)
- [Testing Strategy](./docs/TESTING_STRATEGY.md)
- [Post-Launch Iterations](./docs/POST_LAUNCH_ITERATIONS.md)
- [Implementation Timeline](./docs/IMPLEMENTATION_TIMELINE_METRICS.md)
- [Landing Page Plan](./landing-page-plan/)

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests: `npm test`
4. Build: `npm run build`
5. Submit a pull request

## License

Proprietary - All rights reserved

## Support

For support, contact the development team.

---

**Last Updated**: June 2026
**Version**: 1.0
