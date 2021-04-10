const getIsPropertyInObjTruthy = (obj: unknown, property: string) =>
	typeof obj === 'object' && property in obj && !!obj[property]

const safeCall = (obj: unknown, property: string) => {
	if (
		getIsPropertyInObjTruthy(obj, property) &&
		typeof (obj as { [property: string]: unknown })[property] ===
			'function'
	) {
		;(obj as {
			[property: string]: () => void
		})[property]()
	}
}

export const exitFullscreen = (): void => {
	if (document.exitFullscreen) {
		document.exitFullscreen()
		return
	}

	safeCall(document, 'webkitExitFullscreen')
}

export const enterFullscreen = (): void => {
	if (document.body.requestFullscreen) {
		document.body.requestFullscreen()
		return
	}

	safeCall(document.body, 'webkitRequestFullscreen')
}

export default (): void => {
	const isFullScreen = !!(
		document.fullscreenElement ||
		getIsPropertyInObjTruthy(document, 'webkitFullscreenElement')
	)

	if (isFullScreen) {
		exitFullscreen()
		return
	}

	enterFullscreen()
}
