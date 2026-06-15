import React from 'react'
import { render, screen } from '@testing-library/react'
import { Bone } from '../src/components/Bone'
import { SkeletonProvider } from '../src/components/SkeletonProvider'

describe('Bone', () => {
  it('renders a single bone element', () => {
    const { container } = render(<Bone />)
    const bone = container.querySelector('[data-rss-bone]')
    expect(bone).toBeInTheDocument()
  })

  it('applies width and height as inline styles', () => {
    const { container } = render(<Bone width={120} height={20} />)
    const bone = container.querySelector('[data-rss-bone]') as HTMLElement
    expect(bone.style.width).toBe('120px')
    expect(bone.style.height).toBe('20px')
  })

  it('applies string dimensions', () => {
    const { container } = render(<Bone width="60%" height="1.5rem" />)
    const bone = container.querySelector('[data-rss-bone]') as HTMLElement
    expect(bone.style.width).toBe('60%')
    expect(bone.style.height).toBe('1.5rem')
  })

  it('renders as circle when circle=true', () => {
    const { container } = render(<Bone circle width={40} height={40} />)
    const bone = container.querySelector('[data-rss-bone]') as HTMLElement
    expect(bone.style.borderRadius).toBe('50%')
  })

  it('renders as pill when rounded=true', () => {
    const { container } = render(<Bone rounded />)
    const bone = container.querySelector('[data-rss-bone]') as HTMLElement
    expect(bone.style.borderRadius).toBe('9999px')
  })

  it('renders multiple bones when count > 1', () => {
    const { container } = render(<Bone count={3} />)
    const bones = container.querySelectorAll('[data-rss-bone]')
    expect(bones).toHaveLength(3)
  })

  it('renders a single bone when count is 1', () => {
    const { container } = render(<Bone count={1} />)
    const bones = container.querySelectorAll('[data-rss-bone]')
    expect(bones).toHaveLength(1)
  })

  it('renders as block by default', () => {
    const { container } = render(<Bone />)
    const bone = container.querySelector('[data-rss-bone]') as HTMLElement
    expect(bone.style.display).toBe('block')
  })

  it('renders as inline-block when inline=true', () => {
    const { container } = render(<Bone inline />)
    const bone = container.querySelector('[data-rss-bone]') as HTMLElement
    expect(bone.style.display).toBe('inline-block')
  })

  it('passes className to the bone element', () => {
    const { container } = render(<Bone className="my-bone" />)
    const bone = container.querySelector('[data-rss-bone]')
    expect(bone).toHaveClass('my-bone')
  })

  it('is hidden from accessibility tree', () => {
    const { container } = render(<Bone />)
    const bone = container.querySelector('[data-rss-bone]')
    expect(bone).toHaveAttribute('aria-hidden', 'true')
  })

  it('defaults width to 100% and height to 1em', () => {
    const { container } = render(<Bone />)
    const bone = container.querySelector('[data-rss-bone]') as HTMLElement
    expect(bone.style.width).toBe('100%')
    expect(bone.style.height).toBe('1em')
  })

  it('renders the style tag when used without a provider', () => {
    const { container } = render(<Bone />)
    const styleTag = container.querySelector('style#rss-styles')
    expect(styleTag).toBeInTheDocument()
  })

  it('does not render the style tag when wrapped in a SkeletonProvider', () => {
    const { container } = render(
      <SkeletonProvider>
        <Bone />
      </SkeletonProvider>,
    )
    // There will be one style tag from the SkeletonProvider, but none from the Bone.
    // Let's assert that there is only one style tag in total.
    const styleTags = container.querySelectorAll('style#rss-styles')
    expect(styleTags).toHaveLength(1)
  })

  it('sets data-rss-inline attribute when inline is true', () => {
    const { container } = render(<Bone inline />)
    const bone = container.querySelector('[data-rss-bone]')
    expect(bone).toHaveAttribute('data-rss-inline', '')
  })

  it('does not set data-rss-inline attribute when inline is false', () => {
    const { container } = render(<Bone />)
    const bone = container.querySelector('[data-rss-bone]')
    expect(bone).not.toHaveAttribute('data-rss-inline')
  })

  it('does not apply hardcoded marginBottom on multiple bones', () => {
    const { container } = render(<Bone count={3} />)
    const bones = container.querySelectorAll('[data-rss-bone]')
    bones.forEach((bone) => {
      const htmlBone = bone as HTMLElement
      expect(htmlBone.style.marginBottom).toBe('')
    })
  })
})
