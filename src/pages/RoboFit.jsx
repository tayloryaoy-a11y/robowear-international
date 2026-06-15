import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { loadAvatar } from '../three/avatarLoader.js'
import { loadRobotModel } from '../three/robotLoader.js'
import { useLanguage } from '../context/LanguageContext.jsx'

// 真人 avatar 模型地址（Ready Player Me 等导出的 .glb）。
// 留空时回退到内置机器人占位模型；填入后自动加载真人模型用于深度定制。
const AVATAR_URL = '/models/avatar.glb'
// 统一落地高度与目标身高（机器人 / 真人共用，保证双脚落在地面网格、取景一致）
const FLOOR_Y = -2.0
const TARGET_HEIGHT = 3.4

// ---- 机甲套装：由 Meshy 生成、本地 gltf-transform 优化后的 5+ 套整身模型，支持一键换装 ----
// 每套为独立 GLB（单网格实体），切换时整体替换预览主体；颜色 / 材质工艺在套装之上实时叠加。
const SUITES = [
  { id: 'optimus', url: '/models/robot-optimus.glb', nameZh: '经典原型', nameEn: 'Classic Prototype', subZh: '均衡仿生 · 全能基准', subEn: 'Balanced humanoid baseline', tone: 'silver' },
  { id: 'combat', url: '/models/suites/suite-combat.glb', nameZh: '重装战甲', nameEn: 'Heavy Combat', subZh: '厚重装甲 · 力量型机身', subEn: 'Reinforced plating, power frame', tone: 'electric' },
  { id: 'ceramic', url: '/models/suites/suite-ceramic.glb', nameZh: '陶瓷流线', nameEn: 'Ceramic Aero', subZh: '光洁陶瓷 · 空气动力外形', subEn: 'Glossy ceramic, aero contour', tone: 'cyber' },
  { id: 'stealth', url: '/models/suites/suite-stealth.glb', nameZh: '碳纤隐袭', nameEn: 'Carbon Stealth', subZh: '碳纤维 · 低可视消光装甲', subEn: 'Carbon-fiber matte stealth shell', tone: 'silver' },
  { id: 'royal', url: '/models/suites/suite-royal.glb', nameZh: '皇家礼甲', nameEn: 'Royal Ceremonial', subZh: '繁饰镀金 · 典礼骑士造型', subEn: 'Ornate gilded ceremonial knight', tone: 'rose' },
  { id: 'exo', url: '/models/suites/suite-exo.glb', nameZh: '工业外骨骼', nameEn: 'Industrial Exo', subZh: '机能外骨骼 · 重工质感', subEn: 'Mechanical exo, heavy-industry feel', tone: 'electric' }
]
const DEFAULT_SUITE_ID = 'optimus'

// 自动适配：按包围盒缩放到统一身高，双脚落在地面网格上，水平居中（机器人 / 真人 / 套装共用）
function fitModelToFloor(model) {
  const box = new THREE.Box3().setFromObject(model)
  const size = new THREE.Vector3()
  const center = new THREE.Vector3()
  box.getSize(size)
  box.getCenter(center)
  const scale = size.y > 0 ? TARGET_HEIGHT / size.y : 1
  model.scale.setScalar(scale)
  model.position.x = -center.x * scale
  model.position.z = -center.z * scale
  model.position.y = FLOOR_Y - box.min.y * scale
}
import Reveal from '../components/Reveal.jsx'
import {
  createRobotGroup,
  buildHairStyle,
  MATERIAL_STYLE_PRESETS,
  MASK_PRESETS,
  ROBOT_SCALE
} from '../three/robotBuilder.js'
import {
  IconRobotSilhouette,
  IconApparelTag,
  IconMaskFace,
  IconHairWisp,
  IconBackpack,
  IconSneaker,
  IconSwatchOff
} from '../components/icons.jsx'

// ============================================================
// 配置数据 — 全部为纯前端常量，所有选择状态均通过 React useState
// 管理，不读写 localStorage / sessionStorage 等浏览器持久化存储
// ============================================================

const ROBOTS = [
  { id: 'optimus', nameZh: 'Tesla Optimus', nameEn: 'Tesla Optimus', subZh: '紧凑均衡 · 全能基准体型', subEn: 'Balanced, compact baseline frame' },
  { id: 'figure', nameZh: 'Figure 03', nameEn: 'Figure 03', subZh: '修长流线 · 服务场景首选', subEn: 'Slender silhouette built for service roles' },
  { id: 'iron', nameZh: '小鹏 Iron', nameEn: 'XPeng Iron', subZh: '宽肩高大 · 力量型机身', subEn: 'Broad-shouldered, power-oriented frame' }
]

// 机型切换卡片中的轮廓剪影尺寸：用宽高比直观传达体型差异（修长 / 均衡 / 宽厚）
const ROBOT_ICON_SIZE = {
  optimus: { w: 20, h: 42 },
  figure: { w: 16, h: 44 },
  iron: { w: 25, h: 46 }
}

const SERIES = [
  { id: 'home', nameZh: '家居系列', nameEn: 'Home Series', subZh: '柔软亲肤，日常陪伴首选', subEn: 'Soft & cozy for everyday companionship', price: 199, tone: 'silver' },
  { id: 'professional', nameZh: '职业系列', nameEn: 'Professional Series', subZh: '挺括利落，办公服务场景', subEn: 'Sharp tailoring for work & service roles', price: 599, tone: 'electric', badgeZh: '人气推荐', badgeEn: 'Most popular' },
  { id: 'couture', nameZh: '高定系列', nameEn: 'Haute Couture', subZh: '设计师联名，限量定制', subEn: 'Limited designer collabs, made to order', price: 2000, tone: 'rose' },
  { id: 'collab', nameZh: '联名系列', nameEn: 'Collaboration Series', subZh: 'IP 跨界联名，彰显个性', subEn: 'IP crossover drops with bold attitude', price: 499, tone: 'cyber' }
]

const COLORS = [
  { id: 'electric', hex: '#2DE2FF', nameZh: '电光蓝', nameEn: 'Electric Blue' },
  { id: 'cyber', hex: '#7C5CFF', nameZh: '赛博紫', nameEn: 'Cyber Violet' },
  { id: 'carbon', hex: '#1B1C20', nameZh: '碳黑', nameEn: 'Carbon Black' },
  { id: 'silver', hex: '#C8CCD4', nameZh: '金属银', nameEn: 'Metal Silver' },
  { id: 'crimson', hex: '#FF4D6D', nameZh: '绯红', nameEn: 'Crimson Red' },
  { id: 'jade', hex: '#34D399', nameZh: '翡翠绿', nameEn: 'Jade Green' },
  { id: 'sunset', hex: '#FF8A4C', nameZh: '日落橙', nameEn: 'Sunset Orange' },
  { id: 'pearl', hex: '#F2F4F7', nameZh: '珍珠白', nameEn: 'Pearl White' }
]

const MATERIAL_STYLES = [
  { id: 'smooth', nameZh: '光滑面料', nameEn: 'Smooth', subZh: '低粗糙度 · 细腻光泽', subEn: 'Low roughness, refined sheen', addon: 0, swatch: 'bg-gradient-to-br from-white/85 via-white/35 to-white/10' },
  { id: 'matte', nameZh: '磨砂哑光', nameEn: 'Matte / Frosted', subZh: '高粗糙度 · 低调质感', subEn: 'High roughness, understated finish', addon: 0, swatch: 'bg-gradient-to-br from-white/30 via-white/12 to-white/[0.03]' },
  { id: 'metal', nameZh: '金属质感', nameEn: 'Metallic', subZh: '高金属度 · 工业气息', subEn: 'High metalness, industrial edge', addon: 150, swatch: 'bg-[linear-gradient(135deg,#f4f6f9_0%,#9aa3b2_38%,#eef1f5_58%,#7b8494_100%)]' },
  { id: 'leather', nameZh: '皮革质感', nameEn: 'Leather', subZh: '复合涂层 · 醇厚质地', subEn: 'Layered coating, rich texture', addon: 300, swatch: 'bg-gradient-to-br from-amber-200/70 via-amber-700/50 to-amber-950/60' }
]

const MASKS = [
  { id: 'none', nameZh: '不佩戴', nameEn: 'None', price: 0, tone: 'silver' },
  { id: 'tech-minimal', nameZh: '科技极简', nameEn: 'Tech-Minimal', price: 299, tone: 'electric' },
  { id: 'realistic', nameZh: '超写实', nameEn: 'Hyper-Realistic', price: 1500, tone: 'rose' },
  { id: 'anime', nameZh: '动漫风', nameEn: 'Anime', price: 399, tone: 'cyber' }
]

const HAIRS = [
  { id: 'none', nameZh: '不佩戴', nameEn: 'None', price: 0, tone: 'silver' },
  { id: 'short', nameZh: '短发', nameEn: 'Short', price: 99, tone: 'electric' },
  { id: 'long', nameZh: '长发', nameEn: 'Long', price: 199, tone: 'rose' },
  { id: 'curly', nameZh: '卷发', nameEn: 'Curly', price: 249, tone: 'cyber' }
]

const ACCESSORIES = [
  { id: 'backpack', nameZh: '机能背包', nameEn: 'Utility Backpack', price: 89 },
  { id: 'shoes', nameZh: '运动鞋履', nameEn: 'Performance Shoes', price: 129 }
]

// ---- 真人 avatar 深度定制：肤色 / 发色 / 捏脸（仅在加载真人模型后启用） ----
const SKIN_TONES = [
  { id: 'porcelain', hex: '#F3D9C6', nameZh: '瓷白', nameEn: 'Porcelain' },
  { id: 'fair', hex: '#EAC3A6', nameZh: '白皙', nameEn: 'Fair' },
  { id: 'natural', hex: '#D6A483', nameZh: '自然', nameEn: 'Natural' },
  { id: 'warm', hex: '#C0865E', nameZh: '小麦', nameEn: 'Warm' },
  { id: 'tan', hex: '#9C6240', nameZh: '古铜', nameEn: 'Tan' },
  { id: 'deep', hex: '#6E3F28', nameZh: '深棕', nameEn: 'Deep' }
]

const HAIR_COLORS = [
  { id: 'black', hex: '#1A1614', nameZh: '乌黑', nameEn: 'Black' },
  { id: 'brown', hex: '#5A3A22', nameZh: '棕色', nameEn: 'Brown' },
  { id: 'blonde', hex: '#D9B36A', nameZh: '金棕', nameEn: 'Blonde' },
  { id: 'chestnut', hex: '#8C4A2F', nameZh: '栗红', nameEn: 'Chestnut' },
  { id: 'platinum', hex: '#D8D4CC', nameZh: '铂金', nameEn: 'Platinum' },
  { id: 'lavender', hex: '#B49BE0', nameZh: '雾紫', nameEn: 'Lavender' },
  { id: 'azure', hex: '#5AA9E6', nameZh: '天蓝', nameEn: 'Azure' },
  { id: 'rose', hex: '#E68FB0', nameZh: '樱粉', nameEn: 'Rose' }
]

// 捏脸控件：每项驱动一个或多个 ARKit morph target（取值 0~1），左右对称的项同时驱动 L/R
const FACE_MORPHS = [
  { id: 'smile', nameZh: '微笑', nameEn: 'Smile', targets: ['mouthSmileLeft', 'mouthSmileRight'] },
  { id: 'pucker', nameZh: '嘟嘴', nameEn: 'Pucker', targets: ['mouthPucker'] },
  { id: 'jawOpen', nameZh: '张嘴', nameEn: 'Jaw Open', targets: ['jawOpen'] },
  { id: 'eyeWide', nameZh: '睁大眼', nameEn: 'Wide Eyes', targets: ['eyeWideLeft', 'eyeWideRight'] },
  { id: 'browUp', nameZh: '挑眉', nameEn: 'Brow Raise', targets: ['browInnerUp', 'browOuterUpLeft', 'browOuterUpRight'] },
  { id: 'cheek', nameZh: '鼓腮', nameEn: 'Cheek Puff', targets: ['cheekPuff'] }
]

const formatPrice = (n) => `$${n.toLocaleString('en-US')}`

// ============================================================
// 展示型子组件
// ============================================================

// 选配卡片配色基调（与品牌色板呼应，用于区分不同分组/选项的视觉个性）
const TONE_STYLES = {
  electric: {
    active: 'border-electric-400/70 bg-electric-500/[0.09] shadow-[0_0_26px_-6px_rgba(45,226,255,0.4)]',
    icon: 'border-electric-400/40 bg-electric-500/10 text-electric-300',
    dot: 'bg-electric-400',
    text: 'text-electric-300'
  },
  cyber: {
    active: 'border-cyber-400/70 bg-cyber-500/[0.09] shadow-[0_0_26px_-6px_rgba(124,92,255,0.4)]',
    icon: 'border-cyber-400/40 bg-cyber-500/10 text-cyber-300',
    dot: 'bg-cyber-400',
    text: 'text-cyber-300'
  },
  rose: {
    active: 'border-pink-400/60 bg-pink-400/[0.08] shadow-[0_0_26px_-6px_rgba(255,92,168,0.4)]',
    icon: 'border-pink-400/35 bg-pink-400/10 text-pink-300',
    dot: 'bg-pink-400',
    text: 'text-pink-300'
  },
  silver: {
    active: 'border-white/45 bg-white/[0.08] shadow-[0_0_22px_-6px_rgba(255,255,255,0.28)]',
    icon: 'border-white/30 bg-white/[0.06] text-white/70',
    dot: 'bg-white/80',
    text: 'text-white/80'
  }
}

// Tesla 选配页风格的可视化选项卡片：图标徽标 + 标题/说明 + 价格 + 选中态对勾
function VisualOptionCard({ active, onClick, Icon, tone = 'electric', title, subtitle, price, badge }) {
  const t = TONE_STYLES[tone] ?? TONE_STYLES.electric
  return (
    <button
      onClick={onClick}
      className={`group relative flex h-full flex-col gap-3 rounded-2xl border p-4 text-left transition-all duration-300 ${
        active ? t.active : 'border-white/10 bg-white/[0.02] hover:border-white/25 hover:bg-white/[0.04]'
      }`}
    >
      {badge && (
        <span className="absolute right-3 top-3 rounded-full bg-gradient-to-r from-electric-500 to-cyber-500 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-carbon-900">
          {badge}
        </span>
      )}
      <span className={`flex h-11 w-11 items-center justify-center rounded-xl border transition-colors duration-300 ${active ? t.icon : 'border-white/12 bg-white/[0.03] text-white/40'}`}>
        <Icon width={20} height={20} />
      </span>
      <span className="min-w-0 flex-1">
        <span className={`block text-sm font-semibold ${active ? 'text-white' : 'text-white/80'}`}>{title}</span>
        {subtitle && <span className="mt-0.5 block text-xs leading-snug text-white/40">{subtitle}</span>}
      </span>
      <span className={`font-mono text-xs ${active ? t.text : 'text-white/35'}`}>{price}</span>
      {active && (
        <span className={`absolute right-3 bottom-3 flex h-5 w-5 items-center justify-center rounded-full ${t.dot}`}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#0A0A0B" strokeWidth="3"><path d="M5 12l4 4L19 6" /></svg>
        </span>
      )}
    </button>
  )
}

// 选配分组容器：步骤序号 + 标题 + 提示语，统一包裹各类可视化选择网格
function OptionGroup({ index, title, hint, children }) {
  return (
    <div>
      <div className="mb-3.5 flex items-baseline justify-between gap-3">
        <h3 className="flex items-center gap-2.5 font-display text-sm font-semibold text-white/85">
          <span className="flex h-6 w-6 items-center justify-center rounded-full border border-white/15 font-mono text-[11px] text-white/45">{index}</span>
          {title}
        </h3>
        {hint && <span className="text-[11px] text-white/35">{hint}</span>}
      </div>
      {children}
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 py-1">
      <span className="text-white/40">{label}</span>
      <span className="text-right font-medium text-white/85">{value}</span>
    </div>
  )
}

function SaveLookModal({ look, onClose, T, lang }) {
  if (!look) return null

  const shareText = [
    `RoboFit™ ${T('搭配方案', 'Look')}`,
    `${T('机型', 'Model')}: ${T(look.robot.nameZh, look.robot.nameEn)}`,
    `${T('系列', 'Series')}: ${T(look.series.nameZh, look.series.nameEn)} · ${T('颜色', 'Color')}: ${T(look.color.nameZh, look.color.nameEn)}`,
    `${T('材质', 'Material')}: ${T(look.material.nameZh, look.material.nameEn)} · ${T('面具', 'Mask')}: ${T(look.mask.nameZh, look.mask.nameEn)} · ${T('假发', 'Hair')}: ${T(look.hair.nameZh, look.hair.nameEn)}`,
    `${T('预估总价', 'Estimated total')}: ${formatPrice(look.total)}`
  ].join('\n')

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-carbon-900/80 px-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-electric-500/30 bg-carbon-800 p-6 shadow-[0_0_70px_rgba(45,226,255,0.16)] sm:p-8"
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full border border-white/15 text-white/50 transition-colors hover:border-white/30 hover:text-white"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>

        <span className="inline-flex items-center gap-1.5 rounded-full border border-electric-500/40 bg-electric-500/10 px-3 py-1 text-xs font-semibold text-electric-300">
          <span className="h-1.5 w-1.5 rounded-full bg-electric-400 animate-pulseGlow" />
          {T('已生成搭配摘要', 'Look summary generated')}
        </span>

        <h3 className="mt-4 font-display text-2xl font-bold text-white">{T('我的专属机器人造型', 'My Custom Robot Look')}</h3>
        <p className="mt-1.5 text-sm text-white/45">
          {T('以下是你的搭配方案摘要，可复制分享给好友或带去线下门店核对。', 'Here is a summary of your build — copy it to share with friends or bring to a showroom.')}
        </p>

        <div className="mt-5 space-y-1.5 rounded-2xl border border-white/10 bg-carbon-900/60 p-5 text-sm">
          <Row label={T('机型', 'Model')} value={T(look.robot.nameZh, look.robot.nameEn)} />
          <Row label={T('服装系列', 'Apparel series')} value={T(look.series.nameZh, look.series.nameEn)} />
          <Row
            label={T('主色调', 'Primary color')}
            value={
              <span className="inline-flex items-center gap-2">
                <span className="h-3.5 w-3.5 rounded-full border border-white/20" style={{ backgroundColor: look.color.hex }} />
                {T(look.color.nameZh, look.color.nameEn)}
              </span>
            }
          />
          <Row label={T('材质工艺', 'Material finish')} value={T(look.material.nameZh, look.material.nameEn)} />
          <Row label={T('面具', 'Mask')} value={T(look.mask.nameZh, look.mask.nameEn)} />
          <Row label={T('假发', 'Hair')} value={T(look.hair.nameZh, look.hair.nameEn)} />
          <Row
            label={T('配件', 'Accessories')}
            value={look.accessories.length ? look.accessories.map((a) => T(a.nameZh, a.nameEn)).join(' · ') : T('无', 'None')}
          />
          <div className="my-2 h-px bg-white/10" />
          <Row label={T('预估总价', 'Estimated total')} value={<span className="font-display text-lg text-electric-300">{formatPrice(look.total)}</span>} />
        </div>

        <p className="mt-4 text-xs leading-relaxed text-white/35">
          {T(
            '这是纯前端演示摘要：当前页面所有状态仅保存在浏览器内存中（不写入本地存储），刷新页面后将会重置。下方文本可直接复制分享。',
            'This is a front-end-only demo summary: all state lives in memory for this session (nothing is written to local storage) and resets on refresh. Copy the text below to share.'
          )}
        </p>
        <pre className="mt-3 whitespace-pre-wrap rounded-xl border border-white/10 bg-black/30 p-4 font-mono text-[11px] leading-relaxed text-white/50">{shareText}</pre>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            onClick={onClose}
            className="flex-1 rounded-full border border-white/15 px-5 py-2.5 text-center text-sm font-semibold text-white/70 transition-colors hover:border-white/30 hover:text-white"
          >
            {T('继续设计', 'Keep designing')}
          </button>
          <Link
            to="/contact"
            onClick={onClose}
            className="flex-1 rounded-full bg-gradient-to-r from-electric-500 to-cyber-500 px-5 py-2.5 text-center text-sm font-semibold text-carbon-900 transition-all duration-300 hover:shadow-[0_0_28px_rgba(45,226,255,0.4)]"
          >
            {T('联系顾问下单', 'Talk to an advisor')}
          </Link>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// 主组件
// ============================================================

export default function RoboFit() {
  const { T, lang } = useLanguage()

  // ---- 配置状态：全部使用 React useState 管理，禁止任何浏览器持久化存储 ----
  const [robotId, setRobotId] = useState('optimus')
  const [seriesId, setSeriesId] = useState('professional')
  const [colorId, setColorId] = useState('electric')
  const [materialId, setMaterialId] = useState('smooth')
  const [maskId, setMaskId] = useState('tech-minimal')
  const [hairId, setHairId] = useState('none')
  const [accessoryState, setAccessoryState] = useState({ backpack: false, shoes: false })
  const [savedLook, setSavedLook] = useState(null)
  // 预览主体模式：'robot' 展示实体机器人模型，'human' 展示真人 avatar
  const [viewMode, setViewMode] = useState('robot')
  const [robotReady, setRobotReady] = useState(false)
  // 当前穿着的机甲套装（一键换装）：切换时整体替换预览主体模型
  const [suiteId, setSuiteId] = useState(DEFAULT_SUITE_ID)
  // 套装换装加载中标记（纯 UI 反馈，useState 管理，无任何持久化存储）
  const [suiteLoading, setSuiteLoading] = useState(false)
  // 真人 avatar 深度定制状态（仅在加载真人模型成功后启用对应面板）
  const [avatarReady, setAvatarReady] = useState(false)
  const [skinToneId, setSkinToneId] = useState('natural')
  const [skinRough, setSkinRough] = useState(0.62)
  const [hairColorId, setHairColorId] = useState('lavender')
  const [faceMorphs, setFaceMorphs] = useState(() => Object.fromEntries(FACE_MORPHS.map((m) => [m.id, 0])))
  // 仅用于左侧预览区的"实时渲染中"视觉反馈脉冲（纯 UI 状态，同样通过 useState 管理）
  const [isRendering, setIsRendering] = useState(false)

  const mountRef = useRef(null)
  const sceneRef = useRef(null)

  // ---------------- Three.js 场景初始化（仅挂载时执行一次） ----------------
  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const scene = new THREE.Scene()
    scene.background = new THREE.Color('#0A0A0B')
    scene.fog = new THREE.FogExp2('#0A0A0B', 0.05)

    const camera = new THREE.PerspectiveCamera(36, mount.clientWidth / mount.clientHeight, 0.1, 100)
    camera.position.set(2.7, 1.55, 4.6)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(mount.clientWidth, mount.clientHeight)
    mount.appendChild(renderer.domElement)

    // 灯光：主光源 + 冷暖双色补光 + 环境光，营造科技摄影棚氛围
    const keyLight = new THREE.DirectionalLight('#ffffff', 1.6)
    keyLight.position.set(4, 6, 5)
    scene.add(keyLight)

    const rimLight = new THREE.PointLight('#2DE2FF', 13, 24)
    rimLight.position.set(-4.5, 3.5, -3)
    scene.add(rimLight)

    const fillLight = new THREE.PointLight('#7C5CFF', 6, 18)
    fillLight.position.set(3, -1, -4)
    scene.add(fillLight)

    const ambientLight = new THREE.AmbientLight('#3B4049', 1.5)
    scene.add(ambientLight)

    // 地面网格 + 发光底座光环
    const grid = new THREE.GridHelper(9, 18, '#2DE2FF', '#1C1D22')
    grid.position.y = -2.01
    grid.material.transparent = true
    grid.material.opacity = 0.32
    scene.add(grid)

    const ringGeo = new THREE.RingGeometry(1.05, 1.22, 48)
    const ringMat = new THREE.MeshBasicMaterial({ color: '#2DE2FF', transparent: true, opacity: 0.4, side: THREE.DoubleSide })
    const ring = new THREE.Mesh(ringGeo, ringMat)
    ring.rotation.x = -Math.PI / 2
    ring.position.y = -1.998
    scene.add(ring)

    // 人形机器人模型（由 Box / Cylinder / Sphere 拼接，无 CapsuleGeometry）
    const { group, materials, parts } = createRobotGroup()
    scene.add(group)

    // 实体机器人套装模型由独立的 suiteId effect 负责加载 / 换装（见下方），
    // 此处仅初始化场景；首套套装会在场景就绪后由该 effect 加载。

    // 真人 avatar：加载后默认隐藏，切到「真人」模式时再显示
    if (AVATAR_URL) {
      loadAvatar(AVATAR_URL)
        .then((handle) => {
          fitModelToFloor(handle.model)
          handle.model.visible = false
          scene.add(handle.model)
          ring.visible = false
          if (sceneRef.current) sceneRef.current.avatar = handle
          setAvatarReady(true)
        })
        .catch(() => {})
    }

    // OrbitControls：拖拽旋转 + 滚轮缩放，限制极角避免穿地
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.07
    controls.minDistance = 2.6
    controls.maxDistance = 7.5
    controls.minPolarAngle = Math.PI * 0.18
    controls.maxPolarAngle = Math.PI * 0.86
    controls.target.set(0, 0.5, 0)
    controls.update()

    sceneRef.current = { scene, camera, renderer, controls, group, materials, parts, ring }

    let frameId
    const clock = new THREE.Clock()
    const animate = () => {
      frameId = requestAnimationFrame(animate)
      const t = clock.getElapsedTime()
      group.position.y = -2.0 + Math.sin(t * 0.9) * 0.035 // 轻微悬浮呼吸感
      ring.material.opacity = 0.3 + Math.sin(t * 1.6) * 0.12
      controls.update()
      renderer.render(scene, camera)
    }
    animate()

    const resizeObserver = new ResizeObserver(() => {
      const w = mount.clientWidth
      const h = mount.clientHeight
      if (w === 0 || h === 0) return
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    })
    resizeObserver.observe(mount)

    return () => {
      cancelAnimationFrame(frameId)
      resizeObserver.disconnect()
      controls.dispose()
      ringGeo.dispose()
      ringMat.dispose()
      scene.traverse((obj) => {
        if (obj.isMesh) {
          obj.geometry?.dispose()
          if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose())
          else obj.material?.dispose()
        }
      })
      renderer.dispose()
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement)
      sceneRef.current = null
    }
  }, [])

  // ---------------- 机甲套装一键换装：切换 suiteId 时整体替换预览主体模型 ----------------
  useEffect(() => {
    const ctx = sceneRef.current
    if (!ctx) return
    const suite = SUITES.find((s) => s.id === suiteId)
    if (!suite) return
    let cancelled = false
    setSuiteLoading(true)
    setRobotReady(false)

    loadRobotModel(suite.url)
      .then((handle) => {
        if (cancelled) {
          handle.dispose?.()
          return
        }
        // 移除并释放上一套，避免显存泄漏
        const prev = ctx.robotModel
        if (prev) {
          ctx.scene.remove(prev.model)
          prev.dispose?.()
        }
        fitModelToFloor(handle.model)
        handle.model.visible = viewMode === 'robot'
        ctx.scene.add(handle.model)
        ctx.group.visible = false
        ctx.ring.visible = false
        ctx.robotModel = handle
        // 立即把当前配色 / 工艺叠加到新套装，避免换装瞬间闪回默认灰
        const color = COLORS.find((c) => c.id === colorId)
        const preset = MATERIAL_STYLE_PRESETS[materialId]
        if (color) handle.setColor(color.hex)
        if (preset) handle.setFinish({ roughness: preset.roughness, metalness: preset.metalness })
        setRobotReady(true)
        setSuiteLoading(false)
      })
      .catch(() => {
        if (!cancelled) setSuiteLoading(false)
      })

    return () => {
      cancelled = true
    }
    // colorId / materialId 故意不入依赖：换装只由 suiteId 触发，配色由独立 effect 持续驱动
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [suiteId])

  // ---------------- 服装颜色 + 材质风格：实时映射到 3D 模型材质 ----------------
  useEffect(() => {
    const ctx = sceneRef.current
    if (!ctx) return
    const color = COLORS.find((c) => c.id === colorId)
    const preset = MATERIAL_STYLE_PRESETS[materialId]
    ctx.materials.clothingMaterial.color.set(color.hex)
    ctx.materials.clothingMaterial.roughness = preset.roughness
    ctx.materials.clothingMaterial.metalness = preset.metalness
  }, [colorId, materialId])

  // ---------------- 面具：实时切换可见性与外观 ----------------
  useEffect(() => {
    const ctx = sceneRef.current
    if (!ctx) return
    const preset = MASK_PRESETS[maskId]
    ctx.parts.mask.visible = preset.visible
    if (preset.visible) {
      ctx.materials.maskMaterial.color.set(preset.color)
      ctx.materials.maskMaterial.emissive.set(preset.emissive)
      ctx.materials.maskMaterial.emissiveIntensity = preset.emissiveIntensity
      ctx.materials.maskMaterial.roughness = preset.roughness
      ctx.materials.maskMaterial.metalness = preset.metalness
    }
  }, [maskId])

  // ---------------- 假发：清空旧几何并按样式重建 ----------------
  useEffect(() => {
    const ctx = sceneRef.current
    if (!ctx) return
    const { hairGroup } = ctx.parts
    while (hairGroup.children.length) {
      const child = hairGroup.children.pop()
      child.traverse((node) => node.geometry?.dispose())
    }
    hairGroup.add(buildHairStyle(hairId, ctx.materials.hairMaterial))
  }, [hairId])

  // ---------------- 配件：背包可见性 + 鞋履材质替换 ----------------
  useEffect(() => {
    const ctx = sceneRef.current
    if (!ctx) return
    ctx.parts.backpack.visible = accessoryState.backpack
    const footMaterial = accessoryState.shoes ? ctx.materials.shoesMaterial : ctx.materials.chassisMaterial
    ctx.parts.footL.material = footMaterial
    ctx.parts.footR.material = footMaterial
  }, [accessoryState])

  // ---------------- 机型切换：调整缩放比例直观体现体型差异 ----------------
  useEffect(() => {
    const ctx = sceneRef.current
    if (!ctx) return
    const scale = ROBOT_SCALE[robotId] ?? 1
    ctx.group.scale.setScalar(scale)
  }, [robotId])

  // ---------------- 预览模式切换：机器人 / 真人 互斥显示 + 取景对准胸口 ----------------
  useEffect(() => {
    const ctx = sceneRef.current
    if (!ctx) return
    if (ctx.robotModel) ctx.robotModel.model.visible = viewMode === 'robot'
    if (ctx.avatar) ctx.avatar.model.visible = viewMode === 'human'
    ctx.controls.target.set(0, FLOOR_Y + TARGET_HEIGHT * 0.58, 0)
    ctx.controls.update()
  }, [viewMode, robotReady, avatarReady])

  // ---------------- 实体机器人：整体配色 + 表面工艺实时驱动 ----------------
  useEffect(() => {
    const rm = sceneRef.current?.robotModel
    if (!rm) return
    const color = COLORS.find((c) => c.id === colorId)
    const preset = MATERIAL_STYLE_PRESETS[materialId]
    if (color) rm.setColor(color.hex)
    if (preset) rm.setFinish({ roughness: preset.roughness, metalness: preset.metalness })
  }, [robotReady, colorId, materialId])

  // ---------------- 真人 avatar：肤色 + 皮肤质感实时驱动 ----------------
  useEffect(() => {
    const avatar = sceneRef.current?.avatar
    if (!avatar) return
    const tone = SKIN_TONES.find((t) => t.id === skinToneId)
    if (tone) avatar.setSkinTone(tone.hex, 0.5)
    avatar.setSkinFinish({ roughness: skinRough })
  }, [avatarReady, skinToneId, skinRough])

  // ---------------- 真人 avatar：发色实时驱动 ----------------
  useEffect(() => {
    const avatar = sceneRef.current?.avatar
    if (!avatar) return
    const hc = HAIR_COLORS.find((c) => c.id === hairColorId)
    if (hc) avatar.setHairColor(hc.hex)
  }, [avatarReady, hairColorId])

  // ---------------- 真人 avatar：捏脸 morph 实时驱动 ----------------
  useEffect(() => {
    const avatar = sceneRef.current?.avatar
    if (!avatar) return
    FACE_MORPHS.forEach((m) => {
      const v = faceMorphs[m.id] ?? 0
      m.targets.forEach((name) => avatar.setMorph(name, v))
    })
  }, [avatarReady, faceMorphs])

  // ---------------- 选配变更时的"实时渲染中"提示脉冲（纯视觉反馈，状态同样经由 useState 管理） ----------------
  useEffect(() => {
    setIsRendering(true)
    const timer = window.setTimeout(() => setIsRendering(false), 620)
    return () => window.clearTimeout(timer)
  }, [robotId, seriesId, colorId, materialId, maskId, hairId, accessoryState, skinToneId, skinRough, hairColorId, faceMorphs])

  // ---------------- 实时价格计算引擎 ----------------
  const priceBreakdown = useMemo(() => {
    const series = SERIES.find((s) => s.id === seriesId)
    const material = MATERIAL_STYLES.find((m) => m.id === materialId)
    const mask = MASKS.find((m) => m.id === maskId)
    const hair = HAIRS.find((h) => h.id === hairId)

    const items = [
      { key: 'series', labelZh: `服装系列 · ${series.nameZh}`, labelEn: `Apparel · ${series.nameEn}`, price: series.price },
      { key: 'material', labelZh: `${material.nameZh}工艺加成`, labelEn: `${material.nameEn} finish`, price: material.addon },
      { key: 'mask', labelZh: `面具 · ${mask.nameZh}`, labelEn: `Mask · ${mask.nameEn}`, price: mask.price },
      { key: 'hair', labelZh: `假发 · ${hair.nameZh}`, labelEn: `Hair · ${hair.nameEn}`, price: hair.price }
    ]
    ACCESSORIES.forEach((acc) => {
      if (accessoryState[acc.id]) {
        items.push({ key: acc.id, labelZh: `配件 · ${acc.nameZh}`, labelEn: `Accessory · ${acc.nameEn}`, price: acc.price })
      }
    })

    const visibleItems = items.filter((item) => item.price > 0 || item.key === 'series')
    const total = items.reduce((sum, item) => sum + item.price, 0)
    return { items: visibleItems, total }
  }, [seriesId, materialId, maskId, hairId, accessoryState])

  const activeRobot = ROBOTS.find((r) => r.id === robotId)
  const activeColor = COLORS.find((c) => c.id === colorId)
  const activeSkinTone = SKIN_TONES.find((t) => t.id === skinToneId) ?? SKIN_TONES[0]
  const activeHairColor = HAIR_COLORS.find((c) => c.id === hairColorId) ?? HAIR_COLORS[0]

  const handleSaveLook = () => {
    setSavedLook({
      robot: activeRobot,
      color: activeColor,
      series: SERIES.find((s) => s.id === seriesId),
      material: MATERIAL_STYLES.find((m) => m.id === materialId),
      mask: MASKS.find((m) => m.id === maskId),
      hair: HAIRS.find((h) => h.id === hairId),
      accessories: ACCESSORIES.filter((a) => accessoryState[a.id]),
      total: priceBreakdown.total
    })
  }

  const platformPillars = [
    {
      titleZh: '实时 3D 试衣间',
      titleEn: 'Real-Time 3D Fitting Room',
      descZh: '所见即所得：拖拽旋转、缩放查看任意角度，颜色与材质所有改动均实时渲染到模型表面。',
      descEn: 'What you see is what you get — drag to rotate, scroll to zoom, and every color or material change renders onto the model instantly.',
      tone: 'electric'
    },
    {
      titleZh: '设计师市场 · 20% 分成',
      titleEn: 'Designer Marketplace · 20% Revenue Share',
      descZh: '独立设计师可上传原创外观方案，每完成一笔交易即可获得 20% 收益分成 — 这是属于创作者的时尚经济。',
      descEn: 'Independent designers publish original looks and keep 20% of every sale — a creator-first fashion economy built into the platform.',
      tone: 'cyber'
    },
    {
      titleZh: 'AI 设计助手 + 社区',
      titleEn: 'AI Design Assistant + Community',
      descZh: 'AI 助手可根据关键词、场景或情绪生成风格建议；社区支持浏览、收藏与"二次创作"他人方案，持续生长。',
      descEn: 'An AI assistant turns keywords, scenes, or moods into style suggestions; the community can browse, favorite, and remix shared looks.',
      tone: 'rose'
    }
  ]

  const flowSteps = [
    { step: '01', titleZh: '选择机型', titleEn: 'Pick a model', descZh: 'Optimus / Figure 03 / 小鹏 Iron 三大主流机型任选其一', descEn: 'Choose Optimus, Figure 03, or XPeng Iron as your base frame' },
    { step: '02', titleZh: '自由搭配', titleEn: 'Customize freely', descZh: '系列、配色、材质、面具、假发与配件实时组合', descEn: 'Mix series, color, material, mask, hair and accessories in real time' },
    { step: '03', titleZh: '保存与分享', titleEn: 'Save & share', descZh: '生成搭配摘要，复制分享给好友，或联系顾问完成咨询', descEn: 'Generate a look summary, share it, or talk to an advisor to order' }
  ]

  const toneClass = {
    electric: 'border-electric-500/30 bg-electric-500/[0.06] text-electric-300',
    cyber: 'border-cyber-500/30 bg-cyber-500/[0.07] text-cyber-300',
    rose: 'border-pink-400/25 bg-pink-400/[0.06] text-pink-300'
  }

  return (
    <div className="bg-carbon-900">
      {/* ---------------- Hero ---------------- */}
      <section className="relative overflow-hidden pb-14 pt-32 sm:pt-36">
        <div className="absolute inset-0 -z-10 bg-hero-glow opacity-70" />
        <div className="absolute inset-0 -z-10 bg-tech-grid opacity-[0.06]" />
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-electric-500/30 bg-electric-500/10 px-4 py-1.5 text-xs font-semibold tracking-wide text-electric-300">
              <span className="h-1.5 w-1.5 rounded-full bg-electric-400 animate-pulseGlow" />
              {T('核心功能 · 3D 定制平台', 'Flagship Feature · 3D Customization Platform')}
            </span>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="mt-6 max-w-6xl font-display text-3xl font-bold leading-[1.12] tracking-tight sm:text-4xl lg:text-5xl">
              {T('RoboFit', 'RoboFit')}
              <span className="text-gradient">™</span>
              {T(' 机器人时尚界的', ' — The ')}
              <span className="text-gradient">{T('Roblox × Shopify', 'Roblox × Shopify')}</span>
              {T('', ' of Robot Fashion')}
            </h1>
          </Reveal>
          <Reveal delay={160}>
            <p className="mt-6 max-w-3xl text-base leading-relaxed text-white/55 sm:text-lg">
              {T(
                'RoboFit 是 RoboWear 旗下的实时 3D 虚拟试衣与创作平台：像 Roblox 一样自由创作与分享，像 Shopify 一样轻松交易与变现。在这里，每个人都能为自己的机器人设计独一无二的"皮肤"。',
                'RoboFit is RoboWear’s real-time 3D virtual fitting and creation platform — create and share as freely as on Roblox, trade and monetize as easily as on Shopify. Here, anyone can design a one-of-a-kind “skin” for their robot.'
              )}
            </p>
          </Reveal>
          <Reveal delay={240}>
            <div className="mt-8 flex flex-wrap items-center gap-4 text-sm text-white/40">
              <span className="inline-flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2DE2FF" strokeWidth="2"><path d="M5 12l4 4L19 6" /></svg>
                {T('拖拽旋转 · 滚轮缩放', 'Drag to rotate · Scroll to zoom')}
              </span>
              <span className="inline-flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2DE2FF" strokeWidth="2"><path d="M5 12l4 4L19 6" /></svg>
                {T('实时价格计算', 'Real-time price calculator')}
              </span>
              <span className="inline-flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2DE2FF" strokeWidth="2"><path d="M5 12l4 4L19 6" /></svg>
                {T('一键保存搭配摘要', 'One-click look summaries')}
              </span>
            </div>
          </Reveal>

          <Reveal delay={300}>
            <div className="group relative mt-10 overflow-hidden rounded-3xl border border-white/10">
              <img
                src="/images/robowear/robofit-hero.webp"
                alt={T('左侧实拍机器人，右侧 3D 数字孪生试衣系统界面', 'A real robot on the left, paired with the 3D digital-twin fitting interface on the right')}
                loading="lazy"
                className="aspect-[16/7] w-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-carbon-900/70 via-transparent to-transparent" />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------------- 配置器主体（参考 Tesla Model Y 选配页：左侧实时预览常驻吸顶，右侧卡片化动态选配） ---------------- */}
      <section className="relative pb-20">
        <div className="mx-auto max-w-[1560px] px-5 sm:px-8 lg:px-10">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-4 border-b border-white/10 pb-6">
              <div>
                <span className="text-xs font-semibold uppercase tracking-widest2 text-electric-400">
                  {T('搭配工坊 · 所见即所得', 'Build studio · what you see is what you get')}
                </span>
                <h2 className="mt-2 font-display text-2xl font-bold text-white sm:text-[28px]">
                  {T('像选配一台特斯拉一样，搭建你的机器人', 'Configure your robot the way you’d configure a Tesla')}
                </h2>
              </div>
              <p className="max-w-md text-sm leading-relaxed text-white/40">
                {T(
                  '右侧每一次点选都会实时渲染到左侧 3D 预览上 — 机型、系列、配色、材质、面具、假发与配件，全部支持动态切换、即时比价，逐项展开挑选。',
                  'Every tap on the right renders instantly on the 3D preview to the left — model, series, color, material, mask, hair and accessories all switch live with instant price comparison, laid out step by step.'
                )}
              </p>
            </div>
          </Reveal>

          <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.12fr)_minmax(0,1fr)] xl:gap-12">
            {/* 左：3D 实时预览（吸顶常驻，模拟 Tesla 选配页车辆预览区随滚动保持可见的体验） */}
            <div className="lg:sticky lg:top-24 lg:self-start">
              <Reveal direction="left">
                {/* 预览主体切换：实体机器人 / 真人 avatar 两种模式，各自对应不同的定制面板 */}
                <div className="mb-4 grid grid-cols-2 gap-2.5">
                  {[
                    { id: 'robot', nameZh: '机器人', nameEn: 'Robot', subZh: 'Optimus 实体模型 · 整体配色', subEn: 'Optimus body model · whole-body color', ready: robotReady },
                    { id: 'human', nameZh: '真人', nameEn: 'Human', subZh: '肤色 / 五官 / 发色深度定制', subEn: 'Deep skin / face / hair customization', ready: avatarReady }
                  ].map((m) => {
                    const isActive = viewMode === m.id
                    return (
                      <button
                        key={m.id}
                        onClick={() => setViewMode(m.id)}
                        disabled={!m.ready}
                        className={`group flex flex-col items-center gap-1 rounded-2xl border px-3 py-3 text-center transition-all duration-300 ${
                          isActive
                            ? 'border-electric-400/70 bg-electric-500/[0.08] shadow-[0_0_24px_-6px_rgba(45,226,255,0.32)]'
                            : m.ready
                              ? 'border-white/10 bg-white/[0.02] hover:border-white/25'
                              : 'cursor-not-allowed border-white/5 bg-white/[0.01] opacity-50'
                        }`}
                      >
                        <span className={`block text-[14px] font-semibold ${isActive ? 'text-electric-200' : 'text-white/75'}`}>
                          {T(m.nameZh, m.nameEn)}
                          {!m.ready && <span className="ml-1 text-[10px] font-normal text-white/35">{T('· 加载中', '· loading')}</span>}
                        </span>
                        <span className="block w-full truncate text-[10px] leading-tight text-white/35">{T(m.subZh, m.subEn)}</span>
                      </button>
                    )
                  })}
                </div>

                <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-carbon-800/70 to-carbon-900 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.7)]">
                  <div ref={mountRef} className="h-[420px] w-full sm:h-[480px] lg:h-[560px] xl:h-[600px]" />

                  <div className="pointer-events-none absolute left-5 top-5 flex items-center gap-2 rounded-full border border-white/12 bg-carbon-900/60 px-3 py-1.5 text-[11px] text-white/55 backdrop-blur-md">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#2DE2FF" strokeWidth="2"><path d="M3 12a9 9 0 1018 0 9 9 0 00-18 0z" /><path d="M3 12h18M12 3a14 14 0 010 18 14 14 0 010-18z" /></svg>
                    {T('拖拽旋转视角 · 滚轮缩放距离', 'Drag to orbit · Scroll to zoom')}
                  </div>

                  <div
                    className={`pointer-events-none absolute right-5 top-5 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] backdrop-blur-md transition-all duration-300 ${
                      isRendering ? 'border-electric-400/50 bg-electric-500/15 text-electric-200' : 'border-white/12 bg-carbon-900/60 text-white/45'
                    }`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${isRendering ? 'bg-electric-400 animate-pulseGlow' : 'bg-white/30'}`} />
                    {isRendering
                      ? T('实时渲染中…', 'Rendering live…')
                      : viewMode === 'human'
                        ? T('真人模型 · 实时定制', 'Real human model · Live')
                        : T('Optimus 实体模型 · 实时配色', 'Optimus body model · Live color')}
                  </div>

                  <div className="pointer-events-none absolute inset-x-5 bottom-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-carbon-900/55 px-4 py-3 text-[11px] text-white/45 backdrop-blur-md">
                    <span>{viewMode === 'human'
                      ? T('真人 3D 模型已接入，肤色 / 五官 / 发色均可实时深度定制', 'Real human 3D model loaded — skin, facial features and hair are deeply customizable in real time')
                      : T('Optimus 实体 3D 模型已接入，可整体配色与切换表面工艺，拖拽旋转查看任意角度', 'Optimus body 3D model loaded — recolor the whole body and switch surface finish, drag to inspect any angle')}</span>
                    <span className="inline-flex items-center gap-1.5 text-electric-300">
                      <span className="h-1.5 w-1.5 rounded-full bg-electric-400 animate-pulseGlow" />
                      Three.js · WebGL
                    </span>
                  </div>
                </div>

                {/* 预估总价 + 保存搭配 CTA：吸附在预览区下方，随滚动常驻可见（参考 Tesla 选配页底部价格条） */}
                <div className="mt-5 flex flex-col gap-4 rounded-2xl border border-electric-500/25 bg-gradient-to-r from-electric-500/[0.07] via-cyber-500/[0.04] to-transparent p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-[11px] uppercase tracking-widest2 text-white/35">{T('预估总价 · 当前搭配', 'Estimated total · current build')}</p>
                    <p className="mt-1 font-display text-3xl font-bold text-gradient">{formatPrice(priceBreakdown.total)}</p>
                    <p className="mt-1 text-[11px] text-white/30">{T('价格仅供参考演示，不构成最终报价', 'Prices are illustrative only — not a final quote')}</p>
                  </div>
                  <button
                    onClick={handleSaveLook}
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-electric-500 to-cyber-500 px-6 py-3 text-sm font-semibold text-carbon-900 shadow-[0_0_28px_rgba(45,226,255,0.35)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_40px_rgba(45,226,255,0.5)]"
                  >
                    {T('保存我的搭配', 'Save my look')}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                  </button>
                </div>
              </Reveal>
            </div>

            {/* 右：动态选配卡片网格（Tesla 选配页风格 — 大卡片 / 色板 / 材质预览，逐项分组展开挑选） */}
            <Reveal direction="right" delay={80}>
              <div className="space-y-9">
                {viewMode === 'human' && avatarReady && (
                  <div className="space-y-7 rounded-3xl border border-electric-500/25 bg-gradient-to-b from-electric-500/[0.06] to-transparent p-5 sm:p-6">
                    <div>
                      <span className="inline-flex items-center gap-2 rounded-full border border-electric-400/40 bg-electric-500/10 px-3 py-1 text-[11px] font-semibold tracking-wide text-electric-200">
                        {T('真人深度定制', 'Deep Customization')}
                      </span>
                      <p className="mt-2.5 text-[12px] leading-relaxed text-white/45">
                        {T('基于真人 3D 模型实时驱动 —— 肤色、皮肤质感、五官表情与发色，所见即所得。',
                          'Driven live on a real human 3D model — skin tone, skin finish, facial expression and hair color, all in real time.')}
                      </p>
                    </div>

                    <OptionGroup index="S1" title={T('肤色', 'Skin Tone')} hint={T(activeSkinTone.nameZh, activeSkinTone.nameEn)}>
                      <div className="flex flex-wrap gap-3.5">
                        {SKIN_TONES.map((t) => (
                          <button key={t.id} onClick={() => setSkinToneId(t.id)} title={T(t.nameZh, t.nameEn)} aria-label={T(t.nameZh, t.nameEn)} className="group flex flex-col items-center gap-1.5">
                            <span
                              className={`relative flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                                skinToneId === t.id ? 'scale-110 border-electric-400 shadow-[0_0_18px_rgba(45,226,255,0.4)]' : 'border-white/15 group-hover:scale-105 group-hover:border-white/40'
                              }`}
                              style={{ backgroundColor: t.hex }}
                            />
                            <span className={`text-[10px] transition-colors duration-300 ${skinToneId === t.id ? 'text-electric-300' : 'text-white/35 group-hover:text-white/55'}`}>{T(t.nameZh, t.nameEn)}</span>
                          </button>
                        ))}
                      </div>
                    </OptionGroup>

                    <div>
                      <div className="mb-2.5 flex items-baseline justify-between">
                        <span className="text-[13px] font-medium text-white/70">{T('皮肤质感', 'Skin Finish')}</span>
                        <span className="font-mono text-[11px] text-white/35">{skinRough <= 0.5 ? T('偏光泽', 'Glossy') : skinRough >= 0.78 ? T('偏哑光', 'Matte') : T('自然', 'Natural')}</span>
                      </div>
                      <input
                        type="range" min="0.3" max="0.95" step="0.01" value={skinRough}
                        onChange={(e) => setSkinRough(parseFloat(e.target.value))}
                        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/15 accent-[#2DE2FF]"
                      />
                      <div className="mt-1 flex justify-between text-[10px] text-white/30">
                        <span>{T('光泽', 'Glossy')}</span>
                        <span>{T('哑光', 'Matte')}</span>
                      </div>
                    </div>

                    <OptionGroup index="S2" title={T('发色', 'Hair Color')} hint={T(activeHairColor.nameZh, activeHairColor.nameEn)}>
                      <div className="flex flex-wrap gap-3.5">
                        {HAIR_COLORS.map((c) => (
                          <button key={c.id} onClick={() => setHairColorId(c.id)} title={T(c.nameZh, c.nameEn)} aria-label={T(c.nameZh, c.nameEn)} className="group flex flex-col items-center gap-1.5">
                            <span
                              className={`relative flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                                hairColorId === c.id ? 'scale-110 border-electric-400 shadow-[0_0_18px_rgba(45,226,255,0.4)]' : 'border-white/15 group-hover:scale-105 group-hover:border-white/40'
                              }`}
                              style={{ backgroundColor: c.hex }}
                            />
                            <span className={`text-[10px] transition-colors duration-300 ${hairColorId === c.id ? 'text-electric-300' : 'text-white/35 group-hover:text-white/55'}`}>{T(c.nameZh, c.nameEn)}</span>
                          </button>
                        ))}
                      </div>
                    </OptionGroup>

                    <OptionGroup index="S3" title={T('捏脸 · 表情', 'Sculpt · Expression')} hint={T('拖动滑块实时变形', 'Drag to morph live')}>
                      <div className="space-y-4">
                        {FACE_MORPHS.map((m) => (
                          <div key={m.id}>
                            <div className="mb-1.5 flex items-baseline justify-between">
                              <span className="text-[13px] text-white/65">{T(m.nameZh, m.nameEn)}</span>
                              <span className="font-mono text-[11px] text-white/35">{Math.round((faceMorphs[m.id] ?? 0) * 100)}%</span>
                            </div>
                            <input
                              type="range" min="0" max="1" step="0.01" value={faceMorphs[m.id] ?? 0}
                              onChange={(e) => setFaceMorphs((prev) => ({ ...prev, [m.id]: parseFloat(e.target.value) }))}
                              className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/15 accent-[#2DE2FF]"
                            />
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={() => setFaceMorphs(Object.fromEntries(FACE_MORPHS.map((m) => [m.id, 0])))}
                        className="mt-4 text-[11px] text-white/40 underline-offset-2 transition-colors hover:text-electric-300 hover:underline"
                      >
                        {T('重置表情', 'Reset expression')}
                      </button>
                    </OptionGroup>
                  </div>
                )}

                {viewMode === 'robot' && (
                  <OptionGroup
                    index="00"
                    title={T('机甲套装 · 一键换装', 'Mech Suite · One-tap Swap')}
                    hint={suiteLoading ? T('换装加载中…', 'Swapping…') : T('5+ 套整身造型可选', '5+ full-body looks')}
                  >
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {SUITES.map((s) => (
                        <VisualOptionCard
                          key={s.id}
                          active={suiteId === s.id}
                          onClick={() => setSuiteId(s.id)}
                          Icon={IconRobotSilhouette}
                          tone={s.tone}
                          title={T(s.nameZh, s.nameEn)}
                          subtitle={T(s.subZh, s.subEn)}
                          price={
                            suiteId === s.id
                              ? suiteLoading
                                ? T('换装中…', 'Swapping…')
                                : T('当前穿着', 'Now worn')
                              : T('点击换装', 'Tap to wear')
                          }
                        />
                      ))}
                    </div>
                    <p className="mt-3 text-[11px] leading-relaxed text-white/35">
                      {T(
                        '每套为独立整身实体模型，可一键换装；配色与材质工艺会实时叠加到当前套装之上。',
                        'Each suite is a standalone full-body model — swap in one tap; color and material finish layer onto the worn suite in real time.'
                      )}
                    </p>
                  </OptionGroup>
                )}

                <OptionGroup index="01" title={T('服装系列', 'Apparel Series')} hint={T('决定搭配基础价格', 'Sets your base price')}>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {SERIES.map((s) => (
                      <VisualOptionCard
                        key={s.id}
                        active={seriesId === s.id}
                        onClick={() => setSeriesId(s.id)}
                        Icon={IconApparelTag}
                        tone={s.tone}
                        title={T(s.nameZh, s.nameEn)}
                        subtitle={T(s.subZh, s.subEn)}
                        price={formatPrice(s.price)}
                        badge={s.badgeZh ? T(s.badgeZh, s.badgeEn) : null}
                      />
                    ))}
                  </div>
                </OptionGroup>

                <OptionGroup index="02" title={T('配色', 'Color')} hint={T(activeColor.nameZh, activeColor.nameEn)}>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                    <div className="flex flex-wrap gap-4">
                      {COLORS.map((c) => (
                        <button key={c.id} onClick={() => setColorId(c.id)} title={T(c.nameZh, c.nameEn)} aria-label={T(c.nameZh, c.nameEn)} className="group flex flex-col items-center gap-2">
                          <span
                            className={`relative flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                              colorId === c.id
                                ? 'scale-110 border-electric-400 shadow-[0_0_22px_rgba(45,226,255,0.4)]'
                                : 'border-white/15 group-hover:scale-105 group-hover:border-white/40'
                            }`}
                            style={{ backgroundColor: c.hex }}
                          >
                            {colorId === c.id && (
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c.id === 'pearl' || c.id === 'silver' ? '#0A0A0B' : '#fff'} strokeWidth="2.6">
                                <path d="M5 12l4 4L19 6" />
                              </svg>
                            )}
                          </span>
                          <span className={`text-[11px] transition-colors duration-300 ${colorId === c.id ? 'text-electric-300' : 'text-white/35 group-hover:text-white/55'}`}>
                            {T(c.nameZh, c.nameEn)}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </OptionGroup>

                <OptionGroup index="03" title={T('材质风格', 'Material Style')} hint={T('影响表面反光与质感', 'Shapes surface finish & sheen')}>
                  <div className="grid grid-cols-2 gap-3">
                    {MATERIAL_STYLES.map((m) => {
                      const isActive = materialId === m.id
                      return (
                        <button
                          key={m.id}
                          onClick={() => setMaterialId(m.id)}
                          className={`group relative overflow-hidden rounded-2xl border p-4 text-left transition-all duration-300 ${
                            isActive
                              ? 'border-electric-400/70 bg-electric-500/[0.08] shadow-[0_0_24px_-6px_rgba(45,226,255,0.32)]'
                              : 'border-white/10 bg-white/[0.02] hover:border-white/25'
                          }`}
                        >
                          <span className={`block h-14 w-full rounded-xl border border-white/10 ${m.swatch}`} />
                          <span className="mt-3 block text-sm font-semibold text-white/85">{T(m.nameZh, m.nameEn)}</span>
                          <span className="mt-0.5 block text-xs leading-snug text-white/40">{T(m.subZh, m.subEn)}</span>
                          <span className={`mt-2 block font-mono text-xs ${isActive ? 'text-electric-300' : 'text-white/35'}`}>
                            {m.addon > 0 ? `+${formatPrice(m.addon)}` : T('已包含', 'Included')}
                          </span>
                          {isActive && (
                            <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-electric-400">
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#0A0A0B" strokeWidth="3"><path d="M5 12l4 4L19 6" /></svg>
                            </span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </OptionGroup>

                <OptionGroup index="04" title={T('面具', 'Mask')} hint={T('可选 · 塑造表情个性', 'Optional · gives your robot a face')}>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {MASKS.map((m) => (
                      <VisualOptionCard
                        key={m.id}
                        active={maskId === m.id}
                        onClick={() => setMaskId(m.id)}
                        Icon={m.id === 'none' ? IconSwatchOff : IconMaskFace}
                        tone={m.tone}
                        title={T(m.nameZh, m.nameEn)}
                        price={m.price > 0 ? `+${formatPrice(m.price)}` : T('免费', 'Free')}
                      />
                    ))}
                  </div>
                </OptionGroup>

                <OptionGroup index="05" title={T('假发', 'Hair')} hint={T('可选 · 个性化造型', 'Optional · personalize the look')}>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {HAIRS.map((h) => (
                      <VisualOptionCard
                        key={h.id}
                        active={hairId === h.id}
                        onClick={() => setHairId(h.id)}
                        Icon={h.id === 'none' ? IconSwatchOff : IconHairWisp}
                        tone={h.tone}
                        title={T(h.nameZh, h.nameEn)}
                        price={h.price > 0 ? `+${formatPrice(h.price)}` : T('免费', 'Free')}
                      />
                    ))}
                  </div>
                </OptionGroup>

                <OptionGroup index="06" title={T('配件', 'Accessories')} hint={T('可多选叠加', 'Mix & match freely')}>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {ACCESSORIES.map((a) => {
                      const Icon = a.id === 'backpack' ? IconBackpack : IconSneaker
                      const isActive = accessoryState[a.id]
                      return (
                        <button
                          key={a.id}
                          onClick={() => setAccessoryState((prev) => ({ ...prev, [a.id]: !prev[a.id] }))}
                          aria-pressed={isActive}
                          className={`group relative flex items-center gap-4 rounded-2xl border p-4 text-left transition-all duration-300 ${
                            isActive
                              ? 'border-electric-400/70 bg-electric-500/[0.08] shadow-[0_0_24px_-6px_rgba(45,226,255,0.3)]'
                              : 'border-white/10 bg-white/[0.02] hover:border-white/25'
                          }`}
                        >
                          <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border transition-colors duration-300 ${isActive ? 'border-electric-400/40 bg-electric-500/10 text-electric-300' : 'border-white/12 bg-white/[0.03] text-white/40'}`}>
                            <Icon width={22} height={22} />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className={`block text-sm font-semibold ${isActive ? 'text-white' : 'text-white/80'}`}>{T(a.nameZh, a.nameEn)}</span>
                            <span className="mt-0.5 block font-mono text-xs text-white/35">+{formatPrice(a.price)}</span>
                          </span>
                          <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-300 ${isActive ? 'border-electric-400 bg-electric-400' : 'border-white/20 bg-transparent group-hover:border-white/40'}`}>
                            {isActive && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#0A0A0B" strokeWidth="3"><path d="M5 12l4 4L19 6" /></svg>}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </OptionGroup>

                {/* 报价明细：与左侧吸顶总价呼应，展开列出每一项加成 */}
                <div className="rounded-2xl border border-white/10 bg-carbon-800/40 p-5">
                  <h3 className="font-display text-xs font-semibold uppercase tracking-widest2 text-white/60">{T('报价明细', 'Price breakdown')}</h3>
                  <div className="mt-3 space-y-1.5 text-sm">
                    {priceBreakdown.items.map((item) => (
                      <div key={item.key} className="flex items-center justify-between text-white/50">
                        <span>{T(item.labelZh, item.labelEn)}</span>
                        <span className="font-mono">{item.price > 0 ? `+${formatPrice(item.price)}` : T('含', 'incl.')}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
                    <span className="text-sm font-medium text-white/70">{T('预估总价', 'Estimated total')}</span>
                    <span className="font-display text-2xl font-bold text-gradient">{formatPrice(priceBreakdown.total)}</span>
                  </div>
                  <p className="mt-3 text-center text-[11px] text-white/30">
                    {T('价格仅供参考演示，不构成最终报价 · 状态仅保存于当前会话内存', 'Prices are illustrative only · all state lives in this session’s memory')}
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ---------------- 平台深度介绍 ---------------- */}
      <section className="border-t border-white/10 bg-gradient-to-b from-carbon-900 to-carbon-800/30 py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-cyber-500/30 bg-cyber-500/10 px-4 py-1.5 text-xs font-semibold tracking-wide text-cyber-300">
              RoboFit™ {T('生态系统', 'Ecosystem')}
            </span>
            <h2 className="mt-5 max-w-2xl font-display text-3xl font-bold leading-snug sm:text-4xl">
              {T('不只是一个配置器，', 'Not just a configurator —')}
              <br />
              {T('而是一个正在生长的时尚经济体', 'a fashion economy that keeps growing')}
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/50 sm:text-base">
              {T(
                'RoboFit 把"创作—交易—社区"三件事放进同一个浏览器页面：任何人都能设计、发布、购买与改造机器人外观，平台与创作者共同分享增长红利。',
                'RoboFit brings creation, commerce, and community into a single browser tab — anyone can design, publish, buy, and remix robot looks, while the platform and its creators grow together.'
              )}
            </p>
          </Reveal>

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {platformPillars.map((pillar, idx) => (
              <Reveal key={pillar.titleZh} delay={idx * 100}>
                <div className={`hover-lift h-full rounded-2xl border p-6 ${toneClass[pillar.tone]}`}>
                  <span className="font-display text-2xl font-bold">0{idx + 1}</span>
                  <h3 className="mt-4 font-display text-lg font-semibold text-white">{T(pillar.titleZh, pillar.titleEn)}</h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-white/55">{T(pillar.descZh, pillar.descEn)}</p>
                </div>
              </Reveal>
            ))}
          </div>

          {/* 设计师 / 社区实景 */}
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {[
              {
                filename: 'robofit-community-designer.webp',
                labelZh: '设计师与机器人在未来服装工作室协作打版设计',
                labelEn: 'A designer collaborating with a robot in a future-forward apparel design studio',
                capZh: '设计师工作室',
                capEn: 'Designer Studio'
              },
              {
                filename: 'robofit-community-group.webp',
                labelZh: '多台机器人穿着不同 RoboWear 服装合影，社区感与品牌大秀感',
                labelEn: 'A group of robots in different RoboWear looks — community spirit meets runway energy',
                capZh: '社区穿搭合影',
                capEn: 'Community Lineup'
              }
            ].map((item, idx) => (
              <Reveal key={item.filename} delay={idx * 100}>
                <div className="group relative overflow-hidden rounded-2xl border border-white/10">
                  <img
                    src={`/images/robowear/${item.filename}`}
                    alt={T(item.labelZh, item.labelEn)}
                    loading="lazy"
                    className="aspect-[3/2] w-full object-cover transition-transform duration-700 group-hover:scale-[1.05]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-carbon-900/85 via-carbon-900/5 to-transparent" />
                  <p className="absolute bottom-4 left-4 text-sm font-semibold text-white">{T(item.capZh, item.capEn)}</p>
                </div>
              </Reveal>
            ))}
          </div>

          {/* 三步流程 */}
          <Reveal delay={120}>
            <div className="mt-16 rounded-3xl border border-white/10 bg-carbon-800/40 p-8 sm:p-10">
              <h3 className="font-display text-lg font-semibold text-white">{T('三步，完成你的第一套搭配', 'Three steps to your first look')}</h3>
              <div className="mt-7 grid gap-6 sm:grid-cols-3">
                {flowSteps.map((step) => (
                  <div key={step.step} className="relative">
                    <span className="font-display text-3xl font-bold text-white/15">{step.step}</span>
                    <h4 className="mt-2 text-base font-semibold text-white">{T(step.titleZh, step.titleEn)}</h4>
                    <p className="mt-1.5 text-sm leading-relaxed text-white/45">{T(step.descZh, step.descEn)}</p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={160}>
            <div className="mt-10 flex flex-col items-center justify-between gap-6 rounded-3xl border border-white/10 bg-gradient-to-r from-electric-500/10 via-transparent to-cyber-500/10 p-8 text-center sm:flex-row sm:text-left">
              <div>
                <h3 className="font-display text-xl font-semibold text-white">
                  {T('是设计师？加入 RoboFit 创作者计划', 'A designer? Join the RoboFit Creator Program')}
                </h3>
                <p className="mt-2 max-w-xl text-sm text-white/50">
                  {T('上传你的原创外观方案，每完成一笔交易即可获得 20% 收益分成。', 'Publish your original looks and keep 20% of revenue from every sale.')}
                </p>
              </div>
              <Link
                to="/contact"
                className="inline-flex shrink-0 items-center gap-2 rounded-full bg-gradient-to-r from-electric-500 to-cyber-500 px-6 py-3 text-sm font-semibold text-carbon-900 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_32px_rgba(45,226,255,0.4)]"
              >
                {T('申请成为创作者', 'Apply as a creator')}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <SaveLookModal look={savedLook} onClose={() => setSavedLook(null)} T={T} lang={lang} />
    </div>
  )
}
