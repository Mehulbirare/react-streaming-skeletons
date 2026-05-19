import type { CSSProperties, ReactNode } from 'react'

export interface SkeletonTheme {
  color: string
  highlight: string
  borderRadius: number | string
  duration: number
  animationDirection: 'ltr' | 'rtl'
  enableAnimation: boolean
}

export interface BoneProps {
  width?: number | string
  height?: number | string
  circle?: boolean
  rounded?: boolean
  className?: string
  style?: CSSProperties
  count?: number
  inline?: boolean
}

export interface SkeletonProviderProps {
  theme?: Partial<SkeletonTheme>
  children: ReactNode
}

export interface SkeletonBoundaryProps {
  fallback: ReactNode
  children: ReactNode
  /** Fraction (0–1) of height change that triggers a dev-mode CLS warning. Default: 0.1 */
  clsThreshold?: number
}
