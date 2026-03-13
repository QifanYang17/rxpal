<div align="center">

# 此间有序 · RxPal

**专为中老年人设计的健康生活管理微信小程序**

*A WeChat Mini Program designed for elderly health management*

<br/>

[![Taro](https://img.shields.io/badge/Taro-4.1.11-0052cc?style=flat-square&logo=data:image/png;base64,)](https://taro.zone)
[![React](https://img.shields.io/badge/React-18.3-61dafb?style=flat-square&logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-3178c6?style=flat-square&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Zustand](https://img.shields.io/badge/Zustand-4.5-ff6b35?style=flat-square)](https://zustand-demo.pmnd.rs)
[![WeChat](https://img.shields.io/badge/WeChat-Cloud%20Dev-07c160?style=flat-square&logo=wechat&logoColor=white)](https://developers.weixin.qq.com/miniprogram/dev/wxcloud/basis/getting-started.html)

<br/>

> 用心守护您的生活 · *Your caring life companion*

</div>

---

## 📖 项目简介 · About

**此间有序**（暖记）是一款专为中老年用户打造的健康生活管理微信小程序。

针对老年用户的使用习惯，采用**大字体、高对比度、简洁交互**的设计原则，帮助用户轻松管理日常用药、记录就诊信息、追踪健康数据，同时支持家人远程关注守护。

**RxPal** is a WeChat Mini Program tailored for elderly users. Built with large fonts, high contrast, and simplified interactions, it helps users manage medications, track medical visits, monitor health trends, and stay connected with family caregivers.

---

## ✨ 核心功能 · Features

### 🏠 首页 · Home
- 今日服药进度环形图，完成情况一目了然
- 当日提醒列表，支持标记完成 / 跳过
- 最近就诊记录快捷入口

*Daily medication progress ring chart · Reminder list with done/skip actions · Recent visit quick access*

### 📅 健康时间线 · Health Timeline
- 就诊记录按时间轴展示
- 血压 / 血糖 / 心率 / 体重趋势折线图（Canvas 2D）
- 一键记录当日健康数据，对比参考范围

*Visit records on timeline · Health trend charts rendered via Canvas 2D · One-tap data logging with reference ranges*

### 📷 拍照识别 · OCR Scan
- 拍摄病历、处方或检查报告，AI 自动识别文字
- 腾讯云通用 OCR + 自研解析逻辑，结构化提取患者信息、诊断、用药
- 识别结果可手动修改后保存

*Photo OCR via Tencent Cloud · Structured extraction of patient info, diagnosis & medications · Editable before saving*

### 💊 用药管理 · Medication
- 药物列表，按早 / 中 / 晚 / 睡前分组显示
- **药盒识别**：拍摄药盒包装，自动解析药品名称、用法用量
- **手动添加**：大字体输入表单，支持预设剂量快捷选择
- 用药计划变更后自动重新生成今日提醒

*Drug list grouped by time slot · Medicine box OCR to auto-fill medication plan · Manual add with large-font form · Auto-regenerate reminders on change*

### 👤 个人中心 · Profile
- 睡眠提醒时间设置
- 字体大小调节（标准 / 大 / 特大）
- 中英文语言切换，全局即时生效（含 TabBar）
- 家人绑定与邀请码功能

*Sleep reminder · Font size adjustment · Live language switch (zh/en) including TabBar · Family invite code*

---

## 🛠 技术栈 · Tech Stack

| 层级 | 技术 | 说明 |
|------|------|------|
| **框架** | Taro 4 + React 18 | 跨端小程序框架，编译至微信小程序 |
| **语言** | TypeScript 5.4 | 全量类型覆盖 |
| **状态管理** | Zustand 4 + `persist` | 持久化中间件 + 自定义 Taro Storage 适配器 |
| **样式** | SCSS | 模块化样式，适老化设计规范 |
| **云服务** | 微信云开发 | 云函数 + 云存储，无需自建服务器 |
| **OCR** | 腾讯云通用文字识别 | 处方 / 病历 / 药盒三类解析 |
| **图表** | Canvas 2D API | 原生实现健康趋势折线图 |
| **国际化** | 自研 i18n | 轻量 `t(key)` 函数 + `useT()` 响应式 Hook |

---

## 🏗 项目结构 · Project Structure

```
rxpal/
├── src/
│   ├── pages/
│   │   ├── home/            # 首页 · Home
│   │   ├── timeline/        # 健康时间线 · Timeline
│   │   ├── scan/            # 拍照识别 · OCR Scan
│   │   ├── medication/      # 用药管理 · Medication
│   │   │   ├── index.tsx    #   药物列表
│   │   │   ├── add.tsx      #   手动添加
│   │   │   └── box-scan.tsx #   药盒识别
│   │   ├── profile/         # 个人中心 · Profile
│   │   └── onboarding/      # 新手引导 · Onboarding
│   ├── components/
│   │   └── Tutorial/        # 功能教程组件
│   └── utils/
│       ├── store.ts          # Zustand 全局状态（含持久化）
│       ├── i18n.ts           # 中英文翻译字典 + useT() hook
│       ├── storage.ts        # Taro Storage 适配器
│       ├── cloud.ts          # 云函数调用封装
│       └── helpers.ts        # 日期格式化 / 问候语等工具函数
├── cloud/
│   ├── ocr/                 # OCR 云函数（腾讯云 API）
│   ├── parseRx/             # 处方结构化解析云函数
│   └── notify/              # 用药提醒定时推送云函数
└── config/                  # Taro 构建配置（dev / prod）
```

---

## 🚀 本地运行 · Getting Started

### 环境要求 · Prerequisites

- Node.js ≥ 18
- 微信开发者工具（[下载](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)）
- 微信云开发环境 ID

### 安装与启动 · Install & Run

```bash
# 克隆仓库
git clone https://github.com/QifanYang17/rxpal.git
cd rxpal

# 安装依赖
npm install

# 开发模式（监听文件变化，实时编译）
npm run dev:weapp

# 生产构建
npm run build:weapp
```

用**微信开发者工具**打开 `dist/` 目录即可预览。

*Open the `dist/` directory with WeChat DevTools to preview.*

### 云函数配置 · Cloud Function Setup

在 `src/app.ts` 中填入你的云开发环境 ID：

```ts
Taro.cloud.init({ env: 'YOUR_ENV_ID' })
```

OCR 云函数需在微信云控制台配置以下环境变量：

```
TENCENT_SECRET_ID=your_secret_id
TENCENT_SECRET_KEY=your_secret_key
```

---

## 🔍 技术亮点 · Technical Highlights

- **状态持久化**：使用 Zustand `persist` 中间件 + 自定义 `StateStorage` 适配器，解决微信小程序重启后数据丢失问题
- **轻量 i18n**：无第三方依赖，`t(key, params)` 函数 + `useT()` hook 实现全局响应式语言切换，包括动态更新 TabBar 标签
- **OCR Pipeline**：图片上传 → 腾讯云 OCR → 云函数正则解析 → 前端结构化展示，支持处方/病历/药盒三类模式
- **Canvas 图表**：使用小程序原生 Canvas 2D API 手写折线图，含坐标系、数据点、参考区间标注

---

## 📄 License

MIT © [QifanYang17](https://github.com/QifanYang17)
