// Allowlisted deposit catalog. The browser may display these figures, but
// /api/checkout recomputes the charged amount from this module. Prices are
// illustrative USD estimates grounded in the product pages and RoboFit — not
// a final quote. Custom work can still be confirmed by sales before shipment.

export const DEPOSIT_PERCENT = 30
export const MAX_QUANTITY = 10
export const CURRENCY = 'usd'
export const MIN_DEPOSIT_CENTS = 50
export const MAX_UNIT_PRICE_USD = 100_000

export const ROBOTS = [
  { id: 'optimus', nameZh: 'Tesla Optimus', nameEn: 'Tesla Optimus' },
  { id: 'figure-03', nameZh: 'Figure 03', nameEn: 'Figure 03' },
  { id: 'xpeng-iron', nameZh: '小鹏 Iron', nameEn: 'XPeng Iron' }
]

export const PRODUCT_LINES = [
  {
    id: 'roboskin',
    nameZh: 'Robo-Skin™',
    nameEn: 'Robo-Skin™',
    summaryZh: '智能皮肤覆盖系统',
    summaryEn: 'Smart skin cover system',
    rangeLabel: '$1,500 – $5,000',
    sublines: [
      {
        id: 'standard',
        nameZh: '标准全身套装',
        nameEn: 'Standard full-body set',
        priceUsd: 1500,
        noteZh: '产品页区间的起点估价，标准纹理与磁吸安装。',
        noteEn: 'Illustrative entry of the published range, with a standard texture and magnetic fit.',
        salesConfirm: false
      },
      {
        id: 'lifelike',
        nameZh: '拟真肤色全身',
        nameEn: 'Lifelike tone, full body',
        priceUsd: 3999,
        noteZh: '与 RoboFit 拟真肤色示意价一致，适配后仍可能调整。',
        noteEn: 'Matches the RoboFit lifelike-tone illustration and may change after a fit review.',
        salesConfirm: true
      },
      {
        id: 'full-custom',
        nameZh: '深度定制全身',
        nameEn: 'Full custom body',
        priceUsd: 5000,
        noteZh: '产品页区间上沿的示意估价，最终金额由销售确认。',
        noteEn: 'Illustrative top of the published range. Sales confirms the final amount.',
        salesConfirm: true
      }
    ]
  },
  {
    id: 'robowear',
    nameZh: 'Robo-Wear™',
    nameEn: 'Robo-Wear™',
    summaryZh: '功能性日常服装',
    summaryEn: 'Functional daily apparel',
    rangeLabel: '$199 – $20,000+',
    sublines: [
      {
        id: 'home',
        nameZh: '居家系列',
        nameEn: 'Home Series',
        priceUsd: 199,
        noteZh: '已发布区间 $199–$499 的起点估价。',
        noteEn: 'Illustrative entry of the published $199–$499 range.',
        salesConfirm: false
      },
      {
        id: 'professional',
        nameZh: '工装防护系列',
        nameEn: 'Professional Series',
        priceUsd: 599,
        noteZh: '已发布区间 $599–$1,299 的起点估价，批量采购另议。',
        noteEn: 'Illustrative entry of the published $599–$1,299 range. Bulk orders are quoted separately.',
        salesConfirm: false
      },
      {
        id: 'couture',
        nameZh: '高定奢华系列',
        nameEn: 'Haute Couture Series',
        priceUsd: 2000,
        noteZh: '已发布区间 $2,000–$20,000+ 的起点估价，高定由销售确认。',
        noteEn: 'Illustrative entry of the published $2,000–$20,000+ range. Couture is confirmed by sales.',
        salesConfirm: true
      },
      {
        id: 'collab',
        nameZh: 'IP 联名系列',
        nameEn: 'Collaboration Series',
        priceUsd: 500,
        noteZh: '已发布区间 $500–$3,000 的起点估价，不含另行核算的授权费。',
        noteEn: 'Illustrative entry of the published $500–$3,000 range, before separate licensing fees.',
        salesConfirm: true
      }
    ]
  },
  {
    id: 'roboface',
    nameZh: 'Robo-Face™',
    nameEn: 'Robo-Face™',
    summaryZh: '面具与头部定制',
    summaryEn: 'Mask and head system',
    rangeLabel: '$299 – $10,000',
    sublines: [
      {
        id: 'tech-minimal',
        nameZh: '科技极简',
        nameEn: 'Tech-Minimal',
        priceUsd: 299,
        noteZh: '已发布区间 $299–$599 的起点估价。',
        noteEn: 'Illustrative entry of the published $299–$599 range.',
        salesConfirm: false
      },
      {
        id: 'anime',
        nameZh: '动漫 / 流行文化',
        nameEn: 'Anime & Pop Culture',
        priceUsd: 399,
        noteZh: '已发布区间 $399–$999 的起点估价。',
        noteEn: 'Illustrative entry of the published $399–$999 range.',
        salesConfirm: false
      },
      {
        id: 'realistic',
        nameZh: '超写实人脸',
        nameEn: 'Realistic-Human',
        priceUsd: 1500,
        noteZh: '已发布区间 $1,500–$5,000 的起点估价。',
        noteEn: 'Illustrative entry of the published $1,500–$5,000 range.',
        salesConfirm: true
      },
      {
        id: 'portrait',
        nameZh: '定制肖像',
        nameEn: 'Custom Portrait',
        priceUsd: 3000,
        noteZh: '已发布区间 $3,000–$10,000 的起点估价，肖像由销售确认。',
        noteEn: 'Illustrative entry of the published $3,000–$10,000 range. Portraits are confirmed by sales.',
        salesConfirm: true
      }
    ]
  },
  {
    id: 'robohair',
    nameZh: 'Robo-Hair™',
    nameEn: 'Robo-Hair™',
    summaryZh: '假发与头部装饰',
    summaryEn: 'Wig and head accessories',
    rangeLabel: '$89 – $1,499',
    sublines: [
      {
        id: 'basic',
        nameZh: '基础款',
        nameEn: 'Basic',
        priceUsd: 99,
        noteZh: '已发布区间 $99–$299 的起点估价。',
        noteEn: 'Illustrative entry of the published $99–$299 range.',
        salesConfirm: false
      },
      {
        id: 'custom',
        nameZh: '定制款',
        nameEn: 'Custom',
        priceUsd: 299,
        noteZh: '已发布区间 $299–$999 的起点估价，指定发型由销售确认。',
        noteEn: 'Illustrative entry of the published $299–$999 range. Specified styles are confirmed by sales.',
        salesConfirm: true
      },
      {
        id: 'premium',
        nameZh: '精品真人发',
        nameEn: 'Premium human hair',
        priceUsd: 499,
        noteZh: '已发布区间 $499–$1,499 的起点估价。',
        noteEn: 'Illustrative entry of the published $499–$1,499 range.',
        salesConfirm: false
      }
    ]
  },
  {
    id: 'accessories',
    nameZh: 'Robo-Accessories™',
    nameEn: 'Robo-Accessories™',
    summaryZh: '背包、鞋履与点缀',
    summaryEn: 'Bags, shoes, and finishing pieces',
    rangeLabel: '$49 – $1,299',
    sublines: [
      {
        id: 'bag',
        nameZh: '机能背包',
        nameEn: 'Utility backpack',
        priceUsd: 89,
        noteZh: '与 RoboFit 示意价一致，位于产品线区间内。',
        noteEn: 'Matches the RoboFit illustrative price, inside the published line range.',
        salesConfirm: false
      },
      {
        id: 'shoes',
        nameZh: '智能机能鞋',
        nameEn: 'Performance shoes',
        priceUsd: 129,
        noteZh: '与 RoboFit 示意价一致，位于产品线区间内。',
        noteEn: 'Matches the RoboFit illustrative price, inside the published line range.',
        salesConfirm: false
      },
      {
        id: 'jewelry',
        nameZh: '钛钢首饰套装',
        nameEn: 'Titanium jewelry set',
        priceUsd: 249,
        noteZh: '产品线区间内的示意估价，套装内容由销售确认。',
        noteEn: 'Illustrative estimate inside the published line range. Set contents are confirmed by sales.',
        salesConfirm: true
      },
      {
        id: 'seasonal',
        nameZh: '节日主题套装',
        nameEn: 'Seasonal theme kit',
        priceUsd: 199,
        noteZh: '产品线区间内的示意估价，节日款可能调整。',
        noteEn: 'Illustrative estimate inside the published line range. Seasonal kits may change.',
        salesConfirm: true
      }
    ]
  }
]

export function findLine(lineId) {
  return PRODUCT_LINES.find((line) => line.id === lineId) ?? null
}

export function findSubline(lineId, sublineId) {
  const line = findLine(lineId)
  if (!line) return null
  const subline = line.sublines.find((item) => item.id === sublineId)
  return subline ? { line, subline } : null
}

export function findRobot(robotId) {
  return ROBOTS.find((robot) => robot.id === robotId) ?? null
}

export function priceDeposit(priceUsd, quantity) {
  if (!Number.isInteger(priceUsd) || priceUsd < 1 || priceUsd > MAX_UNIT_PRICE_USD) return null
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY) return null

  const unitCents = priceUsd * 100
  const estimatedTotalCents = unitCents * quantity
  const depositCents = priceUsd * quantity * DEPOSIT_PERCENT
  const balanceCents = estimatedTotalCents - depositCents

  if (
    depositCents < MIN_DEPOSIT_CENTS ||
    depositCents > 99_999_999 ||
    depositCents + balanceCents !== estimatedTotalCents
  ) {
    return null
  }

  return {
    currency: CURRENCY,
    unitCents,
    estimatedTotalCents,
    depositCents,
    balanceCents,
    depositPercent: DEPOSIT_PERCENT
  }
}

export function quoteOrder({ lineId, sublineId, quantity }) {
  const match = findSubline(lineId, sublineId)
  if (!match) return null
  const amounts = priceDeposit(match.subline.priceUsd, quantity)
  if (!amounts) return null
  return {
    line: match.line,
    subline: match.subline,
    quantity,
    ...amounts
  }
}

export function formatUsd(cents) {
  if (!Number.isInteger(cents)) return '$0.00'
  const negative = cents < 0
  const absolute = Math.abs(cents)
  const dollars = Math.floor(absolute / 100).toLocaleString('en-US')
  const remainder = String(absolute % 100).padStart(2, '0')
  return `${negative ? '-' : ''}$${dollars}.${remainder}`
}

export function isStripeCheckoutUrl(value) {
  if (typeof value !== 'string' || value.length < 12 || value.length > 2000) return false
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && url.hostname === 'checkout.stripe.com'
  } catch {
    return false
  }
}

export function initialSelection(params) {
  const requestedLine = typeof params?.get === 'function' ? params.get('line') : ''
  const requestedSub = typeof params?.get === 'function' ? params.get('sub') : ''
  const requestedRobot = typeof params?.get === 'function' ? params.get('robot') : ''
  const line = findLine(requestedLine) ?? PRODUCT_LINES[0]
  const subline = line.sublines.find((item) => item.id === requestedSub) ?? line.sublines[0]
  const robot = findRobot(requestedRobot) ?? ROBOTS[0]
  return { lineId: line.id, sublineId: subline.id, robotId: robot.id }
}
