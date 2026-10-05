import { type RefObject, useCallback, useEffect, useRef, useState } from 'react'

export function useNearViewport<T extends Element>(
  marginPx: number,
): [RefObject<T>, () => boolean, number] {
  const ref = useRef<T>(null)
  const [tick, setTick] = useState(0)

  const isNear = useCallback(() => {
    const element = ref.current
    return element !== null && element.getBoundingClientRect().top < window.innerHeight + marginPx
  }, [marginPx])

  useEffect(() => {
    const element = ref.current
    if (!element) {
      return undefined
    }
    const observer = new IntersectionObserver(() => setTick((value) => value + 1), {
      rootMargin: `${marginPx}px`,
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [marginPx])

  return [ref, isNear, tick]
}
