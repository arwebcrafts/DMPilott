// Responsive breakpoint utilities
export const breakpoints = {
  sm: 640,   // 640px
  md: 768,   // 768px
  lg: 1024,  // 1024px
  xl: 1280,  // 1280px
  '2xl': 1536, // 1536px
} as const;

export type Breakpoint = keyof typeof breakpoints;

// Check if current viewport matches breakpoint
export const useBreakpoint = (breakpoint: Breakpoint): boolean => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth >= breakpoints[breakpoint];
};

// Get current breakpoint
export const getCurrentBreakpoint = (): Breakpoint => {
  if (typeof window === 'undefined') return 'sm';
  
  const width = window.innerWidth;
  if (width >= breakpoints['2xl']) return '2xl';
  if (width >= breakpoints.xl) return 'xl';
  if (width >= breakpoints.lg) return 'lg';
  if (width >= breakpoints.md) return 'md';
  return 'sm';
};

// Responsive value helper
export const responsive = <T,>(values: Partial<Record<Breakpoint, T>>, defaultValue: T): T => {
  const current = getCurrentBreakpoint();
  
  // Check from largest to smallest
  if (values['2xl'] && current === '2xl') return values['2xl']!;
  if (values.xl && (current === '2xl' || current === 'xl')) return values.xl!;
  if (values.lg && (current === '2xl' || current === 'xl' || current === 'lg')) return values.lg!;
  if (values.md && (current === '2xl' || current === 'xl' || current === 'lg' || current === 'md')) return values.md!;
  if (values.sm) return values.sm!;
  
  return defaultValue;
};

// Media query helpers
export const mediaQuery = {
  sm: `(min-width: ${breakpoints.sm}px)`,
  md: `(min-width: ${breakpoints.md}px)`,
  lg: `(min-width: ${breakpoints.lg}px)`,
  xl: `(min-width: ${breakpoints.xl}px)`,
  '2xl': `(min-width: ${breakpoints['2xl']}px)`,
  'max-sm': `(max-width: ${breakpoints.sm - 1}px)`,
  'max-md': `(max-width: ${breakpoints.md - 1}px)`,
  'max-lg': `(max-width: ${breakpoints.lg - 1}px)`,
  'max-xl': `(max-width: ${breakpoints.xl - 1}px)`,
};

// Touch device detection
export const isTouchDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

// Mobile device detection
export const isMobile = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < breakpoints.md;
};

// Tablet detection
export const isTablet = (): boolean => {
  if (typeof window === 'undefined') return false;
  const width = window.innerWidth;
  return width >= breakpoints.md && width < breakpoints.lg;
};

// Desktop detection
export const isDesktop = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth >= breakpoints.lg;
};

// Orientation detection
export const getOrientation = (): 'portrait' | 'landscape' => {
  if (typeof window === 'undefined') return 'landscape';
  return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
};

// Safe area insets for mobile devices
export const getSafeAreaInsets = () => {
  if (typeof window === 'undefined') {
    return { top: 0, right: 0, bottom: 0, left: 0 };
  }
  
  const safeArea = getComputedStyle(document.documentElement);
  return {
    top: parseInt(safeArea.getPropertyValue('safe-area-inset-top') || '0'),
    right: parseInt(safeArea.getPropertyValue('safe-area-inset-right') || '0'),
    bottom: parseInt(safeArea.getPropertyValue('safe-area-inset-bottom') || '0'),
    left: parseInt(safeArea.getPropertyValue('safe-area-inset-left') || '0'),
  };
};
