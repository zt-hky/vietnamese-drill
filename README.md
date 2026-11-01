<div align="center">

<img src="assets/logo.png" alt="vietnamese-drill: chữ vietnamese skill, cụm sk bị gạch và viết đè thành dr" width="820">

# vietnamese-drill

**Cho AI agent viết tiếng Việt có flow: mượt, rõ nghĩa, đúng thuật ngữ, vừa khít giao diện.**

Một skill duy nhất · 7.858 thuật ngữ · 21 gói ngành · 35 bề mặt UI có giới hạn độ dài · checker offline · subagent review.

[![License: MIT](https://img.shields.io/badge/license-MIT-ff4fd8?style=flat-square)](LICENSE)
[![Agent Skills](https://img.shields.io/badge/Agent%20Skill-1%20skill%20·%203%20modes-3df5ff?style=flat-square)](skills/vietnamese)
[![Glossary](https://img.shields.io/badge/glossary-7.858%20terms-ffe14d?style=flat-square)](skills/vietnamese/glossary)
[![vi-VN](https://img.shields.io/badge/locale-vi--VN-ff7a3c?style=flat-square)](#)

**[Mic check](#-mic-check) · [Beat drop](#-beat-drop-trước-và-sau) · [Cài đặt](#-cài-1-lệnh) · [Từng agent](#-featuring-cài-cho-từng-agent) · [Bề mặt UI](#-bề-mặt-ui-viết-vừa-khít-chỗ-hiển-thị) · [Từ điển](#-từ-điển-to-nhưng-nạp-nhỏ) · [Kết quả đo](#-đo-thật-không-chém) · [Tracklist](#-tracklist)**

</div>

---

## 🎤 Mic check

Yo. Nhờ AI viết tiếng Việt là kiểu gì cũng gặp mấy câu này:

> *"Đã cam kết các thay đổi và triển khai đến sản xuất."*
> *"Thực hiện việc lưu cài đặt."*
> *"Đã xảy ra lỗi."*

Đọc thì hiểu, nhưng nghe như Google Dịch. **commit** thành "cam kết", **production** thành "sản xuất". Nút bấm dài tràn khung. Thông báo đẩy chỉ ghi "Bạn có thông báo mới". Thuật ngữ ngành mỗi màn hình một kiểu.

`vietnamese-drill` là bộ luật chơi cho agent khi đụng vào tiếng Việt trong phần mềm:

- **Đúng thuật ngữ:** từ điển 7.858 mục, gồm 21 gói ngành (fintech, y tế, giáo dục, logistics…). Agent chỉ nạp vài dòng liên quan, không nạp cả kho.
- **Vừa khít giao diện:** mỗi chuỗi biết nó nằm ở đâu (nút, lỗi dưới ô nhập, thông báo đẩy, SMS…), độ dài tối đa bao nhiêu, trên màn hình đã có chữ gì.
- **Giữ chất kỹ thuật:** `commit`, `deploy`, `endpoint` giữ tiếng Anh khi dân dev vẫn nói vậy. Không dịch tên biến, key i18n, placeholder.
- **Chuẩn i18n:** NFC, `vi-VN`, ngày/tháng/năm, không ghép mảnh câu.
- **Nói gọn mà không cụt:** bớt filler, không bỏ phủ định, số liệu, cảnh báo hay bước tiếp theo.

### Sao lại là "drill"?

Nhìn logo: chữ **"skill"** bị gạch **"sk"**, viết đè **"dr"**, thành **"drill"**. Drill là dòng nhạc nhịp chắc, không thừa chữ nào. Tiếng Việt trong sản phẩm cũng nên vậy: **gọn, rõ, đúng nhịp người đọc**.

---

## 🔥 Beat drop: trước và sau

| Ngữ cảnh | ❌ Chưa có drill | ✅ Có drill |
|---|---|---|
| Commit, tài liệu Git | Cam kết các thay đổi lên nhánh chính | Commit các thay đổi lên nhánh `main` |
| Nút trong hộp thoại "Xóa thẻ này?" | Xóa thẻ này | Xóa |
| Nút rộng tối đa 18 ký tự | Nạp tiền vào ví ngay để tiếp tục thanh toán hóa đơn tự động | Nạp tiền ngay |
| Lỗi ngay dưới ô "Số tiền" | Số tiền phải từ 10.000 VND đến 50.000.000 VND. | Nhập từ 10.000 VND đến 50.000.000 VND. |
| Thông báo đẩy (đứng một mình) | Thanh toán thất bại | Không thanh toán được 250.000 ₫ cho EVN Hà Nội do số dư không đủ. Nạp thêm tiền để thử lại. |
| Toast sau khi bấm Lưu | Thao tác lưu đã được thực hiện thành công! | Đã lưu |
| Fintech: "Send money" | Gửi tiền | Chuyển tiền (gửi tiền là gửi tiết kiệm) |
| Giáo dục: "Submit homework" | Gửi bài tập về nhà | Nộp bài tập về nhà |
| Dịch vụ công: "Receipt number" | Số biên lai | Mã số biên nhận hồ sơ |
| Lỗi dịch từ "failed" | Lưu hình ảnh thất bại. | Không lưu được hình ảnh. |
| Viết hoa nút bấm | Chọn Tất Cả | Chọn tất cả |
| Agent trả lời | Tôi rất vui được hỗ trợ bạn! Dưới đây là những thay đổi… | Đã sửa `parseDate`. Đã chạy `npm test`: 42/42 pass. |

> Cột ✅ là ví dụ. Điều kiện kèm theo vẫn phải đúng thực tế: chỉ ghi "thử lại" khi app thật sự cho thử lại.

---

## ⚡ Cài 1 lệnh

```bash
npx skills add zt-hky/vietnamese-drill
```

[`skills` CLI](https://www.npmjs.com/package/skills) tự dò agent trên máy (Claude Code, Codex, Cursor, Gemini CLI, OpenCode, Copilot, Windsurf…) và cài **một skill `vietnamese`**. Thêm `-g` để cài global, `npx skills update` để cập nhật.

> Nâng cấp từ v1.x: hai skill cũ `vietnamese-product` và `vietnamese-replies` đã gộp thành `vietnamese`. Gỡ bản cũ trước: `npx skills remove vietnamese-product vietnamese-replies`.

### Lười gõ lệnh? Đưa agent tự cài

```text
Cài skill tiếng Việt ở https://github.com/zt-hky/vietnamese-drill cho agent này.
Ưu tiên `npx skills add zt-hky/vietnamese-drill -g -a <agent-của-bạn> -y`.
Không chạy được thì copy thư mục skills/vietnamese vào thư mục skills global của agent.
Cài xong, liệt kê skill đã cài và đường dẫn.
```

---

## 🎧 Featuring: cài cho từng agent

### Claude Code

Cài dưới dạng plugin để có luôn subagent `vietnamese-reviewer`:

```bash
claude plugin marketplace add zt-hky/vietnamese-drill
claude plugin install vietnamese-drill@vietnamese-drill
```

Hoặc chỉ skill: `npx skills add zt-hky/vietnamese-drill -g -a claude-code`. Cài tay: copy `skills/vietnamese` vào `~/.claude/skills/` và `agents/vietnamese-reviewer.md` vào `~/.claude/agents/`. Muốn reviewer chạy model rẻ hơn, thêm `model: haiku` vào frontmatter của file agent.

### Codex (OpenAI)

```bash
npx skills add zt-hky/vietnamese-drill -g -a codex
```

Skill có `agents/openai.yaml` nên Codex tự gọi khi gặp chuỗi UI tiếng Việt. Subagent tùy chọn: copy [`codex/vietnamese_reviewer.toml`](codex/vietnamese_reviewer.toml) vào `~/.codex/agents/`. Phần Codex làm theo [tài liệu chính thức](https://developers.openai.com/codex/subagents) nhưng **chưa được chạy thử trực tiếp**.

### oh-my-pi (OMP): full combo

```bash
omp plugin install github:zt-hky/vietnamese-drill
```

OMP nhận đủ bộ: skill, rule luôn bật (2 dòng), tool `vi_lookup` + `vi_check`, subagent `vietnamese-reviewer`. Mở session mới để nạp. Muốn ghim reviewer sang model rẻ, thêm vào `~/.omp/agent/config.yml`:

```yaml
task:
  agentModelOverrides:
    vietnamese-reviewer: google-antigravity/gemini-3.8-flash
```

### Cursor · Gemini CLI · Antigravity · OpenCode · Copilot · Windsurf

```bash
npx skills add zt-hky/vietnamese-drill -g -a <cursor|gemini-cli|antigravity|opencode|github-copilot|windsurf>
```

Agent nào hỗ trợ chuẩn [Agent Skills](https://agentskills.io) thì copy nguyên thư mục `skills/vietnamese`. Agent chưa hỗ trợ skill: dán `SKILL.md` và `modes/ui.md` vào file rule của agent. Script cần Node.js 18 trở lên.

---

## 🧩 Một skill, nhiều tầng

`SKILL.md` chỉ là **router** (1.161 token). Agent đọc nó, chọn đúng một mode, rồi mới nạp phần cần:

| Việc | Nạp thêm | Từ điển |
|---|---|---|
| Trả lời bạn bằng tiếng Việt | `modes/replies.md` (268 token) | không |
| Viết/dịch/sửa chuỗi UI, lỗi, thông báo, file i18n, docs | `modes/ui.md` (1.490 token) | có |
| Review một lô chuỗi (playbook của subagent) | `modes/review.md` (861 token) | có |

Từ 3 chuỗi trở lên, agent chính giao **một lô** cho subagent `vietnamese-reviewer`. Subagent tự tra từ điển và chỉ trả các dòng cần sửa, nên từ điển không bao giờ vào context của agent chính. Nếu harness không hỗ trợ subagent, agent tự thực hiện đúng các bước đó.

---

## 📐 Bề mặt UI: viết vừa khít chỗ hiển thị

Cùng một câu tiếng Anh, viết khác nhau tùy nó nằm ở đâu. Mỗi chuỗi nên kèm `ctx`:

```json
{"id": "wallet.card.delete_dialog.confirm_button", "src": "Delete this card",
 "ctx": {"surface": "dialog_button", "near": "Xóa thẻ này?"}}
```

| Trường | Ý nghĩa |
|---|---|
| `surface` | Chỗ hiển thị, 1 trong 35 loại: `button`, `dialog_button`, `field_error`, `toast`, `push_title`, `push_body`, `sms`, `empty_body`, `store_title`… (`vi.mjs surfaces`) |
| `max` | Giới hạn ký tự thực tế tại vị trí hiển thị (thiết kế, nút cố định độ rộng). Có `max` là bắt buộc phải vừa |
| `near` | Chữ đã hiện ngay cạnh (tiêu đề hộp thoại, nhãn ô nhập). **Đã có trên màn hình thì không lặp lại** |
| `standalone` | Hiện một mình (push, SMS, toast chạy nền). Phải tự đủ ý: chuyện gì, cái gì, làm gì tiếp |

Mỗi bề mặt trong [`glossary/surfaces.tsv`](skills/vietnamese/glossary/surfaces.tsv) có: độ dài khuyến nghị, giới hạn cứng, số dòng, dấu câu cuối, khuôn nội dung, **khi nào được lược**, **nội dung tối thiểu khi đứng một mình**, ví dụ đúng/sai.

- **Giới hạn cứng có nguồn:** App Store/Google Play title 30, Google Play short description 80, App Store promotional text 170, SMS có dấu 70 ký tự/đoạn (67 khi ghép nhiều đoạn), nút bấm 25 (MoMo UX Writing).
- **Còn lại là khuyến nghị biên tập**, ghi nguồn `E`, chỉnh theo sản phẩm. `ctx.max` luôn được ưu tiên cao nhất.
- **Không có `ctx`:** agent suy ra bề mặt từ tên key (`*.button`, `error.*`, `*.push.body`), ghi rõ giả định; với lỗi hoặc thông báo thì mặc định viết bản tối thiểu đủ ý.

Checker ở chế độ items báo `LENGTH_HARD`, `LENGTH_OVER`, `SMS_SEGMENTS`, `END_PUNCT`, `REDUNDANT_CONTEXT`, `NO_NEXT_STEP`. Model không đếm ký tự chính xác, nên quy trình bắt buộc kiểm tra rồi sửa đến khi hết lỗi.

---

## 📚 Từ điển to nhưng nạp nhỏ

| Tầng | Số mục | Nguồn |
|---|---|---|
| `core` | 330 | Thuật ngữ UI chọn lọc thủ công, đối chiếu Android, Firefox, Microsoft Terminology |
| `ui-ext` | 3.499 | Cụm đã phát hành trong Android (AOSP) và Firefox, bản dịch nhất quán từ 70% trở lên |
| 21 gói ngành | 4.029 | fintech · ecommerce · healthcare · education · logistics · hr · accounting · insurance · legal · realestate · travel · food · telecom · saas · dev · gaming · transport · erp · media · gov · security |

**Định tuyến không tốn token:** script chấm điểm từng gói theo số thuật ngữ khớp trong lô chuỗi, tự chọn tối đa 3 gói. Biết ngành của sản phẩm thì truyền `--domains fintech`. Thứ tự ưu tiên: glossary dự án > gói ngành > core > ui-ext.

```bash
echo '{"strings":[{"id":"1","src":"Top up your e-wallet via VietQR"},{"id":"2","src":"Your loan application was approved"}]}' \
  | node skills/vietnamese/scripts/vi.mjs lookup
```

```text
Packs: fintech, core. Industry and project terms: use them. Core/ui-ext lines: defaults for short labels…
# fintech
e-wallet = ví điện tử
vietqr = VietQR | Keep brand name
loan application = đăng ký vay | alt: hồ sơ vay
# core
top up = Nạp tiền
```

| Nạp vào context | Token (o200k) |
|---|---|
| Cả kho | 133.858 |
| Phần từ điển được nạp, trung bình cho một lô 12 chuỗi | **345** (tối đa 610) |
| Phần từ điển kèm đặc tả bề mặt, lô 11 chuỗi có `ctx` | 773–1.154 |

**Khi hai nghĩa xung đột thì hiển thị cả hai, không tự động ghi đè.** Ví dụ "profile" trong UI là "Hồ sơ", trong gói `dev` là "cấu hình"; agent chọn theo ngữ cảnh. Glossary của dự án (mẫu ở `glossary/project.template.tsv`) truyền bằng `--glossary`.

---

## 🧪 Checker offline

Chỉ cần Node.js, không dependency, không gọi mạng, không tự sửa gì.

```bash
node skills/vietnamese/scripts/vi.mjs surfaces           # 35 bề mặt + giới hạn
node skills/vietnamese/scripts/vi.mjs packs              # 21 gói ngành + số mục
node skills/vietnamese/scripts/vi.mjs lookup  < items.json
node skills/vietnamese/scripts/vi.mjs check   < items.json   # {"items":[{id,src,tgt,ctx}]}
```

| Kiểm được | Không kiểm (nói thẳng) |
|---|---|
| Độ dài theo bề mặt/`ctx.max`, số đoạn SMS, dấu câu cuối, lặp chữ đã có trên màn hình, lỗi thiếu bước tiếp theo | Câu có tự nhiên hay không. Phần này để subagent hoặc người review |
| Dạng bị loại trong từ điển (`GLOSSARY_AVOID`), gồm cả gói ngành tự định tuyến | Parse ICU, HTML, Markdown đầy đủ |
| Placeholder, key JSON, NFC, lẫn kiểu dấu thanh (`hóa`/`hoá`) | Font, layout, hiển thị thật trên UI |
| Gợi ý phong cách: "… thất bại", Viết Hoa Từng Chữ, `80 %`, ngày kiểu Mỹ, `9 PM` | Chấm "điểm tiếng Việt". Không có con số ảo |

Exit code: `0` sạch hoặc chỉ có cảnh báo · `1` có lỗi · `2` request sai định dạng. Test engine: `node --test tests/`.

---

## 📊 Đo thật, không chém

Chi tiết, kịch bản chạy lại và cả những lần thất bại ở [`evals/README.md`](evals/README.md). Model sinh: Gemini 3.8 Flash. Chấm mù (không biết bản nào có skill) bằng Claude Sonnet và GPT.

| Phép đo | Không skill | Có skill |
|---|---|---|
| Thuật ngữ ngành dùng đúng, 188 chuỗi held-out viết sau khi chốt từ điển | 78,3% | **94,0%** |
| Độ tự nhiên trên cùng bộ (chấm mù bằng Claude / GPT) | 56 / 59 | 56 / 55 (hòa) |
| Lỗi độ dài/dấu câu/thiếu bước tiếp theo trên 44 chuỗi có `ctx` (2 lượt) | 12 và 12 | 2 và 2; **0** sau một vòng check-sửa |
| Định tuyến đúng gói cho lô 12 chuỗi cùng app | – | 21/21 |
| Gói ngành do model khác chấm mẫu (210 dòng): chuẩn / chấp nhận / sai | – | 85,7% / 13,3% / 1,0% |

Nói thẳng:
- **Lần chạy v2 đầu tiên thua bản không skill** về độ tự nhiên (90:59). Nguyên nhân: từ lõi bị ép sai nghĩa ("Gửi bài tập" thay vì "Nộp bài tập"), lỗi so khớp ("card" khớp "car"), vài thuật ngữ quá trang trọng. Sửa xong mới về mức hòa trên bộ mới.
- **Skill làm thuật ngữ nhất quán và chuỗi vừa khít UI; nó không làm câu văn "hay hơn" theo đánh giá của LLM.** So với bản dịch chuyên nghiệp của Android/Firefox, hai bên ngang nhau (chrF 79,4 và 78,3).
- **Gói ngành do model soạn**, được hai model khác rà soát lại, chưa qua chuyên gia từng ngành. Nội dung pháp lý, y tế, tài chính nên có glossary của dự án.

---

## 💿 Tracklist

```text
vietnamese-drill/
├── skills/vietnamese/                 # MỘT skill
│   ├── SKILL.md                       # router: chọn mode, định tuyến gói, lệnh
│   ├── modes/ui.md · replies.md · review.md
│   ├── glossary/
│   │   ├── core.tsv · ui-ext.tsv · domains/*.tsv (21 gói)
│   │   ├── surfaces.tsv               # 35 bề mặt UI: độ dài, dấu câu, lược bớt, tối thiểu
│   │   ├── index.json                 # số mục, nhóm con của từng gói
│   │   └── project.template.tsv
│   ├── scripts/vi.mjs                 # CLI: lookup · check · route · packs · surfaces
│   ├── scripts/glossary.mjs           # index, định tuyến, so khớp, lint
│   ├── scripts/surfaces.mjs           # luật bề mặt UI
│   ├── references/                    # microsoft-vi-style · locale-and-glossary · sources
│   └── agents/openai.yaml             # Codex
├── agents/vietnamese-reviewer.md      # subagent: Claude Code + OMP
├── codex/vietnamese_reviewer.toml     # subagent tùy chọn cho Codex
├── tools/vi-check.ts · rules/vietnamese.md   # OMP
├── .claude-plugin/                    # plugin + marketplace Claude Code
├── evals/                             # bộ đo, kết quả, thất bại
└── tests/                             # node --test
```

---

## 🛡️ Dữ liệu đi đâu

- `vi.mjs` / `vi_lookup` / `vi_check`: **chạy 100% trên máy**, chỉ đọc thư mục `glossary/` và file glossary dự án bạn truyền vào.
- `vietnamese-reviewer`: lô chuỗi được gửi tới provider của model mà subagent đang dùng. Skill dặn bỏ secret và dữ liệu khách hàng trước khi gửi; bạn vẫn nên tự kiểm tra.

---

## 🤝 Vào cypher

Gặp thuật ngữ sai, ngành chưa có hay giới hạn độ dài chưa đúng? Mở issue kèm câu gốc, câu agent viết, ngữ cảnh (bề mặt, người đọc) và câu bạn thấy đúng. PR sửa từ điển: giữ đủ 8 cột TSV, chạy `node skills/vietnamese/scripts/vi.mjs build-index` và `node --test tests/`.

---

## 📼 Liner notes

Tham khảo: [Microsoft Vietnamese Localization Style Guide](https://download.microsoft.com/download/b/f/e/bfecb1b4-21ab-48fd-a48c-c2471b026f8f/vie-vnm-StyleGuide.pdf) · [Microsoft Terminology](https://learn.microsoft.com/en-us/globalization/reference/microsoft-terminology) (chỉ dùng để đối chiếu, không phân phối lại) · [AOSP](https://source.android.com/) (Apache-2.0) · [Firefox for Android](https://github.com/mozilla-mobile/firefox-android) (MPL-2.0) · [MoMo UX Writing Guideline](https://zeroheight.com/780fb2963/p/7649f6-gioi-thieu) · [Nguyen LNP](https://nguyenlnp.com/vietnamese-localization-style-guide/) · [GTE Localize](https://gtelocalize.net/vietnamese-localization/) · [trussary/vietnamese-language-skill](https://github.com/trussary/vietnamese-language-skill) · [abm-dungtq/viet-pro](https://github.com/abm-dungtq/viet-pro) · [caveman](https://github.com/JuliusBrussee/caveman). Nguồn gốc từng tầng dữ liệu, cách kiểm định và giới hạn: [`references/sources.md`](skills/vietnamese/references/sources.md).

Logo dùng font [Pricedown](https://typodermicfonts.com/pricedown/) (Typodermic, bản free cho thiết kế tĩnh), [Mr Dafoe](https://fonts.google.com/specimen/Mr+Dafoe) và [Be Vietnam Pro](https://fonts.google.com/specimen/Be+Vietnam+Pro) (SIL OFL). Không liên quan tới Rockstar Games hay GTA. License: [MIT](LICENSE).

---

<div align="center">

### 🎙️ Outro

*README này 100% do AI agent viết bằng chính skill `vietnamese`.*

**Peace out. Viết tiếng Việt cho có flow. ✌️**

</div>
