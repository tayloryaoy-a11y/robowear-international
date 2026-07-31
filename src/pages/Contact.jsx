import { useState, useEffect } from 'react'
import { useLanguage } from '../context/LanguageContext.jsx'
import Reveal from '../components/Reveal.jsx'
import { IconX, IconYouTube, IconTikTok, IconDouyin, IconInstagram } from '../components/icons.jsx'

const INQUIRY_TYPES = [
  { id: 'general', zh: '一般咨询', en: 'General inquiry' },
  { id: 'wholesale', zh: '批发采购', en: 'Wholesale & bulk orders' },
  { id: 'partnership', zh: '商务合作', en: 'Brand partnerships' },
  { id: 'designer', zh: '设计师入驻', en: 'Designer program' },
  { id: 'press', zh: '媒体采访', en: 'Press & media' }
]

const OFFICES = [
  {
    cityZh: '成都',
    cityEn: 'Chengdu',
    roleZh: '供应链与运营中心',
    roleEn: 'Supply chain & operations hub',
    addrZh: '中国四川省成都市高新区天府大道中段',
    addrEn: 'Tianfu Ave, Hi-Tech Zone, Chengdu, Sichuan, China',
    tone: 'electric',
    image: 'office-chengdu.webp'
  },
  {
    cityZh: '洛杉矶',
    cityEn: 'Los Angeles',
    roleZh: '研发与品牌中心',
    roleEn: 'R&D & brand center',
    addrZh: '美国加利福尼亚州洛杉矶市艺术区',
    addrEn: 'Arts District, Los Angeles, California, USA',
    tone: 'cyber',
    image: 'office-losangeles.webp'
  },
  {
    cityZh: '香港',
    cityEn: 'Hong Kong',
    roleZh: '国际融资与资本运作',
    roleEn: 'International financing & capital ops',
    addrZh: '中国香港特别行政区中环金融街',
    addrEn: 'Central Financial District, Hong Kong SAR, China',
    tone: 'rose',
    image: 'office-hongkong.webp'
  },
  {
    cityZh: '北京',
    cityEn: 'Beijing',
    roleZh: '产业资源整合中心',
    roleEn: 'Industry resource integration center',
    addrZh: '中国北京市',
    addrEn: 'Beijing, China',
    tone: 'cyber',
    image: 'office-beijing.webp'
  }
]

const social = [
  { Icon: IconX, label: 'X (Twitter)' },
  { Icon: IconYouTube, label: 'YouTube' },
  { Icon: IconTikTok, label: 'TikTok' },
  { Icon: IconDouyin, label: '抖音 Douyin' },
  { Icon: IconInstagram, label: 'Instagram' }
]

const officeTone = {
  electric: 'border-electric-500/25 bg-electric-500/[0.05]',
  cyber: 'border-cyber-500/25 bg-cyber-500/[0.06]',
  rose: 'border-pink-400/20 bg-pink-400/[0.05]'
}

// 品牌信条轮播文案 —— 用于"直接联系"卡片旁的动态大字板块（参考苹果官网式的大字企业价值观滚动展示）
const BRAND_PULSES = [
  { zh: '功能优先', en: 'Function First' },
  { zh: '规模化个性', en: 'Personalization at Scale' },
  { zh: '人机和谐', en: 'Human-Robot Harmony' },
  { zh: '为硅基文明，穿上它应有的样子', en: 'Dressing the silicon civilization in the identity it deserves' },
  { zh: '机器人时代的 Nike', en: 'The Nike of the robotic era' }
]

/**
 * 品牌信条动态大字板块
 * 纯前端实现：仅用 useState/useEffect 管理轮播索引与淡出过渡状态，
 * 不依赖 localStorage / sessionStorage，组件卸载时清理定时器。
 */
function BrandPulse({ T }) {
  const [index, setIndex] = useState(0)
  const [fading, setFading] = useState(false)

  useEffect(() => {
    const cycle = setInterval(() => {
      setFading(true)
      const swap = setTimeout(() => {
        setIndex((i) => (i + 1) % BRAND_PULSES.length)
        setFading(false)
      }, 420)
      return () => clearTimeout(swap)
    }, 3800)
    return () => clearInterval(cycle)
  }, [])

  const current = BRAND_PULSES[index]

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-carbon-800/60 to-carbon-800/20 p-6 sm:p-8">
      <div className="absolute inset-0 -z-10 bg-hero-glow opacity-25" />
      <div className="absolute inset-0 -z-10 bg-tech-grid opacity-[0.04]" />
      <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest2 text-white/35">
        <span className="h-1.5 w-1.5 rounded-full bg-electric-500 animate-pulseGlow" />
        {T('品牌信条', 'Brand Ethos')}
      </span>
      <p
        className={`mt-5 min-h-[5.5rem] font-display text-2xl font-bold leading-tight tracking-tight transition-all duration-500 ease-out sm:text-[1.75rem] ${
          fading ? 'translate-y-3 opacity-0' : 'translate-y-0 opacity-100'
        }`}
      >
        <span className="text-gradient">{T(current.zh, current.en)}</span>
      </p>
      <div className="mt-6 flex items-center gap-2">
        {BRAND_PULSES.map((_, i) => (
          <span
            key={i}
            className={`h-1 rounded-full transition-all duration-500 ${
              i === index ? 'w-8 bg-electric-400' : 'w-2.5 bg-white/15'
            }`}
          />
        ))}
      </div>
    </div>
  )
}

const initialForm = { name: '', company: '', email: '', phone: '', inquiryType: 'general', message: '' }

function validateForm(form, T) {
  const errors = {}
  if (!form.name.trim()) errors.name = T('请填写您的姓名', 'Please enter your name')
  if (!form.email.trim()) {
    errors.email = T('请填写邮箱地址', 'Please enter your email address')
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    errors.email = T('邮箱格式不正确，请检查后重试', 'That email address looks invalid — please check and try again')
  }
  if (form.phone.trim() && !/^[+\d][\d\s-]{6,}$/.test(form.phone.trim())) {
    errors.phone = T('电话号码格式不正确', 'That phone number looks invalid')
  }
  if (!form.message.trim()) {
    errors.message = T('请填写您想说的内容', 'Please tell us what’s on your mind')
  } else if (form.message.trim().length < 10) {
    errors.message = T('内容至少需要 10 个字符，方便我们更好地理解您的需求', 'Please write at least 10 characters so we can understand your needs')
  }
  return errors
}

function FieldError({ message }) {
  if (!message) return null
  return <p className="mt-1.5 text-xs text-pink-400">{message}</p>
}

export default function Contact() {
  const { T } = useLanguage()
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)

  const updateField = (key) => (e) => {
    const value = e.target.value
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const validation = validateForm(form, T)
    setErrors(validation)
    if (Object.keys(validation).length === 0) {
      setSubmitted(true)
    }
  }

  const handleReset = () => {
    setForm(initialForm)
    setErrors({})
    setSubmitted(false)
  }

  return (
    <div className="bg-carbon-900">
      {/* ---------------- Hero ---------------- */}
      <section className="relative overflow-hidden pb-14 pt-32 sm:pt-36">
        <img
          src="/images/robowear/contact-bg.webp"
          alt=""
          aria-hidden="true"
          loading="lazy"
          className="absolute inset-0 -z-20 h-full w-full object-cover opacity-40"
        />
        <div className="absolute inset-0 -z-20 bg-gradient-to-b from-carbon-900/75 via-carbon-900/85 to-carbon-900" />
        <div className="absolute inset-0 -z-10 bg-hero-glow opacity-60" />
        <div className="absolute inset-0 -z-10 bg-tech-grid opacity-[0.05]" />
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-electric-500/30 bg-electric-500/10 px-4 py-1.5 text-xs font-semibold tracking-wide text-electric-300">
              {T('联系我们', 'Contact Us')}
            </span>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="mt-6 max-w-6xl font-display text-3xl font-bold leading-[1.15] tracking-tight sm:text-4xl lg:text-5xl">
              {T('无论是合作、采购，还是一个想法——我们都想听听', 'Partnership, order, or just an idea — we want to hear it')}
            </h1>
          </Reveal>
          <Reveal delay={160}>
            <p className="mt-6 max-w-4xl text-base leading-relaxed text-white/55">
              {T(
                '填写下方表单，或直接通过邮箱与我们的全球团队取得联系。我们通常会在 1–2 个工作日内回复。',
                'Fill out the form below or reach our global team directly by email. We typically reply within 1–2 business days.'
              )}
            </p>
          </Reveal>
        </div>
      </section>

      {/* ---------------- 表单 + 联系信息 ---------------- */}
      <section className="pb-24">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-5 sm:px-8 lg:grid-cols-[1.2fr_0.8fr] lg:px-10">
          {/* 表单 */}
          <Reveal direction="left">
            <div className="rounded-3xl border border-white/10 bg-carbon-800/40 p-6 sm:p-8">
              {submitted ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <span className="flex h-16 w-16 items-center justify-center rounded-full border border-electric-500/40 bg-electric-500/10 text-electric-300">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M5 12l4 4L19 6" /></svg>
                  </span>
                  <h3 className="mt-6 font-display text-2xl font-bold text-white">{T('已收到您的留言', 'Message received')}</h3>
                  <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/50">
                    {T(
                      `感谢 ${form.name || ''} 与我们联系！这是一个纯前端演示表单（未连接后端），但在真实环境中，我们的团队会在 1–2 个工作日内通过 ${form.email} 与您取得联系。`,
                      `Thanks for reaching out${form.name ? `, ${form.name}` : ''}! This is a front-end-only demo form (no backend is connected yet) — in production, our team would follow up at ${form.email} within 1–2 business days.`
                    )}
                  </p>
                  <button
                    onClick={handleReset}
                    className="mt-7 inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-2.5 text-sm font-semibold text-white/70 transition-colors hover:border-white/30 hover:text-white"
                  >
                    {T('再发送一条', 'Send another message')}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate className="space-y-5">
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest2 text-white/40">
                        {T('姓名', 'Full name')} <span className="text-pink-400">*</span>
                      </label>
                      <input type="text" value={form.name} onChange={updateField('name')} placeholder={T('您的姓名', 'Your name')} className="input-field" />
                      <FieldError message={errors.name} />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest2 text-white/40">{T('公司 / 机构', 'Company / Organization')}</label>
                      <input type="text" value={form.company} onChange={updateField('company')} placeholder={T('选填', 'Optional')} className="input-field" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest2 text-white/40">
                        {T('邮箱地址', 'Email address')} <span className="text-pink-400">*</span>
                      </label>
                      <input type="email" value={form.email} onChange={updateField('email')} placeholder="you@example.com" className="input-field" />
                      <FieldError message={errors.email} />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest2 text-white/40">{T('电话', 'Phone')}</label>
                      <input type="tel" value={form.phone} onChange={updateField('phone')} placeholder={T('选填', 'Optional')} className="input-field" />
                      <FieldError message={errors.phone} />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest2 text-white/40">{T('咨询类型', 'Inquiry type')}</label>
                    <select value={form.inquiryType} onChange={updateField('inquiryType')} className="input-field appearance-none">
                      {INQUIRY_TYPES.map((opt) => (
                        <option key={opt.id} value={opt.id} className="bg-carbon-800">
                          {T(opt.zh, opt.en)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest2 text-white/40">
                      {T('您想说的内容', 'Your message')} <span className="text-pink-400">*</span>
                    </label>
                    <textarea
                      rows={5}
                      value={form.message}
                      onChange={updateField('message')}
                      placeholder={T('请简单描述您的需求或想法……', 'Briefly describe your needs or idea…')}
                      className="input-field resize-none"
                    />
                    <div className="mt-1.5 flex items-center justify-between">
                      <FieldError message={errors.message} />
                      <span className="ml-auto text-[11px] text-white/25">{form.message.trim().length} / 10+</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-electric-500 to-cyber-500 px-6 py-3.5 text-sm font-semibold text-carbon-900 shadow-[0_0_28px_rgba(45,226,255,0.3)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_40px_rgba(45,226,255,0.45)] sm:w-auto"
                  >
                    {T('发送消息', 'Send message')}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                  </button>
                  <p className="text-[11px] text-white/30">
                    {T('* 为必填项 · 这是一个纯前端演示表单，提交内容仅保存在当前页面状态中，不会被发送或持久化存储。', '* Required fields · This is a front-end-only demo form — submitted content stays in this page’s state and is never sent or persisted.')}
                  </p>
                </form>
              )}
            </div>
          </Reveal>

          {/* 联系信息 + 品牌信条 */}
          <Reveal direction="right" delay={80}>
            <div className="space-y-6">
              <div className="rounded-3xl border border-white/10 bg-carbon-800/40 p-6">
                <h3 className="font-display text-sm font-semibold uppercase tracking-widest2 text-white/70">{T('直接联系', 'Direct Contact')}</h3>
                <a href="mailto:tayloryaoy@gmail.com" className="mt-4 block text-base font-semibold text-electric-300 transition-colors hover:text-electric-200">
                  tayloryaoy@gmail.com
                </a>
                <p className="mt-1.5 text-sm text-white/45">+86 13458670416</p>
                <div className="mt-5 flex items-center gap-2.5">
                  {social.map(({ Icon, label }) => (
                    <a
                      key={label}
                      href="#"
                      aria-label={label}
                      onClick={(e) => e.preventDefault()}
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-white/12 text-white/50 transition-all duration-300 hover:-translate-y-1 hover:border-electric-400/60 hover:text-electric-300"
                    >
                      <Icon />
                    </a>
                  ))}
                </div>
              </div>

              {/* Apple 风格动态大字品牌信条轮播 —— 填充原本因办公室卡片堆叠而产生的左侧留白 */}
              <BrandPulse T={T} />

              <div className="rounded-3xl border border-white/10 bg-carbon-800/40 p-6">
                <h3 className="font-display text-sm font-semibold uppercase tracking-widest2 text-white/70">{T('全球版图', 'Global Footprint')}</h3>
                <div className="mt-5 grid grid-cols-3 gap-3 text-center">
                  <div>
                    <p className="font-display text-2xl font-bold text-white">{OFFICES.length}</p>
                    <p className="mt-1 text-[11px] leading-snug text-white/40">{T('城市据点', 'City hubs')}</p>
                  </div>
                  <div>
                    <p className="font-display text-2xl font-bold text-white">2</p>
                    <p className="mt-1 text-[11px] leading-snug text-white/40">{T('国家 / 地区', 'Countries & regions')}</p>
                  </div>
                  <div>
                    <p className="font-display text-2xl font-bold text-white">2026</p>
                    <p className="mt-1 text-[11px] leading-snug text-white/40">{T('品牌创立', 'Founded')}</p>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>

        {/* ---------------- 全球据点：横向一排展示，避免与表单高度错位造成的留白 ---------------- */}
        <div className="mx-auto mt-16 max-w-7xl px-5 sm:px-8 lg:px-10">
          <Reveal>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h3 className="font-display text-xl font-bold text-white sm:text-2xl">{T('全球据点', 'Global Offices')}</h3>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/45">
                  {T(
                    '从供应链到品牌，从研发到资本——四座城市，一个统一的全球团队。',
                    'From supply chain to brand, from R&D to capital — four cities, one unified global team.'
                  )}
                </p>
              </div>
              <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/12 px-4 py-1.5 text-xs font-medium text-white/45">
                <span className="h-1.5 w-1.5 rounded-full bg-electric-500 animate-pulseGlow" />
                {T('总部：洛杉矶 ｜ 成都 ｜ 香港 ｜ 北京', 'HQ: Los Angeles · Chengdu · Hong Kong · Beijing')}
              </span>
            </div>
          </Reveal>

          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {OFFICES.map((office, i) => (
              <Reveal key={office.cityZh} delay={i * 90}>
                <div className={`group h-full overflow-hidden rounded-2xl border transition-all duration-300 hover:-translate-y-1 ${officeTone[office.tone]}`}>
                  <div className="relative overflow-hidden">
                    <img
                      src={`/images/robowear/${office.image}`}
                      alt={T(`${office.cityZh}办公室所在城市天际线`, `${office.cityEn} office — city skyline`)}
                      loading="lazy"
                      className="aspect-[16/11] w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-carbon-900/85 via-transparent to-transparent" />
                    <span className="absolute bottom-3 left-4 text-xs font-semibold uppercase tracking-widest2 text-white/70">
                      {T(office.roleZh, office.roleEn)}
                    </span>
                  </div>
                  <div className="p-6">
                    <h4 className="font-display text-lg font-semibold text-white">{T(office.cityZh, office.cityEn)}</h4>
                    <p className="mt-2.5 flex items-start gap-2 text-sm text-white/45">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mt-0.5 shrink-0 text-white/30">
                        <path d="M12 22s8-7 8-12a8 8 0 10-16 0c0 5 8 12 8 12z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      {T(office.addrZh, office.addrEn)}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
