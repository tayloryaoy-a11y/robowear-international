import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext.jsx'
import Reveal from '../components/Reveal.jsx'

const ROBOTS = ['Tesla Optimus', 'Figure 03', 'XPeng Iron / 小鹏 Iron']

// 产品中心数据：五大产品线详情
const lines = [
  {
    id: 'roboskin',
    nameZh: 'Robo-Skin™',
    nameEn: 'Robo-Skin™',
    subZh: '智能皮肤覆盖系统',
    subEn: 'Smart Skin Cover System',
    flagship: true,
    tone: 'blue',
    price: '$1,500 – $5,000',
    priceNoteZh: '全身套装 · 视定制程度',
    priceNoteEn: 'Full-body set · varies by customization',
    descZh: '这是 RoboWear 的旗舰产品，也是技术壁垒最高的产品线——为机器人的金属/塑料外壳提供一层"第二皮肤"，采用医疗级硅胶与气凝胶复合材料制成，提供逼真的触感与外观，同时内置微型导热通道网络。',
    descEn: 'RoboWear’s flagship line and our deepest technical moat — a “second skin” for a robot’s metal or plastic shell, made from medical-grade silicone and aerogel composites, delivering lifelike texture and look while embedding a micro thermal-conduction network.',
    features: [
      { zh: '材料：医疗级铂金硅胶（Shore A 10–30）+ 气凝胶绝热层 + 石墨烯导热层三明治结构', en: 'Material: medical-grade platinum silicone (Shore A 10–30) + aerogel insulation + graphene conduction — sandwich structure' },
      { zh: '散热：石墨烯层快速横向导热，散热效率比裸机提升 30% 以上', en: 'Thermal: graphene layer conducts heat laterally, boosting dissipation efficiency by 30%+ over a bare chassis' },
      { zh: '触感：模拟人类皮肤柔软弹性，物理化解"恐怖谷效应"带来的不适', en: 'Touch: mimics human-skin softness and elasticity — a physical antidote to the “uncanny valley”' },
      { zh: '定制化：任意肤色、纹理（光滑/磨砂/仿皮革）、纹身图案、品牌 Logo 均可定制', en: 'Customization: any skin tone, texture (smooth / matte / faux-leather), tattoos, or brand logos' },
      { zh: '安装：磁吸 + 卡扣双重固定，无需工具，5 分钟内完成全身换装', en: 'Install: dual magnetic + snap-fit mounting — tool-free, full-body change in under 5 minutes' }
    ],
    image: { labelZh: '机器人手臂局部，半金属外壳半仿真硅胶第二皮肤', labelEn: 'Close-up of a robot forearm — half bare metal shell, half lifelike silicone “second skin”', hintZh: '微距特写，质感对比强烈', hintEn: 'Macro shot, strong texture contrast', size: '800×600', filename: 'product-roboskin.webp' }
  },
  {
    id: 'robowear',
    nameZh: 'Robo-Wear™',
    nameEn: 'Robo-Wear™',
    subZh: '功能性日常服装系列',
    subEn: 'Functional Daily Apparel Series',
    flagship: false,
    tone: 'violet',
    price: '$199 – $20,000+',
    priceNoteZh: '依子系列与定制程度浮动',
    priceNoteEn: 'Varies by sub-series & customization level',
    descZh: '从家庭日常到高定奢华，Robo-Wear™ 划分为四大子系列，覆盖机器人在不同场景下的穿着需求——每一件都遵循"散热不阻热、传感器不遮挡、运动不受限"的核心工程约束。',
    descEn: 'From everyday home wear to haute couture, Robo-Wear™ spans four sub-series covering every wardrobe scenario a robot might face — each piece engineered around our core constraints: breathable heat paths, sensor-clear materials, and unrestricted motion.',
    features: [
      { zh: '四大子系列：居家 / 工装防护 / 高定奢华 / IP 联名，场景全覆盖', en: 'Four sub-lines: Home, Professional, Haute Couture & Collaboration — full scenario coverage' },
      { zh: '关节处采用四向弹力材料，背部预留磁吸充电开口', en: 'Four-way stretch fabric at joints; rear magnetic charging cutout built in' },
      { zh: '腰部设计散热网格区，兼顾功能与版型美感', en: 'Ventilated mesh zone at the waist balances function with silhouette' },
      { zh: '支持企业 Logo 印制与批量定制（B2B 折扣）', en: 'Supports enterprise logo printing and bulk customization (B2B pricing)' }
    ],
    image: { labelZh: '高定机器人形象，霓虹渐变背景，奢华简洁', labelEn: 'Couture robot styling against a neon gradient backdrop — luxe and clean', hintZh: '同子系列分场景拍摄', hintEn: 'Scene-matched shots per sub-line', size: '800×600', filename: 'product-couture.webp' },
    subSeries: [
      {
        nameZh: '居家系列', nameEn: 'Home Series',
        sceneZh: '机器人在家庭环境中执行日常任务（做饭、打扫、照顾老人）', sceneEn: 'For robots handling everyday household tasks — cooking, cleaning, eldercare',
        materialZh: '防静电、防污渍、防水（IPX4）功能性混纺面料；关节四向弹力材料；提供北欧简约 / 日式和风 / 美式休闲等多种风格', materialEn: 'Anti-static, stain- & water-resistant (IPX4) blended fabric; four-way stretch joints; Nordic-minimal, Japandi, American-casual styles',
        price: '$199 – $499', tone: 'blue', filename: 'product-home.webp'
      },
      {
        nameZh: '工装防护系列', nameEn: 'Professional Series',
        sceneZh: '机器人在餐厅、酒店、医院、仓库等商业环境中工作', sceneEn: 'For robots working in restaurants, hotels, hospitals, and warehouses',
        materialZh: '凯夫拉（Kevlar）耐磨层 + 防水防油涂层 + 阻燃处理；可印制企业 Logo 与员工编号，内置 RFID 芯片与反光条', materialEn: 'Kevlar wear layer + oil/water-repellent coating + flame-retardant treatment; brand logo & ID printing, embedded RFID chip and reflective strips',
        price: '$599 – $1,299', priceNoteZh: 'B2B 批量采购享折扣', priceNoteEn: 'Bulk B2B discounts available', tone: 'silver', filename: 'product-pro.webp'
      },
      {
        nameZh: '高定奢华系列', nameEn: 'Haute Couture Series',
        sceneZh: '高端家庭、展览展示、社交媒体打卡', sceneEn: 'High-end households, exhibitions, social-media moments',
        materialZh: '与顶级面料供应商合作，采用真丝、羊绒、皮革等奢华材料结合功能性涂层；与国际知名设计师（Dior / Hermès / D&G 等）联名，每季限量', materialEn: 'Luxury silk, cashmere & leather with functional coatings, sourced from top mills; seasonal limited collaborations with名designers like Dior, Hermès, D&G',
        price: '$2,000 – $20,000+', tone: 'rose', filename: 'product-couture.webp'
      },
      {
        nameZh: 'IP 联名系列', nameEn: 'Collaboration Series',
        sceneZh: '粉丝经济、礼品市场、收藏市场', sceneEn: 'Fan economy, gifting market, collectors’ market',
        materialZh: '与漫威（钢铁侠战甲）、迪士尼（星球大战）、中国国漫，以及 Nike、Adidas、Supreme、Off-White 等潮牌展开限量联名', materialEn: 'Limited collabs with Marvel (Iron Man armor), Disney (Star Wars), Chinese animation IPs, and streetwear brands like Nike, Adidas, Supreme, Off-White',
        price: '$500 – $3,000', priceNoteZh: '视 IP 授权费用浮动', priceNoteEn: 'Varies with IP licensing costs', tone: 'violet', filename: 'product-ip.webp'
      }
    ]
  },
  {
    id: 'roboface',
    nameZh: 'Robo-Face™',
    nameEn: 'Robo-Face™',
    subZh: '面具与头部定制系统',
    subEn: 'Mask & Head Customization System',
    flagship: false,
    tone: 'rose',
    price: '$299 – $10,000',
    priceNoteZh: '依面具类型与定制程度浮动',
    priceNoteEn: 'Varies by mask type & customization',
    descZh: '为机器人头部提供可更换的面具系统，从极简科技风到超写实人类面孔，满足不同审美与情感表达需求——磁吸快拆设计，10 秒完成更换。',
    descEn: 'A swappable mask system for robot heads — from minimalist tech aesthetics to hyper-real human faces, meeting every taste and emotional-expression need. Magnetic quick-release design swaps masks in 10 seconds.',
    features: [
      { zh: '视觉透传：眼部采用单向透视材料，外观是眼睛图案，摄像头可完整穿透不影响视野', en: 'Visual pass-through: one-way see-through eye material — looks like eyes, but cameras see right through with zero impact on field of view' },
      { zh: '表情显示：高端版本集成柔性 OLED，可动态显示表情，增强情感表达', en: 'Expression display: premium versions feature flexible OLED panels for dynamic, emotionally expressive faces' },
      { zh: '安装方式：磁吸快拆设计，10 秒内完成更换', en: 'Install: magnetic quick-release — swap in under 10 seconds' },
      { zh: '定制化：支持 3D 扫描主人面孔，定制"主人的机器人版本"面具（限量服务）', en: 'Customization: 3D-scan the owner’s face for a “robot twin” portrait mask (limited service)' }
    ],
    image: { labelZh: '拟真人年轻亚洲帅气男生脸，成熟真实产品样式', labelEn: 'Lifelike young Asian-male face mask — mature, realistic product styling', hintZh: '黑底产品图，悬浮聚光', hintEn: 'Black backdrop, spotlighted floating product shot', size: '600×600', filename: 'product-face-asian-male.webp' },
    gallery: [
      { filename: 'product-face-asian-male.webp', labelZh: '年轻亚洲帅气男生', labelEn: 'Young Asian Male' },
      { filename: 'product-face-white-female.webp', labelZh: '年轻欧美白人女性', labelEn: 'Young Western Female' },
      { filename: 'product-face-black-male.webp', labelZh: '黑色青年男模', labelEn: 'Young Black Male' },
      { filename: 'product-face-anime-middle.webp', labelZh: '中年动漫感卡通', labelEn: 'Middle-Aged Anime Style' }
    ],
    variantTable: [
      { zh: '科技极简 Tech-Minimal', en: 'Tech-Minimal', descZh: '光滑金属质感面具，LED 灯带点缀', descEn: 'Smooth metallic mask accented with LED light strips', price: '$299 – $599' },
      { zh: '超写实人脸 Realistic-Human', en: 'Realistic-Human', descZh: '医疗级硅胶制作，高度仿真', descEn: 'Medical-grade silicone, hyper-realistic finish', price: '$1,500 – $5,000' },
      { zh: '动漫/流行文化 Anime & Pop Culture', en: 'Anime & Pop Culture', descZh: '高达、钢铁侠、各类动漫角色', descEn: 'Gundam, Iron Man, and other beloved characters', price: '$399 – $999' },
      { zh: '定制肖像 Custom Portrait', en: 'Custom Portrait', descZh: '根据客户照片 3D 建模制作', descEn: '3D-modeled from the customer’s own photos', price: '$3,000 – $10,000' }
    ]
  },
  {
    id: 'robohair',
    nameZh: 'Robo-Hair™',
    nameEn: 'Robo-Hair™',
    subZh: '假发与头部装饰系统',
    subEn: 'Wig & Head Accessory System',
    flagship: false,
    tone: 'silver',
    price: '$89 – $1,499',
    priceNoteZh: '依发质与定制程度浮动',
    priceNoteEn: 'Varies by hair quality & customization',
    descZh: '为机器人提供可更换的假发系统，支持各种发型、发色与发质——专为机器人头部曲率设计的卡扣系统，牢固不脱落且支持快速更换。',
    descEn: 'A swappable wig system for robots, supporting any style, color, or texture — secured by a snap-fit system engineered for robot head curvature, stable yet quick to swap.',
    features: [
      { zh: '材料：高品质人工纤维或真人发丝，防静电处理，耐高温（适应头部散热）', en: 'Material: premium synthetic or real human hair, anti-static treated, heat-resistant for head dissipation' },
      { zh: '安装方式：专为机器人头部曲率设计的卡扣系统，牢固不脱落同时支持快速更换', en: 'Install: a snap-fit system tailored to robot head curvature — secure, yet quick to change' },
      { zh: '散热设计：发丝间距与密度经工程计算，确保头部散热效率不低于裸机的 80%', en: 'Thermal design: strand spacing and density are engineered so head dissipation stays above 80% of a bare chassis' }
    ],
    image: { labelZh: '长直发造型，戴在机器人头部，干净黑底产品图', labelEn: 'Long straight wig styled on a robot head — clean black-backdrop product shot', hintZh: '干净背景产品图', hintEn: 'Clean-background product shots', size: '600×600', filename: 'product-hair-long.webp' },
    gallery: [
      { filename: 'product-hair-short.webp', labelZh: '短发', labelEn: 'Short' },
      { filename: 'product-hair-long.webp', labelZh: '长直发', labelEn: 'Long Straight' },
      { filename: 'product-hair-curly.webp', labelZh: '卷发', labelEn: 'Curly' }
    ],
    variantTable: [
      { zh: '基础款', en: 'Basic', descZh: '常见发型（短发、长发、卷发）', descEn: 'Common styles — short, long, curly', price: '$99 – $299' },
      { zh: '精品款', en: 'Premium', descZh: '高品质真人发丝', descEn: 'Premium real human hair', price: '$499 – $1,499' },
      { zh: '定制款', en: 'Custom', descZh: '根据客户指定发型/发色定制', descEn: 'Custom style and color to spec', price: '$299 – $999' }
    ]
  },
  {
    id: 'accessories',
    nameZh: 'Robo-Accessories™',
    nameEn: 'Robo-Accessories™',
    subZh: '配件系列',
    subEn: 'Accessories Series',
    flagship: false,
    tone: 'blue',
    price: '$49 – $1,299',
    priceNoteZh: '依配件类型浮动',
    priceNoteEn: 'Varies by accessory type',
    descZh: '从背包到节日套装，Robo-Accessories™ 是为机器人外观锦上添花的精致点缀——每一件都经过工程验证，绝不影响传感器视野与背部充电接口。',
    descEn: 'From backpacks to holiday kits, Robo-Accessories™ adds the finishing touch to a robot’s look — every piece engineering-verified to never block sensors or the rear charging port.',
    features: [
      { zh: 'Robo-Bag 机器人专属背包：可携带工具与物品，不影响背部充电接口', en: 'Robo-Bag: carries tools & belongings without blocking the rear charging port' },
      { zh: 'Robo-Shoes 机器人鞋：保护脚部精密传感器，防滑防水，多种风格', en: 'Robo-Shoes: protects precision foot sensors, slip- & water-resistant, multiple styles' },
      { zh: 'Robo-Jewelry 机器人首饰：项链、手环等，采用不影响传感器的非金属材料', en: 'Robo-Jewelry: necklaces & bracelets in non-metallic, sensor-safe materials' },
      { zh: 'Seasonal & Holiday Kits：圣诞、万圣节、春节等节日主题限时套装', en: 'Seasonal & Holiday Kits: limited-run themes for Christmas, Halloween, Lunar New Year' }
    ],
    image: { labelZh: '模块化机能背包，黑紫科技悬浮产品图', labelEn: 'Modular utility backpack — floating product shot in black-violet tech tones', hintZh: '产品悬浮图，统一灯光', hintEn: 'Floating product shots, unified lighting', size: '500×500', filename: 'product-acc-backpack.webp' },
    gallery: [
      { filename: 'product-acc-backpack.webp', labelZh: '机能背包', labelEn: 'Utility Backpack' },
      { filename: 'product-acc-shoes.webp', labelZh: '智能机能鞋', labelEn: 'Performance Shoes' },
      { filename: 'product-acc-jewelry.webp', labelZh: '钛钢首饰套装', labelEn: 'Titanium Jewelry Set' },
      { filename: 'product-acc-festive.webp', labelZh: '节日限定套装', labelEn: 'Festive Limited Set' }
    ]
  }
]

export default function Products() {
  const { T, lang } = useLanguage()
  const [active, setActive] = useState(lines[0].id)
  const sectionRefs = useRef({})

  // 监听滚动，自动高亮当前可见的产品线 Tab
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.dataset.sectionId)
        })
      },
      { rootMargin: '-35% 0px -55% 0px', threshold: 0 }
    )
    Object.values(sectionRefs.current).forEach((el) => el && observer.observe(el))
    return () => observer.disconnect()
  }, [])

  const scrollToSection = (id) => {
    const el = sectionRefs.current[id]
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 128
      window.scrollTo({ top: y, behavior: 'smooth' })
    }
  }

  return (
    <div className="pt-24">
      {/* 页面头部 */}
      <section className="relative overflow-hidden border-b border-white/8 bg-carbon-900 py-16">
        <div className="absolute inset-0 bg-tech-grid opacity-25" />
        <div className="absolute -top-24 right-1/4 h-72 w-72 rounded-full bg-electric-500/10 blur-[110px]" />
        <div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <Reveal>
            <span className="text-xs font-semibold uppercase tracking-widest2 text-electric-400">
              {T('产品中心', 'Product Center')}
            </span>
            <h1 className="mt-3 max-w-3xl font-display text-4xl font-bold leading-tight sm:text-5xl">
              {T('五大产品线，重新定义机器人的"穿衣自由"', 'Five Product Lines Redefining a Robot’s “Freedom to Dress”')}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/50">
              {T(
                '从第二皮肤到日常服装，从面具到假发与配件——RoboWear 用材料科学 × 机器人工程学 × 时尚美学，构建了一套完整的机器人外观解决方案。所有产品均已适配 Tesla Optimus、Figure 03、小鹏 Iron 三大主流机型。',
                'From a second skin to everyday wear, masks to hair and accessories — RoboWear fuses materials science, robotics engineering, and fashion to deliver a complete robot-appearance solution. Every line is compatible with Tesla Optimus, Figure 03, and XPeng Iron.'
              )}
            </p>
          </Reveal>
        </div>
      </section>

      {/* 粘性 Tab 导航 */}
      <div className="sticky top-[64px] sm:top-[72px] z-30 border-b border-white/8 bg-carbon-900/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl gap-1.5 overflow-x-auto px-5 py-3 sm:px-8 lg:px-10 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {lines.map((line) => (
            <button
              key={line.id}
              onClick={() => scrollToSection(line.id)}
              className={`shrink-0 rounded-full border px-4 py-2 text-xs font-semibold tracking-wide transition-all duration-300 sm:text-sm ${
                active === line.id
                  ? 'border-electric-400/60 bg-electric-500/10 text-electric-300'
                  : 'border-white/10 text-white/45 hover:border-white/25 hover:text-white/80'
              }`}
            >
              {line.nameZh}
              <span className="ml-1.5 hidden text-white/30 sm:inline">· {T(line.subZh, line.subEn)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 产品线区块 */}
      <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10">
        <div className="space-y-28">
          {lines.map((line, idx) => (
            <section
              key={line.id}
              id={line.id}
              data-section-id={line.id}
              ref={(el) => (sectionRefs.current[line.id] = el)}
              className="scroll-mt-40"
            >
              <div className={`grid grid-cols-1 items-start gap-10 lg:grid-cols-2 ${idx % 2 === 1 ? 'lg:[&>*:first-child]:order-2' : ''}`}>
                {/* 图片占位 */}
                <Reveal direction={idx % 2 === 1 ? 'right' : 'left'}>
                  <img
                    src={`/images/robowear/${line.image.filename}`}
                    alt={T(line.image.labelZh, line.image.labelEn)}
                    loading="lazy"
                    className="aspect-[4/3] w-full rounded-2xl border border-white/10 object-cover"
                  />
                </Reveal>

                {/* 文案与详情 */}
                <Reveal delay={120}>
                  <div className="flex items-center gap-3">
                    <h2 className="font-display text-3xl font-bold sm:text-4xl">{line.nameZh}</h2>
                    {line.flagship && (
                      <span className="rounded-full border border-electric-400/40 bg-electric-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest2 text-electric-300">
                        {T('旗舰产品线', 'Flagship Line')}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm font-medium text-white/40">{T(line.subZh, line.subEn)}</p>
                  <p className="mt-5 text-sm leading-relaxed text-white/55">{T(line.descZh, line.descEn)}</p>

                  {/* 核心技术特性列表 */}
                  <ul className="mt-6 space-y-3">
                    {line.features.map((f) => (
                      <li key={f.zh} className="flex gap-3 text-sm leading-relaxed text-white/55">
                        <svg className="mt-0.5 h-4 w-4 shrink-0 text-electric-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                          <path d="M5 12l4 4L19 6" />
                        </svg>
                        <span>{T(f.zh, f.en)}</span>
                      </li>
                    ))}
                  </ul>

                  {/* 价格区间 + 适配机型 + CTA */}
                  <div className="mt-8 flex flex-wrap items-end justify-between gap-6 rounded-2xl border border-white/10 bg-white/[0.02] p-6">
                    <div>
                      <p className="text-[11px] uppercase tracking-widest2 text-white/35">{T('价格区间', 'Price Range')}</p>
                      <p className="mt-1 font-display text-2xl font-bold text-electric-300">{line.price}</p>
                      <p className="mt-0.5 text-xs text-white/35">{T(line.priceNoteZh, line.priceNoteEn)}</p>
                    </div>
                    <div className="flex flex-col items-start gap-2">
                      <p className="text-[11px] uppercase tracking-widest2 text-white/35">{T('适配机型', 'Compatible Platforms')}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {ROBOTS.map((r) => (
                          <span key={r} className="rounded-full border border-white/12 bg-carbon-900/60 px-2.5 py-1 text-[11px] text-white/55">
                            {r}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <Link
                    to="/robofit"
                    className="mt-6 inline-flex items-center gap-2.5 rounded-full bg-gradient-to-r from-electric-500 to-cyber-500 px-6 py-3 text-sm font-semibold text-carbon-900 shadow-[0_0_24px_rgba(45,226,255,0.3)] transition-all duration-300 hover:shadow-[0_0_38px_rgba(45,226,255,0.5)] hover:-translate-y-0.5"
                  >
                    {T(`将 ${line.nameZh} 加入 RoboFit 试衣`, `Try ${line.nameEn} in RoboFit`)}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </Link>
                </Reveal>
              </div>

              {/* Robo-Wear 四大子系列 */}
              {line.subSeries && (
                <div className="mt-14">
                  <Reveal>
                    <h3 className="font-display text-xl font-bold text-white/85">
                      {T('四大子系列详解', 'Four Sub-Series in Detail')}
                    </h3>
                  </Reveal>
                  <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
                    {line.subSeries.map((sub, i) => (
                      <Reveal key={sub.nameZh} delay={i * 90}>
                        <div className="group h-full overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] hover-lift">
                          <img
                            src={`/images/robowear/${sub.filename}`}
                            alt={T(`${sub.nameZh}产品图`, `${sub.nameEn} product visual`)}
                            loading="lazy"
                            className="aspect-[16/9] w-full border-b border-white/10 object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                          />
                          <div className="p-6">
                            <div className="flex items-center justify-between gap-3">
                              <h4 className="font-display text-base font-bold text-white">{T(sub.nameZh, sub.nameEn)}</h4>
                              <span className="font-display text-sm font-semibold text-electric-300">{sub.price}</span>
                            </div>
                            <p className="mt-2 text-xs uppercase tracking-widest2 text-white/30">
                              {T('应用场景', 'Use Case')}
                            </p>
                            <p className="mt-1 text-sm text-white/55">{T(sub.sceneZh, sub.sceneEn)}</p>
                            <p className="mt-3 text-xs uppercase tracking-widest2 text-white/30">
                              {T('材料与工艺', 'Materials & Craft')}
                            </p>
                            <p className="mt-1 text-sm leading-relaxed text-white/45">{T(sub.materialZh, sub.materialEn)}</p>
                            {(sub.priceNoteZh || sub.priceNoteEn) && (
                              <p className="mt-3 text-xs text-white/30">{T(sub.priceNoteZh, sub.priceNoteEn)}</p>
                            )}
                          </div>
                        </div>
                      </Reveal>
                    ))}
                  </div>
                </div>
              )}

              {/* 实拍画廊：单品实景照片 */}
              {line.gallery && (
                <div className="mt-14">
                  <Reveal>
                    <h3 className="font-display text-xl font-bold text-white/85">
                      {T('单品实拍', 'Product Photography')}
                    </h3>
                  </Reveal>
                  <div className={`mt-6 grid grid-cols-2 gap-4 ${line.gallery.length > 3 ? 'sm:grid-cols-4' : 'sm:grid-cols-3'}`}>
                    {line.gallery.map((g, i) => (
                      <Reveal key={g.filename} delay={i * 80}>
                        <div className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] hover-lift">
                          <img
                            src={`/images/robowear/${g.filename}`}
                            alt={T(g.labelZh, g.labelEn)}
                            loading="lazy"
                            className="aspect-square w-full object-cover transition-transform duration-700 group-hover:scale-[1.06]"
                          />
                          <p className="px-3 py-2.5 text-center text-xs font-medium text-white/55">{T(g.labelZh, g.labelEn)}</p>
                        </div>
                      </Reveal>
                    ))}
                  </div>
                </div>
              )}

              {/* Robo-Face / Robo-Hair 变体表 */}
              {line.variantTable && (
                <div className="mt-14">
                  <Reveal>
                    <h3 className="font-display text-xl font-bold text-white/85">
                      {T('产品系列一览', 'Series Overview')}
                    </h3>
                  </Reveal>
                  <Reveal delay={80}>
                    <div className="mt-6 overflow-hidden rounded-2xl border border-white/10">
                      <table className="w-full border-collapse text-left text-sm">
                        <thead>
                          <tr className="bg-white/[0.04] text-xs uppercase tracking-widest2 text-white/40">
                            <th className="px-5 py-3.5 font-medium">{T('系列', 'Series')}</th>
                            <th className="px-5 py-3.5 font-medium">{T('描述', 'Description')}</th>
                            <th className="px-5 py-3.5 font-medium text-right">{T('价格', 'Price')}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {line.variantTable.map((row, i) => (
                            <tr key={row.zh} className={`border-t border-white/8 transition-colors hover:bg-white/[0.03] ${i % 2 === 1 ? 'bg-white/[0.015]' : ''}`}>
                              <td className="px-5 py-4 font-medium text-white/85">{T(row.zh, row.en)}</td>
                              <td className="px-5 py-4 text-white/50">{T(row.descZh, row.descEn)}</td>
                              <td className="px-5 py-4 text-right font-display font-semibold text-electric-300">{row.price}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Reveal>
                </div>
              )}
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}
