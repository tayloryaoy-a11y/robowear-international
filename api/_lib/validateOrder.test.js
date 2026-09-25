import test from 'node:test'
import assert from 'node:assert/strict'
import { validateOrderBody } from './validateOrder.js'

const valid = {
  name: 'Ada Lovelace',
  company: 'Analytical Engines',
  email: 'Ada@Example.com',
  phone: '+1 415 555 0134',
  notes: 'Please confirm the fit for Optimus.',
  submissionId: '123e4567-e89b-12d3-a456-426614174000',
  lineId: 'robowear',
  sublineId: 'home',
  robotId: 'optimus',
  quantity: 2,
  locale: 'zh'
}

test('accepts a complete order and normalizes email', () => {
  const order = validateOrderBody(valid)
  assert.equal(order.email, 'ada@example.com')
  assert.equal(order.locale, 'zh')
  assert.equal(order.quantity, 2)
})

test('rejects client totals that are not part of the allowlist and bad contacts', () => {
  assert.equal(validateOrderBody({ ...valid, lineId: 'robowear', sublineId: 'not-a-sku', depositCents: 50 }), null)
  assert.equal(validateOrderBody({ ...valid, email: 'not-an-email' }), null)
  assert.equal(validateOrderBody({ ...valid, phone: '123' }), null)
  assert.equal(validateOrderBody({ ...valid, quantity: '2' }), null)
  assert.equal(validateOrderBody({ ...valid, robotId: 'boston-dynamics' }), null)
  assert.equal(validateOrderBody({ ...valid, name: '   ' }), null)
  assert.equal(validateOrderBody({ ...valid, locale: 'fr' }), null)
})

test('phone, company, and notes may be empty', () => {
  const order = validateOrderBody({ ...valid, phone: '', company: '', notes: '', locale: '' })
  assert.equal(order.phone, '')
  assert.equal(order.company, '')
  assert.equal(order.notes, '')
  assert.equal(order.locale, 'en')
})
