# react-streaming-skeletons

Zero-layout-shift skeleton components for React Suspense streaming and Next.js App Router.

## The Problem

When you stream Server Components with `<Suspense>`, a mismatched fallback causes the page to **jump** when content loads — hurting your Core Web Vitals CLS score.

```tsx
// Before — causes layout shift
<Suspense fallback={<div className="h-4 bg-gray-200" />}>  {/* 16px */}
  <UserProfile />                                            {/* 340px */}
</Suspense>
```

This library gives you primitives to build dimension-matched skeletons, plus a **dev-mode warning** when your skeleton and real content heights diverge.

## Installation

```bash
npm install react-streaming-skeletons
```

React 18+ and react-dom 18+ are required as peer dependencies.

## Quick Start

```tsx
import { Bone, SkeletonBoundary, defineSkeleton } from 'react-streaming-skeletons'

// 1. Define a skeleton co-located with your real component
export function UserCard({ user }) {
  return (
    <div className="flex gap-3 p-4">
      <img src={user.avatar} className="w-10 h-10 rounded-full" />
      <div>
        <h2>{user.name}</h2>
        <p>{user.bio}</p>
      </div>
    </div>
  )
}

export const UserCardSkeleton = defineSkeleton(UserCard, () => (
  <div className="flex gap-3 p-4">
    <Bone circle width={40} height={40} />
    <div>
      <Bone width={120} height={20} />
      <Bone width={200} height={16} style={{ marginTop: 6 }} />
    </div>
  </div>
))

// 2. Use SkeletonBoundary instead of raw Suspense
export default function Page() {
  return (
    <SkeletonBoundary fallback={<UserCardSkeleton />}>
      <UserCard />
    </SkeletonBoundary>
  )
}
```

## Next.js App Router

`SkeletonBoundary` works directly in Server Component pages. Your async Server Component is passed as `children` — it retains its server nature.

```tsx
// app/dashboard/page.tsx  (Server Component)
import { SkeletonBoundary } from 'react-streaming-skeletons'
import { StatsCard, StatsCardSkeleton } from '@/components/StatsCard'

export default function DashboardPage() {
  return (
    <main>
      <h1>Dashboard</h1>

      <SkeletonBoundary fallback={<StatsCardSkeleton />}>
        <StatsCard />  {/* async Server Component — fetches from DB */}
      </SkeletonBoundary>
    </main>
  )
}
```

```tsx
// components/StatsCard.tsx  (async Server Component)
async function StatsCard() {
  const stats = await fetchStats()   // streamed from server
  return <div>{stats.revenue}</div>
}
```

## API

### `<Bone>`

The core animated skeleton element.

```tsx
<Bone
  width={200}       // number (px) or string ("60%", "10rem"). Default: "100%"
  height={20}       // number (px) or string. Default: "1em"
  circle            // renders as a circle (border-radius: 50%)
  rounded           // renders as a pill (border-radius: 9999px)
  count={3}         // renders N stacked bones
  inline            // display: inline-block instead of block
  className="..."   // forwarded to the element
  style={{}}        // merged into inline styles
/>
```

**Examples**

```tsx
// Avatar placeholder
<Bone circle width={48} height={48} />

// Text line
<Bone width="70%" height={16} />

// Paragraph (3 lines)
<Bone count={3} height={14} />

// Badge
<Bone rounded width={80} height={24} />
```

---

### `<SkeletonBoundary>`

A `<Suspense>` wrapper that shows `fallback` while children stream in.

```tsx
<SkeletonBoundary
  fallback={<MySkeleton />}
  clsThreshold={0.1}           // dev-only: warn when height shifts > 10%. Default: 0.1
>
  <AsyncServerComponent />
</SkeletonBoundary>
```

In **development mode**, `SkeletonBoundary` wraps its content in a `<div>` and uses `ResizeObserver` to detect when the resolved content height differs from the skeleton height by more than `clsThreshold`. A `console.warn` is printed with the exact pixel values so you can fix the mismatch. The wrapper div is **not rendered in production**.

---

### `<SkeletonProvider>`

Set a global theme for all `<Bone>` elements in the tree.

```tsx
<SkeletonProvider
  theme={{
    color: '#e2e8f0',           // base bone colour. Default: "#e2e8f0"
    highlight: '#f8fafc',       // shimmer highlight colour. Default: "#f8fafc"
    borderRadius: 4,            // default radius (px or string). Default: 4
    duration: 1.5,              // shimmer animation duration in seconds. Default: 1.5
    animationDirection: 'ltr',  // "ltr" | "rtl". Default: "ltr"
    enableAnimation: true,      // set false to disable shimmer (e.g. prefers-reduced-motion). Default: true
  }}
>
  <App />
</SkeletonProvider>
```

Theming is implemented with CSS custom properties (`--rss-color`, `--rss-highlight`, `--rss-duration`) so it has zero runtime overhead and respects nested overrides.

---

### `defineSkeleton(Component, renderFn)`

Links a skeleton to its real component so they stay co-located in the same file.

```tsx
export const UserCardSkeleton = defineSkeleton(UserCard, () => (
  <div>
    <Bone circle width={40} height={40} />
    <Bone width="60%" height={20} />
  </div>
))
```

The returned component gets a `displayName` of `"<ComponentName>Skeleton"`, which makes it easy to identify in React DevTools.

---

### `useSkeletonTheme()`

Read the current theme values in a custom skeleton component.

```tsx
import { useSkeletonTheme } from 'react-streaming-skeletons'

function CustomBone() {
  const { color, duration } = useSkeletonTheme()
  // ...
}
```

## Dark Mode

Wrap `SkeletonProvider` inside your theme toggle to switch bone colours:

```tsx
<SkeletonProvider
  theme={{
    color: isDark ? '#374151' : '#e5e7eb',
    highlight: isDark ? '#4b5563' : '#f9fafb',
  }}
>
  {children}
</SkeletonProvider>
```

## Accessibility

All `<Bone>` elements render with `aria-hidden="true"` so they are invisible to screen readers. Users who prefer reduced motion should disable the shimmer animation:

```tsx
const prefersReduced =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

<SkeletonProvider theme={{ enableAnimation: !prefersReduced }}>
  <App />
</SkeletonProvider>
```

## How the CLS Warning Works

In development, every `<SkeletonBoundary>` observes its container with `ResizeObserver`. The first measured height is treated as the skeleton height. When Suspense resolves and the container resizes, the new height is compared against the baseline. If the shift exceeds `clsThreshold` (default 10%), you'll see:

```
[react-streaming-skeletons] CLS risk detected!
  Skeleton height : 32px
  Content height  : 280px
  Shift           : 775% (threshold: 10%)
  Fix: match your <Bone height={...}> values to the resolved content dimensions.
```

## Bundle Size

~3 KB gzipped. Zero runtime dependencies.

## License

MIT
