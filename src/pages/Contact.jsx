import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext.jsx'
import { readSchemeFromSearch } from '../lib/lookScheme.js'
import Reveal from '../components/Reveal.jsx'

const INQUIRY_TYPES = [
  { id: 'appearance', zh: '外观定制 / 报价评估', en: 'Appearance / custom look quote' },
  { id: 'partner', zh: '合作咨询', en: 'Partnership' },
  { id: 'oem', zh: '机器人制造商 / OEM', en: 'OEM / manufacturer' },
  { id: 'brand', zh: '品牌合作', en: 'Brand collaboration' },
  { id: 'creator', zh: '创作者合作', en: 'Creator collaboration' },
  { id: 'invest_or_codev', zh: '投资 / 联合开发', en: 'Investment / joint development' }
]
const PARTNER_TYPES = INQUIRY_TYPES.filter(({ id }) => !['appearance', 'partner'].includes(id))
const USE_CASE_ZH = { 'Appearance customization': '外观定制', 'OEM project': '制造商项目', 'Brand styling': '品牌造型', 'Creator collaboration': '创作者共创' }
const PRODUCTS = {
  roboface: { zh: 'Robo-Face™ · 面部与头部定制', en: 'Robo-Face™ · Face & head customization' },
  robohair: { zh: 'Robo-Hair™ · 发型与头饰系统', en: 'Robo-Hair™ · Hair & headwear' },
  robowear: { zh: 'Robo-Wear™ · 服装套装', en: 'Robo-Wear™ · Apparel Sets' },
  accessories: { zh: 'Robo-Accessories™ · 功能配件', en: 'Robo-Accessories™ · Functional accessories' },
  roboskin: { zh: 'Robo-Skin™ · 智能皮肤覆盖系统', en: 'Robo-Skin™ · Skin cover research' }
}
const initialForm = { name: '', company: '', email: '', phone: '', inquiryType: 'appearance', partnerType: 'oem', platform: '', quantity: '', timeline: '', portfolio: '', message: '', contactWebsite: '' }

function createSubmissionId() {
  return crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`
}
function localRequestId(submissionId) {
  return `RW-${new Date().toISOString().slice(0, 10).replaceAll('-', '')}-${submissionId.replaceAll('-', '').slice(0, 8).toUpperCase()}`
}
function validateForm(form, T) {
  const errors = {}
  if (!form.name.trim()) errors.name = T('请填写姓名', 'Please enter your name')
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) errors.email = T('请填写有效的邮箱地址', 'Please enter a valid email address')
  if (form.phone.trim() && !/^[+\d][\d\s-]{6,}$/.test(form.phone.trim())) errors.phone = T('请检查电话号码', 'Please check your phone number')
  if (form.message.trim().length < 10) errors.message = T('请至少填写 10 个字符说明需求', 'Please describe your project in at least 10 characters')
  if (form.portfolio.trim()) {
    try { if (!['http:', 'https:'].includes(new URL(form.portfolio.trim()).protocol)) throw new Error() }
    catch { errors.portfolio = T('请填写以 https:// 或 http:// 开头的作品链接', 'Enter a portfolio URL starting with https:// or http://') }
  }
  return errors
}
function Field({ id, label, error, required, children }) {
  return <div>
    <label htmlFor={id} className="mb-1.5 block text-xs font-semibold tracking-wide text-white/55">{label}{required && <span className="ml-1 text-pink-400">*</span>}</label>
    {children}
    {error && <p id={`${id}-error`} role="alert" className="mt-1.5 text-xs text-pink-400">{error}</p>}
  </div>
}
function SchemeSummary({ scheme, T }) {
  if (!scheme) return null
  return <section aria-label={T('已选方案', 'Selected look')} className="mb-6 rounded-2xl border border-electric-500/25 bg-electric-500/[0.04] p-5">
    <h2 className="font-display text-lg font-semibold">{T('您的外观方案', 'Your look summary')}</h2>
    <p className="mt-2 break-all text-xs font-medium text-electric-300">{T('方案编号', 'Scheme ID')}: {scheme.schemeId}</p>
    <dl className="mt-4 space-y-2 text-sm text-white/60">
      <div><dt className="inline text-white/40">{T('机型', 'Platform')}: </dt><dd className="inline">{scheme.configSnapshot.platform || T('待确认', 'To be confirmed')}</dd></div>
      <div><dt className="inline text-white/40">{T('用途', 'Use case')}: </dt><dd className="inline">{T(USE_CASE_ZH[scheme.configSnapshot.useCase] || scheme.configSnapshot.useCase, scheme.configSnapshot.useCase)}</dd></div>
    </dl>
    <ul className="mt-3 space-y-2 text-sm text-white/75">{scheme.configSnapshot.items.map((item, index) => <li key={`${item.category}-${item.id}-${index}`} className="flex flex-wrap justify-between gap-2 border-t border-white/10 pt-2">
      <span>{T(item.labelZh, item.labelEn)}</span><span className="text-xs text-white/45">{item.pricingStatus === 'included' ? T('未添加', 'No add-on') : T('待评估', 'Estimate required')}</span>
    </li>)}</ul>
    {scheme.referenceImages.length > 0 && <div className="mt-4 flex flex-wrap gap-2">{scheme.referenceImages.map((src) => <img key={src} src={src} alt={T('已选单品参考图', 'Selected item reference')} className="h-24 w-20 rounded-lg border border-white/10 bg-carbon-900 object-contain" loading="lazy" />)}</div>}
    <p className="mt-4 break-all text-xs leading-relaxed text-white/45">{T('来源', 'Source')}: {scheme.sourcePage}</p>
    <p className="mt-2 text-xs text-white/45">{T('当前为报价咨询；已选配置将随表单一起提交。', 'Quote inquiry only. Your selected configuration travels with this request.')}</p>
  </section>
}

export default function Contact() {
  const { T } = useLanguage()
  const location = useLocation()
  const scheme = useMemo(() => readSchemeFromSearch(location.search), [location.search])
  const queryType = new URLSearchParams(location.search).get('type')
  const productQuery = new URLSearchParams(location.search).get('product')
  const productId = Object.hasOwn(PRODUCTS, productQuery) ? productQuery : null
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [receipt, setReceipt] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const submissionIdRef = useRef(createSubmissionId())
  const resultRef = useRef(null)
  const isLocalPreview = import.meta.env.DEV || ['localhost', '127.0.0.1', '[::1]'].includes(window.location.hostname)
  useEffect(() => {
    const inquiryType = INQUIRY_TYPES.some(({ id }) => id === queryType) ? queryType : 'appearance'
    setForm((prev) => ({ ...prev, inquiryType: scheme ? 'appearance' : inquiryType }))
    setReceipt(null)
    setSubmitError('')
    submissionIdRef.current = createSubmissionId()
  }, [queryType, scheme, productId])
  useEffect(() => { if (receipt) resultRef.current?.focus() }, [receipt])
  const effectiveType = form.inquiryType === 'partner' ? form.partnerType : form.inquiryType
  const updateField = (key) => (event) => {
    setForm((prev) => ({ ...prev, [key]: event.target.value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
    setSubmitError('')
  }
  const handleSubmit = async (event) => {
    event.preventDefault()
    if (isSubmitting) return
    const validation = validateForm(form, T)
    setErrors(validation)
    if (Object.keys(validation).length) { document.getElementById(`contact-${Object.keys(validation)[0]}`)?.focus(); return }
    setIsSubmitting(true)
    setSubmitError('')
    const payload = { ...form, submissionId: submissionIdRef.current, ...(productId ? { productId } : {}), ...(scheme || {}) }
    try {
      let result
      if (isLocalPreview) {
        // Local preview never makes a contact API request or sends an email.
        result = { ok: true, localPreview: true, requestId: localRequestId(payload.submissionId), summary: { name: form.name.trim(), email: form.email.trim(), inquiryType: form.inquiryType, partnerType: form.partnerType, message: form.message.trim(), schemeId: scheme?.schemeId || null, productId }, ...(scheme || {}) }
      } else {
        const response = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
        result = await response.json().catch(() => null)
        if (!response.ok || result?.ok !== true || !result.requestId) throw new Error('Contact request failed')
      }
      setReceipt(result)
    } catch { setSubmitError(T('未能发送，请稍后重试，或直接发送邮件至 contact@robowear.space。', 'Your request could not be sent. Please try again or email contact@robowear.space.')) }
    finally { setIsSubmitting(false) }
  }
  const handleReset = () => {
    setForm({ ...initialForm, inquiryType: INQUIRY_TYPES.some(({ id }) => id === queryType) ? queryType : 'appearance' })
    setErrors({}); setReceipt(null); setSubmitError(''); submissionIdRef.current = createSubmissionId()
  }
  const input = (key, type, maxLength, extra = {}) => <input id={`contact-${key}`} name={key} type={type} value={form[key]} onChange={updateField(key)} maxLength={maxLength} className="input-field text-sm" aria-invalid={!!errors[key]} aria-describedby={errors[key] ? `contact-${key}-error` : undefined} {...extra} />

  return <div className="bg-carbon-900">
    <section className="relative overflow-hidden pb-14 pt-32 sm:pt-36">
      <div className="absolute inset-0 -z-10 bg-hero-glow opacity-60" />
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <Reveal><span className="inline-flex rounded-full border border-electric-500/30 bg-electric-500/10 px-4 py-1.5 text-xs font-semibold text-electric-300">{T('联系与合作', 'Contact & partnerships')}</span></Reveal>
        <Reveal delay={80}><h1 className="mt-6 max-w-5xl font-display text-3xl font-bold leading-[1.15] tracking-tight sm:text-4xl lg:text-5xl">{T('让您的机器人拥有自己的外观', 'Let’s shape your robot’s look')}</h1></Reveal>
        <Reveal delay={160}><p className="mt-6 max-w-3xl text-base leading-relaxed text-white/55">{T('提交外观需求、OEM 项目或合作想法。有 RoboFit 方案时，已选内容会自动带入。我们会在评估后与您联系。', 'Share an appearance brief, an OEM project, or a partnership idea. Your RoboFit configuration is included automatically. We’ll follow up after review.')}</p></Reveal>
      </div>
    </section>
    <section className="pb-24">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-5 sm:px-8 lg:grid-cols-[1.2fr_0.8fr] lg:px-10">
        <Reveal direction="left"><div className="rounded-3xl border border-white/10 bg-carbon-800/40 p-6 sm:p-8">
          {productId && <section aria-label={T('咨询产品', 'Product of interest')} className="mb-6 rounded-2xl border border-electric-500/25 bg-electric-500/[0.04] p-5"><h2 className="font-display text-lg font-semibold">{T('咨询产品', 'Product of interest')}</h2><p className="mt-2 text-sm text-electric-300">{T(PRODUCTS[productId].zh, PRODUCTS[productId].en)}</p><p className="mt-3 text-xs text-white/45">{T('此产品信息将随咨询一起提交。', 'This product is included automatically with your inquiry.')}</p></section>}
          <SchemeSummary scheme={scheme} T={T} />
          {receipt ? <section tabIndex={-1} ref={resultRef} aria-live="polite" className="outline-none">
            <h2 className="font-display text-2xl font-bold">{receipt.localPreview ? T('本地预览 — 未发送邮件', 'Local preview — no email sent') : T('咨询已提交', 'Request submitted')}</h2>
            <p className="mt-4 break-all text-sm text-electric-300">Request ID: {receipt.requestId}</p>
            <dl className="mt-6 space-y-3 text-sm text-white/65">
              <div><dt className="text-white/40">{T('姓名 / 邮箱', 'Name / email')}</dt><dd className="mt-1 break-words">{receipt.summary.name} · {receipt.summary.email}</dd></div>
              <div><dt className="text-white/40">{T('咨询类型', 'Inquiry type')}</dt><dd className="mt-1">{T(INQUIRY_TYPES.find(({ id }) => id === receipt.summary.inquiryType)?.zh || '合作咨询', INQUIRY_TYPES.find(({ id }) => id === receipt.summary.inquiryType)?.en || 'Partnership')}{receipt.summary.inquiryType === 'partner' && ` · ${T(PARTNER_TYPES.find(({ id }) => id === receipt.summary.partnerType)?.zh || '', PARTNER_TYPES.find(({ id }) => id === receipt.summary.partnerType)?.en || '')}`}</dd></div>
              {receipt.summary.schemeId && <div><dt className="text-white/40">{T('方案编号', 'Scheme ID')}</dt><dd className="mt-1 break-all">{receipt.summary.schemeId}</dd></div>}
              {receipt.summary.productId && PRODUCTS[receipt.summary.productId] && <div><dt className="text-white/40">{T('咨询产品', 'Product of interest')}</dt><dd className="mt-1">{T(PRODUCTS[receipt.summary.productId].zh, PRODUCTS[receipt.summary.productId].en)}</dd></div>}
              <div><dt className="text-white/40">{T('需求摘要', 'Project summary')}</dt><dd className="mt-1 whitespace-pre-wrap break-words">{receipt.summary.message}</dd></div>
            </dl>
            <p className="mt-6 text-sm leading-relaxed text-white/50">{receipt.localPreview ? T('此结果仅用于核对表单与方案传递，没有发送邮件，也没有创建线上咨询。', 'Use this preview to check the form and look handoff. No email was sent and no online inquiry was created.') : T('我们会在评估后通过您填写的邮箱联系。', 'We’ll follow up at your email address after review.')}</p>
            <button type="button" onClick={handleReset} className="mt-7 rounded-full border border-white/20 px-5 py-2.5 text-sm font-semibold text-white/75 hover:border-electric-400">{T('新建咨询', 'Start another inquiry')}</button>
          </section> : <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {isLocalPreview && <p role="note" className="rounded-xl border border-white/10 px-4 py-3 text-xs leading-relaxed text-white/55">{T('本地预览模式：可填写并检查提交摘要，不会发送邮件。', 'Local preview: fill in the form to inspect the request summary. No email will be sent.')}</p>}
            <div className="absolute left-[-10000px] h-px w-px overflow-hidden" aria-hidden="true"><label htmlFor="contact-website">Website</label><input id="contact-website" name="contactWebsite" type="text" tabIndex={-1} autoComplete="off" value={form.contactWebsite} onChange={updateField('contactWebsite')} /></div>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field id="contact-name" label={T('姓名', 'Full name')} error={errors.name} required>{input('name', 'text', 100, { autoComplete: 'name', required: true })}</Field>
              <Field id="contact-company" label={T('公司 / 机构（选填）', 'Company / organization (optional)')}>{input('company', 'text', 160, { autoComplete: 'organization' })}</Field>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field id="contact-email" label={T('邮箱', 'Email address')} error={errors.email} required>{input('email', 'email', 254, { autoComplete: 'email', required: true })}</Field>
              <Field id="contact-phone" label={T('电话（选填）', 'Phone (optional)')} error={errors.phone}>{input('phone', 'tel', 40, { autoComplete: 'tel' })}</Field>
            </div>
            <Field id="contact-inquiryType" label={T('咨询类型', 'Inquiry type')}><select id="contact-inquiryType" value={form.inquiryType} onChange={updateField('inquiryType')} className="input-field text-sm">{INQUIRY_TYPES.map((opt) => <option key={opt.id} value={opt.id} className="bg-carbon-800">{T(opt.zh, opt.en)}</option>)}</select></Field>
            {form.inquiryType === 'partner' && <Field id="contact-partnerType" label={T('合作方向', 'Partnership focus')}><select id="contact-partnerType" value={form.partnerType} onChange={updateField('partnerType')} className="input-field text-sm">{PARTNER_TYPES.map((opt) => <option key={opt.id} value={opt.id} className="bg-carbon-800">{T(opt.zh, opt.en)}</option>)}</select></Field>}
            {effectiveType === 'oem' && <div className="grid gap-5 sm:grid-cols-2">
              <Field id="contact-platform" label={T('机型与版本（选填）', 'Platform & version (optional)')}>{input('platform', 'text', 160)}</Field>
              <Field id="contact-quantity" label={T('预计数量（选填）', 'Estimated quantity (optional)')}>{input('quantity', 'text', 80)}</Field>
            </div>}
            {effectiveType === 'creator' && <Field id="contact-portfolio" label={T('作品链接（选填）', 'Portfolio URL (optional)')} error={errors.portfolio}>{input('portfolio', 'url', 1000, { placeholder: 'https://' })}</Field>}
            {effectiveType !== 'appearance' && <Field id="contact-timeline" label={T('预期时间（选填）', 'Expected timeline (optional)')}>{input('timeline', 'text', 160)}</Field>}
            <Field id="contact-message" label={T('项目背景与需求', 'Project background & goals')} error={errors.message} required><textarea id="contact-message" name="message" value={form.message} onChange={updateField('message')} rows={5} maxLength={5000} required aria-invalid={!!errors.message} aria-describedby={errors.message ? 'contact-message-error' : undefined} placeholder={T('请说明用途、目标、约束与希望如何合作。', 'Tell us the use case, goals, constraints, and how you would like to work together.')} className="input-field resize-y text-sm" /></Field>
            {submitError && <p role="alert" className="rounded-xl border border-pink-400/30 bg-pink-400/[0.08] p-4 text-sm text-pink-200">{submitError}</p>}
            <button type="submit" disabled={isSubmitting} aria-busy={isSubmitting} className="inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-electric-500 to-cyber-500 px-6 py-3.5 text-sm font-semibold text-carbon-900 transition hover:brightness-110 disabled:cursor-wait disabled:opacity-60 sm:w-auto">{isSubmitting ? T('正在提交…', 'Submitting…') : isLocalPreview ? T('预览咨询摘要', 'Preview request summary') : form.inquiryType === 'appearance' ? T('提交报价咨询', 'Submit for quote') : T('提交合作意向', 'Submit partnership inquiry')}</button>
            <p className="text-xs leading-relaxed text-white/40">{T('所填信息仅用于评估项目并回复咨询。提交内容包含上方已选方案。', 'Your details are used to review and respond to your inquiry. Any selected look above is included.')} <a href="mailto:contact@robowear.space?subject=Privacy%20policy" className="text-electric-300 underline underline-offset-4">{T('邮件咨询隐私政策', 'Email us for policy')}</a></p>
          </form>}
        </div></Reveal>
        <Reveal direction="right" delay={80}><aside className="space-y-6">
          <div className="rounded-3xl border border-white/10 bg-carbon-800/40 p-6 sm:p-8">
            <h2 className="font-display text-sm font-semibold uppercase tracking-widest2 text-white/70">{T('直接联系', 'Direct contact')}</h2>
            <a href="mailto:contact@robowear.space" className="mt-5 block break-all text-base font-semibold text-electric-300 hover:text-electric-200">contact@robowear.space</a>
            <a href="tel:+8613458670416" className="mt-3 block text-sm text-white/55 hover:text-white">+86 13458670416</a>
            <p className="mt-5 text-sm leading-relaxed text-white/45">{T('外观定制、机器人制造商、品牌与创作者合作，欢迎说明您的目标与时间安排。', 'Appearance projects, OEMs, brands, and creators: tell us your goals and timing.')}</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-carbon-800/60 to-carbon-800/20 p-6 sm:p-8">
            <h2 className="font-display text-2xl font-bold text-gradient">{T('从外观想法到工程评估', 'From a look to an engineering brief')}</h2>
            <ol className="mt-6 space-y-4 text-sm leading-relaxed text-white/55"><li>{T('01 · 分享想法或附上 RoboFit 方案。', '01 · Share an idea or include your RoboFit look.')}</li><li>{T('02 · 结合机型、材料与用途评估。', '02 · Review platform, materials, and use case.')}</li><li>{T('03 · 确认范围后讨论报价与下一步。', '03 · Agree scope, then discuss an estimate and next steps.')}</li></ol>
            <p className="mt-6 border-t border-white/10 pt-4 text-xs text-white/40">{T('一键下单已列入路线图。当前接受定制评估与合作询盘。', 'One-click ordering is on the roadmap. Today: custom project quotes and partnerships.')}</p>
          </div>
        </aside></Reveal>
      </div>
    </section>
  </div>
}
