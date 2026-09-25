import Stripe from 'stripe'
import { findRobot, isStripeCheckoutUrl, quoteOrder } from '../shared/orderCatalog.js'
import { isSameOrigin, parseBody, sendJson, text } from './_lib/http.js'
import { resolveSiteOrigin } from './_lib/siteUrl.js'
import { buildCheckoutSessionParams, checkoutIdempotencyKey } from './_lib/stripeOrder.js'
import { validateOrderBody } from './_lib/validateOrder.js'

const MAX_BODY_BYTES = 20_000

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST')
    return sendJson(response, 405, { ok: false, code: 'method_not_allowed' })
  }

  const contentLength = Number(request.headers['content-length'] || 0)
  if (contentLength > MAX_BODY_BYTES) {
    return sendJson(response, 413, { ok: false, code: 'request_too_large' })
  }

  if (!isSameOrigin(request)) {
    return sendJson(response, 403, { ok: false, code: 'invalid_origin' })
  }

  let body
  try {
    body = parseBody(request.body)
  } catch {
    return sendJson(response, 400, { ok: false, code: 'invalid_json' })
  }

  if (text(body.orderWebsite, 200)) {
    return sendJson(response, 200, { ok: true })
  }

  const order = validateOrderBody(body)
  const quote = order ? quoteOrder(order) : null
  const robot = order ? findRobot(order.robotId) : null
  if (!order || !quote || !robot) {
    return sendJson(response, 400, { ok: false, code: 'invalid_order' })
  }

  const secretKey = typeof process.env.STRIPE_SECRET_KEY === 'string' ? process.env.STRIPE_SECRET_KEY.trim() : ''
  if (!secretKey) {
    console.error('Stripe checkout is not configured')
    return sendJson(response, 503, { ok: false, code: 'payments_not_configured' })
  }

  const siteOrigin = resolveSiteOrigin()
  if (!siteOrigin) {
    console.error('Stripe return URL is not configured')
    return sendJson(response, 503, { ok: false, code: 'site_url_missing' })
  }

  let params
  try {
    params = buildCheckoutSessionParams({ order, quote, robot, siteOrigin })
  } catch (error) {
    console.error('Stripe checkout quote failed', error instanceof Error ? error.message : 'unknown')
    return sendJson(response, 500, { ok: false, code: 'stripe_error' })
  }

  try {
    const stripe = new Stripe(secretKey)
    const session = await stripe.checkout.sessions.create(params, {
      idempotencyKey: checkoutIdempotencyKey(order)
    })

    if (!isStripeCheckoutUrl(session?.url)) {
      console.error('Stripe checkout returned an unexpected URL')
      return sendJson(response, 502, { ok: false, code: 'stripe_error' })
    }

    return sendJson(response, 200, { ok: true, url: session.url })
  } catch (error) {
    const type = error && typeof error === 'object' ? error.type : ''
    console.error('Stripe checkout session failed', {
      type: type || 'UnknownError',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
    if (type === 'StripeAuthenticationError' || type === 'StripePermissionError') {
      return sendJson(response, 503, { ok: false, code: 'payments_not_configured' })
    }
    return sendJson(response, 502, { ok: false, code: 'stripe_error' })
  }
}
