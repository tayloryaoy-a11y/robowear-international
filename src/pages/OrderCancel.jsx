import { Link } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext.jsx'
import Reveal from '../components/Reveal.jsx'

export default function OrderCancel() {
  const { T } = useLanguage()

  return (
    <div className="bg-carbon-900">
      <section className="relative overflow-hidden pb-24 pt-32 sm:pt-36">
        <div className="absolute inset-0 -z-10 bg-hero-glow opacity-50" />
        <div className="absolute inset-0 -z-10 bg-tech-grid opacity-[0.05]" />
        <div className="mx-auto max-w-3xl px-5 sm:px-8">
          <Reveal>
            <div className="rounded-3xl border border-white/10 bg-carbon-800/50 p-6 sm:p-10">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-widest2 text-white/50">
                {T('已取消', 'Canceled')}
              </span>
              <h1 className="mt-6 font-display text-3xl font-bold sm:text-4xl">
                {T('你已离开结账，定金未支付', 'You left Checkout. The deposit was not paid.')}
              </h1>
              <p className="mt-4 text-sm leading-relaxed text-white/55">
                {T(
                  'Stripe 结账已取消或未完成。RoboWear 没有收到这笔定金，也不会把它记为支付成功。你可以返回订单页重新发起，或联系销售讨论定制需求。',
                  'Stripe Checkout was canceled or left unfinished. RoboWear did not receive this deposit and will not record it as paid. You can return to the order page, or contact sales about a custom brief.'
                )}
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/order"
                  className="inline-flex flex-1 items-center justify-center rounded-full bg-gradient-to-r from-electric-500 to-cyber-500 px-5 py-3 text-sm font-semibold text-carbon-900"
                >
                  {T('返回订单', 'Back to the order')}
                </Link>
                <Link
                  to="/contact"
                  className="inline-flex flex-1 items-center justify-center rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-white/75 hover:border-white/30 hover:text-white"
                >
                  {T('联系销售', 'Contact sales')}
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  )
}
