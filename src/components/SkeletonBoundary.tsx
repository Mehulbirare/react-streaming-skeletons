'use client'

import React, { Suspense, useRef, useEffect } from 'react'
import type { SkeletonBoundaryProps } from '../types'

const isDev = process.env.NODE_ENV === 'development'

function useCLSDetection(enabled: boolean, threshold: number) {
  const containerRef = useRef<HTMLDivElement>(null)
  const firstHeightRef = useRef(0)
  const warnedRef = useRef(false)

  useEffect(() => {
    if (!enabled || !containerRef.current) return

    const el = containerRef.current
    firstHeightRef.current = el.getBoundingClientRect().height

    const observer = new ResizeObserver(() => {
      if (warnedRef.current) return

      const current = el.getBoundingClientRect().height
      const baseline = firstHeightRef.current

      if (baseline === 0 || current === baseline) return

      const diff = Math.abs(current - baseline) / baseline
      if (diff > threshold) {
        warnedRef.current = true
        console.warn(
          `[react-streaming-skeletons] CLS risk detected!\n` +
            `  Skeleton height : ${Math.round(baseline)}px\n` +
            `  Content height  : ${Math.round(current)}px\n` +
            `  Shift           : ${Math.round(diff * 100)}% (threshold: ${Math.round(threshold * 100)}%)\n` +
            `  Fix: match your <Bone height={...}> values to the resolved content dimensions.`,
        )
      }
    })

    observer.observe(el)
    return () => observer.disconnect()
  }, [enabled, threshold])

  return containerRef
}

export function SkeletonBoundary({
  fallback,
  children,
  clsThreshold = 0.1,
}: SkeletonBoundaryProps) {
  const containerRef = useCLSDetection(isDev, clsThreshold)

  if (isDev) {
    return (
      <div ref={containerRef} data-rss-boundary="">
        <Suspense fallback={fallback}>{children}</Suspense>
      </div>
    )
  }

  return <Suspense fallback={fallback}>{children}</Suspense>
}
