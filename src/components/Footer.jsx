import { Link } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext.jsx'

export default function Footer() {
  const { T } = useLanguage()
  const productLines = [
    { id: 'roboface', zh: 'Robo-Face™ 面部外观', en: 'Robo-Face™ Faces' },
    { id: 'robohair', zh: 'Robo-Hair™ 发型与头饰', en: 'Robo-Hair™ Hair & Headwear' },
    { id: 'robowear', zh: 'Robo-Wear™ 服装套装', en: 'Robo-Wear™ Apparel Sets' },
    { id: 'accessories', zh: 'Robo-Accessories™ 配件', en: 'Robo-Accessories™' },
    { id: 'roboskin', zh: 'Robo-Skin™ 软性外覆研发', en: 'Robo-Skin™ Cover R&D' }
  ]

  return (
    <footer className="relative border-t border-white/10 bg-carbon-900">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-electric-500/50 to-transparent" />
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-10">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link to="/" className="inline-flex items-center">
              <img src="/images/robowear/logo.svg" alt="RoboWear" className="h-9 w-auto invert" />
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/45">
              {T('为具身机器人定制服装套装与造型。', 'Appearance customization for embodied robots: apparel sets and styling.')}
            </p>
            <p className="mt-4 text-xs leading-relaxed text-white/35">
              {T('罗卜皮 · 成都羽腾集团 · 创立于 2026 年', 'RoboWear · Chengdu Yuteng Group · Founded 2026')}
            </p>
            {/* 【待确认】主体工商全称：罗卜皮机器人科技（成都）有限公司；确认前不作法律主体公示。 */}
          </div>
          <div>
            <h4 className="font-display text-sm font-semibold uppercase tracking-widest2 text-white/80">{T('产品与外观', 'Products & Looks')}</h4>
            <ul className="mt-5 space-y-3">
              {productLines.map((product) => (
                <li key={product.id}>
                  <Link to={`/products#${product.id}`} className="text-sm text-white/45 transition-colors hover:text-electric-300">{T(product.zh, product.en)}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-display text-sm font-semibold uppercase tracking-widest2 text-white/80">{T('探索与合作', 'Explore & Partner')}</h4>
            <ul className="mt-5 space-y-3 text-sm text-white/45">
              <li><Link to="/robofit" className="transition-colors hover:text-electric-300">{T('RoboFit 外观体验', 'RoboFit Look Builder')}</Link></li>
              <li><Link to="/technology" className="transition-colors hover:text-electric-300">{T('材料与研发', 'Materials & R&D')}</Link></li>
              <li><Link to="/community" className="transition-colors hover:text-electric-300">{T('设计师共创', 'Creator Co-creation')}</Link></li>
              <li><Link to="/contact?type=partner" className="transition-colors hover:text-electric-300">{T('与我们合作', 'Partner with us')}</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-display text-sm font-semibold uppercase tracking-widest2 text-white/80">{T('保持联系', 'Stay Connected')}</h4>
            <a href="mailto:contact@robowear.space" className="mt-5 inline-block break-all text-sm text-electric-300 transition-colors hover:text-electric-200">contact@robowear.space</a>
            <a href="tel:+8613458670416" className="mt-2 block text-sm text-white/45">+86 13458670416</a>
            <Link to="/contact?type=appearance" className="mt-5 inline-block text-sm text-white/65 transition-colors hover:text-electric-300">{T('获取报价评估', 'Request a quote')}</Link>
            {/* Social links and office addresses stay hidden until ownership and locations are confirmed. */}
          </div>
        </div>
        <div className="mt-14 flex flex-col items-start justify-between gap-4 border-t border-white/10 pt-8 text-xs text-white/35 sm:flex-row sm:items-center">
          <p>© 2026 RoboWear. {T('版权所有', 'All rights reserved.')}</p>
          <p>{T('定制项目与合作询盘 · 一键下单在路线图中', 'Custom projects & partnerships · One-click order on the roadmap')}</p>
        </div>
      </div>
    </footer>
  )
}
