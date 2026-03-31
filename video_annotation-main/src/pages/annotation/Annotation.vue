<template>
  <AnnotationSkeleton v-if="!annotationStore.hasVideo" />
  <q-card
    flat
    v-else
  >
    <KeyframePanel />
    <div class="row items-center justify-between q-px-md q-py-sm">
      <div class="text-subtitle1 text-weight-medium">
        {{ videoRootName }}
      </div>
      <q-btn
        outline
        icon="file_upload"
        label="Load Annotation"
        size="sm"
        @click="handleLoad"
      />
    </div>
    <div class="row justify-center">
      <div class="col-12 col-md">
        <CanvasPanel position="left" />
      </div>
      <ControlPanel v-show="!mainStore.zoom" />
      <div
        class="col-12 col-md"
        v-show="!mainStore.zoom"
      >
        <CanvasPanel position="right" />
      </div>
    </div>
    <ActionTable v-if="preferenceStore.actions" />
  </q-card>
</template>

<script setup>
import ActionTable from '~/pages/annotation/ActionTable.vue'
import CanvasPanel from '~/pages/annotation/CanvasPanel.vue'
import ControlPanel from '~/pages/annotation/ControlPanel.vue'
import { computed } from 'vue'

import { useAnnotation } from '~/hooks/annotation.js'
import { useAnnotationStore } from '~/store/annotation.js'
import { useConfigurationStore } from '~/store/configuration.js'
import { useMainStore } from '~/store/index.js'
import { usePreferenceStore } from '~/store/preference.js'

import KeyframePanel from './KeyframePanel.vue'
import AnnotationSkeleton from './components/AnnotationSkeleton.vue'

const annotationStore = useAnnotationStore()
const configurationStore = useConfigurationStore()
const preferenceStore = usePreferenceStore()
const mainStore = useMainStore()
const { handleLoad } = useAnnotation()

const videoRootName = computed(() => {
  const name = annotationStore.video.name || ''
  return name.replace(/\.[^/.]+$/, '')
})
</script>
