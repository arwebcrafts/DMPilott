# DMPilot Landing Page — Full Implementation Plan

> Transform the DMPilot landing page from a structurally complete wireframe into a visually rich, premium SaaS landing page — inspired by [mursa.me](https://www.mursa.me/).

---

## Phase 1: Global Design System

> Foundation changes that affect every section. Do these first.

---

### [MODIFY] [globals.css](file:///c:/Users/PMYLS/Downloads/DMpilot/dmpilot-2/src/app/globals.css)

#### 1.1 — Replace color tokens with warm palette

```css
:root {
  --background: #fffcf8;
  --foreground: #1a1a1a;
  --surface-0: #fffcf8;         /* warm white */
  --surface-1: #fef7f0;         /* cream */
  --surface-2: #f5ede4;         /* warm gray */
  --surface-3: #e8e0d8;         /* warm border */
  --surface-4: #d4cdc5;

  --text-primary: #1a1a1a;
  --text-secondary: #6b6b6b;
  --text-muted: #9a9a9a;

  --accent: #e85d3a;            /* warm coral CTA */
  --accent-hover: #d14e2e;
  --accent-light: #fff0eb;

  /* Section-specific backgrounds */
  --section-warm: #fef7f0;      /* cream sections */
  --section-cool: #f0f5f2;      /* mint/sage sections */
  --section-neutral: #f8f6f3;   /* ivory sections */

  /* Hero gradient */
  --hero-sky-top: #fde8d8;      /* peach */
  --hero-sky-mid: #f5d5b8;      /* warm tan */
  --hero-mountain: #7a9e8e;     /* sage green */
  --hero-mountain-dark: #5a7d6e; /* darker sage */
}
```

#### 1.2 — Update dark theme tokens

```css
.dark {
  --background: #0f0f14;
  --foreground: #f0ede8;
  --surface-0: #0f0f14;
  --surface-1: #1a1a24;
  --surface-2: #24242f;
  --surface-3: #2f2f3a;
  --surface-4: #3a3a48;

  --text-primary: #f0ede8;
  --text-secondary: #9a9590;
  --text-muted: #6a655f;

  --accent: #ff7a57;
  --accent-hover: #ff6842;
  --accent-light: #2a1a14;
}
```

#### 1.3 — Add new animation keyframes

```css
@keyframes marquee {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

@keyframes count-up {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slide-in-left {
  from { opacity: 0; transform: translateX(-30px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes slide-in-right {
  from { opacity: 0; transform: translateX(30px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes pulse-soft {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}
```

#### 1.4 — Add section background utility classes

```css
.section-warm { background: var(--section-warm); }
.section-cool { background: var(--section-cool); }
.section-neutral { background: var(--section-neutral); }

/* Glassmorphism nav */
.nav-glass {
  background: rgba(255, 252, 248, 0.75);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(232, 224, 216, 0.5);
}
.dark .nav-glass {
  background: rgba(15, 15, 20, 0.75);
  border: 1px solid rgba(47, 47, 58, 0.5);
}

/* Card warm styling */
.card-warm {
  background: #fffcf8;
  border: 1px solid var(--surface-3);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(139, 109, 79, 0.06);
  transition: all 0.3s ease;
}
.card-warm:hover {
  box-shadow: 0 8px 24px rgba(139, 109, 79, 0.1);
  transform: translateY(-2px);
}

/* Marquee */
.marquee-track {
  display: flex;
  animation: marquee 20s linear infinite;
  width: max-content;
}
```

#### 1.5 — Update hero background class

```css
.hero-bg {
  background: linear-gradient(
    180deg,
    var(--hero-sky-top) 0%,
    var(--hero-sky-mid) 40%,
    var(--hero-mountain) 70%,
    var(--hero-mountain-dark) 100%
  );
  position: relative;
  overflow: hidden;
}
```

---

### [MODIFY] [layout.tsx](file:///c:/Users/PMYLS/Downloads/DMpilot/dmpilot-2/src/app/layout.tsx)

#### 1.6 — Add a display font for headings

Import `Outfit` (or `Cabinet Grotesk` via CSS) alongside Inter for heading hierarchy:

```tsx
import { Inter, Outfit } from "next/font/google";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit", weight: ['300', '400', '500', '600', '700', '800'] });

// In html tag:
<html lang="en" className={`${inter.variable} ${outfit.variable}`}>
```

Update `globals.css` `@theme` block:

```css
@theme {
  --font-sans: 'Inter', system-ui, sans-serif;
  --font-display: 'Outfit', 'Inter', system-ui, sans-serif;
}
```

And apply to headings:

```css
h1, h2 { font-family: var(--font-display); }
```

---

## Phase 2: Navigation + Hero

> The first things users see. Highest visual impact.

---

### [MODIFY] [Navigation.tsx](file:///c:/Users/PMYLS/Downloads/DMpilot/dmpilot-2/src/components/landing/shared/Navigation.tsx)

#### 2.1 — Convert to floating glassmorphism pill

**Current**: Full-width sticky bar with `bg-white/80 backdrop-blur-md border-b`  
**Target**: Centered floating pill with rounded corners, no full-width border

```diff
- <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100" style={{ background: 'var(--surface-0)', borderColor: 'var(--surface-3)' }}>
-   <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">

+ <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-auto max-w-3xl" aria-label="Main navigation">
+   <div className="nav-glass rounded-full px-6 h-14 flex items-center gap-8">
```

#### 2.2 — Add a logo icon

Before the "DMPilot" text, add an SVG icon or emoji:

```tsx
<Link href="/" className="flex items-center gap-2">
  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#e85d3a] to-[#f09433] flex items-center justify-center">
    <span className="text-white text-xs font-bold">D</span>
  </div>
  <span className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>DMPilot</span>
</Link>
```

#### 2.3 — Switch CTA to warm coral pill

```diff
- <button className="px-5 py-2.5 text-sm font-semibold text-white rounded-lg" style={{ background: 'var(--text-primary)' }}>
+ <button className="px-5 py-2.5 text-sm font-semibold text-white rounded-full transition-all hover:shadow-lg hover:scale-105" style={{ background: 'var(--accent)' }}>
    Join beta →
  </button>
```

---

### [MODIFY] [Hero.tsx](file:///c:/Users/PMYLS/Downloads/DMpilot/dmpilot-2/src/components/landing/sections/Hero.tsx)

#### 2.4 — Add illustrated gradient background with SVG mountains

Replace the flat white background with the hero gradient + inline SVG mountain layers:

```tsx
<section id="hero" className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-32 pb-24 overflow-hidden hero-bg">
  {/* SVG Cloud decorations */}
  <div className="absolute top-20 left-[10%] opacity-80 animate-[float_6s_ease-in-out_infinite]">
    <svg width="140" height="50" viewBox="0 0 140 50" fill="white" opacity="0.9">
      <ellipse cx="70" cy="35" rx="70" ry="15" />
      <ellipse cx="50" cy="25" rx="40" ry="20" />
      <ellipse cx="90" cy="28" rx="35" ry="18" />
    </svg>
  </div>
  <div className="absolute top-16 right-[15%] opacity-60 animate-[float_8s_ease-in-out_infinite_1s]">
    <svg width="100" height="35" viewBox="0 0 100 35" fill="white" opacity="0.8">
      <ellipse cx="50" cy="20" rx="50" ry="15" />
      <ellipse cx="35" cy="15" rx="30" ry="12" />
    </svg>
  </div>

  {/* SVG Mountain layers at bottom */}
  <div className="absolute bottom-0 left-0 right-0">
    {/* Far mountain layer */}
    <svg viewBox="0 0 1440 320" className="w-full" preserveAspectRatio="none" style={{ height: '280px' }}>
      <path d="M0,320 L0,200 Q200,80 400,180 Q550,100 720,160 Q900,60 1100,140 Q1250,80 1440,160 L1440,320 Z" fill="var(--hero-mountain)" opacity="0.7" />
    </svg>
    {/* Near mountain layer */}
    <svg viewBox="0 0 1440 280" className="w-full absolute bottom-0" preserveAspectRatio="none" style={{ height: '220px' }}>
      <path d="M0,280 L0,180 Q180,100 360,160 Q500,80 700,150 Q850,60 1050,130 Q1200,70 1440,140 L1440,280 Z" fill="var(--hero-mountain-dark)" opacity="0.8" />
    </svg>
    {/* Ground layer */}
    <svg viewBox="0 0 1440 160" className="w-full absolute bottom-0" preserveAspectRatio="none" style={{ height: '120px' }}>
      <path d="M0,160 L0,80 Q360,40 720,80 Q1080,120 1440,60 L1440,160 Z" fill="#4a7261" />
    </svg>
  </div>

  {/* Content */}
  <div className="max-w-3xl mx-auto relative z-10">
    {/* ... badge, h1, subtitle, email form ... */}
  </div>
</section>
```

#### 2.5 — Replace badge with line-decorated label

```diff
- <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium tracking-widest uppercase mb-8" style={{ background: 'var(--surface-1)', ...}}>
-   <span className="w-2 h-2 bg-green-500 rounded-full" />
-   CALM ENGAGEMENT · PRIVATE BETA
- </div>

+ <div className="flex items-center gap-4 justify-center mb-8">
+   <div className="h-px w-12" style={{ background: 'var(--text-muted)' }} />
+   <span className="text-xs font-medium tracking-[0.2em] uppercase" style={{ color: 'var(--text-secondary)' }}>
+     CALM ENGAGEMENT · PRIVATE BETA
+   </span>
+   <div className="h-px w-12" style={{ background: 'var(--text-muted)' }} />
+ </div>
```

#### 2.6 — Combine email input + button into one pill

```tsx
<form onSubmit={handleSubmit} className="max-w-lg mx-auto mb-4">
  <div className="flex items-center bg-white rounded-full shadow-xl p-1.5 border border-gray-200/50">
    <input
      type="email" value={email} onChange={(e) => setEmail(e.target.value)}
      placeholder="you@studio.co" required
      className="flex-1 px-6 py-3 bg-transparent text-base outline-none rounded-full"
      style={{ color: 'var(--text-primary)' }}
    />
    <button type="submit" disabled={status === 'loading'}
      className="px-6 py-3 rounded-full text-sm font-semibold text-white flex items-center gap-2 transition-all hover:shadow-lg"
      style={{ background: '#1a1a1a' }}>
      Start your day <span className="text-base">↗</span>
    </button>
  </div>
</form>
```

#### 2.7 — Add browser mockup below hero content

After the email form, add a product screenshot placeholder that peeks from below:

```tsx
{/* Browser mockup — peeks from bottom */}
<div className="relative mt-16 max-w-4xl mx-auto">
  <div className="rounded-t-xl overflow-hidden shadow-2xl border border-gray-200/30">
    {/* Browser chrome */}
    <div className="bg-gray-100 px-4 py-3 flex items-center gap-2">
      <div className="flex gap-1.5">
        <div className="w-3 h-3 rounded-full bg-red-400" />
        <div className="w-3 h-3 rounded-full bg-yellow-400" />
        <div className="w-3 h-3 rounded-full bg-green-400" />
      </div>
      <div className="flex-1 mx-4">
        <div className="bg-white rounded-md px-3 py-1 text-xs text-gray-400 max-w-xs">
          dashboard.dmpilot.com/inbox
        </div>
      </div>
    </div>
    {/* Screenshot placeholder — use generate_image or actual screenshot */}
    <div className="bg-gradient-to-b from-gray-50 to-gray-100 h-64 flex items-center justify-center text-gray-300 text-sm">
      DMPilot Dashboard Screenshot
    </div>
  </div>
</div>
```

---

### [MODIFY] [SideNavigation.tsx](file:///c:/Users/PMYLS/Downloads/DMpilot/dmpilot-2/src/components/landing/shared/SideNavigation.tsx)

#### 2.8 — Update active dot colors to warm accent

```diff
- 'bg-gray-900 text-white scale-110'
- : 'bg-gray-200 text-gray-500 hover:bg-gray-300'

+ `bg-[#e85d3a] text-white scale-110 shadow-md`
+ : `bg-[var(--surface-2)] text-[var(--text-muted)] hover:bg-[var(--surface-3)]`
```

---

## Phase 3: Content Sections

> Redesign individual sections to match Mursa's visual richness.

---

### [MODIFY] [SoundFamiliar.tsx](file:///c:/Users/PMYLS/Downloads/DMpilot/dmpilot-2/src/components/landing/sections/SoundFamiliar.tsx)

#### 3.1 — Add warm section background

```diff
- <section id="problem" className="py-24 px-6" style={{ background: 'var(--surface-0)' }}>
+ <section id="problem" className="py-24 px-6" style={{ background: 'var(--section-warm)' }}>
```

#### 3.2 — Use tracked uppercase section heading

```diff
- <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
-   Sound familiar?
- </h2>

+ <p className="text-xs font-medium tracking-[0.2em] uppercase mb-4" style={{ color: 'var(--text-muted)' }}>SOUND FAMILIAR?</p>
+ <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
+   Your Instagram, right now.
+ </h2>
```

### [MODIFY] [NotificationStack.tsx](file:///c:/Users/PMYLS/Downloads/DMpilot/dmpilot-2/src/components/landing/visual-storytelling/NotificationStack.tsx)

#### 3.3 — Wrap in iPhone frame + add app-colored icons

Add an iPhone bezel wrapper around the notification card:

```tsx
<div ref={ref} className="max-w-sm mx-auto">
  {/* iPhone frame */}
  <div className="rounded-[3rem] p-3 shadow-2xl" style={{ background: '#1a1a1a' }}>
    {/* Notch */}
    <div className="flex justify-center mb-1">
      <div className="w-28 h-6 rounded-full bg-black" />
    </div>
    {/* Screen */}
    <div className="rounded-[2.4rem] overflow-hidden bg-white p-5">
      {/* ... existing notification content ... */}
    </div>
  </div>
</div>
```

Add colored icon backgrounds per app:

```tsx
const notifications = [
  { app: 'INSTAGRAM', time: 'now', title: 'New DM from @fashionista', color: '#E1306C' },
  { app: 'INSTAGRAM', time: '2m', title: 'Comment: "How much?"', color: '#833AB4' },
  { app: 'GMAIL', time: '5m', title: '12 new leads', color: '#EA4335' },
  { app: 'WHATSAPP', time: '14m', title: 'Supplier reply', color: '#25D366' },
  { app: 'REMINDERS', time: '1h', title: 'Post content at 3pm', color: '#FF9500' },
];
```

---

### [MODIFY] [DayTimeline.tsx](file:///c:/Users/PMYLS/Downloads/DMpilot/dmpilot-2/src/components/landing/data-viz/DayTimeline.tsx)

#### 3.4 — Convert from vertical list to horizontal Gantt chart

**This is a significant rewrite.** Replace the vertical stack of rows with a horizontal timeline where each block is positioned along a time axis (`9 AM` → `5 PM`), with color-coded segments showing their duration as width.

Key approach:
- Use a container with `position: relative` and `width: 100%`
- Each block is `position: absolute` with `left` and `width` calculated as percentages of the 8-hour span
- Add a color legend below the chart
- The time axis runs along the top: `9 AM, 10, 11, 12, 1 PM, 2, 3, 4, 5 PM`

```tsx
// Map each block to start-minute (relative to 9 AM = 0) and duration in minutes
// Then: left = (startMin / 480) * 100%, width = (duration / 480) * 100%
// 480 minutes = 8 hours (9 AM to 5 PM)
```

---

### [MODIFY] [WhatDMPilotDoes.tsx](file:///c:/Users/PMYLS/Downloads/DMpilot/dmpilot-2/src/components/landing/sections/WhatDMPilotDoes.tsx)

#### 3.5 — Convert to 2×2 card grid

```diff
- <div className="space-y-12">
-   {pillars.map((p, i) => (
-     <div key={i} className="flex items-start gap-6">

+ <div className="grid md:grid-cols-2 gap-6">
+   {pillars.map((p, i) => (
+     <div key={i} className="card-warm flex items-start gap-5">
```

#### 3.6 — Add warm section background

```diff
- <section id="features" className="py-24 px-6" style={{ background: 'var(--surface-0)' }}>
+ <section id="features" className="py-24 px-6" style={{ background: 'var(--section-cool)' }}>
```

---

### [MODIFY] [DayInDMPilot.tsx](file:///c:/Users/PMYLS/Downloads/DMpilot/dmpilot-2/src/components/landing/sections/DayInDMPilot.tsx)

#### 3.7 — Add visual calendar (two-column layout)

**Left column**: Vertical timeline from 6 AM → 6 PM with colored blocks  
**Right column**: Annotation cards with `←` arrows pointing to specific times

```tsx
<div className="grid lg:grid-cols-5 gap-8">
  {/* Left: Visual Calendar (3/5 width) */}
  <div className="lg:col-span-3">
    {/* Calendar header */}
    <div className="flex items-center justify-between mb-4 p-4 rounded-xl" style={{ background: 'var(--surface-1)' }}>
      <div>
        <span className="text-xs font-bold tracking-wider uppercase" style={{ color: 'var(--text-muted)' }}>TODAY</span>
        <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Tuesday, May 5</div>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 font-medium">On track</span>
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>3 deep · 2 rituals</span>
      </div>
    </div>
    {/* Time axis + colored blocks */}
    {/* Each block rendered as a horizontal bar with type-specific color */}
  </div>

  {/* Right: Annotations (2/5 width) */}
  <div className="lg:col-span-2 space-y-6">
    {/* Annotation cards with ← arrows */}
    <div className="p-4 rounded-xl border-l-4" style={{ borderColor: '#e85d3a', background: 'var(--surface-1)' }}>
      <div className="text-xs font-bold" style={{ color: '#e85d3a' }}>← 06:30 · RITUAL</div>
      <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
        A 5-minute ritual lands you in your day before the world does.
      </p>
    </div>
    {/* ... more annotations ... */}
  </div>
</div>
```

#### 3.8 — Define block colors by type

```tsx
const typeColors: Record<string, string> = {
  RITUAL: '#e85d3a',  // coral
  DEEP: '#3b82f6',    // blue
  ADMIN: '#8b5cf6',   // purple
  REST: '#22c55e',    // green
  REVIEW: '#eab308',  // yellow
  CLOSE: '#6b7280',   // gray
};
```

---

### [MODIFY] [Values.tsx](file:///c:/Users/PMYLS/Downloads/DMpilot/dmpilot-2/src/components/landing/sections/Values.tsx)

#### 3.9 — Redesign as manifesto document card

Replace the simple numbered list with a document-styled card:

```tsx
<section className="py-24 px-6" style={{ background: 'var(--section-warm)' }}>
  <div className="max-w-3xl mx-auto">
    {/* Section header */}
    <div className="text-center mb-12">
      <p className="text-xs font-medium tracking-[0.2em] uppercase mb-3" style={{ color: 'var(--text-muted)' }}>WHAT WE STAND FOR</p>
      <h2 style={{ fontFamily: 'var(--font-display)' }}>Five promises, in two halves.</h2>
      <p>Read these, and hold us to them.</p>
    </div>

    {/* Document card */}
    <div className="rounded-2xl border-2 overflow-hidden shadow-lg" style={{ background: '#fffef9', borderColor: 'var(--surface-3)' }}>
      {/* Document header */}
      <div className="flex justify-between items-center px-8 py-4 border-b" style={{ borderColor: 'var(--surface-3)' }}>
        <span className="text-xs tracking-[0.15em] uppercase font-semibold" style={{ color: 'var(--text-muted)' }}>DMPILOT · MANIFESTO</span>
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>v.1 · 2026</span>
      </div>

      {/* Two halves */}
      <div className="p-8 space-y-8">
        <div>
          <h3 className="text-xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>We won&apos;t</h3>
          {/* Commitments 01-02: things we won't do */}
        </div>
        <div className="pt-6 border-t" style={{ borderColor: 'var(--surface-3)' }}>
          <h3 className="text-xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>We will</h3>
          {/* Commitments 03-05: things we will do */}
        </div>
      </div>

      {/* Footer: signature */}
      <div className="px-8 py-6 border-t flex items-center justify-between" style={{ borderColor: 'var(--surface-3)', background: 'var(--surface-1)' }}>
        <div>
          <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>— The DMPilot team</p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Built with care for creators.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#e85d3a] to-[#f09433] flex items-center justify-center">
            <span className="text-white text-xs font-bold">D</span>
          </div>
          <span className="text-xs font-bold tracking-wider uppercase" style={{ color: 'var(--text-muted)' }}>SIGNED</span>
        </div>
      </div>
    </div>
  </div>
</section>
```

---

### [MODIFY] [Integrations.tsx](file:///c:/Users/PMYLS/Downloads/DMpilot/dmpilot-2/src/components/landing/sections/Integrations.tsx)

#### 3.10 — Redesign as subway/transit map

Replace the simple list with a visual transit map:

- Center: DMPilot hub (large circle)
- Lines radiating out to each integration as colored "subway lines"
- Each line has a station dot with the integration name
- Use SVG lines connecting nodes

```tsx
{/* Transit board */}
<div className="rounded-2xl p-8" style={{ background: 'var(--surface-0)', border: '1px solid var(--surface-3)' }}>
  <div className="flex items-center justify-between mb-8">
    <span className="text-xs tracking-[0.15em] uppercase font-semibold" style={{ color: 'var(--text-muted)' }}>DMPilot TRANSIT · LIVE</span>
    <div className="flex items-center gap-2">
      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>All lines running</span>
    </div>
  </div>

  {/* Vertical line with stops */}
  <div className="relative pl-8">
    {/* Vertical rail */}
    <div className="absolute left-3 top-0 bottom-0 w-0.5" style={{ background: 'var(--surface-3)' }} />
    
    {integrations.map((item, i) => (
      <div key={i} className="relative flex items-center gap-4 py-3">
        {/* Station dot */}
        <div className="absolute left-[-5px] w-4 h-4 rounded-full border-2 border-white z-10" style={{ background: item.color }} />
        {/* Station info */}
        <div className="ml-8 flex items-center gap-3">
          <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{item.name}</span>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>·</span>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{item.desc}</span>
        </div>
      </div>
    ))}
  </div>
</div>
```

---

### [MODIFY] [SocialProof.tsx](file:///c:/Users/PMYLS/Downloads/DMpilot/dmpilot-2/src/components/landing/sections/SocialProof.tsx)

#### 3.11 — Add card backgrounds to testimonials

```diff
- <div className="space-y-8">
-   {testimonials.map((t, i) => (
-     <div key={i} className="flex items-start gap-5">

+ <div className="grid md:grid-cols-2 gap-6">
+   {testimonials.map((t, i) => (
+     <div key={i} className="card-warm flex items-start gap-4 p-6">
```

#### 3.12 — Add social proof counter above testimonials

```tsx
{/* Stats counter */}
<div className="text-center mb-12 p-8 rounded-2xl" style={{ background: 'var(--section-warm)' }}>
  <div className="text-5xl font-bold" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>247</div>
  <div className="text-xs font-bold tracking-[0.2em] uppercase mt-2" style={{ color: 'var(--accent)' }}>QUIET DAYS RECLAIMED</div>
  <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>in private beta · opening more seats soon</div>
</div>
```

#### 3.13 — Update heading

```diff
- <h2>Already in beta</h2>
+ <p className="text-xs font-medium tracking-[0.2em] uppercase mb-3" style={{ color: 'var(--text-muted)' }}>FROM THE CALM CREW</p>
+ <h2>Quiet wins, said out loud.</h2>
+ <p>Three weeks into beta and the inbox is already proof.</p>
```

---

### [MODIFY] [Comparison.tsx](file:///c:/Users/PMYLS/Downloads/DMpilot/dmpilot-2/src/components/landing/sections/Comparison.tsx)

#### 3.14 — Fix chart quadrant layout

The current chart has axis labels rotated incorrectly and quadrant labels in wrong positions. Fix:

- Top axis = `↑ BUSY`
- Bottom axis = `CALM ↓`
- Left axis = `← SINGLE-PURPOSE`
- Right axis = `EVERYTHING IN ONE →`
- Top-left quadrant = `BUSY · NICHE`
- Top-right = `BUSY · MAXIMAL`
- Bottom-left = `CALM · NICHE`
- Bottom-right = `CALM · COMPLETE ★`
- Position DMPilot in the `CALM · COMPLETE ★` quadrant (bottom-right)

---

### [MODIFY] [TargetAudience.tsx](file:///c:/Users/PMYLS/Downloads/DMpilot/dmpilot-2/src/components/landing/sections/TargetAudience.tsx)

#### 3.15 — Add warm card backgrounds + section background

```diff
- <section className="py-24 px-6" style={{ background: 'var(--surface-0)' }}>
+ <section className="py-24 px-6" style={{ background: 'var(--section-neutral)' }}>

- <div key={i} className="p-8 rounded-2xl border" style={{ background: 'var(--surface-1)', borderColor: 'var(--surface-3)' }}>
+ <div key={i} className="card-warm">
```

---

## Phase 4: Interactive Sections

---

### [MODIFY] [FAQ.tsx](file:///c:/Users/PMYLS/Downloads/DMpilot/dmpilot-2/src/components/landing/sections/FAQ.tsx)

#### 4.1 — Convert from accordion to iMessage-style chat UI

Replace the `openIndex` accordion pattern with a chat layout where:
- Questions appear as sent messages (right-aligned, dark bubble)
- Answers appear as received messages (left-aligned, light bubble)
- Add a "Today" divider at the top
- Keep the chat header (DMPilot avatar + "Online · Usually replies instantly")

```tsx
<div className="space-y-4">
  {/* Today divider */}
  <div className="text-center">
    <span className="text-xs px-3 py-1 rounded-full" style={{ background: 'var(--surface-2)', color: 'var(--text-muted)' }}>Today</span>
  </div>
  
  {faqs.map((faq, i) => (
    <div key={i} className="space-y-3">
      {/* Question — right aligned (user) */}
      <div className="flex justify-end">
        <div className="max-w-[80%] px-4 py-3 rounded-2xl rounded-tr-md text-sm text-white" style={{ background: 'var(--text-primary)' }}>
          {faq.q}
        </div>
      </div>
      {/* Answer — left aligned (DMPilot) */}
      <div className="flex gap-2">
        <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center" style={{ background: 'var(--accent)' }}>
          <span className="text-white text-xs font-bold">D</span>
        </div>
        <div className="max-w-[80%] px-4 py-3 rounded-2xl rounded-tl-md text-sm" style={{ background: 'var(--surface-1)', color: 'var(--text-primary)' }}>
          {faq.a}
        </div>
      </div>
    </div>
  ))}
  
  {/* Input field at bottom */}
  <div className="flex items-center gap-2 mt-6 p-3 rounded-full" style={{ background: 'var(--surface-1)', border: '1px solid var(--surface-3)' }}>
    <span className="text-sm flex-1" style={{ color: 'var(--text-muted)' }}>Ask anything else…</span>
  </div>
</div>
```

---

### [MODIFY] [FinalCTA.tsx](file:///c:/Users/PMYLS/Downloads/DMpilot/dmpilot-2/src/components/landing/sections/FinalCTA.tsx)

#### 4.2 — Add warm background

```diff
- <section id="join" className="py-24 px-6" style={{ background: 'var(--surface-1)' }}>
+ <section id="join" className="py-24 px-6" style={{ background: 'var(--section-warm)' }}>
```

#### 4.3 — Convert bottom text to scrolling marquee

```diff
- <div className="mt-12 text-xs tracking-widest uppercase" style={{ color: 'var(--text-muted)' }}>
-   JOIN THE CALM CREW · ALREADY IN BETA · QUIET ON PURPOSE
- </div>

+ <div className="mt-12 overflow-hidden">
+   <div className="marquee-track">
+     {[...Array(4)].map((_, i) => (
+       <span key={i} className="text-xs tracking-[0.2em] uppercase whitespace-nowrap px-8" style={{ color: 'var(--text-muted)' }}>
+         JOIN THE CALM CREW · ALREADY IN BETA · QUIET ON PURPOSE ·&nbsp;
+       </span>
+     ))}
+   </div>
+ </div>
```

#### 4.4 — Use combined pill email input (same as hero)

---

### [MODIFY] [Footer.tsx](file:///c:/Users/PMYLS/Downloads/DMpilot/dmpilot-2/src/components/landing/sections/Footer.tsx)

#### 4.5 — Expand to multi-column footer

```tsx
<footer className="py-16 px-6" style={{ background: 'var(--surface-0)', borderTop: '1px solid var(--surface-3)' }}>
  <div className="max-w-5xl mx-auto">
    <div className="grid md:grid-cols-4 gap-12 mb-12">
      {/* Brand */}
      <div className="md:col-span-1">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#e85d3a] to-[#f09433] flex items-center justify-center">
            <span className="text-white text-xs font-bold">D</span>
          </div>
          <span className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>DMPilot.</span>
        </div>
        <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>Calm DM automation, on purpose.</p>
        {/* Social links */}
        <div className="flex gap-3">
          <a href="#" className="text-sm hover:opacity-70" style={{ color: 'var(--text-muted)' }}>X / Twitter</a>
          <a href="#" className="text-sm hover:opacity-70" style={{ color: 'var(--text-muted)' }}>GitHub</a>
          <a href="mailto:support@dmpilot.com" className="text-sm hover:opacity-70" style={{ color: 'var(--text-muted)' }}>Email</a>
        </div>
      </div>

      {/* Product links */}
      <div>
        <h4 className="text-xs font-bold tracking-[0.15em] uppercase mb-4" style={{ color: 'var(--text-muted)' }}>PRODUCT</h4>
        <div className="space-y-2">
          {['Features', 'Integrations', 'Pricing', 'Blog', 'Help'].map(link => (
            <a key={link} href="#" className="block text-sm hover:opacity-70" style={{ color: 'var(--text-secondary)' }}>{link}</a>
          ))}
        </div>
      </div>

      {/* Company links */}
      <div>
        <h4 className="text-xs font-bold tracking-[0.15em] uppercase mb-4" style={{ color: 'var(--text-muted)' }}>COMPANY</h4>
        <div className="space-y-2">
          {['About', 'Privacy', 'Terms'].map(link => (
            <a key={link} href="#" className="block text-sm hover:opacity-70" style={{ color: 'var(--text-secondary)' }}>{link}</a>
          ))}
        </div>
      </div>

      {/* Sign-off */}
      <div className="flex flex-col justify-end">
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Goodnight. Sleep well.</p>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>— The DMPilot team</p>
      </div>
    </div>

    {/* Bottom bar */}
    <div className="pt-6 border-t text-center" style={{ borderColor: 'var(--surface-3)' }}>
      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
        © {new Date().getFullYear()} DMPilot. Made with care for creators.
      </p>
    </div>
  </div>
</footer>
```

---

## Phase 5: Animations & Polish

---

### [MODIFY] [globals.css](file:///c:/Users/PMYLS/Downloads/DMpilot/dmpilot-2/src/app/globals.css)

#### 5.1 — Add scroll-triggered animation utility

```css
/* Intersection Observer animation targets */
.animate-on-scroll {
  opacity: 0;
  transform: translateY(24px);
  transition: opacity 0.6s ease-out, transform 0.6s ease-out;
}
.animate-on-scroll.is-visible {
  opacity: 1;
  transform: translateY(0);
}
```

### [NEW] [useScrollAnimation.ts](file:///c:/Users/PMYLS/Downloads/DMpilot/dmpilot-2/src/lib/useScrollAnimation.ts)

#### 5.2 — Shared scroll animation hook

```tsx
'use client';
import { useEffect, useRef, useState } from 'react';

export function useScrollAnimation(threshold = 0.2) {
  const ref = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isVisible };
}
```

Apply this hook to every section for consistent fade-in-up on scroll.

### All sections — Apply alternating section backgrounds

| Section | Background |
|---|---|
| Hero | `hero-bg` (gradient) |
| SoundFamiliar | `--section-warm` (cream) |
| CostOfManual | `--surface-0` (white) |
| WhatDMPilotDoes | `--section-cool` (mint) |
| DayInDMPilot | `--surface-0` (white) |
| Values | `--section-warm` (cream) |
| TargetAudience | `--section-neutral` (ivory) |
| HonestComparison | `--surface-0` (white) |
| MeetsYouWhere | `--section-cool` (mint) |
| SocialProof | `--section-warm` (cream) |
| FAQ | `--surface-0` (white) |
| FinalCTA | `--section-warm` (cream) |
| Footer | `--surface-0` (white) |

---

## Verification Plan

### Automated
```bash
cd c:\Users\PMYLS\Downloads\DMpilot\dmpilot-2
npm run build     # Ensure no build errors
npm run lint      # Ensure no lint warnings
```

### Visual
1. Run `npm run dev` and open localhost:3000
2. Scroll through entire page — verify:
   - [ ] Hero has gradient background with mountains + clouds
   - [ ] Navigation is floating pill with glassmorphism
   - [ ] CTA buttons are coral/orange
   - [ ] Section backgrounds alternate (cream, white, mint, etc.)
   - [ ] Phone mockup has iPhone frame
   - [ ] Features section is 2×2 grid
   - [ ] FAQ is chat-style UI
   - [ ] Values is manifesto document card
   - [ ] Footer is multi-column
   - [ ] Marquee scrolls in CTA section
   - [ ] All sections fade in on scroll
3. Test dark mode toggle
4. Test mobile responsiveness (resize to 375px width)
5. Deploy to Vercel and verify on production

---

## File Change Summary

| Category | File | Action |
|---|---|---|
| **Global** | [globals.css](file:///c:/Users/PMYLS/Downloads/DMpilot/dmpilot-2/src/app/globals.css) | MODIFY — new palette, animations, utilities |
| **Global** | [layout.tsx](file:///c:/Users/PMYLS/Downloads/DMpilot/dmpilot-2/src/app/layout.tsx) | MODIFY — add Outfit font |
| **Nav** | [Navigation.tsx](file:///c:/Users/PMYLS/Downloads/DMpilot/dmpilot-2/src/components/landing/shared/Navigation.tsx) | MODIFY — floating pill, logo, coral CTA |
| **Nav** | [SideNavigation.tsx](file:///c:/Users/PMYLS/Downloads/DMpilot/dmpilot-2/src/components/landing/shared/SideNavigation.tsx) | MODIFY — warm accent color |
| **Hero** | [Hero.tsx](file:///c:/Users/PMYLS/Downloads/DMpilot/dmpilot-2/src/components/landing/sections/Hero.tsx) | MODIFY — gradient bg, SVG mountains, pill input |
| **Problem** | [SoundFamiliar.tsx](file:///c:/Users/PMYLS/Downloads/DMpilot/dmpilot-2/src/components/landing/sections/SoundFamiliar.tsx) | MODIFY — warm bg, uppercase label |
| **Problem** | [NotificationStack.tsx](file:///c:/Users/PMYLS/Downloads/DMpilot/dmpilot-2/src/components/landing/visual-storytelling/NotificationStack.tsx) | MODIFY — iPhone frame, colored icons |
| **Data** | [DayTimeline.tsx](file:///c:/Users/PMYLS/Downloads/DMpilot/dmpilot-2/src/components/landing/data-viz/DayTimeline.tsx) | MODIFY — horizontal Gantt chart |
| **Features** | [WhatDMPilotDoes.tsx](file:///c:/Users/PMYLS/Downloads/DMpilot/dmpilot-2/src/components/landing/sections/WhatDMPilotDoes.tsx) | MODIFY — 2×2 grid, cool bg |
| **Timeline** | [DayInDMPilot.tsx](file:///c:/Users/PMYLS/Downloads/DMpilot/dmpilot-2/src/components/landing/sections/DayInDMPilot.tsx) | MODIFY — visual calendar + annotations |
| **Values** | [Values.tsx](file:///c:/Users/PMYLS/Downloads/DMpilot/dmpilot-2/src/components/landing/sections/Values.tsx) | MODIFY — manifesto document card |
| **Audience** | [TargetAudience.tsx](file:///c:/Users/PMYLS/Downloads/DMpilot/dmpilot-2/src/components/landing/sections/TargetAudience.tsx) | MODIFY — warm cards, neutral bg |
| **Compare** | [Comparison.tsx](file:///c:/Users/PMYLS/Downloads/DMpilot/dmpilot-2/src/components/landing/sections/Comparison.tsx) | MODIFY — fix chart layout |
| **Integrate** | [Integrations.tsx](file:///c:/Users/PMYLS/Downloads/DMpilot/dmpilot-2/src/components/landing/sections/Integrations.tsx) | MODIFY — transit map visual |
| **Social** | [SocialProof.tsx](file:///c:/Users/PMYLS/Downloads/DMpilot/dmpilot-2/src/components/landing/sections/SocialProof.tsx) | MODIFY — card grid, counter |
| **FAQ** | [FAQ.tsx](file:///c:/Users/PMYLS/Downloads/DMpilot/dmpilot-2/src/components/landing/sections/FAQ.tsx) | MODIFY — chat UI |
| **CTA** | [FinalCTA.tsx](file:///c:/Users/PMYLS/Downloads/DMpilot/dmpilot-2/src/components/landing/sections/FinalCTA.tsx) | MODIFY — warm bg, marquee |
| **Footer** | [Footer.tsx](file:///c:/Users/PMYLS/Downloads/DMpilot/dmpilot-2/src/components/landing/sections/Footer.tsx) | MODIFY — multi-column |
| **Util** | [useScrollAnimation.ts](file:///c:/Users/PMYLS/Downloads/DMpilot/dmpilot-2/src/lib/useScrollAnimation.ts) | NEW — shared scroll hook |
| **Total** | | **18 files modified, 1 new file** |
