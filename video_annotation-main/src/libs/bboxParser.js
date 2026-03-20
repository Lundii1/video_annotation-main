/**
 * Bounding box parser and loader for pre-computed tracking data.
 *
 * Maps video filenames (from the Realvideos folder) to bbox XML track files
 * in the project's bboxes/ folder, parses the XML, and returns per-frame bbox data.
 *
 * Video naming: new_01_April_2023_10_20_16_00_01_22_00_02_51_videos_1.mp4
 *   → bboxes/new/01_April_2023_10_20_16_00_01_22_00_02_51/tracks/1.xml
 *
 * The suffix videos_N maps directly to N.xml (one XML per video view).
 */

const PERSON_COLORS = { '1': '#FF0000', '2': '#0066FF' }
const DEFAULT_COLOR = '#00CC00'

/**
 * Extract bbox file path from a video filename.
 * @param {string} videoFileName - e.g. "new_01_April_2023_10_20_16_00_01_22_00_02_51_videos_1.mp4"
 * @returns {{ xmlPath: string, prefix: string, coreName: string, viewNumber: string } | null}
 */
export function parseVideoNameToBboxPath(videoFileName) {
  const name = videoFileName.replace(/\.[^.]+$/, '')
  const match = name.match(/^(new|old)_(.+?)_videos_(\d+)$/)
  if (!match) return null
  const prefix = match[1]
  const coreName = match[2]
  const viewNumber = match[3]
  return {
    xmlPath: `/bboxes/${prefix}/${coreName}/tracks/${viewNumber}.xml`,
    prefix,
    coreName,
    viewNumber
  }
}

/**
 * Parse a single track XML string into per-frame bbox data.
 * Colors are assigned by personID.
 * @param {string} xmlString
 * @returns {Object} Map of frame index → array of bbox objects
 */
export function parseBboxXML(xmlString) {
  const parser = new DOMParser()
  const doc = parser.parseFromString(xmlString, 'text/xml')
  const frameMap = {}

  const keyframes = doc.querySelectorAll('keyframe')
  for (const keyframe of keyframes) {
    const frameIndex = parseInt(keyframe.getAttribute('key'))
    const keys = keyframe.querySelectorAll('key')
    for (const key of keys) {
      const personID = key.getAttribute('personID')
      const bboxStr = key.getAttribute('bbox')
      if (!bboxStr) continue
      const parts = bboxStr.trim().split(/\s+/).map(Number)
      if (parts.length < 4) continue
      const [x1, y1, x2, y2, confidence] = parts
      if (!frameMap[frameIndex]) frameMap[frameIndex] = []
      frameMap[frameIndex].push({
        personID,
        x1,
        y1,
        x2,
        y2,
        confidence: confidence || 0,
        color: PERSON_COLORS[personID] || DEFAULT_COLOR
      })
    }
  }
  return frameMap
}

/**
 * Fetch and parse the single XML track file matching the video view.
 * @param {string} xmlPath - e.g. "/bboxes/new/01_April_.../tracks/1.xml"
 * @returns {Promise<Object>} Frame map: { [frame]: [{personID, x1, y1, x2, y2, confidence, color}] }
 */
export async function fetchBboxTracks(xmlPath) {
  console.log(`[bbox] Fetching: ${xmlPath}`)
  try {
    const response = await fetch(xmlPath)
    console.log(`[bbox] Response: ${response.status} ${response.statusText}`)
    if (!response.ok) return {}
    const xmlString = await response.text()
    console.log(`[bbox] XML length: ${xmlString.length} chars`)
    const frameMap = parseBboxXML(xmlString)
    const frameCount = Object.keys(frameMap).length
    console.log(`[bbox] Parsed: ${frameCount} frames`)
    if (frameCount > 0) {
      const firstFrame = Object.keys(frameMap)[0]
      console.log(`[bbox] Sample frame ${firstFrame}:`, frameMap[firstFrame])
    }
    return frameMap
  } catch (e) {
    console.error(`[bbox] Fetch error:`, e.message)
    return {}
  }
}
