import test from 'node:test'
import assert from 'node:assert/strict'
import { resolveSiteOrigin } from './siteUrl.js'

test('SITE_URL is preferred and must be an origin', () => {
  assert.equal(
    resolveSiteOrigin({ SITE_URL: 'https://www.robowear.space/', VITE_SITE_URL: 'https://preview.example' }),
    'https://www.robowear.space'
  )
  assert.equal(resolveSiteOrigin({ VITE_SITE_URL: 'https://preview.example/order' }), '')
  assert.equal(resolveSiteOrigin({ SITE_URL: 'http://example.com' }), '')
  assert.equal(resolveSiteOrigin({ SITE_URL: 'http://localhost:3000' }), 'http://localhost:3000')
  assert.equal(resolveSiteOrigin({ SITE_URL: 'javascript:alert(1)' }), '')
  assert.equal(resolveSiteOrigin({}), '')
})
