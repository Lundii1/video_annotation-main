<template>
  <div class="row justify-between items-center q-pt-lg" :class="{ 'q-pb-lg q-px-lg': $q.screen.lt.md }">
    <div>
      <q-btn-group flat>
        <q-btn outline :icon="isPaused ? 'play_arrow' : 'pause'" @click="handlePlayPause"
          :disable="!annotationStore.video.frames">
          <q-tooltip>{{ isPaused ? 'play (space)' : 'pause (space)' }}</q-tooltip>
        </q-btn>
        <q-btn outline icon="stop" :disabled="!showVideoPlayer" @click="handleStop">
          <q-tooltip v-if="showVideoPlayer">stop</q-tooltip>
        </q-btn>
        <q-btn outline icon="file_download" @click="handleSave">
          <q-tooltip v-if="annotationStore.hasVideo">save (command+s)</q-tooltip>
        </q-btn>
      </q-btn-group>
    </div>
    <div class="col-grow" :class="[{ 'col-12': $q.screen.lt.md, 'q-px-lg': !$q.screen.lt.md }]"
      :style="{ order: !$q.screen.lt.md ? 0 : -1 }">
      <q-range class="custom-range"
        :class="{ 'hide-right-marker': currentFocus === 'left', 'hide-left-marker': currentFocus === 'right' }"
        label-always drag-range snap track-size="8px" :min="0" :max="annotationStore.video.frames - 1" :step="1"
        left-label-text-color="blue-grey-1" right-label-text-color="blue-grey-1" left-label-color="primary"
        right-label-color="primary" :left-label-value="
          'L: ' + currentFrameRange.min + ' | ' + utils.toFixed2(utils.index2time(currentFrameRange.min)) + ' s'
        " :right-label-value="
          'R: ' + currentFrameRange.max + ' | ' + utils.toFixed2(utils.index2time(currentFrameRange.max)) + ' s'
        " :model-value="currentFrameRange" @update:model-value="handleInput"
        :disable="!annotationStore.video.frames" style="margin-top: -50px" />
      <ActionIndicator v-if="preferenceStore.actions" style="margin-top: -0px" />
      <ActionIndicator1 v-if="preferenceStore.actions" style="margin-top: -20px" />

    </div>

    <q-select v-if="!$q.screen.lt.md" class="q-my-md" label=">>" outlined dense options-dense emit-value map-options
      v-model="annotationStore.videoPlaybackRate" :options="videoPlaybackRateOptions" />
  </div>
  <q-select v-if="$q.screen.lt.md" class="q-my-md" style="width: 162px" label="Speed" outlined dense options-dense
    emit-value map-options :disable="!isStopped" v-model="annotationStore.videoPlaybackRate"
    :options="videoPlaybackRateOptions" />
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'

import { frameIndicator } from '~/hooks/frameIndicator.js'
import utils from '~/libs/utils.js'
import ActionIndicator from '~/pages/annotation/components/ActionIndicator.vue'
import ActionIndicator1 from '~/pages/annotation/components/ActionIndicator1.vue'
import KeyframeTable from '~/pages/annotation/components/KeyframeTable.vue'
import { useAnnotationStore } from '~/store/annotation.js'
import { usePreferenceStore } from '~/store/preference.js'
import { useAnnotation } from '~/hooks/annotation.js'

const annotationStore = useAnnotationStore()
const preferenceStore = usePreferenceStore()
const { handleSave} = useAnnotation()

// left buttons
const isPaused = ref(true)
const isStopped = ref(true)
const showVideoPlayer = ref(false)
const showEdit = ref(false)
let videoPlayTimeout
let videoPlayInterval
let lastLeftCurrentFrame

const play = () => {
  const videoPlayer = document.getElementById('video-player')
  isPaused.value = false
  isStopped.value = false
  videoPlayer.playbackRate = annotationStore.videoPlaybackRate
  videoPlayer.play()
  // const duration =
  //   ((utils.index2time(annotationStore.rightCurrentFrame) - videoPlayer.currentTime) * 1000) / videoPlayer.playbackRate
  // duration is the entire video
  const duration = (annotationStore.video.frames - annotationStore.rightCurrentFrame) * 1000
  videoPlayTimeout = setTimeout(() => {
    handleStop()
  }, duration)
  videoPlayInterval = setInterval(
    () => {
      // moveLeftFrame(1)
      moveRightFrame(1)
    },
    1000 / annotationStore.video.fps / videoPlayer.playbackRate
  )
}
const pause = () => {
  clearTimeout(videoPlayTimeout)
  clearInterval(videoPlayInterval)
  isPaused.value = true
  const videoPlayer = document.getElementById('video-player')
  videoPlayer.pause()
}
const stop = () => {
  const videoPlayer = document.getElementById('video-player')
  videoPlayer.style.display = 'none'
  videoPlayer.pause()
  videoPlayer.currentTime = utils.index2time(lastLeftCurrentFrame)
  showVideoPlayer.value = false
  isPaused.value = true
  isStopped.value = true
  clearTimeout(videoPlayTimeout)
  clearInterval(videoPlayInterval)
}
const handlePlayPause = () => {
  const videoPlayer = document.getElementById('video-player')
  if (!showVideoPlayer.value) {
    showVideoPlayer.value = true
    lastLeftCurrentFrame = annotationStore.leftCurrentFrame
    videoPlayer.style.display = 'block'
    videoPlayer.currentTime = utils.index2time(annotationStore.leftCurrentFrame)
    play()
  } else {
    if (isPaused.value) {
      play()
    } else {
      pause()
    }
  }
}
const handleStop = () => {
  stop()
  // annotationStore.leftCurrentFrame = lastLeftCurrentFrame
  annotationStore.rightCurrentFrame = annotationStore.leftCurrentFrame + 1
}

// options
const videoPlaybackRateOptions = [
  {
    label: '0.5x',
    value: 0.5
  },
  {
    label: '0.75x',
    value: 0.75
  },
  {
    label: '1.0x',
    value: 1.0
  },
  {
    label: '1.25x',
    value: 1.25
  },
  {
    label: '1.5x',
    value: 1.5
  },
  {
    label: '2.0x',
    value: 2.0
  }
]


// Helper function to update video player current time
const updateVideoPlayerCurrentTime = (frame) => {
  const videoPlayer = document.getElementById('video-player');
  if (videoPlayer) {
    videoPlayer.currentTime = utils.index2time(frame);
  }
};

// key bindings
const moveLeftFrame = (delta) => {
  const newFrame = annotationStore.leftCurrentFrame + delta
  if (newFrame >= 0 && newFrame <= annotationStore.video.frames) {
    if (newFrame > annotationStore.rightCurrentFrame) {
      annotationStore.leftCurrentFrame = annotationStore.rightCurrentFrame
      annotationStore.rightCurrentFrame = newFrame
      currentFocus.value = 'right'
    } else {
      annotationStore.leftCurrentFrame = newFrame
    }
    updateVideoPlayerCurrentTime(annotationStore.leftCurrentFrame); // Update video player
  }
}
const moveRightFrame = (delta) => {
  const newFrame = annotationStore.rightCurrentFrame + delta
  if (newFrame >= 0 && newFrame <= annotationStore.video.frames) {
    if (newFrame < annotationStore.leftCurrentFrame) {
      annotationStore.rightCurrentFrame = annotationStore.leftCurrentFrame
      annotationStore.leftCurrentFrame = newFrame
      currentFocus.value = 'left'
    } else {
      annotationStore.rightCurrentFrame = newFrame
    }
    updateVideoPlayerCurrentTime(annotationStore.rightCurrentFrame); // Update video player
  }
}
const moveRange = (interval) => {
  if (interval < 0) {
    if (Math.min(annotationStore.leftCurrentFrame, annotationStore.rightCurrentFrame) + interval >= 0) {
      annotationStore.leftCurrentFrame += interval
      annotationStore.rightCurrentFrame += interval
    }
  } else {
    if (
      Math.max(annotationStore.leftCurrentFrame, annotationStore.rightCurrentFrame) + interval <=
      annotationStore.video.frames
    ) {
      annotationStore.leftCurrentFrame += interval
      annotationStore.rightCurrentFrame += interval
    }
    updateVideoPlayerCurrentTime(annotationStore.leftCurrentFrame); // Assuming left frame as the reference for updating time
  }
}
const handleKeyup = (event) => {
  event.stopPropagation()
  if (event.target.nodeName.toLowerCase() === 'input' || event.target.tabIndex === 0) {
    return false
  }
}
const currentFocus = ref('right') // 'left', 'right', 'range'
const handleInput = (value) => {
  if (currentFrameRange.value.min !== value.min) {
    currentFocus.value = 'left'
  } else {
    currentFocus.value = 'right'
  }
  currentFrameRange.value = value
}
const handleKeydown = (event) => {
  event.stopPropagation()
  if (event.code === 'ArrowLeft') {
    event.preventDefault()
    const delta = -1
    if (currentFocus.value === 'range') {
      moveRange(delta)
    } else if (currentFocus.value === 'left') {
      moveLeftFrame(delta)
    } else if (currentFocus.value === 'right') {
      moveRightFrame(delta)
    }
  } else if (event.code === 'ArrowRight') {
    event.preventDefault()
    const delta = 1
    if (currentFocus.value === 'range') {
      moveRange(delta)
    } else if (currentFocus.value === 'left') {
      moveLeftFrame(delta)
    } else if (currentFocus.value === 'right') {
      moveRightFrame(delta)
    }
  } else if (event.code === 'ArrowUp') {
    event.preventDefault()
    if (currentFocus.value === 'left') return
    currentFocus.value = {
      range: 'left',
      right: 'range'
    }[currentFocus.value]
  } else if (event.code === 'ArrowDown') {
    event.preventDefault()
    if (currentFocus.value === 'right') return
    currentFocus.value = {
      left: 'range',
      range: 'right'
    }[currentFocus.value]
  }
  else if (event.code === 'Space' && event.target.nodeName.toLowerCase() !== 'input' && event.target.tabIndex !== 0) {
    event.preventDefault();
    handlePlayPause();
  }
  // use command + s for save
  else if (event.code === 'KeyS' && (event.ctrlKey || event.metaKey)) {
    event.preventDefault();
    handleSave();
  }
  // use enter to pause the video
  else if (event.code === 'Enter') {
    event.preventDefault();
    handlePlayPause()
  }

}
onMounted(() => {
  window.addEventListener('keyup', handleKeyup, true)
  window.addEventListener('keydown', handleKeydown, true)
})
onUnmounted(() => {
  window.removeEventListener('keyup', handleKeyup, true)
  window.removeEventListener('keydown', handleKeydown, true)
})

// middle range
const currentFrameRange = computed({
  get: () => {
    return {
      min: annotationStore.leftCurrentFrame,
      max: annotationStore.rightCurrentFrame
    }
  },
  set: (value) => {
    if (showVideoPlayer.value) {
      stop()
    }
    annotationStore.leftCurrentFrame = value.min
    annotationStore.rightCurrentFrame = value.max
  }
})
const { rangeStyle } = frameIndicator()
</script>

<style>
.custom-range .q-slider__track-container--h {
  height: var(--marker-height);
  background-image: var(--marker-bg-image);
  background-position: var(--marker-bg-position);
  background-size: var(--marker-bg-size);
  background-repeat: no-repeat;
  background-blend-mode: multiply;
}

.hide-left-marker .q-slider__thumb:nth-child(3) .q-slider__pin {
  display: none;
}

.hide-right-marker .q-slider__thumb:last-child .q-slider__pin {
  display: none;
}

.q-slider__thumb:nth-child(3) .q-slider__text-container {
  transform: translateX(-41%) !important;
}

.q-slider__thumb:last-child .q-slider__text-container {
  transform: translateX(41%) !important;
}
</style>
