import { Link } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext.jsx'
import Reveal from '../components/Reveal.jsx'

const pillars = [
  {
    titleZh: '外观设计与工程', titleEn: 'Looks with engineering constraints',
    descZh: '从面部、发型与头饰到服装、软性外覆和配件，围绕目标机型讨论设计、打样与适配。',
    descEn: 'Faces, hair and headwear, apparel, soft covers, and accessories — discussed through design, sampling, and platform-specific fit.', tone: 'electric'
  },
  {
    titleZh: '供应链与校企共研', titleEn: 'Supply chain × university co-development',
    descZh: '结合中国供应链的打样与制造资源、高校联合开发能力，围绕材料、结构和外观表达推进项目。',
    descEn: 'Combine China supply-chain speed with university co-development to explore materials, structure, and visual expression.', tone: 'cyber'
  },
  {
    titleZh: '定制项目与合作', titleEn: 'Custom projects & partnerships',
    descZh: '欢迎制造商、品牌与创作者提出需求；先明确用途、机型、材料与验证边界，再评估方案和报价。',
    descEn: 'OEMs, brands, and creators are welcome. Define the use case, platform, materials, and validation scope before a proposal and estimate.', tone: 'rose'
  }
]

const toneClass = {
  electric: 'border-electric-500/25 bg-electric-500/[0.05] text-electric-300',
  cyber: 'border-cyber-500/25 bg-cyber-500/[0.06] text-cyber-300',
  rose: 'border-pink-400/20 bg-pink-400/[0.05] text-pink-300'
}

export default function About() {
  const { T } = useLanguage()

  return (
    <div className="bg-carbon-900">
      {/* ---------------- Hero / 使命愿景 ---------------- */}
      <section className="relative overflow-hidden pb-16 pt-32 sm:pt-36">
        <div className="absolute inset-0 -z-10 bg-hero-glow opacity-60" />
        <div className="absolute inset-0 -z-10 bg-tech-grid opacity-[0.05]" />
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-electric-500/30 bg-electric-500/10 px-4 py-1.5 text-xs font-semibold tracking-wide text-electric-300">
              {T('关于我们', 'About Us')}
            </span>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="mt-6 max-w-5xl font-display text-3xl font-bold leading-[1.15] tracking-tight sm:text-4xl lg:text-5xl">
              {T('机器人外观，', 'Custom looks. ')}
              <span className="text-gradient">{T('一起创造', 'Built together.')}</span>
            </h1>
          </Reveal>
          <Reveal delay={160}>
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-carbon-800/40 p-6">
                <h3 className="font-display text-sm font-semibold uppercase tracking-widest2 text-electric-300">{T('使命', 'Mission')}</h3>
                <p className="mt-3 text-sm leading-relaxed text-white/55">
                  {T(
                    '让每一台具身机器人，都能拥有属于自己的外在身份与表达方式 —— 让科技多一分温度，让陪伴多一分个性。',
                    'Give every embodied robot an identity and a voice of its own — adding warmth to technology and personality to companionship.'
                  )}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-carbon-800/40 p-6">
                <h3 className="font-display text-sm font-semibold uppercase tracking-widest2 text-cyber-300">{T('愿景', 'Vision')}</h3>
                <p className="mt-3 text-sm leading-relaxed text-white/55">
                  {T(
                    '探索家庭机器人个性化皮肤与服装，让外观表达与工程需求共同发展。',
                    'Explore personalized skins and apparel for home robots, bringing visual expression and engineering needs together.'
                  )}
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------------- 品牌愿景大图 ---------------- */}
      <section className="px-5 sm:px-8 lg:px-10">
        <Reveal>
          <div className="group relative mx-auto max-w-7xl overflow-hidden rounded-3xl border border-white/10">
            <img
              src="/images/robowear/about-runway.webp"
              alt={T('机器人外观与服装的秀场概念效果图', 'Concept render of robots in apparel and styled runway looks')}
              loading="lazy"
              className="aspect-[4/3] w-full object-cover transition-transform duration-700 sm:aspect-[8/3] group-hover:scale-[1.02]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-carbon-900/80 via-carbon-900/10 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-widest2 text-electric-300">{T('品牌愿景 · 设计效果图', 'Brand vision · Design render')}</p>
              <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-white/65 sm:text-base">
                {T('当机器人穿上自己的服装走上 T 台——那便是 RoboWear 想象中的未来日常。', 'When robots walk the runway in clothes of their own — that’s the everyday future RoboWear imagines.')}
              </p>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ---------------- 创始人 ---------------- */}
      <section className="py-16">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-5 sm:px-8 lg:grid-cols-[0.85fr_1.15fr] lg:px-10">
          <Reveal direction="left">
            <div className="relative mx-auto aspect-[9/11] w-full max-w-sm overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-electric-500/15 via-carbon-800 to-cyber-500/15">
              <div className="absolute inset-0 bg-tech-grid opacity-30" />
              <div className="absolute -top-16 -right-16 h-56 w-56 rounded-full bg-electric-500/20 blur-[90px]" />
              <div className="absolute -bottom-20 -left-16 h-56 w-56 rounded-full bg-cyber-500/20 blur-[90px]" />
              <div className="relative flex h-full flex-col items-center justify-center gap-4 px-8 text-center">
                <span className="font-display text-[7rem] font-bold leading-none text-gradient drop-shadow-[0_0_40px_rgba(45,226,255,0.35)]">A</span>
                <span className="h-px w-16 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                <p className="font-display text-xl font-bold tracking-wide text-white">Alex</p>
                <p className="text-xs uppercase tracking-widest2 text-white/40">{T('创始人 & CEO · RoboWear International', 'Founder & CEO · RoboWear International')}</p>
              </div>
            </div>
          </Reveal>
          <Reveal direction="right" delay={80}>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.03] px-4 py-1.5 text-xs font-semibold tracking-wide text-white/50">
              {T('创始人 & CEO', 'Founder & CEO')}
            </span>
            <h2 className="mt-5 font-display text-3xl font-bold">Alex</h2>
            <p className="mt-5 max-w-xl text-sm leading-relaxed text-white/55 sm:text-base">
              {T(
                'Alex 拥有超过 10 年的跨界企业管理经验，曾主导多家公司从零到一的创业历程，涵盖文化传媒、国际贸易、智能科技等多个领域，具备高强商业敏感度及创新能力。',
                'Alex brings 10+ years of cross-industry management experience, having led multiple companies through their zero-to-one journeys across cultural media, international trade, and smart technology — backed by sharp commercial instinct and a drive to innovate.'
              )}
            </p>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/55 sm:text-base">
              {T(
                'Alex 深刻理解中国制造业的供应链优势、全球品牌运营的核心逻辑，以及科技产品从 B 端到 C 端的市场拓展路径，具备将 RoboWear 从概念推向全球市场的完整能力。',
                'He has a deep grasp of China’s manufacturing supply-chain strengths, the core logic of global brand operations, and how tech products move from B2B into consumer markets — giving him the full toolkit to take RoboWear from concept to a global brand.'
              )}
            </p>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/55 sm:text-base">
              {T(
                '他立志打造一个令世人铭记的可传承品牌，坚信机器人将彻底改变人类社会的运转方式——于是他在 2026 年创立 RoboWear International，把"功能优先、规模化个性、人机和谐"写进了公司的第一行代码与第一张设计图。',
                'Driven by the ambition to build a brand the world will remember and pass on — and a conviction that robots will fundamentally reshape how human society runs — he founded RoboWear International in 2026, writing "function first, personalization at scale, and human-robot harmony" into the company’s very first lines of code and design sketches.'
              )}
            </p>
            <div className="mt-6 flex flex-wrap gap-3 text-xs text-white/40">
              <span className="rounded-full border border-white/10 px-3 py-1.5">{T('10+ 年跨界企业管理经验', '10+ Years Cross-Industry Management Experience')}</span>
              <span className="rounded-full border border-white/10 px-3 py-1.5">{T('文化传媒 · 国际贸易 · 智能科技', 'Cultural Media · International Trade · Smart Tech')}</span>
              <span className="rounded-full border border-white/10 px-3 py-1.5">{T('多家公司从 0 到 1 创业操盘手', 'Zero-to-One Founder Across Multiple Ventures')}</span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------------- 能力与合作 ---------------- */}
      <section className="border-t border-white/10 bg-gradient-to-b from-carbon-900 to-carbon-800/30 py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-cyber-500/30 bg-cyber-500/10 px-4 py-1.5 text-xs font-semibold tracking-wide text-cyber-300">
              {T('我们的方法', 'Our approach')}
            </span>
            <h2 className="mt-5 max-w-2xl font-display text-3xl font-bold leading-snug sm:text-4xl">
              {T('设计 × 供应链 × 共研', 'Design × supply chain × co-development')}
              <br />
              {T('从外观想法到可评估的方案', 'From a look to a project proposal')}
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/50 sm:max-w-5xl sm:text-base">
              {T(
                'RoboWear（罗卜皮）隶属成都羽腾集团，创立于 2026 年。我们关注具身机器人穿戴，以外观定制、设计打样和合作询盘连接客户、制造商与创作者。',
                'Founded in 2026 within Chengdu Yuteng Group, RoboWear focuses on embodied robot wearables. Appearance customization, design sampling, and project inquiries connect customers, manufacturers, and creators.'
              )}
            </p>
          </Reveal>

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {pillars.map((p, idx) => (
              <Reveal key={p.titleZh} delay={idx * 100}>
                <div className={`hover-lift h-full rounded-2xl border p-6 ${toneClass[p.tone]}`}>
                  <span className="font-display text-2xl font-bold">0{idx + 1}</span>
                  <h3 className="mt-4 font-display text-lg font-semibold text-white">{T(p.titleZh, p.titleEn)}</h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-white/55">{T(p.descZh, p.descEn)}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={120}>
            <div className="mt-10 rounded-2xl border border-white/10 bg-carbon-900/40 p-6 sm:p-8">
              <h3 className="font-display text-xl font-semibold">{T('路线图：一键下单', 'On the roadmap: one-click order')}</h3>
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-white/55">
                {T('当前可浏览外观、生成选配摘要并提交报价评估。未来计划连接选配、订单意向与支付；家庭机器人个性化皮肤与服装是中长期探索方向，约 2027 年中后期窗口仍取决于研发与市场进展。', 'Today, explore looks, generate a selection summary, and request an estimate. Future ordering will connect configuration, order intent, and payment. Personalized skins and apparel for home robots are a mid-term direction, with an approximate mid-to-late 2027 window subject to development and market progress.')}
              </p>
              <div className="mt-6 flex flex-wrap gap-4">
                <Link to="/contact?type=partner" className="rounded-full bg-gradient-to-r from-electric-500 to-cyber-500 px-6 py-3 text-sm font-semibold text-carbon-900">{T('与我们合作', 'Partner with us')}</Link>
                <Link to="/community" className="rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-white/75">{T('设计师共创', 'Creator Co-creation')}</Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

    </div>
  )
}
