import React from 'react'
import { render, screen } from '@testing-library/react'
import { SkeletonProvider, useSkeletonTheme, defaultTheme } from '../src/components/SkeletonProvider'

function ThemeConsumer() {
  const theme = useSkeletonTheme()
  return (
    <div>
      <span data-testid="color">{theme.color}</span>
      <span data-testid="highlight">{theme.highlight}</span>
      <span data-testid="duration">{theme.duration}</span>
      <span data-testid="direction">{theme.animationDirection}</span>
    </div>
  )
}

describe('SkeletonProvider', () => {
  it('provides the default theme when no theme prop is given', () => {
    render(
      <SkeletonProvider>
        <ThemeConsumer />
      </SkeletonProvider>,
    )
    expect(screen.getByTestId('color').textContent).toBe(defaultTheme.color)
    expect(screen.getByTestId('duration').textContent).toBe(String(defaultTheme.duration))
  })

  it('merges custom theme with defaults', () => {
    render(
      <SkeletonProvider theme={{ color: '#ff0000', duration: 2 }}>
        <ThemeConsumer />
      </SkeletonProvider>,
    )
    expect(screen.getByTestId('color').textContent).toBe('#ff0000')
    expect(screen.getByTestId('duration').textContent).toBe('2')
    // untouched defaults remain
    expect(screen.getByTestId('highlight').textContent).toBe(defaultTheme.highlight)
  })

  it('sets CSS custom properties on the wrapper div', () => {
    const { container } = render(
      <SkeletonProvider theme={{ color: '#aabbcc', duration: 3, borderRadius: 8 }}>
        <div />
      </SkeletonProvider>,
    )
    const wrapper = container.querySelector('[data-rss-provider]') as HTMLElement
    expect(wrapper.style.getPropertyValue('--rss-color')).toBe('#aabbcc')
    expect(wrapper.style.getPropertyValue('--rss-duration')).toBe('3s')
    expect(wrapper.style.getPropertyValue('--rss-border-radius')).toBe('8px')
  })

  it('renders the style tag for SSR styling support', () => {
    const { container } = render(
      <SkeletonProvider>
        <div />
      </SkeletonProvider>,
    )
    const styleTag = container.querySelector('style#rss-styles')
    expect(styleTag).toBeInTheDocument()
    expect(styleTag?.textContent).toContain('[data-rss-bone]')
  })

  it('sets data-rss-direction attribute', () => {
    const { container } = render(
      <SkeletonProvider theme={{ animationDirection: 'rtl' }}>
        <div />
      </SkeletonProvider>,
    )
    const wrapper = container.querySelector('[data-rss-provider]')
    expect(wrapper).toHaveAttribute('data-rss-direction', 'rtl')
  })

  it('sets data-rss-no-animation when enableAnimation is false', () => {
    const { container } = render(
      <SkeletonProvider theme={{ enableAnimation: false }}>
        <div />
      </SkeletonProvider>,
    )
    const wrapper = container.querySelector('[data-rss-provider]')
    expect(wrapper).toHaveAttribute('data-rss-no-animation')
  })

  it('useSkeletonTheme returns defaults outside a provider', () => {
    render(<ThemeConsumer />)
    expect(screen.getByTestId('color').textContent).toBe(defaultTheme.color)
  })
})
