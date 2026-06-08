# DMPilot Landing Page Implementation Plan
## Part 13: Testing Strategy

---

## Table of Contents
- [Testing Philosophy](#testing-philosophy)
- [Unit Testing](#unit-testing)
- [Integration Testing](#integration-testing)
- [End-to-End Testing](#end-to-end-testing)
- [Visual Regression Testing](#visual-regression-testing)
- [Accessibility Testing](#accessibility-testing)
- [Performance Testing](#performance-testing)
- [Cross-Browser Testing](#cross-browser-testing)
- [Testing Tools](#testing-tools)

---

## Testing Philosophy

### Core Principles

1. **Test Early, Test Often**: Catch issues before they reach production
2. **Automate Everything**: Reduce manual testing overhead
3. **Test User Flows**: Focus on critical user journeys
4. **Maintainability**: Keep tests simple and maintainable
5. **Coverage with Purpose**: Aim for meaningful coverage, not just numbers

### Testing Goals

- **Prevent Regressions**: Catch breaking changes before deployment
- **Ensure Quality**: Maintain high quality standards
- **Build Confidence**: Deploy with confidence
- **Document Behavior**: Tests serve as living documentation
- **Enable Refactoring**: Refactor safely with test coverage

---

## Unit Testing

### What to Test

Test individual components and functions in isolation.

- **Shared Components**: SectionContainer, SectionHeader, CTAButton
- **Utility Functions**: Data formatting, validation
- **Hooks**: Custom React hooks
- **Data Visualization**: Chart components with mock data

### Testing Framework

Use Jest and React Testing Library.

```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom
```

### Example Tests

```typescript
// __tests__/components/SectionHeader.test.tsx
import { render, screen } from '@testing-library/react';
import { SectionHeader } from '@/components/landing/shared/SectionHeader';

describe('SectionHeader', () => {
  it('renders title correctly', () => {
    render(<SectionHeader title="Test Title" />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('renders subtitle when provided', () => {
    render(
      <SectionHeader 
        title="Test Title" 
        subtitle="Test Subtitle" 
      />
    );
    expect(screen.getByText('Test Subtitle')).toBeInTheDocument();
  });

  it('applies correct alignment class', () => {
    const { container } = render(
      <SectionHeader title="Test Title" align="center" />
    );
    expect(container.firstChild).toHaveClass('text-center');
  });
});
```

```typescript
// __tests__/components/CTAButton.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { CTAButton } from '@/components/landing/shared/CTAButton';

describe('CTAButton', () => {
  it('renders children correctly', () => {
    render(<CTAButton>Click Me</CTAButton>);
    expect(screen.getByText('Click Me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<CTAButton onClick={handleClick}>Click Me</CTAButton>);
    fireEvent.click(screen.getByText('Click Me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('shows loading state when isLoading is true', () => {
    render(<CTAButton isLoading>Loading</CTAButton>);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('is disabled when disabled is true', () => {
    render(<CTAButton disabled>Click Me</CTAButton>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

### Coverage Goals

- **Components**: 80%+ coverage
- **Utilities**: 90%+ coverage
- **Hooks**: 85%+ coverage
- **Overall**: 75%+ coverage

---

## Integration Testing

### What to Test

Test how components work together.

- **Section Integration**: Components within sections
- **Data Flow**: Props passing and state management
- **API Integration**: API route interactions
- **Form Submissions**: Email capture, waitlist signup

### Testing Framework

Use React Testing Library for integration tests.

```typescript
// __tests__/integration/EmailCapture.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EmailCapture } from '@/components/landing/shared/EmailCapture';

describe('EmailCapture Integration', () => {
  it('submits email successfully', async () => {
    const mockSubmit = jest.fn().mockResolvedValue(undefined);
    render(<EmailCapture onSubmit={mockSubmit} />);

    const input = screen.getByPlaceholderText('Enter your email');
    const button = screen.getByText('Get Started');

    fireEvent.change(input, { target: { value: 'test@example.com' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledWith('test@example.com');
    });
  });

  it('shows error for invalid email', async () => {
    render(<EmailCapture onSubmit={jest.fn()} />);

    const input = screen.getByPlaceholderText('Enter your email');
    const button = screen.getByText('Get Started');

    fireEvent.change(input, { target: { value: 'invalid-email' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/valid email/)).toBeInTheDocument();
    });
  });
});
```

---

## End-to-End Testing

### What to Test

Test complete user flows from start to finish.

- **Hero CTA Flow**: Click CTA → Navigate to signup
- **Email Capture Flow**: Enter email → Submit → Success message
- **Scroll Flow**: Scroll through all sections
- **Mobile Navigation**: Open menu → Navigate → Close menu

### Testing Framework

Use Playwright for E2E testing.

```bash
npm install --save-dev @playwright/test
```

### Example Tests

```typescript
// e2e/landing-page.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Landing Page E2E', () => {
  test('loads landing page successfully', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/DMPilot/);
  });

  test('hero CTA navigates to signup', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Start Free Trial');
    await expect(page).toHaveURL('/signup');
  });

  test('email capture submits successfully', async ({ page }) => {
    await page.goto('/');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.click('button:has-text("Get Started")');
    await expect(page.locator('text=success')).toBeVisible();
  });

  test('scrolls through all sections', async ({ page }) => {
    await page.goto('/');
    
    const sections = ['hero', 'problem', 'solution', 'demo'];
    for (const section of sections) {
      await page.locator(`#${section}`).scrollIntoViewIfNeeded();
      await expect(page.locator(`#${section}`)).toBeInViewport();
    }
  });

  test('mobile menu opens and closes', async ({ page }) => {
    await page.goto('/');
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.click('button[aria-label="Open menu"]');
    await expect(page.locator('nav')).toBeVisible();
    
    await page.click('button[aria-label="Close menu"]');
    await expect(page.locator('nav')).not.toBeVisible();
  });
});
```

### E2E Test Goals

- **Critical Flows**: 100% coverage
- **Happy Paths**: All primary user journeys
- **Error Paths**: Key error scenarios
- **Cross-Browser**: Test on Chrome, Firefox, Safari

---

## Visual Regression Testing

### What to Test

Test for unintended visual changes.

- **Component Layout**: Ensure components render correctly
- **Responsive Design**: Test at different breakpoints
- **Theme Changes**: Ensure consistent styling
- **Cross-Browser**: Visual consistency across browsers

### Testing Framework

Use Chromatic or Percy for visual regression testing.

```bash
npm install --save-dev @chromatic-com/storybook
```

### Example Setup

```typescript
// .storybook/preview.tsx
import { withThemeByDataAttribute } from '@storybook/addon-themes';

export const decorators = [
  withThemeByDataAttribute({
    themes: {
      light: 'light',
      dark: 'dark',
    },
    defaultTheme: 'light',
    attributeName: 'data-theme',
  }),
];
```

```typescript
// stories/SectionHeader.stories.tsx
import { SectionHeader } from '@/components/landing/shared/SectionHeader';

export default {
  title: 'Landing/SectionHeader',
  component: SectionHeader,
};

export const Default = {
  args: {
    title: 'Section Title',
    subtitle: 'Section Subtitle',
  },
};

export const CenterAligned = {
  args: {
    title: 'Section Title',
    subtitle: 'Section Subtitle',
    align: 'center',
  },
};
```

---

## Accessibility Testing

### What to Test

Ensure the landing page is accessible to all users.

- **Keyboard Navigation**: All interactive elements accessible via keyboard
- **Screen Reader**: Content is readable by screen readers
- **Color Contrast**: WCAG AA compliant contrast ratios
- **ARIA Labels**: Proper ARIA labels on interactive elements
- **Focus Management**: Visible focus indicators

### Testing Tools

- **axe DevTools**: Browser extension for accessibility testing
- **Lighthouse**: Built-in accessibility audit
- **WAVE**: Web accessibility evaluation tool

### Example Tests

```typescript
// __tests__/a11y/keyboard-navigation.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Keyboard Navigation', () => {
  test('can navigate with Tab key', async ({ page }) => {
    await page.goto('/');
    
    await page.keyboard.press('Tab');
    const firstFocusable = await page.evaluate(() => document.activeElement?.tagName);
    expect(firstFocusable).toBeTruthy();
  });

  test('all buttons are focusable', async ({ page }) => {
    await page.goto('/');
    
    const buttons = await page.$$('button');
    for (const button of buttons) {
      await button.focus();
      const isFocused = await button.evaluate(el => el === document.activeElement);
      expect(isFocused).toBeTruthy();
    }
  });
});
```

```typescript
// __tests__/a11y/color-contrast.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Color Contrast', () => {
  test('hero text has sufficient contrast', async ({ page }) => {
    await page.goto('/');
    
    const headline = page.locator('h1');
    const styles = await headline.evaluate(el => {
      const computed = window.getComputedStyle(el);
      return {
        color: computed.color,
        backgroundColor: computed.backgroundColor,
      };
    });
    
    // Check contrast ratio (simplified)
    expect(styles.color).not.toBe(styles.backgroundColor);
  });
});
```

### Accessibility Checklist

- [ ] All images have alt text
- [ ] All form inputs have labels
- [ ] All buttons have accessible names
- [ ] Color contrast meets WCAG AA
- [ ] Keyboard navigation works
- [ ] Focus indicators are visible
- [ ] ARIA labels are correct
- [ ] Skip links available
- [ ] Heading hierarchy is logical
- [ ] Links are descriptive

---

## Performance Testing

### What to Test

Ensure the landing page loads quickly and performs well.

- **Load Time**: Page loads within target metrics
- **Core Web Vitals**: LCP, FID, CLS pass thresholds
- **Bundle Size**: JavaScript and CSS bundles within budget
- **Image Loading**: Images load efficiently
- **Animation Performance**: Animations run smoothly

### Testing Tools

- **Lighthouse**: Performance auditing
- **WebPageTest**: Detailed performance analysis
- **Bundle Analyzer**: Bundle size analysis

### Example Tests

```typescript
// __tests__/performance/lighthouse.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Performance', () => {
  test('passes Lighthouse performance audit', async ({ page }) => {
    await page.goto('/');
    
    const metrics = await page.evaluate(() => {
      return {
        lcp: performance.getEntriesByType('largest-contentful-paint')[0]?.startTime,
        fid: performance.getEntriesByType('first-input')[0]?.processingStart,
        cls: performance.getEntriesByType('layout-shift')[0]?.value,
      };
    });
    
    expect(metrics.lcp).toBeLessThan(2500); // 2.5s
    expect(metrics.fid).toBeLessThan(100); // 100ms
    expect(metrics.cls).toBeLessThan(0.1); // 0.1
  });
});
```

---

## Cross-Browser Testing

### What to Test

Ensure consistency across browsers and devices.

- **Desktop Browsers**: Chrome, Firefox, Safari, Edge
- **Mobile Browsers**: Chrome (Android), Safari (iOS)
- **Tablets**: iPad, Android tablets
- **Screen Sizes**: Various resolutions

### Testing Tools

- **BrowserStack**: Cross-browser testing platform
- **Sauce Labs**: Cross-browser testing
- **Playwright**: Built-in multi-browser support

### Example Tests

```typescript
// playwright.config.ts
export default defineConfig({
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
    {
      name: 'firefox',
      use: { browserName: 'firefox' },
    },
    {
      name: 'webkit',
      use: { browserName: 'webkit' },
    },
  ],
});
```

---

## Testing Tools

### Unit Testing

- **Jest**: Testing framework
- **React Testing Library**: Component testing
- **MSW**: API mocking

### Integration Testing

- **React Testing Library**: Component integration
- **MSW**: API integration testing

### E2E Testing

- **Playwright**: Browser automation
- **Cypress**: Alternative E2E framework

### Visual Testing

- **Chromatic**: Visual regression testing
- **Percy**: Alternative visual testing

### Accessibility Testing

- **axe DevTools**: Accessibility auditing
- **Lighthouse**: Built-in accessibility audit

### Performance Testing

- **Lighthouse**: Performance auditing
- **WebPageTest**: Detailed performance analysis

---

## Testing Workflow

### Pre-Commit

Run fast tests before committing.

```bash
# Run unit tests
npm run test:unit

# Run linting
npm run lint

# Run type checking
npm run type-check
```

### Pre-Push

Run comprehensive tests before pushing.

```bash
# Run all tests
npm run test

# Run E2E tests
npm run test:e2e

# Run accessibility tests
npm run test:a11y
```

### Pre-Deployment

Run full test suite before deployment.

```bash
# Run all tests with coverage
npm run test:coverage

# Run visual regression tests
npm run test:visual

# Run performance tests
npm run test:performance
```

### CI/CD Integration

Automate tests in CI/CD pipeline.

```yaml
# .github/workflows/test.yml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test
      - run: npm run test:e2e
      - run: npm run test:a11y
```

---

## Testing Best Practices

### Do's

1. **Test user behavior**: Test what users do, not implementation details
2. **Keep tests isolated**: Each test should be independent
3. **Use descriptive names**: Test names should describe what they test
4. **Mock external dependencies**: Don't depend on external services
5. **Test edge cases**: Test error conditions and edge cases
6. **Maintain tests**: Keep tests updated with code changes

### Don'ts

1. **Don't test implementation**: Test behavior, not code
2. **Don't over-mock**: Only mock what's necessary
3. **Don't ignore flaky tests**: Fix flaky tests immediately
4. **Don't test everything**: Focus on critical paths
5. **Don't skip tests**: All tests should pass before deployment
6. **Don't test third-party code**: Trust library authors to test their code
