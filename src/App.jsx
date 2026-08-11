import { Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { SpeedInsights } from '@vercel/speed-insights/react'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import Home from './pages/Home.jsx'
import Products from './pages/Products.jsx'
import RoboFit from './pages/RoboFit.jsx'
import Technology from './pages/Technology.jsx'
import About from './pages/About.jsx'
import Contact from './pages/Contact.jsx'
import Community from './pages/Community.jsx'

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
    <div className="min-h-screen bg-carbon-900 text-white selection:bg-electric-500 selection:text-carbon-900 overflow-x-hidden">
      <ScrollToTop />
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/robofit" element={<RoboFit />} />
          <Route path="/technology" element={<Technology />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/community" element={<Community />} />
        </Routes>
      </main>
      <Footer />
      <SpeedInsights />
    </div>
  )
}
