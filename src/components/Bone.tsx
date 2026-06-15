'use client'

import React, { useEffect, Fragment, useContext } from 'react'
import { ensureStylesInjected, SHIMMER_CSS, CSS_ID } from '../utils/injectStyles'
import { SkeletonContext } from './SkeletonProvider'
import type { BoneProps } from '../types'

export function Bone({
  width,
  height,
  circle = false,
  rounded = false,
  className,
  style,
  count = 1,
  inline = false,
}: BoneProps) {
  useEffect(() => {
    ensureStylesInjected()
  }, [])

  const context = useContext(SkeletonContext)

  const borderRadius: string | undefined =
    circle ? '50%' : rounded ? '9999px' : undefined

  const baseStyle: React.CSSProperties = {
    width: width ?? '100%',
    height: height ?? '1em',
    borderRadius,
    display: inline ? 'inline-block' : 'block',
    ...style,
  }

  const styleTag =
    context === undefined ? (
      <style
        {...({
          href: 'react-streaming-skeletons-style',
          precedence: 'high',
        } as any)}
        id={CSS_ID}
        dangerouslySetInnerHTML={{ __html: SHIMMER_CSS }}
      />
    ) : null

  if (count <= 1) {
    return (
      <Fragment>
        {styleTag}
        <span
          data-rss-bone=""
          data-rss-inline={inline ? '' : undefined}
          className={className}
          style={baseStyle}
          aria-hidden="true"
        />
      </Fragment>
    )
  }

  return (
    <Fragment>
      {styleTag}
      {Array.from({ length: count }, (_, i) => (
        <span
          key={i}
          data-rss-bone=""
          data-rss-inline={inline ? '' : undefined}
          className={className}
          style={baseStyle}
          aria-hidden="true"
        />
      ))}
    </Fragment>
  )
}
