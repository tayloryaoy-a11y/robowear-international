export default function DepositBreakdown({ T, unit, quantity, estimated, deposit, balance, variant = 'due' }) {
  const rows = [
    [T('单价估价', 'Unit estimate'), unit],
    [T('数量', 'Quantity'), String(quantity)],
    [T('预估总额', 'Estimated total'), estimated]
  ]

  return (
    <div>
      <dl className="space-y-3 text-sm">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-baseline justify-between gap-4">
            <dt className="text-white/45">{label}</dt>
            <dd className="font-medium text-white/85">{value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-5 rounded-2xl border border-electric-400/40 bg-electric-500/10 p-4">
        <p className="text-[11px] font-semibold uppercase tracking-widest2 text-electric-300">
          {variant === 'paid'
            ? T('已支付定金 · 30%', 'Deposit paid · 30%')
            : variant === 'amount'
              ? T('定金金额 · 30%', 'Deposit amount · 30%')
              : T('本次支付 · 定金 30%', 'Due now · 30% deposit')}
        </p>
        <p className="mt-1 font-display text-3xl font-bold text-white">{deposit}</p>
        <p className="mt-1 text-xs text-electric-100/80">{T('美元 USD', 'USD')}</p>
      </div>

      <div className="mt-4 flex items-baseline justify-between gap-4 text-sm">
        <span className="text-white/45">{T('发货前余款', 'Balance before shipment')}</span>
        <span className="font-display text-lg font-semibold text-white/80">{balance}</span>
      </div>
    </div>
  )
}
