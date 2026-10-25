import { Routes, Route, useLocation, Link } from 'react-router-dom'
import { lazy, Suspense, useEffect } from 'react'
import { useLanguage } from './context/LanguageContext.jsx'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import Home from './pages/Home.jsx'
import Products from './pages/Products.jsx'
import Technology from './pages/Technology.jsx'
import About from './pages/About.jsx'
import Contact from './pages/Contact.jsx'
import Community from './pages/Community.jsx'

const RoboFit = lazy(() => import('./pages/RoboFit.jsx'))
const PAGE_META = {
  '/': ['为具身机器人定制外观', 'Custom looks for embodied robots', '探索机器人服装、面部、发型与软性外覆，获取定制评估或洽谈合作。', 'Explore apparel, faces, hair, and soft covers for embodied robots. Request a custom quote or explore a partnership.'],
  '/products': ['产品与外观', 'Products & Looks', '浏览五条外观产品线，了解概念状态与机型验证边界。', 'Explore five appearance directions, their development status, and platform validation requirements.'],
  '/robofit': ['RoboFit 外观体验', 'RoboFit Look Builder', '选配外观、查看单品参考，生成摘要并携带方案询盘。', 'Select appearance references, generate a look summary, and carry your selection into a quote request.'],
  '/technology': ['材料与研发', 'Materials & R&D', '了解机器人穿戴的材料、传感器空间、运动与热设计研发方向。', 'Explore materials, sensor workspace, motion, and thermal design principles for robot wearables.'],
  '/about': ['关于', 'About', '了解 RoboWear 的外观定制方向、供应链与高校共研能力。', 'Meet RoboWear and explore our appearance customization, supply chain, and university co-development approach.'],
  '/contact': ['联系与询盘', 'Contact & Quotes', '提交外观定制、制造商、品牌、创作者或联合开发合作意向。', 'Request an appearance quote or discuss OEM, brand, creator, investment, or joint-development partnerships.'],
  '/community': ['设计师共创', 'Creator Co-creation', '探索概念作品，联系 RoboWear 洽谈外观与造型共创。', 'Explore concept work and discuss co-creation in robot appearance and styling.']
}

function PageMetadata() {
  const { pathname } = useLocation()
  const { lang } = useLanguage()
  useEffect(() => {
    const meta = PAGE_META[pathname] || ['页面未找到', 'Page not found', '探索 RoboWear 产品与外观。', 'Explore RoboWear products and looks.']
    document.title = `${meta[lang === 'zh' ? 0 : 1]} | RoboWear`
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en'
    document.querySelector('meta[name="description"]')?.setAttribute('content', meta[lang === 'zh' ? 2 : 3])
  }, [pathname, lang])
  return null
}

function NotFound() {
  const { T } = useLanguage()
  return <section className="mx-auto max-w-7xl px-5 pb-32 pt-40 sm:px-8"><p className="text-sm text-electric-300">404</p><h1 className="mt-4 font-display text-4xl font-bold">{T('页面未找到', 'This page could not be found')}</h1><p className="mt-5 text-white/55">{T('从产品与外观重新开始探索。', 'Continue exploring our products and looks.')}</p><Link to="/products" className="mt-8 inline-flex rounded-full bg-electric-400 px-6 py-3 text-sm font-semibold text-carbon-900">{T('探索外观', 'Explore looks')}</Link></section>
}

// 路由切换时自动回到页面顶部
function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' })
  }, [pathname])
  return null
}

export default function App() {
  return (
    <div className="min-h-screen bg-carbon-900 text-white selection:bg-electric-500 selection:text-carbon-900 overflow-x-clip">
      <ScrollToTop />
      <PageMetadata />
      <Navbar />
      <main>
        <Suspense fallback={<p role="status" className="px-8 py-40 text-center text-white/60">Loading RoboFit…</p>}><Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/robofit" element={<RoboFit />} />
          <Route path="/technology" element={<Technology />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/community" element={<Community />} />
          <Route path="*" element={<NotFound />} />
        </Routes></Suspense>
      </main>
      <Footer />
    </div>
  )
}
