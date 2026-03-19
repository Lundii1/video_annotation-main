<template>
  <div
    style="max-width: 800px; margin: 0 auto"
    class="q-gutter-md"
  >
    <div class="row">
      <div class="text-h5">Setting</div>
      <q-space></q-space>
      <q-btn
        class="q-px-md q-mr-md"
        outline
        dense
        color="primary"
        icon="cached"
        @click="preferenceStore.reset"
        label="restore"
      ></q-btn>
    </div>
    <q-list class="text-body1">
      <q-item
        tag="label"
        v-ripple
      >
        <q-item-section>
          <q-item-label>
            <span
              >Default FPS<q-tooltip
                anchor="center right"
                self="center left"
                >The default frame(s) per second.</q-tooltip
              ></span
            >
          </q-item-label>
        </q-item-section>
        <q-item-section>
          <q-input
            dense
            outlined
            v-model.number="defaultFps"
            type="number"
            :rules="[(fps) => (fps >= 1 && fps <= 60 && fps % 1 === 0) || 'Integer between 1 and 60.']"
            @mousewheel.prevent
            hide-bottom-space
          />
        </q-item-section>
      </q-item>
      <q-item
        tag="label"
        v-ripple
      >
        <q-item-section>
          <q-item-label>
            <span
              >Mute video<q-tooltip
                anchor="center right"
                self="center left"
                >Whether to mute when playing video clips.</q-tooltip
              ></span
            >
          </q-item-label>
        </q-item-section>
        <q-item-section avatar>
          <q-toggle
            color="green"
            v-model="muted"
            checked-icon="check"
            unchecked-icon="clear"
          ></q-toggle>
        </q-item-section>
      </q-item>
    </q-list>
  </div>
</template>

<script setup>
import { storeToRefs } from 'pinia'

import { usePreferenceStore } from '~/store/preference.js'

const preferenceStore = usePreferenceStore()
const {
  sensitivity,
  defaultFps,
  defaultFpk,
  decoder,
  objects,
  regions,
  skeletons,
  actions,
  muted,
  grayscale,
  showPopup
} = storeToRefs(preferenceStore)
</script>
