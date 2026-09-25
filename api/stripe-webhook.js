import Stripe from 'stripe'
import { Resend } from 'resend'
import { buildDepositEmail, depositEmailTarget } from './_lib/depositEmail.js'
import { sendJson } from './_lib/http.js'
import { summarizeCheckoutSession } from './_lib/stripeOrder.js'

const MAX_BODY_BYTES = 1_000_000

// Stripe signs the raw request bytes. Leave the body unparsed.
export const config = {
  api: {
    bodyParser: false
  }
}

function readRawBody(request) {
  if (Buffer.isBuffer(request.body)) return Promise.resolve(request.body)
  if (typeof request.body === 'string') return Promise.resolve(Buffer.from(request.body))
  if (request.body && typeof request.body === 'object') {
    return Promise.reject(new Error('PARSED_BODY'))
  }

  return new Promise((resolve, reject) => {
    const chunks = []
    let size = 0
    request.on('data', (chunk) => {
      const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)
      size += buffer.length
      if (size > MAX_BODY_BYTES) {
        reject(new Error('TOO_LARGE'))
        request.destroy()
        return
      }
      chunks.push(buffer)
    })
    request.on('end', () => resolve(Buffer.concat(chunks)))
    request.on('error', reject)
  })
}

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST')
    return sendJson(response, 405, { ok: false, code: 'method_not_allowed' })
  }

  const secretKey = typeof process.env.STRIPE_SECRET_KEY === 'string' ? process.env.STRIPE_SECRET_KEY.trim() : ''
  const webhookSecret = typeof process.env.STRIPE_WEBHOOK_SECRET === 'string' ? process.env.STRIPE_WEBHOOK_SECRET.trim() : ''
  if (!secretKey || !webhookSecret) {
    console.error('Stripe webhook is not configured')
    return sendJson(response, 503, { ok: false, code: 'webhook_not_configured' })
  }

  const signature = request.headers['stripe-signature']
  if (typeof signature !== 'string' || !signature.trim()) {
    return sendJson(response, 400, { ok: false, code: 'invalid_signature' })
  }

  let rawBody
  try {
    rawBody = await readRawBody(request)
  } catch (error) {
    console.error('Stripe webhook body unavailable', error instanceof Error ? error.message : 'unknown')
    return sendJson(response, 400, { ok: false, code: 'invalid_body' })
  }

  let event
  try {
    const stripe = new Stripe(secretKey)
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret)
  } catch (error) {
    console.error('Stripe webhook signature failed', error instanceof Error ? error.message : 'unknown')
    return sendJson(response, 400, { ok: false, code: 'invalid_signature' })
  }

  if (event.type !== 'checkout.session.completed' && event.type !== 'checkout.session.async_payment_succeeded') {
    return sendJson(response, 200, { ok: true, ignored: true })
  }

  const session = event.data?.object
  if (!session || session.metadata?.orderKind !== 'deposit') {
    return sendJson(response, 200, { ok: true, ignored: true })
  }

  if (session.payment_status !== 'paid') {
    return sendJson(response, 200, { ok: true, pending: true })
  }

  const summary = summarizeCheckoutSession(session)
  if (!summary || !summary.paid) {
    console.error('Paid deposit session failed catalog check', { id: session?.id || '' })
    return sendJson(response, 200, { ok: true, emailed: false, code: 'amount_mismatch' })
  }

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.error('Deposit paid but email delivery is not configured', { id: summary.sessionId })
    return sendJson(response, 200, { ok: true, emailed: false })
  }

  const { to, from } = depositEmailTarget()
  const email = buildDepositEmail(summary)
  const resend = new Resend(apiKey)
  const message = {
    from,
    to,
    subject: email.subject,
    text: email.text
  }
  if (summary.email) message.replyTo = summary.email

  try {
    const { error } = await resend.emails.send(message, { idempotencyKey: `deposit-${event.id}` })

    if (error) {
      console.error('Deposit email delivery failed', { name: error.name, message: error.message })
      return sendJson(response, 502, { ok: false, code: 'email_failed' })
    }

    return sendJson(response, 200, { ok: true, emailed: true })
  } catch (error) {
    console.error('Deposit email delivery failed unexpectedly', {
      name: error instanceof Error ? error.name : 'UnknownError',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
    return sendJson(response, 502, { ok: false, code: 'email_failed' })
  }
}
