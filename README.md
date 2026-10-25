# RoboWear International

International appearance-customization showcase and quote intake for embodied robot wearables. English is the default; Chinese is available through the language switch.

## Local preview

Requires Node.js 20 or later. Dependencies are already represented by `package-lock.json`.

```sh
npm install
npm run dev -- --host 127.0.0.1 --port 5173 --strictPort
```

Open http://127.0.0.1:5173. `npm run build` creates the Vite build; `npm run preview -- --host 127.0.0.1` serves it locally. Neither command deploys the site.

Contact submissions in development or on loopback hosts are explicitly simulated locally. The receipt is labelled “Local preview — no email sent”; no `/api/contact` request is made.

## Routes

- `/`: appearance customization, customer and partner paths, engineering principles, R&D directions.
- `/products`: five appearance lines, stages and project-review boundaries.
- `/robofit`: item references and look summaries; not combined 3D try-on.
- `/technology`: materials and engineering R&D directions.
- `/about`: company approach, original Alex founder introduction, roadmap.
- `/contact`: appearance and partnership inquiry intake.
- `/community`: concept showcase and creator co-creation.
- Unknown routes: friendly 404 with a product link.

Product links use `category=mask|hair|headwear|apparel|carry|footwear|skin`. Valid `productId` options and apparel `series=home|professional|couture` can preselect an option. Direct product inquiries use `product=roboface|robohair|robowear|accessories|roboskin`.

## Look-to-inquiry handoff

`src/lib/lookScheme.js` creates and validates a quote-only snapshot:

- `schemeId`
- `configSnapshot`: target platform, use case and all selected items with `included`, `add_on`, or `estimate_required` pricing states
- `referenceImages`: local item reference paths
- `sourcePage`
- `orderIntent: { status: 'quote_only' }`

The builder provides a human-readable copy action and a JSON download. The contact URL carries the snapshot, allowing its read-only summary to survive a reload. Builder selections themselves live in React memory and reset on reload. This is not an online saved-account or order service. All pricing is “Estimate on request”. The optional base model shows proportions only.

## Contact service

`api/contact.js` validates field types, size, inquiry category and look context before calling Resend. A confirmed successful email response produces a request ID and summary. Real delivery depends on a verified sender and the server-only settings in `.env.example`. Do not expose secrets with a `VITE_` prefix. Live delivery was not exercised during this local revision.

## Public-content boundaries and pending confirmations

Keep claims at concept/reference or R&D status until evidence is cleared. No unverified patents, quantitative performance claims, authorized collaborations, compatibility, customer logos, crowdfunding, or creator revenue shares are published.

Pending business confirmation: registered legal entity name, actual office locations, official social handles, university names/clearance, platform/version test evidence, final materials/delivery scopes, and brand/IP permissions. Unconfirmed details remain hidden rather than being invented. The founder block is intentionally preserved verbatim.

One-click ordering is on the roadmap. Combined 3D fitting, marketplace transactions, AI assistance and payment are future capabilities; this revision includes no checkout or payment integration.

## Stack

React 18, Vite 5, React Router 6, Tailwind CSS 3, optional Three.js base model, Vercel Functions and Resend. Fonts use Inter, Space Grotesk and Noto Sans SC. Existing charcoal, cool-light styling and high-resolution item imagery are retained.

## 2026-10-25 revision file list

- `src/pages/Home.jsx`, `Products.jsx`: appearance-first content and product pathways; parameter-free reference imagery.
- `src/pages/RoboFit.jsx`, `src/lib/lookScheme.js`: category preselection, item references, quote-only snapshots, copy/download and contact handoff.
- `src/pages/Contact.jsx`, `api/contact.js`: inquiry routing, product/look inheritance, request receipts and local simulation.
- `src/pages/Technology.jsx`, `About.jsx`, `Community.jsx`: R&D principles, preserved founder text, concept co-creation and future roadmap.
- `src/components/Navbar.jsx`, `Footer.jsx`: final navigation, accessible mobile menu, confirmed contact data and removed dead links.
- `src/App.jsx`, `index.html`, `src/index.css`: page metadata, friendly 404, lazy builder loading, working sticky containers, focus and reduced-motion styling.
- `README.md`: current local-preview instructions and unpublished fact-confirmation checklist.

Build and desktop/mobile browser verification passed. Tested: all seven routes in both languages, 1440px and 390px layouts, product/series preselection, summary copy/download, URL/reload handoff, local no-email receipts, skin-interest continuity, headwear/hair exclusion, image retry, base-model visibility, 404 and menu keyboard behavior. API validation and receipt functions were checked without sending mail. A Vite size warning remains for the optional Three.js builder chunk. No deployment or payment flow was performed.

## Follow-up visual and contact corrections

- Restored the original contact address `contact@robowear.space` and telephone `+86 13458670416`, including mailto/tel links and the API recipient default.
- Renamed the apparel product line to `服装套装 / Apparel Sets` and selected the complete, uncropped `couture-celestial-tailoring.webp` reference for its product visuals.
- Added skin-sensing materials to the skin R&D descriptions and skin-customization reference panel.
- Added two concept assets generated with the built-in image generation tool: `public/images/robowear/robofit-collection-banner-20261025.png` (wide collection banner) and `public/images/robowear/skin-customization-reference-20261025.png` (lifelike skin and sensing-layer reference). The selected skin image is also included in the quote handoff.
- These changes remain local previews; no deployment or email delivery was performed.
