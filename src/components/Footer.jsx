import { Link } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext.jsx'
import { IconX, IconYouTube, IconTikTok, IconDouyin, IconInstagram } from './icons.jsx'

export default function Footer() {
  const { T } = useLanguage()

  const productLines = [
    { zh: 'Robo-Skin™ 智能皮肤', en: 'Robo-Skin™ Smart Skin' },
    { zh: 'Robo-Wear™ 功能性服装', en: 'Robo-Wear™ Apparel' },
    { zh: 'Robo-Face™ 面具系统', en: 'Robo-Face™ Masks' },
    { zh: 'Robo-Hair™ 假发系统', en: 'Robo-Hair™ Wigs' },
    { zh: 'Robo-Accessories™ 配件', en: 'Robo-Accessories™' }
  ]

  const social = [
    { Icon: IconX, label: 'X (Twitter)' },
    { Icon: IconYouTube, label: 'YouTube' },
    { Icon: IconTikTok, label: 'TikTok' },
    { Icon: IconDouyin, label: '抖音 Douyin' },
    { Icon: IconInstagram, label: 'Instagram' }
  ]

  return (
    <footer className="relative border-t border-white/10 bg-carbon-900">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-electric-500/50 to-transparent" />
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10 py-16">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* 公司信息 */}
          <div className="lg:col-span-1">
            <Link to="/" className="inline-flex items-center">
              <img src="/images/robowear/logo.svg" alt="RoboWear International" className="h-9 w-auto invert" />
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/45">
              {T(
                'RoboWear International — 全球首个具身机器人在线服装 DIY 定制选购平台。机器人时代的 Nike，让每一台机器人都拥有独一无二的外在身份。',
                'RoboWear International — the world’s first online DIY apparel customization platform for embodied robots. The Nike of the robotic era, giving every robot a one-of-a-kind identity.'
              )}
            </p>
            <p className="mt-4 text-xs uppercase tracking-widest2 text-white/30">RoboWear International Ltd. · Est. 2026</p>
          </div>

          {/* 五大产品线链接 */}
          <div>
            <h4 className="font-display text-sm font-semibold uppercase tracking-widest2 text-white/80">
              {T('产品体系', 'Product Lines')}
            </h4>
            <ul className="mt-5 space-y-3">
              {productLines.map((p) => (
                <li key={p.zh}>
                  <Link to="/products" className="text-sm text-white/45 transition-colors hover:text-electric-300">
                    {T(p.zh, p.en)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 联系方式 / 四地办公室 */}
          <div>
            <h4 className="font-display text-sm font-semibold uppercase tracking-widest2 text-white/80">
              {T('全球据点', 'Global Offices')}
            </h4>
            <ul className="mt-5 space-y-4 text-sm text-white/45">
              <li>
                <span className="font-medium text-white/70">{T('成都', 'Chengdu')}</span>
                <br />
                {T('供应链与运营中心 · 中国四川', 'Supply chain & operations · Sichuan, China')}
              </li>
              <li>
                <span className="font-medium text-white/70">{T('洛杉矶', 'Los Angeles')}</span>
                <br />
                {T('研发与品牌中心 · 美国加州', 'R&D & brand center · California, USA')}
              </li>
              <li>
                <span className="font-medium text-white/70">{T('香港', 'Hong Kong')}</span>
                <br />
                {T('国际融资与资本运作', 'International financing & capital ops')}
              </li>
              <li>
                <span className="font-medium text-white/70">{T('北京', 'Beijing')}</span>
                <br />
                {T('产业资源整合中心 · 中国北京', 'Industry resource integration center · Beijing, China')}
              </li>
            </ul>
          </div>

          {/* 商务联系 + 社媒 */}
          <div>
            <h4 className="font-display text-sm font-semibold uppercase tracking-widest2 text-white/80">
              {T('保持联系', 'Stay Connected')}
            </h4>
            <a href="mailto:tayloryaoy@gmail.com" className="mt-5 inline-block text-sm text-electric-300 transition-colors hover:text-electric-200">
              tayloryaoy@gmail.com
            </a>
            <p className="mt-2 text-sm text-white/45">+86 13458670416</p>
            <div className="mt-5 flex items-center gap-2.5">
              {social.map(({ Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  onClick={(e) => e.preventDefault()}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/12 text-white/50 transition-all duration-300 hover:-translate-y-1 hover:border-electric-400/60 hover:text-electric-300"
                >
                  <Icon />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/8 pt-8 text-xs text-white/35 sm:flex-row">
          <p>
            © {new Date().getFullYear()} RoboWear International Ltd. {T('版权所有', 'All rights reserved.')}
          </p>
          <p className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-electric-500 animate-pulseGlow" />
            {T('总部：美国 · 洛杉矶 ｜ 中国 · 成都 ｜ 中国 · 香港 ｜ 中国 · 北京', 'HQ: Los Angeles, USA · Chengdu, China · Hong Kong, China · Beijing, China')}
          </p>
        </div>
      </div>
    </footer>
  )
}
