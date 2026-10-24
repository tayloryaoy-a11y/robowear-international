import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext.jsx'
import Reveal from '../components/Reveal.jsx'
import DepositBreakdown from '../components/DepositBreakdown.jsx'
import { formatUsd } from '../../shared/orderCatalog.js'

const SESSION_PATTERN = /^cs_(test|live)_[A-Za-z0-9]{8,200}$/

function Row({ label, value }) {
  if (!value) return null
  return (
    <div className="flex items-start justify-between gap-4 py-1.5 text-sm">
      <span className="text-white/40">{label}</span>
      <span className="max-w-[16rem] text-right font-medium text-white/85">{value}</span>
    </div>
  )
}

export default function OrderSuccess() {
  const { T } = useLanguage()
  const [searchParams] = useSearchParams()
  const sessionId = searchParams.get('session_id') || ''
  const [status, setStatus] = useState(SESSION_PATTERN.test(sessionId) ? 'loading' : 'missing')
  const [summary, setSummary] = useState(null)
  const [errorCode, setErrorCode] = useState('')

  useEffect(() => {
    if (!SESSION_PATTERN.test(sessionId)) return undefined
    const controller = new AbortController()
    setStatus('loading')

    fetch(`/api/checkout-session?session_id=${encodeURIComponent(sessionId)}`, { signal: controller.signal })
      .then(async (response) => {
        const result = await response.json().catch(() => null)
        if (!response.ok || result?.ok !== true) {
          setErrorCode(result?.code || 'stripe_error')
          setStatus('error')
          return
        }
        setSummary(result)
        setStatus(result.state || (result.paid ? 'paid' : 'unpaid'))
      })
      .catch((error) => {
        if (error?.name === 'AbortError') return
        setErrorCode('stripe_error')
        setStatus('error')
      })

    return () => controller.abort()
  }, [sessionId])

  const paid = status === 'paid' && summary?.paid === true

  return (
    <div className="bg-carbon-900">
      <section className="relative overflow-hidden pb-24 pt-32 sm:pt-36">
        <div className="absolute inset-0 -z-10 bg-hero-glow opacity-60" />
        <div className="absolute inset-0 -z-10 bg-tech-grid opacity-[0.05]" />
        <div className="mx-auto max-w-3xl px-5 sm:px-8">
          <Reveal>
            <div className="rounded-3xl border border-white/10 bg-carbon-800/50 p-6 sm:p-10">
              {status === 'loading' ? (
                <div className="flex items-center gap-3 text-sm text-white/60">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-electric-300" aria-hidden="true" />
                  {T('正在向 Stripe 确认这笔定金…', 'Confirming this deposit with Stripe…')}
                </div>
              ) : null}

              {paid ? (
                <>
                  <span className="flex h-16 w-16 items-center justify-center rounded-full border border-electric-500/40 bg-electric-500/10 text-electric-300">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M5 12l4 4L19 6" /></svg>
                  </span>
                  <h1 className="mt-6 font-display text-3xl font-bold">{T('定金已支付', 'Deposit paid')}</h1>
                  <p className="mt-3 text-sm leading-relaxed text-white/55">
                    {T(
                      'Stripe 已确认这笔 30% 定金。余款仍需在发货前支付。定制、授权或适配金额可能由销售最终确认。Stripe 会把收据发到结账邮箱。',
                      'Stripe has confirmed this 30% deposit. The balance is still due before shipment. Custom work, licensing, or fit may be confirmed by sales. Stripe emails a receipt to the checkout address.'
                    )}
                  </p>
                </>
              ) : null}

              {status === 'processing' ? (
                <>
                  <h1 className="font-display text-3xl font-bold">{T('定金处理中', 'Deposit processing')}</h1>
                  <p className="mt-3 text-sm leading-relaxed text-white/55">
                    {T(
                      '结账步骤已完成，但这笔款项尚未标记为已支付。到账后 Stripe 会发送收据。在此之前请不要再次支付定金。',
                      'Checkout is complete, but the payment is not marked paid yet. Stripe will email a receipt when it settles. Do not pay the deposit again before then.'
                    )}
                  </p>
                </>
              ) : null}

              {status === 'unpaid' || status === 'expired' ? (
                <>
                  <h1 className="font-display text-3xl font-bold">{status === 'expired' ? T('结账已过期', 'Checkout expired') : T('定金尚未支付', 'Deposit not paid')}</h1>
                  <p className="mt-3 text-sm leading-relaxed text-white/55">
                    {T('这笔 Checkout 没有确认到已支付的定金。没有标记为支付成功。', 'This Checkout session does not have a confirmed deposit. It is not marked as paid.')}
                  </p>
                </>
              ) : null}

              {status === 'missing' || status === 'error' ? (
                <>
                  <h1 className="font-display text-3xl font-bold">{T('无法确认定金', 'Deposit could not be confirmed')}</h1>
                  <p className="mt-3 text-sm leading-relaxed text-white/55">
                    {errorCode === 'payments_not_configured'
                      ? T('服务器未配置 Stripe，因此不能把这次访问显示为支付成功。如果银行或 Stripe 已扣款，请凭收据联系销售，不要重复支付。', 'Stripe is not configured, so this visit is not a successful payment. If your bank or Stripe already charged you, contact sales with the receipt and do not pay again.')
                      : errorCode === 'amount_mismatch'
                        ? T('我们无法把这笔 Stripe 金额与当前价目核对。如果已经扣款，请凭 Stripe 收据联系销售，不要重复支付。', 'We could not match this Stripe amount to the current price list. If you were charged, contact sales with the Stripe receipt and do not pay again.')
                        : T('没有可核对的已支付定金。如果 Stripe 已发送收据，请联系销售，不要仅凭本页重复下单。', 'There is no verified paid deposit to show. If Stripe already emailed a receipt, contact sales rather than paying again from this page.')}
                  </p>
                </>
              ) : null}

              {summary && status !== 'error' && status !== 'missing' ? (
                <div className="mt-8 rounded-2xl border border-white/10 bg-carbon-900/50 p-5">
                  <Row label={T('产品线', 'Product line')} value={T(summary.lineNameZh, summary.lineNameEn)} />
                  <Row label={T('规格', 'Specification')} value={T(summary.sublineNameZh, summary.sublineNameEn)} />
                  <Row label={T('机型', 'Robot')} value={T(summary.robotNameZh, summary.robotNameEn)} />
                  <Row label={T('姓名', 'Name')} value={summary.customerName} />
                  <Row label={T('邮箱', 'Email')} value={summary.email} />
                  <Row label={T('公司', 'Company')} value={summary.company} />
                  <Row label={T('电话', 'Phone')} value={summary.phone} />
                  <Row label={T('备注', 'Notes')} value={summary.notes} />
                  <div className="mt-4 border-t border-white/10 pt-4">
                    <DepositBreakdown
                      T={T}
                      variant={summary.paid ? 'paid' : 'amount'}
                      unit={formatUsd(summary.unitCents)}
                      quantity={summary.quantity}
                      estimated={formatUsd(summary.estimatedTotalCents)}
                      deposit={formatUsd(summary.depositCents)}
                      balance={formatUsd(summary.balanceCents)}
                    />
                  </div>
                  {summary.sessionId ? <p className="mt-4 break-all font-mono text-[11px] text-white/30">{summary.sessionId}</p> : null}
                </div>
              ) : null}

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link to="/order" className="inline-flex flex-1 items-center justify-center rounded-full bg-gradient-to-r from-electric-500 to-cyber-500 px-5 py-3 text-sm font-semibold text-carbon-900">
                  {paid ? T('再下一单', 'Place another order') : T('返回订单', 'Back to order')}
                </Link>
                <Link to="/contact" className="inline-flex flex-1 items-center justify-center rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-white/75 hover:border-white/30 hover:text-white">
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
