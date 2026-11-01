# Microsoft vi-VN Localization Style Guide: distilled rules

Source: Microsoft *Vietnamese Localization Style Guide* (60 pp.), https://download.microsoft.com/download/b/f/e/bfecb1b4-21ab-48fd-a48c-c2471b026f8f/vie-vnm-StyleGuide.pdf. Original paraphrase, no copied text beyond short examples. Written for Windows/Office UI; **project glossary and product brand win over this file**. Where the guide is about Microsoft-specific terms (tệp, thiết đặt, Bảng tạm, key names) treat them as defaults, not law. Load this file only for UI strings, error/notification copy, i18n review or when the user asks for style detail.

## 1. Voice
- Warm and relaxed · crisp and clear (scan first, read second) · ready to help (anticipate the real need).
- Everyday conversational Vietnamese, not formal commercial/technical register. Technical terms for technical audiences, common words for consumers.
- Do not translate word for word. Understand the whole sentence/page, then rewrite as if originally written in Vietnamese. Split sentences, drop empty descriptors, omit what adds nothing. Check strings in context, not as a loose list.
- Standard translations may be dropped when they fail the intent. Example: "Remember my password" → "Lưu mật khẩu của tôi"; "We recommend that you back up your files on a regular schedule" → "Bạn nên thường xuyên sao lưu tệp."
- Humor/idiom ("No donut for you") → rewrite to the plain message: "Máy chủ đang gặp lỗi. Vui lòng thử lại sau!"
- Address the user directly (bạn); avoid third-person "người dùng" in instructions. "We" (chúng tôi) is fine for reassurance ("chúng tôi sẽ tiếp tục từ nơi vừa dừng").

## 2. Word choice
- Short everyday words: hủy (not hủy bỏ), nhập (not nhập vào / đưa vào).
- Modern over classic: Không tải được (not Tải về không thành công) · ẩn (not giấu) · tìm hiểu (not học, for "learn more") · ID (not mã định danh) · Xin chờ (not Vui lòng đợi) · "theo cách sau" (not "theo các bước sau đây").
- Cut formality that adds no meaning (EN→plain EN, apply the same instinct to vi): utilize→use, locate→find, terminate→end, modify→change, perform→do, obtain→get, purchase→buy, navigate→go, resolve→fix, execute→run.
- Conjunctions/adverbs open sentences naturally (Nhờ…, Nhưng…); prefer "Nhờ kết nối qua các kênh mã hóa…, mức độ an toàn cao như ngân hàng trực tuyến" over stiff "Bởi vì… nên…".
- Sentence fragments are good UI: "Dùng ngay phiên bản đầy đủ" not "Hãy bắt đầu sử dụng phiên bản đầy đủ ngay"; "Nếu còn sự cố" not "Nếu bạn vẫn còn sự cố".
- Do not abbreviate expressive politeness words: Vui lòng/Làm ơn, Cảm ơn, Xin lỗi/Rất tiếc.
- Dialect: standard northern (Hà Nội) wording unless the brand says otherwise: Gửi thư (not Gởi thơ), Chọn (not Lựa).

## 3. Verbs, tense, mood
- Tense markers (đã, đang, sẽ) are optional; omit unless needed for emphasis or clarity.
- Gerund: do NOT add "việc" before the verb: "Đọc cuốn sách này là bắt buộc", "Tôi thích lập trình", "Tôi mệt vì tranh cãi".
- Imperative: "Hãy" for direct commands; not needed in a subordinate/purpose clause ("Để giải quyết vấn đề này, hỏi quản trị viên…"). Polite: "Vui lòng" + verb. Never double up ("xin vui lòng").
- Distinguish action verbs precisely; the guide warns against using casual "xóa" for every meaning: Remove = Loại bỏ · Delete = Xóa bỏ · Clear = Xóa · Reject = Bác bỏ. Consumer UIs often shorten Delete to "Xóa"; keep one choice per product (project glossary wins) and never let "Xóa" cover both delete and clear.
- Negation shades: không (neutral) · chưa (not yet) · chẳng (dismissive). Pick deliberately; "chưa" implies it will happen.
- Verb + preposition pairs: chuyển đổi … từ … sang …; di chuyển đến/từ; nhập từ; xuất đến; cập nhật lên; nâng cấp lên (progress = "lên"); đổi sang; bấm vào; kết nối với; avoid "sang" for "to" except change/convert.
- "in/on": trên thanh công cụ, trên tab, trên menu, trên Internet, trên Web, trên trang web. Not "trong".

## 4. Grammar and word order
- Noun before adjective; moving it changes meaning (điểm yếu ≠ yếu điểm). Adverb before verb. Mind whether one word is adjective or adverb (dễ, dễ dàng).
- Compounds reverse English order: Internet Accounts → Tài khoản Internet; avoid long noun chains; add "của" when needed for clarity.
- No articles. Translate "a/an" only when it means "one". No article before product/feature names.
- Possessive: "của" + pronoun (của bạn). Plural: các (definite), những (indefinite).
- Pronouns: bạn (you), tôi, chúng tôi (we, excluding user), chúng ta (we, including user). Do not confuse họ (people) with chúng nó/nó. Avoid "người dùng" as a stand-in subject in instructions.
- No grammatical gender: rewrite instead of "anh ấy/cô ấy" (see §9).

## 5. Capitalization
- **Sentence case.** Capitalize only the first word of menus, buttons, dialogs, titles, commands: "Chọn tất cả", not "Chọn Tất Cả". "Máy chủ tự động".
- Proper names: every word capitalized (Việt Nam, Hà Nội, TP Hồ Chí Minh). Names of ministries/agencies/titles of works: capitalize first word of the compound (Bộ Lao động-Thương binh và Xã hội).
- Translated feature names follow sentence case ("Trình hướng dẫn Tăng kích cỡ" is accepted in Microsoft style; title-style capitalization of feature names is tolerated but be consistent per product).
- Keep unlocalized product/feature names as-is (PivotTable).

## 6. Punctuation and symbols
- No space before . , ! ? ; : ) ] } ” and one space after. No space after ( [ {, one before.
- **No comma before "và" / "hoặc"** (no Oxford comma).
- Decimal separator comma (5,25 cm); thousands separator period (1.526; $ 1.526,75). Do not put a space between number and %. Non-breaking space between number and unit (250 GB, 2.34 cm). Use `Intl.NumberFormat('vi-VN')` rather than hand-formatting.
- Colon: no space before, one after; intro to list; lowercase after the colon when the list reads as part of the sentence; never colon + dash.
- Hyphen: do not use as a connector (Dễ sử dụng, Từ trái sang phải). En dash for ranges ("2–5 giờ chiều"). Em dash for emphasis/asides.
- Ellipsis: "…" or "v.v." for etc.
- Period after a declarative sentence, fragment, imperative, and error message. Closing quote goes before period/comma in Vietnamese-style quoting (“Chào anh Frank”, HAL chào.). Keep US punctuation when a string ends in a runtime placeholder.
- Parentheses: no inner spaces: "Đường lối kinh doanh (LOB)".
- Non-breaking spaces only where the source has them; otherwise normal space.

## 7. Acronyms, abbreviations, product names
- Keep standard acronyms unchanged (HTML, HTTP, DNS, USB, DLL, DPI, ISO). Never invent a Vietnamese acronym from a translated term.
- Redundant generic noun after an acronym is fine in Vietnamese: lời gọi RPC, ngôn ngữ HTML, giao thức TCP/IP, số PIN.
- First use in help/docs: Vietnamese term (English term, ACRONYM) e.g. Đối tượng truy nhập dữ liệu (Data Access Objects, DAO). Be consistent per product; mind the audience's knowledge.
- Allowed Vietnamese abbreviations when space is tight: v.v., CNTT. Never abbreviate politeness words.
- Product names and trademarked feature names stay English; descriptive parts around them translate: "Ứng dụng chia sẻ Microsoft Rights Management". Non-trademarked feature names may be translated (Print Preview → Xem trước khi in). Follow trademark-owner instructions. Copyright strings are translated; use the official translation of "All rights reserved".
- Keep popular loanwords that are ambiguous, long, or already familiar when translated forms would confuse: OK, tab, modem, README, script, font names, PC, USB.
- Version: "Phiên bản 5.1".

## 8. Software strings
- Short, clear, no extra words; the UI must fit different devices/sizes; keep cross-platform consistency.
- Error messages: declarative, impersonal, empathetic, never robotic; always say "lỗi" for "error" ("An error occurred" → "Có lỗi."); end with a period.
  - Could not/Cannot X → "Không … được" ("Không tìm được tệp"). Past/present not distinguished.
  - Failed to X / X failed → "Không … được" or "Kết nối hỏng". Not "Lưu hình ảnh thất bại"; "Không lưu được hình ảnh."
  - Cannot/could not/unable to find/locate → one phrase: "Không tìm thấy …".
  - Not enough/insufficient memory → "Không đủ bộ nhớ".
  - X is not available/unavailable → "Không có …" (or "… không khả dụng" if project glossary says so).
  - Use one standard phrase for every error with the same meaning; don't mirror inconsistent English variants.
  - Short and friendly + the action: "Mật khẩu không đúng, xin thử lại." Setup done: "Sẵn sàng sử dụng." Unexpected: "Có lỗi!" is OK in casual products.
- Placeholders: find out what replaces them so grammar still works. %d %ld %u %lu = number; %c = letter; %s = string; keep positional forms (%1!d!). Do not translate or reorder tokens unless the target grammar requires it, and keep types.
- Instructions with a goal: "Để quay lại và lưu công việc, hãy bấm Hủy và hoàn thành điều bạn cần làm." Tell only what the user needs to decide.
- Feature promotion: benefit first, everyday words, em dash for requirements, "bạn" for personal feel.
- Prompts for AI assistants (Copilot-style, also useful for prompt libraries): clear, specific, natural question/request starting with an action verb; informal but polite, no slang/jargon; keep quoted spans so the model knows what to rewrite; entity tokens/placeholders (`<entity>`, `[file]`) are NOT translated and must sit in a natural place in the sentence unless a dev comment says the token is display text; translate near-duplicate prompts consistently.

## 9. Inclusive language
- Plain, concrete, current words. Prefer widely understood terms over regional/dated ones (chậu rửa/bồn rửa not lavabo; cha/bố not thầy/cậu/tía/ba; Người Trung Quốc, never derogatory forms; Cha mẹ/Bố mẹ as in MOET documents).
- No profanity, derogatory terms, stereotypes, region/ethnic/economic generalizations, culturally appropriated slang, military/political/controversial-history metaphors. Don't use politically disputed places in examples; keep mixed-region examples at the same level.
- Gender: neutral nouns (nhân viên not nam/nữ nhân viên); no sexist figures of speech; plural generics (các bạn, họ, quý vị); role nouns (khách hàng, người dùng, tác giả); rewrite to bạn / người đó. If unavoidable for a single unknown person, a plural "họ" is acceptable; never "anh ấy, cô ấy" or slash forms (except legal/license term tables). Gendered pronouns are fine for real people who use them. Balance roles/examples between genders.
- Disability: person-first ("người khuyết tật"); never pity words (khổ, đau khổ, tật nguyền); don't mention a disability unless relevant.
- Accessibility: input-agnostic verbs ("Chọn" over "Nhấp (vào)"; "bấm" is fine for generic UI); short paragraphs, about one verb per sentence; read aloud as a screen reader would; spell out "và", "cộng", "khoảng" instead of &, +, ~.
- Comply with Vietnamese law (content/maps/names).

## 10. Keyboard
- Key names: keep Alt, Backspace, Caps Lock, Delete, End, Enter, Esc, Home, Insert, Num Lock, Page Down/Up, Pause, Scroll Lock, Shift, Tab, print screen; Ctrl → Control; arrows → Mũi tên Lên/Xuống/Trái/Phải; Spacebar → Cách trống; menu key → phím menu.
- Shortcut/access keys: avoid accented letters as access keys (no standard input method); thin letters (i l t r f) and descender letters (g j p q y) are fine; duplicates allowed only if no other character; extra letter/number/punctuation in brackets after the label is allowed but discouraged; if none is available, assign none. Standard shortcuts (Ctrl+C etc.) keep Latin keys unchanged across locales. Don't distinguish numeric-keypad keys unless the software does.

## 11. Voice/video narration
Single topic, brief, intent-led, empathetic, conversational; keep English product names English-pronounced; acronyms either spoken as words (LAN, WAN) or letter by letter (HTML, SQL); omit "http://", read "www" as "v đúp v đúp v đúp", "." as "chấm"; skip recaps; northern dialect is the standard.

## Review checklist (use when auditing a batch)
1. Meaning/intent preserved, nothing invented. 2. Natural, not word-for-word. 3. Sentence case. 4. Punctuation (spaces, và/hoặc comma, decimals, %). 5. Errors: "Không … được / Không tìm thấy / Có lỗi.", ends with a period, says what to do. 6. Modern short words; no stacked "việc/sự/một cách". 7. Placeholders and product names intact. 8. Gender-neutral, person-first, no biased examples. 9. One term per concept. 10. Fits the space; fragments over sentences.
