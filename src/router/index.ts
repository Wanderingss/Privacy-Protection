import type { App } from "vue";
import { createRouter, createWebHashHistory, type RouteRecordRaw } from "vue-router";

/*
createRouter：Vue Router 的核心函数，用于创建路由实例，接收路由配置（历史模式、路由规则等）。
createWebHashHistory 指定路由的历史模式为哈希模式（URL 中包含 #，如 http://localhost:8080/#/dashboard），
特点是刷新页面不会 404，适合静态站点或不需要后端配合的场景（另一种是 createWebHistory，基于 HTML5 History API，URL 无 #，但需要后端配置）。
RouteRecordRaw：TypeScript 类型，约束路由配置对象的结构（如必须包含 path、component 等属性），避免配置错误。
path：路由路径（URL 中的路径部分）。
component：路由对应的组件（可以是布局组件或页面组件）。
meta：路由元信息（自定义属性，用于控制路由的显示、权限等）。
children：嵌套路由（子路由，用于实现布局组件内部的页面切换）。
redirect：路由重定向（访问该路径时自动跳转到另一个路径）。
*/
export const Layout = () => import("@/layouts/index.vue"); // 路由懒加载，只有当该组件被实际需要时（如访问对应路由），才会加载

// 静态路由
export const constantRoutes: RouteRecordRaw[] = [
  {
    path: "/redirect",
    component: Layout,
    meta: { hidden: true },
    children: [
      {
        path: "/redirect/:path(.*)", // 动态路径参数，匹配任意路径（如 /redirect/dashboard）
        component: () => import("@/views/redirect/index.vue"), // 重定向处理组件
      },
    ],
  },

  {
    path: "/login",
    component: () => import("@/views/login/index.vue"), // 登录页面组件
    meta: { hidden: true },
  },

  {
    path: "/",
    name: "/",
    component: Layout,
    redirect: "/dashboard",
    children: [
      {
        path: "dashboard",
        component: () => import("@/views/dashboard/index.vue"),
        // 用于 keep-alive 功能，需要与 SFC 中自动推导或显式声明的组件名称一致
        // 参考文档: https://cn.vuejs.org/guide/built-ins/keep-alive.html#include-exclude
        name: "Dashboard",
        meta: {
          title: "dashboard",
          icon: "homepage",
          affix: true,
          keepAlive: true,
        },
      },
      {
        path: "401",
        component: () => import("@/views/error/401.vue"),
        meta: { hidden: true },
      },
      {
        path: "404",
        component: () => import("@/views/error/404.vue"),
        meta: { hidden: true },
      },
      {
        path: "profile",
        name: "Profile",
        component: () => import("@/views/profile/index.vue"),
        meta: { title: "个人中心", icon: "user", hidden: true },
      },
      {
        path: "my-notice",
        name: "MyNotice",
        component: () => import("@/views/system/notice/components/MyNotice.vue"),
        meta: { title: "我的通知", icon: "user", hidden: true },
      },
    ],
  },
];

/**
 * 创建路由
 */
const router = createRouter({
  history: createWebHashHistory(),
  routes: constantRoutes,
  // 刷新时，滚动条位置还原
  scrollBehavior: () => ({ left: 0, top: 0 }), // 路由切换时的滚动行为：回到顶部
});

// 全局注册 router
export function setupRouter(app: App<Element>) {
  app.use(router); // 注册之后 <router-view /> 就会生效
}

export default router;
