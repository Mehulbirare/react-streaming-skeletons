import type { ComponentType, FC, ReactElement } from 'react'

/**
 * Co-locate a skeleton with its real component so the two stay in sync.
 *
 * @example
 * export const UserCardSkeleton = defineSkeleton(UserCard, () => (
 *   <div>
 *     <Bone circle width={40} height={40} />
 *     <Bone width="60%" height={20} />
 *   </div>
 * ))
 */
export function defineSkeleton<P>(
  Component: ComponentType<P>,
  render: () => ReactElement,
): FC {
  const displayName = Component.displayName ?? Component.name ?? 'Component'

  function SkeletonComponent() {
    return render()
  }

  SkeletonComponent.displayName = `${displayName}Skeleton`
  return SkeletonComponent
}
