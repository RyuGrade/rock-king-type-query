# 洛克王国精灵属性克制查询

一个基于 React + Vite + TypeScript 的 Web 项目。输入精灵名后，可展示该精灵属性及其对应的被克制属性。

## 功能

- 输入精灵名查询（支持别名）
- 输入关键字联想推荐精灵名
- 按属性直接查询被克制关系
- 展示精灵主属性/副属性
- 展示每个属性被哪些属性克制
- 双属性精灵提供综合被克制属性汇总
- 未命中和空输入提示

## 快速开始

```bash
npm install
npm run dev
```

打开浏览器访问命令行提示地址（默认是 `http://localhost:5173`）。

## 测试与构建

```bash
npm run test
npm run build
```

## 目录结构

- `src/data/types.ts`：属性克制数据（重点字段 `resistedBy`）
- `src/data/spirits.ts`：精灵基础数据与别名
- `src/services/querySpirit.ts`：查询与克制关系计算
- `src/components/SpiritSearch.tsx`：查询输入组件
- `src/components/SpiritResult.tsx`：结果展示组件
- `src/components/TypeSearch.tsx`：属性查询组件
- `src/components/TypeResult.tsx`：属性查询结果组件
- `src/pages/Home.tsx`：页面流程与状态管理

## 扩展建议

- 将 `src/data` 迁移到后端 API 或数据库
- 增加精灵图鉴字段（编号、稀有度、技能）
- 增加属性筛选与模糊搜索
