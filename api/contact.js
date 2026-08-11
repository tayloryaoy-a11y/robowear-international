import { Resend } from 'resend'

const CONTACT_TO_EMAIL = process.env.CONTACT_TO_EMAIL || 'tayloryaoy@gmail.com'
const CONTACT_FROM_EMAIL = process.env.CONTACT_FROM_EMAIL || 'RoboWear Website <website@forms.robowear.space>'
const MAX_BODY_BYTES = 20_000

const INQUIRY_LABELS = {
  general: '一般咨询 / General inquiry',
  wholesale: '批发采购 / Wholesale & bulk orders',
  partnership: '商务合作 / Brand partnerships',
  designer: '设计师入驻 / Designer program',
  press: '媒体采访 / Press & media'
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_PATTERN = /^[+\d][\d\s-]{6,}$/
const SUBMISSION_ID_PATTERN = /^[a-zA-Z0-9-]{16,80}$/

function sendJson(response, status, payload) {
  response.setHeader('Cache-Control', 'no-store')
  return response.status(status).json(payload)
}

function text(value, maxLength) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : ''
}

function singleLineText(value, maxLength) {
  return text(value, maxLength).replace(/[\r\n]+/g, ' ')
}

function parseBody(body) {
  if (body && typeof body === 'object') return body
  if (typeof body === 'string') return JSON.parse(body)
  return {}
}

function isSameOrigin(request) {
  const origin = request.headers.origin
  if (!origin) return true

  const forwardedHost = request.headers['x-forwarded-host']
  const requestHost = Array.isArray(forwardedHost) ? forwardedHost[0] : forwardedHost || request.headers.host

  try {
    return new URL(origin).host === requestHost
  } catch {
    return false
  }
}

function validateSubmission(body) {
  const lengthLimits = {
    name: 100,
    company: 160,
    email: 254,
    phone: 40,
    inquiryType: 40,
    message: 5000,
    submissionId: 80
  }
  const hasInvalidFieldType = Object.keys(lengthLimits).some(
    (key) => typeof body[key] !== 'string' || body[key].length > lengthLimits[key]
  )
  if (hasInvalidFieldType) return null

  const submission = {
    name: singleLineText(body.name, 100),
    company: singleLineText(body.company, 160),
    email: singleLineText(body.email, 254).toLowerCase(),
    phone: singleLineText(body.phone, 40),
    inquiryType: singleLineText(body.inquiryType, 40),
    message: text(body.message, 5000),
    submissionId: singleLineText(body.submissionId, 80)
  }

  const invalid =
    !submission.name ||
    !EMAIL_PATTERN.test(submission.email) ||
    (submission.phone && !PHONE_PATTERN.test(submission.phone)) ||
    !INQUIRY_LABELS[submission.inquiryType] ||
    submission.message.length < 10 ||
    !SUBMISSION_ID_PATTERN.test(submission.submissionId)

  return invalid ? null : submission
}

function buildEmailText(submission) {
  const submittedAt = new Date().toISOString()

  return [
    'RoboWear 官网收到一条新咨询',
    '',
    `咨询类型：${INQUIRY_LABELS[submission.inquiryType]}`,
    `姓名：${submission.name}`,
    `公司 / 机构：${submission.company || '未填写'}`,
    `邮箱：${submission.email}`,
    `电话：${submission.phone || '未填写'}`,
    '',
    '留言内容：',
    submission.message,
    '',
    `提交时间：${submittedAt}`,
    `提交编号：${submission.submissionId}`,
    '',
    '直接回复此邮件即可回复访客。'
  ].join('\n')
}

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST')
    return sendJson(response, 405, { ok: false, message: 'Method not allowed' })
  }

  const contentLength = Number(request.headers['content-length'] || 0)
  if (contentLength > MAX_BODY_BYTES) {
    return sendJson(response, 413, { ok: false, message: 'Request too large' })
  }

  if (!isSameOrigin(request)) {
    return sendJson(response, 403, { ok: false, message: 'Invalid request origin' })
  }

  let body
  try {
    body = parseBody(request.body)
  } catch {
    return sendJson(response, 400, { ok: false, message: 'Invalid JSON body' })
  }

  // Legitimate users never fill this off-screen field. Return a quiet success to bots.
  if (text(body.contactWebsite, 200)) {
    return sendJson(response, 200, { ok: true })
  }

  const submission = validateSubmission(body)
  if (!submission) {
    return sendJson(response, 400, { ok: false, message: 'Invalid form submission' })
  }

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.error('Contact form email delivery is not configured')
    return sendJson(response, 503, { ok: false, message: 'Email service is not configured' })
  }

  const resend = new Resend(apiKey)
  const inquiryLabel = INQUIRY_LABELS[submission.inquiryType]

  try {
    const { data, error } = await resend.emails.send(
      {
        from: CONTACT_FROM_EMAIL,
        to: CONTACT_TO_EMAIL,
        replyTo: submission.email,
        subject: `【RoboWear 官网咨询】${inquiryLabel}｜${submission.name}`,
        text: buildEmailText(submission)
      },
      { idempotencyKey: `contact-${submission.submissionId}` }
    )

    if (error) {
      console.error('Contact form email delivery failed', {
        name: error.name,
        message: error.message
      })
      return sendJson(response, 502, { ok: false, message: 'Email delivery failed' })
    }

    return sendJson(response, 200, { ok: true, id: data?.id })
  } catch (error) {
    console.error('Contact form email delivery failed unexpectedly', {
      name: error instanceof Error ? error.name : 'UnknownError',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
    return sendJson(response, 502, { ok: false, message: 'Email delivery failed' })
  }
}
