import { findRobot, findSubline, MAX_QUANTITY } from '../../shared/orderCatalog.js'
import { singleLineText, text } from './http.js'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_PATTERN = /^[+\d][\d\s-]{6,}$/
const SUBMISSION_ID_PATTERN = /^[a-zA-Z0-9-]{16,80}$/
const ID_PATTERN = /^[a-z0-9-]{1,40}$/

function requiredId(value) {
  if (typeof value !== 'string' || value.length > 40 || !ID_PATTERN.test(value)) return ''
  return value
}

export function validateOrderBody(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return null

  const lengthLimits = {
    name: 100,
    company: 160,
    email: 254,
    phone: 40,
    notes: 2000,
    submissionId: 80,
    lineId: 40,
    sublineId: 40,
    robotId: 40,
    locale: 8
  }

  const hasInvalidFieldType = Object.entries(lengthLimits).some(([key, max]) => {
    if (key === 'locale' && (body.locale === undefined || body.locale === '')) return false
    return typeof body[key] !== 'string' || body[key].length > max
  })
  if (hasInvalidFieldType) return null
  if (typeof body.quantity !== 'number' || !Number.isInteger(body.quantity)) return null

  const locale = body.locale === 'zh' ? 'zh' : body.locale === 'en' || body.locale === undefined || body.locale === '' ? 'en' : ''
  const lineId = requiredId(body.lineId)
  const sublineId = requiredId(body.sublineId)
  const robotId = requiredId(body.robotId)
  const order = {
    name: singleLineText(body.name, 100),
    company: singleLineText(body.company, 160),
    email: singleLineText(body.email, 254).toLowerCase(),
    phone: singleLineText(body.phone, 40),
    notes: text(body.notes, 2000),
    submissionId: singleLineText(body.submissionId, 80),
    lineId,
    sublineId,
    robotId,
    quantity: body.quantity,
    locale
  }

  const invalid =
    !order.name ||
    !EMAIL_PATTERN.test(order.email) ||
    (order.phone && !PHONE_PATTERN.test(order.phone)) ||
    !SUBMISSION_ID_PATTERN.test(order.submissionId) ||
    !locale ||
    order.quantity < 1 ||
    order.quantity > MAX_QUANTITY ||
    !findSubline(order.lineId, order.sublineId) ||
    !findRobot(order.robotId)

  return invalid ? null : order
}
