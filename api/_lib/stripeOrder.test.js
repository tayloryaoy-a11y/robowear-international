import test from 'node:test'
import assert from 'node:assert/strict'
import { findRobot, quoteOrder } from '../../shared/orderCatalog.js'
import { buildCheckoutSessionParams, checkoutIdempotencyKey, summarizeCheckoutSession } from './stripeOrder.js'

const order = {
  name: 'Ada Lovelace',
  company: 'Analytical Engines',
  email: 'buyer@example.com',
  phone: '+14155550100',
  notes: 'Leave the charging port clear.',
  submissionId: '123e4567-e89b-12d3-a456-426614174000',
  lineId: 'roboskin',
  sublineId: 'standard',
  robotId: 'figure-03',
  quantity: 2,
  locale: 'en',
  depositCents: 1,
  amount: 1
}

function sessionFor(quote, overrides = {}) {
  return {
    id: 'cs_test_12345678abcd',
    mode: 'payment',
    currency: 'usd',
    amount_subtotal: quote.depositCents,
    amount_total: quote.depositCents,
    payment_status: 'paid',
    status: 'complete',
    customer_email: 'buyer@example.com',
    customer_details: { email: 'buyer@example.com' },
    metadata: {
      orderKind: 'deposit',
      lineId: quote.line.id,
      sublineId: quote.subline.id,
      robotId: 'figure-03',
      quantity: String(quote.quantity),
      customerName: 'Ada Lovelace'
    },
    ...overrides
  }
}

test('checkout params charge the server deposit and leave payment methods to Stripe', () => {
  const quote = quoteOrder(order)
  const robot = findRobot(order.robotId)
  const params = buildCheckoutSessionParams({
    order,
    quote,
    robot,
    siteOrigin: 'https://www.robowear.space'
  })

  assert.equal(Object.hasOwn(params, 'payment_method_types'), false)
  assert.equal(Object.hasOwn(params, 'automatic_payment_methods'), false)
  assert.equal(params.line_items[0].price_data.unit_amount * params.line_items[0].quantity, quote.depositCents)
  assert.equal(params.line_items[0].price_data.unit_amount, 45_000)
  assert.equal(params.line_items[0].price_data.currency, 'usd')
  assert.equal(params.success_url, 'https://www.robowear.space/order/success?session_id={CHECKOUT_SESSION_ID}')
  assert.equal(params.cancel_url, 'https://www.robowear.space/order/cancel')
  assert.equal(params.metadata.depositCents, String(quote.depositCents))
  assert.equal(params.metadata.unitPriceUsd, '1500')
  assert.match(params.line_items[0].price_data.product_data.name, /deposit \(30%\)/i)
  assert.ok(checkoutIdempotencyKey(order).length <= 255)
})

test('Chinese checkout names the charge as a deposit', () => {
  const quote = quoteOrder(order)
  const params = buildCheckoutSessionParams({
    order: { ...order, locale: 'zh' },
    quote,
    robot: findRobot(order.robotId),
    siteOrigin: 'https://www.robowear.space'
  })
  assert.match(params.line_items[0].price_data.product_data.name, /定金/)
  assert.equal(params.locale, 'zh')
})

test('a paid session is confirmed only when Stripe collected the catalog deposit', () => {
  const quote = quoteOrder(order)
  const summary = summarizeCheckoutSession(sessionFor(quote))
  assert.equal(summary.paid, true)
  assert.equal(summary.state, 'paid')
  assert.equal(summary.depositCents, quote.depositCents)
  assert.equal(summary.balanceCents, quote.balanceCents)
  assert.equal(summary.lineNameEn, 'Robo-Skin™')

  assert.equal(summarizeCheckoutSession(sessionFor(quote, { amount_total: 100, amount_subtotal: 100 })), null)
  assert.equal(summarizeCheckoutSession(sessionFor(quote, { currency: 'eur' })), null)
  assert.equal(
    summarizeCheckoutSession(sessionFor(quote, { metadata: { ...sessionFor(quote).metadata, lineId: 'free' } })),
    null
  )

  const unpaid = summarizeCheckoutSession(sessionFor(quote, { payment_status: 'unpaid', status: 'open' }))
  assert.equal(unpaid.paid, false)
  assert.equal(unpaid.state, 'unpaid')
})
