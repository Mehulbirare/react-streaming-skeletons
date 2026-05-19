'use client'

import React, { useEffect, Fragment } from 'react'
import { ensureStylesInjected } from '../utils/injectStyles'
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

  const borderRadius: string | undefined =
    circle ? '50%' : rounded ? '9999px' : undefined

  const baseStyle: React.CSSProperties = {
    width: width ?? '100%',
    height: height ?? '1em',
    borderRadius,
    display: inline ? 'inline-block' : 'block',
    ...style,
  }

  if (count <= 1) {
    return (
      <span
        data-rss-bone=""
        className={className}
        style={baseStyle}
        aria-hidden="true"
      />
    )
  }

  return (
    <Fragment>
      {Array.from({ length: count }, (_, i) => (
        <span
          key={i}
          data-rss-bone=""
          className={className}
          style={{
            ...baseStyle,
            marginBottom: i < count - 1 ? '0.5em' : undefined,
          }}
          aria-hidden="true"
        />
      ))}
    </Fragment>
  )
}
