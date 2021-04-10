<canvas bind:this={canvas} />

<script lang="ts">
	import toggleFullscreen from '../helpers/toggleFullscreen'

	import { onMount } from 'svelte'
	import {
		ACESFilmicToneMapping,
		PerspectiveCamera,
		PMREMGenerator,
		Scene,
		sRGBEncoding,
		UnsignedByteType,
		WebGLRenderer,
	} from 'three'
	import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
	import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
	import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'
	let canvas: HTMLCanvasElement

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
		renderer.toneMappingExposure = 5
		renderer.outputEncoding = sRGBEncoding

		const pmremGenerator = new PMREMGenerator(renderer)
		pmremGenerator.compileEquirectangularShader()

		new RGBELoader()
			.setDataType(UnsignedByteType)
			.load('/greenwich_park_03_1k.hdr', (texture) => {
				const envMap = pmremGenerator.fromEquirectangular(texture)
					.texture

				scene.environment = envMap

				texture.dispose()
				pmremGenerator.dispose()

				new GLTFLoader().load('/scene.glb', (gltf) => {
					scene.add(gltf.scene)
				})
			})

		const controls = new OrbitControls(camera, canvas)

		controls.enableDamping = true
		controls.minDistance = 7
		controls.maxDistance = 12
		controls.target.set(0, 0, 1)
		controls.maxPolarAngle = 1.4

		controls.update()

		const handleWindowResize = () => {
			camera.aspect = window.innerWidth / window.innerHeight
			camera.updateProjectionMatrix()

			renderer.setSize(window.innerWidth, window.innerHeight)
		}

		window.addEventListener('resize', handleWindowResize)
		window.addEventListener('dblclick', toggleFullscreen)

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
			window.removeEventListener('dblclick', toggleFullscreen)
			window.cancelAnimationFrame(requestAnimationFrameId)
		}
	})
</script>

<style lang="scss">
	canvas {
		position: fixed;
		top: 0;
		left: 0;
		outline: none;
	}
</style>
