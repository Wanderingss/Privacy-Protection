<template>
  <div @click="toggle">
    <!-- 根据 isFullscreen 状态动态切换图标  UnoCSS 预加载-->
    <div :class="`i-svg:` + (isFullscreen ? 'fullscreen-exit' : 'fullscreen')" />
  </div>
</template>

<script setup lang="ts">
const { isFullscreen, toggle } = useFullscreen();
</script>

<style lang="scss" scoped></style>
