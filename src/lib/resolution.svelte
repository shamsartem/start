<script lang="ts">
  import { onMount } from 'svelte'
  import { windowInnerWidth } from '../stores/resolution'

  onMount(() => {
    const handleWindowResize = () =>
      windowInnerWidth.update(() => window.innerWidth)
    handleWindowResize()
    window.addEventListener('resize', handleWindowResize)
  })
</script>
