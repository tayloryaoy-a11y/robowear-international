// Quote-only handoff. The snapshot travels in the URL so a reload retains the inquiry context.
const STATUSES = new Set(['included', 'add_on', 'estimate_required'])
const localImage = (value) => typeof value === 'string' && value.length < 240 && !value.includes('..') && /^\/(images|configurator)\/[a-zA-Z0-9/_-]+\.(webp|png|jpg|jpeg|svg)(?:\?v=[a-zA-Z0-9_-]+)?$/.test(value)
const shortText = (value, limit) => typeof value === 'string' && value.length <= limit

export function readSchemeFromSearch(search) {
  try {
    const raw = new URLSearchParams(search).get('scheme')
    if (!raw || raw.length > 28000) return null
    const scheme = JSON.parse(raw)
    const config = scheme.configSnapshot
    if (!/^RW-LOOK-\d{8}-[a-zA-Z0-9-]{4,40}$/.test(scheme.schemeId) ||
      !config || !shortText(config.platform, 160) || !shortText(config.useCase, 160) ||
      !Array.isArray(config.items) || !config.items.length || config.items.length > 40 ||
      !config.items.every(item => item && shortText(item.category, 40) && shortText(item.id, 100) && !!item.id && !!item.category &&
        shortText(item.labelEn, 240) && shortText(item.labelZh, 240) && STATUSES.has(item.pricingStatus)) ||
      !Array.isArray(scheme.referenceImages) || scheme.referenceImages.length > 30 || !scheme.referenceImages.every(localImage) ||
      !shortText(scheme.sourcePage, 400) || !/^\/robofit(?:[?#].*)?$/.test(scheme.sourcePage) ||
      scheme.orderIntent?.status !== 'quote_only') return null
    return {
      schemeId: scheme.schemeId,
      configSnapshot: { platform: config.platform, useCase: config.useCase, items: config.items.map(({ category, id, labelEn, labelZh, pricingStatus }) => ({ category, id, labelEn, labelZh, pricingStatus })) },
      referenceImages: [...scheme.referenceImages], sourcePage: scheme.sourcePage,
      orderIntent: { status: 'quote_only' }
    }
  } catch { return null }
}

export function createScheme(configSnapshot, referenceImages, sourcePage) {
  const date = new Date().toISOString().slice(0, 10).replaceAll('-', '')
  return {
    schemeId: `RW-LOOK-${date}-${crypto.randomUUID().slice(0, 8)}`,
    configSnapshot,
    referenceImages: [...new Set(referenceImages)].filter(localImage).slice(0, 30),
    sourcePage: sourcePage.slice(0, 400),
    orderIntent: { status: 'quote_only' }
  }
}

export function schemeToContactUrl(scheme) {
  return `/contact?${new URLSearchParams({ type: 'appearance', schemeId: scheme.schemeId, scheme: JSON.stringify(scheme) })}`
}

export function formatSchemeText(scheme, lang = 'en') {
  const zh = lang === 'zh'
  const useCases = { 'Appearance customization': '外观定制', 'OEM project': '制造商项目', 'Brand styling': '品牌造型', 'Creator collaboration': '创作者共创' }
  const pricingLabel = (status) => status === 'included' ? (zh ? '未添加' : 'No add-on') : (zh ? '待评估报价' : 'Estimate on request')
  return [
    `RoboFit — ${scheme.schemeId}`,
    `${zh ? '机型与版本' : 'Platform & version'}: ${scheme.configSnapshot.platform || (zh ? '待提供' : 'To be confirmed')}`,
    `${zh ? '用途' : 'Use case'}: ${zh ? useCases[scheme.configSnapshot.useCase] || scheme.configSnapshot.useCase : scheme.configSnapshot.useCase}`,
    ...scheme.configSnapshot.items.map(item => `• ${zh ? item.labelZh : item.labelEn} — ${pricingLabel(item.pricingStatus)}`),
    zh ? '定制评估报价。单品参考图不代表完整组合或适配验证。' : 'Estimate on request. Item references do not represent a combined look or verified platform fit.',
    `${zh ? '参考图' : 'Reference images'}: ${scheme.referenceImages.join(', ')}`,
    `${zh ? '来源' : 'Source'}: ${scheme.sourcePage}`,
    zh ? '当前为报价咨询。' : 'Quote inquiry only.'
  ].join('\n')
}
