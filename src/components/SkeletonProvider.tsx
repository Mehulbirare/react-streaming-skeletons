'use client'

import React, { createContext, useContext } from 'react'
import type { SkeletonTheme, SkeletonProviderProps } from '../types'

export const defaultTheme: SkeletonTheme = {
  color: '#e2e8f0',
  highlight: '#f8fafc',
  borderRadius: 4,
  duration: 1.5,
  animationDirection: 'ltr',
  enableAnimation: true,
}

const SkeletonContext = createContext<SkeletonTheme>(defaultTheme)

export function useSkeletonTheme(): SkeletonTheme {
  return useContext(SkeletonContext)
}

export function SkeletonProvider({ theme, children }: SkeletonProviderProps) {
  const merged: SkeletonTheme = { ...defaultTheme, ...theme }

  return (
    <SkeletonContext.Provider value={merged}>
      <div
        data-rss-provider=""
        data-rss-direction={merged.animationDirection}
        {...(!merged.enableAnimation ? { 'data-rss-no-animation': '' } : {})}
        style={
          {
            '--rss-color': merged.color,
            '--rss-highlight': merged.highlight,
            '--rss-duration': `${merged.duration}s`,
          } as React.CSSProperties
        }
      >
        {children}
      </div>
    </SkeletonContext.Provider>
  )
}
