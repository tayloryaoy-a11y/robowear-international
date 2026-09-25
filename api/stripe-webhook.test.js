import test from 'node:test'
import assert from 'node:assert/strict'
import handler from './stripe-webhook.js'

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

function restore(name, previous) {
  if (previous === undefined) delete process.env[name]
  else process.env[name] = previous
}

test('webhook reports missing configuration instead of accepting the event', async () => {
  const previousKey = process.env.STRIPE_SECRET_KEY
  const previousSecret = process.env.STRIPE_WEBHOOK_SECRET
  delete process.env.STRIPE_SECRET_KEY
  delete process.env.STRIPE_WEBHOOK_SECRET
  const response = mockResponse()
  try {
    await handler({ method: 'POST', headers: {}, body: '{}' }, response)
  } finally {
    restore('STRIPE_SECRET_KEY', previousKey)
    restore('STRIPE_WEBHOOK_SECRET', previousSecret)
  }
  assert.equal(response.statusCode, 503)
  assert.equal(response.body.code, 'webhook_not_configured')
})

test('webhook rejects a body whose signature does not verify', async () => {
  const previousKey = process.env.STRIPE_SECRET_KEY
  const previousSecret = process.env.STRIPE_WEBHOOK_SECRET
  process.env.STRIPE_SECRET_KEY = 'sk_test_dummy'
  process.env.STRIPE_WEBHOOK_SECRET = 'whsec_dummy'
  const response = mockResponse()
  try {
    await handler(
      {
        method: 'POST',
        headers: { 'stripe-signature': 't=1,v1=deadbeef' },
        body: '{"type":"checkout.session.completed"}'
      },
      response
    )
  } finally {
    restore('STRIPE_SECRET_KEY', previousKey)
    restore('STRIPE_WEBHOOK_SECRET', previousSecret)
  }
  assert.equal(response.statusCode, 400)
  assert.equal(response.body.code, 'invalid_signature')
})
