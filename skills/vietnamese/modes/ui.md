# Mode: UI and product copy

Use for buttons, labels, errors, toasts, notifications, onboarding, web content, i18n files and product docs. Fixed terms come from `scripts/vi.mjs lookup`; this file is the style layer. Project glossary/style always wins.

## Surface and context (decides length and how much to say)
Every UI item should carry `ctx`: `{surface, max?, near?, standalone?, screen?, action?}`.
- `surface`: one id from `vi.mjs surfaces` (button, dialog_button, field_error, toast, push_title, push_body, sms, empty_body, store_title…). It sets the recommended/hard length, line count, end punctuation, content pattern.
- `max`: the real limit in characters for this slot (fixed-width button, design spec). Overrides the surface default and becomes a hard requirement.
- `near`: text already visible next to the string (dialog title, field label, screen title, icon label). **If the information is already on screen, do not repeat it**: dialog button → verb only ("Xóa"), field error → only how to fix ("Nhập email hợp lệ."), toast after the user's own tap → result only ("Đã lưu").
- `standalone: true` (push, SMS, email subject, background toast, notification centre): nothing else explains it, so write the **minimum complete message**: what happened + which object (amount, order no., time) + next step when the user must act. Never "Bạn có thông báo mới".
- No `ctx` given: infer the surface from the key/name (`*.button`, `error.*`, `toast.*`), state the assumption, and default to the standalone minimum for errors and notifications.
- Too long for `max`: cut in this order: pronoun "bạn" / "của bạn" → words duplicated by `near` → "vui lòng"/"hãy" → long synonyms (use the glossary `alt`/short form). Never cut negation, amounts, the object of a destructive action, or the next step.
- Vietnamese is usually longer than English; check lengths with `vi.mjs check` (items mode reports `LENGTH_OVER`, `LENGTH_HARD`, `SMS_SEGMENTS`, `END_PUNCT`, `REDUNDANT_CONTEXT`, `NO_NEXT_STEP`).

## Terms and surfaces
- Developer docs/chat: keep commit, branch, merge, deploy, production, staging, API, endpoint, payload, cache, hook, skill, plugin, pull request when natural. Never commit→cam kết or production→sản xuất in software context.
- End-user UI: familiar Vietnamese (Lưu, Xóa, Đăng nhập, Tải xuống); no developer jargon. One concept, one term per surface; the glossary decides.
- Spec/RFC: impersonal, name the actor. Tutorial: "bạn" sparingly. UI: omit the pronoun when clear, otherwise "bạn"; "quý khách" only if the brand uses it. Chat replies follow vietnamese-replies.
- Buttons: verb first, sentence case, about 25 characters at most; reuse the verb of the confirming question (Mua / Không). Errors: what failed, then the next step; never blame the user, never invent a cause or a retry. Distinguish loading, empty, success, failure. Notifications: event or result plus the relevant next action, no marketing.
- Content: concrete benefit, no invented superlatives; drop empty tiến hành/thực hiện, một cách, thông qua việc only when redundant.

## UI voice and grammar (details: references/microsoft-vi-style.md)
- Warm, crisp, helpful. Rewrite for intent, not word for word; split sentences; fragments are fine ("Dùng ngay phiên bản đầy đủ", "Nếu còn sự cố"). Short modern words: hủy, nhập, ẩn, tìm hiểu, Xin chờ.
- Sentence case ("Chọn tất cả", not "Chọn Tất Cả"). No "việc" before a gerund. đã/đang/sẽ optional. "Hãy" for direct commands, "Vui lòng" polite, never doubled.
- Errors: declarative, ends with a period, "lỗi" for error; could not/failed to → "Không … được", not "… thất bại"; "Không tìm thấy …", "Không đủ …".
- Punctuation: no space before . , ! ? ; : ) ; no comma before và/hoặc; decimal comma, thousands period, no space before %; use Intl, not hand formatting.
- "to" with progress = "lên" (cập nhật lên); "on/in" a UI surface = "trên" (trên menu). "người dùng" is a noun, not a stand-in for "bạn".
- Keep standard acronyms and trademarked names; never invent Vietnamese acronyms. Spell out on first use in docs.
- Inclusive: gender-neutral (nhân viên, các bạn, họ), person-first for disability, no stereotypes; spell out và/cộng/khoảng instead of & + ~; input-agnostic verbs (Chọn).

## i18n invariants
- Do not translate identifiers, flags, code, paths, URLs, resource keys, placeholders, HTML/Markdown syntax, enums, machine-readable logs. Translate user-visible strings/comments within scope only.
- Preserve interpolation names, types, escaping, rich-text tags; JSON keys and placeholder contracts must match the source. Never concatenate sentence fragments; use the project's i18n library.
- Vietnamese CLDR cardinal category is `other`; exact selectors (=0, =1) are valid; do not delete branches or rewrite complex ICU with regex; validate with the project's compiler.
- UTF-8/NFC. One tone-mark style per product (hòa/hoà): the checker flags mixes. No forced ASCII in commit prose unless repo policy says so.
- Use Intl.DateTimeFormat/NumberFormat('vi-VN') or the project's locale layer; dates are day/month/year; 12-hour speech needs a day-part ("9 giờ tối"); metric units; family name first; do not hardcode a "district" address field (2025 administrative changes).
- Test layout with real Vietnamese strings, diacritics and wrapping; no fixed expansion ratio. Accent-insensitive search is a product decision.

## Examples
- Lưu hình ảnh thất bại. → Không lưu được hình ảnh.
- Chọn Tất Cả → Chọn tất cả
- Học thêm → Tìm hiểu thêm (Learn more) · Thiết đặt → Cài đặt · Kích hoạt thông báo → Bật thông báo
- Hãy bắt đầu sử dụng phiên bản đầy đủ ngay → Dùng ngay phiên bản đầy đủ
- Đã xảy ra lỗi → Không lưu được cài đặt. Thử lại. (only if retry is a real action)
- Chọn mạng A, B, và C → Chọn mạng A, B và C
- cam kết các thay đổi → commit các thay đổi · triển khai đến sản xuất → deploy lên production
