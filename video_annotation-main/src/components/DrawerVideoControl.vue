<template>
  <div class="q-pt-sm">
    <div class="q-px-md q-pb-sm text-h6">Video</div>
    <div v-if="annotationStore.hasVideo" class="row q-px-md q-pb-sm">
      <div class="col">Duration</div>
      <div class="col">
        <span v-if="video.duration && video.fps">{{ utils.toFixed2(video.duration) }}s @ {{ utils.toFixed2(video.fps)
          }}fps</span>
        <span v-else>-</span>
      </div>
    </div>
    <div v-if="annotationStore.hasVideo" class="row q-px-md q-pb-sm">
      <div class="col">Size</div>
      <div class="col">
        <span v-if="video.width && video.height && video.frames">{{ parseInt(video.width) }} &times; {{
          parseInt(video.height) }}px &times; {{ parseInt(video.frames) }}
        </span>
        <span v-else>-</span>
      </div>
    </div>
    <div v-if="annotationStore.hasVideo && Object.keys(annotationStore.bboxOverlayData).length" class="row q-px-md q-pb-sm items-center">
      <div class="col">Bounding Boxes</div>
      <div class="col">
        <q-toggle v-model="annotationStore.bboxOverlayEnabled" dense />
      </div>
    </div>
    <div class="q-px-md q-pb-md">
      <q-btn-group spread flat>
        <q-btn outline icon="movie" @click="handleOpen" label="open"></q-btn>
        <q-btn outline icon="close" @click="handleClose" v-if="annotationStore.hasVideo" label="close"></q-btn>
      </q-btn-group>
    </div>
  </div>
</template>

<script setup>
import { storeToRefs } from 'pinia'

import { useVideo } from '~/hooks/video.js'
import utils from '~/libs/utils.js'
import { useAnnotationStore } from '~/store/annotation.js'

const annotationStore = useAnnotationStore()
const { video } = storeToRefs(annotationStore)
const { handleOpen, handleClose } = useVideo()
</script>
