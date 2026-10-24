function readOrigin(value) {
  if (typeof value !== 'string') return ''
  const trimmed = value.trim().replace(/\/+$/, '')
  if (!trimmed) return ''

  let url
  try {
    url = new URL(trimmed)
  } catch {
    return ''
  }

  if (url.username || url.password || url.search || url.hash) return ''
  if (url.pathname !== '/' && url.pathname !== '') return ''
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return ''

  const local = url.hostname === 'localhost' || url.hostname === '127.0.0.1'
  if (url.protocol === 'http:' && !local) return ''
  return url.origin
}

export function resolveSiteOrigin(env = process.env) {
  return readOrigin(env.SITE_URL) || readOrigin(env.VITE_SITE_URL) || ''
}
