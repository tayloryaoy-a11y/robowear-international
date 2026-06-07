# RoboWear International — 官方品牌网站

> 全球首个"具身机器人在线服装 DIY 定制选购平台"官方网站 / 演示项目
> The world's first DIY apparel customization platform for embodied robots — official site / demo build.

为硅基文明，穿上它应有的样子。

---

## 技术栈 Tech Stack

- **React 18** + **Vite 5** — 前端框架与构建工具
- **Tailwind CSS 3** — 原子化样式（自定义 carbon / electric / cyber / metalsilver 主题色板）
- **react-router-dom 6** — 多页面路由
- **Three.js 0.160** — RoboFit 页面的实时 3D 试衣引擎（`OrbitControls` + 基础几何体拼接的人形机器人模型）
- 纯 React `useState` / `useContext` 状态管理（**未使用** `localStorage` / `sessionStorage` 等浏览器持久化存储，刷新页面即重置，符合纯前端演示定位）
- 自研轻量动画方案：`IntersectionObserver` 滚动揭示（`Reveal`）、`requestAnimationFrame` 数字动画（`CountUp`），未引入第三方动画库

## 本地运行 Getting Started

> 需要先安装 [Node.js](https://nodejs.org/)（建议 v18 及以上版本，自带 npm）。

```bash
# 1. 进入项目目录
cd robowear-international

# 2. 安装依赖
npm install

# 3. 启动开发服务器（默认 http://localhost:5173）
npm run dev

# 4. 生成生产构建
npm run build

# 5. 本地预览生产构建
npm run preview
```

## 项目结构 Project Structure

```
robowear-international/
├── index.html                  # HTML 入口，含字体、meta 信息
├── public/
│   └── favicon.svg             # 品牌六边形 Logo 图标
├── src/
│   ├── main.jsx                # 应用入口（挂载 Router + LanguageProvider）
│   ├── App.jsx                 # 路由配置 + 布局骨架（Navbar / Footer）
│   ├── index.css               # 全局样式、Tailwind 指令、自定义工具类
│   ├── context/
│   │   └── LanguageContext.jsx # 中/英双语上下文（T('中文','English') helper）
│   ├── components/
│   │   ├── Navbar.jsx          # 导航栏（滚动渐变毛玻璃 + 响应式汉堡菜单）
│   │   ├── Footer.jsx          # 页脚（产品线 / 全球据点 / 社媒）
│   │   ├── Reveal.jsx          # 滚动揭示动画容器（IntersectionObserver）
│   │   ├── CountUp.jsx         # 数字滚动动画
│   │   ├── PlaceholderImage.jsx# 统一风格的图片占位组件（见下方"图片替换指南"）
│   │   └── icons.jsx           # 内联 SVG 图标集合
│   ├── three/
│   │   └── robotBuilder.js     # Three.js 人形机器人构建器（基础几何体拼接，无 CapsuleGeometry）
│   └── pages/
│       ├── Home.jsx            # 首页（Hero / 数据条 / 核心价值 / 产品线 / 客户墙）
│       ├── Products.jsx        # 产品中心（五大产品线详情）
│       ├── RoboFit.jsx         # ★ RoboFit 3D 定制平台（核心旗舰页）
│       ├── Technology.jsx      # 技术与材料（五项专利 + 学科交汇维恩图）
│       ├── About.jsx           # 关于我们（使命愿景 / 创始人 / 商业模式 / 路线图 / 市场规模）
│       └── Contact.jsx         # 联系我们（带校验的表单 + 全球三地办公室）
├── tailwind.config.js          # Tailwind 主题扩展（品牌色板、字体、动画关键帧）
├── postcss.config.js
└── vite.config.js
```

## RoboFit™ 3D 定制平台说明

`src/pages/RoboFit.jsx` 是本项目的核心旗舰页面：

- **3D 渲染**：使用 `three/examples/jsm/controls/OrbitControls.js` 实现拖拽旋转 + 滚轮缩放；机器人模型完全由 `BoxGeometry` / `CylinderGeometry` / `SphereGeometry` 拼接而成（详见 `src/three/robotBuilder.js`），不依赖 `CapsuleGeometry`，兼容更广泛的 Three.js 版本。
- **机型切换**：Tesla Optimus / Figure 03 / 小鹏 Iron 三大机型，通过调整模型整体缩放比例直观体现体型差异。
- **实时配置**：服装系列、配色（8 色板）、材质风格（光滑 / 磨砂 / 金属 / 皮革，对应不同的 `roughness` / `metalness` 组合）、面具、假发（短发 / 长发 / 卷发，由程序化几何体动态生成并替换）、配件（背包 / 鞋履）— 所有改动均通过 `useEffect` 实时映射到 Three.js 材质与网格属性，所见即所得。
- **实时报价引擎**：`useMemo` 根据当前选择动态计算价格明细与总价。
- **保存搭配摘要**：点击"保存我的搭配"会基于当前 `useState` 生成一份可复制分享的方案摘要弹窗（不连接后端、不写入本地存储，刷新页面即重置）。
- **平台介绍文案**：呼应 RoboFit "机器人时尚界的 Roblox × Shopify" 定位 — 实时 3D 试衣间、设计师市场（70% 收益分成）、AI 设计助手与社区生态。

## 关于占位图片 Placeholder Images

为保证项目"开箱即跑"且不依赖外部生成式 AI 服务的不确定性，全站约 30 处图片位均使用统一的 `<PlaceholderImage />` 组件渲染 —— 每一张占位图都会清晰标注：

- 内容描述（中/英文）
- 建议尺寸（如 `1920 × 1080`）
- 建议文件名（如 `hero-main.webp`）
- 风格提示词方向（用于后续 AI 生图或实拍指导）

### 替换为真实图片的方法

只需将对应位置的：

```jsx
<PlaceholderImage labelZh="..." labelEn="..." size="1920 × 1080" filename="hero-main.webp" tone="blue" ratio="aspect-[16/9]" />
```

替换为：

```jsx
<img src="/images/hero-main.webp" alt="..." className="aspect-[16/9] w-full rounded-2xl object-cover" />
```

并将对应素材文件放入 `public/images/` 目录即可。占位图组件中标注的"建议文件名 / 建议尺寸 / 风格提示"均可直接作为生图 prompt 或采购拍摄素材的指引（推荐以 Tesla Optimus 作为机器人原型进行渲染，与全站定位保持一致）。

## 双语切换 Bilingual Toggle

右上角"中 / EN"按钮可一键切换全站语言，默认中文。文案通过 `useLanguage()` 提供的 `T(zh, en)` helper 内联维护在各组件中，便于审校与维护。

## 注意事项 Notes

- 本项目为**纯前端演示**：所有交互状态（语言、3D 配置、表单、保存的搭配方案等）均通过 React `useState` 管理，**未使用** `localStorage` / `sessionStorage` 或任何后端服务，刷新页面会重置为初始状态。
- 联系表单、"保存搭配"等功能均为前端校验与摘要展示演示，未连接真实的邮件 / 下单后端。
- 所有产品 / 机器人渲染图均为带说明的占位视觉，替换指南见上文。

---

© 2026 RoboWear International Ltd. — 总部：美国·洛杉矶 ｜ 中国·成都 ｜ 中国·香港
