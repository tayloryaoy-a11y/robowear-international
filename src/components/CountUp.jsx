import { useEffect, useRef, useState } from 'react'

/**
 * 数字滚动动画组件——用于首页"行业风口数据条"
 * 当组件进入视口时，从 0 平滑滚动到目标数值
 *
 * props:
 *  - value: 目标数值（数字）
 *  - duration: 动画时长（毫秒）
 *  - prefix / suffix: 数字前后缀文案，例如 "$" 和 " 亿美元"
 *  - decimals: 保留小数位数
 */
export default function CountUp({ value, duration = 1800, prefix = '', suffix = '', decimals = 0 }) {
  const ref = useRef(null)
  const [display, setDisplay] = useState(0)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true)
          observer.disconnect()
        }
      },
      { threshold: 0.4 }
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [started])

  useEffect(() => {
    if (!started) return
    let raf
    const start = performance.now()
    const animate = (now) => {
      const progress = Math.min((now - start) / duration, 1)
      // easeOutCubic 缓动，数字增长先快后慢，更具科技感
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(value * eased)
      if (progress < 1) raf = requestAnimationFrame(animate)
    }
    raf = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(raf)
  }, [started, value, duration])

  const formatted = decimals > 0 ? display.toFixed(decimals) : Math.round(display).toLocaleString('en-US')

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}
      {formatted}
      {suffix}
    </span>
  )
}
