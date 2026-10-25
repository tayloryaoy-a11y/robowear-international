import { Link } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext.jsx'
import Reveal from '../components/Reveal.jsx'
import { IconThermal, IconSensor, IconMotion, IconCharge, IconCube3D } from '../components/icons.jsx'

// R&D directions only. Reports, patent identifiers, and parameter posters require clearance before publication.
const RESEARCH = [
  {
    id: 'thermal-weave', name: 'Thermal design', Icon: IconThermal, tone: 'electric',
    titleZh: '透气与散热路径', titleEn: 'Breathability & heat pathways',
    problemZh: '外覆层可能改变机身周围的气流与热积聚。', problemEn: 'An outer layer can change airflow and heat buildup around a robot.',
    descZh: '按用途选择材料，围绕散热口设计开口、间距与透气区域。', descEn: 'Choose materials for the use case and plan openings, clearances, and breathable zones around cooling paths.',
    scopeZh: '需结合目标机型、环境与任务负载做热测试。', scopeEn: 'Thermal testing is required for the target platform, environment, and workload.'
  },
  {
    id: 'sensor-pass', name: 'Sensor workspace', Icon: IconSensor, tone: 'cyber',
    titleZh: '传感器工作空间', titleEn: 'Sensor workspace',
    problemZh: '服装与外观部件可能遮挡摄像头、雷达或其他传感器。', problemEn: 'Apparel and appearance modules can obstruct cameras, LiDAR, or other sensors.',
    descZh: '围绕传感器布局保留工作空间，选择开孔、避让或材料验证路径。', descEn: 'Preserve sensor workspace through openings, clearance, or a material-validation path.',
    scopeZh: '覆盖结构与材料需逐机型验证，不能默认信号可穿透。', scopeEn: 'Validate covers and materials per platform; signal transmission cannot be assumed.'
  },
  {
    id: 'flexjoint', name: 'Joint tailoring', Icon: IconMotion, tone: 'rose',
    titleZh: '关节行程与附加负载', titleEn: 'Joint travel & added load',
    problemZh: '剪裁、重量与摩擦会影响动作空间。', problemEn: 'Cut, mass, and friction affect the space available for motion.',
    descZh: '控制附加阻力与质量，围绕关节设计行程安排廓形、弹性与连接结构。', descEn: 'Limit added drag and mass; plan silhouette, flexibility, and attachment around designed joint travel.',
    scopeZh: '需按机型完成动作检查、连接强度与磨损评估。', scopeEn: 'Check motion, attachment strength, and wear on the target platform.'
  },
  {
    id: 'magcharge-port', name: 'Service access', Icon: IconCharge, tone: 'electric',
    titleZh: '充电与检修通道', titleEn: 'Charging & maintenance access',
    problemZh: '外观部件可能影响充电对接、急停与维护。', problemEn: 'Appearance parts can affect docking, emergency controls, and service access.',
    descZh: '为接口、操作区与检修路径预留开口或可拆结构。', descEn: 'Plan openings or removable structures for connectors, controls, and maintenance paths.',
    scopeZh: '按目标平台接口与安全要求确认设计，并逐项目评估合规。', scopeEn: 'Confirm platform interfaces and safety needs; assess compliance by market and use case.'
  },
  {
    id: 'robofit-reference', name: 'RoboFit reference', Icon: IconCube3D, tone: 'cyber',
    titleZh: '外观选配与单品参考', titleEn: 'Appearance selection & item reference',
    problemZh: '设计参考图不能替代完整组合试衣与实物适配。', problemEn: 'Design reference images cannot establish a combined fit or physical compatibility.',
    descZh: '用选项、单品参考图与方案摘要记录需求，连接项目评估。', descEn: 'Capture intent through selections, item reference images, and a look summary for project review.',
    scopeZh: '当前为外观参考；组合 3D 与一键下单列入后续路线图。', scopeEn: 'Appearance reference today; combined 3D and one-click ordering remain on the roadmap.'
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
              {T('材料与研发', 'Materials & R&D')}
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
                '从关节结构、散热路径与传感器布局出发，探索服装、软性外覆与造型的设计方法。每个项目的材料、结构与适配边界都需要结合目标机型验证。',
                'Explore apparel, soft covers, and styling from a robot’s joints, thermal paths, and sensor layout. Materials, structure, and fit boundaries require validation for each target platform.'
              )}
            </p>
          </Reveal>
        </div>
      </section>

      {/* ---------------- 核心技术研发 ---------------- */}
      <section className="py-12">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <Reveal>
            <h2 className="font-display text-2xl font-bold sm:text-3xl">{T('核心技术研发', 'Core Technology R&D')}</h2>
            <p className="mt-2 max-w-2xl text-sm text-white/45">
              {T('以下为研发方向与工程原则；具体性能与适配结论须结合目标机型和测试条件确认。', 'R&D directions and engineering principles. Performance and fit require platform-specific testing and conditions.')}
            </p>
          </Reveal>

          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {RESEARCH.map((topic, idx) => (
              <Reveal key={topic.id} delay={idx * 80} className={idx === 4 ? 'sm:col-span-2 lg:col-span-1' : ''}>
                <div className={`hover-lift h-full rounded-2xl border p-6 ${toneClass[topic.tone]}`}>
                  <div className="flex items-center justify-between gap-3">
                    <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconBg[topic.tone]}`}><topic.Icon width={20} height={20} /></span>
                    <span className="text-xs text-white/45">{T('研发方向', 'R&D direction')}</span>
                  </div>
                  <h3 className="mt-5 font-display text-lg font-bold text-white">{T(topic.titleZh, topic.titleEn)}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-white/50">{T(topic.problemZh, topic.problemEn)}</p>
                  <p className="mt-3 text-sm leading-relaxed text-white/70">{T(topic.descZh, topic.descEn)}</p>
                  <p className="mt-4 border-t border-white/10 pt-4 text-xs leading-relaxed text-white/45">{T(topic.scopeZh, topic.scopeEn)}</p>
                  <p className="mt-4 text-xs font-medium text-electric-300">{T('按机型验证中 · 下一步：项目评估', 'Platform validation required · Next: project review')}</p>
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
                '材料、工程与美学共同约束外观设计。我们结合中国供应链资源与高校联合开发，围绕目标机型讨论可制造性、适配与视觉表达；验证范围在项目评估中明确。',
                'Materials, engineering, and aesthetics shape every look. We combine China supply-chain resources with university co-development to explore manufacturability, fit, and visual expression. Validation scope is defined during project review.'
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
            <Link to="/contact?type=oem" className="mt-7 inline-flex rounded-full border border-electric-500/40 px-5 py-3 text-sm font-semibold text-electric-300">{T('讨论目标机型与项目', 'Discuss your platform & project')}</Link>
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

    </div>
  )
}
