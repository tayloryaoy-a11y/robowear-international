import { useLanguage } from '../context/LanguageContext.jsx'
import Reveal from '../components/Reveal.jsx'
import { IconSeed, IconLaunch, IconExpand, IconGlobal } from '../components/icons.jsx'

const pillars = [
  {
    titleZh: '硬件 · 智能服装产品线',
    titleEn: 'Hardware — Smart Apparel Lines',
    descZh: 'Robo-Skin / Robo-Wear / Robo-Face / Robo-Hair / Robo-Accessories 五大产品线，构成最直接的现金流与品牌触点。',
    descEn: 'Robo-Skin, Robo-Wear, Robo-Face, Robo-Hair and Robo-Accessories form the most direct cash flow and brand touchpoint.',
    tone: 'electric'
  },
  {
    titleZh: '平台 · RoboFit 3D 定制系统',
    titleEn: 'Platform — RoboFit 3D Customization',
    descZh: '实时 3D 试衣、设计师市场与 AI 设计助手三位一体，让创作、交易与社区在同一界面中发生。',
    descEn: 'Real-time 3D fitting, a designer marketplace, and an AI assistant unite creation, commerce, and community in one place.',
    tone: 'cyber'
  },
  {
    titleZh: 'IP · 品牌与设计师生态',
    titleEn: 'IP — Brand & Designer Ecosystem',
    descZh: '联名款、限量发售与设计师版税体系，构筑长期的品牌资产与文化影响力。',
    descEn: 'Collabs, limited drops, and a designer-royalty system build lasting brand equity and cultural influence.',
    tone: 'rose'
  }
]

const toneClass = {
  electric: 'border-electric-500/25 bg-electric-500/[0.05] text-electric-300',
  cyber: 'border-cyber-500/25 bg-cyber-500/[0.06] text-cyber-300',
  rose: 'border-pink-400/20 bg-pink-400/[0.05] text-pink-300'
}

const timeline = [
  {
    year: '2026',
    phaseZh: '种子期',
    phaseEn: 'Seed Stage',
    Icon: IconSeed,
    descZh: 'Robo-Wear 1.0 产品线上线，完成 Optimus / Figure 03 / 小鹏 Iron 三大机型的兼容性认证，建立成都供应链中心。',
    descEn: 'Launch Robo-Wear 1.0, complete compatibility certification for Optimus, Figure 03 and XPeng Iron, and stand up the Chengdu supply chain hub.'
  },
  {
    year: '2027',
    phaseZh: '引爆期',
    phaseEn: 'Ignition',
    Icon: IconLaunch,
    descZh: 'RoboFit 3D 定制平台公开发布，开放设计师市场与 70% 收益分成机制，首批联名系列上线。',
    descEn: 'Publicly launch the RoboFit 3D platform, open the designer marketplace with a 70% revenue share, and ship the first collab series.'
  },
  {
    year: '2028',
    phaseZh: '扩张期',
    phaseEn: 'Expansion',
    Icon: IconExpand,
    descZh: '产品矩阵扩展至五大产品线，洛杉矶研发中心全面运转，与首批线下零售伙伴展开合作。',
    descEn: 'Expand to all five product lines, bring the Los Angeles R&D center to full capacity, and onboard the first retail partners.'
  },
  {
    year: '2029–2030',
    phaseZh: '全球化',
    phaseEn: 'Globalization',
    Icon: IconGlobal,
    descZh: '全球旗舰店网络成型，IP 授权体系成熟，RoboWear 成为"机器人时代的 Nike"。',
    descEn: 'A global flagship network matures, the IP licensing system comes of age, and RoboWear becomes "the Nike of the robotic era."'
  }
]

const market = [
  { key: 'tam', labelZh: '总潜在市场 TAM', labelEn: 'Total Addressable Market', value: '$50B', tone: 'border-electric-500/25 text-electric-300' },
  { key: 'sam', labelZh: '可服务市场 SAM', labelEn: 'Serviceable Available Market', value: '$15B', tone: 'border-cyber-500/30 text-cyber-300' },
  { key: 'som', labelZh: '可获得市场 SOM', labelEn: 'Serviceable Obtainable Market', value: '$3B', tone: 'border-pink-400/30 text-pink-300' }
]

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
            <h1 className="mt-6 max-w-3xl font-display text-4xl font-bold leading-[1.15] tracking-tight sm:text-5xl">
              {T('我们正在成为，', 'We are becoming —')}
              <br />
              <span className="text-gradient">{T('机器人时代的 Nike', 'the Nike of the Robotic Era')}</span>
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
                    '成为具身智能时代最具影响力的外观品牌与创作平台 —— 当人们想到"机器人穿什么"时，第一反应就是 RoboWear。',
                    'Become the most influential appearance brand and creative platform of the embodied-AI era — the first name that comes to mind when people ask "what does my robot wear?"'
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
              alt={T('一排机器人穿着不同 RoboWear 服装走上机器人时装周 T 台', 'A lineup of robots in different RoboWear looks walking the runway at Robot Fashion Week')}
              loading="lazy"
              className="aspect-[8/3] w-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-carbon-900/80 via-carbon-900/10 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-widest2 text-electric-300">{T('品牌愿景', 'Brand Vision')}</p>
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
            <p className="mt-1 text-sm font-medium text-white/40">{T('Alex Chen · 陈翊', 'Alex Chen')}</p>
            <p className="mt-5 max-w-xl text-sm leading-relaxed text-white/55 sm:text-base">
              {T(
                'Alex 拥有横跨时尚设计与机器人工程的双重背景：在洛杉矶 Art Center College of Design 学习产品与服装设计，毕业后在成都一家人形机器人供应链企业负责外观结构设计。一次工厂走访中，他看到上百台外形完全相同的机器人整齐排列——那一刻他意识到："如果机器人将拥有身体，它们也应该拥有自己的样子。"',
                'Alex bridges fashion design and robotics engineering: he studied product and apparel design at Art Center College of Design in Los Angeles, then led exterior-structure design at a humanoid-robot supply chain company in Chengdu. On a factory floor, he once saw hundreds of identical robots lined up — and realized: "If robots are going to have bodies, they deserve to have a look of their own."'
              )}
            </p>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/55 sm:text-base">
              {T(
                '于是他在 2026 年创立 RoboWear International，把"功能优先、规模化个性、人机和谐"写进了公司的第一行代码与第一张设计图。',
                'In 2026 he founded RoboWear International, writing "function first, personalization at scale, and human-robot harmony" into the company’s very first lines of code and design sketches.'
              )}
            </p>
            <div className="mt-6 flex flex-wrap gap-3 text-xs text-white/40">
              <span className="rounded-full border border-white/10 px-3 py-1.5">{T('Art Center College of Design · 产品设计', 'Art Center College of Design — Product Design')}</span>
              <span className="rounded-full border border-white/10 px-3 py-1.5">{T('前人形机器人供应链外观结构负责人', 'Former Exterior Structure Lead, Humanoid Robotics Supply Chain')}</span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------------- 三位一体商业模式 ---------------- */}
      <section className="border-t border-white/10 bg-gradient-to-b from-carbon-900 to-carbon-800/30 py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-cyber-500/30 bg-cyber-500/10 px-4 py-1.5 text-xs font-semibold tracking-wide text-cyber-300">
              {T('商业模式', 'Business Model')}
            </span>
            <h2 className="mt-5 max-w-2xl font-display text-3xl font-bold leading-snug sm:text-4xl">
              {T('硬件 × 平台 × IP', 'Hardware × Platform × IP')}
              <br />
              {T('三位一体的增长飞轮', 'A three-part growth flywheel')}
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/50 sm:text-base">
              {T(
                '硬件带来现金流与用户触点，平台沉淀数据与社区网络，IP 沉淀长期品牌资产——三者相互反哺，构成了 RoboWear 的护城河。',
                'Hardware drives cash flow and touchpoints, the platform compounds data and community, and IP builds lasting brand equity — together they reinforce one another to form RoboWear’s moat.'
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
            <div className="mt-10 overflow-hidden rounded-3xl border border-white/10 bg-carbon-900/40 p-2 sm:p-4">
              <img
                src="/images/robowear/business-model.svg"
                alt={T('硬件 + 数字平台 + IP 生态三位一体商业模式示意图', 'Infographic of the hardware + digital platform + IP ecosystem business-model flywheel')}
                loading="lazy"
                className="aspect-[5/3] w-full rounded-2xl object-contain"
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------------- 发展时间轴 ---------------- */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <Reveal>
            <h2 className="font-display text-2xl font-bold sm:text-3xl">{T('发展路线图 2026 – 2030', 'Roadmap · 2026 – 2030')}</h2>
            <p className="mt-2 max-w-2xl text-sm text-white/45">
              {T('从种子期到全球化，每一个阶段都对应一个明确的产品与市场里程碑。', 'From seed to globalization — each stage maps to a concrete product and market milestone.')}
            </p>
          </Reveal>

          <div className="relative mt-12">
            <div className="absolute left-6 top-2 bottom-2 hidden w-px bg-gradient-to-b from-electric-500/60 via-cyber-500/40 to-transparent sm:block" />
            <div className="space-y-6">
              {timeline.map((stage, idx) => (
                <Reveal key={stage.year} delay={idx * 90}>
                  <div className="relative flex flex-col gap-4 rounded-2xl border border-white/10 bg-carbon-800/40 p-6 sm:flex-row sm:items-center sm:gap-7 sm:pl-16">
                    <span className="absolute left-0 top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-electric-500/40 bg-carbon-900 text-electric-300 sm:flex">
                      <stage.Icon width={20} height={20} />
                    </span>
                    <div className="flex items-center gap-3 sm:w-44 sm:shrink-0">
                      <span className="font-display text-2xl font-bold text-white">{stage.year}</span>
                      <span className="rounded-full border border-white/12 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-widest2 text-white/50">
                        {T(stage.phaseZh, stage.phaseEn)}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed text-white/55">{T(stage.descZh, stage.descEn)}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- TAM / SAM / SOM ---------------- */}
      <section className="border-t border-white/10 bg-gradient-to-b from-carbon-900 to-carbon-800/30 py-24">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-14 px-5 sm:px-8 lg:grid-cols-2 lg:px-10">
          <Reveal direction="left">
            <span className="inline-flex items-center gap-2 rounded-full border border-electric-500/30 bg-electric-500/10 px-4 py-1.5 text-xs font-semibold tracking-wide text-electric-300">
              {T('市场机会', 'Market Opportunity')}
            </span>
            <h2 className="mt-5 font-display text-3xl font-bold leading-snug sm:text-4xl">
              {T('一个刚刚起步、', 'A market that’s just getting started —')}
              <br />
              {T('却注定爆发式增长的市场', 'and is destined to explode')}
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/50">
              {T(
                '高盛预测 2035 年人形机器人市场规模将达 380 亿美元，摩根士丹利更将远期总量级预估推升至 5 万亿美元。RoboWear 锁定其中"外观与个性化"这一全新品类——一个目前几乎空白的市场。',
                'Goldman Sachs projects the humanoid robot market will reach $38B by 2035, while Morgan Stanley puts the long-term total addressable opportunity as high as $5T. RoboWear is staking out an entirely new category within it — appearance & personalization — a space that’s still wide open.'
              )}
            </p>
            <div className="mt-7 space-y-3">
              {market.map((m) => (
                <div key={m.key} className={`flex items-center justify-between rounded-xl border bg-white/[0.02] px-5 py-3.5 ${m.tone}`}>
                  <span className="text-sm text-white/60">{T(m.labelZh, m.labelEn)}</span>
                  <span className="font-display text-xl font-bold">{m.value}</span>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal direction="right" delay={100}>
            <div className="relative mx-auto flex aspect-square max-w-sm items-center justify-center">
              <div className="absolute inset-0 rounded-full border border-electric-500/25 bg-electric-500/[0.03]" />
              <div className="absolute inset-[16%] rounded-full border border-cyber-500/30 bg-cyber-500/[0.05]" />
              <div className="absolute inset-[36%] flex items-center justify-center rounded-full border border-pink-400/35 bg-pink-400/[0.09]">
                <div className="text-center">
                  <p className="text-[11px] uppercase tracking-widest2 text-white/40">SOM</p>
                  <p className="font-display text-xl font-bold text-white">$3B</p>
                </div>
              </div>
              <span className="absolute left-3 top-6 text-xs text-electric-300">
                TAM <span className="ml-1 font-display font-bold text-white">$50B</span>
              </span>
              <span className="absolute right-3 top-[27%] text-xs text-cyber-300">
                SAM <span className="ml-1 font-display font-bold text-white">$15B</span>
              </span>
            </div>
            <p className="mt-6 text-center text-xs text-white/35">
              {T('TAM / SAM / SOM 三层市场模型 · 数据来源于公司财务测算与公开市场研究', 'TAM / SAM / SOM market sizing — based on company financial models & public market research')}
            </p>
          </Reveal>
        </div>
      </section>
    </div>
  )
}
