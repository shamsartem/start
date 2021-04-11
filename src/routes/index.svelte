<canvas bind:this={canvas} on:dblclick={handleDoubleClick} />
{#if isLoaded}
	<button on:click={toggle3DStyle}>
		{is3DStyleVisible ? 'Hide' : 'Show'} 3D Style
	</button>
{/if}
{#if !isFullScreen && isLoaded && $isDesktop}
	<div>Double click for fullscreen</div>
{/if}
{#if !isLoaded}
	<div>Loading...</div>
{/if}

<script lang="ts">
	import { onMount } from 'svelte'
	import {
		ACESFilmicToneMapping,
		LoadingManager,
		PerspectiveCamera,
		PMREMGenerator,
		Scene,
		sRGBEncoding,
		WebGLRenderer,
	} from 'three'
	import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
	import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment'
	import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'
	import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

	import toggleFullscreen from '../helpers/toggleFullscreen'
	import { isDesktop } from '../stores/resolution'

	let canvas: HTMLCanvasElement

	let isFullScreen = false
	let isLoaded = false
	let is3DStyleVisible = false

	let toggle3DStyle = () => {}

	$: handleDoubleClick = () => {
		if (!$isDesktop) {
			return
		}
		toggleFullscreen()
		isFullScreen = !isFullScreen
	}

	onMount(() => {
		const camera = new PerspectiveCamera(
			50,
			window.innerWidth / window.innerHeight,
			0.25,
			20,
		)
		camera.position.set(12, 12, 12)

		const scene = new Scene()

		const renderer = new WebGLRenderer({ canvas, antialias: true })
		renderer.setPixelRatio(window.devicePixelRatio)
		renderer.setSize(window.innerWidth, window.innerHeight)
		renderer.toneMapping = ACESFilmicToneMapping
		renderer.toneMappingExposure = 0.6
		renderer.outputEncoding = sRGBEncoding

		const handleWindowResize = () => {
			camera.aspect = window.innerWidth / window.innerHeight
			camera.updateProjectionMatrix()

			renderer.setSize(window.innerWidth, window.innerHeight)
		}

		handleWindowResize()
		window.addEventListener('resize', handleWindowResize)

		const environment = new RoomEnvironment()
		const pmremGenerator = new PMREMGenerator(renderer)
		scene.environment = pmremGenerator.fromScene(environment).texture

		const loadigManager = new LoadingManager()
		loadigManager.onLoad = () => {
			isLoaded = true
		}

		const gltfLoader = new GLTFLoader(loadigManager)

		gltfLoader.setDRACOLoader(new DRACOLoader())

		gltfLoader.load('/tank.glb', (gltf) => {
			const children = [...gltf.scene.children]
			console.log(children)
			const styleIndex = children.findIndex(
				({ name }) => name === '3D_Style',
			)
			const style3d = children.splice(styleIndex, 1)[0]

			toggle3DStyle = () => {
				is3DStyleVisible = !is3DStyleVisible
				if (is3DStyleVisible) {
					scene.add(style3d)
				} else {
					scene.remove(style3d)
				}
			}

			children.forEach((child) => {
				scene.add(child)
			})
		})

		const controls = new OrbitControls(camera, canvas)

		controls.enableDamping = true
		controls.minDistance = 7
		controls.maxDistance = 12
		controls.target.set(0, 0, 1)
		controls.maxPolarAngle = 1.4

		controls.update()

		let requestAnimationFrameId: number

		const tick = () => {
			controls.update()

			renderer.render(scene, camera)
			requestAnimationFrameId = window.requestAnimationFrame(tick)
		}

		tick()

		return () => {
			renderer.dispose()
			window.removeEventListener('resize', handleWindowResize)
			window.cancelAnimationFrame(requestAnimationFrameId)
		}
	})
</script>

<style lang="scss">
	:global(html) {
		background-color: #000;
		font-family: sans-serif;
		color: #fff;
	}

	canvas {
		position: fixed;
		top: 0;
		left: 0;
		outline: none;
	}

	div {
		position: fixed;
		bottom: 10px;
		left: 50%;
		transform: translateX(-50%);
	}

	button {
		position: fixed;
		bottom: 50px;
		border: 1px solid #fff;
		border-radius: 999px;
		padding: 10px;
		background-color: transparent;
		color: inherit;
		font-size: inherit;
		left: 50%;
		transform: translateX(-50%);
		outline: none;

		&:focus {
			border-width: 2px;
		}
	}
</style>
