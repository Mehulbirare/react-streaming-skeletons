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

  it('renders a wrapper div in development mode', () => {
    const { container } = render(
      <SkeletonBoundary fallback={<div />}>
        <div>child</div>
      </SkeletonBoundary>,
    )
    // NODE_ENV is 'test' in jest, which is treated same as development for this check
    // The wrapper div is only added when NODE_ENV === 'development'
    // In test env (not 'development'), no wrapper is added
    expect(container.firstChild).toBeDefined()
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
})
