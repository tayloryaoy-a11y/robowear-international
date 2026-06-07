import { useLanguage } from '../context/LanguageContext.jsx'

/**
 * 图片占位组件
 * 按照《RoboWear 网站图片资源清单》的规范渲染统一风格的占位视觉，
 * 每个占位块清晰标注：建议文件名 / 建议尺寸 / 内容描述 / 风格提示词方向，
 * 方便后续用 AI 生图或实拍素材直接替换（只需把 <PlaceholderImage> 换成 <img>）。
 *
 * props:
 *  - labelZh / labelEn: 内容描述（中/英）
 *  - hintZh / hintEn: 风格 / 提示词方向（中/英）
 *  - size: 建议尺寸文案，例如 "1920×1080"
 *  - filename: 建议文件名，例如 "hero-main.webp"
 *  - tone: 配色基调 'blue' | 'violet' | 'rose' | 'silver'
 *  - ratio: Tailwind 宽高比类，例如 'aspect-[4/3]'
 *  - icon: 可选的装饰 SVG 图标节点
 */
export default function PlaceholderImage({
  labelZh,
  labelEn,
  hintZh,
  hintEn,
  size,
  filename,
  tone = 'blue',
  ratio = 'aspect-[4/3]',
  className = '',
  compact = false
}) {
  const { lang, T } = useLanguage()

  const tones = {
    blue: 'from-electric-500/25 via-carbon-700 to-cyber-500/20',
    violet: 'from-cyber-500/25 via-carbon-700 to-electric-500/15',
    rose: 'from-[#FF5CA8]/20 via-carbon-700 to-cyber-500/20',
    silver: 'from-metalsilver/15 via-carbon-700 to-electric-500/10'
  }

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br ${tones[tone]} ${ratio} ${className} group`}
      role="img"
      aria-label={lang === 'zh' ? labelZh : labelEn}
    >
      {/* 网格纹理叠加，营造科技感占位质地 */}
      <div className="absolute inset-0 bg-tech-grid opacity-40" />
      {/* 角落标签：建议尺寸 + 文件名 */}
      <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full border border-white/15 bg-carbon-900/60 px-2.5 py-1 text-[10px] uppercase tracking-widest2 text-white/60 backdrop-blur-sm">
        <span className="h-1.5 w-1.5 rounded-full bg-electric-500 animate-pulseGlow" />
        {T('占位图', 'Placeholder')} {size ? `· ${size}` : ''}
      </div>
      {filename && (
        <div className="absolute top-3 right-3 rounded-full border border-white/10 bg-carbon-900/60 px-2.5 py-1 font-mono text-[10px] text-white/40 backdrop-blur-sm">
          {filename}
        </div>
      )}

      {/* 中心内容：图标 + 描述 + 风格提示 */}
      <div className="relative flex h-full w-full flex-col items-center justify-center gap-3 px-6 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-electric-500/40 bg-carbon-900/50 text-electric-400 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <rect x="3" y="3" width="18" height="18" rx="3" />
            <circle cx="8.5" cy="8.5" r="1.6" />
            <path d="M21 15l-5-5L5 21" />
          </svg>
        </div>
        {!compact && (
          <p className="max-w-xs text-sm font-medium leading-relaxed text-white/80">
            {lang === 'zh' ? labelZh : labelEn}
          </p>
        )}
        {!compact && (hintZh || hintEn) && (
          <p className="max-w-xs text-xs leading-relaxed text-white/40">
            {T('风格提示：', 'Style cue: ')}
            {lang === 'zh' ? hintZh : hintEn}
          </p>
        )}
      </div>

      {/* 悬停时呈现的扫光效果 */}
      <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
    </div>
  )
}
