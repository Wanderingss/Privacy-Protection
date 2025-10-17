// https://eslint.org/docs/latest/use/configure/configuration-files-new

import eslint from "@eslint/js"; // ESLint 核心规则
import pluginVue from "eslint-plugin-vue"; // Vue 语法检查插件
import * as typescriptEslint from "typescript-eslint"; // TypeScript 检查工具
import vueParser from "vue-eslint-parser"; // Vue 单文件解析器
import globals from "globals"; // 预设全局变量（如浏览器环境的 window、Node.js 的 require）
import configPrettier from "eslint-config-prettier"; // 禁用与 Prettier 冲突的 ESLint 规则

// 解析自动导入配置
/* 作用：读取自动导入工具生成的全局变量（如 ref、computed 等 Vue API），告诉 ESLint 这些变量是全局可用的，无需显式导入。 */
import fs from "node:fs"; // 通过 Node.js 的 fs 模块读取了自动导入全局变量配置
let autoImportGlobals = {};
try {
  autoImportGlobals =
    JSON.parse(fs.readFileSync("./.eslintrc-auto-import.json", "utf-8")).globals || {};
} catch (error) {
  // 文件不存在或解析错误时使用空对象
  console.warn("Could not load auto-import globals", error);
}

// Element Plus组件
/* 将 Element Plus 组件（如 <ElInput>）声明为全局变量，避免 ESLint 因 “未导入组件” 而报 no-undef 错误
（尤其适用于通过 unplugin-vue-components 自动注册组件的场景）。 */
const elementPlusComponents = {
  // Element Plus 组件添加为全局变量，避免 no-undef 报错
  ElInput: "readonly",
  ElSelect: "readonly",
  ElSwitch: "readonly",
  ElCascader: "readonly",
  ElInputNumber: "readonly",
  ElTimePicker: "readonly",
  ElTimeSelect: "readonly",
  ElDatePicker: "readonly",
  ElTreeSelect: "readonly",
  ElText: "readonly",
  ElRadioGroup: "readonly",
  ElCheckboxGroup: "readonly",
  ElOption: "readonly",
  ElRadio: "readonly",
  ElCheckbox: "readonly",
  ElInputTag: "readonly",
  ElForm: "readonly",
  ElFormItem: "readonly",
  ElTable: "readonly",
  ElTableColumn: "readonly",
  ElButton: "readonly",
  ElDialog: "readonly",
  ElPagination: "readonly",
  ElMessage: "readonly",
  ElMessageBox: "readonly",
  ElNotification: "readonly",
  ElTree: "readonly",
};

export default [
  // 忽略文件配置
  {
    ignores: [
      "**/node_modules/**", // 忽略依赖目录
      "**/dist/**", // 忽略构建输出目录
      "**/*.min.*", // 忽略压缩文件
      "**/auto-imports.d.ts", // 忽略自动导入的类型定义文件
      "**/components.d.ts", // 忽略组件自动注册的类型定义文件
    ],
  },

  // 基础 JavaScript 配置
  eslint.configs.recommended, // 基础 JavaScript 推荐配置

  // Vue 推荐配置
  ...pluginVue.configs["flat/recommended"], // Vue 推荐配置

  // TypeScript 推荐配置
  ...typescriptEslint.configs.recommended, // TypeScript 推荐配置

  // 全局配置
  {
    // 指定要检查的文件
    files: ["**/*.{js,mjs,cjs,ts,mts,cts,vue}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        // 作用：统一声明项目中所有全局可用的变量和类型，确保 ESLint 不会误判 “未定义” 错误。
        ...globals.browser, // 浏览器环境全局变量
        ...globals.node, // Node.js 环境全局变量
        ...globals.es2022, // ES2022 全局对象
        ...autoImportGlobals, // 自动导入的 API 函数
        ...elementPlusComponents, // Element Plus 组件
        // 全局类型定义，解决 TypeScript 中定义但 ESLint 不识别的问题
        PageQuery: "readonly",
        PageResult: "readonly",
        OptionType: "readonly",
        ApiResponse: "readonly",
        ExcelResult: "readonly",
        TagView: "readonly",
        AppSettings: "readonly",
        __APP_INFO__: "readonly",
      },
    },
    plugins: {
      vue: pluginVue,
      "@typescript-eslint": typescriptEslint.plugin,
    },
    rules: {
      // 基础规则 // 开发/生产环境差异化规则
      "no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
      "no-debugger": process.env.NODE_ENV === "production" ? "warn" : "off",

      // ES6+ 规则
      "prefer-const": "error", // 强制使用 const 声明不可变变量
      "no-var": "error", // 禁止使用 var（要求用 let/const）
      "object-shorthand": "error", // 强制对象字面量简写(如 {a} 代替 {a: a})

      // 最佳实践
      eqeqeq: "off",
      "no-multi-spaces": "error", // 禁止多余空格
      "no-multiple-empty-lines": ["error", { max: 1, maxBOF: 0, maxEOF: 0 }], // 最多允许 1 个空行

      // 禁用与 TypeScript 冲突的规则
      "no-unused-vars": "off",
      "no-undef": "off",
      "no-redeclare": "off",
      "@typescript-eslint/ban-ts-comment": "off",
    },
  },

  // Vue 文件特定配置
  {
    files: ["**/*.vue"], // 对 Vue 单文件组件生效
    languageOptions: {
      parser: vueParser, // 使用 Vue 专用解析器
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        parser: typescriptEslint.parser,
        extraFileExtensions: [".vue"],
      },
    },
    rules: {
      // Vue 规则
      "vue/multi-word-component-names": "off", // 允许单单词组件名（默认要求多单词避免冲突）
      "vue/no-v-html": "off", // 允许使用 v-html（默认禁止，因 XSS 风险）
      "vue/require-default-prop": "off", // 允许 props 不设置默认值
      "vue/require-explicit-emits": "error", // 强制组件显式声明 emits（避免隐式事件）
      "vue/no-unused-vars": "error", // 报错未使用的变量
      "vue/no-mutating-props": "off", // 允许直接修改 props（方便开发，但需谨慎）
      "vue/valid-v-for": "warn", // 警告无效的 v-for 指令
      "vue/no-template-shadow": "warn", // 警告模板变量遮蔽
      "vue/return-in-computed-property": "warn", // 计算属性必须有返回值
      "vue/block-order": [
        "error",
        {
          order: ["template", "script", "style"], // 强制块顺序：template → script → style
        },
      ],
      "vue/html-self-closing": [
        "error",
        {
          html: {
            void: "always", // 自闭合标签必须自闭合，如 <br />
            normal: "never", // 普通元素不自闭合，如 <div></div>
            component: "always", // 组件标签必须自闭合，如 <MyComponent />
          },
          svg: "always", // SVG 元素必须自闭合
          math: "always", // MathML 元素必须自闭合
        },
      ],
      "vue/component-name-in-template-casing": ["error", "PascalCase"], // 组件名模板中必须使用 PascalCase 风格
      "@typescript-eslint/no-explicit-any": "off", // 允许使用 any 类型
    },
  },

  // TypeScript 文件特定配置
  {
    files: ["**/*.{ts,tsx,mts,cts}"],
    languageOptions: {
      parser: typescriptEslint.parser,
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // TypeScript 规则
      "@typescript-eslint/no-explicit-any": "off", // 允许使用any类型，方便开发
      "@typescript-eslint/no-empty-function": "off", // 允许空函数，方便占位
      "@typescript-eslint/no-empty-object-type": "off", // 允许空对象类型{}
      "@typescript-eslint/ban-ts-comment": "off", // 允许使用ts-ignore等注释
      "@typescript-eslint/no-non-null-assertion": "off", // 允许使用非空断言（!）
      "@typescript-eslint/no-unused-vars": "warn", // 降级为警告
      "@typescript-eslint/no-unused-expressions": "warn", // 降级为警告
      "@typescript-eslint/consistent-type-imports": "off", // 关闭强制使用type import
      "@typescript-eslint/no-import-type-side-effects": "error", // 禁止导入类型时有副作用
    },
  },

  // .d.ts 文件配置
  {
    files: ["**/*.d.ts"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off", // 允许使用 any 类型
      "@typescript-eslint/no-unused-vars": "off", // 允许未使用的变量
    },
  },

  // CURD 组件配置
  {
    files: ["**/components/CURD/**/*.{ts,vue}"],
    rules: {
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": "off",
    },
  },

  // Prettier 集成（必须放在最后） 放在最后，禁用 ESLint 中与 Prettier 冲突的格式规则
  configPrettier,
];
