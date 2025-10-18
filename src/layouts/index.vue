<template>
  <div class="layout-wrapper">
    <!-- 动态组件：根据 currentLayoutComponent 渲染对应的布局组件 -->
    <component :is="currentLayoutComponent" />

    <!-- 设置面板 - 独立于布局组件 -->
    <Settings v-if="isShowSettings" />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useLayout } from "./composables/useLayout";
import LeftLayout from "./views/LeftLayout.vue";
import TopLayout from "./views/TopLayout.vue";
import MixLayout from "./views/MixLayout.vue";
import Settings from "./components/Settings/index.vue";
import { LayoutMode } from "@/enums/settings/layout.enum";
import { defaultSettings } from "@/settings";

// 1. 获取当前布局模式（响应式状态）
const { currentLayout } = useLayout();

// 2. 动态映射布局组件（计算属性）
// 根据当前布局模式选择对应的组件
const currentLayoutComponent = computed(() => {
  switch (currentLayout.value) {
    case LayoutMode.TOP:
      return TopLayout;
    case LayoutMode.MIX:
      return MixLayout;
    case LayoutMode.LEFT:
      return LeftLayout;
    default:
      return LeftLayout;
  }
});

// 3. 控制设置面板显示（计算属性）
// 是否显示设置面板
const isShowSettings = computed(() => defaultSettings.showSettings);
</script>
<!-- scoped 修饰符：限制样式仅作用于当前组件，防止污染全局样式（例如避免影响子组件的布局）。 -->
<style lang="scss" scoped>
.layout-wrapper {
  width: 100%;
  height: 100%;
}
</style>
