<template>
  <div style="max-width: 800px; margin: 0 auto" class="q-gutter-md">
    <!-- <h5>Tutorial Videos</h5>
    <div class="text-body1">
      <q-video
        :ratio="16 / 9"
        src=""
      />
    </div> -->
    <h5>Instruction</h5>
    <div class="text-body1">
      - Click Open Video (or press <q-chip color="secondary" size="md">Enter</q-chip>) to load a video.
      <br>
      - Click play/pause (or press <q-chip color="secondary" size="md">Space</q-chip>) to start/pause the video.
      <br>
      - Press <q-chip color="secondary" size="md">Enter</q-chip> to mark the end of a skill segment.
      <br>
      - Write the skill description in the text field at the bottom of the page.
      <br>
      - Press <q-chip color="secondary" size="md">Enter</q-chip> to save the segment and resume the video.
      <br>
      - To adjust any of the skill segments, click the segment (marked
      in blue) or the locate button on the corresponding row,
      and adjust the start and end times. Then press the set button on the corresponding row to save the changes. Press
      advance to move on.
      - when u use up-arrow it activate the beginning of the sequence and if you press down-arrow twice it will activate the end of the sequence. the left video shows the changes in the beginning of the sequence and the right videos shows the changes in the end of the sequence.

      <br>
      - If the segment is a mistake, click the mistake button on the corresponding row.
      <br>
      - After labeling all the skill segments, click save or press <q-chip color="secondary" size="md">Command +
        S</q-chip> to save annotations.
    </div>

    <h5>Using python for creating xml or csv file</h5>
    <div class="text-body1">
      <br> - python write_annotation_smpl.py will create the xml file if you run it with --csv 
        flag it will create the csv file.
    </div>
    <h5>List of Boxing Actions</h5>
    <div class="text-body1">
      <h6>Punches</h6>
      <ul>
        <li>Jab</li>
        <li>Cross</li>
        <li>Lead Hook</li>
        <li>Rear Hook</li>
        <li>Lead Uppercut</li>
        <li>Rear Uppercut</li>
        <li>Rear Overhand: looks like a hook with high elbow – landing with downward trajectory - aiming down</li>
        <li>Body Shot: is the outcome and not a type – target to the body for all except Overhand</li>
      </ul>
      <h6>Defense</h6>
      <ul>
        <li>Slip</li>
        <li>Bob and Weave</li>
        <li>Pull</li>
        <li>Duck</li>
        <li>Parry</li>
        <li>Block</li>
        <li>Clinch</li>
        <li>Counter Punch: Detect this by the time difference when a boxer punches back; don’t define this as an action in itself</li>
      </ul>
      <h6>Postures</h6>
      <ul>
        <li>High guard</li>
        <li>Low hands</li>
        <li>Southpaw stance (Right hand in front)</li>
        <li>Orthodox stance (Left hand in front)</li>
        <li>Squared (2 feet side by side, torso facing forward)</li>
        <li>Balance  Estimated weight distribution on rear / front foot. Could be done by skeleton CoM location ? The name of the metric could be refined but this balance / CoM management have an impact on hand + posture</li>
      </ul>
      <h6>Movements</h6>
      <ul>
        <li>Pivot(pivoting on the spot in 1 step)</li>
        <li>Angle off(moving around – aside the opponent in 1 step)</li>
        <li>Punch Feint</li>
        <li>Shoulder Feint</li>
        <li>Feet / step feint</li>
        <li>Head / Eyes / look Feint</li>
      </ul>
      <h6>Outcomes</h6>
      <ul>
        <li>Punch landed on head</li>
        <li>Punch landed on torso</li>
        <li>Punch blocked</li>
        <li>Punch avoided - Missed due to defensive action</li>
        <li>Air punch</li>
      </ul>
    </div>
    <h5>Keyboard Shortcuts</h5>
    <div class="text-body1">
      <div class="row q-ma-none" v-for="shortcut in shortcuts">
        <div class="col" style="line-height: 30px">
          {{ shortcut.description }}
        </div>
        <div class="col text-center">
          <q-chip class="text-black" color="secondary" size="md" v-for="key in shortcut.keys">{{ key.toUpperCase() }}
          </q-chip>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const shortcuts = [
  {
    keys: ['enter'],
    description: 'open video'
  },
  {
    keys: ['space'],
    description: 'play / pause video segment'
  },
  {
    keys: ['left-arrow', 'right-arrow'],
    description: 'previous / next frame'
  },
  {
    keys: ['left-up', 'right-down'],
    description: 'choosing start or end for changing the frame'
  },
  {
    keys: ['enter'],
    description: 'add a new video segment'
  },
  {
    keys: ['command + s', 'ctrl + s'],
    description: 'save annotations'
  },
]
</script>