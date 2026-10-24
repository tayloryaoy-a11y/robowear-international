import Stripe from 'stripe'
import { isSameOrigin, queryParam, sendJson } from './_lib/http.js'
import { isCheckoutSessionId, summarizeCheckoutSession } from './_lib/stripeOrder.js'

export default async function handler(request, response) {
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET')
    return sendJson(response, 405, { ok: false, code: 'method_not_allowed' })
  }

  if (!isSameOrigin(request)) {
    return sendJson(response, 403, { ok: false, code: 'invalid_origin' })
  }

  const secretKey = typeof process.env.STRIPE_SECRET_KEY === 'string' ? process.env.STRIPE_SECRET_KEY.trim() : ''
  if (!secretKey) {
    console.error('Stripe checkout verification is not configured')
    return sendJson(response, 503, { ok: false, code: 'payments_not_configured' })
  }

  const sessionId = queryParam(request, 'session_id')
  if (!isCheckoutSessionId(sessionId)) {
    return sendJson(response, 400, { ok: false, code: 'invalid_session' })
  }

  try {
    const stripe = new Stripe(secretKey)
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    const summary = summarizeCheckoutSession(session)
    if (!summary) {
      return sendJson(response, 409, { ok: false, code: 'amount_mismatch' })
    }
    return sendJson(response, 200, { ok: true, ...summary })
  } catch (error) {
    const code = error && typeof error === 'object' ? error.code : ''
    const statusCode = error && typeof error === 'object' ? error.statusCode : 0
    console.error('Stripe checkout verification failed', {
      code: code || 'UnknownError',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
    if (code === 'resource_missing' || statusCode === 404) {
      return sendJson(response, 404, { ok: false, code: 'session_not_found' })
    }
    return sendJson(response, 502, { ok: false, code: 'stripe_error' })
  }
}
