import { derived, writable } from 'svelte/store'

export const windowInnerWidth = writable(0)

export const isMobile = derived(
	windowInnerWidth,
	($windowInnerWidth) => $windowInnerWidth > 576,
)

export const isTablet = derived(
	windowInnerWidth,
	($windowInnerWidth) => $windowInnerWidth > 768,
)

export const isDesktop = derived(
	windowInnerWidth,
	($windowInnerWidth) => $windowInnerWidth > 992,
)

export const isLarge = derived(
	windowInnerWidth,
	($windowInnerWidth) => $windowInnerWidth > 1200,
)
