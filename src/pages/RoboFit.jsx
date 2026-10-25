import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { createScheme, schemeToContactUrl, formatSchemeText } from '../lib/lookScheme.js'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { useLanguage } from '../context/LanguageContext.jsx'
import Reveal from '../components/Reveal.jsx'
import { loadRobotModel } from '../three/robotLoader.js'
import { IconApparelTag } from '../components/icons.jsx'

// ============================================================
// RoboFit — item reference selection with a quote-only scheme handoff.
// 所有选择状态均通过 React useState 管理，不读写 localStorage / sessionStorage
// ============================================================

// 镜头局部聚焦：选不同选配板块时，相机平滑对准对应身体局部，凸显"局部放大"效果
const FOCUS = {
  full: { targetY: 0.4, dist: 6.0 },
  torso: { targetY: 0.9, dist: 4.4 },
  head: { targetY: 2.0, dist: 3.1 },
  feet: { targetY: -1.55, dist: 4.2 }
}

// Apparel design references; mounting and material details require project review.
const SERIES = [
  {
    id: 'home', nameZh: '家居系列', nameEn: 'Home Series', subZh: '六种生活角色，六套完整方案', subEn: 'Six lifestyles, six complete looks', tone: 'silver',
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
    id: 'professional', nameZh: '职业系列', nameEn: 'Professional Series', subZh: '六种服务场景，按岗位设计', subEn: 'Six service roles, purpose-built', tone: 'electric',
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
    id: 'couture', nameZh: '高定系列', nameEn: 'Haute Couture', subZh: '十种材质实验，十种独立廓形', subEn: 'Ten materials, ten distinct silhouettes', tone: 'rose',
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

]

// 02 个性化选配：面具类型（按形象原始设计设定，以地域／族裔与性别中性命名）
const MASKS = [
  { id: 'none', nameZh: '东亚男性', nameEn: 'East Asian · Male', tone: 'silver' },
  { id: 'tech-minimal', nameZh: '东亚女性', nameEn: 'East Asian · Female', tone: 'electric' },
  { id: 'geometric-mechanical', nameZh: '中东男性', nameEn: 'Middle Eastern · Male', tone: 'cyber' },
  { id: 'business-human', nameZh: '欧洲男性', nameEn: 'European · Male', tone: 'electric' },
  { id: 'warm-companion', nameZh: '非洲裔女性', nameEn: 'African Descent · Female', tone: 'rose' },
  { id: 'anime-character', nameZh: '拉丁裔女性', nameEn: 'Latina', tone: 'cyber' },
  { id: 'brand-character', nameZh: '非裔拉丁女性', nameEn: 'Afro-Latina', tone: 'rose' },
  { id: 'custom-portrait', nameZh: '南亚中性形象', nameEn: 'South Asian · Androgynous', tone: 'electric' }
]

const HEADWEAR = [
  { id: 'none', nameZh: '原生状态', nameEn: 'Natural Base' },
  { id: 'goggles', nameZh: '月轨光环', nameEn: 'Lunar Halo' },
  { id: 'headband', nameZh: '流线发箍', nameEn: 'Contour Band' },
  { id: 'hat', nameZh: '轻羽翼饰', nameEn: 'Feather Fins' },
  { id: 'helmet-shell', nameZh: '晶透头舱', nameEn: 'Crystal Canopy' },
  { id: 'ear-cuff', nameZh: '音弧耳饰', nameEn: 'Arc Ear Cuffs' },
  { id: 'temple-arc', nameZh: '银杏侧饰', nameEn: 'Ginkgo Accent' },
  { id: 'crown', nameZh: '星冠头饰', nameEn: 'Celestial Crown' }
]

// 02 个性化选配：发型
const HAIRS = [
  { id: 'none', nameZh: '原生状态', nameEn: 'Natural Base', tone: 'silver' },
  { id: 'short', nameZh: '雾感短发', nameEn: 'Soft Crop', tone: 'electric' },
  { id: 'long-straight', nameZh: '丝缎长发', nameEn: 'Satin Straight', tone: 'rose' },
  { id: 'curly', nameZh: '云卷造型', nameEn: 'Cloud Waves', tone: 'cyber' },
  { id: 'bob', nameZh: '几何波波', nameEn: 'Sculpted Bob', tone: 'rose' },
  { id: 'ponytail', nameZh: '高束马尾', nameEn: 'High Ponytail', tone: 'electric' },
  { id: 'slicked-back', nameZh: '流线背梳', nameEn: 'Swept Back', tone: 'silver' },
  { id: 'mohawk', nameZh: '银羽冠脊', nameEn: 'Silver Crest', tone: 'cyber' }
]

const FOOTWEAR = [
  { id: 'none', nameZh: '不佩戴', nameEn: 'None' },
  { id: 'light-athletic', nameZh: '轻量运动鞋', nameEn: 'Light Athletic' },
  { id: 'business-formal', nameZh: '商务礼仪鞋', nameEn: 'Business Formal' },
  { id: 'work-protective', nameZh: '工装防护鞋', nameEn: 'Protective Work' },
  { id: 'outdoor-technical', nameZh: '户外机能鞋', nameEn: 'Outdoor Technical' },
  { id: 'haute-couture', nameZh: '高定造型鞋', nameEn: 'Haute Couture' },
  { id: 'themed-character', nameZh: '主题角色鞋', nameEn: 'Themed Character' },
  { id: 'custom', nameZh: '自定义鞋履', nameEn: 'Custom Footwear', disabled: true }
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

// Load only the current category and visible item images, without bulk preloading.
const CFG = '/configurator'
const ASSET_VERSION = '20260801c'
const clothingSrc = (seriesId, outfitId) => `${CFG}/clothing/${seriesId}-${outfitId}.webp`
const skinReferenceSrc = '/images/robowear/skin-customization-reference-20261025.png'
const IDENTITY_IMAGES = '/images/robofit-v4'
const faceSrc = (maskId) => `${IDENTITY_IMAGES}/face-${maskId}.webp`
const headwearSrc = (id) => `${IDENTITY_IMAGES}/headwear-${id}.webp`
const hairSrc = (id) => `${IDENTITY_IMAGES}/hair-${id}.webp`
const footwearSrc = (id) => `${CFG}/extensions/footwear/${id}.webp?v=${ASSET_VERSION}`
const carrySrc = (id) => `${CFG}/extensions/carry/${id}.webp?v=${ASSET_VERSION}`
const identitySrc = (id) => `${CFG}/extensions/identity/${id}.webp?v=${ASSET_VERSION}`
const appearanceSrc = (id) => `${CFG}/extensions/appearance/${id}.webp?v=${ASSET_VERSION}`

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
      aria-label={title}
      aria-pressed={active}
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

function ImageChoiceCard({ active, onClick, image, title, multi = false, disabled = false, status = null }) {
  return (
    <button
      onClick={disabled ? undefined : onClick}
      aria-label={title}
      aria-pressed={disabled ? undefined : active}
      aria-disabled={disabled}
      disabled={disabled}
      className={`group relative overflow-hidden rounded-2xl border text-left transition-all duration-300 ${
        disabled
          ? 'cursor-not-allowed border-amber-300/15 bg-white/[0.015] opacity-70'
          : active
          ? 'border-electric-400/80 bg-electric-500/[0.08] shadow-[0_0_24px_-7px_rgba(45,226,255,0.55)]'
          : 'border-white/10 bg-white/[0.02] hover:-translate-y-0.5 hover:border-white/30'
      }`}
    >
      <span className="block aspect-square overflow-hidden bg-black/25">
        <img src={image} alt={title} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.035]" />
      </span>
      <span className="flex min-h-[52px] items-center justify-between gap-2 px-3 py-2.5">
        <span className={`text-[12px] font-semibold leading-tight ${active ? 'text-electric-200' : 'text-white/78'}`}>{title}</span>
        {status ? (
          <span className="shrink-0 rounded-full border border-amber-300/30 bg-amber-300/10 px-2 py-1 text-[9px] font-semibold text-amber-200">{status}</span>
        ) : null}
      </span>
      {active && !disabled && (
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
          <p className="mt-1 text-xs text-white/40">{T('研发方向，欢迎在询盘中描述需求。', 'An R&D direction. Describe your requirements in an inquiry.')}</p>
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
  const activeMask = MASKS.find((item) => item.id === maskId) ?? MASKS[0]
  const activeHair = HAIRS.find((item) => item.id === hairId) ?? HAIRS[0]
  const activeFootwear = FOOTWEAR.find((item) => item.id === footwearId) ?? FOOTWEAR[0]
  const activeCarry = CARRY_SYSTEMS.find((item) => item.id === carryId) ?? CARRY_SYSTEMS[0]

  const primaryOptions = [
    {
      id: 'apparel',
      index: '01',
      titleZh: '服装外观方向',
      titleEn: 'Apparel Looks',
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
            {primaryMode === 'apparel' ? T('选择服装方向', 'Choose an apparel direction') : T(activeSecondary?.nameZh ?? '选择方案', activeSecondary?.nameEn ?? 'Choose an option')}
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
                  price={T('定制评估报价', 'Estimate on request')}
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
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
              {HEADWEAR.map((item) => <ImageChoiceCard key={item.id} active={headwearId === item.id} onClick={() => onHeadwearChange(item.id)} image={headwearSrc(item.id)} title={T(item.nameZh, item.nameEn)} />)}
            </div>
            <p className="text-[11px] leading-relaxed text-white/38">{T('选择晶透头舱时，系统会自动取消发型，避免结构冲突。', 'Selecting the crystal canopy automatically removes hair to prevent a fit conflict.')}</p>
          </div>
        )}
        {primaryMode === 'personalization' && activeSubcategory === 'hair' && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
              {HAIRS.map((item) => <ImageChoiceCard key={item.id} active={hairId === item.id} onClick={() => onHairChange(item.id)} image={hairSrc(item.id)} title={T(item.nameZh, item.nameEn)} />)}
            </div>
            <p className="text-[11px] leading-relaxed text-white/38">{T('选择任一发型时，若当前佩戴晶透头舱，系统会自动切换为“原生状态”。', 'Choosing hair switches the crystal canopy back to the natural base when the two conflict.')}</p>
          </div>
        )}
        {primaryMode === 'personalization' && activeSubcategory === 'skin-custom' && (
          <LockedOptionPanel T={T} title={T('皮肤定制', 'Skin Customization')} groups={[
            { labelZh: '仿真皮肤与感知材料', labelEn: 'Lifelike skin & sensing materials', itemsZh: '仿真硅胶表面；柔性皮肤感知材料；传感层集成方向（需按项目验证）', itemsEn: 'Lifelike silicone surfaces; flexible skin-sensing materials; sensor-layer integration directions, subject to project validation' },
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
              {FOOTWEAR.map((item) => (
                <ImageChoiceCard
                  key={item.id}
                  active={footwearId === item.id}
                  onClick={() => onFootwearChange(item.id)}
                  image={footwearSrc(item.id)}
                  title={T(item.nameZh, item.nameEn)}
                  disabled={item.disabled}
                  status={item.disabled ? T('暂未开放', 'Coming soon') : null}
                />
              ))}
            </div>
            <p className="text-[11px] text-white/38">{T('鞋履结构为概念参考，连接方式与关节行程需按机型验证。', 'Footwear concepts require platform-specific checks for mounting and joint travel.')}</p>
          </div>
        )}
        {primaryMode === 'extensions' && activeSubcategory === 'carry' && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
              {CARRY_SYSTEMS.map((item) => <ImageChoiceCard key={item.id} active={carryId === item.id} onClick={() => onCarryChange(item.id)} image={carrySrc(item.id)} title={T(item.nameZh, item.nameEn)} />)}
            </div>
            <p className="text-[11px] text-white/38">{T('携行模块为概念参考，连接、质量与重心需结合目标机型评估。', 'Carry concepts require assessment of mounts, mass, and balance on the target platform.')}</p>
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

function SaveLookModal({ look, onClose, T, lang }) {
  const dialogRef = useRef(null)
  const textRef = useRef(null)
  const [copyState, setCopyState] = useState('')
  useEffect(() => {
    if (!look) return
    setCopyState('')
    const previous = document.activeElement
    const dialog = dialogRef.current
    dialog?.querySelector('button')?.focus()
    const onKey = (event) => {
      if (event.key === 'Escape') onClose()
      if (event.key !== 'Tab') return
      const nodes = [...dialog.querySelectorAll('button, a, textarea')]
      const first = nodes[0], last = nodes.at(-1)
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
    }
    dialog?.addEventListener('keydown', onKey)
    return () => { dialog?.removeEventListener('keydown', onKey); previous?.focus() }
  }, [look])
  if (!look) return null
  const shareText = formatSchemeText(look, lang)
  const copy = async () => {
    try { await navigator.clipboard.writeText(shareText); setCopyState('copied') }
    catch { textRef.current?.select(); setCopyState('manual') }
  }
  const download = () => {
    const url = URL.createObjectURL(new Blob([JSON.stringify({ ...look, summary: shareText }, null, 2)], { type: 'application/json' }))
    const link = document.createElement('a'); link.href = url; link.download = `${look.schemeId}.json`; link.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-carbon-900/85 px-4 backdrop-blur-sm" onClick={onClose}>
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="look-summary-title" onClick={e => e.stopPropagation()} className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-electric-500/30 bg-carbon-800 p-6 shadow-[0_0_70px_rgba(45,226,255,0.16)] sm:p-8">
        <button onClick={onClose} aria-label={T('关闭摘要', 'Close summary')} className="absolute right-5 top-5 rounded-full border border-white/20 px-3 py-1 text-sm">×</button>
        <h2 id="look-summary-title" className="pr-12 font-display text-2xl font-bold">{T('已生成方案摘要', 'Look summary generated')}</h2>
        <p className="mt-3 break-all font-mono text-xs text-electric-300">{look.schemeId}</p>
        <p className="mt-3 text-sm leading-relaxed text-white/55">{T('复制或下载摘要，询盘时会自动携带全部选配。页面选择刷新后重置，请先保留摘要。', 'Copy or download your summary. Your full selection travels with the inquiry. Selections reset on refresh, so keep your summary first.')}</p>
        <label htmlFor="look-summary-text" className="mt-5 block text-xs text-white/50">{T('方案内容', 'Your selection')}</label>
        <textarea ref={textRef} id="look-summary-text" readOnly value={shareText} rows={12} className="input-field mt-2 resize-y text-xs leading-6" />
        <p className="mt-3 text-sm text-electric-300">{T('定制评估报价 · 当前仅接受询盘', 'Estimate on request · quote only')}</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <button onClick={copy} className="rounded-full border border-white/20 px-5 py-2.5 text-sm">{T('复制摘要', 'Copy summary')}</button>
          <button onClick={download} className="rounded-full border border-white/20 px-5 py-2.5 text-sm">{T('下载方案', 'Download summary')}</button>
          <Link to={schemeToContactUrl(look)} onClick={onClose} className="rounded-full bg-gradient-to-r from-electric-500 to-cyber-500 px-5 py-2.5 text-sm font-semibold text-carbon-900">{T('携此方案获取报价', 'Request a quote on this look')}</Link>
        </div>
        <p role="status" className="mt-3 text-xs text-white/60">{copyState === 'copied' ? T('摘要已复制', 'Summary copied') : copyState === 'manual' ? T('请按 Ctrl+C 复制已选文本', 'Press Ctrl+C to copy the selected text') : ''}</p>
      </div>
    </div>
  )
}

// ============================================================
// 主组件
// ============================================================

export default function RoboFit() {
  const { T, lang } = useLanguage()
  const location = useLocation()
  const [platform, setPlatform] = useState('')
  const [useCase, setUseCase] = useState('Appearance customization')
  const [skinInterest, setSkinInterest] = useState(false)
  const [showBase, setShowBase] = useState(false)
  const [baseError, setBaseError] = useState(false)
  const [imageResult, setImageResult] = useState({ src: '', status: 'loading' })
  const [imageAttempt, setImageAttempt] = useState(0)

  // ---- 配置状态：全部使用 React useState，禁止任何浏览器持久化存储 ----
  const [seriesId, setSeriesId] = useState('professional')
  const [outfitId, setOutfitId] = useState('hotel-concierge')
  const [maskId, setMaskId] = useState('tech-minimal')
  const [headwearId, setHeadwearId] = useState('none')
  const [hairId, setHairId] = useState('short')
  const [footwearId, setFootwearId] = useState('none')
  const [carryId, setCarryId] = useState('none')
  const [identityIds, setIdentityIds] = useState([])
  const [appearanceIds, setAppearanceIds] = useState([])
  const [primaryMode, setPrimaryMode] = useState('apparel')
  const [activeSubcategory, setActiveSubcategory] = useState('series')
  // 当前聚焦的身体局部（选不同板块时相机平滑对准 → 局部放大）
  const [focusKey, setFocusKey] = useState('torso')
  const [savedLook, setSavedLook] = useState(null)

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
      return skinReferenceSrc
    }
    if (activeSubcategory === 'footwear') return footwearSrc(footwearId)
    if (activeSubcategory === 'carry') return carrySrc(carryId)
    if (activeSubcategory === 'identity') return identitySrc(identityIds.at(-1) ?? 'chest-badge')
    return appearanceSrc(appearanceIds.at(-1) ?? 'tie')
  }, [primaryMode, activeSubcategory, seriesId, outfitId, maskId, headwearId, hairId, footwearId, carryId, identityIds, appearanceIds])

  const previewAlt = useMemo(() => {
    if (primaryMode === 'apparel') return `${T('服装外观', 'Apparel look')} · ${T(activeOutfit.nameZh, activeOutfit.nameEn)}`
    if (primaryMode === 'personalization') {
      if (activeSubcategory === 'face' || activeSubcategory === 'face-custom') {
        const item = MASKS.find((option) => option.id === maskId) ?? MASKS[0]
        return `${T('面具类型', 'Face & mask')} · ${T(item.nameZh, item.nameEn)}`
      }
      if (activeSubcategory === 'headwear') {
        const item = HEADWEAR.find((option) => option.id === headwearId) ?? HEADWEAR[0]
        return `${T('头部装饰', 'Head decoration')} · ${T(item.nameZh, item.nameEn)}`
      }
      if (activeSubcategory === 'skin-custom') return T('机器人仿真皮肤与柔性感知材料概念参考图', 'Concept reference of lifelike robot skin and flexible sensing materials')
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

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const category = params.get('category')
    const productId = params.get('productId') || params.get('series')
    const paths = { mask: ['personalization', 'face'], face: ['personalization', 'face'], hair: ['personalization', 'hair'], headwear: ['personalization', 'headwear'], apparel: ['apparel', 'series'], carry: ['extensions', 'carry'], accessories: ['extensions', 'carry'], footwear: ['extensions', 'footwear'], skin: ['personalization', 'skin-custom'] }
    const path = paths[category]
    if (path) { setPrimaryMode(path[0]); setActiveSubcategory(path[1]) }
    if (category === 'skin') setSkinInterest(true)
    if (['mask', 'face'].includes(category) && MASKS.some(x => x.id === productId)) setMaskId(productId)
    if (category === 'hair' && HAIRS.some(x => x.id === productId)) setHairId(productId)
    if (category === 'headwear' && HEADWEAR.some(x => x.id === productId)) setHeadwearId(productId)
    if (category === 'carry' && CARRY_SYSTEMS.some(x => x.id === productId)) setCarryId(productId)
    if (category === 'footwear' && FOOTWEAR.some(x => x.id === productId && !x.disabled)) setFootwearId(productId)
    if (category === 'apparel') {
      const series = SERIES.find(x => x.id === productId || x.outfits.some(y => y.id === productId))
      if (series) { setSeriesId(series.id); setOutfitId(series.outfits.some(x => x.id === productId) ? productId : series.outfits[0].id) }
    }
  }, [location.search])

  // ---------------- Three.js 场景初始化（仅挂载时执行一次） ----------------
  useEffect(() => {
    const mount = mountRef.current
    if (!mount || !showBase) return

    const scene = new THREE.Scene()
    scene.background = new THREE.Color('#0A0A0B')
    scene.fog = new THREE.FogExp2('#0A0A0B', 0.05)

    const camera = new THREE.PerspectiveCamera(36, mount.clientWidth / mount.clientHeight, 0.1, 100)
    camera.position.set(2.7, 1.55, 4.6)

    let renderer
    try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }) }
    catch { setBaseError(true); return }
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
      .catch(() => { if (!robotDisposed) setBaseError(true) })

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
      scene, camera, renderer, controls, group, ring,
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
  }, [showBase])

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

  const activeMask = MASKS.find(item => item.id === maskId) ?? MASKS[0]
  const activeHair = HAIRS.find(item => item.id === hairId) ?? HAIRS[0]
  const makeItem = (category, item, labelZh, labelEn, included = false) => ({
    category, id: item.id, labelZh: `${labelZh} · ${item.nameZh}`, labelEn: `${labelEn} · ${item.nameEn}`,
    pricingStatus: included ? 'included' : 'estimate_required'
  })
  const selectedItems = [
    makeItem('apparel', activeOutfit, '服装', 'Apparel'),
    makeItem('mask', activeMask, '面部', 'Face'),
    makeItem('headwear', HEADWEAR.find(x => x.id === headwearId), '头饰', 'Headwear', headwearId === 'none'),
    makeItem('hair', activeHair, '发型', 'Hair', hairId === 'none'),
    makeItem('footwear', FOOTWEAR.find(x => x.id === footwearId), '鞋履', 'Footwear', footwearId === 'none'),
    makeItem('carry', CARRY_SYSTEMS.find(x => x.id === carryId), '携行', 'Carrying', carryId === 'none'),
    ...IDENTITY_MARKS.filter(x => identityIds.includes(x.id)).map(x => makeItem('identity', x, '标识', 'Identification')),
    ...APPEARANCE_ACCESSORIES.filter(x => appearanceIds.includes(x.id)).map(x => makeItem('appearance', x, '装饰', 'Styling')),
    ...(skinInterest ? [{ category: 'skin', id: 'skin-custom', labelZh: '皮肤定制 · 研发方向', labelEn: 'Skin customization · R&D direction', pricingStatus: 'estimate_required' }] : [])
  ]
  const imageStatus = imageResult.src === previewSrc ? imageResult.status : 'loading'

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
    if (FOOTWEAR.find((item) => item.id === id)?.disabled) return
    setFootwearId(id)
  }

  const handleCarryChange = (id) => {
    setCarryId(id)
  }

  const toggleMultiSelect = (setter, id) => {
    setter((previous) => previous.includes(id) ? previous.filter((item) => item !== id) : [...previous, id])
  }

  const handleSaveLook = () => {
    setSavedLook(createScheme(
      { platform: platform.trim(), useCase, items: selectedItems },
      [...(skinInterest ? [skinReferenceSrc] : []), clothingSrc(seriesId, outfitId), faceSrc(maskId), headwearSrc(headwearId), hairSrc(hairId), footwearSrc(footwearId), carrySrc(carryId), ...identityIds.map(identitySrc), ...appearanceIds.map(appearanceSrc)],
      `${location.pathname}${location.search}`
    ))
  }

  const platformPillars = [
    { titleZh: '单品外观参考', titleEn: 'Item appearance references', descZh: '按类别浏览设计效果图；单品图不代表完整组合或已验证适配。', descEn: 'Browse design renders by category. Item images do not represent a combined look or verified fit.', tone: 'electric' },
    { titleZh: '方案摘要与询盘', titleEn: 'From selection to inquiry', descZh: '复制或下载摘要，将配置、参考图和方案编号一起带入报价评估。', descEn: 'Copy or download your summary, then carry the configuration, reference images, and scheme ID into a quote request.', tone: 'cyber' },
    { titleZh: '未来一键下单', titleEn: 'One-click order · roadmap', descZh: '未来计划连接配置、订单意向与支付；当前接受定制评估与合作询盘。', descEn: 'A future path will connect configuration, order intent, and payment. Today, request a custom quote or explore a partnership.', tone: 'rose' }
  ]
  const flowSteps = [
    { step: '01', titleZh: '用途与机型', titleEn: 'Set your context', descZh: '提供用途与机型版本，适配情况需项目评估', descEn: 'Add your use case and platform version. Fit is assessed for each project.' },
    { step: '02', titleZh: '选配外观', titleEn: 'Select a look', descZh: '浏览单品参考图，挑选服装、面部、发型与配件', descEn: 'Explore item references for apparel, faces, hair, and accessories.' },
    { step: '03', titleZh: '生成方案与询盘', titleEn: 'Summarize & inquire', descZh: '复制或下载摘要，自动携带配置获取报价评估', descEn: 'Copy or download the summary and request a quote with your selection attached.' }
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
              {T('外观选配与单品参考', 'Appearance selection & item reference')}
            </span>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="mt-6 max-w-6xl font-display text-3xl font-bold leading-[1.12] tracking-tight sm:text-4xl lg:text-5xl">
              RoboFit<span className="text-gradient">™</span> {T('外观体验', 'Look Builder')}
            </h1>
          </Reveal>
          <Reveal delay={160}>
            <p className="mt-6 max-w-3xl text-base leading-relaxed text-white/55 sm:text-lg">
              {T(
                '外观选配与单品参考 — 非完整组合 3D 试衣。探索服装、面部、发型与配件，生成方案摘要并获取定制评估报价。',
                'Appearance selection & item reference — not a full combinatorial 3D try-on. Explore apparel, faces, hair, and accessories, then generate a look summary and request a quote.'
              )}
            </p>
          </Reveal>
          <Reveal delay={240}>
            <div className="mt-8 flex flex-wrap items-center gap-4 text-sm text-white/40">
              <span className="inline-flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2DE2FF" strokeWidth="2"><path d="M5 12l4 4L19 6" /></svg>
                {T('单品设计参考', 'Item design references')}
              </span>
              <span className="inline-flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2DE2FF" strokeWidth="2"><path d="M5 12l4 4L19 6" /></svg>
                {T('定制评估报价', 'Estimate on request')}
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
                src="/images/robowear/robofit-collection-banner-20261025.png"
                alt={T('三款机器人服装套装、发型与头部造型的宽幅外观定制宣传概念图', 'Wide appearance-customization concept featuring three robots with apparel sets, hair and head styling')}
                loading="lazy"
                className="aspect-[16/7] w-full object-cover"
              />
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
                  {T('搭配工坊 · 单品参考', 'Look studio · item reference')}
                </span>
                <h2 className="mt-2 font-display text-2xl font-bold text-white sm:text-[28px]">
                  {T('为机器人探索外观', 'Explore a look for your robot')}
                </h2>
              </div>
              <p className="max-w-md text-sm leading-relaxed text-white/40">
                {T(
                  '提供用途与机型，浏览单品参考图并选择外观。生成摘要后即可携带完整方案询盘。选配仅在当前页面保留，刷新前请复制或下载。',
                  'Add your context, browse item references, and select a look. Generate a summary to carry your full selection into an inquiry. Copy or download before refreshing; selections are held on this page only.'
                )}
              </p>
            </div>
          </Reveal>

          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            <div><label htmlFor="look-platform" className="mb-2 block text-sm text-white/65">{T('目标机型与版本（可选）', 'Target platform & version (optional)')}</label><input id="look-platform" value={platform} maxLength={160} onChange={e => setPlatform(e.target.value)} placeholder={T('例如：机型、版本与尺寸', 'Model, version, and dimensions')} className="input-field text-sm" /><p className="mt-2 text-xs text-white/40">{T('适配状态：概念参考，需项目验证', 'Fit status: concept reference, subject to project validation')}</p></div>
            <div><label htmlFor="look-use-case" className="mb-2 block text-sm text-white/65">{T('用途', 'Use case')}</label><select id="look-use-case" value={useCase} onChange={e => setUseCase(e.target.value)} className="input-field text-sm"><option value="Appearance customization">{T('外观定制', 'Appearance customization')}</option><option value="OEM project">{T('制造商项目', 'OEM project')}</option><option value="Brand styling">{T('品牌造型', 'Brand styling')}</option><option value="Creator collaboration">{T('创作者共创', 'Creator collaboration')}</option></select></div>
          </div>
          <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.12fr)_minmax(0,1fr)] xl:gap-12">
            {/* 左：3D 实时预览（吸顶常驻，左右对照） */}
            <div className="lg:sticky lg:top-24 lg:self-start">
              <Reveal direction="left">
                <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-carbon-800/70 to-carbon-900 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.7)]">
                  <style>{`@keyframes rwFade{from{opacity:0;transform:scale(1.015)}to{opacity:1;transform:scale(1)}}`}</style>

                  {/* 写实大图主预览：随当前展开板块切换聚焦渲染（带淡入过渡） */}
                  <div className="relative h-[420px] w-full sm:h-[480px] lg:h-[560px] xl:h-[600px]">
                    <img
                      key={`${previewSrc}-${imageAttempt}`}
                      src={previewSrc}
                      onLoad={() => setImageResult({ src: previewSrc, status: 'loaded' })}
                      onError={() => setImageResult({ src: previewSrc, status: 'error' })}
                      alt={previewAlt}
                      className="absolute inset-0 h-full w-full object-contain"
                      style={{ animation: 'rwFade 0.45s ease both' }}
                    />

                    {imageStatus === 'loading' && <p role="status" className="absolute left-5 top-20 text-xs text-electric-300">{T('参考图加载中…', 'Loading reference image…')}</p>}
                    {imageStatus === 'error' && <div role="alert" className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-carbon-900/90 text-sm"><p>{T('参考图加载失败', 'Reference image could not load')}</p><button onClick={() => { setImageResult({ src: previewSrc, status: 'loading' }); setImageAttempt(n => n + 1) }} className="rounded-full border border-white/30 px-5 py-2">{T('重试', 'Retry image')}</button></div>}
                  </div>

                  <div className="pointer-events-none absolute left-5 top-5 flex items-center gap-2 rounded-full border border-white/12 bg-carbon-900/60 px-3 py-1.5 text-[11px] text-white/55 backdrop-blur-md">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#2DE2FF" strokeWidth="2"><path d="M3 12a9 9 0 1018 0 9 9 0 00-18 0z" /><path d="M3 12h18M12 3a14 14 0 010 18 14 14 0 010-18z" /></svg>
                    {T('设计效果图 · 单品参考', 'Design render · item reference')}
                  </div>

                </div>
                <p className="mt-3 text-xs leading-6 text-white/45">{T('图片仅展示当前单品，不代表完整搭配。基础模型仅供查看比例，选配不会映射到模型。', 'The image shows the current item, not a combined outfit. The base model shows proportions only; selections are not applied to it.')}</p>
                <button onClick={() => { setShowBase(v => !v); setBaseError(false) }} aria-expanded={showBase} className="mt-3 text-xs text-electric-300 underline underline-offset-4">{showBase ? T('收起基础模型', 'Hide base platform proportions') : T('查看基础机型比例', 'View base platform proportions')}</button>
                {showBase && <div className="relative mt-3 overflow-hidden rounded-2xl border border-white/10"><div ref={mountRef} className="h-[260px] w-full cursor-grab" />{baseError && <p role="status" className="absolute inset-0 flex items-center justify-center bg-carbon-900 text-sm text-white/60">{T('基础模型暂不可用；单品选配可继续', 'Base model unavailable; item selection remains available')}</p>}<p className="px-4 pb-4 text-xs text-white/40">{T('基础机型比例参考 · 非适配验证', 'Base platform proportions · no verified fit claim')}</p></div>}

                {/* 预估总价 + 保存搭配 CTA */}
                <div className="mt-5 flex flex-col gap-4 rounded-2xl border border-electric-500/25 bg-gradient-to-r from-electric-500/[0.07] via-cyber-500/[0.04] to-transparent p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-[11px] uppercase tracking-widest2 text-white/35">{T('当前方案', 'Your look')}</p>
                    <p className="mt-1 font-display text-xl font-bold text-gradient">{T('定制评估报价', 'Estimate on request')}</p>
                    <p className="mt-1 text-[11px] text-white/30">{T('按材料、结构与适配要求评估', 'Based on materials, construction, and platform requirements')}</p>
                  </div>
                  <button
                    onClick={handleSaveLook}
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-electric-500 to-cyber-500 px-6 py-3 text-sm font-semibold text-carbon-900 shadow-[0_0_28px_rgba(45,226,255,0.35)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_40px_rgba(45,226,255,0.5)]"
                  >
                    {T('生成方案摘要', 'Generate look summary')}
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
                  onSubcategoryChange={id => { setActiveSubcategory(id); if (id === 'skin-custom') setSkinInterest(true) }}
                  seriesId={seriesId}
                  onSeriesChange={handleSeriesChange}
                  outfitId={outfitId}
                  onOutfitChange={setOutfitId}
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

                <div className="rounded-2xl border border-white/10 bg-carbon-800/40 p-5">
                  <h3 className="font-display text-base font-semibold">{T('已选清单', 'Your selection')}</h3>
                  <ul className="mt-4 divide-y divide-white/10 text-sm">
                    {selectedItems.map(item => <li key={`${item.category}-${item.id}`} className="flex items-start justify-between gap-4 py-3"><span className="text-white/70">{T(item.labelZh, item.labelEn)}</span><span className="shrink-0 text-xs text-electric-300">{item.pricingStatus === 'included' ? T('未添加', 'No add-on') : T('待评估', 'To assess')}</span></li>)}
                  </ul>
                  <p className="mt-4 text-xs leading-6 text-white/45">{T('所有外观为概念参考，材料、结构和连接方式需按机型验证；报价与形象族裔命名无关。', 'All looks are concept references. Materials, construction, and mounting need platform-specific validation. Heritage labels do not determine pricing.')}</p>
                  {skinInterest && <button onClick={() => setSkinInterest(false)} className="mt-3 text-xs text-white/55 underline underline-offset-4">{T('移除皮肤研发咨询意向', 'Remove skin R&D interest')}</button>}
                  <button onClick={handleSaveLook} className="mt-5 w-full rounded-full border border-electric-400/50 px-5 py-3 text-sm font-semibold text-electric-300">{T('生成方案摘要', 'Generate look summary')}</button>
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
              RoboFit™ {T('体验与路线图', 'Experience & roadmap')}
            </span>
            <h2 className="mt-5 max-w-2xl font-display text-3xl font-bold leading-snug sm:text-4xl">
              {T('从外观灵感，', 'From appearance inspiration')}
              <br />
              {T('到可讨论的定制方案', 'to a custom project brief')}
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/50 sm:text-base">
              {T(
                '当前可浏览外观、生成摘要并提交询盘。组合 3D、设计师交易与 AI 助手属于未来规划；一键下单将在后续阶段探索。',
                'Today you can explore looks, generate a summary, and submit an inquiry. Combined 3D fitting, a creator marketplace, and AI assistance are future plans. One-click ordering is on the roadmap.'
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
                capZh: '概念作品 · 设计师工作室',
                capEn: 'Concept work · Designer studio'
              },
              {
                filename: 'robofit-community-group.webp',
                labelZh: '多台机器人穿着不同 RoboWear 服装合影，社区感与品牌大秀感',
                labelEn: 'A group of robots in different RoboWear looks — community spirit meets runway energy',
                capZh: '概念作品 · 机器人造型',
                capEn: 'Concept work · Robot looks'
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
                  {T('欢迎提交原创作品与共创方向，合作范围将逐项商议。', 'Share original work and co-creation ideas. We will discuss the scope of each collaboration.')}
                </p>
              </div>
              <Link
                to="/contact?type=creator"
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
