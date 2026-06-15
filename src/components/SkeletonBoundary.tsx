'use client'

import React, { Suspense, useRef, useEffect } from 'react'
import type { SkeletonBoundaryProps } from '../types'

const isDev = process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test'

function useCLSDetection(enabled: boolean, threshold: number) {
  const containerRef = useRef<HTMLDivElement>(null)
  const firstHeightRef = useRef(0)
  const warnedRef = useRef(false)

  useEffect(() => {
    if (!enabled || !containerRef.current || typeof ResizeObserver === 'undefined') return

    const el = containerRef.current

    // Helper to calculate height encompassing all child DOM elements (handles display: contents)
    const getChildrenHeight = (): number => {
      const children = Array.from(el.children)
      if (children.length === 0) return 0

      let minTop = Infinity
      let maxBottom = -Infinity

      for (const child of children) {
        const rect = child.getBoundingClientRect()
        if (rect.width === 0 && rect.height === 0) continue
        if (rect.top < minTop) minTop = rect.top
        if (rect.bottom > maxBottom) maxBottom = rect.bottom
      }

      return minTop === Infinity ? 0 : maxBottom - minTop
    }

    firstHeightRef.current = getChildrenHeight()

    const checkHeight = () => {
      if (warnedRef.current) return

      const current = getChildrenHeight()
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
    }

    const resizeObserver = new ResizeObserver(() => {
      checkHeight()
    })

    const observedElements = new Set<Element>()
    const updateObservedElements = () => {
      const currentChildren = Array.from(el.children)

      for (const child of observedElements) {
        if (!currentChildren.includes(child)) {
          resizeObserver.unobserve(child)
          observedElements.delete(child)
        }
      }

      for (const child of currentChildren) {
        if (!observedElements.has(child)) {
          resizeObserver.observe(child)
          observedElements.add(child)
        }
      }

      if (firstHeightRef.current === 0) {
        firstHeightRef.current = getChildrenHeight()
      }
    }

    updateObservedElements()

    const mutationObserver = new MutationObserver(() => {
      updateObservedElements()
      checkHeight()
    })

    mutationObserver.observe(el, { childList: true })

    return () => {
      resizeObserver.disconnect()
      mutationObserver.disconnect()
    }
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
