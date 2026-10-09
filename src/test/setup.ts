import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// Vitest runs without globals, so Testing Library cannot register this itself.
afterEach(cleanup)

class MockIntersectionObserver implements IntersectionObserver {
	readonly root: Element | Document | null = null
	readonly rootMargin: string = '0px'
	readonly scrollMargin: string = '0px'
	readonly thresholds: ReadonlyArray<number> = [0]

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

// jsdom has no matchMedia; GSAP's ScrollTrigger registers media listeners on load.
if (typeof window.matchMedia !== 'function') {
	window.matchMedia = (query: string): MediaQueryList => ({
		matches: false,
		media: query,
		onchange: null,
		addListener: () => {},
		removeListener: () => {},
		addEventListener: () => {},
		removeEventListener: () => {},
		dispatchEvent: () => false,
	})
}
