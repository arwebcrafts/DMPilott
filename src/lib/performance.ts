// Performance monitoring utilities
export interface PerformanceMetrics {
  LCP: number; // Largest Contentful Paint
  FID: number; // First Input Delay
  CLS: number; // Cumulative Layout Shift
  FCP: number; // First Contentful Paint
  TTFB: number; // Time to First Byte
}

// Track Core Web Vitals
export const trackCoreWebVitals = (metric: string, value: number) => {
  if (typeof window === 'undefined') return;
  
  // Send to analytics
  if (window.gtag) {
    window.gtag('event', 'core_web_vital', {
      event_category: 'Web Vitals',
      event_label: metric,
      value: Math.round(value),
      non_interaction: true,
    });
  }
};

// Measure LCP (Largest Contentful Paint)
export const measureLCP = () => {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return;
  
  try {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1] as PerformanceEntry;
      trackCoreWebVitals('LCP', lastEntry.startTime);
    });
    
    observer.observe({ entryTypes: ['largest-contentful-paint'] });
  } catch (e) {
    console.warn('LCP measurement not supported', e);
  }
};

// Measure FID (First Input Delay)
export const measureFID = () => {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return;
  
  try {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        trackCoreWebVitals('FID', entry.processingStart - entry.startTime);
      });
    });
    
    observer.observe({ entryTypes: ['first-input'] });
  } catch (e) {
    console.warn('FID measurement not supported', e);
  }
};

// Measure CLS (Cumulative Layout Shift)
export const measureCLS = () => {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return;
  
  let clsValue = 0;
  
  try {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
          trackCoreWebVitals('CLS', clsValue * 1000);
        }
      });
    });
    
    observer.observe({ entryTypes: ['layout-shift'] });
  } catch (e) {
    console.warn('CLS measurement not supported', e);
  }
};

// Measure FCP (First Contentful Paint)
export const measureFCP = () => {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return;
  
  try {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const firstEntry = entries[0] as PerformanceEntry;
      trackCoreWebVitals('FCP', firstEntry.startTime);
    });
    
    observer.observe({ entryTypes: ['paint'] });
  } catch (e) {
    console.warn('FCP measurement not supported', e);
  }
};

// Measure TTFB (Time to First Byte)
export const measureTTFB = () => {
  if (typeof window === 'undefined') return;
  
  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  if (navigation) {
    const ttfb = navigation.responseStart - navigation.requestStart;
    trackCoreWebVitals('TTFB', ttfb);
  }
};

// Initialize all performance measurements
export const initPerformanceMonitoring = () => {
  if (typeof window === 'undefined') return;
  
  // Wait for page to load
  if (document.readyState === 'complete') {
    measureLCP();
    measureFID();
    measureCLS();
    measureFCP();
    measureTTFB();
  } else {
    window.addEventListener('load', () => {
      measureLCP();
      measureFID();
      measureCLS();
      measureFCP();
      measureTTFB();
    });
  }
};

// Custom performance hook for React
export const usePerformance = () => {
  if (typeof window === 'undefined') {
    return {
      metrics: { LCP: 0, FID: 0, CLS: 0, FCP: 0, TTFB: 0 },
      isMonitoring: false,
    };
  }
  
  return {
    metrics: {
      LCP: 0,
      FID: 0,
      CLS: 0,
      FCP: 0,
      TTFB: 0,
    },
    isMonitoring: true,
  };
};

// Report performance to analytics
export const reportPerformance = (metrics: PerformanceMetrics) => {
  if (typeof window === 'undefined' || !window.gtag) return;
  
  window.gtag('event', 'performance_report', {
    event_category: 'Performance',
    LCP: Math.round(metrics.LCP),
    FID: Math.round(metrics.FID),
    CLS: Math.round(metrics.CLS * 1000),
    FCP: Math.round(metrics.FCP),
    TTFB: Math.round(metrics.TTFB),
  });
};

// Performance thresholds
export const performanceThresholds = {
  LCP: { good: 2500, needsImprovement: 4000 },
  FID: { good: 100, needsImprovement: 300 },
  CLS: { good: 0.1, needsImprovement: 0.25 },
  FCP: { good: 1800, needsImprovement: 3000 },
  TTFB: { good: 600, needsImprovement: 1000 },
};

// Check if metric is good
export const isMetricGood = (metric: keyof PerformanceMetrics, value: number): boolean => {
  const threshold = performanceThresholds[metric];
  return value <= threshold.good;
};

// Get performance rating
export const getPerformanceRating = (metric: keyof PerformanceMetrics, value: number): 'good' | 'needs-improvement' | 'poor' => {
  const threshold = performanceThresholds[metric];
  if (value <= threshold.good) return 'good';
  if (value <= threshold.needsImprovement) return 'needs-improvement';
  return 'poor';
};
