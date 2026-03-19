<template>
  <div
    class="action-indicator"
    :style="{ 'background-color': q.dark.isActive ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)' }"
  >
    <p1 class="action-object">p{{ actionObject }}</p1>
    <div
      :title="`Start: ${action.start}\nEnd: ${action.end}\nDuration: ${
        action.end - action.start
      }\nPerson: ${action.object}`"
      class="action"
      v-for="(action, index) in actionIndicatorList"
      :style="{
        left: action.leftPercent,
        right: action.rightPercent,
        'background-color': action.color
      }"
      @click="handleClick(index)"
    ></div>
  </div>
</template>

<script setup>
import { useQuasar } from 'quasar'
import { computed } from 'vue'

import utils from '~/libs/utils.js'
import { useAnnotationStore } from '~/store/annotation.js'
import { useConfigurationStore } from '~/store/configuration.js'

const annotationStore = useAnnotationStore()
const configurationStore = useConfigurationStore()
const q = useQuasar()

const actionObject = 0; // Set this to the desired action object number

const actionIndicatorList = computed(() => {
  if (!annotationStore.video.frames) {
    return []
  }
  return annotationStore.skillAnnotationList
    .filter((action) => action.object === actionObject) // Filter actions where action.object matches
    .map((action) => {
      const markerWidthUnit = 100 / (annotationStore.video.frames - 1)
      const leftFrame = action.start
      const rightFrame = action.end
      const leftPercent = (leftFrame - 0.5) * markerWidthUnit + '%'
      const rightPercent = (annotationStore.video.frames - rightFrame - 1.5) * markerWidthUnit + '%'
      return {
        ...action,
        leftPercent,
        rightPercent
      }
    })
})

const handleClick = (index) => {
  const action = annotationStore.skillAnnotationList[index]
  // annotationStore.leftCurrentFrame = utils.time2index(action.start)
  // annotationStore.rightCurrentFrame = utils.time2index(action.end)
  annotationStore.leftCurrentFrame = action.start
  annotationStore.rightCurrentFrame = action.end
  if (configurationStore.actionLabelData.find((label) => label.id === action.action).thumbnail) {
    annotationStore.currentThumbnailAction = annotationStore.currentThumbnailAction === action ? null : action
  } else {
    annotationStore.currentThumbnailAction = null
  }
}
</script>

<style>
.action-indicator {
  position: relative;
  height: 8px;
}

.action-indicator .action-object {
  position: absolute;
  left: -20px; /* Move the number further to the left */
  top: -5px; /* Adjust position if needed */
  margin: 0;
  padding: 0;
  font-size: 12px; /* Increase the font size */
  font-weight: bold; /* Make the font bold */
  font-family: Arial, sans-serif; /* Apply a better font */
  display: inline-block;
  color: red; /* Ensure the text color is readable */
}

.action-indicator .action {
  position: absolute;
  height: 100%;
  background-blend-mode: multiply;
  cursor: pointer;
}

.action-indicator .action:hover {
  transform: scaleY(1.5);
  transition: transform 0.2s ease-in-out;
}
</style>