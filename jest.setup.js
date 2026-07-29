import '@testing-library/jest-dom'

// Mock framer-motion to avoid animation issues in tests.
//
// `motion` is proxied so every element type works (motion.h2, motion.section,
// motion.li, ...) instead of only the handful that used to be listed — an
// unlisted one resolved to `undefined` and React threw "Element type is
// invalid". Animation-only props are stripped so React does not warn about
// unknown DOM attributes such as `whileInView`.
const MOTION_ONLY_PROPS = new Set([
  'initial',
  'animate',
  'exit',
  'transition',
  'variants',
  'whileHover',
  'whileTap',
  'whileFocus',
  'whileDrag',
  'whileInView',
  'viewport',
  'layout',
  'layoutId',
  'drag',
  'dragConstraints',
  'dragElastic',
  'dragMomentum',
  'onAnimationStart',
  'onAnimationComplete',
  'onViewportEnter',
  'onViewportLeave',
  'custom',
])

jest.mock('framer-motion', () => {
  const React = require('react')

  const createMotionComponent = (element) => {
    const Component = React.forwardRef(({ children, ...props }, ref) => {
      const domProps = {}
      for (const [key, value] of Object.entries(props)) {
        if (!MOTION_ONLY_PROPS.has(key)) domProps[key] = value
      }
      return React.createElement(element, { ...domProps, ref }, children)
    })
    Component.displayName = `motion.${String(element)}`
    return Component
  }

  const cache = new Map()
  const motion = new Proxy(
    {},
    {
      get: (_target, element) => {
        if (typeof element !== 'string') return undefined
        if (!cache.has(element)) cache.set(element, createMotionComponent(element))
        return cache.get(element)
      },
    }
  )

  return {
    motion,
    AnimatePresence: ({ children }) => <>{children}</>,
    useScroll: () => ({ scrollY: { get: () => 0, on: () => () => {} } }),
    useTransform: () => 0,
    useSpring: () => 0,
    useMotionValue: () => ({ get: () => 0, set: jest.fn(), on: () => () => {} }),
    useInView: () => true,
    useAnimation: () => ({ start: jest.fn(), stop: jest.fn(), set: jest.fn() }),
    useReducedMotion: () => false,
  }
})

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, ...props }) => <img src={src} alt={alt} {...props} />,
}))

// Mock Next.js dynamic imports
jest.mock('next/dynamic', () => ({
  __esModule: true,
  default: (...args) => {
    const dynamicModule = jest.requireActual('next/dynamic')
    const dynamicActualComp = dynamicModule.default
    const RequiredComponent = dynamicActualComp(args[0])
    RequiredComponent.preload ? RequiredComponent.preload() : RequiredComponent.render.preload()
    return RequiredComponent
  },
}))
