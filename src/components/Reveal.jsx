import { useEffect, useRef, useState } from 'react'

/**
 * 滚动出现动画容器
 * 使用 Intersection Observer 监听元素是否进入视口，
 * 进入后添加 fade + slide-up 过渡效果（仅触发一次，避免重复抖动）
 *
 * props:
 *  - delay: 动画延迟（毫秒），用于错落出现的节奏感
 *  - direction: 'up' | 'left' | 'right'，滑入方向
 *  - as: 渲染的标签名，默认 div
 */
export default function Reveal({ children, delay = 0, direction = 'up', className = '', as: Tag = 'div' }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  const hiddenTransform =
    direction === 'left' ? '-translate-x-10' : direction === 'right' ? 'translate-x-10' : 'translate-y-10'

  return (
    <Tag
      ref={ref}
      className={`transition-all duration-[900ms] ease-out will-change-transform ${
        visible ? 'opacity-100 translate-x-0 translate-y-0' : `opacity-0 ${hiddenTransform}`
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </Tag>
  )
}
