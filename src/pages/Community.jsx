import { Link } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext.jsx'
import Reveal from '../components/Reveal.jsx'

// 设计师社区作品数据（前端展示用 · 众筹式发行）
const projects = [
  {
    id: 'neon-samurai',
    gradient: 'from-electric-500/30 via-carbon-800 to-cyber-500/30',
    titleZh: '霓虹武士 · 外骨骼涂装',
    titleEn: 'Neon Samurai · Exo Skin',
    designer: 'KENJI.studio',
    categoryZh: '整机皮肤',
    categoryEn: 'Full Skin',
    raised: 86,
    backers: 1240,
    machine: 'Optimus'
  },
  {
    id: 'porcelain',
    gradient: 'from-pink-400/25 via-carbon-800 to-electric-500/25',
    titleZh: '青花瓷 · 东方面具系列',
    titleEn: 'Porcelain · Oriental Mask Set',
    designer: '李未央 Studio',
    categoryZh: '面具配件',
    categoryEn: 'Mask & Accessory',
    raised: 142,
    backers: 2030,
    machine: 'Figure 03'
  },
  {
    id: 'street-mecha',
    gradient: 'from-cyber-500/30 via-carbon-800 to-pink-400/20',
    titleZh: '街头机甲 · 联名卫衣',
    titleEn: 'Street Mecha · Collab Hoodie',
    designer: 'WAVE Collective',
    categoryZh: '日常服装',
    categoryEn: 'Everyday Wear',
    raised: 64,
    backers: 870,
    machine: '小鹏 Iron'
  },
  {
    id: 'aurora-hair',
    gradient: 'from-electric-500/25 via-carbon-800 to-cyber-500/25',
    titleZh: '极光 · 渐变假发造型',
    titleEn: 'Aurora · Gradient Hair',
    designer: 'Mika Hairlab',
    categoryZh: '假发造型',
    categoryEn: 'Hair Style',
    raised: 38,
    backers: 410,
    machine: 'Optimus'
  },
  {
    id: 'carbon-knight',
    gradient: 'from-white/10 via-carbon-800 to-electric-500/20',
    titleZh: '碳纤骑士 · 哑光机身',
    titleEn: 'Carbon Knight · Matte Body',
    designer: 'NOIR works',
    categoryZh: '整机皮肤',
    categoryEn: 'Full Skin',
    raised: 109,
    backers: 1580,
    machine: 'Figure 03'
  },
  {
    id: 'festival',
    gradient: 'from-pink-400/30 via-carbon-800 to-cyber-500/25',
    titleZh: '赛博庙会 · 限定配件包',
    titleEn: 'Cyber Festival · Accessory Pack',
    designer: '陈陈 Atelier',
    categoryZh: '配件套装',
    categoryEn: 'Accessory Pack',
    raised: 73,
    backers: 990,
    machine: '小鹏 Iron'
  }
]

const steps = [
  {
    no: '01',
    titleZh: '设计师发行作品',
    titleEn: 'Designers publish',
    descZh: '独立设计师上传原创机器人服装、面具、假发与配件方案，自由定价并发起众筹式发行。',
    descEn: 'Independent designers upload original robot apparel, masks, hair and accessory designs, set their own price, and launch a crowdfunding-style drop.'
  },
  {
    no: '02',
    titleZh: '社区支持与共创',
    titleEn: 'Community backs & remixes',
    descZh: '人们浏览、收藏、支持喜欢的作品，达成目标即正式量产；社区还能在原作基础上二次创作。',
    descEn: 'People browse, favorite and back the looks they love; once a goal is met it goes into production, and the community can remix the originals.'
  },
  {
    no: '03',
    titleZh: '一键添加到 RoboFit',
    titleEn: 'One-click to RoboFit',
    descZh: '任何设计方案都可以一键添加到 RoboFit 3D 试衣选配中，实时预览并完成你的专属搭配。',
    descEn: 'Any design can be added to the RoboFit 3D fitting room in one click — preview it live and finish your own build.'
  }
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
              {T('设计师社区', 'Designer Community')}
            </span>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="mt-6 max-w-5xl font-display text-3xl font-bold leading-[1.12] tracking-tight sm:text-4xl lg:text-5xl">
              {T('每个设计师，都能发行属于自己的', 'Every designer can release their own ')}
              <span className="text-gradient">{T('机器人时尚', 'robot fashion')}</span>
            </h1>
          </Reveal>
          <Reveal delay={160}>
            <p className="mt-6 max-w-3xl text-base leading-relaxed text-white/55 sm:text-lg">
              {T(
                '像 Kickstarter 一样发行作品，像社区一样共创——独立设计师可以独立发行机器人服装及配件作品，人们可以直接一键添加设计师方案到 RoboFit 3D 试衣选配中。',
                'Release like on Kickstarter, co-create like a community — independent designers can publish their own robot apparel and accessory works, and anyone can add a designer’s look to the RoboFit 3D fitting room in one click.'
              )}
            </p>
          </Reveal>
          <Reveal delay={240}>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                to="/robofit"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-electric-500 to-cyber-500 px-6 py-3 text-sm font-semibold text-carbon-900 shadow-[0_0_24px_rgba(45,226,255,0.35)] transition-all duration-300 hover:shadow-[0_0_36px_rgba(45,226,255,0.55)] hover:-translate-y-0.5"
              >
                {T('进入 RoboFit 试衣', 'Open RoboFit')}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </Link>
              <a
                href="#become-designer"
                className="inline-flex items-center gap-2 rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-white/75 transition-colors duration-300 hover:border-cyber-400/60 hover:text-cyber-200"
              >
                {T('成为设计师', 'Become a designer')}
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------------- 运作方式 ---------------- */}
      <section className="border-t border-white/10 bg-gradient-to-b from-carbon-900 to-carbon-800/30 py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <Reveal>
            <h2 className="font-display text-2xl font-bold sm:text-3xl">{T('社区如何运作', 'How the community works')}</h2>
            <p className="mt-2 max-w-2xl text-sm text-white/45">
              {T('从发行到上身，三步打通创作者与机器人主人之间的距离。', 'From release to wear — three steps connecting creators and robot owners.')}
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
              {T('正在发行中的设计师方案', 'Designer drops live now')}
            </h2>
          </Reveal>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p, idx) => (
              <Reveal key={p.id} delay={(idx % 3) * 90}>
                <div className="hover-lift group flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-carbon-800/40">
                  {/* 作品缩略图（渐变占位） */}
                  <div className={`relative aspect-[4/3] w-full overflow-hidden bg-gradient-to-br ${p.gradient}`}>
                    <div className="absolute inset-0 bg-tech-grid opacity-20" />
                    <div className="absolute left-3 top-3 rounded-full border border-white/15 bg-carbon-900/60 px-2.5 py-1 text-[11px] font-semibold text-white/70 backdrop-blur">
                      {T(p.categoryZh, p.categoryEn)}
                    </div>
                    <div className="absolute right-3 bottom-3 rounded-full border border-white/15 bg-carbon-900/60 px-2.5 py-1 text-[11px] font-medium text-white/60 backdrop-blur">
                      {p.machine}
                    </div>
                  </div>

                  {/* 作品信息 */}
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="font-display text-base font-semibold text-white">{T(p.titleZh, p.titleEn)}</h3>
                    <p className="mt-1 text-xs text-white/45">{T('设计师', 'by')} · {p.designer}</p>

                    {/* 众筹进度 */}
                    <div className="mt-4">
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-electric-400 to-cyber-400"
                          style={{ width: `${Math.min(p.raised, 100)}%` }}
                        />
                      </div>
                      <div className="mt-2 flex items-center justify-between text-[11px] text-white/50">
                        <span className="font-semibold text-electric-300">{p.raised}% {T('已达成', 'funded')}</span>
                        <span>{p.backers.toLocaleString()} {T('人支持', 'backers')}</span>
                      </div>
                    </div>

                    {/* 一键添加 */}
                    <Link
                      to="/robofit"
                      className="mt-5 inline-flex items-center justify-center gap-2 rounded-full border border-electric-500/40 bg-electric-500/[0.08] px-4 py-2.5 text-sm font-semibold text-electric-200 transition-all duration-300 hover:bg-electric-500/20 hover:text-white"
                    >
                      {T('一键添加到 RoboFit', 'Add to RoboFit')}
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
                '加入 RoboWear 设计师社区，发行你的原创机器人外观作品，每完成一笔交易即可获得 20% 收益分成——这是属于创作者的时尚经济。',
                'Join the RoboWear designer community, release your original robot looks, and keep 20% of every sale — a creator-first fashion economy.'
              )}
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-electric-500 to-cyber-500 px-6 py-3 text-sm font-semibold text-carbon-900 shadow-[0_0_24px_rgba(45,226,255,0.35)] transition-all duration-300 hover:shadow-[0_0_36px_rgba(45,226,255,0.55)] hover:-translate-y-0.5"
              >
                {T('申请入驻', 'Apply to join')}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </Link>
              <Link
                to="/robofit"
                className="inline-flex items-center gap-2 rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-white/75 transition-colors duration-300 hover:border-electric-400/60 hover:text-electric-200"
              >
                {T('先去试衣间逛逛', 'Explore the fitting room')}
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  )
}
