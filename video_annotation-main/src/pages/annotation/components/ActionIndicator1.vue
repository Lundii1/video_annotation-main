<template>
  <div
    class="action-indicator"
    :style="{ 'background-color': q.dark.isActive ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)' }"
  >
    <button
      class="action-object-btn"
      :style="buttonStyle"
      @click="toggleSelectedPerson"
      title="Filter to P1 only"
    >P1</button>
    <div
      v-for="item in actionIndicatorList"
      :key="item.key"
      :title="`Start: ${item.action.start}\nEnd: ${item.action.end}\nDuration: ${
        item.action.end - item.action.start
      }\nPerson: P${item.action.object + 1}`"
      class="action"
      :style="{
        left: item.leftPercent,
        width: item.widthPercent,
        zIndex: item.zIndex,
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

const PERSON_ID = 1
const ACTION_OBJECT_ID = 0

const isSelected = computed(() => annotationStore.selectedPerson === PERSON_ID)
const showActions = computed(() => annotationStore.selectedPerson === null || isSelected.value)
const buttonStyle = computed(() => ({
  color: '#FFFFFF',
  backgroundColor: isSelected.value ? '#4CAF50' : '#FF0000',
  borderColor: isSelected.value ? '#4CAF50' : '#FF0000'
}))

const actionIndicatorList = computed(() => {
  if (!annotationStore.video.frames || !showActions.value) {
    return []
  }
  const markerWidthUnit = 100 / (annotationStore.video.frames - 1)

  return annotationStore.skillAnnotationList
    .filter((action) => action.object === ACTION_OBJECT_ID)
    .slice()
    .sort((a, b) => (a.start !== b.start ? a.start - b.start : a.end - b.end))
    .map((action, index) => {
      const leftFrame = action.start
      const rightFrame = action.end
      const leftPercent = `${(leftFrame - 0.5) * markerWidthUnit}%`
      const widthPercent = `${Math.max((rightFrame - leftFrame + 1) * markerWidthUnit, markerWidthUnit)}%`
      return {
        action,
        leftPercent,
        widthPercent,
        zIndex: index + 1,
        key: `${leftFrame}-${rightFrame}-${action.action}-${action.object}-${index}`
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
  top: 0;
  height: 100%;
  background-blend-mode: multiply;
  cursor: pointer;
}

.action-indicator .action:hover {
  transform: scaleY(1.5);
  transition: transform 0.2s ease-in-out;
}
</style>
