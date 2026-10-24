import test from 'node:test'
import assert from 'node:assert/strict'
import handler from './checkout.js'

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

const validBody = {
  name: 'Ada Lovelace',
  company: '',
  email: 'buyer@example.com',
  phone: '',
  notes: '',
  submissionId: '123e4567-e89b-12d3-a456-426614174000',
  lineId: 'robowear',
  sublineId: 'home',
  robotId: 'optimus',
  quantity: 1,
  locale: 'en',
  depositCents: 1
}

function assignEnv(name, value) {
  if (typeof value === 'string') process.env[name] = value
  else delete process.env[name]
}

async function post(body, env, headers = {}) {
  const previous = {
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    SITE_URL: process.env.SITE_URL,
    VITE_SITE_URL: process.env.VITE_SITE_URL
  }
  assignEnv('STRIPE_SECRET_KEY', env.STRIPE_SECRET_KEY)
  assignEnv('SITE_URL', env.SITE_URL)
  assignEnv('VITE_SITE_URL', env.VITE_SITE_URL)
  const response = mockResponse()
  try {
    await handler(
      {
        method: 'POST',
        headers: { host: 'www.robowear.space', origin: 'https://www.robowear.space', ...headers },
        body
      },
      response
    )
    return response
  } finally {
    assignEnv('STRIPE_SECRET_KEY', previous.STRIPE_SECRET_KEY)
    assignEnv('SITE_URL', previous.SITE_URL)
    assignEnv('VITE_SITE_URL', previous.VITE_SITE_URL)
  }
}

test('checkout rejects non-POST and cross-origin requests', async () => {
  const response = mockResponse()
  await handler({ method: 'GET', headers: {} }, response)
  assert.equal(response.statusCode, 405)

  const forbidden = await post(validBody, {}, { origin: 'https://evil.example', host: 'www.robowear.space' })
  assert.equal(forbidden.statusCode, 403)
})

test('checkout does not treat a missing Stripe key as success', async () => {
  const response = await post(validBody, { STRIPE_SECRET_KEY: '   ', SITE_URL: 'https://www.robowear.space' })
  assert.equal(response.statusCode, 503)
  assert.equal(response.body.ok, false)
  assert.equal(response.body.code, 'payments_not_configured')
  assert.equal(response.body.url, undefined)
})

test('checkout reports a missing site URL before calling Stripe', async () => {
  const response = await post(validBody, { STRIPE_SECRET_KEY: 'sk_test_dummy', SITE_URL: '' })
  assert.equal(response.statusCode, 503)
  assert.equal(response.body.code, 'site_url_missing')
})

test('checkout rejects a client-supplied total that is not an allowlisted order', async () => {
  const response = await post(
    { ...validBody, sublineId: 'free', depositCents: 50 },
    { STRIPE_SECRET_KEY: 'sk_test_dummy', SITE_URL: 'https://www.robowear.space' }
  )
  assert.equal(response.statusCode, 400)
  assert.equal(response.body.code, 'invalid_order')
})

test('a honeypot submission does not create a checkout URL', async () => {
  const response = await post({ ...validBody, orderWebsite: 'https://spam.example' }, {})
  assert.equal(response.statusCode, 200)
  assert.equal(response.body.ok, true)
  assert.equal(response.body.url, undefined)
})
