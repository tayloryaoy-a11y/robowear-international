import { formatUsd } from '../../shared/orderCatalog.js'

const CONTACT_TO_EMAIL = process.env.CONTACT_TO_EMAIL || 'contact@robowear.space'
const CONTACT_FROM_EMAIL = process.env.CONTACT_FROM_EMAIL || 'RoboWear Website <website@forms.robowear.space>'

export function depositEmailTarget() {
  return { to: CONTACT_TO_EMAIL, from: CONTACT_FROM_EMAIL }
}

export function buildDepositEmail(summary) {
  const submittedAt = new Date().toISOString()
  return {
    subject: `【RoboWear 定金】已支付｜${summary.customerName || summary.email}｜${summary.lineNameEn}`,
    text: [
      'RoboWear 官网收到一笔已支付定金 / A deposit was paid on the website',
      '',
      `产品线 / Line：${summary.lineNameZh} / ${summary.lineNameEn}`,
      `子系列 / Option：${summary.sublineNameZh} / ${summary.sublineNameEn}`,
      `机型 / Robot：${summary.robotNameZh} / ${summary.robotNameEn}`,
      `数量 / Qty：${summary.quantity}`,
      `预估总额 / Estimated total：${formatUsd(summary.estimatedTotalCents)} USD`,
      `已付定金 / Deposit paid (30%)：${formatUsd(summary.depositCents)} USD`,
      `发货前余款 / Balance before shipment：${formatUsd(summary.balanceCents)} USD`,
      '',
      `姓名 / Name：${summary.customerName || '未填写'}`,
      `公司 / Company：${summary.company || '未填写'}`,
      `邮箱 / Email：${summary.email || '未填写'}`,
      `电话 / Phone：${summary.phone || '未填写'}`,
      `备注 / Notes：${summary.notes || '未填写'}`,
      '',
      `Checkout Session：${summary.sessionId}`,
      `记录时间 / Recorded：${submittedAt}`,
      '',
      '此邮件仅表示定金已通过 Stripe 支付。余款与定制金额仍需销售在发货前确认。',
      'This email confirms the deposit only. The balance and any custom pricing are still confirmed by sales before shipment.'
    ].join('\n')
  }
}
