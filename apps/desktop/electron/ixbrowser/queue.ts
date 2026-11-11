/** Fila com limite de concorrência (ixBrowser: máx. 3). */
export class ConcurrencyQueue {
  private running = 0
  private readonly waiters: Array<() => void> = []

  constructor(private readonly limit = 3) {}

  async run<T>(fn: () => Promise<T>): Promise<T> {
    if (this.running >= this.limit) {
      await new Promise<void>((resolve) => this.waiters.push(resolve))
    }
    this.running += 1
    try {
      return await fn()
    } finally {
      this.running -= 1
      const next = this.waiters.shift()
      if (next) next()
    }
  }

  get active() {
    return this.running
  }

  get pending() {
    return this.waiters.length
  }
}
