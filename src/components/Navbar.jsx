import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext.jsx'

export default function Navbar() {
  const { lang, toggleLang, T } = useLanguage()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  // 滚动监听：导航栏从透明渐变为半透明毛玻璃
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // 路由切换时自动收起移动端菜单
  useEffect(() => {
    setMobileOpen(false)
  }, [lang])

  const navItems = [
    { to: '/', label: T('首页', 'Home') },
    { to: '/products', label: T('产品', 'Products') },
    { to: '/robofit', label: T('RoboFit 定制平台', 'RoboFit Platform') },
    { to: '/technology', label: T('技术', 'Technology') },
    { to: '/about', label: T('关于我们', 'About') },
    { to: '/contact', label: T('联系', 'Contact') },
    { to: '/community', label: T('社区', 'Community') }
  ]

  const linkClass = ({ isActive }) =>
    `relative px-1 py-2 text-sm font-medium tracking-wide transition-colors duration-300 ${
      isActive ? 'text-white' : 'text-white/55 hover:text-white'
    } group`

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? 'bg-carbon-900/70 backdrop-blur-xl border-b border-white/10 shadow-[0_8px_30px_-10px_rgba(0,0,0,0.6)]' : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10 py-4">
        {/* Logo */}
        <Link to="/" className="flex items-center group" onClick={() => setMobileOpen(false)}>
          <img
            src="/images/robowear/logo.svg"
            alt="RoboWear International"
            className="h-8 w-auto invert transition-transform duration-500 sm:h-9 group-hover:scale-[1.04]"
          />
        </Link>

        {/* 桌面端导航 */}
        <nav className="hidden lg:flex items-center gap-7">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={linkClass} end={item.to === '/'}>
              {({ isActive }) => (
                <>
                  {item.label}
                  <span
                    className={`absolute -bottom-0.5 left-0 h-[1.5px] bg-gradient-to-r from-electric-400 to-cyber-400 transition-all duration-300 ${
                      isActive ? 'w-full' : 'w-0 group-hover:w-full'
                    }`}
                  />
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* 右侧操作区：语言切换 + CTA + 移动端汉堡按钮 */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleLang}
            className="hidden sm:flex items-center gap-1 rounded-full border border-white/15 px-3 py-1.5 text-xs font-semibold tracking-wider text-white/70 transition-all duration-300 hover:border-electric-400/60 hover:text-electric-300"
            aria-label="Toggle language"
          >
            <span className={lang === 'zh' ? 'text-electric-400' : ''}>中</span>
            <span className="text-white/30">/</span>
            <span className={lang === 'en' ? 'text-electric-400' : ''}>EN</span>
          </button>

          <Link
            to="/robofit"
            className="hidden sm:inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-electric-500 to-cyber-500 px-5 py-2 text-sm font-semibold text-carbon-900 shadow-[0_0_24px_rgba(45,226,255,0.35)] transition-all duration-300 hover:shadow-[0_0_36px_rgba(45,226,255,0.55)] hover:-translate-y-0.5"
          >
            {T('开始定制', 'Start Customizing')}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </Link>

          {/* 移动端汉堡菜单按钮 */}
          <button
            className="lg:hidden flex h-9 w-9 flex-col items-center justify-center gap-1.5 rounded-lg border border-white/15"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            <span className={`block h-[1.5px] w-5 bg-white transition-all duration-300 ${mobileOpen ? 'translate-y-[6px] rotate-45' : ''}`} />
            <span className={`block h-[1.5px] w-5 bg-white transition-all duration-300 ${mobileOpen ? 'opacity-0' : ''}`} />
            <span className={`block h-[1.5px] w-5 bg-white transition-all duration-300 ${mobileOpen ? '-translate-y-[6px] -rotate-45' : ''}`} />
          </button>
        </div>
      </div>

      {/* 移动端下拉菜单 */}
      <div
        className={`lg:hidden overflow-hidden transition-all duration-500 ease-out ${
          mobileOpen ? 'max-h-[28rem] border-t border-white/10' : 'max-h-0'
        } bg-carbon-900/95 backdrop-blur-xl`}
      >
        <nav className="flex flex-col gap-1 px-5 py-4">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `rounded-lg px-3 py-3 text-sm font-medium transition-colors duration-200 ${
                  isActive ? 'bg-white/8 text-electric-300' : 'text-white/65 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
          <div className="mt-2 flex items-center gap-3 px-3">
            <button
              onClick={toggleLang}
              className="flex items-center gap-1 rounded-full border border-white/15 px-3 py-1.5 text-xs font-semibold tracking-wider text-white/70"
            >
              <span className={lang === 'zh' ? 'text-electric-400' : ''}>中</span>
              <span className="text-white/30">/</span>
              <span className={lang === 'en' ? 'text-electric-400' : ''}>EN</span>
            </button>
            <Link
              to="/robofit"
              onClick={() => setMobileOpen(false)}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-electric-500 to-cyber-500 px-5 py-2.5 text-sm font-semibold text-carbon-900"
            >
              {T('开始定制', 'Start Customizing')}
            </Link>
          </div>
        </nav>
      </div>
    </header>
  )
}
