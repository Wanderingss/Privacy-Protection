import type { App } from "vue";
import { createPinia } from "pinia";

const store = createPinia();

// 全局注册 store
export function setupStore(app: App<Element>) {
  app.use(store);
}

// export * from "./modules/xxx" 表示将 ./modules 目录下各 Store 模块的所有导出内容（如 useAppStore、useUserStore 等）重新导出。
export * from "./modules/app.store";
export * from "./modules/permission.store";
export * from "./modules/settings.store";
export * from "./modules/tags-view.store";
export * from "./modules/user.store";
export * from "./modules/dict.store";
export { store };
