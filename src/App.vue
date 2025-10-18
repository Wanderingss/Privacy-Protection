<template>
  <el-config-provider :locale="locale" :size="size">
    <!-- Element Plus 全局配置 -->
    <!-- 开启水印 -->
    <el-watermark
      :font="{ color: fontColor }"
      :content="showWatermark ? defaultSettings.watermarkContent : ''"
      :z-index="9999"
      class="wh-full"
    >
      <router-view />
      <!-- 路由出口：渲染当前路由对应的页面 -->
    </el-watermark>
  </el-config-provider>
</template>

<script setup lang="ts">
// 1. 导入 Pinia 状态管理（核心依赖）
import { useAppStore, useSettingsStore } from "@/store";
// 2. 导入应用默认配置
import { defaultSettings } from "@/settings";
// 3. 导入 TypeScript 枚举类型（类型约束）
import { ThemeMode } from "@/enums/settings/theme.enum";
import { ComponentSize } from "@/enums/settings/layout.enum";

const appStore = useAppStore(); // 通过 computed 创建的计算属性会依赖 Store 中的状态，当依赖变化时自动重新计算，确保模板中使用的数据始终是最新的。
const settingsStore = useSettingsStore();

const locale = computed(() => appStore.locale);
const size = computed(() => appStore.size as ComponentSize);
const showWatermark = computed(() => settingsStore.showWatermark);

// 明亮/暗黑主题水印字体颜色适配
const fontColor = computed(() => {
  return settingsStore.theme === ThemeMode.DARK ? "rgba(255, 255, 255, .15)" : "rgba(0, 0, 0, .15)";
});
</script>
