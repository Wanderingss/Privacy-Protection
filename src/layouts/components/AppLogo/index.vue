<template>
  <div class="logo">
    <!-- 过渡动画：Logo 显示时的入场动画 -->
    <transition enter-active-class="animate__animated animate__fadeInLeft">
      <!-- 路由链接：点击 Logo 跳转到首页（/）
        :key="+collapse"：为 router-link 绑定动态 key，当 collapse 变化时（布尔值转换为数字，+collapse 等价于 collapse ? 1 : 0），
        Vue 会重新创建该组件，触发过渡动画（确保折叠 / 展开时 Logo 有动画效果）。
       -->
      <router-link :key="+collapse" class="wh-full flex-center" to="/">
        <!-- Logo 图标 -->
        <img :src="logo" class="w20px h20px" />
        <!-- 标题文字：仅在未折叠时显示 -->
        <span v-if="!collapse" class="title">
          {{ defaultSettings.title }}
        </span>
      </router-link>
    </transition>
  </div>
</template>

<script lang="ts" setup>
import { defaultSettings } from "@/settings";
import logo from "@/assets/logo.png";

// 定义组件接收的外部参数（Props）
defineProps({
  collapse: {
    type: Boolean,
    required: true,
  },
});
//样式部分分为作用域样式（scoped） 和全局样式
</script>

<style lang="scss" scoped>
.logo {
  width: 100%; // 宽度占满父容器
  height: $navbar-height; // 高度使用导航栏高度变量（全局SCSS变量）
  background-color: $sidebar-logo-background; // 背景色（全局SCSS变量）

  .title {
    flex-shrink: 0; // 不收缩（避免标题被挤压）
    margin-left: 10px;
    font-size: 14px;
    font-weight: bold;
    color: $sidebar-logo-text-color; // 文字颜色（全局SCSS变量）
  }
}
</style>

<style lang="scss">
// 顶部布局和混合布局的特殊处理
.layout-top,
.layout-mix {
  .logo {
    background-color: transparent !important;

    .title {
      color: var(--menu-text); // 文字颜色使用CSS变量（动态主题）
    }
  }
}

// 宽屏时：openSidebar 状态下显示完整Logo+文字
.openSidebar {
  &.layout-top .layout__header-left .logo,
  &.layout-mix .layout__header-logo .logo {
    width: $sidebar-width; // 210px，显示logo+文字
  }
}

// 窄屏时：hideSidebar 状态下只显示Logo图标
.hideSidebar {
  &.layout-top .layout__header-left .logo,
  &.layout-mix .layout__header-logo .logo {
    width: $sidebar-width-collapsed; // 54px，只显示logo
  }

  // 隐藏文字，只显示图标
  .logo .title {
    display: none;
  }
}
</style>
