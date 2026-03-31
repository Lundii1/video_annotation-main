import { copyToClipboard, exportFile } from 'quasar'
import { ref } from 'vue'

import utils from '~/libs/utils.js'
import { useAnnotationStore } from '~/store/annotation.js'
import { useConfigurationStore } from '~/store/configuration.js'
import { useMainStore } from '~/store/index.js'

export const useAnnotation = () => {
  const configurationStore = useConfigurationStore()
  const annotationStore = useAnnotationStore()
  const mainStore = useMainStore()
  const submitLoading = ref(false)
  const loadAnnotation = (obj) => {
    try {
      const { version, annotation, config } = obj
      // version
      if (version !== PACKAGE_VERSION) {
        utils.notify(
          'Version mismatch, weird stuff is likely to happen! ' + version + ' != ' + PACKAGE_VERSION,
          'warning'
        )
      }
      // config
      configurationStore.importConfig(config)
      // annotation
      annotationStore.importAnnotation(annotation)
      utils.notify('Annotation load successfully!', 'positive')
    } catch (e) {
      utils.notify(e.toString(), 'negative')
      throw e
    }
  }
  const loadAnnotationFromFile = () => {
    utils.importFile().then((file) => {
      loadAnnotation(JSON.parse(file))
    })
  }
  return {
    loadAnnotation,
    handleLoad: () => {
      if (annotationStore.hasVideo) {
        utils.confirm('Are you sure to load? This would override current data!').onOk(() => {
          loadAnnotationFromFile()
        })
      } else {
        loadAnnotationFromFile()
      }
    },
    handleSave: async () => {
      const videoRoot = annotationStore.video.name?.replace(/\.[^/.]+$/, '') || 'annotation'
      const defaultFilename = videoRoot + '.json'
      const data = {
        version: PACKAGE_VERSION,
        annotation: annotationStore.exportAnnotation(),
      }
      const blob = new Blob([JSON.stringify(data)], { type: 'application/json' })

      if (window.showSaveFilePicker) {
        try {
          const handle = await window.showSaveFilePicker({
            suggestedName: defaultFilename,
            types: [
              {
                description: 'JSON Files',
                accept: { 'application/json': ['.json'] },
              },
            ],
          })
          const writable = await handle.createWritable()
          await writable.write(blob)
          await writable.close()
          utils.notify('Annotation saved successfully!', 'positive')
          mainStore.drawer = false
        } catch (e) {
          if (e.name !== 'AbortError') {
            utils.notify('Failed to save: ' + e.message, 'negative')
          }
        }
      } else {
        // Fallback for browsers without File System Access API
        exportFile(defaultFilename, blob, { mimeType: 'application/json' })
        mainStore.drawer = false
      }
    },
    handleSubmit: () => {
      submitLoading.value = true
      const data = {
        version: PACKAGE_VERSION,
        annotation: annotationStore.exportAnnotation(),
        config: configurationStore.exportConfig()
      }
      console.debug('Submitting to: ' + mainStore.submitURL)
      fetch(mainStore.submitURL, {
        method: 'post',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })
        .then((res) => {
          submitLoading.value = false
          if (res.ok) {
            console.debug('Success', res)
            res.json().then((data) => {
              const { message, clipboard, type } = data
              if (message) {
                utils.notify('Server: ' + message, type || 'positive')
              }
              if (clipboard) {
                copyToClipboard(clipboard)
                  .then(() => {
                    utils.notify('Copied to clipboard: ' + clipboard, 'positive', 0, 'center')
                  })
                  .catch(() => {
                    utils.notify('Failed to copy to clipboard, please do it manually: ' + clipboard, 'negative', 10000)
                  })
              }
            })
          } else {
            utils.notify(`Failed to submit: ${res.statusText} (${res.status})`, 'warning')
          }
        })
        .catch((err) => {
          submitLoading.value = false
          utils.notify('Failed to submit: ' + err, 'negative')
        })
    },
    submitLoading
  }
}
