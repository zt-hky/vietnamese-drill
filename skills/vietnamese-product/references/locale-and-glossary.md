# Locale facts, address terms, project style guide and glossary

Sources (distilled, not copied): https://nguyenlnp.com/vietnamese-localization-style-guide/ (workflow, glossary vs style guide, context), https://gtelocalize.net/vietnamese-localization/ (locale facts, pronouns, dialects, SEO). Load when setting up or auditing a project's vi-VN conventions, pronouns, dates/addresses, glossary or SEO copy. Project decisions always win.

## 1. Style guide vs glossary vs TM vs LQA
| Asset | Job | Cannot prove |
|---|---|---|
| Style guide | voice, address terms, UI patterns, punctuation, protected content, exceptions | every term is approved, every screen works |
| Glossary | approved/rejected terms, definitions, non-translatable items | sentences sound natural |
| Translation memory | reuse of past segments | old segment still fits this screen |
| LQA | finds linguistic/context/visual/consistency issues | that issues were fixed and retested |
Do not conflate glossary and style guide. Start from real product decisions; grow the guide when review finds a recurring issue; record accepted new terms and exceptions.

## 2. What to do when the project has no vi style guide
1. Search the repo for existing glossary/style files (glossary*, terminology*, vi*.md, docs/i18n, locales/vi) and existing vi strings; infer conventions from shipped copy.
2. If none, apply this skill's defaults and **list assumptions** (address term, tệp vs tập tin, Delete wording) in one short block for the owner to approve. Do not silently invent a glossary file; offer `assets/glossary.template.csv`.
3. Keep one decision per row; never alternate forms without a rule.

## 3. Style-guide sections worth recording
Audience and task · voice/tone with approved AND rejected examples (error, notice, welcome, CTA) · address terms and exceptions · terminology (preferred, rejected, product names, acronyms, English kept) · UI writing (buttons, errors, confirmations, punctuation, label length) · locale behavior (dates, numbers, currency, units, sorting) · quality approval (who reviews, who fixes, who signs off).

## 4. Glossary fields
source term (exact case) · preferred Vietnamese or KEEP · definition in this product · context (feature/screen/sample) · rejected alternatives (+why) · owner · status (proposed/approved/retired). Machine-readable template: assets/glossary.template.csv. A glossary entry needs a definition and context, not only a translation; automated glossary enforcement helps but does not replace human review.

## 5. Context to give any reviewer (human or LLM)
String key · screen/feature name · user action it supports · variables and limits (max length, plural/select) · screenshot or description when ambiguous · "do not translate" spans · audience/channel. Missing context is the top cause of bad UI Vietnamese; ask for it or state the assumption instead of guessing. Batch these fields with the strings.

## 6. Address terms (pick per product, then be consistent)
- Defaults: product UI → "bạn" or no pronoun when the action is clear (compact labels often need none); formal/financial/B2B channels → "quý khách" only if the brand uses it; first person "chúng tôi" for the company, "mình" only for a deliberately informal/community voice. Never switch within one flow without a rule.
- Wrong form can offend: elders/parents get kinship terms ("cháu", "anh", "chị", "cô", "bác"), not "tôi/tao/bạn"; "tao/mày" never in product copy. Real people who use a gendered pronoun may be addressed with it; generic users get neutral wording (see Microsoft reference §9).
- If the brand/audience is unclear, default to "bạn" and mark it as an assumption for a native reviewer.

## 7. Regional language
- Standard for UI, education and media: Northern spelling and vocabulary (hành chính, tài chính, mẹ, lạc). Southern/Central forms (hành chánh, tài chánh, má, đậu phộng, bịnh) only for a deliberately regional brand. Trap: "ốm" means ill in the North but thin in the South; write "bệnh" or "gầy" instead.
- Words that mean different things by region are traps: "Tầng 1" (ground vs first floor), "quả mận" (plum vs rose apple). Prefer an unambiguous phrase or add context.
- Do not mix regional vocabulary inside one product.

## 8. Locale behavior (implement with locale APIs, then test)
- Use `Intl.DateTimeFormat('vi-VN')`, `Intl.NumberFormat('vi-VN')`, `Intl.PluralRules('vi')`, `Intl.Collator('vi')` or the platform's CLDR layer; do not hardcode tables. Test with real Vietnamese data.
- Date: day/month/year (15/12/2024), never US month-first. If a date involves lunar-calendar occasions (Tết, Rằm), state which calendar and consider showing both.
- Time: 24-hour is common for schedules, legal, transport, TV; 12-hour speech needs a day-part word: "9 giờ tối", "9 giờ sáng" (not "9 PM"). Keep ISO/underlying values and time zones unchanged.
- Units: metric (m, km, km/h, °C). Currency: ₫ / VND, no decimals in everyday prices; Intl decides separators.
- Names: family name first, given name last (Nguyễn Văn An); don't split or reorder blindly; don't assume first/last fields.
- Address: number, street, ward (phường/xã), district, city/province. The administrative structure changed in 2025 (district level removed in many places, provinces merged): do not hardcode a "district" field; follow the product's current data model and verify with the data owner.
- Layout: Vietnamese is usually longer than English by a variable amount; test real strings, diacritics and wrapping instead of assuming a ratio. Check font coverage for stacked diacritics.
- Phone, payment and social conventions (Zalo, MoMo, ZaloPay) are product decisions, not language rules.

## 9. SEO and content (web)
- Research Vietnamese keywords locally; write titles, meta description, headings and alt text in natural Vietnamese. Searchers often use full sentences/questions: include them in headings/FAQ where true. Do not stuff keywords or translate keywords literally.
- Keep diacritics in visible copy and metadata; accent-insensitive matching is a search-feature decision, not a copy rule.

## 10. Legal/compliance copy
Product labels, privacy/consent, consumer-protection, advertising claims and regulated sectors (finance, health, education) have Vietnamese-law requirements. This skill only flags the risk: do not state specific legal obligations as fact; mark "cần pháp chế/luật sư xác nhận" and keep claims verifiable. Do not invent superlatives or guarantees.

## 11. Things deliberately NOT adopted from the sources
- "Never use any English word": conflicts with developer docs and established loanwords; the rule is audience-based.
- "30–37% longer": unverified fixed ratio; test real strings.
- "Formal tone for young audiences": contradictory advice; tone follows audience and brand, recorded as examples.
- Specific statute numbers and market statistics: not verified here; not copied.

## 12. AI-assisted workflow (matches this plugin)
1) Prepare source, context fields, glossary, acceptance criteria. 2) Draft directly in Vietnamese with the skill. 3) `vi_check`/checker for tokens, tags, numbers, NFC, style hints. 4) `vietnamese-reviewer` (one batch) or self-review for meaning, address terms, naturalness, channel fit. 5) Verify in the actual product/page. 6) Record new terms and exceptions. A person approves release.
