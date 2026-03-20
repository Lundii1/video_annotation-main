import { fetchBboxTracks, parseVideoNameToBboxPath } from '~/libs/bboxParser.js'
import utils from '~/libs/utils.js'
import { useAnnotationStore } from '~/store/annotation.js'
import { useMainStore } from '~/store/index.js'

async function loadBboxOverlay(fileName, annotationStore) {
  console.log('[bbox] Video fileName:', fileName)
  const pathInfo = parseVideoNameToBboxPath(fileName)
  console.log('[bbox] Parsed path info:', pathInfo)
  if (!pathInfo) {
    console.log('[bbox] No matching bbox path found for this video name')
    return
  }
  try {
    const bboxData = await fetchBboxTracks(pathInfo.xmlPath)
    const frameCount = Object.keys(bboxData).length
    console.log('[bbox] Loaded bbox data:', frameCount, 'frames with bboxes')
    if (frameCount > 0) {
      const firstFrame = Object.keys(bboxData)[0]
      console.log('[bbox] Sample frame', firstFrame, ':', bboxData[firstFrame])
    }
    annotationStore.bboxOverlayData = bboxData
  } catch (e) {
    console.error('[bbox] Error loading bbox data:', e)
  }
}

export const useVideo = () => {
  const annotationStore = useAnnotationStore()
  const mainStore = useMainStore()
  return {
    handleOpen: () => {
      if (annotationStore.hasVideo) {
        utils.confirm('Are you sure to open a new video? You will LOSE all data!').onOk(() => {
          annotationStore.reset()
          utils.importVideo().then(({ type, videoSrc, fileName }) => {
            mainStore.videoFormat = type
            annotationStore.video.src = videoSrc
            annotationStore.video.name = fileName
            mainStore.drawer = false
            loadBboxOverlay(fileName, annotationStore)
          })
        })
      } else {
        utils.importVideo().then(({ type, videoSrc, fileName }) => {
          mainStore.videoFormat = type
          annotationStore.video.src = videoSrc
          annotationStore.video.name = fileName
          mainStore.drawer = false
          loadBboxOverlay(fileName, annotationStore)
        })
      }
    },
    handleClose: () => {
      utils.confirm('Are you sure to close? You will LOSE all data!').onOk(() => {
        annotationStore.reset()
        mainStore.drawer = false
        mainStore.videoFormat = null
      })
    }
  }
}
