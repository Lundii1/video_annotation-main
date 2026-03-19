import deepClone from 'lodash.clonedeep'
import { defineStore } from 'pinia'
import { reactive, toRefs, watch } from 'vue'

import { validateActionLabelData, validateObjectLabelData, validateSkeletonTypeData } from './validation.js'

const OBJECT_LABEL_LS_KEY = 'objectLabelData'
const MOVE_LABEL_LS_KEY = 'moveLabelData'
const ACTION_LABEL_LS_KEY = 'actionLabelData'
const SKELETON_LABEL_LS_KEY = 'skeletonTypeData'

const DEFAULT_CONFIGURATION = {
  objectLabelData: [
    {
      id: 0,
      name: 'person0',
      color: '#00FF00'
    },
    {
      id: 1,
      name: 'person1',
      color: '#FF0000'
    },

  ],
  moveLabelData: [
    {
      id: 0,
      name: 'Move',
      color: '#00FF00'
    },
    {
      id: 1,
      name: 'Punch landed on torso (body shot)',
      color: '#FF0000'
    },
    {
      id: 2,
      name: 'Punch blocked',
      color: '#FF0000'
    },
    {
      id: 3,
      name: 'Punch avoided - Missed due to defensive action',
      color: '#FF0000'
    },
    {
      id: 4,
      name: 'Air punch (missed, don’t touching the opponent)',
      color: '#FF0000'
    },
    {
      id: 5,
      name: 'Punch landed on head',
      color: '#00FF00'
    },

  ],
  postureLabelData: [
    {
      id: 0,
      name: 'High guard',
      color: '#00FF00'
    },
    {
      id: 1,
      name: 'Low hands',
      color: '#FF0000'
    },
    {
      id: 2,
      name: 'Southpaw stance',
      color: '#FF0000'
    },
    {
      id: 3,
      name: 'Orthodox stance',
      color: '#FF0000'
    },
    {
      id: 4,
      name: 'Squared',
      color: '#FF0000'
    },
    {
      id: 5,
      name: 'Balance',
      color: '#00FF00'
    },

  ],
actionLabelData: [
  {
    id: 1,
    name: 'Jab',
    color: '#007BFF',  // Medium intensity
    objects: [0],
    outcomes: [0],
    postures: [0]
  },
  {
    id: 2,
    name: 'Cross',
    color: '#FF4500',  // High intensity
    objects: [0],
    outcomes: [0],
    postures: [0]
  },
  {
    id: 3,
    name: 'Lead Hook',
    color: '#32CD32',  // Medium intensity
    objects: [0],
    outcomes: [0],
    postures: [0]
  },
  {
    id: 4,
    name: 'Rear Hook',
    color: '#FFD700',  // Medium intensity
    objects: [0],
    outcomes: [0],
    postures: [0]
  },
  {
    id: 5,
    name: 'Lead Uppercut',
    color: '#8A2BE2',  // High intensity
    objects: [0],
    outcomes: [0],
    postures: [0]
  },
  {
    id: 6,
    name: 'Rear Uppercut',
    color: '#DC143C',  // High intensity
    objects: [0],
    outcomes: [0],
    postures: [0]
  },
  {
    id: 7,
    name: 'Rear Overhand',
    color: '#00CED1',  // Medium intensity
    objects: [0],
    outcomes: [0],
    postures: [0]
  },
  {
    id: 8,
    name: 'Body Shot',
    color: '#FF6347',  // High intensity
    objects: [0],
    outcomes: [0],
    postures: [0]
  },
  {
    id: 9,
    name: 'Slip',
    color: '#2E8B57',  // Low intensity
    objects: [0],
    outcomes: [0],
    postures: [0]
  },
  {
    id: 10,
    name: 'Bob and Weave',
    color: '#4682B4',  // Low intensity
    objects: [0],
    outcomes: [0],
    postures: [0]
  },
  {
    id: 11,
    name: 'Pull',
    color: '#DA70D6',  // Low intensity
    objects: [0],
    outcomes: [0],
    postures: [0]
  },
  {
    id: 12,
    name: 'Duck',
    color: '#FF69B4',  // Low intensity
    objects: [0],
    outcomes: [0],
    postures: [0]
  },
  {
    id: 13,
    name: 'Parry',
    color: '#6A5ACD',  // Low intensity
    objects: [0],
    outcomes: [0],
    postures: [0]
  },
  {
    id: 14,
    name: 'Block',
    color: '#FF8C00',  // Medium intensity
    objects: [0],
    outcomes: [0],
    postures: [0]
  },
  {
    id: 15,
    name: 'Clinch',
    color: '#1E90FF',  // Medium intensity
    objects: [0],
    outcomes: [0],
    postures: [0]
  },
  {
    id: 16,
    name: 'Pivot',
    color: '#9ACD32',  // Low intensity
    objects: [0],
    outcomes: [0],
    postures: [0]
  },
  {
    id: 17,
    name: 'Angle off',
    color: '#9ACD32',  // Low intensity
    objects: [0],
    outcomes: [0],
    postures: [0]
  },
  {
    id: 18,
    name: 'Punch Feint',
    color: '#FFB6C1',  // Low intensity
    objects: [0],
    outcomes: [0],
    postures: [0]
  },
  {
    id: 19,
    name: 'Shoulder Feint',
    color: '#FFC0CB',  // Low intensity
    objects: [0],
    outcomes: [0],
    postures: [0]
  },
  {
    id: 20,
    name: 'Feet / step feint',
    color: '#FF1493',  // Low intensity
    objects: [0],
    outcomes: [0],
    postures: [0]
  }
  ],
  skeletonTypeData: [
    {
      id: 0,
      name: 'human',
      description: 'open pose',
      color: '#00FF00',
      pointList: [
        {
          id: 0,
          name: 'nose',
          x: 0,
          y: -30
        },
        {
          id: 1,
          name: 'left eye',
          x: -3,
          y: -35
        },
        {
          id: 2,
          name: 'right eye',
          x: 3,
          y: -35
        },
        {
          id: 3,
          name: 'left ear',
          x: -7,
          y: -32
        },
        {
          id: 4,
          name: 'right ear',
          x: 7,
          y: -32
        },
        {
          id: 5,
          name: 'left shoulder',
          x: -13,
          y: -20
        },
        {
          id: 6,
          name: 'right shoulder',
          x: 13,
          y: -20
        },
        {
          id: 7,
          name: 'left wrist',
          x: -15,
          y: 10
        },
        {
          id: 8,
          name: 'right wrist',
          x: 15,
          y: 10
        },
        {
          id: 9,
          name: 'left hip',
          x: -8,
          y: 10
        },
        {
          id: 10,
          name: 'right hip',
          x: 8,
          y: 10
        },
        {
          id: 11,
          name: 'left knee',
          x: -9,
          y: 30
        },
        {
          id: 12,
          name: 'right knee',
          x: 9,
          y: 30
        },
        {
          id: 13,
          name: 'left ankle',
          x: -10,
          y: 45
        },
        {
          id: 14,
          name: 'right ankle',
          x: 10,
          y: 45
        }
      ],
      edgeList: [
        {
          id: 0,
          from: 0,
          to: 1
        },
        {
          id: 1,
          from: 0,
          to: 2
        },
        {
          id: 2,
          from: 0,
          to: 3
        },
        {
          id: 3,
          from: 0,
          to: 4
        },
        {
          id: 4,
          from: 0,
          to: 9
        },
        {
          id: 5,
          from: 0,
          to: 10
        },
        {
          id: 6,
          from: 5,
          to: 7
        },
        {
          id: 7,
          from: 5,
          to: 6
        },
        {
          id: 8,
          from: 6,
          to: 8
        },
        {
          id: 9,
          from: 9,
          to: 11
        },
        {
          id: 10,
          from: 11,
          to: 13
        },
        {
          id: 11,
          from: 10,
          to: 12
        },
        {
          id: 12,
          from: 12,
          to: 14
        }
      ]
    }
  ],

  currentThumbnailActionLabelId: null
}

export const useConfigurationStore = defineStore('configuration', () => {
  const defaultConfiguration = deepClone(DEFAULT_CONFIGURATION)
  const state = reactive(DEFAULT_CONFIGURATION)
  const moveLabelData = JSON.parse(localStorage.getItem(MOVE_LABEL_LS_KEY))
  const objectLabelData = JSON.parse(localStorage.getItem(OBJECT_LABEL_LS_KEY))
  const actionLabelData = JSON.parse(localStorage.getItem(ACTION_LABEL_LS_KEY))
  const skeletonTypeData = JSON.parse(localStorage.getItem(SKELETON_LABEL_LS_KEY))
  if (moveLabelData) state.moveLabelData = moveLabelData
  if (objectLabelData) state.objectLabelData = objectLabelData
  if (actionLabelData) state.actionLabelData = actionLabelData
  if (skeletonTypeData) state.skeletonTypeData = skeletonTypeData

  watch(
    () => state.moveLabelData,
    (newValue) => {
      localStorage.setItem(MOVE_LABEL_LS_KEY, JSON.stringify(newValue))
    },
    { deep: true }
  )
  watch(
    () => state.objectLabelData,
    (newValue) => {
      localStorage.setItem(OBJECT_LABEL_LS_KEY, JSON.stringify(newValue))
    },
    { deep: true }
  )
  watch(
    () => state.actionLabelData,
    (newValue) => {
      localStorage.setItem(ACTION_LABEL_LS_KEY, JSON.stringify(newValue))
    },
    { deep: true }
  )
  watch(
    () => state.skeletonTypeData,
    (newValue) => {
      localStorage.setItem(SKELETON_LABEL_LS_KEY, JSON.stringify(newValue))
    },
    { deep: true }
  )

  const importMoveLabelData = (moveLabelData) => {
    validateObjectLabelData(moveLabelData)
    state.moveLabelData = moveLabelData
  }
  const importObjectLabelData = (objectLabelData) => {
    validateObjectLabelData(objectLabelData)
    state.objectLabelData = objectLabelData
  }
  const importActionLabelData = (actionLabelData) => {
    validateActionLabelData(actionLabelData)
    state.actionLabelData = actionLabelData
  }
  const importSkeletonTypeData = (skeletonTypeData) => {
    validateSkeletonTypeData(skeletonTypeData)
    state.skeletonTypeData = skeletonTypeData
  }
  return {
    ...toRefs(state),
    reset: () => {
      Object.keys(state).map((key) => (state[key] = defaultConfiguration[key]))
    },
    exportConfig: () => {
      return {
        // objectLabelData: state.objectLabelData,
        // actionLabelData: state.actionLabelData,
        // skeletonTypeData: state.skeletonTypeData
      }
    },
    importMoveLabelData,
    importObjectLabelData,
    importActionLabelData,
    importSkeletonTypeData,
    importConfig: (data) => {
      const { objectLabelData, actionLabelData, moveLabelData } = data
      importObjectLabelData(objectLabelData)
      importActionLabelData(actionLabelData)
      importMoveLabelData(moveLabelData)
    }
  }
})
