import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext.jsx'
import Reveal from '../components/Reveal.jsx'
import DepositBreakdown from '../components/DepositBreakdown.jsx'
import {
  MAX_QUANTITY,
  PRODUCT_LINES,
  ROBOTS,
  findLine,
  findRobot,
  formatUsd,
  initialSelection,
  isStripeCheckoutUrl,
  quoteOrder
} from '../../shared/orderCatalog.js'

function createSubmissionId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`
}

function FieldError({ message }) {
  if (!message) return null
  return <p className="mt-1.5 text-xs text-pink-400">{message}</p>
}

function checkoutErrorMessage(code, T) {
  if (code === 'payments_not_configured') {
    return T(
      '支付暂未开通：服务器没有可用的 Stripe 密钥。没有发生扣款，这也不代表支付成功。请稍后再试，或通过联系页面与销售确认。',
      'Payments are not available: the server has no usable Stripe secret key. Nothing was charged, and this is not a completed payment. Try again later, or contact sales.'
    )
  }
  if (code === 'site_url_missing') {
    return T(
      '支付回跳地址未配置（SITE_URL）。没有发生扣款。',
      'The site return URL (SITE_URL) is not configured. Nothing was charged.'
    )
  }
  if (code === 'invalid_order') {
    return T('订单信息不完整或无效，请检查后重试。没有发生扣款。', 'The order details are incomplete or invalid. Nothing was charged.')
  }
  return T(
    '暂时无法前往 Stripe 结账，没有发生扣款。请稍后重试，或发送邮件至 contact@robowear.space。',
    'We could not open Stripe Checkout, and nothing was charged. Please try again, or email contact@robowear.space.'
  )
}

function validateForm(form, T) {
  const errors = {}
  if (!form.name.trim()) errors.name = T('请填写姓名', 'Please enter your name')
  if (!form.email.trim()) {
    errors.email = T('请填写邮箱', 'Please enter your email')
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    errors.email = T('邮箱格式不正确', 'That email address looks invalid')
  }
  if (form.phone.trim() && !/^[+\d][\d\s-]{6,}$/.test(form.phone.trim())) {
    errors.phone = T('电话号码格式不正确', 'That phone number looks invalid')
  }
  return errors
}

const choiceClass = (active) =>
  `rounded-2xl border px-4 py-3 text-left transition-all duration-300 ${
    active
      ? 'border-electric-400/70 bg-electric-500/10 shadow-[0_0_24px_rgba(45,226,255,0.08)]'
      : 'border-white/10 bg-white/[0.02] hover:border-white/25'
  }`

export default function Order() {
  const { T, lang } = useLanguage()
  const [searchParams] = useSearchParams()
  const selectionKey = searchParams.toString()
  const [lineId, setLineId] = useState(() => initialSelection(searchParams).lineId)
  const [sublineId, setSublineId] = useState(() => initialSelection(searchParams).sublineId)
  const [robotId, setRobotId] = useState(() => initialSelection(searchParams).robotId)
  const [quantity, setQuantity] = useState(1)
  const [form, setForm] = useState({ name: '', company: '', email: '', phone: '', notes: '', orderWebsite: '' })
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const submissionIdRef = useRef(createSubmissionId())

  useEffect(() => {
    if (!selectionKey) return
    const next = initialSelection(new URLSearchParams(selectionKey))
    setLineId(next.lineId)
    setSublineId(next.sublineId)
    setRobotId(next.robotId)
  }, [selectionKey])

  const line = findLine(lineId) ?? PRODUCT_LINES[0]
  const robot = findRobot(robotId)
  const quote = useMemo(() => quoteOrder({ lineId: line.id, sublineId, quantity }), [line.id, sublineId, quantity])
  const subline = quote?.subline ?? line.sublines[0]

  const chooseLine = (nextLineId) => {
    const next = findLine(nextLineId)
    if (!next) return
    setLineId(next.id)
    setSublineId(next.sublines[0].id)
    setSubmitError('')
  }

  const updateField = (key) => (event) => {
    const value = event.target.value
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev))
    setSubmitError('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (isSubmitting || !quote || !robot) return

    const validation = validateForm(form, T)
    setErrors(validation)
    if (Object.keys(validation).length !== 0) return

    setIsSubmitting(true)
    setSubmitError('')

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          lineId: line.id,
          sublineId: subline.id,
          robotId: robot.id,
          quantity,
          locale: lang,
          submissionId: submissionIdRef.current
        })
      })
      const result = await response.json().catch(() => null)
      if (!response.ok || result?.ok !== true || !isStripeCheckoutUrl(result?.url)) {
        if (result?.ok === true && !result?.url) {
          setSubmitError(checkoutErrorMessage('stripe_error', T))
        } else {
          setSubmitError(checkoutErrorMessage(result?.code, T))
        }
        setIsSubmitting(false)
        return
      }
      window.location.assign(result.url)
    } catch {
      setSubmitError(checkoutErrorMessage('', T))
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-carbon-900">
      <section className="relative overflow-hidden pb-12 pt-32 sm:pt-36">
        <div className="absolute inset-0 -z-10 bg-hero-glow opacity-70" />
        <div className="absolute inset-0 -z-10 bg-tech-grid opacity-[0.06]" />
        <div className="absolute -top-24 right-1/4 h-72 w-72 rounded-full bg-cyber-500/10 blur-[120px]" />
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-electric-500/30 bg-electric-500/10 px-4 py-1.5 text-xs font-semibold tracking-wide text-electric-300">
              {T('订单 / 支付定金', 'Order / Pay deposit')}
            </span>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="mt-6 max-w-4xl font-display text-3xl font-bold leading-[1.15] tracking-tight sm:text-4xl lg:text-5xl">
              {T('先支付 30% 定金，余款在发货前结清', 'Pay a 30% deposit now. The balance is due before shipment.')}
            </h1>
          </Reveal>
          <Reveal delay={140}>
            <p className="mt-6 max-w-3xl text-base leading-relaxed text-white/55">
              {T(
                '选择产品线、可选子系列和适配机型。下方金额是美元估价，服务器会按允许的价目重新计算定金。你将跳转到 Stripe 托管结账页；本站不收集卡号。卡片、钱包以及账户在 Stripe 后台开启的本地支付方式会由 Stripe 自动展示。',
                'Choose a product line, an optional sub-line, and a robot model. Amounts below are USD estimates, and the server recalculates the deposit from the allowlisted price list. You will continue to Stripe-hosted Checkout. This site never collects card numbers. Cards, wallets, and local methods enabled in the Stripe Dashboard are shown automatically.'
              )}
            </p>
          </Reveal>
        </div>
      </section>

      <section className="pb-16">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <form onSubmit={handleSubmit} noValidate>
            <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(20rem,0.85fr)]">
              <div className="space-y-6">
                <Reveal>
                  <div className="rounded-3xl border border-white/10 bg-carbon-800/40 p-6 sm:p-8">
                    <h2 className="font-display text-xl font-bold">{T('1. 选择产品', '1. Choose a product')}</h2>
                    <p className="mt-2 text-sm leading-relaxed text-white/45">
                      {T(
                        `已发布区间 ${line.rangeLabel}。定金按你选中的估价计算，而不是按整个区间。`,
                        `Published range ${line.rangeLabel}. The deposit uses the estimate you select, not the whole range.`
                      )}
                    </p>
                    <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2" role="group" aria-label={T('产品线', 'Product line')}>
                      {PRODUCT_LINES.map((item) => (
                        <button key={item.id} type="button" aria-pressed={item.id === line.id} onClick={() => chooseLine(item.id)} className={choiceClass(item.id === line.id)}>
                          <span className="block font-display text-sm font-semibold text-white">{T(item.nameZh, item.nameEn)}</span>
                          <span className="mt-1 block text-xs text-white/45">{T(item.summaryZh, item.summaryEn)}</span>
                        </button>
                      ))}
                    </div>

                    <h3 className="mt-8 text-xs font-semibold uppercase tracking-widest2 text-white/40">{T('子系列 / 规格', 'Sub-line')}</h3>
                    <div className="mt-3 space-y-3" role="group" aria-label={T('子系列', 'Sub-line')}>
                      {line.sublines.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          aria-pressed={item.id === subline.id}
                          onClick={() => {
                            setSublineId(item.id)
                            setSubmitError('')
                          }}
                          className={`${choiceClass(item.id === subline.id)} w-full`}
                        >
                          <span className="flex items-start justify-between gap-4">
                            <span>
                              <span className="block text-sm font-semibold text-white">{T(item.nameZh, item.nameEn)}</span>
                              <span className="mt-1 block text-xs leading-relaxed text-white/45">{T(item.noteZh, item.noteEn)}</span>
                              {item.salesConfirm ? (
                                <span className="mt-2 inline-flex rounded-full border border-cyber-400/40 bg-cyber-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest2 text-cyber-300">
                                  {T('销售确认最终金额', 'Sales confirms final total')}
                                </span>
                              ) : null}
                            </span>
                            <span className="shrink-0 font-mono text-xs text-electric-300">{formatUsd(item.priceUsd * 100)}</span>
                          </span>
                        </button>
                      ))}
                    </div>

                    <h3 className="mt-8 text-xs font-semibold uppercase tracking-widest2 text-white/40">{T('适配机型', 'Robot model')}</h3>
                    <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label={T('机型', 'Robot model')}>
                      {ROBOTS.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          aria-pressed={item.id === robotId}
                          onClick={() => setRobotId(item.id)}
                          className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                            item.id === robotId ? 'border-electric-400/70 bg-electric-500/10 text-electric-200' : 'border-white/12 text-white/55 hover:border-white/30 hover:text-white'
                          }`}
                        >
                          {T(item.nameZh, item.nameEn)}
                        </button>
                      ))}
                    </div>

                    <div className="mt-8 flex items-center justify-between gap-4">
                      <div>
                        <h3 className="text-xs font-semibold uppercase tracking-widest2 text-white/40">{T('数量', 'Quantity')}</h3>
                        <p className="mt-1 text-xs text-white/35">{T(`1–${MAX_QUANTITY} 件`, `1–${MAX_QUANTITY}`)}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          aria-label={T('减少数量', 'Decrease quantity')}
                          onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                          className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white/70 hover:border-white/30"
                        >
                          −
                        </button>
                        <span className="w-6 text-center font-display text-lg font-semibold">{quantity}</span>
                        <button
                          type="button"
                          aria-label={T('增加数量', 'Increase quantity')}
                          onClick={() => setQuantity((value) => Math.min(MAX_QUANTITY, value + 1))}
                          className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white/70 hover:border-white/30"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </Reveal>

                <Reveal delay={80}>
                  <div className="rounded-3xl border border-white/10 bg-carbon-800/40 p-6 sm:p-8">
                    <h2 className="font-display text-xl font-bold">{T('2. 联系方式', '2. Contact details')}</h2>
                    <p className="mt-2 text-sm text-white/45">{T('用于订单确认和发货前沟通。', 'Used for the order confirmation and pre-shipment follow-up.')}</p>
                    <div className="absolute left-[-10000px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
                      <label htmlFor="order-website">Website</label>
                      <input id="order-website" name="orderWebsite" type="text" tabIndex={-1} autoComplete="off" value={form.orderWebsite} onChange={updateField('orderWebsite')} />
                    </div>
                    <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
                      <div>
                        <label htmlFor="order-name" className="mb-1.5 block text-xs font-semibold uppercase tracking-widest2 text-white/40">
                          {T('姓名', 'Full name')} <span className="text-pink-400">*</span>
                        </label>
                        <input id="order-name" value={form.name} onChange={updateField('name')} autoComplete="name" maxLength={100} className="input-field" placeholder={T('您的姓名', 'Your name')} />
                        <FieldError message={errors.name} />
                      </div>
                      <div>
                        <label htmlFor="order-company" className="mb-1.5 block text-xs font-semibold uppercase tracking-widest2 text-white/40">
                          {T('公司 / 机构', 'Company')}
                        </label>
                        <input id="order-company" value={form.company} onChange={updateField('company')} autoComplete="organization" maxLength={160} className="input-field" placeholder={T('选填', 'Optional')} />
                      </div>
                      <div>
                        <label htmlFor="order-email" className="mb-1.5 block text-xs font-semibold uppercase tracking-widest2 text-white/40">
                          {T('邮箱', 'Email')} <span className="text-pink-400">*</span>
                        </label>
                        <input id="order-email" type="email" value={form.email} onChange={updateField('email')} autoComplete="email" maxLength={254} className="input-field" placeholder="you@example.com" />
                        <FieldError message={errors.email} />
                      </div>
                      <div>
                        <label htmlFor="order-phone" className="mb-1.5 block text-xs font-semibold uppercase tracking-widest2 text-white/40">
                          {T('电话', 'Phone')}
                        </label>
                        <input id="order-phone" type="tel" value={form.phone} onChange={updateField('phone')} autoComplete="tel" maxLength={40} className="input-field" placeholder={T('选填', 'Optional')} />
                        <FieldError message={errors.phone} />
                      </div>
                    </div>
                    <div className="mt-5">
                      <label htmlFor="order-notes" className="mb-1.5 block text-xs font-semibold uppercase tracking-widest2 text-white/40">
                        {T('备注', 'Notes')}
                      </label>
                      <textarea
                        id="order-notes"
                        rows={4}
                        value={form.notes}
                        onChange={updateField('notes')}
                        maxLength={2000}
                        className="input-field resize-none"
                        placeholder={T('尺寸、配色、批量或交付要求（选填）', 'Fit, color, quantity, or delivery notes (optional)')}
                      />
                    </div>
                  </div>
                </Reveal>
              </div>

              <Reveal direction="right" delay={40}>
                <aside className="rounded-3xl border border-white/10 bg-carbon-800/50 p-6 sm:p-8 lg:sticky lg:top-28">
                  <p className="text-[11px] font-semibold uppercase tracking-widest2 text-white/35">{T('定金摘要', 'Deposit summary')}</p>
                  <h2 className="mt-3 font-display text-2xl font-bold">{T(line.nameZh, line.nameEn)}</h2>
                  <p className="mt-1 text-sm text-white/55">
                    {T(subline.nameZh, subline.nameEn)} · {robot ? T(robot.nameZh, robot.nameEn) : ''}
                  </p>
                  {quote ? (
                    <div className="mt-6">
                      <DepositBreakdown
                        T={T}
                        unit={formatUsd(quote.unitCents)}
                        quantity={quote.quantity}
                        estimated={formatUsd(quote.estimatedTotalCents)}
                        deposit={formatUsd(quote.depositCents)}
                        balance={formatUsd(quote.balanceCents)}
                      />
                    </div>
                  ) : null}

                  <ul className="mt-6 space-y-2 text-xs leading-relaxed text-white/45">
                    <li>{T('现在扣款的是定金 / 预付款，不是全款。', 'The charge today is a deposit / down payment, not the full order.')}</li>
                    <li>{T('余款在发货前支付。', 'The balance is due before shipment.')}</li>
                    <li>{T('估价可能因定制、授权或适配由销售确认后调整。', 'Estimates may be confirmed by sales for custom work, licensing, or fit.')}</li>
                    <li>{T('币种为美元（USD）。', 'Currency is US dollars (USD).')}</li>
                  </ul>

                  {submitError ? (
                    <div role="alert" className="mt-5 rounded-2xl border border-pink-400/30 bg-pink-400/[0.08] px-4 py-3 text-sm leading-relaxed text-pink-200">
                      {submitError}
                    </div>
                  ) : null}

                  <button
                    type="submit"
                    disabled={isSubmitting || !quote}
                    aria-busy={isSubmitting}
                    className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-electric-500 to-cyber-500 px-6 py-3.5 text-sm font-semibold text-carbon-900 shadow-[0_0_28px_rgba(45,226,255,0.3)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_40px_rgba(45,226,255,0.45)] disabled:cursor-wait disabled:opacity-65 disabled:hover:translate-y-0"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-carbon-900/30 border-t-carbon-900" aria-hidden="true" />
                        {T('正在前往 Stripe…', 'Redirecting to Stripe…')}
                      </>
                    ) : (
                      T('使用 Stripe 支付定金', 'Pay deposit with Stripe')
                    )}
                  </button>
                  <p className="mt-3 text-[11px] leading-relaxed text-white/30">
                    {T(
                      '点击后将离开本站，进入 Stripe 结账。未配置密钥时会显示错误，不会假装支付成功。',
                      'This leaves the site for Stripe Checkout. If keys are missing, you will see an error — never a fake success.'
                    )}
                  </p>
                </aside>
              </Reveal>
            </div>
          </form>
        </div>
      </section>

      <section className="border-t border-white/8 pb-24">
        <div className="mx-auto max-w-7xl px-5 pt-16 sm:px-8 lg:px-10">
          <Reveal>
            <h2 className="font-display text-2xl font-bold sm:text-3xl">{T('定金如何运作', 'How the deposit works')}</h2>
          </Reveal>
          <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3">
            {[
              [T('确认估价', 'Confirm the estimate'), T('从已发布的产品线中选择规格。金额以美元计价，仅供下单参考。', 'Pick a specification from the published lines. The figure is in USD and is an order estimate.')],
              [T('支付 30% 定金', 'Pay the 30% deposit'), T('Stripe 托管页面收取定金，并展示账户已启用的卡片、Apple Pay、Google Pay 或其他本地方式。', 'Stripe-hosted Checkout collects the deposit and shows cards, Apple Pay, Google Pay, or other local methods enabled on the account.')],
              [T('发货前付余款', 'Pay the balance before shipment'), T('销售确认定制与适配后，余款在发货前结清。Stripe 会向结账邮箱发送收据。', 'After sales confirms custom work and fit, the balance is due before shipment. Stripe emails a receipt to the checkout address.')]
            ].map(([title, body], index) => (
              <Reveal key={title} delay={index * 80}>
                <article className="h-full rounded-3xl border border-white/10 bg-white/[0.02] p-6">
                  <span className="font-mono text-xs text-electric-300">0{index + 1}</span>
                  <h3 className="mt-3 font-display text-lg font-semibold">{title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-white/50">{body}</p>
                </article>
              </Reveal>
            ))}
          </div>
          <p className="mt-8 text-sm text-white/40">
            <Link to="/products" className="text-electric-300 hover:text-electric-200">{T('返回产品中心', 'Back to products')}</Link>
            <span className="mx-2 text-white/20">/</span>
            <Link to="/contact" className="text-electric-300 hover:text-electric-200">{T('联系销售', 'Contact sales')}</Link>
          </p>
        </div>
      </section>
    </div>
  )
}
