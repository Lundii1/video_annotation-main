<template>
  <a href="https://github.com/lucys0/video_annotation/releases" target="_blank">
    <q-badge color="primary">v{{ version }}</q-badge>
  </a>
</template>

<script setup>
const version = PACKAGE_VERSION
</script>
