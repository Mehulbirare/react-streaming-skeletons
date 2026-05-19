import React from 'react'
import { render, screen } from '@testing-library/react'
import { defineSkeleton } from '../src/utils/defineSkeleton'

function UserCard({ name }: { name: string }) {
  return <div>{name}</div>
}

describe('defineSkeleton', () => {
  it('returns a component that renders the skeleton', () => {
    const UserCardSkeleton = defineSkeleton(UserCard, () => (
      <div data-testid="skeleton">Loading user...</div>
    ))

    render(<UserCardSkeleton />)
    expect(screen.getByTestId('skeleton')).toBeInTheDocument()
  })

  it('sets displayName based on the source component', () => {
    const UserCardSkeleton = defineSkeleton(UserCard, () => <div />)
    expect(UserCardSkeleton.displayName).toBe('UserCardSkeleton')
  })

  it('uses displayName property if set on the component', () => {
    function MyComponent() {
      return null
    }
    MyComponent.displayName = 'CustomName'

    const Skeleton = defineSkeleton(MyComponent, () => <div />)
    expect(Skeleton.displayName).toBe('CustomNameSkeleton')
  })

  it('each call to the skeleton renders fresh output', () => {
    let callCount = 0
    const Skeleton = defineSkeleton(UserCard, () => {
      callCount++
      return <div />
    })

    render(<Skeleton />)
    render(<Skeleton />)
    expect(callCount).toBe(2)
  })

  it('can be used as a Suspense fallback without errors', () => {
    const UserCardSkeleton = defineSkeleton(UserCard, () => (
      <div data-testid="fallback">skeleton ui</div>
    ))

    render(
      <React.Suspense fallback={<UserCardSkeleton />}>
        <UserCard name="Alice" />
      </React.Suspense>,
    )

    expect(screen.getByText('Alice')).toBeInTheDocument()
  })
})
