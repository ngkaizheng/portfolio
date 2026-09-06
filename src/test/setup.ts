import '@testing-library/jest-dom/vitest'

class MockIntersectionObserver implements IntersectionObserver {
	readonly root: Element | Document | null = null
	readonly rootMargin: string = '0px'
	readonly scrollMargin: string = '0px'
	readonly thresholds: ReadonlyArray<number> = [0]

	constructor(
		_callback: IntersectionObserverCallback,
		_options?: IntersectionObserverInit,
	) {
		// No-op for test environment.
	}

	disconnect(): void {
		// No-op for test environment.
	}

	observe(): void {
		// No-op for test environment.
	}

	takeRecords(): IntersectionObserverEntry[] {
		return []
	}

	unobserve(): void {
		// No-op for test environment.
	}
}

globalThis.IntersectionObserver = MockIntersectionObserver
