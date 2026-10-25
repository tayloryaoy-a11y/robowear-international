import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext.jsx'
import Reveal from '../components/Reveal.jsx'

// Materials, adaptation and delivery status require evidence for the exact platform/version.
const lines = [
  {
    id: 'roboface',
    name: 'Robo-Face™',
    zh: '面部与头部定制',
    en: 'Face & head customization',
    category: 'mask',
    descZh:
      '用面部轮廓、表面质感与头部造型探索机器人的外在表达。先选择视觉参考，再根据目标机型评估结构、安装与感知边界。',
    descEn:
      'Explore a robot’s expression through facial forms, surface treatments and head styling. Start with a visual reference, then assess structure, mounting and sensor requirements for the target platform.',
    sceneZh: '外观定制、展示项目、品牌角色与 OEM 造型开发。',
    sceneEn:
      'Custom looks, display projects, brand characters and OEM styling development.',
    offerZh: '外观设计方向、面部造型打样范围与联合开发评估。',
    offerEn:
      'Look directions, facial-form prototype scoping and co-development evaluation.',
    materialZh:
      '表面、透视区与固定方式按机型验证中；图示不代表最终材料或动态表情能力。',
    materialEn:
      'Surfaces, sensor openings and mounting require platform-specific validation. Renders do not establish final materials or dynamic-expression capability.',
    image: '/images/robofit-v4/face-none.webp',
    fit: 'contain',
    gallery: [
      {
        image: '/images/robofit-v4/face-none.webp',
        zh: '东亚男性造型',
        en: 'East Asian · Male styling',
      },
      {
        image: '/images/robofit-v4/face-tech-minimal.webp',
        zh: '东亚女性造型',
        en: 'East Asian · Female styling',
      },
      {
        image: '/images/robofit-v4/face-warm-companion.webp',
        zh: '非洲裔女性造型',
        en: 'African Descent · Female styling',
      },
      {
        image: '/images/robofit-v4/face-business-human.webp',
        zh: '欧洲男性造型',
        en: 'European · Male styling',
      },
    ],
  },
  {
    id: 'robohair',
    name: 'Robo-Hair™',
    zh: '发型与头饰系统',
    en: 'Hair & headwear',
    category: 'hair',
    descZh:
      '通过发型、色彩、纹理和头饰建立鲜明造型。头部曲率、固定结构、维护方式与散热条件共同决定最终方案。',
    descEn:
      'Shape a distinctive look with hairstyles, color, texture and headwear. Head curvature, retention, service access and thermal conditions inform the final design.',
    sceneZh: '个性化外观、展示角色、品牌造型与创作者共创。',
    sceneEn:
      'Personalized looks, display characters, brand styling and creator co-creation.',
    offerZh: '发型与头饰参考、材料选样、固定方案与打样范围评估。',
    offerEn:
      'Hair and headwear references, material sampling and mounting/prototype scope review.',
    materialZh: '发丝与头饰材料、固定方式及散热影响需结合目标机型验证。',
    materialEn:
      'Hair and headwear materials, retention and thermal effects require validation on the target platform.',
    image: '/images/robofit-v4/hair-long-straight.webp',
    fit: 'contain',
    gallery: [
      {
        image: '/images/robofit-v4/hair-short.webp',
        zh: '短发',
        en: 'Short hair',
      },
      {
        image: '/images/robofit-v4/hair-long-straight.webp',
        zh: '长直发',
        en: 'Long straight hair',
      },
      {
        image: '/images/robofit-v4/hair-curly.webp',
        zh: '卷发',
        en: 'Curly hair',
      },
      {
        image: '/images/robofit-v4/headwear-temple-arc.webp',
        zh: '弧形头饰',
        en: 'Temple arc headwear',
      },
    ],
  },
  {
    id: 'robowear',
    name: 'Robo-Wear™',
    zh: '服装套装',
    en: 'Apparel Sets',
    category: 'apparel',
    descZh:
      '围绕居家、职业、高定与共创方向探索服装套装。版型设计从目标机型的关节行程、传感器布局、热源与维护流程出发。',
    descEn:
      'Explore apparel sets across home, professional, couture and co-creation directions. Patterns start with the target platform’s joint travel, sensors, heat sources and service workflow.',
    sceneZh: '家庭机器人个性化、服务场景外观、展览展示与 OEM 项目。',
    sceneEn:
      'Home robot personalization, service styling, exhibitions and OEM projects.',
    offerZh: '造型设计、版型与材料方向、样衣范围和项目定制评估。',
    offerEn:
      'Styling, pattern and material directions, sample scope and custom project evaluation.',
    materialZh:
      '面料、开口与附加质量按机型验证中；性能与防护等级需以项目测试确认。',
    materialEn:
      'Fabrics, openings and added mass require platform-specific validation. Performance and protection ratings depend on project testing.',
    image: '/configurator/clothing/couture-celestial-tailoring.webp',
    fit: 'contain',
    subSeries: [
      {
        id: 'home',
        zh: '居家系列',
        en: 'Home series',
        descZh: '探索柔和轮廓与日常生活场景的视觉语言。',
        descEn: 'Soft silhouettes and a visual language for everyday living.',
        image: '/configurator/clothing/home-nursery-care.webp',
      },
      {
        id: 'professional',
        zh: '职业系列',
        en: 'Professional series',
        descZh: '为礼宾、零售与展览等场景探索品牌化制服。',
        descEn:
          'Branded uniform directions for hospitality, retail and exhibitions.',
        image: '/configurator/clothing/professional-hotel-concierge.webp',
      },
      {
        id: 'couture',
        zh: '高定系列',
        en: 'Couture series',
        descZh: '探索材质、廓形与舞台表达，具体材料按项目评估。',
        descEn:
          'Material, silhouette and showpiece exploration, assessed project by project.',
        image: '/configurator/clothing/couture-liquid-silver.webp',
      },
      {
        id: 'co-creation',
        zh: '品牌与设计师共创方向',
        en: 'Brand & designer co-creation',
        descZh: '欢迎品牌与设计师提出原创方向；授权范围与项目条件另行确认。',
        descEn:
          'Original directions from brands and designers are welcome; rights and project terms are reviewed individually.',
      },
    ],
  },
  {
    id: 'accessories',
    name: 'Robo-Accessories™',
    zh: '功能配件',
    en: 'Functional accessories',
    category: 'carry',
    descZh:
      '从背负模块到鞋履与装饰，探索为完整造型增加功能的配件方向。接口、载荷、传感器视野与运动边界需纳入评估。',
    descEn:
      'From carry modules to footwear and styling details, explore accessories that add function to a look. Access, load, sensor workspace and motion boundaries shape the assessment.',
    sceneZh: '展示、服务角色、品牌造型与功能模块探索。',
    sceneEn:
      'Display, service roles, branded looks and functional-module exploration.',
    offerZh: '配件造型、布局与固定方案、材料选样和打样评估。',
    offerEn:
      'Accessory styling, layout and mounting directions, material sampling and prototype assessment.',
    materialZh: '附加质量、固定可靠性、接口空间与接触材料需按机型验证。',
    materialEn:
      'Added mass, retention, interface clearance and contact materials require platform-specific validation.',
    image: '/configurator/extensions/carry/utility.webp',
    fit: 'contain',
    gallery: [
      {
        image: '/configurator/extensions/carry/utility.webp',
        zh: '机能背负',
        en: 'Utility carry',
      },
      {
        image: '/configurator/extensions/carry/business.webp',
        zh: '商务背负',
        en: 'Business carry',
      },
      {
        image: '/configurator/extensions/carry/tool-module.webp',
        zh: '工具模块',
        en: 'Tool module',
      },
      {
        image: '/configurator/extensions/carry/waist.webp',
        zh: '腰部模块',
        en: 'Waist module',
      },
    ],
  },
  {
    id: 'roboskin',
    name: 'Robo-Skin™',
    zh: '智能皮肤覆盖系统',
    en: 'Skin cover research',
    category: 'skin',
    research: true,
    descZh:
      '探索机器人的柔性表面、触感、皮肤感知材料与外覆结构。覆盖范围、材料组合、传感器窗口与热路径需要围绕目标平台逐项开发和验证。',
    descEn:
      'Research into soft surfaces, touch, skin-sensing materials and cover structures for robots. Coverage, material combinations, sensor windows and thermal paths require development and validation around the target platform.',
    sceneZh: '软性外观研究、触感探索与 OEM 联合开发。',
    sceneEn:
      'Soft appearance research, tactile exploration and OEM co-development.',
    offerZh: '皮肤感知材料与外覆结构方向讨论、局部打样范围和联合开发可行性评估。',
    offerEn:
      'Skin-sensing material and cover structure discussions, local prototype scoping and co-development feasibility review.',
    materialZh:
      '皮肤感知材料、覆盖与散热方案为研发方向，需按具体机型、用途与测试条件验证。',
    materialEn:
      'Skin-sensing materials, coverage and thermal approaches are R&D directions requiring validation for the platform, use case and test conditions.',
    image: '/images/robowear/product-roboskin.webp',
  },
]
const primary =
  'inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-electric-500 to-cyber-500 px-6 py-3 text-sm font-semibold text-carbon-900 transition-transform hover:-translate-y-0.5'

export default function Products() {
  const { T } = useLanguage()
  const { hash } = useLocation()
  const [active, setActive] = useState(lines[0].id)
  const sectionRefs = useRef({})
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.dataset.sectionId)
        })
      },
      { rootMargin: '-35% 0px -55% 0px', threshold: 0 },
    )
    Object.values(sectionRefs.current).forEach(
      (el) => el && observer.observe(el),
    )
    return () => observer.disconnect()
  }, [])
  useEffect(() => {
    const id = hash.slice(1)
    const timer = window.setTimeout(() => {
      const el = sectionRefs.current[id]
      if (el) {
        el.scrollIntoView({ block: 'start', behavior: 'auto' })
        setActive(id)
      }
    }, 0)
    return () => clearTimeout(timer)
  }, [hash])
  const scrollToSection = (id) => {
    setActive(id)
    sectionRefs.current[id]?.scrollIntoView({
      block: 'start',
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'auto'
        : 'smooth',
    })
  }
  return (
    <div className="pt-24">
      <section className="relative overflow-hidden border-b border-white/8 bg-carbon-900 py-16">
        <div className="absolute inset-0 bg-tech-grid opacity-25" />
        <div className="absolute -top-24 right-1/4 h-72 w-72 rounded-full bg-electric-500/10 blur-[110px]" />
        <Reveal className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <span className="text-xs font-semibold uppercase tracking-widest2 text-electric-400">
            {T('产品与外观', 'Products & Looks')}
          </span>
          <h1 className="mt-3 max-w-5xl font-display text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
            {T('探索机器人的外观表达', 'Explore how your robot could look')}
          </h1>
          <p className="mt-5 max-w-4xl text-base leading-relaxed text-white/50">
            {T(
              '五大产品线，连接面部、发型、服装套装、配件与柔性表面。选择外观参考，带入 RoboFit 生成方案，再与我们讨论适配和定制报价。',
              'Five lines connect facial styling, hair, apparel sets, accessories and soft surfaces. Choose a look reference, build a summary in RoboFit, then discuss platform fit and a custom estimate.',
            )}
          </p>
          <p className="mt-4 text-sm text-white/40">
            {T(
              '图示为设计效果图与概念参考；机型适配和交付范围需经项目评估。',
              'Images are design renders and concept references. Platform fit and delivery scope require project assessment.',
            )}
          </p>
        </Reveal>
      </section>
      <div className="sticky top-[64px] z-30 border-b border-white/8 bg-carbon-900/90 backdrop-blur-xl sm:top-[72px]">
        <nav
          aria-label={T('产品线', 'Product lines')}
          className="mx-auto flex max-w-7xl gap-1.5 overflow-x-auto px-5 py-3 sm:px-8 lg:px-10 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {lines.map((line) => (
            <button
              key={line.id}
              type="button"
              onClick={() => scrollToSection(line.id)}
              aria-pressed={active === line.id}
              className={`shrink-0 rounded-full border px-4 py-2 text-xs font-semibold transition-colors sm:text-sm ${active === line.id ? 'border-electric-400/60 bg-electric-500/10 text-electric-300' : 'border-white/10 text-white/50 hover:text-white'}`}
            >
              {line.name}
              <span className="ml-1.5 hidden text-white/40 xl:inline">
                · {T(line.zh, line.en)}
              </span>
            </button>
          ))}
        </nav>
      </div>
      <div className="mx-auto max-w-7xl space-y-24 px-5 py-20 sm:px-8 lg:px-10">
        {lines.map((line, idx) => (
          <section
            key={line.id}
            id={line.id}
            data-section-id={line.id}
            ref={(el) => {
              sectionRefs.current[line.id] = el
            }}
            className="scroll-mt-40"
          >
            <div
              className={`grid grid-cols-1 items-start gap-10 lg:grid-cols-2 ${idx % 2 === 1 ? 'lg:[&>*:first-child]:order-2' : ''}`}
            >
              <Reveal direction={idx % 2 === 1 ? 'right' : 'left'}>
                <div className="overflow-hidden rounded-2xl border border-white/10 bg-carbon-800/40">
                  <img
                    src={line.image}
                    alt={T(`${line.zh}设计效果图`, `${line.en} design render`)}
                    loading="lazy"
                    className={`aspect-[4/3] w-full ${line.fit === 'contain' ? 'object-contain' : 'object-cover'}`}
                  />
                  <p className="border-t border-white/8 px-5 py-3 text-[11px] uppercase tracking-wider text-white/40">
                    {T(
                      '设计效果图 · 概念参考',
                      'Design render · Concept reference',
                    )}
                  </p>
                </div>
              </Reveal>
              <Reveal delay={100}>
                <p className="text-xs font-semibold uppercase tracking-widest2 text-electric-300">
                  {line.research
                    ? T('研发方向', 'R&D direction')
                    : T(
                        '概念参考 · 可接受项目评估',
                        'Concept reference · Open for project review',
                      )}
                </p>
                <h2 className="mt-4 font-display text-3xl font-bold sm:text-4xl">
                  {T(line.zh, line.en)}
                </h2>
                <p className="mt-2 text-base font-medium text-white/40">
                  {line.name}
                </p>
                <p className="mt-5 text-sm leading-relaxed text-white/55">
                  {T(line.descZh, line.descEn)}
                </p>
                <dl className="mt-6 space-y-4 text-sm leading-relaxed">
                  <div>
                    <dt className="text-xs uppercase tracking-wider text-white/35">
                      {T('适用场景', 'Use cases')}
                    </dt>
                    <dd className="mt-1 text-white/60">
                      {T(line.sceneZh, line.sceneEn)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wider text-white/35">
                      {T('可提供内容', 'Available scope')}
                    </dt>
                    <dd className="mt-1 text-white/60">
                      {T(line.offerZh, line.offerEn)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wider text-white/35">
                      {T('适配边界', 'Platform boundary')}
                    </dt>
                    <dd className="mt-1 text-white/60">
                      {T(
                        '概念参考；每个机型与版本均需独立适配评估。',
                        'Concept reference; each platform and version requires an individual fit assessment.',
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wider text-white/35">
                      {T('材料与验证', 'Materials & validation')}
                    </dt>
                    <dd className="mt-1 text-white/60">
                      {T(line.materialZh, line.materialEn)}
                    </dd>
                  </div>
                </dl>
                <div className="mt-7 border-t border-white/10 pt-5">
                  <p className="font-display text-lg font-semibold text-electric-300">
                    {T('定制评估报价', 'Estimate on request')}
                  </p>
                  <div className="mt-5 flex flex-wrap items-center gap-5">
                    <Link
                      to={`/robofit?category=${line.category}`}
                      className={primary}
                    >
                      {T('进入外观选配', 'Enter look builder')}
                    </Link>
                    <Link
                      to={`/contact?type=appearance&product=${line.id}`}
                      className="text-sm font-medium text-white/70 hover:text-white"
                    >
                      {T('获取报价评估', 'Request a quote')}
                    </Link>
                  </div>
                </div>
              </Reveal>
            </div>
            {line.subSeries && (
              <div className="mt-12">
                <Reveal>
                  <h3 className="font-display text-xl font-bold">
                    {T('四个外观方向', 'Four appearance directions')}
                  </h3>
                </Reveal>
                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                  {line.subSeries.map((sub, i) => (
                    <Reveal key={sub.id} delay={i * 60}>
                      <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
                        {sub.image && (
                          <img
                            src={sub.image}
                            alt={T(
                              `${sub.zh}设计效果图`,
                              `${sub.en} design render`,
                            )}
                            loading="lazy"
                            className="aspect-[4/3] w-full object-cover"
                          />
                        )}
                        <div className="flex flex-1 flex-col p-6">
                          <p className="text-[10px] uppercase tracking-wider text-electric-300">
                            {T('概念方向', 'Concept direction')}
                          </p>
                          <h4 className="mt-2 font-display text-lg font-bold">
                            {T(sub.zh, sub.en)}
                          </h4>
                          <p className="mt-3 flex-1 text-sm leading-relaxed text-white/50">
                            {T(sub.descZh, sub.descEn)}
                          </p>
                          <Link
                            to={
                              sub.id === 'co-creation'
                                ? '/contact?type=brand'
                                : `/robofit?category=apparel&series=${sub.id}`
                            }
                            className="mt-5 text-sm font-medium text-electric-300"
                          >
                            {sub.id === 'co-creation'
                              ? T('探讨共创', 'Discuss co-creation')
                              : T('探索这一方向', 'Explore this direction')}
                          </Link>
                        </div>
                      </div>
                    </Reveal>
                  ))}
                </div>
              </div>
            )}
            {line.gallery && (
              <div className="mt-12">
                <Reveal>
                  <h3 className="font-display text-xl font-bold">
                    {T('单品外观参考', 'Item appearance references')}
                  </h3>
                  <p className="mt-2 text-xs text-white/40">
                    {T(
                      '设计效果图；最终外观与工程实现以项目评估为准。',
                      'Design renders; final appearance and engineering are subject to project review.',
                    )}
                  </p>
                </Reveal>
                <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {line.gallery.map((item, i) => (
                    <Reveal key={item.image} delay={i * 60}>
                      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
                        <img
                          src={item.image}
                          alt={T(item.zh, item.en)}
                          loading="lazy"
                          className="aspect-[4/5] w-full object-contain"
                        />
                        <p className="border-t border-white/8 px-3 py-3 text-center text-xs leading-relaxed text-white/55">
                          {T(item.zh, item.en)}
                        </p>
                      </div>
                    </Reveal>
                  ))}
                </div>
              </div>
            )}
          </section>
        ))}
      </div>
      <section
        id="creator-co-creation"
        className="border-t border-white/10 bg-cyber-500/[0.04] py-16"
      >
        <Reveal className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <h2 className="font-display text-2xl font-bold sm:text-3xl">
            {T('设计师共创', 'Creator Co-creation')}
          </h2>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-white/55">
            {T(
              '展示概念作品，欢迎外观与造型方向的联合探讨。',
              'Concept showcase — open to joint exploration on looks & styling.',
            )}
          </p>
          <div className="mt-6 flex flex-wrap gap-6 text-sm">
            <Link to="/community" className="text-electric-300">
              {T('查看概念作品', 'View concept work')}
            </Link>
            <Link to="/contact?type=creator" className="text-white/70">
              {T('提交共创意向', 'Discuss creator collaboration')}
            </Link>
          </div>
        </Reveal>
      </section>
    </div>
  )
}
