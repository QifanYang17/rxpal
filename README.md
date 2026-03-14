<div align="center">

<img src="https://img.shields.io/badge/此间有序-RxPal-07c160?style=for-the-badge&labelColor=1a1a2e" alt="RxPal" height="40"/>

<br/>
<br/>

**🌐 Language · 语言**

[🇨🇳 中文](#-项目介绍) &nbsp;|&nbsp; [🇺🇸 English](#-about)

<br/>

[![Taro](https://img.shields.io/badge/Taro-4.1.11-0052cc?style=flat-square)](https://taro.zone)
[![React](https://img.shields.io/badge/React-18.3-61dafb?style=flat-square&logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-3178c6?style=flat-square&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Zustand](https://img.shields.io/badge/Zustand-4.5-ff6b35?style=flat-square)](https://zustand-demo.pmnd.rs)
[![WeChat Cloud](https://img.shields.io/badge/WeChat-Cloud%20Dev-07c160?style=flat-square&logo=wechat&logoColor=white)](https://developers.weixin.qq.com/miniprogram/dev/wxcloud/basis/getting-started.html)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

<br/>

> 用心守护您的生活 &nbsp;·&nbsp; *Your caring life companion*

</div>

---

<br/>

<!-- ============================================================ -->
<!--                        中文版本                              -->
<!-- ============================================================ -->

## 🇨🇳 项目介绍

**此间有序**（暖记）是一款专为中老年用户打造的健康生活管理微信小程序。

针对老年用户的使用习惯，采用**大字体、高对比度、简洁交互**的设计原则，帮助用户轻松管理日常用药、记录就诊信息、追踪健康数据，同时支持家人远程关注守护。

<br/>

### ✨ 功能特色

| 功能模块 | 描述 |
|:---:|:---|
| 🏠 **首页** | 今日服药进度环形图、待办提醒列表（支持完成/跳过）、最近就诊快捷入口 |
| 📅 **健康时间线** | 就诊记录时间轴、血压/血糖/心率/体重折线趋势图、一键记录当日数据 |
| 📷 **拍照识别** | 病历/处方拍照 OCR，AI 自动提取患者信息、诊断、用药，结果可编辑保存 |
| 💊 **用药管理** | 药物列表（早/中/晚/睡前分组）、药盒拍照自动录入、手动添加大字表单 |
| 👤 **个人中心** | 睡眠提醒、字体大小调节、中英文切换（含 TabBar 即时更新）、家人邀请码 |
| 🌐 **双语支持** | 中英文自由切换，全局实时生效，适配海外华人家庭 |

<br/>

### 🛠 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| 框架 | Taro 4 + React 18 | 跨端小程序框架，编译至微信小程序 |
| 语言 | TypeScript 5.4 | 全量类型覆盖 |
| 状态管理 | Zustand 4 + `persist` | 自定义 Taro Storage 适配器，解决重启数据丢失 |
| 样式 | SCSS | 模块化样式，适老化设计规范 |
| 云服务 | 微信云开发 | 云函数 + 云存储，无需自建服务器 |
| OCR | 腾讯云通用文字识别 | 处方 / 病历 / 药盒三类解析模式 |
| 图表 | Canvas 2D API | 原生手写折线图，含参考区间标注 |
| 国际化 | 自研 i18n | 轻量 `t(key)` 函数 + `useT()` 响应式 Hook |

<br/>

### 🏗 项目结构

```
rxpal/
├── src/
│   ├── pages/
│   │   ├── home/            # 首页
│   │   ├── timeline/        # 健康时间线
│   │   ├── scan/            # 拍照识别
│   │   ├── medication/
│   │   │   ├── index.tsx    # 药物列表
│   │   │   ├── add.tsx      # 手动添加
│   │   │   └── box-scan.tsx # 药盒识别
│   │   ├── profile/         # 个人中心
│   │   └── onboarding/      # 新手引导
│   ├── components/
│   │   └── Tutorial/        # 功能教程组件
│   └── utils/
│       ├── store.ts          # Zustand 全局状态（含持久化）
│       ├── i18n.ts           # 中英文翻译字典 + useT() hook
│       ├── storage.ts        # Taro Storage 适配器
│       ├── cloud.ts          # 云函数调用封装
│       └── helpers.ts        # 工具函数
├── cloud/
│   ├── ocr/                 # OCR 云函数（腾讯云 API）
│   ├── parseRx/             # 处方结构化解析
│   └── notify/              # 用药提醒推送
└── config/                  # Taro 构建配置
```

<br/>

### 🚀 本地运行

**环境要求**
- Node.js ≥ 18
- [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)

```bash
# 克隆仓库
git clone https://github.com/QifanYang17/rxpal.git
cd rxpal

# 安装依赖
npm install

# 开发模式（实时编译）
npm run dev:weapp

# 生产构建
npm run build:weapp
```

用**微信开发者工具**打开 `dist/` 目录预览。

**云函数配置**

在 `src/app.ts` 中填入云开发环境 ID：
```ts
Taro.cloud.init({ env: 'YOUR_ENV_ID' })
```

OCR 云函数需在微信云控制台配置环境变量：
```
TENCENT_SECRET_ID=your_secret_id
TENCENT_SECRET_KEY=your_secret_key
```

<br/>

### 💡 技术亮点

- **状态持久化**：Zustand `persist` 中间件 + 自定义 `StateStorage` 适配器，解决微信小程序重启后用户数据丢失问题
- **轻量 i18n**：无第三方依赖，`t(key, params)` + `useT()` hook 实现全局响应式语言切换，含 TabBar 动态更新
- **OCR Pipeline**：图片上传 → 腾讯云 OCR → 云函数正则解析 → 前端结构化展示，支持三种识别模式
- **Canvas 图表**：小程序原生 Canvas 2D API 手写折线图，含坐标轴、数据点、参考区间色块标注

<br/>

[🔝 回到顶部](#)

---

<br/>
<br/>

<!-- ============================================================ -->
<!--                       English Version                        -->
<!-- ============================================================ -->

## 🇺🇸 About

**RxPal** (此间有序) is a WeChat Mini Program designed specifically for elderly users.

Built with **large fonts, high contrast, and simplified interactions**, it helps users manage daily medications, record medical visits, track health data, and stay connected with family caregivers — all in one place.

<br/>

### ✨ Features

| Module | Description |
|:---:|:---|
| 🏠 **Home** | Daily medication progress ring chart · Reminder list with done/skip · Recent visit quick access |
| 📅 **Timeline** | Medical visit timeline · Blood pressure/sugar/heart rate/weight trend charts · One-tap data logging |
| 📷 **OCR Scan** | Camera-based OCR for medical records & prescriptions · AI-extracted patient info, diagnosis & meds |
| 💊 **Medication** | Drug list grouped by time slot · Medicine box photo scan to auto-fill plan · Manual add with large-font form |
| 👤 **Profile** | Sleep reminder · Font size control · Live zh/en language switch (including TabBar) · Family invite code |
| 🌐 **Bilingual** | Seamless Chinese/English switching, suitable for overseas Chinese families |

<br/>

### 🛠 Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Framework | Taro 4 + React 18 | Cross-platform mini-program framework |
| Language | TypeScript 5.4 | Full type coverage |
| State | Zustand 4 + `persist` | Custom Taro Storage adapter for data persistence across restarts |
| Styling | SCSS | Modular styles, elderly-friendly design system |
| Cloud | WeChat Cloud Dev | Cloud functions + storage, no backend server needed |
| OCR | Tencent Cloud OCR | Three parsing modes: prescription / record / medicine box |
| Charts | Canvas 2D API | Hand-written line charts with reference range annotations |
| i18n | Custom built | Lightweight `t(key)` function + reactive `useT()` hook |

<br/>

### 🏗 Project Structure

```
rxpal/
├── src/
│   ├── pages/
│   │   ├── home/            # Home page
│   │   ├── timeline/        # Health timeline
│   │   ├── scan/            # Photo OCR scan
│   │   ├── medication/
│   │   │   ├── index.tsx    #   Drug list
│   │   │   ├── add.tsx      #   Manual add form
│   │   │   └── box-scan.tsx #   Medicine box scanner
│   │   ├── profile/         # User profile & settings
│   │   └── onboarding/      # First-launch onboarding
│   ├── components/
│   │   └── Tutorial/        # Interactive tutorial overlay
│   └── utils/
│       ├── store.ts          # Zustand global state (with persistence)
│       ├── i18n.ts           # Translation dictionaries + useT() hook
│       ├── storage.ts        # Taro storage adapter
│       ├── cloud.ts          # Cloud function call wrappers
│       └── helpers.ts        # Date formatting, greeting utils
├── cloud/
│   ├── ocr/                 # OCR cloud function (Tencent Cloud API)
│   ├── parseRx/             # Prescription structured parsing
│   └── notify/              # Medication push notification
└── config/                  # Taro build config (dev / prod)
```

<br/>

### 🚀 Getting Started

**Prerequisites**
- Node.js ≥ 18
- [WeChat DevTools](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)

```bash
# Clone the repo
git clone https://github.com/QifanYang17/rxpal.git
cd rxpal

# Install dependencies
npm install

# Development mode (watch & compile)
npm run dev:weapp

# Production build
npm run build:weapp
```

Open the `dist/` directory with **WeChat DevTools** to preview.

**Cloud Function Setup**

Set your Cloud Development environment ID in `src/app.ts`:
```ts
Taro.cloud.init({ env: 'YOUR_ENV_ID' })
```

Configure the following environment variables in the WeChat Cloud console for the OCR function:
```
TENCENT_SECRET_ID=your_secret_id
TENCENT_SECRET_KEY=your_secret_key
```

<br/>

### 💡 Technical Highlights

- **State Persistence** — Zustand `persist` middleware with a custom `StateStorage` adapter bridging `Taro.getStorageSync/setStorageSync`, solving data loss on mini-program restart
- **Lightweight i18n** — Zero dependencies. `t(key, params)` reads from flat dictionaries; `useT()` subscribes to `store.lang` for reactive re-renders; TabBar labels updated via `Taro.setTabBarItem()` on language change
- **OCR Pipeline** — Image upload → Tencent Cloud OCR → cloud function regex parsing → structured front-end display, with three modes switchable by a single `mode` parameter
- **Canvas Charts** — Native Mini Program Canvas 2D API used to hand-render line charts: coordinate axes, labeled data points, shaded reference range bands

<br/>

[🔝 Back to top](#)

---

<div align="center">

MIT License &nbsp;·&nbsp; © 2026 [QifanYang17](https://github.com/QifanYang17)

</div>
