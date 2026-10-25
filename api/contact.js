import { Resend } from 'resend'
import { createHash } from 'node:crypto'

const CONTACT_TO_EMAIL = process.env.CONTACT_TO_EMAIL || 'contact@robowear.space'
const CONTACT_FROM_EMAIL = process.env.CONTACT_FROM_EMAIL || 'RoboWear Website <website@forms.robowear.space>'
const MAX_BODY_BYTES = 128_000
const INQUIRY_LABELS = {
  appearance: '外观定制 / Appearance quote', partner: '合作咨询 / Partnership',
  oem: '机器人制造商 / OEM', brand: '品牌合作 / Brand collaboration',
  creator: '创作者合作 / Creator collaboration', invest_or_codev: '投资与联合开发 / Investment & joint development'
}
const PARTNER_TYPES = ['oem', 'brand', 'creator', 'invest_or_codev']
const PRODUCT_LABELS = { roboface: 'Robo-Face · Face & head customization', robohair: 'Robo-Hair · Hair & headwear', robowear: 'Robo-Wear · Apparel Sets', accessories: 'Robo-Accessories · Functional accessories', roboskin: 'Robo-Skin · Skin cover research' }
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_PATTERN = /^[+\d][\d\s-]{6,}$/
const SUBMISSION_ID_PATTERN = /^[a-zA-Z0-9-]{16,80}$/
const SCHEME_ID_PATTERN = /^[a-zA-Z0-9-]{6,80}$/

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
function isRecord(value) { return !!value && typeof value === 'object' && !Array.isArray(value) }
function isString(value, maxLength) { return typeof value === 'string' && value.length <= maxLength }
function safeLocalPath(value, prefix) {
  return isString(value, 1000) && value.startsWith(prefix) && !value.includes('..') && !/[\\\r\n<>]/.test(value)
}
function safeReferenceImage(value) {
  return isString(value, 240) && !value.includes('..') && /^\/(images|configurator)\/[a-zA-Z0-9/_-]+\.(?:webp|png|jpe?g|svg)(?:\?v=[a-zA-Z0-9_-]+)?$/.test(value)
}
function parseBody(body) {
  if (isRecord(body)) return body
  if (typeof body === 'string') return JSON.parse(body)
  return null
}
function isSameOrigin(request) {
  const origin = request.headers.origin
  if (!origin) return true
  const forwardedHost = request.headers['x-forwarded-host']
  const requestHost = Array.isArray(forwardedHost) ? forwardedHost[0] : forwardedHost || request.headers.host
  try { return new URL(origin).host === requestHost } catch { return false }
}

export function validateScheme(body) {
  const fields = ['schemeId', 'configSnapshot', 'referenceImages', 'sourcePage', 'orderIntent']
  if (!fields.some((key) => body[key] !== undefined)) return {}
  if (!isString(body.schemeId, 80) || !SCHEME_ID_PATTERN.test(body.schemeId) || !isRecord(body.configSnapshot) || !isRecord(body.orderIntent)) return null
  const { configSnapshot } = body
  if (!isString(configSnapshot.platform, 160) || !isString(configSnapshot.useCase, 160) || !Array.isArray(configSnapshot.items) || configSnapshot.items.length > 40 || !configSnapshot.items.length) return null
  const items = []
  for (const item of configSnapshot.items) {
    if (!isRecord(item) || !['category', 'id', 'labelEn', 'labelZh', 'pricingStatus'].every((key) => isString(item[key], key.startsWith('label') ? 240 : key === 'id' ? 100 : 40))) return null
    if (!item.id || !item.category || !['included', 'add_on', 'estimate_required'].includes(item.pricingStatus)) return null
    items.push({ category: singleLineText(item.category, 40), id: singleLineText(item.id, 100), labelEn: singleLineText(item.labelEn, 240), labelZh: singleLineText(item.labelZh, 240), pricingStatus: item.pricingStatus })
  }
  if (!Array.isArray(body.referenceImages) || body.referenceImages.length > 30 || !body.referenceImages.every(safeReferenceImage)) return null
  if (!safeLocalPath(body.sourcePage, '/robofit') || !/^\/robofit(?:[?#]|$)/.test(body.sourcePage) || body.orderIntent.status !== 'quote_only') return null
  return { schemeId: body.schemeId, configSnapshot: { platform: singleLineText(configSnapshot.platform, 160), useCase: singleLineText(configSnapshot.useCase, 300), items }, referenceImages: [...body.referenceImages], sourcePage: body.sourcePage, orderIntent: { status: 'quote_only' } }
}

export function validateSubmission(body) {
  if (!isRecord(body)) return null
  const requiredLimits = { name: 100, company: 160, email: 254, phone: 40, inquiryType: 40, message: 5000, submissionId: 80 }
  const optionalLimits = { partnerType: 40, platform: 160, quantity: 80, timeline: 160, portfolio: 1000, productId: 40 }
  if (Object.entries(requiredLimits).some(([key, limit]) => !isString(body[key], limit))) return null
  if (Object.entries(optionalLimits).some(([key, limit]) => body[key] !== undefined && !isString(body[key], limit))) return null
  const submission = Object.fromEntries(Object.entries({ ...requiredLimits, ...optionalLimits }).map(([key, limit]) => [key, key === 'message' ? text(body[key], limit) : singleLineText(body[key], limit)]))
  submission.email = submission.email.toLowerCase()
  const invalid = !submission.name || !EMAIL_PATTERN.test(submission.email) || (submission.phone && !PHONE_PATTERN.test(submission.phone)) ||
    !Object.hasOwn(INQUIRY_LABELS, submission.inquiryType) || submission.message.length < 10 || !SUBMISSION_ID_PATTERN.test(submission.submissionId) ||
    (submission.inquiryType === 'partner' && !PARTNER_TYPES.includes(submission.partnerType)) || (submission.productId && !Object.hasOwn(PRODUCT_LABELS, submission.productId))
  if (invalid) return null
  if (submission.portfolio) {
    try { if (!['http:', 'https:'].includes(new URL(submission.portfolio).protocol)) return null } catch { return null }
  }
  const scheme = validateScheme(body)
  return scheme ? { ...submission, ...scheme } : null
}

export function buildReceipt(submission, now = new Date()) {
  const date = now.toISOString().slice(0, 10).replaceAll('-', '')
  const suffix = createHash('sha256').update(submission.submissionId).digest('hex').slice(0, 8).toUpperCase()
  const scheme = submission.schemeId ? { schemeId: submission.schemeId, configSnapshot: submission.configSnapshot, referenceImages: submission.referenceImages, sourcePage: submission.sourcePage, orderIntent: submission.orderIntent } : {}
  return { requestId: `RW-${date}-${suffix}`, summary: { name: submission.name, email: submission.email, inquiryType: submission.inquiryType, partnerType: submission.partnerType, message: submission.message, schemeId: submission.schemeId || null, productId: submission.productId || null }, ...scheme }
}
export function buildEmailText(submission, receipt) {
  return [
    'RoboWear 官网收到一条新咨询', '', `Request ID: ${receipt.requestId}`, `咨询类型：${INQUIRY_LABELS[submission.inquiryType]}`,
    ...(submission.inquiryType === 'partner' ? [`合作方向：${INQUIRY_LABELS[submission.partnerType]}`] : []),
    ...(submission.productId ? [`咨询产品：${PRODUCT_LABELS[submission.productId]} (${submission.productId})`] : []),
    `姓名：${submission.name}`, `公司 / 机构：${submission.company || '未填写'}`, `邮箱：${submission.email}`, `电话：${submission.phone || '未填写'}`,
    `机型与版本：${submission.platform || '未填写'}`, `预计数量：${submission.quantity || '未填写'}`, `时间安排：${submission.timeline || '未填写'}`, `作品链接：${submission.portfolio || '未填写'}`,
    '', '留言内容：', submission.message,
    ...(submission.schemeId ? ['', 'RoboFit look:', `schemeId: ${submission.schemeId}`, `configSnapshot: ${JSON.stringify(submission.configSnapshot)}`, `referenceImages: ${JSON.stringify(submission.referenceImages)}`, `sourcePage: ${submission.sourcePage}`, `orderIntent: ${JSON.stringify(submission.orderIntent)}`] : []),
    '', `提交时间：${new Date().toISOString()}`, `提交编号：${submission.submissionId}`, '', '直接回复此邮件即可回复访客。'
  ].join('\n')
}

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST')
    return sendJson(response, 405, { ok: false, message: 'Method not allowed' })
  }
  if (Number(request.headers['content-length'] || 0) > MAX_BODY_BYTES) return sendJson(response, 413, { ok: false, message: 'Request too large' })
  if (!isSameOrigin(request)) return sendJson(response, 403, { ok: false, message: 'Invalid request origin' })
  let body
  try { body = parseBody(request.body) } catch { return sendJson(response, 400, { ok: false, message: 'Invalid JSON body' }) }
  if (!isRecord(body)) return sendJson(response, 400, { ok: false, message: 'Invalid form submission' })
  if (Buffer.byteLength(JSON.stringify(body), 'utf8') > MAX_BODY_BYTES) return sendJson(response, 413, { ok: false, message: 'Request too large' })
  // The honeypot is never filled by visitors and does not trigger email delivery.
  if (text(body.contactWebsite, 200)) return sendJson(response, 200, { ok: true })
  const submission = validateSubmission(body)
  if (!submission) return sendJson(response, 400, { ok: false, message: 'Invalid form submission' })
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return sendJson(response, 503, { ok: false, message: 'Email service is not configured' })
  const receipt = buildReceipt(submission)
  try {
    const resend = new Resend(apiKey)
    const { data, error } = await resend.emails.send({ from: CONTACT_FROM_EMAIL, to: CONTACT_TO_EMAIL, replyTo: submission.email, subject: `【RoboWear】${receipt.requestId}｜${INQUIRY_LABELS[submission.inquiryType]}｜${submission.name}`, text: buildEmailText(submission, receipt) }, { idempotencyKey: `contact-${submission.submissionId}` })
    if (error || !data?.id) {
      console.error('Contact form delivery failed', { name: error?.name || 'MissingDeliveryId' })
      return sendJson(response, 502, { ok: false, message: 'Email delivery failed' })
    }
    return sendJson(response, 200, { ok: true, ...receipt })
  } catch (error) {
    console.error('Contact form delivery failed', { name: error instanceof Error ? error.name : 'UnknownError' })
    return sendJson(response, 502, { ok: false, message: 'Email delivery failed' })
  }
}
