import { useCallback, useEffect, useRef, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface CarouselProps<T> {
  mode: "slide" | "scroll"
  items: T[]
  renderItem: (item: T, index: number) => React.ReactNode
  currentIndex?: number
  onIndexChange?: (index: number) => void
  itemWidth?: string
  className?: string
  hideDots?: boolean
  maxDots?: number
  itemKey?: (item: T) => string
}

export function Carousel<T>({
  mode,
  items,
  renderItem,
  currentIndex,
  onIndexChange,
  itemWidth = "w-72",
  className = "",
  hideDots = false,
  maxDots,
  itemKey,
}: CarouselProps<T>) {
  const touchStartRef = useRef<number | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [scrollIndex, setScrollIndex] = useState(0)
  const prevIndexRef = useRef<number | undefined>(undefined)
  const slideDirRef = useRef("")

  if (currentIndex !== undefined) {
    if (prevIndexRef.current !== undefined && currentIndex !== prevIndexRef.current) {
      slideDirRef.current = currentIndex > prevIndexRef.current ? "right" : "left"
      prevIndexRef.current = currentIndex
    } else if (prevIndexRef.current === undefined) {
      prevIndexRef.current = currentIndex
    }
  }

  const slideDir = slideDirRef.current

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartRef.current = e.touches[0].clientX
  }, [])

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (touchStartRef.current === null || currentIndex === undefined || !onIndexChange) return
      const diff = touchStartRef.current - e.changedTouches[0].clientX
      if (Math.abs(diff) > 50) {
        if (diff > 0 && currentIndex < items.length - 1) {
          onIndexChange(currentIndex + 1)
        } else if (diff < 0 && currentIndex > 0) {
          onIndexChange(currentIndex - 1)
        }
      }
      touchStartRef.current = null
    },
    [currentIndex, onIndexChange, items.length],
  )

  useEffect(() => {
    const el = scrollRef.current
    if (!el || mode !== "scroll" || items.length <= 1) return

    function nearestIndex(container: HTMLElement): number {
      const center = container.scrollLeft + container.clientWidth / 2
      const children = Array.from(container.children) as HTMLElement[]
      let closest = 0
      let closestDist = Infinity
      children.forEach((child, i) => {
        const childCenter = child.offsetLeft + child.offsetWidth / 2
        const dist = Math.abs(childCenter - center)
        if (dist < closestDist) { closestDist = dist; closest = i }
      })
      return closest
    }

    let timeout: number | null = null

    const handleScroll = () => {
      const nearest = nearestIndex(el)
      if (!timeout) {
        setScrollIndex(nearest)
      }
      if (timeout !== null) clearTimeout(timeout)
      timeout = window.setTimeout(() => {
        const index = nearestIndex(el)
        setScrollIndex(index)
        const target = el.children[index] as HTMLElement
        const scrollTarget = target.offsetLeft - el.offsetLeft
        if (Math.abs(el.scrollLeft - scrollTarget) > 1) {
          el.scrollTo({ left: scrollTarget, behavior: "smooth" })
        }
      }, 100)
    }

    el.addEventListener("scroll", handleScroll, { passive: true })
    return () => {
      el.removeEventListener("scroll", handleScroll)
      if (timeout !== null) clearTimeout(timeout)
    }
  }, [mode, items.length])

  if (items.length === 0) return null

  if (mode === "slide") {
    const showPrev = currentIndex !== undefined && currentIndex > 0
    const showNext = currentIndex !== undefined && currentIndex < items.length - 1

    return (
      <div className={className}>
        <div
          className="relative overflow-hidden"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {showPrev && (
            <button
              type="button"
              onClick={() => onIndexChange?.(currentIndex! - 1)}
              className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-surface/80 p-1.5 text-text-secondary shadow-sm hover:bg-surface hover:text-text-primary"
              aria-label="Anterior"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          )}

          {currentIndex !== undefined && (
            <div
              key={itemKey ? itemKey(items[currentIndex]) : currentIndex}
              className={
                slideDir === "right" ? "animate-slide-in-right"
                : slideDir === "left" ? "animate-slide-in-left"
                : ""
              }
            >
              {renderItem(items[currentIndex], currentIndex)}
            </div>
          )}

          {showNext && (
            <button
              type="button"
              onClick={() => onIndexChange?.(currentIndex! + 1)}
              className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-surface/80 p-1.5 text-text-secondary shadow-sm hover:bg-surface hover:text-text-primary"
              aria-label="Próximo"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          )}
        </div>

        {!hideDots && items.length > 1 && (
          <div className="mt-4 flex items-center justify-center gap-1.5">
            {maxDots && items.length > maxDots ? (
              <>
                {Array.from({ length: maxDots }, (_, i) => {
                  const half = Math.floor(maxDots / 2)
                  const startDot = Math.max(0, Math.min(currentIndex! - half, items.length - maxDots))
                  return (
                    <button
                      key={startDot + i}
                      type="button"
                      onClick={() => onIndexChange?.(startDot + i)}
                      className={`h-2 w-2 rounded-full transition-colors ${
                        startDot + i === currentIndex ? "bg-primary" : "bg-surface-hover"
                      }`}
                      aria-label={`Ir para item ${startDot + i + 1}`}
                    />
                  )
                })}
              </>
            ) : (
              items.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => onIndexChange?.(i)}
                  className={`h-2 w-2 rounded-full transition-colors ${
                    i === currentIndex ? "bg-primary" : "bg-surface-hover"
                  }`}
                  aria-label={`Ir para item ${i + 1}`}
                />
              ))
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={className}>
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-2"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {items.map((item, i) => (
          <div key={i} className={`shrink-0 ${itemWidth}`}>
            {renderItem(item, i)}
          </div>
        ))}
      </div>

      {!hideDots && items.length > 1 && (
        <div className="mt-2 flex items-center justify-center gap-1.5">
          {maxDots && items.length > maxDots ? (
            <>
              {Array.from({ length: maxDots }, (_, i) => {
                const half = Math.floor(maxDots / 2)
                const startDot = Math.max(0, Math.min(scrollIndex - half, items.length - maxDots))
                return (
                  <div
                    key={startDot + i}
                    className={`h-1.5 w-1.5 rounded-full transition-colors ${
                      startDot + i === scrollIndex ? "bg-primary" : "bg-surface-hover"
                    }`}
                  />
                )
              })}
            </>
          ) : (
            items.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 w-1.5 rounded-full transition-colors ${
                    i === scrollIndex ? "bg-primary" : "bg-surface-hover"
                }`}
              />
            ))
          )}
        </div>
      )}
    </div>
  )
}
