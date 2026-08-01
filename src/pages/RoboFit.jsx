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
  MASK_PRESETS
} from '../three/robotBuilder.js'
import { loadRobotModel } from '../three/robotLoader.js'
import {
  IconApparelTag,
  IconMaskFace,
  IconHairWisp,
  IconBackpack,
  IconSneaker,
  IconSwatchOff
} from '../components/icons.jsx'

// ============================================================
// RoboFit 选配器 — 基于单一标准版 Optimus（分体可拆装人形）的逐部位实时定制
// 所有选择状态均通过 React useState 管理，不读写 localStorage / sessionStorage
// ============================================================

// 镜头局部聚焦：选不同选配板块时，相机平滑对准对应身体局部，凸显"局部放大"效果
const FOCUS = {
  full: { targetY: 0.4, dist: 6.0 },
  torso: { targetY: 0.9, dist: 4.4 },
  head: { targetY: 2.0, dist: 3.1 },
  feet: { targetY: -1.55, dist: 4.2 }
}

// ---- 服装系列：每个系列提供独立场景套装（primary / accent 同步驱动右下角 3D 缩览） ----
const SERIES = [
  {
    id: 'home', nameZh: '家居系列', nameEn: 'Home Series', subZh: '六种生活角色，六套完整方案', subEn: 'Six lifestyles, six complete looks', price: 199, tone: 'silver',
    outfits: [
      { id: 'nursery-care', nameZh: '育儿守护', nameEn: 'Nursery Care', subZh: '安全防护 · 绗缝软甲', subEn: 'Quilted safety layers', primary: '#EDE5D3', accent: '#9FB6C8' },
      { id: 'emotional-companion', nameZh: '心语陪伴', nameEn: 'Emotional Companion', subZh: '情绪陪伴 · 柔软针织', subEn: 'Soft knit companionship', primary: '#A98B93', accent: '#7B7186' },
      { id: 'housekeeping', nameZh: '清洁管家', nameEn: 'Housekeeping', subZh: '家政清洁 · 防污机能', subEn: 'Stain-resistant utility', primary: '#AAB3A0', accent: '#41454A' },
      { id: 'executive-secretary', nameZh: '行政秘书', nameEn: 'Executive Secretary', subZh: '居家办公 · 精裁西装', subEn: 'Tailored home-office support', primary: '#9EA5AE', accent: '#20252E' },
      { id: 'wellness-care', nameZh: '康养照护', nameEn: 'Wellness Care', subZh: '健康照护 · 抗菌面料', subEn: 'Antimicrobial wellness set', primary: '#E8F0EC', accent: '#8FC9BC' },
      { id: 'home-security', nameZh: '居家巡护', nameEn: 'Home Security', subZh: '安防巡护 · 低调机能', subEn: 'Quiet protective utility', primary: '#272A2F', accent: '#D59A43' }
    ]
  },
  {
    id: 'professional', nameZh: '职业系列', nameEn: 'Professional Series', subZh: '六种服务场景，按岗位设计', subEn: 'Six service roles, purpose-built', price: 599, tone: 'electric', badgeZh: '人气推荐', badgeEn: 'Most popular',
    outfits: [
      { id: 'hotel-concierge', nameZh: '酒店礼宾', nameEn: 'Hotel Concierge', subZh: '酒店迎宾 · 现代尾礼服', subEn: 'Modern hospitality tailoring', primary: '#162340', accent: '#C5A66A' },
      { id: 'restaurant-service', nameZh: '餐饮服务', nameEn: 'Restaurant Service', subZh: '餐饮服务 · 折纸围裙', subEn: 'Origami service apron', primary: '#202124', accent: '#E4DDD0' },
      { id: 'ticket-inspector', nameZh: '智慧检票', nameEn: 'Ticket Inspector', subZh: '交通检票 · 模块机能', subEn: 'Modular transit uniform', primary: '#252B34', accent: '#356FE3' },
      { id: 'medical-guide', nameZh: '医疗导诊', nameEn: 'Medical Guide', subZh: '医院导诊 · 亲和洁净', subEn: 'Friendly clinical guidance', primary: '#F0F4F3', accent: '#7FC8C1' },
      { id: 'exhibition-host', nameZh: '展会接待', nameEn: 'Exhibition Host', subZh: '展会接待 · 非对称礼服', subEn: 'Asymmetric exhibition host', primary: '#174DBA', accent: '#B7C2D1' },
      { id: 'retail-advisor', nameZh: '零售顾问', nameEn: 'Retail Advisor', subZh: '零售顾问 · 连体精裁', subEn: 'Tailored retail jumpsuit', primary: '#B68C5F', accent: '#22252A' }
    ]
  },
  {
    id: 'couture', nameZh: '高定系列', nameEn: 'Haute Couture', subZh: '十种材质实验，十种独立廓形', subEn: 'Ten materials, ten distinct silhouettes', price: 2000, tone: 'rose',
    outfits: [
      { id: 'liquid-silver', nameZh: '液态银', nameEn: 'Liquid Silver', subZh: '液态丝缎 · 流体剪裁', subEn: 'Liquid satin · fluid tailoring', primary: '#BFC3C8', accent: '#F0F2F4' },
      { id: 'bamboo-architecture', nameZh: '竹影结构', nameEn: 'Bamboo Architecture', subZh: '生物竹纤维 · 格构塑形', subEn: 'Biofiber lattice construction', primary: '#272622', accent: '#B99B6B' },
      { id: 'lunar-porcelain', nameZh: '月白瓷影', nameEn: 'Lunar Porcelain', subZh: '釉面瓷片 · 月白丝绉', subEn: 'Glazed porcelain · silk crepe', primary: '#EDEDE8', accent: '#6D8FB4' },
      { id: 'obsidian-pleats', nameZh: '黑曜折光', nameEn: 'Obsidian Pleats', subZh: '碳纤欧根纱 · 微褶结构', subEn: 'Carbon organza micro-pleats', primary: '#111216', accent: '#555861' },
      { id: 'aurora-glass', nameZh: '极光薄晶', nameEn: 'Aurora Glass', subZh: '二向色薄晶 · 透明叠层', subEn: 'Dichroic translucent layers', primary: '#9BCFDA', accent: '#9A7BD8' },
      { id: 'vermilion-fold', nameZh: '朱砂折纸', nameEn: 'Vermilion Fold', subZh: '哑光丝缎 · 折纸廓形', subEn: 'Matte silk origami tailoring', primary: '#C6322F', accent: '#29272A' },
      { id: 'dune-shell', nameZh: '沙丘甲壳', nameEn: 'Dune Shell', subZh: '生物皮革 · 有机覆片', subEn: 'Bio-leather organic shell', primary: '#C6A980', accent: '#ECE3D2' },
      { id: 'abyssal-fiber', nameZh: '深海纤维', nameEn: 'Abyssal Fiber', subZh: '深海纱线 · 波浪编织', subEn: 'Abyssal yarn wave knit', primary: '#102A50', accent: '#4B6790' },
      { id: 'moss-atelier', nameZh: '苔境编织', nameEn: 'Moss Atelier', subZh: '再生纤维 · 三维编织', subEn: 'Recycled 3D weaving', primary: '#344B38', accent: '#151A18' },
      { id: 'celestial-tailoring', nameZh: '星轨精裁', nameEn: 'Celestial Tailoring', subZh: '超细羊毛 · 光纤点线', subEn: 'Fine wool · fiber-optic trace', primary: '#111F42', accent: '#D9E5FF' }
    ]
  },
  {
    id: 'collab', nameZh: '联名系列', nameEn: 'Collaboration Series', subZh: '三个 IP 概念案例', subEn: 'Three IP concept studies', price: 499, tone: 'cyber',
    outfits: [
      { id: 'dragon-ball', nameZh: '七龙珠概念', nameEn: 'Dragon Ball Concept', subZh: '热血武道 · 橙蓝机能套装', subEn: 'Martial-arts technical set', primary: '#E86C20', accent: '#2456B7' },
      { id: 'spider-man', nameZh: '蜘蛛侠概念', nameEn: 'Spider-Man Concept', subZh: '动态蛛网 · 红蓝机能服', subEn: 'Kinetic web technical suit', primary: '#B82431', accent: '#162A4B' },
      { id: 'pop-mart', nameZh: 'POP MART 潮玩概念', nameEn: 'POP MART Toy Concept', subZh: '潮玩雕塑 · 柔和模块', subEn: 'Collectible-toy modular set', primary: '#B99ADB', accent: '#F2A98F' }
    ]
  }
]

const MATERIAL_STYLES = [
  { id: 'smooth', nameZh: '光滑面料', nameEn: 'Smooth', subZh: '低粗糙度 · 细腻光泽', subEn: 'Low roughness, refined sheen', addon: 0, swatch: 'bg-gradient-to-br from-white/85 via-white/35 to-white/10' },
  { id: 'matte', nameZh: '磨砂哑光', nameEn: 'Matte / Frosted', subZh: '高粗糙度 · 低调质感', subEn: 'High roughness, understated finish', addon: 0, swatch: 'bg-gradient-to-br from-white/30 via-white/12 to-white/[0.03]' },
  { id: 'metal', nameZh: '金属质感', nameEn: 'Metallic', subZh: '高金属度 · 工业气息', subEn: 'High metalness, industrial edge', addon: 150, swatch: 'bg-[linear-gradient(135deg,#f4f6f9_0%,#9aa3b2_38%,#eef1f5_58%,#7b8494_100%)]' },
  { id: 'leather', nameZh: '皮革质感', nameEn: 'Leather', subZh: '复合涂层 · 醇厚质地', subEn: 'Layered coating, rich texture', addon: 300, swatch: 'bg-gradient-to-br from-amber-200/70 via-amber-700/50 to-amber-950/60' }
]

// 02 个性化选配：面具类型（采用亲和 Gen-3 仿真人面部基底）
const MASKS = [
  { id: 'none', nameZh: '标准原生', nameEn: 'Standard Base', price: 0, tone: 'silver' },
  { id: 'tech-minimal', nameZh: '科技拟人 · 亚洲女性', nameEn: 'Tech Human · Asian Woman', price: 299, tone: 'electric' },
  { id: 'geometric-mechanical', nameZh: '机械科技', nameEn: 'Mechanical Tech', price: 399, tone: 'cyber' },
  { id: 'business-human', nameZh: '商务拟人 · 欧美男性', nameEn: 'Business Human · European Man', price: 899, tone: 'electric' },
  { id: 'warm-companion', nameZh: '温和陪伴 · 非洲女性', nameEn: 'Warm Companion · African Woman', price: 899, tone: 'rose' },
  { id: 'anime-character', nameZh: '卡通动漫', nameEn: 'Anime Character', price: 399, tone: 'cyber' },
  { id: 'brand-character', nameZh: '品牌角色 · 拉丁女性', nameEn: 'Brand Character · Latina Woman', price: 699, tone: 'rose' },
  { id: 'custom-portrait', nameZh: '定制肖像 · 中性', nameEn: 'Custom Portrait · Neutral', price: 1500, tone: 'electric' }
]

const HEADWEAR = [
  { id: 'none', nameZh: '标准原生', nameEn: 'Standard Base' },
  { id: 'goggles', nameZh: '光环导轨', nameEn: 'Orbit Halo Rail' },
  { id: 'headband', nameZh: '感知冠冕', nameEn: 'Sensor Crown' },
  { id: 'hat', nameZh: '空气动力鳍', nameEn: 'Aero Crown Fins' },
  { id: 'helmet-shell', nameZh: '模块化头舱', nameEn: 'Modular Head Pod' }
]

// 02 个性化选配：发型
const HAIRS = [
  { id: 'none', nameZh: '不佩戴', nameEn: 'None', price: 0, tone: 'silver' },
  { id: 'short', nameZh: '短发', nameEn: 'Short', price: 99, tone: 'electric' },
  { id: 'long-straight', nameZh: '长直发', nameEn: 'Long Straight', price: 199, tone: 'rose' },
  { id: 'curly', nameZh: '卷发', nameEn: 'Curly', price: 249, tone: 'cyber' },
  { id: 'bob', nameZh: '波波头', nameEn: 'Bob', price: 219, tone: 'rose' },
  { id: 'ponytail', nameZh: '马尾', nameEn: 'Ponytail', price: 179, tone: 'electric' },
  { id: 'slicked-back', nameZh: '背头', nameEn: 'Slicked Back', price: 179, tone: 'silver' },
  { id: 'mohawk', nameZh: '莫西干', nameEn: 'Mohawk', price: 299, tone: 'cyber' }
]

const FOOTWEAR = [
  { id: 'none', nameZh: '不佩戴', nameEn: 'None' },
  { id: 'light-athletic', nameZh: '轻量运动鞋', nameEn: 'Light Athletic' },
  { id: 'business-formal', nameZh: '商务礼仪鞋', nameEn: 'Business Formal' },
  { id: 'work-protective', nameZh: '工装防护鞋', nameEn: 'Protective Work' },
  { id: 'outdoor-technical', nameZh: '户外机能鞋', nameEn: 'Outdoor Technical' },
  { id: 'haute-couture', nameZh: '高定造型鞋', nameEn: 'Haute Couture' },
  { id: 'themed-character', nameZh: '主题角色鞋', nameEn: 'Themed Character' },
  { id: 'custom', nameZh: '自定义鞋履', nameEn: 'Custom Footwear' }
]

const CARRY_SYSTEMS = [
  { id: 'none', nameZh: '不佩戴', nameEn: 'None' },
  { id: 'utility', nameZh: '机能背包', nameEn: 'Utility Module' },
  { id: 'business', nameZh: '商务背包', nameEn: 'Business Module' },
  { id: 'display', nameZh: '展示背包', nameEn: 'Display Module' },
  { id: 'waist', nameZh: '腰包', nameEn: 'Waist Pod' },
  { id: 'shoulder-mission', nameZh: '单肩任务包', nameEn: 'Mission Pod' },
  { id: 'tool-module', nameZh: '工具挂包', nameEn: 'Tool Module' },
  { id: 'themed', nameZh: '主题造型包', nameEn: 'Themed Shell' }
]

const IDENTITY_MARKS = [
  { id: 'chest-badge', nameZh: '胸牌', nameEn: 'Chest Badge' },
  { id: 'nameplate', nameZh: '姓名牌', nameEn: 'Nameplate' },
  { id: 'role-plate', nameZh: '岗位牌', nameEn: 'Role Plate' },
  { id: 'company-logo', nameZh: '企业 Logo', nameEn: 'Company Logo' },
  { id: 'number-id', nameZh: '编号标识', nameEn: 'Number ID' },
  { id: 'reflective', nameZh: '反光标识', nameEn: 'Reflective Mark' },
  { id: 'arm-badge', nameZh: '臂章', nameEn: 'Arm Badge' },
  { id: 'shoulder-rank', nameZh: '肩章', nameEn: 'Shoulder Rank' },
  { id: 'back-id', nameZh: '背部标识', nameEn: 'Back ID' },
  { id: 'digital-id', nameZh: '数字身份牌', nameEn: 'Digital ID' }
]

const APPEARANCE_ACCESSORIES = [
  { id: 'tie', nameZh: '领带', nameEn: 'Tie' },
  { id: 'bow-tie', nameZh: '领结', nameEn: 'Bow Tie' },
  { id: 'scarf', nameZh: '围巾', nameEn: 'Scarf' },
  { id: 'belt', nameZh: '腰带', nameEn: 'Belt' },
  { id: 'gloves', nameZh: '手套', nameEn: 'Gloves' },
  { id: 'wrist-guard', nameZh: '护腕', nameEn: 'Wrist Guard' },
  { id: 'necklace', nameZh: '项链', nameEn: 'Necklace' },
  { id: 'smart-band', nameZh: '手环', nameEn: 'Smart Band' },
  { id: 'brooch', nameZh: '胸针', nameEn: 'Brooch' },
  { id: 'cape', nameZh: '披肩', nameEn: 'Cape' },
  { id: 'glasses', nameZh: '眼镜', nameEn: 'Glasses' },
  { id: 'goggles', nameZh: '护目镜', nameEn: 'Goggles' }
]

const ACCESSORIES = [
  { id: 'backpack', nameZh: '机能背包', nameEn: 'Utility Backpack', price: 89 },
  { id: 'shoes', nameZh: '运动鞋履', nameEn: 'Performance Shoes', price: 129 }
]

// ---- 机身肤色：机器人裸露机身（手 / 前臂 / 小腿 / 颈部）的金属"皮肤"漆色 ----
const ROBOT_SKINS = [
  { id: 'titanium', hex: '#A7ADB6', nameZh: '钛灰', nameEn: 'Titanium' },
  { id: 'graphite', hex: '#3A3E45', nameZh: '石墨', nameEn: 'Graphite' },
  { id: 'champagne', hex: '#C9B89A', nameZh: '香槟金', nameEn: 'Champagne' },
  { id: 'rosegold', hex: '#C58D7A', nameZh: '玫瑰金', nameEn: 'Rose Gold' },
  { id: 'platinum', hex: '#D8D9DC', nameZh: '铂白', nameEn: 'Platinum' },
  { id: 'gunmetal', hex: '#5B6068', nameZh: '枪铁', nameEn: 'Gunmetal' },
  { id: 'cyberblue', hex: '#5E8DA8', nameZh: '冷钢蓝', nameEn: 'Steel Blue' },
  { id: 'obsidian', hex: '#1B1C20', nameZh: '曜黑', nameEn: 'Obsidian' }
]

// ---- 发色：机器人头发的颜色，独立于面部与机身 ----
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

// ---- RoboSkin · 完全拟真人：合成人类肌肤 + 真人面部的旗舰拟真形态（独立于金属机身漆色）----
// none = 机器人原貌（金属机身）；其余为可批复覆盖的拟真人肤色，选中后左侧写实大图切换为拟真人渲染
const ROBO_SKIN_TONES = [
  { id: 'none', nameZh: '机器人原貌', nameEn: 'Robot (off)', swatch: '#C9CDD4', price: 0 },
  { id: 'porcelain', nameZh: '瓷白', nameEn: 'Porcelain', swatch: '#F0D7C5', price: 3999 },
  { id: 'beige', nameZh: '自然米', nameEn: 'Natural Beige', swatch: '#E3C2A2', price: 3999 },
  { id: 'olive', nameZh: '暖橄榄', nameEn: 'Warm Olive', swatch: '#C99A6E', price: 3999 },
  { id: 'tan', nameZh: '小麦', nameEn: 'Tan', swatch: '#AE7B4F', price: 3999 },
  { id: 'ebony', nameZh: '乌檀', nameEn: 'Deep Ebony', swatch: '#6E4A33', price: 3999 }
]

// ---- 写实大图：每个选配板块聚焦时，左侧主预览切换为对应的写实渲染（轻 3D 角常驻可拖拽）----
const CFG = '/configurator'
const ASSET_VERSION = '20260801b'
const clothingSrc = (seriesId, outfitId) => `${CFG}/clothing/${seriesId}-${outfitId}.webp`
const roboskinSrc = (tone) => `${CFG}/roboskin/${tone && tone !== 'none' ? tone : 'porcelain'}.png`
const faceSrc = (maskId) => `${CFG}/personalization/faces/${maskId}.webp?v=${ASSET_VERSION}`
const headwearSrc = (id) => `${CFG}/personalization/headwear/${id}.webp?v=${ASSET_VERSION}`
const hairSrc = (id) => `${CFG}/personalization/hair/${id}.webp?v=${ASSET_VERSION}`
const footwearSrc = (id) => `${CFG}/extensions/footwear/${id}.webp?v=${ASSET_VERSION}`
const carrySrc = (id) => `${CFG}/extensions/carry/${id}.webp?v=${ASSET_VERSION}`
const identitySrc = (id) => `${CFG}/extensions/identity/${id}.webp?v=${ASSET_VERSION}`
const appearanceSrc = (id) => `${CFG}/extensions/appearance/${id}.webp?v=${ASSET_VERSION}`

// 全量写实图清单（挂载后预加载，使板块间切换瞬时无白屏）
const ALL_PREVIEW_IMAGES = [
  ...SERIES.flatMap((s) => s.outfits.map((outfit) => clothingSrc(s.id, outfit.id))),
  ...ROBO_SKIN_TONES.filter((t) => t.id !== 'none').map((t) => roboskinSrc(t.id)),
  ...MASKS.map((m) => faceSrc(m.id)),
  ...HEADWEAR.map((h) => headwearSrc(h.id)),
  ...HAIRS.map((h) => hairSrc(h.id)),
  ...FOOTWEAR.map((item) => footwearSrc(item.id)),
  ...CARRY_SYSTEMS.map((item) => carrySrc(item.id)),
  ...IDENTITY_MARKS.map((item) => identitySrc(item.id)),
  ...APPEARANCE_ACCESSORIES.map((item) => appearanceSrc(item.id))
]

// 手风琴板块顺序与各自聚焦的身体局部
const SECTION_ORDER = ['series', 'material', 'roboskin', 'skin', 'face', 'hair', 'haircolor', 'accessories', 'diy']
const SECTION_FOCUS = {
  series: 'torso', material: 'torso', roboskin: 'full', skin: 'torso',
  face: 'head', hair: 'head', haircolor: 'head',
  accessories: 'feet', diy: 'full'
}

const formatPrice = (n) => `$${n.toLocaleString('en-US')}`

// ============================================================
// 展示型子组件
// ============================================================

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

// Tesla 选配页风格的可视化选项卡片
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
      {Icon && (
        <span className={`flex h-11 w-11 items-center justify-center rounded-xl border transition-colors duration-300 ${active ? t.icon : 'border-white/12 bg-white/[0.03] text-white/40'}`}>
          <Icon width={20} height={20} />
        </span>
      )}
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

// 手风琴板块容器：折叠时显示已选摘要 + ✓；一次只展开一栏，逐项挑选
function AccordionSection({ index, title, summary, isOpen, onToggle, children }) {
  return (
    <div className={`overflow-hidden rounded-2xl border transition-colors duration-300 ${isOpen ? 'border-electric-400/40 bg-white/[0.03]' : 'border-white/10 bg-white/[0.015] hover:border-white/20'}`}>
      <button onClick={onToggle} className="flex w-full items-center gap-3 px-5 py-4 text-left">
        <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border font-mono text-[11px] ${isOpen ? 'border-electric-400/60 text-electric-300' : 'border-white/15 text-white/45'}`}>{index}</span>
        <span className="font-display text-sm font-semibold text-white/85">{title}</span>
        <span className="ml-auto flex items-center gap-2">
          {!isOpen && summary && (
            <span className="flex items-center gap-1.5 truncate text-[11px] text-electric-300/90">
              {summary}
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12l4 4L19 6" /></svg>
            </span>
          )}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className={`text-white/40 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}><path d="M6 9l6 6 6-6" /></svg>
        </span>
      </button>
      <div className={`grid transition-all duration-300 ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
        <div className="overflow-hidden">
          <div className="px-5 pb-5">{children}</div>
        </div>
      </div>
    </div>
  )
}

// 圆形色板按钮
function Swatch({ active, hex, label, onClick, darkCheck }) {
  return (
    <button onClick={onClick} title={label} aria-label={label} className="group flex flex-col items-center gap-2">
      <span
        className={`relative flex h-11 w-11 items-center justify-center rounded-full border-2 transition-all duration-300 ${
          active ? 'scale-110 border-electric-400 shadow-[0_0_22px_rgba(45,226,255,0.4)]' : 'border-white/15 group-hover:scale-105 group-hover:border-white/40'
        }`}
        style={{ backgroundColor: hex }}
      >
        {active && (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={darkCheck ? '#0A0A0B' : '#fff'} strokeWidth="2.6"><path d="M5 12l4 4L19 6" /></svg>
        )}
      </span>
      <span className={`text-[11px] transition-colors duration-300 ${active ? 'text-electric-300' : 'text-white/35 group-hover:text-white/55'}`}>{label}</span>
    </button>
  )
}

function ImageChoiceCard({ active, onClick, image, title, multi = false }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`group relative overflow-hidden rounded-2xl border text-left transition-all duration-300 ${
        active
          ? 'border-electric-400/80 bg-electric-500/[0.08] shadow-[0_0_24px_-7px_rgba(45,226,255,0.55)]'
          : 'border-white/10 bg-white/[0.02] hover:-translate-y-0.5 hover:border-white/30'
      }`}
    >
      <span className="block aspect-square overflow-hidden bg-black/25">
        <img src={image} alt={title} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.035]" />
      </span>
      <span className="flex min-h-[52px] items-center justify-between gap-2 px-3 py-2.5">
        <span className={`text-[12px] font-semibold leading-tight ${active ? 'text-electric-200' : 'text-white/78'}`}>{title}</span>
        {multi && <span className="shrink-0 text-[9px] text-white/35">MULTI</span>}
      </span>
      {active && (
        <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-electric-400 text-carbon-900 shadow-[0_0_16px_rgba(45,226,255,0.55)]">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12l4 4L19 6" /></svg>
        </span>
      )}
    </button>
  )
}

function LockedOptionPanel({ T, title, groups }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h4 className="font-display text-base font-semibold text-white">{title}</h4>
          <p className="mt-1 text-xs text-white/40">{T('结构已预留，当前不进入下单选择。', 'The structure is reserved and is not yet available for ordering.')}</p>
        </div>
        <span className="rounded-full border border-amber-300/30 bg-amber-300/10 px-3 py-1 text-[11px] font-semibold text-amber-200">
          {T('暂未开放', 'Coming soon')}
        </span>
      </div>
      <div className="mt-5 space-y-4">
        {groups.map((group) => (
          <div key={group.labelZh} className="border-t border-white/8 pt-4 first:border-0 first:pt-0">
            <p className="text-xs font-semibold text-electric-300">{T(group.labelZh, group.labelEn)}</p>
            <p className="mt-2 text-sm leading-7 text-white/55">{T(group.itemsZh, group.itemsEn)}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function RoboFitConfigurator({
  T,
  primaryMode,
  onPrimaryChange,
  activeSubcategory,
  onSubcategoryChange,
  seriesId,
  onSeriesChange,
  outfitId,
  onOutfitChange,
  materialId,
  onMaterialChange,
  activeSeries,
  activeOutfit,
  maskId,
  onMaskChange,
  headwearId,
  onHeadwearChange,
  hairId,
  onHairChange,
  footwearId,
  onFootwearChange,
  carryId,
  onCarryChange,
  identityIds,
  onIdentityToggle,
  appearanceIds,
  onAppearanceToggle
}) {
  const activeMaterial = MATERIAL_STYLES.find((item) => item.id === materialId) ?? MATERIAL_STYLES[0]
  const activeMask = MASKS.find((item) => item.id === maskId) ?? MASKS[0]
  const activeHair = HAIRS.find((item) => item.id === hairId) ?? HAIRS[0]
  const activeFootwear = FOOTWEAR.find((item) => item.id === footwearId) ?? FOOTWEAR[0]
  const activeCarry = CARRY_SYSTEMS.find((item) => item.id === carryId) ?? CARRY_SYSTEMS[0]

  const primaryOptions = [
    {
      id: 'apparel',
      index: '01',
      titleZh: '成品服装系列',
      titleEn: 'Ready-to-Wear',
      summaryZh: `${activeSeries.nameZh} · ${activeOutfit.nameZh}`,
      summaryEn: `${activeSeries.nameEn} · ${activeOutfit.nameEn}`
    },
    {
      id: 'personalization',
      index: '02',
      titleZh: '个性化选配',
      titleEn: 'Personalization',
      summaryZh: `${activeMask.nameZh} · ${activeHair.nameZh}`,
      summaryEn: `${activeMask.nameEn} · ${activeHair.nameEn}`
    },
    {
      id: 'extensions',
      index: '03',
      titleZh: '功能配件与外观拓展',
      titleEn: 'Function & Appearance',
      summaryZh: `${activeFootwear.nameZh} · ${activeCarry.nameZh}`,
      summaryEn: `${activeFootwear.nameEn} · ${activeCarry.nameEn}`
    }
  ]

  const secondaryOptions = {
    apparel: [],
    personalization: [
      { id: 'face', nameZh: '面具类型', nameEn: 'Face & Mask' },
      { id: 'headwear', nameZh: '头部装饰', nameEn: 'Head Decoration' },
      { id: 'hair', nameZh: '发型', nameEn: 'Hair Style' },
      { id: 'skin-custom', nameZh: '皮肤定制', nameEn: 'Skin Custom' },
      { id: 'face-custom', nameZh: '面部定制', nameEn: 'Face Custom' },
      { id: 'hair-custom', nameZh: '头发定制', nameEn: 'Hair Custom' }
    ],
    extensions: [
      { id: 'footwear', nameZh: '鞋履系统', nameEn: 'Footwear' },
      { id: 'carry', nameZh: '携行系统', nameEn: 'Carrying' },
      { id: 'identity', nameZh: '身份标识系统', nameEn: 'Identity' },
      { id: 'appearance', nameZh: '外观装饰配件', nameEn: 'Appearance' }
    ]
  }

  const activeSecondary = secondaryOptions[primaryMode]?.find((item) => item.id === activeSubcategory)

  return (
    <div className="space-y-5">
      <div>
        <div className="mb-3 flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-widest2 text-white/35">{T('需求路径', 'Needs Path')}</span>
          <span className="text-[11px] text-electric-300">{T('选择需求路径', 'Choose a path')}</span>
        </div>
        <div className="grid gap-3">
          {primaryOptions.map((item) => {
            const active = primaryMode === item.id
            return (
              <button
                key={item.id}
                onClick={() => onPrimaryChange(item.id)}
                aria-pressed={active}
                className={`flex items-center gap-4 rounded-2xl border px-4 py-4 text-left transition-all duration-300 ${
                  active ? 'border-electric-400/65 bg-electric-500/[0.08] shadow-[0_0_28px_-9px_rgba(45,226,255,0.45)]' : 'border-white/10 bg-white/[0.02] hover:border-white/25'
                }`}
              >
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border font-mono text-xs ${active ? 'border-electric-400/70 text-electric-300' : 'border-white/15 text-white/40'}`}>{item.index}</span>
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-base font-semibold text-white">{T(item.titleZh, item.titleEn)}</span>
                  <span className="mt-1 block truncate text-xs text-white/38">{T(item.summaryZh, item.summaryEn)}</span>
                </span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className={active ? 'text-electric-300' : 'text-white/25'}><path d="M9 6l6 6-6 6" /></svg>
              </button>
            )
          })}
        </div>
      </div>

      {primaryMode !== 'apparel' ? (
        <div className="rounded-3xl border border-white/10 bg-carbon-800/45 p-4 sm:p-5">
          <span className="text-[11px] font-semibold uppercase tracking-widest2 text-white/35">
            {T(primaryMode === 'personalization' ? '选择定制模块' : '选择拓展模块', primaryMode === 'personalization' ? 'Choose a customization module' : 'Choose an extension module')}
          </span>
          <div className={`mt-3 grid gap-2 ${primaryMode === 'personalization' ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-2'}`}>
            {secondaryOptions[primaryMode].map((item) => {
              const active = activeSubcategory === item.id
              const locked = ['skin-custom', 'face-custom', 'hair-custom'].includes(item.id)
              return (
                <button
                  key={item.id}
                  onClick={() => onSubcategoryChange(item.id)}
                  aria-pressed={active}
                  className={`relative rounded-xl border px-3 py-2.5 text-[12px] font-semibold transition-all ${active ? 'border-electric-400/65 bg-electric-500/10 text-electric-200' : 'border-white/10 bg-white/[0.02] text-white/55 hover:border-white/25 hover:text-white/80'}`}
                >
                  {T(item.nameZh, item.nameEn)}
                  {locked && <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-amber-300" />}
                </button>
              )
            })}
          </div>
        </div>
      ) : null}

      <div>
        <div className="mb-3 flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-widest2 text-white/35">
            {primaryMode === 'apparel' ? T('选择成品系列', 'Choose a ready-to-wear series') : T(activeSecondary?.nameZh ?? '选择方案', activeSecondary?.nameEn ?? 'Choose an option')}
          </span>
          {['identity', 'appearance'].includes(activeSubcategory) && <span className="text-[11px] text-electric-300">{T('支持多选', 'Multi-select')}</span>}
        </div>

        {primaryMode === 'apparel' && activeSubcategory === 'series' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {SERIES.map((series) => (
                <VisualOptionCard
                  key={series.id}
                  active={seriesId === series.id}
                  onClick={() => onSeriesChange(series)}
                  Icon={IconApparelTag}
                  tone={series.tone}
                  title={T(series.nameZh, series.nameEn)}
                  subtitle={T(series.subZh, series.subEn)}
                  price={formatPrice(series.price)}
                  badge={series.badgeZh ? T(series.badgeZh, series.badgeEn) : null}
                />
              ))}
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-[13px] font-medium text-white/70">{T(`选择${activeSeries.nameZh}套装`, `Choose a ${activeSeries.nameEn} look`)}</span>
                <span className="font-mono text-[11px] text-electric-300">{T(`${activeSeries.outfits.length} 款`, `${activeSeries.outfits.length} looks`)}</span>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {activeSeries.outfits.map((outfit) => (
                  <button
                    key={outfit.id}
                    onClick={() => onOutfitChange(outfit.id)}
                    aria-pressed={outfitId === outfit.id}
                    className={`group relative overflow-hidden rounded-xl border text-left transition-all ${outfitId === outfit.id ? 'border-electric-400/80 bg-electric-500/[0.08]' : 'border-white/10 bg-carbon-900/55 hover:border-white/30'}`}
                  >
                    <img src={clothingSrc(activeSeries.id, outfit.id)} alt={T(outfit.nameZh, outfit.nameEn)} loading="lazy" className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-[1.035]" />
                    <span className="block p-2.5 text-[12px] font-semibold text-white/80">{T(outfit.nameZh, outfit.nameEn)}</span>
                    {outfitId === outfit.id && <span className="absolute right-2 top-2 h-5 w-5 rounded-full bg-electric-400" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {primaryMode === 'personalization' && activeSubcategory === 'face' && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
            {MASKS.map((item) => <ImageChoiceCard key={item.id} active={maskId === item.id} onClick={() => onMaskChange(item.id)} image={faceSrc(item.id)} title={T(item.nameZh, item.nameEn)} />)}
          </div>
        )}
        {primaryMode === 'personalization' && activeSubcategory === 'headwear' && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {HEADWEAR.map((item) => <ImageChoiceCard key={item.id} active={headwearId === item.id} onClick={() => onHeadwearChange(item.id)} image={headwearSrc(item.id)} title={T(item.nameZh, item.nameEn)} />)}
            </div>
            <p className="text-[11px] leading-relaxed text-white/38">{T('选择模块化头舱时，系统会自动取消发型，避免结构冲突。', 'Selecting the modular head pod automatically removes hair to prevent a fit conflict.')}</p>
          </div>
        )}
        {primaryMode === 'personalization' && activeSubcategory === 'hair' && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
              {HAIRS.map((item) => <ImageChoiceCard key={item.id} active={hairId === item.id} onClick={() => onHairChange(item.id)} image={hairSrc(item.id)} title={T(item.nameZh, item.nameEn)} />)}
            </div>
            <p className="text-[11px] leading-relaxed text-white/38">{T('选择任一发型时，若当前佩戴模块化头舱，系统会自动切换为“标准原生”。', 'Choosing hair removes the modular head pod automatically when the two conflict.')}</p>
          </div>
        )}
        {primaryMode === 'personalization' && activeSubcategory === 'skin-custom' && (
          <LockedOptionPanel T={T} title={T('皮肤定制', 'Skin Customization')} groups={[
            { labelZh: '覆盖范围', labelEn: 'Coverage', itemsZh: '面部局部覆盖；手部覆盖；头颈覆盖；四肢局部覆盖；全身覆盖', itemsEn: 'Partial face; hands; head and neck; partial limbs; full body' },
            { labelZh: '皮肤颜色', labelEn: 'Skin colors', itemsZh: '瓷白；自然米；暖橄榄；小麦色；深棕；乌檀；幻想色；自定义颜色', itemsEn: 'Porcelain; natural beige; warm olive; wheat; deep brown; ebony; fantasy; custom' },
            { labelZh: '皮肤纹理', labelEn: 'Skin textures', itemsZh: '光滑；自然肌理；磨砂；仿皮革；未来合成纹理', itemsEn: 'Smooth; natural; frosted; leather-like; future synthetic' }
          ]} />
        )}
        {primaryMode === 'personalization' && activeSubcategory === 'face-custom' && (
          <LockedOptionPanel T={T} title={T('面部定制', 'Face Customization')} groups={[
            { labelZh: '基础结构', labelEn: 'Structure', itemsZh: '面部轮廓；眼部样式；眉形；嘴部样式；面部颜色；表面质感', itemsEn: 'Face contour; eye style; brows; mouth; face color; surface finish' },
            { labelZh: '面部图案', labelEn: 'Face graphics', itemsZh: '雀斑；妆容；纹身；品牌图案；发光纹路；自定义图案', itemsEn: 'Freckles; makeup; tattoo; brand graphic; luminous trace; custom graphic' }
          ]} />
        )}
        {primaryMode === 'personalization' && activeSubcategory === 'hair-custom' && (
          <LockedOptionPanel T={T} title={T('头发定制', 'Hair Customization')} groups={[
            { labelZh: '颜色', labelEn: 'Colors', itemsZh: '乌黑；深棕；浅棕；金棕；栗红；铂金；雾紫；天蓝；樱粉', itemsEn: 'Black; dark brown; light brown; golden brown; chestnut; platinum; lavender; azure; rose' },
            { labelZh: '发质', labelEn: 'Texture', itemsZh: '自然哑光；柔顺光泽；蓬松卷曲；未来纤维；金属丝感', itemsEn: 'Natural matte; smooth gloss; voluminous curl; future fiber; metallic filament' }
          ]} />
        )}

        {primaryMode === 'extensions' && activeSubcategory === 'footwear' && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
              {FOOTWEAR.map((item) => <ImageChoiceCard key={item.id} active={footwearId === item.id} onClick={() => onFootwearChange(item.id)} image={footwearSrc(item.id)} title={T(item.nameZh, item.nameEn)} />)}
            </div>
            <p className="text-[11px] text-white/38">{T('鞋履采用无鞋带、一体包覆或磁吸闭合结构，适配机器人足部。', 'All footwear uses laceless shells, integrated wraps, or magnetic closures for robotic feet.')}</p>
          </div>
        )}
        {primaryMode === 'extensions' && activeSubcategory === 'carry' && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
              {CARRY_SYSTEMS.map((item) => <ImageChoiceCard key={item.id} active={carryId === item.id} onClick={() => onCarryChange(item.id)} image={carrySrc(item.id)} title={T(item.nameZh, item.nameEn)} />)}
            </div>
            <p className="text-[11px] text-white/38">{T('携行模块统一采用磁吸背板、快拆导轨或机械连接臂，不沿用人类双肩背带。', 'Carrying modules use magnetic plates, quick-release rails, or articulated mounts instead of human shoulder straps.')}</p>
          </div>
        )}
        {primaryMode === 'extensions' && activeSubcategory === 'identity' && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
            {IDENTITY_MARKS.map((item) => <ImageChoiceCard key={item.id} active={identityIds.includes(item.id)} onClick={() => onIdentityToggle(item.id)} image={identitySrc(item.id)} title={T(item.nameZh, item.nameEn)} multi />)}
          </div>
        )}
        {primaryMode === 'extensions' && activeSubcategory === 'appearance' && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
            {APPEARANCE_ACCESSORIES.map((item) => <ImageChoiceCard key={item.id} active={appearanceIds.includes(item.id)} onClick={() => onAppearanceToggle(item.id)} image={appearanceSrc(item.id)} title={T(item.nameZh, item.nameEn)} multi />)}
          </div>
        )}
      </div>
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

function SaveLookModal({ look, onClose, T }) {
  if (!look) return null

  const shareText = [
    `RoboFit™ ${T('搭配方案', 'Look')}`,
    `${T('服装', 'Apparel')}: ${T(look.series.nameZh, look.series.nameEn)} · ${T(look.outfit.nameZh, look.outfit.nameEn)}`,
    `${T('材质', 'Material')}: ${T(look.material.nameZh, look.material.nameEn)} · RoboSkin: ${T(look.roboSkin.nameZh, look.roboSkin.nameEn)} · ${T('机身肤色', 'Body skin')}: ${T(look.skin.nameZh, look.skin.nameEn)}`,
    `${T('面部', 'Face')}: ${T(look.mask.nameZh, look.mask.nameEn)} · ${T('头部装饰', 'Head decoration')}: ${T(look.headwear.nameZh, look.headwear.nameEn)} · ${T('发型', 'Hair')}: ${T(look.hair.nameZh, look.hair.nameEn)}`,
    `${T('鞋履', 'Footwear')}: ${T(look.footwear.nameZh, look.footwear.nameEn)} · ${T('携行', 'Carrying')}: ${T(look.carry.nameZh, look.carry.nameEn)}`,
    `${T('身份标识', 'Identity')}: ${look.identities.length ? look.identities.map((item) => T(item.nameZh, item.nameEn)).join(' · ') : T('无', 'None')}`,
    `${T('外观配件', 'Appearance')}: ${look.appearance.length ? look.appearance.map((item) => T(item.nameZh, item.nameEn)).join(' · ') : T('无', 'None')}`,
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
          <Row label={T('服装系列', 'Apparel series')} value={T(look.series.nameZh, look.series.nameEn)} />
          <Row label={T('完整套装', 'Complete outfit')} value={T(look.outfit.nameZh, look.outfit.nameEn)} />
          <Row label={T('材质工艺', 'Material finish')} value={T(look.material.nameZh, look.material.nameEn)} />
          <Row label={T('RoboSkin · 拟真人', 'RoboSkin · Lifelike')} value={T(look.roboSkin.nameZh, look.roboSkin.nameEn)} />
          <Row label={T('机身肤色', 'Body skin')} value={T(look.skin.nameZh, look.skin.nameEn)} />
          <Row label={T('面部', 'Face')} value={T(look.mask.nameZh, look.mask.nameEn)} />
          <Row label={T('头部装饰', 'Head decoration')} value={T(look.headwear.nameZh, look.headwear.nameEn)} />
          <Row label={T('发型', 'Hair')} value={T(look.hair.nameZh, look.hair.nameEn)} />
          <Row label={T('鞋履系统', 'Footwear')} value={T(look.footwear.nameZh, look.footwear.nameEn)} />
          <Row label={T('携行系统', 'Carrying')} value={T(look.carry.nameZh, look.carry.nameEn)} />
          <Row label={T('身份标识', 'Identity')} value={look.identities.length ? look.identities.map((item) => T(item.nameZh, item.nameEn)).join(' · ') : T('无', 'None')} />
          <Row label={T('外观装饰', 'Appearance')} value={look.appearance.length ? look.appearance.map((item) => T(item.nameZh, item.nameEn)).join(' · ') : T('无', 'None')} />
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

  // ---- 配置状态：全部使用 React useState，禁止任何浏览器持久化存储 ----
  const [seriesId, setSeriesId] = useState('professional')
  const [outfitId, setOutfitId] = useState('hotel-concierge')
  const [materialId, setMaterialId] = useState('smooth')
  const [skinColorId, setSkinColorId] = useState('titanium')
  // RoboSkin · 完全拟真人：none = 机器人原貌；其余覆盖批复后左侧大图切换为拟真人渲染
  const [roboSkinId, setRoboSkinId] = useState('none')
  const [maskId, setMaskId] = useState('tech-minimal')
  const [headwearId, setHeadwearId] = useState('none')
  const [hairId, setHairId] = useState('short')
  const [hairColorId, setHairColorId] = useState('black')
  const [footwearId, setFootwearId] = useState('none')
  const [carryId, setCarryId] = useState('none')
  const [identityIds, setIdentityIds] = useState([])
  const [appearanceIds, setAppearanceIds] = useState([])
  const [accessoryState, setAccessoryState] = useState({ backpack: false, shoes: false })
  // DIY 自定义：null 表示未启用，由用户主动取色后才覆盖对应材质
  const [diyClothing, setDiyClothing] = useState(null)
  const [diySkin, setDiySkin] = useState(null)
  const [diyHair, setDiyHair] = useState(null)
  const [diyFace, setDiyFace] = useState(null)
  const [diyRough, setDiyRough] = useState(null)
  // 手风琴：当前展开的板块（一次只展开一栏，选完自动折叠并展开下一项）
  const [openSection, setOpenSection] = useState('series')
  const [primaryMode, setPrimaryMode] = useState('apparel')
  const [activeSubcategory, setActiveSubcategory] = useState('series')
  // 当前聚焦的身体局部（选不同板块时相机平滑对准 → 局部放大）
  const [focusKey, setFocusKey] = useState('torso')
  const [savedLook, setSavedLook] = useState(null)
  const [isRendering, setIsRendering] = useState(false)

  const mountRef = useRef(null)
  const sceneRef = useRef(null)

  const activeSeries = SERIES.find((s) => s.id === seriesId) ?? SERIES[0]
  const activeOutfit = activeSeries.outfits.find((outfit) => outfit.id === outfitId) ?? activeSeries.outfits[0]

  // ---- 写实大图主预览：需求路径、功能模块与具体方案同步联动 ----
  const previewSrc = useMemo(() => {
    if (primaryMode === 'apparel') return clothingSrc(seriesId, outfitId)
    if (primaryMode === 'personalization') {
      if (activeSubcategory === 'face' || activeSubcategory === 'face-custom') return faceSrc(maskId)
      if (activeSubcategory === 'headwear') return headwearSrc(headwearId)
      if (activeSubcategory === 'hair' || activeSubcategory === 'hair-custom') return hairSrc(hairId)
      return roboskinSrc(roboSkinId)
    }
    if (activeSubcategory === 'footwear') return footwearSrc(footwearId)
    if (activeSubcategory === 'carry') return carrySrc(carryId)
    if (activeSubcategory === 'identity') return identitySrc(identityIds.at(-1) ?? 'chest-badge')
    return appearanceSrc(appearanceIds.at(-1) ?? 'tie')
  }, [primaryMode, activeSubcategory, seriesId, outfitId, maskId, headwearId, hairId, roboSkinId, footwearId, carryId, identityIds, appearanceIds])

  const previewAlt = useMemo(() => {
    if (primaryMode === 'apparel') return `${T('成品服装', 'Ready-to-wear')} · ${T(activeOutfit.nameZh, activeOutfit.nameEn)}`
    if (primaryMode === 'personalization') {
      if (activeSubcategory === 'face' || activeSubcategory === 'face-custom') {
        const item = MASKS.find((option) => option.id === maskId) ?? MASKS[0]
        return `${T('面具类型', 'Face & mask')} · ${T(item.nameZh, item.nameEn)}`
      }
      if (activeSubcategory === 'headwear') {
        const item = HEADWEAR.find((option) => option.id === headwearId) ?? HEADWEAR[0]
        return `${T('头部装饰', 'Head decoration')} · ${T(item.nameZh, item.nameEn)}`
      }
      const item = HAIRS.find((option) => option.id === hairId) ?? HAIRS[0]
      return `${T('发型', 'Hair style')} · ${T(item.nameZh, item.nameEn)}`
    }
    if (activeSubcategory === 'footwear') {
      const item = FOOTWEAR.find((option) => option.id === footwearId) ?? FOOTWEAR[0]
      return `${T('鞋履系统', 'Footwear')} · ${T(item.nameZh, item.nameEn)}`
    }
    if (activeSubcategory === 'carry') {
      const item = CARRY_SYSTEMS.find((option) => option.id === carryId) ?? CARRY_SYSTEMS[0]
      return `${T('携行系统', 'Carrying')} · ${T(item.nameZh, item.nameEn)}`
    }
    return T('功能配件与外观拓展预览', 'Function and appearance preview')
  }, [T, primaryMode, activeSubcategory, activeOutfit, maskId, headwearId, hairId, footwearId, carryId])

  // 挂载后预加载全部写实图，板块切换瞬时无白屏
  useEffect(() => {
    ALL_PREVIEW_IMAGES.forEach((src) => {
      const img = new Image()
      img.src = src
    })
  }, [])

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

    // 标准版 Optimus —— 与 optimus-viewer 同源的 GLB 实体模型（异步加载后注入 group）
    const group = new THREE.Group()
    scene.add(group)
    // GLB 为整体实体网格，不再具备分体材质/部件句柄；下方各材质 useEffect 已做空值保护
    const materials = null
    const parts = null
    let robotDisposed = false
    loadRobotModel('/models/robot-optimus.glb')
      .then((handle) => {
        if (robotDisposed) { handle.dispose(); return }
        const model = handle.model
        // 缩放到与原程序化机器人相近的高度（≈3.4 单位），保持镜头/聚焦参数复用
        const pre = new THREE.Box3().setFromObject(model)
        const preSize = new THREE.Vector3()
        pre.getSize(preSize)
        model.scale.setScalar(3.4 / (preSize.y || 1))
        // 缩放后居中（X/Z）并把脚底落在 group 原点（group 整体在动画中悬浮于 y≈-2）
        const fit = new THREE.Box3().setFromObject(model)
        const c = new THREE.Vector3()
        fit.getCenter(c)
        model.position.x -= c.x
        model.position.z -= c.z
        model.position.y -= fit.min.y
        group.add(model)
        if (sceneRef.current) sceneRef.current.robotHandle = handle
      })
      .catch((err) => console.error('[RoboFit] Optimus GLB 加载失败', err))

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.07
    controls.minDistance = 2.6
    controls.maxDistance = 7.5
    controls.minPolarAngle = Math.PI * 0.18
    controls.maxPolarAngle = Math.PI * 0.86
    controls.target.set(0, 0.5, 0)
    controls.update()

    sceneRef.current = {
      scene, camera, renderer, controls, group, materials, parts, ring,
      focus: { targetY: FOCUS.torso.targetY, dist: FOCUS.torso.dist, active: true }
    }

    let frameId
    const clock = new THREE.Clock()
    const animate = () => {
      frameId = requestAnimationFrame(animate)
      const t = clock.getElapsedTime()
      group.position.y = -2.0 + Math.sin(t * 0.9) * 0.035
      ring.material.opacity = 0.3 + Math.sin(t * 1.6) * 0.12
      // 局部聚焦平滑动画：选不同板块时相机缓动对准对应身体局部（局部放大）
      const f = sceneRef.current?.focus
      if (f && f.active) {
        controls.target.y += (f.targetY - controls.target.y) * 0.09
        const offset = camera.position.clone().sub(controls.target)
        const newLen = offset.length() + (f.dist - offset.length()) * 0.09
        offset.setLength(newLen)
        camera.position.copy(controls.target).add(offset)
        if (Math.abs(controls.target.y - f.targetY) < 0.012 && Math.abs(newLen - f.dist) < 0.025) f.active = false
      }
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
      robotDisposed = true
      sceneRef.current?.robotHandle?.dispose()
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

  // ---------------- 局部聚焦：当前功能模块决定相机对准的身体局部 ----------------
  useEffect(() => {
    const focusBySubcategory = {
      series: 'torso', material: 'torso', face: 'head', headwear: 'head', hair: 'head',
      'skin-custom': 'full', 'face-custom': 'head', 'hair-custom': 'head',
      footwear: 'feet', carry: 'torso', identity: 'torso', appearance: 'full'
    }
    setFocusKey(focusBySubcategory[activeSubcategory] ?? 'full')
  }, [activeSubcategory])

  useEffect(() => {
    const ctx = sceneRef.current
    if (!ctx) return
    const region = FOCUS[focusKey] ?? FOCUS.full
    ctx.focus = { targetY: region.targetY, dist: region.dist, active: true }
  }, [focusKey])

  // ---------------- 场景套装：套装主色与点缀色同步映射到 3D 缩览 ----------------
  useEffect(() => {
    const ctx = sceneRef.current
    if (!ctx?.materials) return
    if (!activeOutfit) return
    ctx.materials.clothingMaterial.color.set(activeOutfit.primary)
    ctx.materials.clothingAccentMaterial.color.set(activeOutfit.accent)
  }, [seriesId, outfitId, activeOutfit])

  // ---------------- 材质风格：粗糙度 / 金属度实时驱动服装表面工艺 ----------------
  useEffect(() => {
    const ctx = sceneRef.current
    if (!ctx?.materials) return
    const preset = MATERIAL_STYLE_PRESETS[materialId]
    if (!preset) return
    ctx.materials.clothingMaterial.roughness = preset.roughness
    ctx.materials.clothingMaterial.metalness = preset.metalness
  }, [materialId])

  // ---------------- 机身肤色：裸露机身（手/前臂/小腿/颈部）漆色独立驱动 ----------------
  useEffect(() => {
    const ctx = sceneRef.current
    if (!ctx?.materials) return
    const skin = ROBOT_SKINS.find((s) => s.id === skinColorId)
    if (skin) ctx.materials.chassisMaterial.color.set(skin.hex)
  }, [skinColorId])

  // ---------------- 面部：实时切换可见性与外观 ----------------
  useEffect(() => {
    const ctx = sceneRef.current
    if (!ctx?.parts || !ctx?.materials) return
    const preset = MASK_PRESETS[maskId] ?? MASK_PRESETS['tech-minimal']
    ctx.parts.mask.visible = preset.visible
    if (preset.visible) {
      ctx.materials.maskMaterial.color.set(preset.color)
      ctx.materials.maskMaterial.emissive.set(preset.emissive)
      ctx.materials.maskMaterial.emissiveIntensity = preset.emissiveIntensity
      ctx.materials.maskMaterial.roughness = preset.roughness
      ctx.materials.maskMaterial.metalness = preset.metalness
    }
  }, [maskId])

  // ---------------- 发型：清空旧几何并按样式重建 ----------------
  useEffect(() => {
    const ctx = sceneRef.current
    if (!ctx?.parts || !ctx?.materials) return
    const { hairGroup } = ctx.parts
    while (hairGroup.children.length) {
      const child = hairGroup.children.pop()
      child.traverse((node) => node.geometry?.dispose())
    }
    hairGroup.add(buildHairStyle(hairId, ctx.materials.hairMaterial))
  }, [hairId])

  // ---------------- 发色：头发颜色独立驱动 ----------------
  useEffect(() => {
    const ctx = sceneRef.current
    if (!ctx?.materials) return
    const hc = HAIR_COLORS.find((c) => c.id === hairColorId)
    if (hc) ctx.materials.hairMaterial.color.set(hc.hex)
  }, [hairColorId, hairId])

  // ---------------- 配件：背包可见性 + 鞋履材质替换 ----------------
  useEffect(() => {
    const ctx = sceneRef.current
    if (!ctx?.parts || !ctx?.materials) return
    ctx.parts.backpack.visible = accessoryState.backpack
    const footMaterial = accessoryState.shoes ? ctx.materials.shoesMaterial : ctx.materials.chassisMaterial
    ctx.parts.footL.material = footMaterial
    ctx.parts.footR.material = footMaterial
  }, [accessoryState])

  // ---------------- DIY 自定义：自由取色 / 微调，主动设置后覆盖对应材质（后写生效） ----------------
  useEffect(() => {
    const ctx = sceneRef.current
    if (!ctx || !diyClothing) return
    ctx.materials.clothingMaterial.color.set(diyClothing)
  }, [diyClothing])

  useEffect(() => {
    const ctx = sceneRef.current
    if (!ctx || !diySkin) return
    ctx.materials.chassisMaterial.color.set(diySkin)
  }, [diySkin])

  useEffect(() => {
    const ctx = sceneRef.current
    if (!ctx || !diyHair) return
    ctx.materials.hairMaterial.color.set(diyHair)
  }, [diyHair])

  useEffect(() => {
    const ctx = sceneRef.current
    if (!ctx || !diyFace) return
    ctx.materials.maskMaterial.color.set(diyFace)
  }, [diyFace])

  useEffect(() => {
    const ctx = sceneRef.current
    if (!ctx || diyRough == null) return
    // gloss 滑块：0 = 偏哑光（高粗糙度），1 = 偏光泽（低粗糙度）
    ctx.materials.clothingMaterial.roughness = 0.92 - diyRough * 0.78
    ctx.materials.clothingMaterial.metalness = 0.08 + diyRough * 0.7
  }, [diyRough])

  // ---------------- 选配变更时的"实时渲染中"提示脉冲（纯视觉反馈） ----------------
  useEffect(() => {
    setIsRendering(true)
    const timer = window.setTimeout(() => setIsRendering(false), 620)
    return () => window.clearTimeout(timer)
  }, [seriesId, outfitId, materialId, skinColorId, maskId, headwearId, hairId, hairColorId, footwearId, carryId, identityIds, appearanceIds, accessoryState, diyClothing, diySkin, diyHair, diyFace, diyRough])

  // ---------------- 实时价格计算引擎 ----------------
  const priceBreakdown = useMemo(() => {
    const series = SERIES.find((s) => s.id === seriesId)
    const material = MATERIAL_STYLES.find((m) => m.id === materialId)
    const mask = MASKS.find((m) => m.id === maskId)
    const hair = HAIRS.find((h) => h.id === hairId)
    const roboSkin = ROBO_SKIN_TONES.find((t) => t.id === roboSkinId)

    const items = [
      { key: 'series', labelZh: `服装系列 · ${series.nameZh}`, labelEn: `Apparel · ${series.nameEn}`, price: series.price },
      { key: 'material', labelZh: `${material.nameZh}工艺加成`, labelEn: `${material.nameEn} finish`, price: material.addon },
      { key: 'roboskin', labelZh: `RoboSkin 拟真人 · ${roboSkin.nameZh}`, labelEn: `RoboSkin · ${roboSkin.nameEn}`, price: roboSkin.price },
      { key: 'mask', labelZh: `面部 · ${mask.nameZh}`, labelEn: `Face · ${mask.nameEn}`, price: mask.price },
      { key: 'hair', labelZh: `发型 · ${hair.nameZh}`, labelEn: `Hair · ${hair.nameEn}`, price: hair.price }
    ]
    ACCESSORIES.forEach((acc) => {
      if (accessoryState[acc.id]) {
        items.push({ key: acc.id, labelZh: `配件 · ${acc.nameZh}`, labelEn: `Accessory · ${acc.nameEn}`, price: acc.price })
      }
    })

    const visibleItems = items.filter((item) => item.price > 0 || item.key === 'series')
    const total = items.reduce((sum, item) => sum + item.price, 0)
    return { items: visibleItems, total }
  }, [seriesId, materialId, roboSkinId, maskId, hairId, accessoryState])

  const activeSkinColor = ROBOT_SKINS.find((s) => s.id === skinColorId) ?? ROBOT_SKINS[0]
  const activeRoboSkin = ROBO_SKIN_TONES.find((t) => t.id === roboSkinId) ?? ROBO_SKIN_TONES[0]
  const activeHairColor = HAIR_COLORS.find((c) => c.id === hairColorId) ?? HAIR_COLORS[0]
  const activeMask = MASKS.find((m) => m.id === maskId) ?? MASKS[0]
  const activeHair = HAIRS.find((h) => h.id === hairId) ?? HAIRS[0]
  const activeMaterial = MATERIAL_STYLES.find((m) => m.id === materialId) ?? MATERIAL_STYLES[0]
  const accessoryCount = ACCESSORIES.filter((a) => accessoryState[a.id]).length

  const handlePrimaryChange = (id) => {
    setPrimaryMode(id)
    setActiveSubcategory(id === 'apparel' ? 'series' : id === 'personalization' ? 'face' : 'footwear')
  }

  const handleSeriesChange = (series) => {
    setSeriesId(series.id)
    setOutfitId(series.outfits[0].id)
  }

  const handleHeadwearChange = (id) => {
    setHeadwearId(id)
    if (id === 'helmet-shell') setHairId('none')
  }

  const handleHairChange = (id) => {
    setHairId(id)
    if (id !== 'none' && headwearId === 'helmet-shell') setHeadwearId('none')
  }

  const handleFootwearChange = (id) => {
    setFootwearId(id)
    setAccessoryState((prev) => ({ ...prev, shoes: id !== 'none' }))
  }

  const handleCarryChange = (id) => {
    setCarryId(id)
    setAccessoryState((prev) => ({ ...prev, backpack: id !== 'none' }))
  }

  const toggleMultiSelect = (setter, id) => {
    setter((previous) => previous.includes(id) ? previous.filter((item) => item !== id) : [...previous, id])
  }

  // 手风琴：仅在点击板块标题时切换展开/折叠；选择具体选项不自动折叠、不跳转
  const toggleSection = (id) => setOpenSection((prev) => (prev === id ? null : id))

  const handleSaveLook = () => {
    setSavedLook({
      series: activeSeries,
      outfit: activeOutfit,
      material: MATERIAL_STYLES.find((m) => m.id === materialId),
      roboSkin: activeRoboSkin,
      skin: activeSkinColor,
      mask: MASKS.find((m) => m.id === maskId),
      headwear: HEADWEAR.find((item) => item.id === headwearId),
      hair: HAIRS.find((h) => h.id === hairId),
      hairColor: activeHairColor,
      footwear: FOOTWEAR.find((item) => item.id === footwearId),
      carry: CARRY_SYSTEMS.find((item) => item.id === carryId),
      identities: IDENTITY_MARKS.filter((item) => identityIds.includes(item.id)),
      appearance: APPEARANCE_ACCESSORIES.filter((item) => appearanceIds.includes(item.id)),
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
    { step: '01', titleZh: '挑选服装', titleEn: 'Pick apparel', descZh: '从四大系列中选择不同场景与完整套装', descEn: 'Choose a complete scenario outfit from four series' },
    { step: '02', titleZh: '按需选配', titleEn: 'Choose by need', descZh: '进入个性化或拓展模块，用图片直接选择具体方案', descEn: 'Open personalization or extension modules and choose a visual option directly' },
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

      {/* ---------------- 配置器主体（左侧 3D 预览常驻，右侧手风琴逐项展开） ---------------- */}
      <section className="relative pb-20">
        <div className="mx-auto max-w-[1560px] px-5 sm:px-8 lg:px-10">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-4 border-b border-white/10 pb-6">
              <div>
                <span className="text-xs font-semibold uppercase tracking-widest2 text-electric-400">
                  {T('搭配工坊 · 所见即所得', 'Build studio · what you see is what you get')}
                </span>
                <h2 className="mt-2 font-display text-2xl font-bold text-white sm:text-[28px]">
                  {T('为你的 Optimus 逐项搭配造型', 'Style your Optimus, one step at a time')}
                </h2>
              </div>
              <p className="max-w-md text-sm leading-relaxed text-white/40">
                {T(
                  '先选择成品服装、个性化选配或功能配件与外观拓展。成品服装直接选择系列与套装；另外两条路径进入对应功能模块后，用图片选择具体方案。每次点选都会联动左侧写实预览，并自动聚焦对应部位。',
                  'Choose ready-to-wear, personalization, or function and appearance first. Ready-to-wear goes directly to series and looks; the other paths open a module before the visual options. Every choice updates the preview and focus.'
                )}
              </p>
            </div>
          </Reveal>

          <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.12fr)_minmax(0,1fr)] xl:gap-12">
            {/* 左：3D 实时预览（吸顶常驻，左右对照） */}
            <div className="lg:sticky lg:top-24 lg:self-start">
              <Reveal direction="left">
                <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-carbon-800/70 to-carbon-900 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.7)]">
                  <style>{`@keyframes rwFade{from{opacity:0;transform:scale(1.015)}to{opacity:1;transform:scale(1)}}`}</style>

                  {/* 写实大图主预览：随当前展开板块切换聚焦渲染（带淡入过渡） */}
                  <div className="relative h-[420px] w-full sm:h-[480px] lg:h-[560px] xl:h-[600px]">
                    <img
                      key={previewSrc}
                      src={previewSrc}
                      alt={previewAlt}
                      className="absolute inset-0 h-full w-full object-contain"
                      style={{ animation: 'rwFade 0.45s ease both' }}
                    />

                    {/* 轻 3D 角：常驻可拖拽的实时模型缩览 */}
                    <div className="absolute bottom-4 right-4 z-10 w-[38%] max-w-[230px] overflow-hidden rounded-2xl border border-electric-400/30 bg-carbon-900/70 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.8)] backdrop-blur-md">
                      <div ref={mountRef} className="pointer-events-auto h-[150px] w-full cursor-grab active:cursor-grabbing" />
                      <div className="pointer-events-none absolute left-0 top-0 flex items-center gap-1.5 rounded-br-xl bg-carbon-900/70 px-2.5 py-1 text-[10px] font-medium text-electric-200 backdrop-blur-md">
                        <span className="h-1.5 w-1.5 rounded-full bg-electric-400 animate-pulseGlow" />
                        {T('3D 实时 · 可拖拽', '3D live · drag me')}
                      </div>
                    </div>
                  </div>

                  <div className="pointer-events-none absolute left-5 top-5 flex items-center gap-2 rounded-full border border-white/12 bg-carbon-900/60 px-3 py-1.5 text-[11px] text-white/55 backdrop-blur-md">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#2DE2FF" strokeWidth="2"><path d="M3 12a9 9 0 1018 0 9 9 0 00-18 0z" /><path d="M3 12h18M12 3a14 14 0 010 18 14 14 0 010-18z" /></svg>
                    {T('写实大图 · 一键换装', 'Photoreal preview · instant swap')}
                  </div>

                  <div
                    className={`pointer-events-none absolute right-5 top-5 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] backdrop-blur-md transition-all duration-300 ${
                      isRendering ? 'border-electric-400/50 bg-electric-500/15 text-electric-200' : 'border-white/12 bg-carbon-900/60 text-white/45'
                    }`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${isRendering ? 'bg-electric-400 animate-pulseGlow' : 'bg-white/30'}`} />
                    {isRendering ? T('实时渲染中…', 'Rendering live…') : T('标准版 Optimus · 拟真渲染', 'Standard Optimus · photoreal')}
                  </div>

                  <div className="pointer-events-none absolute inset-x-5 bottom-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-carbon-900/55 px-4 py-3 text-[11px] text-white/45 backdrop-blur-md">
                    <span>{T('左侧写实大图随需求路径、功能模块与具体方案联动切换；右下角 3D 缩览可拖拽旋转查看整体比例', 'The photoreal preview follows the selected path, module, and option; drag the 3D inset to inspect overall proportions')}</span>
                    <span className="inline-flex items-center gap-1.5 text-electric-300">
                      <span className="h-1.5 w-1.5 rounded-full bg-electric-400 animate-pulseGlow" />
                      Three.js · WebGL
                    </span>
                  </div>
                </div>

                {/* 预估总价 + 保存搭配 CTA */}
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

            {/* 右：手风琴逐项选配（一次只展开一栏，选完折叠并进入下一项） */}
            <Reveal direction="right" delay={80}>
              <div className="space-y-5">
                <RoboFitConfigurator
                  T={T}
                  primaryMode={primaryMode}
                  onPrimaryChange={handlePrimaryChange}
                  activeSubcategory={activeSubcategory}
                  onSubcategoryChange={setActiveSubcategory}
                  seriesId={seriesId}
                  onSeriesChange={handleSeriesChange}
                  outfitId={outfitId}
                  onOutfitChange={setOutfitId}
                  materialId={materialId}
                  onMaterialChange={setMaterialId}
                  activeSeries={activeSeries}
                  activeOutfit={activeOutfit}
                  maskId={maskId}
                  onMaskChange={setMaskId}
                  headwearId={headwearId}
                  onHeadwearChange={handleHeadwearChange}
                  hairId={hairId}
                  onHairChange={handleHairChange}
                  footwearId={footwearId}
                  onFootwearChange={handleFootwearChange}
                  carryId={carryId}
                  onCarryChange={handleCarryChange}
                  identityIds={identityIds}
                  onIdentityToggle={(id) => toggleMultiSelect(setIdentityIds, id)}
                  appearanceIds={appearanceIds}
                  onAppearanceToggle={(id) => toggleMultiSelect(setAppearanceIds, id)}
                />

                {/* 旧九项结构仅留作代码迁移对照，构建时不会渲染。 */}
                {false && (<div aria-hidden="true">
                {/* 01 服装系列（先选系列 → 再选该系列独立场景套装） */}
                <AccordionSection
                  index="01"
                  title={T('服装系列', 'Apparel Series')}
                  summary={`${T(activeSeries.nameZh, activeSeries.nameEn)} · ${T(activeOutfit.nameZh, activeOutfit.nameEn)}`}
                  isOpen={openSection === 'series'}
                  onToggle={() => toggleSection('series')}
                >
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {SERIES.map((s) => (
                      <VisualOptionCard
                        key={s.id}
                        active={seriesId === s.id}
                        onClick={() => { setSeriesId(s.id); setOutfitId(s.outfits[0].id) }}
                        Icon={IconApparelTag}
                        tone={s.tone}
                        title={T(s.nameZh, s.nameEn)}
                        subtitle={T(s.subZh, s.subEn)}
                        price={formatPrice(s.price)}
                        badge={s.badgeZh ? T(s.badgeZh, s.badgeEn) : null}
                      />
                    ))}
                  </div>
                  <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                    <div className="mb-3 flex items-baseline justify-between">
                      <span className="text-[13px] font-medium text-white/70">{T(`选择${activeSeries.nameZh}套装`, `Choose a ${activeSeries.nameEn} look`)}</span>
                      <span className="font-mono text-[11px] text-electric-300">{T(`${activeSeries.outfits.length} 款`, `${activeSeries.outfits.length} looks`)}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
                      {activeSeries.outfits.map((outfit) => (
                        <button
                          key={outfit.id}
                          onClick={() => setOutfitId(outfit.id)}
                          title={T(outfit.nameZh, outfit.nameEn)}
                          aria-label={T(outfit.nameZh, outfit.nameEn)}
                          aria-pressed={outfitId === outfit.id}
                          className={`group relative overflow-hidden rounded-xl border text-left transition-all duration-300 ${
                            outfitId === outfit.id
                              ? 'border-electric-400/80 bg-electric-500/[0.08] shadow-[0_0_22px_-8px_rgba(45,226,255,0.55)]'
                              : 'border-white/10 bg-carbon-900/55 hover:-translate-y-0.5 hover:border-white/30'
                          }`}
                        >
                          <span className="block aspect-[4/3] overflow-hidden bg-black/20">
                            <img
                              src={clothingSrc(activeSeries.id, outfit.id)}
                              alt={T(outfit.nameZh, outfit.nameEn)}
                              loading="lazy"
                              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                            />
                          </span>
                          <span className="block p-2.5">
                            <span className={`block text-[12px] font-semibold leading-tight ${outfitId === outfit.id ? 'text-electric-200' : 'text-white/80'}`}>{T(outfit.nameZh, outfit.nameEn)}</span>
                            <span className="mt-1 block text-[10px] leading-snug text-white/35">{T(outfit.subZh, outfit.subEn)}</span>
                          </span>
                          {outfitId === outfit.id && (
                            <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-electric-400 text-carbon-900 shadow-[0_0_16px_rgba(45,226,255,0.6)]">
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12l4 4L19 6" /></svg>
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </AccordionSection>

                {/* 02 材质风格 */}
                <AccordionSection
                  index="02"
                  title={T('材质风格', 'Material Style')}
                  summary={T(activeMaterial.nameZh, activeMaterial.nameEn)}
                  isOpen={openSection === 'material'}
                  onToggle={() => toggleSection('material')}
                >
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
                </AccordionSection>

                {/* 03 RoboSkin · 完全拟真人 */}
                <AccordionSection
                  index="03"
                  title={T('RoboSkin · 拟真人', 'RoboSkin · Lifelike')}
                  summary={T(activeRoboSkin.nameZh, activeRoboSkin.nameEn)}
                  isOpen={openSection === 'roboskin'}
                  onToggle={() => toggleSection('roboskin')}
                >
                  <p className="mb-4 text-[11px] leading-relaxed text-white/35">
                    {T('旗舰级覆盖批复：合成人类肌肤包覆全身，连面部也变为真人面孔 — 完全拟真人。选「机器人原貌」则保留金属机身。',
                      'Flagship dermal overlay: synthetic human skin wraps the whole body and even the face becomes a real human face — fully lifelike. Choose “Robot (off)” to keep the metallic chassis.')}
                  </p>
                  <div className="flex flex-wrap gap-4">
                    {ROBO_SKIN_TONES.map((t) => (
                      <Swatch
                        key={t.id}
                        active={roboSkinId === t.id}
                        hex={t.swatch}
                        label={T(t.nameZh, t.nameEn)}
                        darkCheck={['porcelain', 'beige'].includes(t.id)}
                        onClick={() => setRoboSkinId(t.id)}
                      />
                    ))}
                  </div>
                  {roboSkinId !== 'none' && (
                    <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-electric-400/30 bg-electric-500/[0.07] px-3.5 py-1.5 font-mono text-[11px] text-electric-300">
                      <span className="h-1.5 w-1.5 rounded-full bg-electric-400 animate-pulseGlow" />
                      {T('拟真人覆盖', 'Lifelike overlay')} · +{formatPrice(activeRoboSkin.price)}
                    </p>
                  )}
                </AccordionSection>

                {/* 04 机身肤色 */}
                <AccordionSection
                  index="04"
                  title={T('机身肤色', 'Body Skin')}
                  summary={T(activeSkinColor.nameZh, activeSkinColor.nameEn)}
                  isOpen={openSection === 'skin'}
                  onToggle={() => toggleSection('skin')}
                >
                  <p className="mb-4 text-[11px] leading-relaxed text-white/35">
                    {T('裸露机身（手 / 前臂 / 小腿 / 颈部）的金属漆色，独立于服装配色单独调整。',
                      'Metallic finish of the exposed body (hands / forearms / shins / neck), tuned independently from apparel color.')}
                  </p>
                  <div className="flex flex-wrap gap-4">
                    {ROBOT_SKINS.map((s) => (
                      <Swatch
                        key={s.id}
                        active={skinColorId === s.id}
                        hex={s.hex}
                        label={T(s.nameZh, s.nameEn)}
                        darkCheck={['platinum', 'titanium', 'champagne'].includes(s.id)}
                        onClick={() => setSkinColorId(s.id)}
                      />
                    ))}
                  </div>
                </AccordionSection>

                {/* 05 面部 */}
                <AccordionSection
                  index="05"
                  title={T('面部', 'Face')}
                  summary={T(activeMask.nameZh, activeMask.nameEn)}
                  isOpen={openSection === 'face'}
                  onToggle={() => toggleSection('face')}
                >
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
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
                </AccordionSection>

                {/* 06 发型 */}
                <AccordionSection
                  index="06"
                  title={T('发型', 'Hair')}
                  summary={T(activeHair.nameZh, activeHair.nameEn)}
                  isOpen={openSection === 'hair'}
                  onToggle={() => toggleSection('hair')}
                >
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
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
                </AccordionSection>

                {/* 07 发色 */}
                <AccordionSection
                  index="07"
                  title={T('发色', 'Hair Color')}
                  summary={hairId === 'none' ? T('先选发型', 'Pick hair first') : T(activeHairColor.nameZh, activeHairColor.nameEn)}
                  isOpen={openSection === 'haircolor'}
                  onToggle={() => toggleSection('haircolor')}
                >
                  <p className="mb-4 text-[11px] leading-relaxed text-white/35">
                    {T('头发颜色独立于面部与机身，自然色与潮流色随心切换。',
                      'Hair color is independent from face and body — switch freely between natural and statement shades.')}
                  </p>
                  <div className="flex flex-wrap gap-4">
                    {HAIR_COLORS.map((c) => (
                      <Swatch
                        key={c.id}
                        active={hairColorId === c.id}
                        hex={c.hex}
                        label={T(c.nameZh, c.nameEn)}
                        darkCheck={['platinum', 'blonde'].includes(c.id)}
                        onClick={() => setHairColorId(c.id)}
                      />
                    ))}
                  </div>
                </AccordionSection>

                {/* 08 配件（可多选，不自动跳转） */}
                <AccordionSection
                  index="08"
                  title={T('配件', 'Accessories')}
                  summary={accessoryCount > 0 ? `${accessoryCount} ${T('项', 'on')}` : T('无', 'None')}
                  isOpen={openSection === 'accessories'}
                  onToggle={() => toggleSection('accessories')}
                >
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
                </AccordionSection>

                {/* 09 DIY 自定义 */}
                <AccordionSection
                  index="09"
                  title={T('DIY 自定义', 'DIY Custom')}
                  summary={(diyClothing || diySkin || diyHair || diyFace || diyRough != null) ? T('已自定义', 'Customized') : T('自由调', 'Free')}
                  isOpen={openSection === 'diy'}
                  onToggle={() => toggleSection('diy')}
                >
                  <p className="mb-4 text-[11px] leading-relaxed text-white/35">
                    {T('不满足于预设？自由取任意颜色并微调质感，实时覆盖到模型上（后选择的生效）。',
                      'Not satisfied with presets? Pick any color and fine-tune the finish — applied live onto the model (latest pick wins).')}
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: T('服装主色', 'Apparel'), value: diyClothing ?? activeOutfit.primary, set: setDiyClothing },
                      { label: T('机身肤色', 'Body skin'), value: diySkin ?? activeSkinColor.hex, set: setDiySkin },
                      { label: T('发色', 'Hair'), value: diyHair ?? activeHairColor.hex, set: setDiyHair },
                      { label: T('面部色', 'Face'), value: diyFace ?? (MASK_PRESETS[maskId]?.color ?? '#15171B'), set: setDiyFace }
                    ].map((item) => (
                      <label key={item.label} className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3">
                        <span className="text-[13px] text-white/70">{item.label}</span>
                        <span className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border-2 border-white/20" style={{ backgroundColor: item.value }}>
                          <input
                            type="color"
                            value={item.value}
                            onChange={(e) => item.set(e.target.value)}
                            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                          />
                        </span>
                      </label>
                    ))}
                  </div>
                  <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.02] px-5 py-4">
                    <div className="mb-2.5 flex items-baseline justify-between">
                      <span className="text-[13px] font-medium text-white/70">{T('服装光泽 / 金属度', 'Apparel gloss / metalness')}</span>
                      <span className="font-mono text-[11px] text-white/35">
                        {diyRough == null ? T('跟随材质', 'Follows material') : diyRough >= 0.66 ? T('偏光泽', 'Glossy') : diyRough <= 0.33 ? T('偏哑光', 'Matte') : T('自然', 'Natural')}
                      </span>
                    </div>
                    <input
                      type="range" min="0" max="1" step="0.01"
                      value={diyRough ?? 0.5}
                      onChange={(e) => setDiyRough(parseFloat(e.target.value))}
                      className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/15 accent-[#2DE2FF]"
                    />
                    <div className="mt-1 flex justify-between text-[10px] text-white/30">
                      <span>{T('哑光', 'Matte')}</span>
                      <span>{T('镜面金属', 'Mirror metal')}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => { setDiyClothing(null); setDiySkin(null); setDiyHair(null); setDiyFace(null); setDiyRough(null) }}
                    className="mt-4 text-[11px] text-white/40 underline-offset-2 transition-colors hover:text-electric-300 hover:underline"
                  >
                    {T('重置 DIY，恢复预设', 'Reset DIY to presets')}
                  </button>
                </AccordionSection>

                {/* 报价明细 */}
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
              </div>)}
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
