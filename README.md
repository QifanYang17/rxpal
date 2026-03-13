# 此间有序 · RxPal

> 专为老年人设计的健康管理微信小程序 — A WeChat Mini Program for elderly health management

![Taro](https://img.shields.io/badge/Taro-4.1-blue) ![React](https://img.shields.io/badge/React-18-61dafb) ![TypeScript](https://img.shields.io/badge/TypeScript-5.4-3178c6) ![Zustand](https://img.shields.io/badge/Zustand-4.5-orange) ![WeChat Cloud](https://img.shields.io/badge/WeChat-Cloud%20Dev-07c160)

---

## 项目简介

**此间有序**（暖记）是一款面向中老年用户的健康生活管理微信小程序。界面大字体、操作简单，帮助用户管理用药计划、记录就诊信息、追踪健康趋势，并支持家人远程关注。

- 支持**拍照识别**病历处方，AI 自动提取信息
- **药盒识别**，扫一扫即可录入用药计划
- 智能**用药提醒**，按时服药不再忘记
- **健康趋势**图表，血压/血糖/心率一目了然
- 支持**中英文**切换，适配海外华人家庭
- 数据**本地持久化**，重启应用不丢失

---

## 功能截图

> *(截图待补充)*

---

## 技术栈

| 层级 | 技术 |
|------|------|
| 框架 | Taro 4 + React 18 |
| 语言 | TypeScript 5 |
| 状态管理 | Zustand 4 + persist 中间件 |
| 样式 | SCSS Modules |
| 云服务 | 微信云开发（云函数 + 云存储） |
| OCR | 腾讯云通用文字识别 |
| 图表 | Canvas 2D API |

---

## 目录结构

```
cc/
├── src/
│   ├── pages/
│   │   ├── home/          # 首页：今日服药进度 + 提醒
│   │   ├── timeline/      # 时间线：就诊记录 + 健康趋势图
│   │   ├── scan/          # 拍照识别：病历/处方 OCR
│   │   ├── medication/    # 用药管理：药物列表 + 药盒识别 + 手动添加
│   │   ├── profile/       # 个人中心：设置 + 家人绑定
│   │   └── onboarding/    # 新手引导
│   ├── components/
│   │   └── Tutorial/      # 功能教程组件
│   ├── utils/
│   │   ├── store.ts       # Zustand 全局状态（含持久化）
│   │   ├── i18n.ts        # 中英文翻译
│   │   ├── storage.ts     # Taro 存储适配器
│   │   ├── cloud.ts       # 云函数调用封装
│   │   └── helpers.ts     # 工具函数
│   ├── types/             # TypeScript 类型定义
│   └── data/              # Mock 数据
├── cloud/
│   ├── ocr/               # OCR 识别云函数（腾讯云）
│   ├── parseRx/           # 处方解析云函数
│   └── notify/            # 用药提醒推送云函数
└── config/                # Taro 构建配置
```

---

## 本地运行

```bash
# 安装依赖
npm install

# 开发模式（监听文件变化）
npm run dev:weapp

# 生产构建
npm run build:weapp
```

构建完成后，用**微信开发者工具**打开 `dist/` 目录预览。

云函数需在微信开发者工具中单独上传部署，OCR 云函数需配置腾讯云密钥环境变量：
- `TENCENT_SECRET_ID`
- `TENCENT_SECRET_KEY`

---

## License

MIT
