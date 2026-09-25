import { findRobot, formatUsd, quoteOrder } from '../../shared/orderCatalog.js'

const SESSION_ID_PATTERN = /^cs_(test|live)_[A-Za-z0-9]{8,200}$/

export function isCheckoutSessionId(value) {
  return typeof value === 'string' && SESSION_ID_PATTERN.test(value)
}

function clip(value, max) {
  return String(value || '')
    .replace(/[\u0000-\u001F\u007F]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max)
}

function localized(locale, zh, en) {
  return locale === 'zh' ? zh : en
}

export function checkoutIdempotencyKey(order) {
  return `deposit-${order.submissionId}-${order.lineId}-${order.sublineId}-${order.robotId}-q${order.quantity}-${order.locale}`.slice(0, 255)
}

function metadataFor(order, quote, robot) {
  const metadata = {
    orderKind: 'deposit',
    lineId: quote.line.id,
    sublineId: quote.subline.id,
    robotId: robot.id,
    quantity: String(quote.quantity),
    unitPriceUsd: String(quote.subline.priceUsd),
    depositCents: String(quote.depositCents),
    estimatedTotalCents: String(quote.estimatedTotalCents),
    balanceCents: String(quote.balanceCents),
    customerName: clip(order.name, 100),
    submissionId: order.submissionId
  }
  const company = clip(order.company, 160)
  const phone = clip(order.phone, 40)
  const notes = clip(order.notes, 450)
  if (company) metadata.company = company
  if (phone) metadata.phone = phone
  if (notes) metadata.notes = notes
  return metadata
}

function productName(locale, quote) {
  const line = localized(locale, quote.line.nameZh, quote.line.nameEn)
  const subline = localized(locale, quote.subline.nameZh, quote.subline.nameEn)
  const prefix = locale === 'zh' ? 'RoboWear 定金（30%）' : 'RoboWear deposit (30%)'
  return `${prefix} · ${line} · ${subline}`.slice(0, 200)
}

function productDescription(locale, quote, robot) {
  const robotName = localized(locale, robot.nameZh, robot.nameEn)
  if (locale === 'zh') {
    return `适配机型：${robotName} · 数量 ${quote.quantity} · 本次仅为定金，余款于发货前支付。定制金额可能由销售确认。`.slice(0, 400)
  }
  return `Robot: ${robotName} · Qty ${quote.quantity} · Deposit only. Balance due before shipment. Custom totals may be confirmed by sales.`.slice(0, 400)
}

function submitMessage(locale) {
  if (locale === 'zh') {
    return '本次扣款是预估总额的 30% 定金（美元），不是全款。余款需在发货前支付。定制、授权或适配费用可能由 RoboWear 销售最终确认。'
  }
  return 'This charge is a 30% deposit in USD, not the full order. The balance is due before shipment. Custom work, licensing, or fit adjustments may be confirmed by RoboWear sales.'
}

// Checkout Session parameters. payment_method_types is intentionally omitted so
// Stripe uses dynamic payment methods from the Dashboard (cards, wallets such as
// Apple Pay / Google Pay, and any local methods enabled on the account).
export function buildCheckoutSessionParams({ order, quote, robot, siteOrigin }) {
  const unitAmount = quote.subline.priceUsd * quote.depositPercent
  if (unitAmount * quote.quantity !== quote.depositCents) {
    throw new Error('Deposit unit amount does not match the server quote')
  }

  const metadata = metadataFor(order, quote, robot)
  return {
    mode: 'payment',
    customer_email: order.email,
    client_reference_id: order.submissionId,
    locale: order.locale === 'zh' ? 'zh' : 'en',
    success_url: `${siteOrigin}/order/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteOrigin}/order/cancel`,
    line_items: [
      {
        quantity: quote.quantity,
        price_data: {
          currency: 'usd',
          unit_amount: unitAmount,
          product_data: {
            name: productName(order.locale, quote),
            description: productDescription(order.locale, quote, robot)
          }
        }
      }
    ],
    metadata,
    payment_intent_data: {
      description: productName(order.locale, quote),
      metadata
    },
    custom_text: {
      submit: { message: submitMessage(order.locale) }
    }
  }
}

function strictInt(value) {
  if (typeof value !== 'string' || !/^\d{1,9}$/.test(value)) return null
  const number = Number(value)
  return Number.isSafeInteger(number) ? number : null
}

export function summarizeCheckoutSession(session) {
  if (!session || session.mode !== 'payment' || session.currency !== 'usd') return null
  if (session.metadata?.orderKind !== 'deposit') return null
  if (typeof session.amount_total !== 'number' || !Number.isInteger(session.amount_total)) return null
  if (typeof session.amount_subtotal === 'number' && session.amount_subtotal !== session.amount_total) return null

  const quantity = strictInt(session.metadata.quantity)
  if (quantity == null) return null
  const quote = quoteOrder({
    lineId: session.metadata.lineId,
    sublineId: session.metadata.sublineId,
    quantity
  })
  const robot = findRobot(session.metadata.robotId)
  if (!quote || !robot || session.amount_total !== quote.depositCents) return null

  const paymentStatus = session.payment_status || ''
  const status = session.status || ''
  let state = 'unpaid'
  if (paymentStatus === 'paid') state = 'paid'
  else if (status === 'expired') state = 'expired'
  else if (status === 'complete') state = 'processing'

  return {
    state,
    paid: state === 'paid',
    paymentStatus,
    status,
    sessionId: typeof session.id === 'string' ? session.id : '',
    lineId: quote.line.id,
    sublineId: quote.subline.id,
    robotId: robot.id,
    lineNameZh: quote.line.nameZh,
    lineNameEn: quote.line.nameEn,
    sublineNameZh: quote.subline.nameZh,
    sublineNameEn: quote.subline.nameEn,
    robotNameZh: robot.nameZh,
    robotNameEn: robot.nameEn,
    quantity: quote.quantity,
    currency: 'usd',
    unitCents: quote.unitCents,
    estimatedTotalCents: quote.estimatedTotalCents,
    depositCents: quote.depositCents,
    balanceCents: quote.balanceCents,
    depositPercent: quote.depositPercent,
    depositLabel: formatUsd(quote.depositCents),
    customerName: clip(session.metadata.customerName, 100),
    email: clip(session.customer_details?.email || session.customer_email || '', 254),
    company: clip(session.metadata.company, 160),
    phone: clip(session.metadata.phone, 40),
    notes: clip(session.metadata.notes, 450)
  }
}
