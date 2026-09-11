import { onMounted, onBeforeUnmount, ref } from 'vue'
import { responsiveTokens } from '../utils/responsive.js'

export function useMobileViewport() {
  const isMobile = ref(false)
  let media
  function update() { isMobile.value = media.matches }
  onMounted(() => {
    media = window.matchMedia(`(max-width: ${responsiveTokens.mobileMax}px)`)
    update()
    media.addEventListener('change', update)
  })
  onBeforeUnmount(() => media?.removeEventListener('change', update))
  return isMobile
}
