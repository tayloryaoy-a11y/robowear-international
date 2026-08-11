// 统一线性描边图标集合（线宽一致，科技感风格）
// 按照图片资源清单中"代码生成"类目实现，无需额外出图

const base = {
  width: 28,
  height: 28,
  viewBox: '0 0 48 48',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round'
}

/* ---------- 首页三大核心价值图标 ---------- */

export function IconFunctionFirst(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="24" cy="24" r="16" />
      <path d="M24 14v10l7 4" />
      <path d="M24 6v4M24 38v4M6 24h4M38 24h4" />
    </svg>
  )
}

export function IconPersonalization(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="17" cy="17" r="6" />
      <circle cx="31" cy="31" r="6" />
      <path d="M21 21l6 6" />
      <path d="M14 31a7 7 0 0 1 7-3M34 17a7 7 0 0 1-7 3" strokeDasharray="2 4" />
    </svg>
  )
}

export function IconHarmony(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="18" cy="18" r="9" />
      <circle cx="30" cy="30" r="9" opacity="0.55" />
      <path d="M21 21l6 6" />
    </svg>
  )
}

/* ---------- 六大工程约束图标 ---------- */

export function IconThermal(props) {
  return (
    <svg {...base} {...props}>
      <path d="M22 6c4 4-2 7 0 11s6 2 6 6a8 8 0 0 1-16 0c0-3 2-4 3-7 1 3 3 3 4 1 1-2-1-4-1-7s2-3 4-4z" />
      <path d="M14 38h20" strokeDasharray="2 3" />
    </svg>
  )
}

export function IconSensor(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="24" cy="24" r="5" />
      <path d="M24 13a11 11 0 0 1 11 11M24 8a16 16 0 0 1 16 16M24 19a5 5 0 0 1 5 5" opacity="0.7" />
      <path d="M16 24a8 8 0 0 1 8-8" opacity="0.4" />
    </svg>
  )
}

export function IconMotion(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="24" cy="12" r="4" />
      <path d="M24 16v10l-7 12M24 26l7 12M17 22l-6 4M31 22l6 4" />
    </svg>
  )
}

export function IconCharge(props) {
  return (
    <svg {...base} {...props}>
      <rect x="14" y="8" width="20" height="32" rx="4" />
      <path d="M26 14l-7 11h6l-2 9 9-13h-6l0-7z" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function IconFireSafety(props) {
  return (
    <svg {...base} {...props}>
      <path d="M24 6L8 22a14 14 0 1 0 32 0L24 6z" />
      <path d="M24 24l6 6-6 6-6-6 6-6z" opacity="0.6" />
    </svg>
  )
}

export function IconCompliance(props) {
  return (
    <svg {...base} {...props}>
      <path d="M24 5l14 5v10c0 10-6 17-14 23-8-6-14-13-14-23V10l14-5z" />
      <path d="M18 24l4 4 8-9" />
    </svg>
  )
}

/* ---------- 时间轴节点图标（公司发展阶段） ---------- */

export function IconSeed(props) {
  return (
    <svg {...base} {...props}>
      <path d="M24 42V22" />
      <path d="M24 22c0-8-6-12-14-12 0 8 6 12 14 12zM24 22c0-6 5-9 12-9 0 6-5 9-12 9z" />
    </svg>
  )
}

export function IconLaunch(props) {
  return (
    <svg {...base} {...props}>
      <path d="M24 6c5 4 8 11 8 18 0 4-2 8-8 12-6-4-8-8-8-12 0-7 3-14 8-18z" />
      <circle cx="24" cy="20" r="3" />
      <path d="M18 32l-5 8M30 32l5 8" />
    </svg>
  )
}

export function IconExpand(props) {
  return (
    <svg {...base} {...props}>
      <rect x="8" y="8" width="14" height="14" rx="2" />
      <rect x="26" y="8" width="14" height="14" rx="2" opacity="0.5" />
      <rect x="8" y="26" width="14" height="14" rx="2" opacity="0.5" />
      <rect x="26" y="26" width="14" height="14" rx="2" opacity="0.25" />
    </svg>
  )
}

export function IconGlobal(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="24" cy="24" r="16" />
      <ellipse cx="24" cy="24" rx="7" ry="16" />
      <path d="M8 24h32M10 16h28M10 32h28" />
    </svg>
  )
}

/* ---------- 客户类型墙图标 ---------- */

export function IconConsumer(props) {
  return (
    <svg {...base} {...props}>
      <circle cx="24" cy="16" r="6" />
      <path d="M12 40c0-8 5-12 12-12s12 4 12 12" />
    </svg>
  )
}

export function IconEnterprise(props) {
  return (
    <svg {...base} {...props}>
      <rect x="9" y="14" width="14" height="26" rx="1.5" />
      <rect x="25" y="22" width="14" height="18" rx="1.5" />
      <path d="M13 19h6M13 24h6M13 29h6M29 27h6M29 32h6" />
    </svg>
  )
}

export function IconManufacturer(props) {
  return (
    <svg {...base} {...props}>
      <path d="M8 40V22l8 6V22l8 6V22l8 6v12H8z" />
      <path d="M8 40h32" />
      <circle cx="33" cy="14" r="3" />
    </svg>
  )
}

/* ---------- 社交媒体图标（X / YouTube / TikTok / 抖音 / Instagram） ---------- */

const socialBase = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'currentColor' }

export function IconX(props) {
  return (
    <svg {...socialBase} {...props}>
      <path d="M18.244 2H21.5l-7.51 8.59L22.8 22h-6.92l-5.43-7.09L4.2 22H1l8.04-9.19L1.4 2h7.1l4.92 6.5L18.24 2zm-1.21 18h1.92L7.05 4H5l11.03 16z" />
    </svg>
  )
}

export function IconYouTube(props) {
  return (
    <svg {...socialBase} {...props}>
      <path d="M22 12s0-3.2-.4-4.6a3 3 0 0 0-2.1-2.1C18.1 5 12 5 12 5s-6.1 0-7.5.3a3 3 0 0 0-2.1 2.1C2 8.8 2 12 2 12s0 3.2.4 4.6a3 3 0 0 0 2.1 2.1C5.9 19 12 19 12 19s6.1 0 7.5-.3a3 3 0 0 0 2.1-2.1c.4-1.4.4-4.6.4-4.6zM10 15.2V8.8L15.5 12 10 15.2z" />
    </svg>
  )
}

export function IconTikTok(props) {
  return (
    <svg {...socialBase} {...props}>
      <path d="M16.6 5.5c.8.8 1.9 1.4 3.1 1.5v2.6a6.3 6.3 0 0 1-3.5-1.1v6.4a5.3 5.3 0 1 1-4.6-5.3v2.7a2.7 2.7 0 1 0 1.9 2.6V2h3v.4c0 1.1.4 2.2 1.1 3.1z" />
    </svg>
  )
}

export function IconWeibo(props) {
  return (
    <svg {...socialBase} {...props}>
      <path d="M21.6 9.7c-.5-1.4-2.2-1.8-3.8-1.1.1-.4.2-.8.2-1.2 0-2.1-2.1-3.5-4.5-3.5-2.8 0-5.8 1.7-7.8 4.3C3.5 11 2.4 14 3.2 16.4 4.2 19.5 8 21 12 20.8c5.4-.2 9.6-3.2 9.6-6.7 0-1.1-.4-2-1.2-2.8 1-.3 1.6-.9 1.2-1.6zM11.4 18.4c-3.2.3-6-1.1-6.2-3.3-.3-2.1 2-4.2 5.2-4.6 3.2-.3 6 1.1 6.2 3.3.3 2.2-2 4.2-5.2 4.6z" />
      <path d="M15.8 9.2a.8.8 0 0 1-.8-.9c.2-1.4-.8-2.7-2.2-2.9a.8.8 0 0 1 .2-1.6 4.2 4.2 0 0 1 3.6 4.7.8.8 0 0 1-.8.7z" />
      <path d="M18.8 9.3a.8.8 0 0 1-.8-.9c.4-3.2-1.8-6.1-5-6.5a.8.8 0 1 1 .2-1.6 7.4 7.4 0 0 1 6.4 8.3.8.8 0 0 1-.8.7z" />
      <ellipse cx="10.8" cy="14.8" rx="3.1" ry="2.4" fill="none" stroke="currentColor" strokeWidth="1.35" />
      <circle cx="10" cy="14.2" r=".9" />
    </svg>
  )
}

export function IconDouyin(props) {
  return (
    <svg {...socialBase} {...props}>
      <path d="M14 2h2.9c.2 1.6 1.5 3 3.1 3.3V8c-1.4 0-2.7-.4-3.8-1.2v6.7a5.6 5.6 0 1 1-5.6-5.6c.3 0 .6 0 .9.1v2.8a2.8 2.8 0 1 0 1.9 2.7V2h.6z" />
    </svg>
  )
}

export function IconInstagram(props) {
  return (
    <svg {...socialBase} {...props}>
      <rect x="2.5" y="2.5" width="19" height="19" rx="5" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="4.6" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="17.4" cy="6.6" r="1.2" />
    </svg>
  )
}

/* ---------- 技术专利图标（5 项核心专利） ---------- */

export function IconCube3D(props) {
  return (
    <svg {...base} {...props}>
      <path d="M24 6l16 9v18l-16 9-16-9V15l16-9z" />
      <path d="M8 15l16 9 16-9M24 24v18" />
    </svg>
  )
}

/* ---------- 三机型轮廓剪影（简化线性轮廓） ---------- */

export function IconRobotSilhouette(props) {
  return (
    <svg viewBox="0 0 60 120" width="48" height="96" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <circle cx="30" cy="18" r="12" />
      <rect x="14" y="34" width="32" height="42" rx="8" />
      <rect x="6" y="38" width="10" height="34" rx="5" />
      <rect x="44" y="38" width="10" height="34" rx="5" />
      <rect x="17" y="78" width="11" height="34" rx="5" />
      <rect x="32" y="78" width="11" height="34" rx="5" />
    </svg>
  )
}

/* ---------- RoboFit 配置器 · 选配可视化图标（Tesla 选配卡片风格） ---------- */

export function IconApparelTag(props) {
  return (
    <svg {...base} {...props}>
      <path d="M24 6L9 21a4 4 0 000 6l12 12a4 4 0 006 0l15-15a4 4 0 000-6L30 6a4 4 0 00-6 0z" />
      <circle cx="33" cy="15" r="2.6" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function IconMaskFace(props) {
  return (
    <svg {...base} {...props}>
      <path d="M24 6c-9 0-15 6.5-15 16 0 11 6.7 20 15 20s15-9 15-20c0-9.5-6-16-15-16z" />
      <path d="M16 23c2-2 5-2 7 0M25 23c2-2 5-2 7 0" />
      <path d="M19 33c1.6 1.6 3.3 2.4 5 2.4s3.4-.8 5-2.4" />
    </svg>
  )
}

export function IconHairWisp(props) {
  return (
    <svg {...base} {...props}>
      <path d="M14 20c0-7 4.5-12 10-12s10 5 10 12c0 3-1 5-1 9v9" />
      <path d="M14 20c-1.5 4-2 9-1 17M22 17c-.6 7 0 14 0 22M30 17c.8 7 .3 14 .3 22" />
    </svg>
  )
}

export function IconBackpack(props) {
  return (
    <svg {...base} {...props}>
      <path d="M17 18v-3a7 7 0 0114 0v3" />
      <rect x="13" y="18" width="22" height="24" rx="5" />
      <path d="M19 26h10M19 32h7" />
      <path d="M21 18v6M27 18v6" />
    </svg>
  )
}

export function IconSneaker(props) {
  return (
    <svg {...base} {...props}>
      <path d="M8 33c0-5 3-9 8-11l9-4 5 5 9 2c3 .8 5 2.6 5 5.5V36a2 2 0 01-2 2H10a2 2 0 01-2-2v-3z" />
      <path d="M16 22l4 5M24 19l3.5 6M8 33h34" />
    </svg>
  )
}

export function IconSwatchOff(props) {
  return (
    <svg {...base} {...props}>
      <rect x="9" y="9" width="30" height="30" rx="8" />
      <path d="M14 34L34 14" />
    </svg>
  )
}
