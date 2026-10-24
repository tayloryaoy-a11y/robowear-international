import test from 'node:test'
import assert from 'node:assert/strict'
import {
  DEPOSIT_PERCENT,
  MAX_QUANTITY,
  PRODUCT_LINES,
  formatUsd,
  initialSelection,
  isStripeCheckoutUrl,
  priceDeposit,
  quoteOrder
} from './orderCatalog.js'

test('every allowlisted estimate splits into a 30% deposit and a balance', () => {
  for (const line of PRODUCT_LINES) {
    for (const subline of line.sublines) {
      for (let quantity = 1; quantity <= MAX_QUANTITY; quantity += 1) {
        const quote = quoteOrder({ lineId: line.id, sublineId: subline.id, quantity })
        assert.ok(quote)
        assert.equal(quote.depositPercent, DEPOSIT_PERCENT)
        assert.equal(quote.depositCents + quote.balanceCents, quote.estimatedTotalCents)
        assert.equal(quote.depositCents, subline.priceUsd * quantity * DEPOSIT_PERCENT)
        assert.equal(quote.currency, 'usd')
      }
    }
  }
})

test('quote rejects unknown products and out-of-range quantities', () => {
  assert.equal(quoteOrder({ lineId: 'roboskin', sublineId: 'nope', quantity: 1 }), null)
  assert.equal(quoteOrder({ lineId: 'missing', sublineId: 'standard', quantity: 1 }), null)
  assert.equal(quoteOrder({ lineId: 'roboskin', sublineId: 'standard', quantity: 0 }), null)
  assert.equal(quoteOrder({ lineId: 'roboskin', sublineId: 'standard', quantity: MAX_QUANTITY + 1 }), null)
  assert.equal(quoteOrder({ lineId: 'roboskin', sublineId: 'standard', quantity: 1.5 }), null)
})

test('deposit below the Stripe minimum is rejected', () => {
  assert.equal(priceDeposit(1, 1), null)
  assert.equal(priceDeposit(2, 1)?.depositCents, 60)
})

test('formatUsd shows USD with cents', () => {
  assert.equal(formatUsd(150000), '$1,500.00')
  assert.equal(formatUsd(5970), '$59.70')
  assert.equal(formatUsd(89), '$0.89')
})

test('only hosted Stripe Checkout URLs are accepted', () => {
  assert.equal(isStripeCheckoutUrl('https://checkout.stripe.com/c/pay/cs_test_123'), true)
  assert.equal(isStripeCheckoutUrl('https://evil.example/checkout.stripe.com'), false)
  assert.equal(isStripeCheckoutUrl('http://checkout.stripe.com/c/pay/cs_test_123'), false)
  assert.equal(isStripeCheckoutUrl('https://checkout.stripe.com.evil.example/pay'), false)
})

test('query selection falls back to the first allowlisted option', () => {
  const params = new URLSearchParams('line=robowear&sub=couture&robot=figure-03')
  assert.deepEqual(initialSelection(params), {
    lineId: 'robowear',
    sublineId: 'couture',
    robotId: 'figure-03'
  })
  assert.equal(initialSelection(new URLSearchParams('line=nope')).lineId, 'roboskin')
  assert.equal(initialSelection(new URLSearchParams('line=roboface&sub=nope')).sublineId, 'tech-minimal')
})
