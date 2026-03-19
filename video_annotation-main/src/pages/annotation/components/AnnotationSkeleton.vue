<template>
  <div class="absolute column items-center justify-center" style="inset: 0" @keyup.enter="handleOpen" >
    <img v-if="$q.dark.isActive" style="width: 150px; padding-bottom: 50px" src="img/logo-dark.svg" alt="Logo" />
    <img v-else style="width: 150px; padding-bottom: 50px" src="img/logo.svg" alt="Logo" />
    <div class="text-h4">Video Annotation</div>
    <VersionBadge />
    <q-btn-group style="padding-top: 30px" flat>
      <q-btn outline icon="movie" color="primary" label="open video" @click="handleOpen" />
    </q-btn-group>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'
import VersionBadge from '~/components/VersionBadge.vue'
import { useVideo } from '~/hooks/video.js'

const { handleOpen } = useVideo()

onMounted(() => {
  // Adding event listener to window for global hotkey
  window.addEventListener('keyup', globalHotkey)
})

onUnmounted(() => {
  // Removing the event listener when the component is destroyed
  window.removeEventListener('keyup', globalHotkey)
})

function globalHotkey(event) {
  // Checking if the pressed key is Enter
  if (event.key === 'Enter') {
    handleOpen()
  }
}
</script>
