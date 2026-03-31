<template>
  <div
    class="action-indicator"
    :style="{ 'background-color': q.dark.isActive ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)' }"
  >
    <button
      class="action-object-btn"
      :style="buttonStyle"
      @click="toggleSelectedPerson"
      title="Filter to P2 only"
    >P2</button>
    <div
      v-for="item in actionIndicatorList"
      :key="`${item.action.start}-${item.action.end}-${item.action.action}-${item.action.object}`"
      :title="`Start: ${item.action.start}\nEnd: ${item.action.end}\nDuration: ${
        item.action.end - item.action.start
      }\nPerson: P${item.action.object + 1}`"
      class="action"
      :style="{
        left: item.leftPercent,
        right: item.rightPercent,
        'background-color': item.action.color
      }"
      @click="handleClick(item.action)"
    ></div>
  </div>
</template>

<script setup>
import { useQuasar } from 'quasar'
import { computed } from 'vue'

import { useAnnotationStore } from '~/store/annotation.js'
import { useConfigurationStore } from '~/store/configuration.js'

const annotationStore = useAnnotationStore()
const configurationStore = useConfigurationStore()
const q = useQuasar()

const PERSON_ID = 2
const ACTION_OBJECT_ID = 1

const isSelected = computed(() => annotationStore.selectedPerson === PERSON_ID)
const showActions = computed(() => annotationStore.selectedPerson === null || isSelected.value)
const buttonStyle = computed(() => ({
  color: '#FFFFFF',
  backgroundColor: isSelected.value ? '#4CAF50' : '#0066FF',
  borderColor: isSelected.value ? '#4CAF50' : '#0066FF'
}))

const actionIndicatorList = computed(() => {
  if (!annotationStore.video.frames || !showActions.value) {
    return []
  }
  return annotationStore.skillAnnotationList
    .filter((action) => action.object === ACTION_OBJECT_ID)
    .map((action) => {
      const markerWidthUnit = 100 / (annotationStore.video.frames - 1)
      const leftFrame = action.start
      const rightFrame = action.end
      const leftPercent = `${(leftFrame - 0.5) * markerWidthUnit}%`
      const rightPercent = `${(annotationStore.video.frames - rightFrame - 1.5) * markerWidthUnit}%`
      return {
        action,
        leftPercent,
        rightPercent
      }
    })
})

const toggleSelectedPerson = () => {
  annotationStore.selectedPerson = isSelected.value ? null : PERSON_ID
}

const handleClick = (action) => {
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

.action-indicator .action-object-btn {
  position: absolute;
  left: -28px;
  top: -8px;
  margin: 0;
  padding: 1px 3px;
  font-size: 11px;
  font-weight: bold;
  font-family: Arial, sans-serif;
  cursor: pointer;
  border: 2px solid;
  border-radius: 3px;
  line-height: 1;
  z-index: 1;
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
