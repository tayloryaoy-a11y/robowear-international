import { Link } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext.jsx'
import Reveal from '../components/Reveal.jsx'
import {
  IconThermal,
  IconSensor,
  IconMotion,
  IconCharge,
  IconFireSafety,
  IconCompliance,
} from '../components/icons.jsx'

// Keep public stages conservative until platform-specific evidence is cleared.
const productLines = [
  {
    id: 'roboface',
    name: 'Robo-Face™',
    zh: '面部与头部定制',
    en: 'Face & head styling',
    descZh: '从面部轮廓到头部造型，以单品参考探索机器人的外在表达。',
    descEn:
      'Explore facial forms and head styling through individual design references.',
    image: '/images/robofit-v4/face-none.webp',
    imageFit: 'contain',
  },
  {
    id: 'robohair',
    name: 'Robo-Hair™',
    zh: '发型与头饰',
    en: 'Hair & headwear',
    descZh: '以发型、色彩与头饰丰富造型；安装与散热按目标机型评估。',
    descEn:
      'Build a visual direction with hair and headwear; mounting and thermal fit are assessed per platform.',
    image: '/images/robofit-v4/hair-long-straight.webp',
    imageFit: 'contain',
  },
  {
    id: 'robowear',
    name: 'Robo-Wear™',
    zh: '服装套装',
    en: 'Apparel Sets',
    descZh: '探索居家、职业与高定服装套装，为打样和项目评估建立清晰方向。',
    descEn:
      'Home, professional and couture apparel sets for prototyping and custom project review.',
    image: '/configurator/clothing/couture-celestial-tailoring.webp',
    imageFit: 'contain',
  },
  {
    id: 'accessories',
    name: 'Robo-Accessories™',
    zh: '功能配件',
    en: 'Functional accessories',
    descZh: '探索背负、鞋履与装饰模块，同时评估接口、质量与运动边界。',
    descEn:
      'Explore carry, footwear and styling modules alongside access, mass and motion requirements.',
    image: '/configurator/extensions/carry/utility.webp',
    imageFit: 'contain',
  },
  {
    id: 'roboskin',
    name: 'Robo-Skin™',
    zh: '智能皮肤研发方向',
    en: 'Skin cover R&D',
    descZh: '探索柔性表面、触感、皮肤感知材料与外覆结构，相关材料及覆盖范围需按机型验证。',
    descEn:
      'Research into soft surfaces, touch, skin-sensing materials and cover structures, with materials and coverage assessed per platform.',
    image: '/images/robowear/product-roboskin.webp',
    research: true,
  },
]
const constraints = [
  {
    Icon: IconThermal,
    zh: '热设计',
    en: 'Thermal design',
    descZh: '按用途选择材料并安排热设计与测试，评估覆盖对散热路径的影响。',
    descEn:
      'Choose materials for the use case and test how covers affect thermal paths.',
  },
  {
    Icon: IconSensor,
    zh: '传感器工作空间',
    en: 'Sensor workspace',
    descZh: '围绕摄像头、雷达等布局设计外观，覆盖与材料需结合目标机型验证。',
    descEn:
      'Preserve sensor workspace; validate covers and materials per platform.',
  },
  {
    Icon: IconMotion,
    zh: '质量与关节行程',
    en: 'Mass & joint travel',
    descZh: '控制附加阻力与质量，避免妨碍关节设计行程。',
    descEn: 'Limit added drag and mass so joint travel is not impeded.',
  },
  {
    Icon: IconCharge,
    zh: '充电与维护',
    en: 'Charging & service access',
    descZh: '根据目标机型的充电接口和维护流程设计开口与拆装方式。',
    descEn:
      'Plan openings and removal around the platform’s charging and service workflow.',
  },
  {
    Icon: IconFireSafety,
    zh: '材料与用途',
    en: 'Materials for the use case',
    descZh: '按接触、环境与热源条件评估材料，验证范围以项目测试为准。',
    descEn:
      'Assess materials against contact, environment and heat conditions through project testing.',
  },
  {
    Icon: IconCompliance,
    zh: '市场与合规评估',
    en: 'Market requirements',
    descZh: '按目标市场与用途评估合规要求，项目制推进。',
    descEn:
      'Assess compliance by target market and use case, project by project.',
  },
]
const primary =
  'inline-flex items-center justify-center gap-2.5 rounded-full bg-gradient-to-r from-electric-500 to-cyber-500 px-7 py-3.5 text-sm font-semibold text-carbon-900 shadow-[0_0_30px_rgba(45,226,255,0.25)] transition-all duration-300 hover:-translate-y-0.5'
const secondary =
  'inline-flex items-center justify-center gap-2.5 rounded-full border border-white/20 bg-white/[0.03] px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:border-white/40 hover:bg-white/[0.07]'

export default function Home() {
  const { T } = useLanguage()
  return (
    <div>
      <section className="relative flex min-h-[100svh] items-center overflow-hidden bg-carbon-900 pb-14 pt-28 sm:pt-32">
        <div className="absolute inset-0 bg-tech-grid opacity-30" />
        <div className="absolute inset-0 bg-hero-glow" />
        <div className="absolute -right-40 top-1/2 hidden h-[640px] w-[640px] -translate-y-1/2 rounded-full bg-electric-500/10 blur-[120px] lg:block" />
        <div className="relative mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-10 px-5 sm:px-8 lg:grid-cols-2 lg:px-10 lg:py-14">
          <div className="order-2 lg:order-1">
            <Reveal>
              <h1 className="font-display text-4xl font-bold leading-[1.12] tracking-tight sm:text-5xl lg:text-[3.4rem] xl:text-6xl">
                {T('为具身机器人', 'Custom looks for')}
                <br />
                <span className="text-gradient">
                  {T('定制外观', 'embodied robots')}
                </span>
              </h1>
            </Reveal>
            <Reveal delay={120}>
              <p className="mt-6 max-w-xl text-base font-medium leading-relaxed text-white/80 sm:text-lg">
                {T(
                  '外观定制 — 探索造型、开始选配、寻求合作。',
                  'Appearance customization — explore looks, start a fit, partner with us.',
                )}
              </p>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/50 sm:text-base">
                {T(
                  '服装、软性外覆与造型，兼顾工程约束与视觉表达。依托中国供应链速度与高校联合开发，欢迎定制项目与合作询盘。',
                  'Apparel, soft covers and styling within real engineering constraints. Built with China supply-chain speed × university co-development. Custom projects & partnerships welcome.',
                )}
              </p>
            </Reveal>
            <div>
              <div className="mt-8 flex flex-row flex-wrap gap-3">
                <Link to="/products" className={primary}>
                  {T('探索外观', 'Explore looks')}
                </Link>
                <Link to="/robofit" className={secondary}>
                  {T('开始选配', 'Start customizing')}
                </Link>
              </div>
              <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3 text-sm">
                <Link
                  to="/contact?type=partner"
                  className="text-electric-300 hover:text-electric-200"
                >
                  {T('与我们合作', 'Partner with us')}
                </Link>
                <Link
                  to="/contact?type=appearance"
                  className="text-white/65 hover:text-white"
                >
                  {T('获取报价评估', 'Request a quote')}
                </Link>
              </div>
              <p className="mt-6 text-xs leading-relaxed text-white/40">
                {T(
                  '一键下单已列入路线图；当前接受定制询盘。',
                  'One-click order is on the roadmap. Today, request a custom quote.',
                )}
              </p>
            </div>
          </div>
          <Reveal delay={160} direction="right" className="order-1 lg:order-2">
            <div className="relative mx-auto w-full max-w-xl lg:max-w-none">
              <div className="absolute -inset-6 rounded-[2rem] bg-gradient-to-tr from-electric-500/20 via-transparent to-cyber-500/20 blur-2xl" />
              <div className="relative overflow-hidden rounded-[1.75rem] border border-white/10 shadow-[0_30px_90px_-25px_rgba(45,226,255,0.35)] motion-safe:animate-floaty">
                <img
                  src="/images/robowear/hero-couture.webp"
                  alt={T(
                    '人形机器人高定服装设计效果图',
                    'Design render of a humanoid robot in couture apparel',
                  )}
                  className="aspect-[3/2] w-full object-cover"
                  fetchpriority="high"
                />
              </div>
              <p className="relative mt-3 text-right text-[11px] uppercase tracking-wider text-white/35">
                {T('设计效果图', 'Design render')}
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-10">
        <div className="grid gap-6 md:grid-cols-2">
          <Reveal>
            <div className="h-full rounded-2xl border border-white/10 bg-white/[0.02] p-8">
              <h2 className="font-display text-2xl font-bold">
                {T('为机器人寻找新外观', 'Find a look for your robot')}
              </h2>
              <p className="mt-3 max-w-lg text-sm leading-relaxed text-white/50">
                {T(
                  '浏览外观方向，在 RoboFit 选择单品参考，再把方案带入报价咨询。',
                  'Explore looks, select item references in RoboFit, then bring your look summary into a quote request.',
                )}
              </p>
              <div className="mt-6 flex flex-wrap gap-5 text-sm font-medium">
                <Link to="/products" className="text-electric-300">
                  {T('探索外观', 'Explore looks')}
                </Link>
                <Link to="/robofit" className="text-white/75">
                  {T('开始选配', 'Start customizing')}
                </Link>
              </div>
            </div>
          </Reveal>
          <Reveal delay={100}>
            <div className="h-full rounded-2xl border border-cyber-500/20 bg-cyber-500/[0.04] p-8">
              <h2 className="font-display text-2xl font-bold">
                {T('共同开发下一种表达', 'Create the next expression')}
              </h2>
              <p className="mt-3 max-w-lg text-sm leading-relaxed text-white/50">
                {T(
                  '欢迎机器人制造商、品牌、创作者与投资或联合开发伙伴沟通目标、时间与项目边界。',
                  'For OEMs, brands, creators and investment or co-development partners: share your goals, timing and project requirements.',
                )}
              </p>
              <Link
                to="/contact?type=partner"
                className="mt-6 inline-block text-sm font-medium text-electric-300"
              >
                {T('与我们合作', 'Partner with us')}
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="relative border-t border-white/8 bg-gradient-to-b from-carbon-800/40 to-transparent py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <Reveal>
            <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
              <div>
                <span className="text-xs font-semibold uppercase tracking-widest2 text-electric-400">
                  {T('产品与外观', 'Products & Looks')}
                </span>
                <h2 className="mt-3 max-w-3xl font-display text-3xl font-bold sm:text-4xl">
                  {T(
                    '从面部造型，到完整外观方向',
                    'From facial styling to a complete look direction',
                  )}
                </h2>
              </div>
              <Link
                to="/products"
                className="shrink-0 text-sm font-medium text-electric-300"
              >
                {T('查看五大产品线', 'Explore all five lines')}
              </Link>
            </div>
          </Reveal>
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {productLines.map((p, i) => (
              <Reveal key={p.id} delay={i * 70}>
                <Link
                  to={`/products#${p.id}`}
                  className="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] hover-lift"
                >
                  <div className="relative overflow-hidden border-b border-white/10 bg-carbon-800/40">
                    <img
                      src={p.image}
                      alt={T(`${p.zh}设计效果图`, `${p.en} design render`)}
                      loading="lazy"
                      className={`aspect-[16/10] w-full ${p.imageFit === 'contain' ? 'object-contain' : 'object-cover'} transition-transform duration-700 group-hover:scale-[1.04]`}
                    />
                    <span className="absolute bottom-3 left-3 rounded-full bg-carbon-900/80 px-3 py-1 text-[10px] text-white/65">
                      {T('设计效果图', 'Design render')}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <h3 className="font-display text-lg font-bold">
                      {T(p.zh, p.en)}
                    </h3>
                    <p className="mt-1 text-sm font-medium text-white/40">
                      {p.name}
                    </p>
                    <p className="mt-3 flex-1 text-sm leading-relaxed text-white/50">
                      {T(p.descZh, p.descEn)}
                    </p>
                    <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-white/8 pt-4 text-xs">
                      <span className="text-electric-300">
                        {p.research
                          ? T('研发方向', 'R&D direction')
                          : T('概念参考', 'Concept reference')}
                      </span>
                      <span className="text-white/50">
                        {T('定制评估报价', 'Estimate on request')}
                      </span>
                    </div>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-electric-500/[0.025] py-14">
        <Reveal>
          <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
            <h2 className="max-w-4xl font-display text-2xl font-bold leading-snug sm:text-3xl">
              {T(
                '中国供应链速度 × 高校联合开发',
                'China supply-chain speed × university co-development',
              )}
            </h2>
            <p className="mt-4 max-w-3xl text-sm leading-relaxed text-white/50">
              {T(
                '把材料、结构与造型问题放在同一个开发流程中，围绕目标机型推进设计、打样与验证。',
                'Bring materials, structure and styling into one development process, with design, prototyping and validation shaped around the target platform.',
              )}
            </p>
          </div>
        </Reveal>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:px-10">
        <Reveal>
          <div className="mx-auto max-w-3xl text-center">
            <span className="text-xs font-semibold uppercase tracking-widest2 text-electric-400">
              {T('工程设计原则', 'Engineering principles')}
            </span>
            <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">
              {T(
                '外观表达，从理解机器人开始',
                'Appearance starts with understanding the robot',
              )}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-white/50">
              {T(
                '以下是设计与验证方向。适配结论取决于具体机型、版本、材料与使用条件。',
                'These principles guide design and validation. Fit conclusions depend on the platform, version, materials and use conditions.',
              )}
            </p>
          </div>
        </Reveal>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {constraints.map(({ Icon, zh, en, descZh, descEn }, i) => (
            <Reveal key={en} delay={i * 60}>
              <div className="flex h-full gap-5 rounded-2xl border border-white/10 bg-white/[0.02] p-6">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/12 text-electric-400">
                  <Icon width={24} height={24} />
                </div>
                <div>
                  <h3 className="font-display text-base font-bold">
                    {T(zh, en)}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/50">
                    {T(descZh, descEn)}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="border-t border-white/8 bg-carbon-800/40 py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <Reveal>
            <span className="text-xs font-semibold uppercase tracking-widest2 text-electric-400">
              {T('研发进展', 'R&D progress')}
            </span>
            <h2 className="mt-3 font-display text-3xl font-bold">
              {T(
                '从外观方向，走向机型验证',
                'From look direction to platform validation',
              )}
            </h2>
            <p className="mt-4 max-w-3xl text-sm leading-relaxed text-white/50">
              {T(
                '当前展示以设计效果图和概念参考为主。机型的验证结果将在具备可公开证据后更新。',
                'The current showcase focuses on design renders and concept references. Platform results will be updated when supporting evidence is cleared for publication.',
              )}
            </p>
          </Reveal>
          <Reveal delay={80}>
            <div className="mt-8 overflow-hidden rounded-2xl border border-white/10">
              <div className="grid grid-cols-[1fr_auto] gap-4 border-b border-white/10 bg-white/[0.03] px-5 py-4 text-xs font-medium text-white/60">
                <span>{T('机型参考', 'Platform reference')}</span>
                <span>{T('当前公开状态', 'Public status')}</span>
              </div>
              {['Tesla Optimus', 'Figure 03', 'XPeng Iron'].map((name) => (
                <div
                  key={name}
                  className="grid grid-cols-[1fr_auto] gap-4 border-b border-white/8 px-5 py-4 text-sm last:border-0"
                >
                  <span className="text-white/75">{name}</span>
                  <span className="text-electric-300">
                    {T('概念参考', 'Concept reference')}
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs leading-relaxed text-white/35">
              {T(
                '状态分类：已验证／开发中／概念参考。当前列示不代表已适配或官方合作。',
                'Status key: Verified / In development / Concept reference. Listed references do not establish compatibility or official partnership.',
              )}
            </p>
          </Reveal>
        </div>
      </section>

      <section className="relative overflow-hidden py-24">
        <div className="absolute inset-0 bg-hero-glow opacity-70" />
        <Reveal>
          <div className="relative mx-auto flex max-w-4xl flex-col items-center px-5 text-center">
            <h2 className="font-display text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
              {T(
                '为你的机器人，开启一种新表达',
                'Give your robot a new expression',
              )}
            </h2>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-white/55">
              {T(
                '选择外观参考，生成方案摘要，再与我们沟通工程边界、时间与定制报价。',
                'Choose item references, generate a look summary, then discuss engineering requirements, timing and a custom estimate.',
              )}
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link to="/robofit" className={primary}>
                {T('开始选配', 'Start customizing')}
              </Link>
              <Link to="/contact?type=partner" className={secondary}>
                {T('与我们合作', 'Partner with us')}
              </Link>
            </div>
            <Link
              to="/contact?type=appearance"
              className="mt-6 text-sm text-electric-300"
            >
              {T('获取报价评估', 'Request a quote')}
            </Link>
            <p className="mt-5 text-xs text-white/35">
              {T(
                '下单即将推出 · 一键下单已列入路线图',
                'Order coming soon · One-click order is on the roadmap',
              )}
            </p>
          </div>
        </Reveal>
      </section>
    </div>
  )
}
