export function sendJson(response, status, payload) {
  response.setHeader('Cache-Control', 'no-store')
  return response.status(status).json(payload)
}

export function text(value, maxLength) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : ''
}

export function singleLineText(value, maxLength) {
  return text(value, maxLength).replace(/[\u0000-\u001F\u007F]+/g, ' ').replace(/\s+/g, ' ').trim()
}

export function parseBody(body) {
  if (body && typeof body === 'object') return body
  if (typeof body === 'string') return JSON.parse(body)
  return {}
}

export function isSameOrigin(request) {
  const origin = request.headers.origin || request.headers.Origin
  if (!origin) return true

  const forwardedHost = request.headers['x-forwarded-host']
  const requestHost = Array.isArray(forwardedHost) ? forwardedHost[0] : forwardedHost || request.headers.host

  try {
    return new URL(origin).host === requestHost
  } catch {
    return false
  }
}

export function queryParam(request, key) {
  const fromQuery = request.query?.[key]
  const value = Array.isArray(fromQuery) ? fromQuery[0] : fromQuery
  if (typeof value === 'string') return value

  try {
    const host = request.headers.host || 'localhost'
    const url = new URL(request.url || '/', `http://${host}`)
    return url.searchParams.get(key) || ''
  } catch {
    return ''
  }
}
