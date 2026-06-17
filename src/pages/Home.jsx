import { Link } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext.jsx'
import Reveal from '../components/Reveal.jsx'
import CountUp from '../components/CountUp.jsx'
import {
  IconFunctionFirst,
  IconPersonalization,
  IconHarmony,
  IconThermal,
  IconSensor,
  IconMotion,
  IconCharge,
  IconFireSafety,
  IconCompliance,
  IconConsumer,
  IconEnterprise,
  IconManufacturer
} from '../components/icons.jsx'

// 五大产品线（用于首页卡片网格，详情见 Products 页）
const productLines = [
  {
    id: 'roboskin',
    nameZh: 'Robo-Skin™',
    subZh: '智能皮肤覆盖系统',
    subEn: 'Smart Skin Cover System',
    descZh: '医疗级硅胶 + 气凝胶 + 石墨烯三明治结构，为机器人提供逼真触感的"第二皮肤"。',
    descEn: 'Medical-grade silicone + aerogel + graphene sandwich structure — a lifelike “second skin” for robots.',
    price: '$1,500 – $5,000',
    flagship: true,
    tone: 'blue',
    image: 'product-roboskin.webp'
  },
  {
    id: 'robowear',
    nameZh: 'Robo-Wear™',
    subZh: '功能性服装系列',
    subEn: 'Functional Apparel Series',
    descZh: '居家 / 工装 / 高定 / IP 联名四大子系列，覆盖从日常到奢华的全场景穿搭需求。',
    descEn: 'Home, Professional, Haute Couture & Collaboration sub-lines — covering everyday to luxury scenarios.',
    price: '$199 – $20,000+',
    flagship: false,
    tone: 'violet',
    image: 'product-couture.webp'
  },
  {
    id: 'roboface',
    nameZh: 'Robo-Face™',
    subZh: '面具与头部定制',
    subEn: 'Mask & Head Customization',
    descZh: '可更换面具系统，从科技极简到超写实人脸，磁吸快拆设计 10 秒换装。',
    descEn: 'Swappable mask system — from minimalist tech to hyper-real faces, magnetic quick-release in 10 seconds.',
    price: '$299 – $10,000',
    flagship: false,
    tone: 'rose',
    image: 'product-face-asian-male.webp'
  },
  {
    id: 'robohair',
    nameZh: 'Robo-Hair™',
    subZh: '假发系统',
    subEn: 'Wig System',
    descZh: '高品质人工纤维或真人发丝，专为机器人头部曲率设计，散热效率不打折。',
    descEn: 'Premium synthetic or human hair, engineered for robot head curvature without losing heat dissipation.',
    price: '$89 – $1,499',
    flagship: false,
    tone: 'silver',
    image: 'product-hair-long.webp'
  },
  {
    id: 'accessories',
    nameZh: 'Robo-Accessories™',
    subZh: '配件系列',
    subEn: 'Accessories Series',
    descZh: '背包、鞋履、首饰与节日套装——不影响传感器与充电接口的精致点缀。',
    descEn: 'Backpacks, shoes, jewelry & holiday kits — refined add-ons that never block sensors or charging ports.',
    price: '$49 – $1,299',
    flagship: false,
    tone: 'blue',
    image: 'product-acc-backpack.webp'
  }
]

// 六大工程约束（首页亮点区）
const constraints = [
  { Icon: IconThermal, zh: '散热不阻热', en: 'Thermal Transparency', sub: 'Thermal-Weave™', descZh: '石墨烯导热织物主动导热，杜绝过热降频。', descEn: 'Graphene weave actively conducts heat — no thermal throttling.' },
  { Icon: IconSensor, zh: '传感器不遮挡', en: 'Sensor Transparency', sub: 'Sensor-Pass™', descZh: '红外/雷达高透材料，确保感知信号零衰减。', descEn: 'IR/radar-transparent material — zero signal loss for perception.' },
  { Icon: IconMotion, zh: '运动不受限', en: 'Motion Freedom', sub: 'FlexJoint™', descZh: '关节四向弹力低摩擦面料，不增加伺服负载。', descEn: 'Four-way stretch, low-friction joint fabric adds zero servo load.' },
  { Icon: IconCharge, zh: '充电不脱衣', en: 'Charge-Through Design', sub: 'MagCharge-Port™', descZh: '服装内置磁吸模块，穿衣状态直接对接充电桩。', descEn: 'Built-in magnetic module — dock & charge without undressing.' },
  { Icon: IconFireSafety, zh: '安全不起火', en: 'Fire Safety', sub: 'Flame-Retardant', descZh: '全系材料通过严苛阻燃测试，杜绝高温事故。', descEn: 'All materials pass strict flame-retardant testing standards.' },
  { Icon: IconCompliance, zh: '合规', en: 'Regulatory Compliance', sub: 'Global Compliance', descZh: '符合各国法律法规，杜绝武器/色情等违规改装。', descEn: 'Compliant with local regulations — no weaponized or explicit mods.' }
]

const customerTypes = [
  {
    Icon: IconConsumer,
    zh: '个人消费者',
    en: 'Individual Consumers',
    descZh: '为家庭机器人打造专属穿搭，让"新成员"拥有独一无二的外在身份。',
    descEn: 'Bespoke looks for home robots — giving your new “family member” a one-of-a-kind identity.',
    image: 'customer-home.webp'
  },
  {
    Icon: IconEnterprise,
    zh: '企业采购方',
    en: 'Enterprise Buyers',
    descZh: '餐饮 · 酒店 · 医疗 · 零售连锁批量定制制服，强化品牌形象与资产管理。',
    descEn: 'Restaurants, hotels, healthcare & retail chains — bulk uniforms that extend brand identity.',
    image: 'customer-hotel.webp'
  },
  {
    Icon: IconManufacturer,
    zh: '机器人制造商',
    en: 'Robot Manufacturers',
    descZh: '官方外观生态合作伙伴，提供出厂级定制方案与数据洞察。',
    descEn: 'Official appearance-ecosystem partner — factory-level customization & insight data.',
    image: 'customer-production.webp'
  }
]

export default function Home() {
  const { T, lang } = useLanguage()

  return (
    <div>
      {/* ============ 首屏 Hero ============ */}
      <section className="relative flex min-h-[100svh] items-center overflow-hidden bg-carbon-900 pt-24">
        {/* 背景：网格纹理 + 光晕 + 渲染图占位 */}
        <div className="absolute inset-0 bg-tech-grid opacity-30" />
        <div className="absolute inset-0 bg-hero-glow" />
        <div className="absolute -right-40 top-1/2 hidden h-[640px] w-[640px] -translate-y-1/2 rounded-full bg-electric-500/10 blur-[120px] lg:block" />
        <div className="absolute -left-32 bottom-0 h-[420px] w-[420px] rounded-full bg-cyber-500/10 blur-[100px]" />

        <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-5 sm:px-8 lg:grid-cols-2 lg:px-10 lg:py-20">
          {/* 左侧文案 */}
          <div className="order-2 lg:order-1">
            <Reveal>
              <span className="inline-flex items-center gap-2 rounded-full border border-electric-500/30 bg-electric-500/5 px-4 py-1.5 text-xs font-medium uppercase tracking-widest2 text-electric-300">
                <span className="h-1.5 w-1.5 rounded-full bg-electric-400 animate-pulseGlow" />
                {T('全球首创 · 具身机器人外观定制', 'World-First · Embodied Robot Appearance Customization')}
              </span>
            </Reveal>

            <Reveal delay={120}>
              <h1 className="mt-6 font-display text-4xl font-bold leading-[1.15] tracking-tight sm:text-5xl lg:text-[3.4rem] xl:text-6xl">
                {T('为硅基文明，', 'Dress the')}
                <br className="hidden sm:block" />
                <span className="text-gradient">{T('穿上它应有的样子', 'Silicon Civilization')}</span>
                <span className="hidden lg:inline"> {T('', 'in the Identity It Deserves')}</span>
              </h1>
            </Reveal>

            <Reveal delay={220}>
              <p className="mt-6 max-w-xl text-base leading-relaxed text-white/55 sm:text-lg">
                {T(
                  '全球首个具身机器人外观定制平台。当机器人走进千家万户，RoboWear 为它们提供兼具工程功能性与美学个性的完整外观解决方案——机器人不只是工具，更是未来家庭的新成员。',
                  'The world’s first appearance-customization platform for embodied robots. As robots enter every household, RoboWear delivers complete looks that balance engineering function with aesthetic individuality — because robots aren’t just tools, they’re the newest members of the family.'
                )}
              </p>
            </Reveal>

            <Reveal delay={320}>
              <div className="mt-9 flex flex-col gap-4 sm:flex-row">
                <Link
                  to="/robofit"
                  className="group inline-flex items-center justify-center gap-2.5 rounded-full bg-gradient-to-r from-electric-500 to-cyber-500 px-7 py-3.5 text-sm font-semibold text-carbon-900 shadow-[0_0_30px_rgba(45,226,255,0.35)] transition-all duration-300 hover:shadow-[0_0_46px_rgba(45,226,255,0.55)] hover:-translate-y-0.5"
                >
                  {T('进入 RoboFit 3D 试衣', 'Enter RoboFit 3D Studio')}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" className="transition-transform duration-300 group-hover:translate-x-1">
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </Link>
                <Link
                  to="/products"
                  className="inline-flex items-center justify-center gap-2.5 rounded-full border border-white/20 bg-white/[0.03] px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:border-white/40 hover:bg-white/[0.07]"
                >
                  {T('浏览产品', 'Browse Products')}
                </Link>
              </div>
            </Reveal>

            <Reveal delay={420}>
              <div className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-3 text-xs uppercase tracking-widest2 text-white/35">
                <span>{T('适配机型', 'Compatible With')}</span>
                <span className="text-white/60">Tesla Optimus</span>
                <span className="h-1 w-1 rounded-full bg-white/20" />
                <span className="text-white/60">Figure 03</span>
                <span className="h-1 w-1 rounded-full bg-white/20" />
                <span className="text-white/60">{T('小鹏 Iron', 'XPeng Iron')}</span>
              </div>
            </Reveal>
          </div>

          {/* 右侧：机器人渲染占位视觉区 */}
          <Reveal delay={200} direction="right" className="order-1 lg:order-2">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              <div className="absolute -inset-6 rounded-[2rem] bg-gradient-to-tr from-electric-500/20 via-transparent to-cyber-500/20 blur-2xl animate-pulseGlow" />
              <div className="relative animate-floaty overflow-hidden rounded-[1.75rem] border border-white/10 shadow-[0_30px_90px_-25px_rgba(45,226,255,0.35)]">
                <img
                  src="/images/robowear/hero-couture.png"
                  alt={T(
                    '身着高定白色风衣套装的人形机器人，冷调影棚灯光，全身站姿',
                    'Humanoid robot in a haute-couture white trench-coat ensemble, cool studio lighting, full-body stance'
                  )}
                  className="aspect-[4/5] sm:aspect-[3/4] lg:aspect-[4/5] w-full object-cover object-[81%_50%]"
                />
              </div>
            </div>
          </Reveal>
        </div>

        {/* 向下滚动提示 */}
        <div className="absolute bottom-7 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-white/30 sm:flex">
          <span className="text-[10px] uppercase tracking-widest2">{T('向下滚动', 'Scroll')}</span>
          <span className="h-9 w-[1px] bg-gradient-to-b from-white/40 to-transparent" />
        </div>
      </section>

      {/* ============ 行业风口数据条 ============ */}
      <section className="relative border-y border-white/8 bg-carbon-800/60">
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-10">
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {[
              {
                value: 38,
                prefix: '$',
                suffix: T(' 亿美元', 'B'),
                labelZh: '2035 年人形机器人市场规模',
                labelEn: 'Humanoid Robot Market by 2035',
                source: 'Goldman Sachs'
              },
              {
                value: 5,
                prefix: '$',
                suffix: T(' 万亿美元', 'T'),
                labelZh: '2050 年市场规模预测',
                labelEn: 'Forecast Market Size by 2050',
                source: 'Morgan Stanley'
              },
              {
                value: 1250,
                suffix: T(' 万台', ' 万 units'),
                labelZh: '2035 年人形机器人预估保有量',
                labelEn: 'Est. Humanoid Robots in Service by 2035',
                source: T('行业测算', 'Industry Estimate')
              },
              {
                value: 3,
                suffix: T(' 大机型', '+ Platforms'),
                labelZh: '已适配主流机器人平台',
                labelEn: 'Mainstream Robot Platforms Supported',
                source: 'Optimus · Figure 03 · Iron'
              }
            ].map((stat, i) => (
              <Reveal key={stat.labelZh} delay={i * 110}>
                <div className="text-center sm:text-left">
                  <p className="font-display text-3xl font-bold text-white sm:text-4xl lg:text-[2.6rem]">
                    <CountUp value={stat.value} prefix={stat.prefix || ''} suffix={stat.suffix} decimals={stat.decimals || 0} />
                  </p>
                  <p className="mt-2 text-sm leading-snug text-white/55">{T(stat.labelZh, stat.labelEn)}</p>
                  <p className="mt-1 text-[11px] uppercase tracking-widest2 text-electric-400/70">{stat.source}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ 核心价值三栏 ============ */}
      <section className="mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:px-10">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-semibold uppercase tracking-widest2 text-electric-400">
              {T('核心价值', 'Core Values')}
            </span>
            <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">
              {T('定义机器人时代的时尚美学', 'Defining Fashion Aesthetics for the Robotic Era')}
            </h2>
            <p className="mt-4 text-base text-white/50">
              {T(
                '我们的使命：让每一台机器人都拥有独一无二的"外在身份"，让人机共存的世界更有温度、更有美感。',
                'Our mission: give every robot a one-of-a-kind identity — making a world of human-robot coexistence warmer and more beautiful.'
              )}
            </p>
          </div>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
          {[
            { Icon: IconFunctionFirst, zh: 'Function First', sub: '功能优先', descZh: '所有产品设计以不影响机器人性能为首要原则——美学永远建立在工程之上。', descEn: 'Every design decision is governed by one rule: never compromise robot performance. Aesthetics are always built on sound engineering.' },
            { Icon: IconPersonalization, zh: 'Personalization at Scale', sub: '规模化个性', descZh: '通过 AI 与自动化生产，让千万台机器人都能拥有独一无二、不重样的外观。', descEn: 'AI-driven design and automated production let millions of robots each wear a look that’s entirely their own.' },
            { Icon: IconHarmony, zh: 'Human-Robot Harmony', sub: '人机和谐', descZh: '用美学设计降低人类对机器人的心理距离感，让协作更自然、陪伴更温暖。', descEn: 'Thoughtful aesthetics narrow the emotional distance between humans and robots — for warmer companionship and smoother collaboration.' }
          ].map(({ Icon, zh, sub, descZh, descEn }, i) => (
            <Reveal key={zh} delay={i * 130}>
              <div className="group h-full rounded-2xl border border-white/10 bg-white/[0.02] p-8 hover-lift">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-electric-500/30 bg-electric-500/5 text-electric-400 transition-all duration-500 group-hover:scale-110 group-hover:border-electric-400/60">
                  <Icon width={26} height={26} />
                </div>
                <h3 className="mt-6 font-display text-lg font-bold text-white">{zh}</h3>
                <p className="text-sm font-medium text-electric-400/80">{sub}</p>
                <p className="mt-3 text-sm leading-relaxed text-white/50">{T(descZh, descEn)}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ============ 五大产品线展示 ============ */}
      <section className="relative border-t border-white/8 bg-gradient-to-b from-carbon-800/40 to-transparent py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <Reveal>
            <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
              <div>
                <span className="text-xs font-semibold uppercase tracking-widest2 text-electric-400">
                  {T('产品体系', 'Product Universe')}
                </span>
                <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">
                  {T('五大产品线，覆盖机器人外观的每一寸', 'Five Product Lines, Every Inch of a Robot’s Look')}
                </h2>
              </div>
              <Link to="/products" className="inline-flex items-center gap-2 text-sm font-medium text-electric-300 transition-colors hover:text-electric-200">
                {T('查看完整产品中心', 'View Full Product Center')}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </Link>
            </div>
          </Reveal>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {productLines.map((p, i) => (
              <Reveal key={p.id} delay={i * 90}>
                <Link
                  to="/products"
                  className={`group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] hover-lift ${
                    p.flagship ? 'lg:col-span-2 lg:row-span-1' : ''
                  }`}
                >
                  <div className="relative overflow-hidden border-b border-white/10">
                    <img
                      src={`/images/robowear/${p.image}`}
                      alt={T(`${p.nameZh} ${p.subZh} 产品视觉`, `${p.nameZh} ${p.subEn} product visual`)}
                      loading="lazy"
                      className="aspect-[16/10] w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                    />
                    {/* 角落柔光遮罩：统一视觉层次，避免素材自带文字与卡片信息互相干扰 */}
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-carbon-900/65 via-carbon-900/0 to-transparent" />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-carbon-900/35 via-transparent to-transparent" />
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <div className="flex items-center gap-2">
                      <h3 className="font-display text-xl font-bold text-white">{p.nameZh}</h3>
                      {p.flagship && (
                        <span className="rounded-full border border-electric-400/40 bg-electric-500/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest2 text-electric-300">
                          {T('旗舰产品', 'Flagship')}
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-medium text-white/40">{T(p.subZh, p.subEn)}</p>
                    <p className="mt-3 flex-1 text-sm leading-relaxed text-white/50">{T(p.descZh, p.descEn)}</p>
                    <div className="mt-5 flex items-center justify-between border-t border-white/8 pt-4">
                      <span className="font-display text-base font-semibold text-electric-300">{p.price}</span>
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-white/40 transition-colors group-hover:text-white">
                        {T('查看详情', 'View Details')}
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" className="transition-transform duration-300 group-hover:translate-x-1">
                          <path d="M5 12h14M13 6l6 6-6 6" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ 六大工程约束 ============ */}
      <section className="mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:px-10">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-semibold uppercase tracking-widest2 text-electric-400">
              {T('技术壁垒', 'Engineering Moat')}
            </span>
            <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">
              {T('六大工程约束，区别于任何普通服装品牌', 'Six Engineering Constraints That Set Us Apart')}
            </h2>
            <p className="mt-4 text-base text-white/50">
              {T(
                '在设计每一款产品前，我们先问一个问题：会不会让机器人变得更糟？这是 RoboWear 的核心设计哲学与护城河。',
                'Before designing anything, we ask one question: will this make the robot worse at being a robot? That question is RoboWear’s design philosophy — and its moat.'
              )}
            </p>
          </div>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {constraints.map(({ Icon, zh, en, sub, descZh, descEn }, i) => (
            <Reveal key={zh} delay={i * 80}>
              <div className="group flex h-full gap-5 rounded-2xl border border-white/10 bg-white/[0.02] p-6 transition-all duration-300 hover:border-electric-400/30 hover:bg-white/[0.04]">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/12 bg-carbon-800 text-electric-400 transition-all duration-500 group-hover:border-electric-400/50 group-hover:rotate-6">
                  <Icon width={24} height={24} />
                </div>
                <div>
                  <p className="font-display text-base font-bold text-white">{T(zh, en)}</p>
                  <p className="text-[11px] font-medium uppercase tracking-widest2 text-electric-400/70">{sub}</p>
                  <p className="mt-2 text-sm leading-relaxed text-white/50">{T(descZh, descEn)}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ============ 客户类型墙 ============ */}
      <section className="relative overflow-hidden border-t border-white/8 bg-carbon-800/40 py-24">
        <div className="absolute inset-0 bg-tech-grid opacity-20" />
        <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <span className="text-xs font-semibold uppercase tracking-widest2 text-electric-400">
                {T('服务对象', 'Who We Serve')}
              </span>
              <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">
                {T('从家庭到产线，覆盖机器人世界的每一个角落', 'From Living Rooms to Production Lines')}
              </h2>
            </div>
          </Reveal>

          <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
            {customerTypes.map(({ Icon, zh, en, descZh, descEn, image }, i) => (
              <Reveal key={zh} delay={i * 110}>
                <div className="group h-full overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-white/[0.01] text-center transition-all duration-500 hover:-translate-y-2 hover:border-electric-400/30">
                  <div className="relative overflow-hidden">
                    <img
                      src={`/images/robowear/${image}`}
                      alt={T(zh, en)}
                      loading="lazy"
                      className="aspect-[3/2] w-full object-cover transition-transform duration-700 group-hover:scale-[1.06]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-carbon-900 via-carbon-900/10 to-transparent" />
                    <div className="absolute bottom-3 left-1/2 flex h-12 w-12 -translate-x-1/2 items-center justify-center rounded-full border border-electric-500/40 bg-carbon-900/70 text-electric-400 backdrop-blur-sm transition-transform duration-500 group-hover:scale-110">
                      <Icon width={22} height={22} />
                    </div>
                  </div>
                  <div className="p-8 pt-6">
                    <h3 className="font-display text-lg font-bold">{T(zh, en)}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-white/50">{T(descZh, descEn)}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ 底部 CTA ============ */}
      <section className="relative overflow-hidden py-28">
        <div className="absolute inset-0 bg-hero-glow opacity-70" />
        <div className="absolute inset-0 bg-tech-grid opacity-20" />
        <Reveal>
          <div className="relative mx-auto flex max-w-4xl flex-col items-center px-5 text-center">
            <h2 className="font-display text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
              <span className="block">{T('准备好为你的机器人', 'Ready to design a look')}</span>
              <span className="text-gradient">{T('设计专属外观了吗？', 'as unique as your robot?')}</span>
            </h2>
            <p className="mt-6 max-w-xl text-base text-white/55">
              {T(
                '在 RoboFit 平台用 3D 实时试衣，或联系我们的商务团队，定制企业级机器人外观解决方案。',
                'Try on looks in real time with the RoboFit 3D studio, or talk to our business team about enterprise-grade robot appearance programs.'
              )}
            </p>
            <div className="mt-9 flex flex-col gap-4 sm:flex-row">
              <Link
                to="/robofit"
                className="inline-flex items-center justify-center gap-2.5 rounded-full bg-gradient-to-r from-electric-500 to-cyber-500 px-8 py-3.5 text-sm font-semibold text-carbon-900 shadow-[0_0_30px_rgba(45,226,255,0.35)] transition-all duration-300 hover:shadow-[0_0_46px_rgba(45,226,255,0.55)] hover:-translate-y-0.5"
              >
                {T('立即进入 RoboFit', 'Launch RoboFit Now')}
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center justify-center gap-2.5 rounded-full border border-white/20 bg-white/[0.03] px-8 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:border-white/40 hover:bg-white/[0.07]"
              >
                {T('联系商务合作', 'Contact Our Business Team')}
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  )
}
