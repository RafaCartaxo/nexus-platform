type Listener = (...args: unknown[]) => void

class EventBus {
  private listeners = new Map<string, Set<Listener>>()

  on(event: string, fn: Listener) {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set())
    this.listeners.get(event)!.add(fn)
    return () => { this.listeners.get(event)?.delete(fn) }
  }

  emit(event: string, ...args: unknown[]) {
    this.listeners.get(event)?.forEach((fn) => fn(...args))
  }

  off(event: string, fn: Listener) {
    this.listeners.get(event)?.delete(fn)
  }
}

export const eventBus = new EventBus()
