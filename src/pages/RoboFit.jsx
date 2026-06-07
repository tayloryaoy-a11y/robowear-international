import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { useLanguage } from '../context/LanguageContext.jsx'
import Reveal from '../components/Reveal.jsx'
import {
  createRobotGroup,
  buildHairStyle,
  MATERIAL_STYLE_PRESETS,
  MASK_PRESETS,
  ROBOT_SCALE
} from '../three/robotBuilder.js'

// ============================================================
// 配置数据 — 全部为纯前端常量，所有选择状态均通过 React useState
// 管理，不读写 localStorage / sessionStorage 等浏览器持久化存储
// ============================================================

const ROBOTS = [
  { id: 'optimus', nameZh: 'Tesla Optimus', nameEn: 'Tesla Optimus', subZh: '紧凑均衡 · 全能基准体型', subEn: 'Balanced, compact baseline frame' },
  { id: 'figure', nameZh: 'Figure 03', nameEn: 'Figure 03', subZh: '修长流线 · 服务场景首选', subEn: 'Slender silhouette built for service roles' },
  { id: 'iron', nameZh: '小鹏 Iron', nameEn: 'XPeng Iron', subZh: '宽肩高大 · 力量型机身', subEn: 'Broad-shouldered, power-oriented frame' }
]

const SERIES = [
  { id: 'home', nameZh: '家居系列', nameEn: 'Home Series', subZh: '柔软亲肤，日常陪伴首选', subEn: 'Soft & cozy for everyday companionship', price: 199 },
  { id: 'professional', nameZh: '职业系列', nameEn: 'Professional Series', subZh: '挺括利落，办公服务场景', subEn: 'Sharp tailoring for work & service roles', price: 599 },
  { id: 'couture', nameZh: '高定系列', nameEn: 'Haute Couture', subZh: '设计师联名，限量定制', subEn: 'Limited designer collabs, made to order', price: 2000 },
  { id: 'collab', nameZh: '联名系列', nameEn: 'Collaboration Series', subZh: 'IP 跨界联名，彰显个性', subEn: 'IP crossover drops with bold attitude', price: 499 }
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
  { id: 'smooth', nameZh: '光滑面料', nameEn: 'Smooth', subZh: '低粗糙度 · 细腻光泽', subEn: 'Low roughness, refined sheen', addon: 0 },
  { id: 'matte', nameZh: '磨砂哑光', nameEn: 'Matte / Frosted', subZh: '高粗糙度 · 低调质感', subEn: 'High roughness, understated finish', addon: 0 },
  { id: 'metal', nameZh: '金属质感', nameEn: 'Metallic', subZh: '高金属度 · 工业气息', subEn: 'High metalness, industrial edge', addon: 150 },
  { id: 'leather', nameZh: '皮革质感', nameEn: 'Leather', subZh: '复合涂层 · 醇厚质地', subEn: 'Layered coating, rich texture', addon: 300 }
]

const MASKS = [
  { id: 'none', nameZh: '不佩戴', nameEn: 'None', price: 0 },
  { id: 'tech-minimal', nameZh: '科技极简', nameEn: 'Tech-Minimal', price: 299 },
  { id: 'realistic', nameZh: '超写实', nameEn: 'Hyper-Realistic', price: 1500 },
  { id: 'anime', nameZh: '动漫风', nameEn: 'Anime', price: 399 }
]

const HAIRS = [
  { id: 'none', nameZh: '不佩戴', nameEn: 'None', price: 0 },
  { id: 'short', nameZh: '短发', nameEn: 'Short', price: 99 },
  { id: 'long', nameZh: '长发', nameEn: 'Long', price: 199 },
  { id: 'curly', nameZh: '卷发', nameEn: 'Curly', price: 249 }
]

const ACCESSORIES = [
  { id: 'backpack', nameZh: '机能背包', nameEn: 'Utility Backpack', price: 89 },
  { id: 'shoes', nameZh: '运动鞋履', nameEn: 'Performance Shoes', price: 129 }
]

const formatPrice = (n) => `$${n.toLocaleString('en-US')}`

// ============================================================
// 展示型子组件
// ============================================================

function ConfigSection({ title, hint, children }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-carbon-800/40 p-5">
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <h3 className="font-display text-xs font-semibold uppercase tracking-widest2 text-white/75">{title}</h3>
        {hint && <span className="text-[11px] text-white/35">{hint}</span>}
      </div>
      <div className="space-y-2.5">{children}</div>
    </div>
  )
}

function OptionRow({ active, onClick, title, subtitle, price }) {
  return (
    <button
      onClick={onClick}
      className={`group flex w-full items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left transition-all duration-300 ${
        active
          ? 'border-electric-400/70 bg-electric-500/10 shadow-[0_0_22px_rgba(45,226,255,0.16)]'
          : 'border-white/10 bg-white/[0.02] hover:border-white/25 hover:bg-white/[0.04]'
      }`}
    >
      <span className="min-w-0">
        <span className={`block truncate text-sm font-semibold ${active ? 'text-electric-200' : 'text-white/85'}`}>{title}</span>
        {subtitle && <span className="mt-0.5 block truncate text-xs text-white/40">{subtitle}</span>}
      </span>
      <span className={`shrink-0 font-mono text-xs ${active ? 'text-electric-300' : 'text-white/35'}`}>{price}</span>
    </button>
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
      titleZh: '设计师市场 · 70% 分成',
      titleEn: 'Designer Marketplace · 70% Revenue Share',
      descZh: '独立设计师可上传原创外观方案，每完成一笔交易即可获得 70% 收益分成 — 这是属于创作者的时尚经济。',
      descEn: 'Independent designers publish original looks and keep 70% of every sale — a creator-first fashion economy built into the platform.',
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
    { step: '02', titleZh: '自由搭配', titleEn: 'Customize freely', descZh: '系列、配色、材质、面具、假发与配件实时组合，所见即所得', descEn: 'Mix series, color, material, mask, hair and accessories in real time' },
    { step: '03', titleZh: '保存与分享', titleEn: 'Save & share', descZh: '生成搭配摘要，复制分享给好友，或联系顾问完成下单咨询', descEn: 'Generate a look summary, share it, or talk to an advisor to order' }
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
            <h1 className="mt-6 max-w-4xl font-display text-4xl font-bold leading-[1.12] tracking-tight sm:text-5xl lg:text-6xl">
              {T('RoboFit', 'RoboFit')}
              <span className="text-gradient">™</span>
              <br />
              {T('机器人时尚界的', 'The ')}
              <span className="text-gradient">{T('Roblox × Shopify', 'Roblox × Shopify')}</span>
              {T('', ' of robot fashion')}
            </h1>
          </Reveal>
          <Reveal delay={160}>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/55 sm:text-lg">
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
        </div>
      </section>

      {/* ---------------- 配置器主体 ---------------- */}
      <section className="relative pb-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          {/* 机型切换 */}
          <Reveal>
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs font-semibold uppercase tracking-widest2 text-white/35">{T('选择机型', 'Select model')}</span>
              <div className="flex flex-wrap gap-2.5">
                {ROBOTS.map((robot) => (
                  <button
                    key={robot.id}
                    onClick={() => setRobotId(robot.id)}
                    className={`group rounded-full border px-4 py-2 text-left transition-all duration-300 ${
                      robotId === robot.id
                        ? 'border-electric-400/70 bg-electric-500/10 shadow-[0_0_22px_rgba(45,226,255,0.18)]'
                        : 'border-white/12 bg-white/[0.02] hover:border-white/30'
                    }`}
                  >
                    <span className={`block text-sm font-semibold ${robotId === robot.id ? 'text-electric-200' : 'text-white/80'}`}>
                      {T(robot.nameZh, robot.nameEn)}
                    </span>
                    <span className="block text-[11px] text-white/35">{T(robot.subZh, robot.subEn)}</span>
                  </button>
                ))}
              </div>
            </div>
          </Reveal>

          <div className="mt-7 grid grid-cols-1 gap-6 lg:grid-cols-[1.32fr_1fr]">
            {/* 左：3D 视窗 */}
            <Reveal direction="left" className="relative">
              <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-carbon-800/70 to-carbon-900 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.7)]">
                <div ref={mountRef} className="h-[440px] w-full sm:h-[520px] lg:h-[640px]" />

                <div className="pointer-events-none absolute left-5 top-5 flex items-center gap-2 rounded-full border border-white/12 bg-carbon-900/60 px-3 py-1.5 text-[11px] text-white/55 backdrop-blur-md">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#2DE2FF" strokeWidth="2"><path d="M3 12a9 9 0 1018 0 9 9 0 00-18 0z" /><path d="M3 12h18M12 3a14 14 0 010 18 14 14 0 010-18z" /></svg>
                  {T('拖拽旋转视角 · 滚轮缩放距离', 'Drag to orbit · Scroll to zoom')}
                </div>

                <div className="pointer-events-none absolute right-5 top-5 rounded-full border border-white/12 bg-carbon-900/60 px-3 py-1.5 text-[11px] text-white/45 backdrop-blur-md">
                  {T(`${activeRobot.nameZh} · 占位渲染`, `${activeRobot.nameEn} · Placeholder render`)}
                </div>

                <div className="pointer-events-none absolute inset-x-5 bottom-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-carbon-900/55 px-4 py-3 text-[11px] text-white/45 backdrop-blur-md">
                  <span>{T('当前模型由几何基本体实时拼接渲染，便于后续替换为高精度扫描模型', 'Model assembled live from primitive geometries — ready to be swapped for a high-fidelity scan later')}</span>
                  <span className="inline-flex items-center gap-1.5 text-electric-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-electric-400 animate-pulseGlow" />
                    Three.js · WebGL
                  </span>
                </div>
              </div>
            </Reveal>

            {/* 右：配置面板 */}
            <Reveal direction="right" delay={80}>
              <div className="flex flex-col gap-5">
                <ConfigSection title={T('服装系列', 'Apparel Series')} hint={T('决定基础价格', 'Sets base price')}>
                  {SERIES.map((s) => (
                    <OptionRow
                      key={s.id}
                      active={seriesId === s.id}
                      onClick={() => setSeriesId(s.id)}
                      title={T(s.nameZh, s.nameEn)}
                      subtitle={T(s.subZh, s.subEn)}
                      price={formatPrice(s.price)}
                    />
                  ))}
                </ConfigSection>

                <ConfigSection title={T('配色', 'Color')} hint={T(activeColor.nameZh, activeColor.nameEn)}>
                  <div className="grid grid-cols-4 gap-3">
                    {COLORS.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => setColorId(c.id)}
                        title={T(c.nameZh, c.nameEn)}
                        aria-label={T(c.nameZh, c.nameEn)}
                        className={`relative aspect-square rounded-xl border-2 transition-all duration-300 ${
                          colorId === c.id ? 'scale-105 border-electric-400 shadow-[0_0_18px_rgba(45,226,255,0.35)]' : 'border-white/10 hover:border-white/35'
                        }`}
                        style={{ backgroundColor: c.hex }}
                      >
                        {colorId === c.id && (
                          <span className="absolute inset-0 flex items-center justify-center">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c.id === 'pearl' || c.id === 'silver' ? '#0A0A0B' : '#fff'} strokeWidth="2.6">
                              <path d="M5 12l4 4L19 6" />
                            </svg>
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </ConfigSection>

                <ConfigSection title={T('材质风格', 'Material Style')}>
                  {MATERIAL_STYLES.map((m) => (
                    <OptionRow
                      key={m.id}
                      active={materialId === m.id}
                      onClick={() => setMaterialId(m.id)}
                      title={T(m.nameZh, m.nameEn)}
                      subtitle={T(m.subZh, m.subEn)}
                      price={m.addon > 0 ? `+${formatPrice(m.addon)}` : T('included', '含')}
                    />
                  ))}
                </ConfigSection>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <ConfigSection title={T('面具', 'Mask')}>
                    {MASKS.map((m) => (
                      <OptionRow
                        key={m.id}
                        active={maskId === m.id}
                        onClick={() => setMaskId(m.id)}
                        title={T(m.nameZh, m.nameEn)}
                        price={m.price > 0 ? `+${formatPrice(m.price)}` : T('免费', 'Free')}
                      />
                    ))}
                  </ConfigSection>

                  <ConfigSection title={T('假发', 'Hair')}>
                    {HAIRS.map((h) => (
                      <OptionRow
                        key={h.id}
                        active={hairId === h.id}
                        onClick={() => setHairId(h.id)}
                        title={T(h.nameZh, h.nameEn)}
                        price={h.price > 0 ? `+${formatPrice(h.price)}` : T('免费', 'Free')}
                      />
                    ))}
                  </ConfigSection>
                </div>

                <ConfigSection title={T('配件', 'Accessories')} hint={T('可多选', 'Multiple allowed')}>
                  {ACCESSORIES.map((a) => (
                    <label
                      key={a.id}
                      className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 transition-colors duration-300 hover:border-white/25"
                    >
                      <span className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={accessoryState[a.id]}
                          onChange={() => setAccessoryState((prev) => ({ ...prev, [a.id]: !prev[a.id] }))}
                          className="h-4 w-4 rounded border-white/30 bg-transparent accent-electric-400"
                        />
                        <span className="text-sm text-white/80">{T(a.nameZh, a.nameEn)}</span>
                      </span>
                      <span className="font-mono text-xs text-white/40">+{formatPrice(a.price)}</span>
                    </label>
                  ))}
                </ConfigSection>

                {/* 实时价格计算器 */}
                <div className="rounded-2xl border border-electric-500/30 bg-gradient-to-b from-electric-500/[0.07] to-transparent p-5">
                  <h3 className="font-display text-xs font-semibold uppercase tracking-widest2 text-electric-300">
                    {T('实时报价', 'Live Estimate')}
                  </h3>
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
                  <button
                    onClick={handleSaveLook}
                    className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-electric-500 to-cyber-500 px-5 py-3 text-sm font-semibold text-carbon-900 shadow-[0_0_28px_rgba(45,226,255,0.35)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_40px_rgba(45,226,255,0.5)]"
                  >
                    {T('保存我的搭配', 'Save my look')}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                  </button>
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
                  {T('上传你的原创外观方案，每完成一笔交易即可获得 70% 收益分成。', 'Publish your original looks and keep 70% of revenue from every sale.')}
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
