# DMPilot Landing Page - Testing Strategy

## Overview

This document outlines the comprehensive testing strategy for the DMPilot landing page, including unit testing, integration testing, end-to-end testing, and accessibility testing.

## Testing Philosophy

### Principles
- **Test Early**: Write tests alongside development
- **Test Often**: Run tests continuously during development
- **Test Automatically**: Integrate tests into CI/CD pipeline
- **Test Realistically**: Simulate real user behavior
- **Test Comprehensively**: Cover all critical paths

### Testing Pyramid

```
        /\
       /E2E\       - Few, slow, expensive tests
      /------\
     /Integration\  - Moderate number, medium speed
    /------------\
   /   Unit Tests  \ - Many, fast, cheap tests
  /----------------\
```

## Unit Testing

### Tools
- **Jest**: Testing framework
- **React Testing Library**: Component testing
- **@testing-library/jest-dom**: Custom matchers
- **@testing-library/user-event**: User interaction simulation

### Test Structure

#### Component Tests
Location: `src/components/landing/shared/__tests__/`

**Example: CTAButton.test.tsx**
```typescript
import { render, screen } from '@testing-library/react'
import { CTAButton } from '../CTAButton'

describe('CTAButton', () => {
  it('renders with default props', () => {
    render(<CTAButton>Click me</CTAButton>)
    const button = screen.getByRole('button', { name: 'Click me' })
    expect(button).toBeInTheDocument()
  })
})
```

#### Test Coverage Goals
- **Shared Components**: 80% coverage
- **Section Components**: 70% coverage
- **Utility Functions**: 90% coverage
- **Overall**: 70% coverage

### Running Unit Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Test Categories

#### Rendering Tests
- Component renders without errors
- Props are correctly applied
- Children are rendered
- Conditional rendering works

#### Interaction Tests
- Click handlers work
- Form submissions work
- State changes work
- Event handlers are called

#### Accessibility Tests
- ARIA attributes are present
- Keyboard navigation works
- Screen reader compatibility
- Color contrast is sufficient

## Integration Testing

### Tools
- **Jest**: Testing framework
- **React Testing Library**: Component testing
- **MSW (Mock Service Worker)**: API mocking

### Test Scenarios

#### API Integration
- Email capture form submission
- Waitlist API endpoint
- Error handling
- Loading states

#### Component Integration
- Navigation with sections
- Form with validation
- Charts with data
- Animations with state

### Example Test

```typescript
import { render, screen, waitFor } from '@testing-library/react'
import { EmailCapture } from '../EmailCapture'
import { rest } from 'msw'
import { setupServer } from 'msw/node'

const server = setupServer(
  rest.post('/api/waitlist', (req, res, ctx) => {
    return res(ctx.json({ message: 'Success' }))
  })
)

beforeAll(() => server.listen())
afterAll(() => server.close())

describe('EmailCapture Integration', () => {
  it('submits email to API', async () => {
    render(<EmailCapture />)
    
    const input = screen.getByPlaceholderText(/email/i)
    const button = screen.getByRole('button', { name: /submit/i })
    
    await userEvent.type(input, 'test@example.com')
    await userEvent.click(button)
    
    await waitFor(() => {
      expect(screen.getByText(/success/i)).toBeInTheDocument()
    })
  })
})
```

## End-to-End Testing

### Tools
- **Playwright**: E2E testing framework
- **Playwright Test**: Test runner
- **Playwright UI**: Visual test runner

### Test Structure

Location: `e2e/`

**Example: landing-page.spec.ts**
```typescript
import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test('should load successfully', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/DMPilot/);
  });

  test('should display hero section', async ({ page }) => {
    await page.goto('/');
    const hero = page.locator('h1');
    await expect(hero).toBeVisible();
  });
});
```

### Test Scenarios

#### User Flows
1. **Landing Page Visit**
   - Page loads successfully
   - All sections render
   - Navigation works
   - Responsive design works

2. **Email Capture Flow**
   - User enters email
   - User submits form
   - Success message appears
   - Data is sent to API

3. **Navigation Flow**
   - User clicks navigation links
   - Page scrolls to section
   - URL updates
   - Back button works

4. **Mobile Experience**
   - Mobile menu opens/closes
   - Touch targets work
   - Layout adapts
   - Performance is acceptable

### Running E2E Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# Run E2E tests in headed mode
npm run test:e2e:headed
```

### Browser Coverage
- **Chrome**: Desktop and mobile
- **Firefox**: Desktop
- **Safari**: Desktop and mobile
- **Edge**: Desktop

## Accessibility Testing

### Tools
- **axe-core**: Accessibility testing engine
- **@axe-core/react**: React integration
- **Playwright Accessibility**: Built-in a11y testing
- **Manual Testing**: Screen readers, keyboard navigation

### Test Categories

#### Automated A11y Tests
```typescript
import { test, expect } from '@playwright/test';
import { injectAxe, checkA11y } from 'axe-playwright';

test('should be accessible', async ({ page }) => {
  await page.goto('/');
  await injectAxe(page);
  await checkA11y(page);
});
```

#### Manual A11y Tests
- **Keyboard Navigation**: Tab through all interactive elements
- **Screen Reader**: Test with NVDA, JAWS, VoiceOver
- **Color Contrast**: Check with WCAG contrast checker
- **Focus Management**: Verify focus indicators
- **Semantic HTML**: Use semantic elements correctly

### WCAG Compliance
- **Level AA**: Target compliance level
- **Level AAA**: Stretch goal for critical paths
- **Section 508**: Government compliance
- **EN 301 549**: European standard

## Performance Testing

### Tools
- **Lighthouse**: Performance auditing
- **WebPageTest**: Detailed performance analysis
- **Playwright Performance**: Network simulation

### Metrics
- **LCP (Largest Contentful Paint)**: < 2.5s
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1
- **TTFB (Time to First Byte)**: < 600ms
- **FCP (First Contentful Paint)**: < 1.8s

### Running Performance Tests

```bash
# Run Lighthouse
npx lighthouse http://localhost:3000 --view

# Run WebPageTest
# Use webpagetest.org
```

## Visual Regression Testing

### Tools
- **Playwright**: Screenshot comparison
- **Chromatic**: Component visual testing
- **Percy**: Visual regression platform

### Test Strategy
- **Component Screenshots**: Test component variations
- **Page Screenshots**: Test full page layouts
- **Responsive Screenshots**: Test different viewports
- **Cross-Browser Screenshots**: Test browser differences

### Example Test

```typescript
test('visual regression', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveScreenshot('landing-page.png');
});
```

## Security Testing

### Tools
- **OWASP ZAP**: Security scanning
- **Snyk**: Dependency vulnerability scanning
- **npm audit**: Package vulnerability check

### Test Categories
- **XSS (Cross-Site Scripting)**: Input sanitization
- **CSRF (Cross-Site Request Forgery)**: Token validation
- **SQL Injection**: Query parameter validation
- **Authentication**: Secure auth flows
- **Authorization**: Proper access control

### Running Security Tests

```bash
# Run npm audit
npm audit

# Run Snyk
npx snyk test

# Run OWASP ZAP
# Use OWASP ZAP desktop application
```

## Cross-Browser Testing

### Browsers
- **Chrome**: Latest version
- **Firefox**: Latest version
- **Safari**: Latest version
- **Edge**: Latest version
- **Mobile Safari**: iOS 14+
- **Mobile Chrome**: Android 10+

### Testing Strategy
- **Automated**: Playwright cross-browser tests
- **Manual**: BrowserStack or Sauce Labs
- **Real Devices**: Physical device testing

### Test Matrix

| Browser | Version | Desktop | Mobile | Priority |
|---------|---------|---------|--------|----------|
| Chrome | Latest | ✓ | ✓ | High |
| Firefox | Latest | ✓ | ✓ | High |
| Safari | Latest | ✓ | ✓ | High |
| Edge | Latest | ✓ | ✗ | Medium |
| IE 11 | 11 | ✓ | ✗ | Low |

## Mobile Testing

### Devices
- **iPhone**: 12, 13, 14
- **iPad**: Pro, Air
- **Android**: Pixel 5, 6, 7
- **Tablet**: Samsung Galaxy Tab

### Test Scenarios
- **Touch Interactions**: Tap, swipe, pinch
- **Orientation**: Portrait, landscape
- **Network**: 3G, 4G, WiFi
- **Performance**: Mobile performance metrics

### Running Mobile Tests

```typescript
test('mobile experience', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/');
  // Mobile-specific tests
});
```

## CI/CD Integration

### GitHub Actions

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm test
      - run: npm run test:e2e
```

### Vercel Integration
- **Pre-deploy**: Run unit tests
- **Post-deploy**: Run E2E tests
- **Monitoring**: Track test results

## Test Data Management

### Test Data
- **Fixtures**: Reusable test data
- **Factories**: Data generation
- **Mocks**: API responses
- **Seeds**: Database seeds

### Example Fixture

```typescript
// fixtures/testData.ts
export const mockUser = {
  email: 'test@example.com',
  name: 'Test User',
};

export const mockApiResponse = {
  success: true,
  message: 'Email added to waitlist',
};
```

## Test Maintenance

### Regular Updates
- **Weekly**: Review test failures
- **Monthly**: Update test data
- **Quarterly**: Review test coverage
- **Annually**: Update testing tools

### Test Debt
- **Identify**: Track outdated tests
- **Prioritize**: Fix critical tests first
- **Refactor**: Improve test quality
- **Delete**: Remove unnecessary tests

## Best Practices

### Writing Good Tests
1. **Test Behavior, Not Implementation**: Focus on what users see
2. **Use Descriptive Names**: Clear test names
3. **Arrange-Act-Assert**: Structure tests clearly
4. **Keep Tests Independent**: No test dependencies
5. **Mock External Dependencies**: Isolate tests

### Anti-Patterns to Avoid
1. **Testing Implementation Details**: Don't test internal state
2. **Fragile Tests**: Tests that break easily
3. **Slow Tests**: Tests that take too long
4. **Complex Tests**: Hard to understand tests
5. **Duplicated Tests**: Redundant test cases

## Troubleshooting

### Common Issues

#### Test Failures
- **Flaky Tests**: Add retries, fix timing
- **Timeout Issues**: Increase timeout, optimize test
- **Environment Issues**: Check environment variables
- **Dependency Issues**: Update dependencies

#### Performance Issues
- **Slow Tests**: Parallelize, optimize
- **Memory Leaks**: Clean up after tests
- **Network Issues**: Mock network calls
- **Browser Issues**: Update browsers

### Debugging Tools
- **Playwright Inspector**: Debug E2E tests
- **Jest Debugger**: Debug unit tests
- **React DevTools**: Inspect components
- **Browser DevTools**: Inspect page

## Documentation

### Test Documentation
- **Test Plans**: Document test strategies
- **Test Cases**: Document test scenarios
- **Test Results**: Document test outcomes
- **Test Coverage**: Document coverage reports

### Knowledge Sharing
- **Team Training**: Train team on testing
- **Code Reviews**: Review test code
- **Pair Programming**: Write tests together
- **Documentation**: Keep docs updated

## Resources

### Documentation
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro)
- [Playwright Documentation](https://playwright.dev/docs/intro)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

### Tools
- [Jest](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Playwright](https://playwright.dev/)
- [axe-core](https://www.deque.com/axe/)

### Communities
- [Jest Discord](https://discord.gg/j6FKKQQrW9)
- [Testing Library Discord](https://discord.gg/testing-library)
- [Playwright Community](https://playwright.dev/docs/community)

---

**Last Updated**: June 2026
**Version**: 1.0
**Next Review**: September 2026
