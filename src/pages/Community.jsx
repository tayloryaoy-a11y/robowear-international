import { Link } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext.jsx'
import Reveal from '../components/Reveal.jsx'

// Concept showcase. Author attribution and release permissions must be confirmed before publication.
const projects = [
  { id: 'neon-samurai', image: '/images/robowear/community/neon-samurai.webp', gradient: 'from-electric-500/30 via-carbon-800 to-cyber-500/30', titleZh: '霓虹武士 · 外观概念', titleEn: 'Neon Samurai · Look study', categoryZh: '服装造型', categoryEn: 'Apparel styling', category: 'apparel', descZh: '以霓虹线条探索机身分区与外骨骼视觉语言。', descEn: 'Neon lines explore body segmentation and an exoskeleton visual language.' },
  { id: 'porcelain', image: '/images/robowear/community/porcelain.webp', gradient: 'from-pink-400/25 via-carbon-800 to-electric-500/25', titleZh: '青花瓷 · 面部外观', titleEn: 'Porcelain · Face styling', categoryZh: '面部与配件', categoryEn: 'Face & accessories', category: 'mask', descZh: '蓝白纹样与柔和面部轮廓的造型探索。', descEn: 'Blue-and-white motifs paired with softly shaped facial contours.' },
  { id: 'street-mecha', image: '/images/robowear/community/street-mecha.webp', gradient: 'from-cyber-500/30 via-carbon-800 to-pink-400/20', titleZh: '街头机甲 · 服装概念', titleEn: 'Street Mecha · Apparel study', categoryZh: '日常服装', categoryEn: 'Everyday apparel', category: 'apparel', descZh: '探索宽松街头廓形与机器结构之间的视觉关系。', descEn: 'A study of relaxed streetwear silhouettes around robotic structure.' },
  { id: 'aurora-hair', image: '/images/robowear/community/aurora-hair.webp', gradient: 'from-electric-500/25 via-carbon-800 to-cyber-500/25', titleZh: '极光 · 渐变发型', titleEn: 'Aurora · Gradient hair', categoryZh: '发型', categoryEn: 'Hair styling', category: 'hair', descZh: '用渐变色与发束轮廓探索机器人的个性表达。', descEn: 'Gradient color and hair contours explore a robot’s individual expression.' },
  { id: 'carbon-knight', image: '/images/robowear/community/carbon-knight.webp', gradient: 'from-white/10 via-carbon-800 to-electric-500/20', titleZh: '暗夜骑士 · 哑光外观', titleEn: 'Carbon Knight · Matte look', categoryZh: '外覆造型', categoryEn: 'Cover styling', category: 'apparel', descZh: '以深色表面与分层结构探索骑士主题外观。', descEn: 'Dark surfaces and layered structure explore a knight-inspired appearance.' },
  { id: 'festival', image: '/images/robowear/community/cyber-festival.webp', gradient: 'from-pink-400/30 via-carbon-800 to-cyber-500/25', titleZh: '赛博节庆 · 配件概念', titleEn: 'Cyber Festival · Accessory study', categoryZh: '配件', categoryEn: 'Accessories', category: 'carry', descZh: '将节庆色彩与装饰细节用于机器人配件表达。', descEn: 'Festive color and decorative details explored through robot accessories.' }
]

const steps = [
  { no: '01', titleZh: '分享原创方向', titleEn: 'Share an original direction', descZh: '通过联系表单发送作品链接、设计说明与希望探讨的合作方向。', descEn: 'Send a portfolio link, a design description, and the collaboration you want to explore.' },
  { no: '02', titleZh: '共同评估可行性', titleEn: 'Review the project together', descZh: '讨论目标机型、材料、结构与授权范围，再明确打样和验证路径。', descEn: 'Discuss platform, materials, structure, and rights before defining a sampling and validation path.' },
  { no: '03', titleZh: '形成项目方案', titleEn: 'Develop a project proposal', descZh: '在评估后商议项目范围与合作条款；交易市场与一键下单在后续路线图中。', descEn: 'Agree scope and collaboration terms after review. A marketplace and one-click ordering are future roadmap directions.' }
]

export default function Community() {
  const { T } = useLanguage()

  return (
    <div className="bg-carbon-900">
      {/* ---------------- Hero ---------------- */}
      <section className="relative overflow-hidden pb-16 pt-32 sm:pt-36">
        <div className="absolute inset-0 -z-10 bg-hero-glow opacity-70" />
        <div className="absolute inset-0 -z-10 bg-tech-grid opacity-[0.06]" />
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-cyber-500/30 bg-cyber-500/10 px-4 py-1.5 text-xs font-semibold tracking-wide text-cyber-300">
              <span className="h-1.5 w-1.5 rounded-full bg-cyber-400 animate-pulseGlow" />
              {T('设计师共创', 'Creator Co-creation')}
            </span>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="mt-6 max-w-5xl font-display text-3xl font-bold leading-[1.12] tracking-tight sm:text-4xl lg:text-5xl">
              {T('一起探索', 'Explore new ')}
              <span className="text-gradient">{T('机器人外观与造型', 'robot looks & styling')}</span>
            </h1>
          </Reveal>
          <Reveal delay={160}>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/55">{T('展示概念作品，欢迎外观与造型方向的联合探讨。以下为视觉概念参考，具体适配与材料需项目评估。', 'Concept showcase — open to joint exploration on looks & styling. These are visual concepts; fit and materials require project review.')}</p>
          </Reveal>
          <Reveal delay={240}>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                to="/robofit?category=apparel"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-electric-500 to-cyber-500 px-6 py-3 text-sm font-semibold text-carbon-900 shadow-[0_0_24px_rgba(45,226,255,0.35)] transition-all duration-300 hover:shadow-[0_0_36px_rgba(45,226,255,0.55)] hover:-translate-y-0.5"
              >
                {T('探索外观选配', 'Explore the look builder')}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </Link>
              <a
                href="#become-designer"
                className="inline-flex items-center gap-2 rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-white/75 transition-colors duration-300 hover:border-cyber-400/60 hover:text-cyber-200"
              >
                {T('参与共创', 'Explore collaboration')}
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------------- 运作方式 ---------------- */}
      <section className="border-t border-white/10 bg-gradient-to-b from-carbon-900 to-carbon-800/30 py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <Reveal>
            <h2 className="font-display text-2xl font-bold sm:text-3xl">{T('如何参与共创', 'How to collaborate')}</h2>
            <p className="mt-2 max-w-2xl text-sm text-white/45">
              {T('从设计方向到项目评估，围绕具体需求讨论合作。', 'From a design direction to project review, with collaboration shaped around a real brief.')}
            </p>
          </Reveal>
          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {steps.map((s, idx) => (
              <Reveal key={s.no} delay={idx * 100}>
                <div className="hover-lift h-full rounded-2xl border border-white/10 bg-carbon-800/40 p-6">
                  <span className="font-display text-2xl font-bold text-gradient">{s.no}</span>
                  <h3 className="mt-4 font-display text-lg font-semibold text-white">{T(s.titleZh, s.titleEn)}</h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-white/55">{T(s.descZh, s.descEn)}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- 精选作品 ---------------- */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-electric-500/30 bg-electric-500/10 px-4 py-1.5 text-xs font-semibold tracking-wide text-electric-300">
              {T('精选作品', 'Featured Works')}
            </span>
            <h2 className="mt-5 max-w-3xl font-display text-3xl font-bold leading-snug sm:text-4xl">
              {T('外观与造型概念', 'Looks & styling concepts')}
            </h2>
          </Reveal>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p, idx) => (
              <Reveal key={p.id} delay={(idx % 3) * 90}>
                <div className="hover-lift group flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-carbon-800/40">
                  {/* 作品缩略图 */}
                  <div className={`relative aspect-[4/3] w-full overflow-hidden bg-gradient-to-br ${p.gradient}`}>
                    <img
                      src={p.image}
                      alt={T(`${p.titleZh}，概念效果图`, `${p.titleEn}, concept render`)}
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 h-full w-full object-cover object-center transition duration-700 group-hover:scale-[1.03]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-carbon-900/45 via-transparent to-carbon-900/10" />
                    <div className="absolute inset-0 bg-tech-grid opacity-10 mix-blend-screen" />
                    <div className="absolute left-3 top-3 rounded-full border border-white/15 bg-carbon-900/60 px-2.5 py-1 text-[11px] font-semibold text-white/70 backdrop-blur">
                      {T(p.categoryZh, p.categoryEn)}
                    </div>
                    <div className="absolute right-3 bottom-3 rounded-full border border-white/15 bg-carbon-900/60 px-2.5 py-1 text-[11px] font-medium text-white/60 backdrop-blur">
                      {T('概念作品', 'Concept work')}
                    </div>
                  </div>

                  {/* 作品信息 */}
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="font-display text-base font-semibold text-white">{T(p.titleZh, p.titleEn)}</h3>
                    <p className="mt-3 flex-1 text-sm leading-relaxed text-white/50">{T(p.descZh, p.descEn)}</p>
                    {/* Author attribution is hidden pending permission and confirmation. */}

                    {/* Category link explores available references; it does not add this concept as a purchasable item. */}
                    <Link
                      to={`/robofit?category=${p.category}`}
                      className="mt-5 inline-flex items-center justify-center gap-2 rounded-full border border-electric-500/40 bg-electric-500/[0.08] px-4 py-2.5 text-sm font-semibold text-electric-200 transition-all duration-300 hover:bg-electric-500/20 hover:text-white"
                    >
                      {T('在选配器中探索', 'Explore in look builder')}
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                        <path d="M12 5v14M5 12h14" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- 成为设计师 CTA ---------------- */}
      <section id="become-designer" className="border-t border-white/10 bg-gradient-to-b from-carbon-900 to-carbon-800/30 py-24">
        <div className="mx-auto max-w-4xl px-5 text-center sm:px-8">
          <Reveal>
            <h2 className="font-display text-3xl font-bold leading-snug sm:text-4xl">
              {T('把你的设计，', 'Turn your design')}
              <span className="text-gradient">{T('穿在机器人身上', ' into what robots wear')}</span>
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-white/55 sm:text-base">
              {T(
                '欢迎服装、面部、发型与配件方向的原创设计。分享你的作品与合作想法，我们会在评估后讨论范围、授权与合作方式。',
                'Original apparel, face, hair, and accessory directions are welcome. Share your work and ideas; scope, rights, and collaboration terms are discussed after review.'
              )}
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/contact?type=creator"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-electric-500 to-cyber-500 px-6 py-3 text-sm font-semibold text-carbon-900 shadow-[0_0_24px_rgba(45,226,255,0.35)] transition-all duration-300 hover:shadow-[0_0_36px_rgba(45,226,255,0.55)] hover:-translate-y-0.5"
              >
                {T('联系共创', 'Discuss a collaboration')}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </Link>
              <Link
                to="/robofit?category=apparel"
                className="inline-flex items-center gap-2 rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-white/75 transition-colors duration-300 hover:border-electric-400/60 hover:text-electric-200"
              >
                {T('探索外观选配', 'Explore the look builder')}
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  )
}
