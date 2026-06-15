import React, { Suspense } from 'react'
import { render, screen, act } from '@testing-library/react'
import { SkeletonBoundary } from '../src/components/SkeletonBoundary'

type Status = 'pending' | 'success' | 'error'

function createResource(promise: Promise<string>) {
  let status: Status = 'pending'
  let value = ''

  const settled = promise.then((v) => {
    status = 'success'
    value = v
  })

  return {
    read() {
      if (status === 'pending') throw settled
      return value
    },
  }
}

function AsyncText({ resource }: { resource: ReturnType<typeof createResource> }) {
  const text = resource.read()
  return <div>{text}</div>
}

describe('SkeletonBoundary', () => {
  it('renders the fallback while the child is suspended', async () => {
    let resolve!: (v: string) => void
    const promise = new Promise<string>((r) => { resolve = r })
    const resource = createResource(promise)

    render(
      <SkeletonBoundary fallback={<div>Loading skeleton</div>}>
        <AsyncText resource={resource} />
      </SkeletonBoundary>,
    )

    expect(screen.getByText('Loading skeleton')).toBeInTheDocument()

    await act(async () => {
      resolve('Loaded content')
      await promise
    })

    expect(screen.getByText('Loaded content')).toBeInTheDocument()
    expect(screen.queryByText('Loading skeleton')).not.toBeInTheDocument()
  })

  it('renders children immediately when they do not suspend', () => {
    render(
      <SkeletonBoundary fallback={<div>Loading</div>}>
        <div>Ready immediately</div>
      </SkeletonBoundary>,
    )
    expect(screen.getByText('Ready immediately')).toBeInTheDocument()
    expect(screen.queryByText('Loading')).not.toBeInTheDocument()
  })

  it('renders a wrapper div in development/test mode', () => {
    const { container } = render(
      <SkeletonBoundary fallback={<div />}>
        <div>child</div>
      </SkeletonBoundary>,
    )
    expect(container.querySelector('[data-rss-boundary]')).toBeInTheDocument()
  })

  it('accepts a custom clsThreshold prop without throwing', () => {
    expect(() =>
      render(
        <SkeletonBoundary fallback={<div />} clsThreshold={0.2}>
          <div>child</div>
        </SkeletonBoundary>,
      ),
    ).not.toThrow()
  })

  describe('CLS warning logs', () => {
    let originalConsoleWarn: typeof console.warn
    let originalResizeObserver: typeof global.ResizeObserver
    let resizeCallback: (() => void) | undefined

    beforeEach(() => {
      originalConsoleWarn = console.warn
      console.warn = jest.fn()

      originalResizeObserver = global.ResizeObserver
      global.ResizeObserver = class {
        constructor(cb: () => void) {
          resizeCallback = cb
        }
        observe() {}
        unobserve() {}
        disconnect() {}
      } as any
    })

    afterEach(() => {
      console.warn = originalConsoleWarn
      global.ResizeObserver = originalResizeObserver
      resizeCallback = undefined
    })

    it('warns when a layout shift exceeding the threshold is detected', async () => {
      let resolve!: (v: string) => void
      const promise = new Promise<string>((r) => { resolve = r })
      const resource = createResource(promise)

      let elementHeight = 100
      const originalGetBoundingClientRect = Element.prototype.getBoundingClientRect
      Element.prototype.getBoundingClientRect = function () {
        return {
          width: 100,
          height: elementHeight,
          top: 0,
          right: 100,
          bottom: elementHeight,
          left: 0,
          x: 0,
          y: 0,
          toJSON() {}
        } as DOMRect
      }

      try {
        const { container } = render(
          <SkeletonBoundary fallback={<div data-testid="fallback" />}>
            <AsyncText resource={resource} />
          </SkeletonBoundary>,
        )

        expect(container.querySelector('[data-testid="fallback"]')).toBeInTheDocument()

        elementHeight = 200

        await act(async () => {
          resolve('Resolved text')
          await promise
        })

        // Also trigger resize observer callback if it was set
        act(() => {
          if (resizeCallback) {
            resizeCallback()
          }
        })

        expect(console.warn).toHaveBeenCalledWith(
          expect.stringContaining('[react-streaming-skeletons] CLS risk detected!')
        )
      } finally {
        Element.prototype.getBoundingClientRect = originalGetBoundingClientRect
      }
    })
  })
})
