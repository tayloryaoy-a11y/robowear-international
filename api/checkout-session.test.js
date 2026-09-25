import test from 'node:test'
import assert from 'node:assert/strict'
import handler from './checkout-session.js'

function mockResponse() {
  return {
    statusCode: 0,
    headers: {},
    body: null,
    setHeader(key, value) {
      this.headers[key] = value
    },
    status(code) {
      this.statusCode = code
      return this
    },
    json(payload) {
      this.body = payload
      return this
    }
  }
}

test('verification fails clearly when Stripe is not configured', async () => {
  const previous = process.env.STRIPE_SECRET_KEY
  delete process.env.STRIPE_SECRET_KEY
  const response = mockResponse()
  try {
    await handler(
      {
        method: 'GET',
        headers: { host: 'www.robowear.space' },
        query: { session_id: 'cs_test_12345678abcd' },
        url: '/api/checkout-session?session_id=cs_test_12345678abcd'
      },
      response
    )
  } finally {
    if (previous === undefined) delete process.env.STRIPE_SECRET_KEY
    else process.env.STRIPE_SECRET_KEY = previous
  }
  assert.equal(response.statusCode, 503)
  assert.equal(response.body.code, 'payments_not_configured')
})

test('verification rejects a malformed session id before calling Stripe', async () => {
  const previous = process.env.STRIPE_SECRET_KEY
  process.env.STRIPE_SECRET_KEY = 'sk_test_dummy'
  const response = mockResponse()
  try {
    await handler(
      {
        method: 'GET',
        headers: { host: 'localhost:3000', origin: 'http://localhost:3000' },
        query: { session_id: 'sess_not_stripe' }
      },
      response
    )
  } finally {
    if (previous === undefined) delete process.env.STRIPE_SECRET_KEY
    else process.env.STRIPE_SECRET_KEY = previous
  }
  assert.equal(response.statusCode, 400)
  assert.equal(response.body.code, 'invalid_session')
})
