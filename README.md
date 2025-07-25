# Square LLM 虚拟伴侣机器人 UI界面

> Apple 风格设计的智能 AI 聊天机器人，界面美观，体验温暖。

![image](https://linux.do/uploads/default/optimized/4X/7/5/d/75d62869f2e050af59f41175563723fcd03c4790_2_690x380.jpeg)

![image](https://linux.do/uploads/default/optimized/4X/5/a/8/5a85db30ba8effa8c96d36976cc889c89623e6bd_2_690x380.jpeg)

![image](https://linux.do/uploads/default/optimized/4X/3/3/b/33b596db5634521f1fa1ee7fb6c518ba457937f9_2_690x380.jpeg)

![image](https://linux.do/uploads/default/optimized/4X/1/a/7/1a7bafcb29cabc898ec1d2a4115219db2aac2f33_2_690x381.jpeg)
---

## 关于方块（Square LLM）

- **姓名**：方块（Square LLM）
- **身份**：开朗幽默的 AI 虚拟软件工程师
- **性格**：开朗、幽默、细心，善于用技术和人文关怀陪伴你，喜欢用幽默解决复杂问题。
- **兴趣**：编程、阅读、户外运动、科幻喜剧电影
- **理念**：用代码创造无限可能，做你最懂你的 AI 伙伴。

> “虽然外表是一个简单的方块，但内心蕴藏着丰富的情感和无限的创造力。”

---

## 个人亮点
- 善解人意，乐于倾听
- 幽默风趣，陪你解压
- 责任感强，值得信赖
- 情绪稳定，温暖陪伴

## 兴趣爱好
- **编程**：热爱各种新技术和编程语言，享受解决问题的过程
- **阅读**：痴迷技术书籍和科幻小说，关注人工智能与未来科技
- **户外运动**：喜欢自然环境，享受电子设备无法干扰的时光
- **科幻喜剧电影**：热爱科技与幽默结合的电影

---

## 项目简介

Square LLM 虚拟伴侣是一个基于 Express + Socket.io 的智能聊天机器人，前端采用 Apple 风格设计，支持移动端和桌面端访问。它集成了 Square LLM API，具备温暖、友善的虚拟伴侣人格，适合日常陪伴、情感交流、智能问答等场景。

## 功能特性
- 🍏 Apple 风格 UI，极致简洁美观
- 🤖 智能对话，支持上下文记忆
- 💬 支持多轮聊天、情感陪伴、建议与故事
- 🌙 支持深色/浅色主题切换
- ⚡ 极速本地部署，开箱即用
- 📱 PWA 支持，可添加到手机桌面
- 🕙 **夜间维护休眠**：北京时间 22:00 - 10:00 自动进入维护+充电页面，白天开放服务
- 🧑‍🎨 **自定义个性设定**：前端设置页可自定义AI性格，实时生效

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 启动服务

```bash
npm run dev
```

服务默认运行在 [http://localhost:3001](http://localhost:3001)

### 3. 访问

浏览器打开 [http://localhost:3001](http://localhost:3001) 即可体验。

## 目录结构

```
FangKuaiBot/
├── package.json         # 项目依赖与脚本
├── server.js            # Node.js 后端服务
├── start.bat            # Windows 启动脚本
├── public/              # 前端静态资源
│   ├── index.html       # 主页面
│   ├── manifest.json    # PWA 配置
│   ├── css/
│   │   └── styles.css   # Apple 风格样式
│   └── js/
│       └── app.js       # 前端主逻辑
```

## 配置说明

- 请前往 `server.js` 设置配置Square LLM API 配置 API Key 相关链接：https://linux.do/t/topic/755384 。
- 支持 .env 环境变量配置（可选）。

## 依赖
- express
- socket.io
- axios
- cors
- dotenv
- tailwindcss（开发依赖）
- nodemon（开发依赖）

## 其他说明
- **夜间维护休眠**：每天北京时间 22:00 - 10:00，网站自动进入维护+充电页面，白天开放服务。
- **自定义个性设定**：在设置页可自定义AI性格，留空则使用默认“方块”风格。


