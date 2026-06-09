import { useLanguage } from '../context/LanguageContext.jsx'
import Reveal from '../components/Reveal.jsx'
import { IconThermal, IconSensor, IconMotion, IconCharge, IconCube3D } from '../components/icons.jsx'

// 五项核心专利技术数据
const PATENTS = [
  {
    id: 'thermal-weave',
    name: 'Thermal-Weave™',
    image: 'patent-thermal-weave.webp',
    Icon: IconThermal,
    tone: 'electric',
    titleZh: '热感自适应纺织技术',
    titleEn: 'Adaptive Thermal Textile',
    descZh: '主动平衡透气与散热效率，确保服装层不会干扰机器人核心散热系统的稳定运行。',
    descEn: 'Actively balances breathability and heat dissipation so apparel never interferes with a robot’s core thermal system.',
    statZh: '局部温升降低 23%',
    statEn: '23% lower localized heat buildup'
  },
  {
    id: 'sensor-pass',
    name: 'Sensor-Pass™',
    image: 'patent-sensor-pass.webp',
    Icon: IconSensor,
    tone: 'cyber',
    titleZh: '传感器穿透层技术',
    titleEn: 'Sensor-Transparent Layering',
    descZh: '特殊编织结构对红外、激光雷达与视觉信号近乎无衰减穿透，让服装与感知系统不再冲突。',
    descEn: 'A specialized weave lets infrared, LiDAR, and vision signals pass through with minimal attenuation.',
    statZh: '信号衰减 < 2%',
    statEn: '< 2% signal attenuation'
  },
  {
    id: 'flexjoint',
    name: 'FlexJoint™',
    image: 'patent-flexjoint.webp',
    Icon: IconMotion,
    tone: 'rose',
    titleZh: '关节自适应剪裁系统',
    titleEn: 'Adaptive Joint Tailoring System',
    descZh: '基于关节运动范围的参数化剪裁算法，确保服装在大幅动作中实现零束缚、零滑移。',
    descEn: 'Parametric cutting tuned to each joint’s range of motion — zero restriction, zero slippage during extreme movement.',
    statZh: '兼容 240° 关节活动范围',
    statEn: 'Supports 240° range of motion'
  },
  {
    id: 'magcharge-port',
    name: 'MagCharge-Port™',
    image: 'patent-magcharge.webp',
    Icon: IconCharge,
    tone: 'electric',
    titleZh: '磁吸式充电接口兼容设计',
    titleEn: 'Magnetic Charging-Port Compatibility',
    descZh: '在对应位置预留磁吸通道与可视窗口，无需更衣即可完成自动对接与充电。',
    descEn: 'Pre-aligned magnetic channels and viewing windows let robots dock and charge without undressing.',
    statZh: '0 秒脱卸即可充电',
    statEn: 'Zero undressing required to charge'
  },
  {
    id: 'robofit-3d',
    name: 'RoboFit-3D™',
    image: 'patent-robofit-3d.webp',
    Icon: IconCube3D,
    tone: 'cyber',
    titleZh: '实时 3D 虚拟试衣引擎',
    titleEn: 'Real-Time 3D Virtual Fitting Engine',
    descZh: '基于 WebGL 的轻量化渲染引擎，让任何浏览器都能实现毫秒级的材质、颜色与剪裁预览。',
    descEn: 'A lightweight WebGL engine that delivers millisecond-level material, color and cut previews in any browser.',
    statZh: '平均渲染延迟 < 16ms',
    statEn: '< 16ms average render latency'
  }
]

const toneClass = {
  electric: 'border-electric-500/25 text-electric-300 bg-electric-500/[0.05]',
  cyber: 'border-cyber-500/25 text-cyber-300 bg-cyber-500/[0.06]',
  rose: 'border-pink-400/20 text-pink-300 bg-pink-400/[0.05]'
}

const iconBg = {
  electric: 'bg-electric-500/10 text-electric-300',
  cyber: 'bg-cyber-500/10 text-cyber-300',
  rose: 'bg-pink-400/10 text-pink-300'
}

const labRows = [
  { labelZh: '材料疲劳测试', labelEn: 'Material fatigue testing', valueZh: '> 10 万次循环屈挠不开裂', valueEn: '100,000+ flex cycles without cracking' },
  { labelZh: '极端温度测试', labelEn: 'Extreme temperature testing', valueZh: '-30°C ~ 65°C 性能稳定', valueEn: 'Stable performance from -30°C to 65°C' },
  { labelZh: '阻燃安全等级', labelEn: 'Fire-retardant safety rating', valueZh: '通过 UL94 V-0 标准', valueEn: 'Certified to UL94 V-0 standard' },
  { labelZh: '传感器兼容验证', labelEn: 'Sensor-compatibility validation', valueZh: '红外 / 激光雷达 / 视觉三项联调', valueEn: 'Validated across IR, LiDAR & vision stacks' }
]

export default function Technology() {
  const { T } = useLanguage()

  return (
    <div className="bg-carbon-900">
      {/* ---------------- Hero ---------------- */}
      <section className="relative overflow-hidden pb-16 pt-32 sm:pt-36">
        <div className="absolute inset-0 -z-10 bg-hero-glow opacity-60" />
        <div className="absolute inset-0 -z-10 bg-tech-grid opacity-[0.05]" />
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-electric-500/30 bg-electric-500/10 px-4 py-1.5 text-xs font-semibold tracking-wide text-electric-300">
              {T('技术与材料', 'Technology & Materials')}
            </span>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="mt-6 max-w-3xl font-display text-4xl font-bold leading-[1.15] tracking-tight sm:text-5xl">
              {T('当材料科学，遇见', 'When materials science meets ')}
              <span className="text-gradient">{T('机器人工程', 'robotics engineering')}</span>
            </h1>
          </Reveal>
          <Reveal delay={160}>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/55 sm:text-lg">
              {T(
                '我们不做"缩小版人类服装"，而是从机器人的关节结构、散热路径与传感器布局出发，正向设计每一寸面料与剪裁——这正是 RoboWear 五项核心专利技术的起点。',
                'We don’t shrink human clothing to fit robots — we design every fiber and seam outward from a robot’s joints, thermal pathways, and sensor layout. That’s the origin of RoboWear’s five core patented technologies.'
              )}
            </p>
          </Reveal>
        </div>
      </section>

      {/* ---------------- 五项核心专利 ---------------- */}
      <section className="py-12">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <Reveal>
            <h2 className="font-display text-2xl font-bold sm:text-3xl">{T('五项核心专利技术', 'Five Core Patented Technologies')}</h2>
            <p className="mt-2 max-w-2xl text-sm text-white/45">
              {T('每一项专利都直接回应一个机器人在真实世界中会遇到的工程难题。', 'Each patent directly answers an engineering challenge robots face in the real world.')}
            </p>
          </Reveal>

          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {PATENTS.map((patent, idx) => (
              <Reveal key={patent.id} delay={idx * 80} className={idx === 4 ? 'sm:col-span-2 lg:col-span-1' : ''}>
                <div className={`hover-lift group h-full overflow-hidden rounded-2xl border ${toneClass[patent.tone]}`}>
                  <div className="relative overflow-hidden">
                    <img
                      src={`/images/robowear/${patent.image}`}
                      alt={T(patent.titleZh, patent.titleEn)}
                      loading="lazy"
                      className="aspect-[5/3] w-full object-cover transition-transform duration-700 group-hover:scale-[1.05]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-carbon-900/90 via-carbon-900/10 to-transparent" />
                    <span className={`absolute bottom-3 left-3 flex h-11 w-11 items-center justify-center rounded-xl border border-white/15 backdrop-blur-sm ${iconBg[patent.tone]}`}>
                      <patent.Icon width={20} height={20} />
                    </span>
                    <span className="absolute right-3 top-3 rounded-full border border-white/15 bg-carbon-900/60 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest2 text-white/60 backdrop-blur-sm">
                      {T('专利技术', 'Patented')}
                    </span>
                  </div>
                  <div className="p-6">
                  <h3 className="mt-0 font-display text-lg font-bold text-white">{patent.name}</h3>
                  <p className="mt-0.5 text-sm font-medium text-white/50">{T(patent.titleZh, patent.titleEn)}</p>
                  <p className="mt-3 text-sm leading-relaxed text-white/50">{T(patent.descZh, patent.descEn)}</p>
                  <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-carbon-900/50 px-3 py-1.5 text-xs font-mono text-white/60">
                    <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
                    {T(patent.statZh, patent.statEn)}
                  </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- 三圆维恩图：交汇点 ---------------- */}
      <section className="border-t border-white/10 bg-gradient-to-b from-carbon-900 to-carbon-800/30 py-24">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-14 px-5 sm:px-8 lg:grid-cols-2 lg:px-10">
          <Reveal direction="left">
            <span className="inline-flex items-center gap-2 rounded-full border border-cyber-500/30 bg-cyber-500/10 px-4 py-1.5 text-xs font-semibold tracking-wide text-cyber-300">
              {T('我们的方法论', 'Our Methodology')}
            </span>
            <h2 className="mt-5 font-display text-3xl font-bold leading-snug sm:text-4xl">
              {T('三大学科的交汇点，', 'The intersection of three disciplines —')}
              <br />
              {T('正是 RoboWear 存在的理由', 'is the very reason RoboWear exists')}
            </h2>
            <p className="mt-5 max-w-xl text-sm leading-relaxed text-white/50 sm:text-base">
              {T(
                '材料科学决定了"能不能做出来"，机器人工程决定了"装不装得上"，时尚美学决定了"想不想拥有"。RoboWear 的研发团队同时坐在这三张桌子旁——任何一项技术，只有同时满足三方约束，才会进入我们的产品线。',
                'Materials science decides whether something can be made; robotics engineering decides whether it can be worn; fashion aesthetics decides whether anyone would want it. Our R&D team sits at all three tables — a technology only ships once it satisfies all three.'
              )}
            </p>
            <ul className="mt-6 space-y-3 text-sm text-white/50">
              <li className="flex items-start gap-2.5">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-electric-400" />
                {T('材料科学：纤维结构、热传导、阻燃与耐候性能', 'Materials science: fiber structure, thermal conductivity, fire & weather resistance')}
              </li>
              <li className="flex items-start gap-2.5">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-cyber-400" />
                {T('机器人工程：关节运动学、传感器布局、散热与充电路径', 'Robotics engineering: joint kinematics, sensor layout, thermal & charging pathways')}
              </li>
              <li className="flex items-start gap-2.5">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-pink-400" />
                {T('时尚美学：色彩、剪裁、风格语言与文化共鸣', 'Fashion aesthetics: color, cut, style language, and cultural resonance')}
              </li>
            </ul>
          </Reveal>

          <Reveal direction="right" delay={100}>
            <div className="relative mx-auto max-w-md">
              <svg viewBox="0 0 400 380" className="w-full">
                <circle cx="155" cy="150" r="115" fill="#2DE2FF" fillOpacity="0.14" stroke="#2DE2FF" strokeOpacity="0.55" strokeWidth="1.5" />
                <circle cx="245" cy="150" r="115" fill="#7C5CFF" fillOpacity="0.14" stroke="#7C5CFF" strokeOpacity="0.55" strokeWidth="1.5" />
                <circle cx="200" cy="235" r="115" fill="#FF5CA8" fillOpacity="0.11" stroke="#FF5CA8" strokeOpacity="0.45" strokeWidth="1.5" />

                <text x="80" y="78" fill="#2DE2FF" fontSize="14" fontWeight="600" fontFamily="'Space Grotesk', sans-serif">
                  {T('材料科学', 'Materials')}
                </text>
                <text x="265" y="78" fill="#9B8CFF" fontSize="14" fontWeight="600" fontFamily="'Space Grotesk', sans-serif">
                  {T('机器人工程', 'Robotics')}
                </text>
                <text x="200" y="358" fill="#FF8FBE" fontSize="14" fontWeight="600" textAnchor="middle" fontFamily="'Space Grotesk', sans-serif">
                  {T('时尚美学', 'Fashion Aesthetics')}
                </text>

                <text x="200" y="190" fill="#ffffff" fontSize="17" fontWeight="700" textAnchor="middle" fontFamily="'Space Grotesk', sans-serif">
                  RoboWear
                </text>
                <text x="200" y="208" fill="#ffffff" fontSize="10" fillOpacity="0.5" textAnchor="middle" letterSpacing="1.5">
                  {T('交汇之处', 'WHERE THEY MEET')}
                </text>
              </svg>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------------- 实验室与测试标准 ---------------- */}
      <section className="py-24">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-5 sm:px-8 lg:grid-cols-2 lg:px-10">
          <Reveal direction="left">
            <div className="group relative overflow-hidden rounded-2xl border border-white/10">
              <img
                src="/images/robowear/thermal-test.webp"
                alt={T('红外热成像散热对比测试：左侧未穿 RoboWear，右侧穿着后温度更稳定', 'Infrared thermal-imaging comparison — without RoboWear (left) vs. with RoboWear, showing more stable cooling (right)')}
                loading="lazy"
                className="aspect-[4/3] w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
              />
            </div>
          </Reveal>
          <Reveal direction="right" delay={80}>
            <span className="inline-flex items-center gap-2 rounded-full border border-electric-500/30 bg-electric-500/10 px-4 py-1.5 text-xs font-semibold tracking-wide text-electric-300">
              {T('实验室与测试标准', 'Lab & Testing Standards')}
            </span>
            <h2 className="mt-5 font-display text-3xl font-bold leading-snug sm:text-4xl">
              {T('每一件产品，', 'Every product —')}
              <br />
              {T('都先经过实验室的"折磨"', 'survives the lab before it ships')}
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/50">
              {T(
                '从材料疲劳到极端温度，从阻燃安全到传感器联调，我们用工业级测试标准对待每一寸面料 —— 因为机器人不会"将就"。',
                'From fatigue cycles to extreme temperatures, from fire safety to sensor integration — we hold every fiber to industrial-grade standards, because robots don’t compromise.'
              )}
            </p>
            <div className="mt-7 divide-y divide-white/8 overflow-hidden rounded-2xl border border-white/10 bg-carbon-800/40">
              {labRows.map((row) => (
                <div key={row.labelZh} className="flex flex-col gap-1 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-sm text-white/45">{T(row.labelZh, row.labelEn)}</span>
                  <span className="text-sm font-semibold text-white/85">{T(row.valueZh, row.valueEn)}</span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  )
}
