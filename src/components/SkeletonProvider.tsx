'use client'

import React, { createContext, useContext } from 'react'
import { SHIMMER_CSS, CSS_ID } from '../utils/injectStyles'
import type { SkeletonTheme, SkeletonProviderProps } from '../types'

export const defaultTheme: SkeletonTheme = {
  color: '#e2e8f0',
  highlight: '#f8fafc',
  borderRadius: 4,
  duration: 1.5,
  animationDirection: 'ltr',
  enableAnimation: true,
}

export const SkeletonContext = createContext<SkeletonTheme | undefined>(undefined)

export function useSkeletonTheme(): SkeletonTheme {
  const theme = useContext(SkeletonContext)
  return theme ?? defaultTheme
}

export function SkeletonProvider({ theme, children }: SkeletonProviderProps) {
  const merged: SkeletonTheme = { ...defaultTheme, ...theme }

  return (
    <SkeletonContext.Provider value={merged}>
      <style
        {...({
          href: 'react-streaming-skeletons-style',
          precedence: 'high',
        } as any)}
        id={CSS_ID}
        dangerouslySetInnerHTML={{ __html: SHIMMER_CSS }}
      />
      <div
        data-rss-provider=""
        data-rss-direction={merged.animationDirection}
        {...(!merged.enableAnimation ? { 'data-rss-no-animation': '' } : {})}
        style={
          {
            '--rss-color': merged.color,
            '--rss-highlight': merged.highlight,
            '--rss-duration': `${merged.duration}s`,
            '--rss-border-radius':
              typeof merged.borderRadius === 'number'
                ? `${merged.borderRadius}px`
                : merged.borderRadius,
          } as React.CSSProperties
        }
      >
        {children}
      </div>
    </SkeletonContext.Provider>
  )
}
