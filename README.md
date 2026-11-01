<div align="center">

<img src="assets/logo.png" alt="vietnamese-drill: chữ vietnamese skill, cụm sk bị gạch và viết đè thành dr" width="820">

# vietnamese-drill

**Cho AI agent viết tiếng Việt có flow: mượt, rõ nghĩa, giữ đúng thuật ngữ kỹ thuật.**

Skill · Rule · Checker offline cho tài liệu, UI/UX, web content, notification và i18n.

[![License: MIT](https://img.shields.io/badge/license-MIT-ff4fd8?style=flat-square)](LICENSE)
[![Agent Skills](https://img.shields.io/badge/Agent%20Skills-2%20skills-3df5ff?style=flat-square)](skills)
[![oh-my-pi plugin](https://img.shields.io/badge/oh--my--pi-plugin-ffe14d?style=flat-square)](#oh-my-pi-omp-full-combo)
[![vi-VN](https://img.shields.io/badge/locale-vi--VN-ff7a3c?style=flat-square)](#)

**[Mic check](#-mic-check) · [Beat drop: trước/sau](#-beat-drop-trước-và-sau) · [Cài 1 lệnh](#-cài-1-lệnh) · [Featuring: từng agent](#-featuring-cài-cho-từng-agent) · [Checker](#-checker-offline) · [Tracklist](#-tracklist)**

</div>

---

## 🎤 Mic check

Yo. Nhờ AI viết tiếng Việt là kiểu gì cũng gặp mấy câu này:

> *"Đã cam kết các thay đổi và triển khai đến sản xuất."*
> *"Thực hiện việc lưu cài đặt."*
> *"Đã xảy ra lỗi."*

Đọc thì hiểu, nhưng nghe như Google Dịch. **commit** biến thành "cam kết", **production** biến thành "sản xuất". Nút bấm dài dòng. Thông báo lỗi không nói hỏng chỗ nào, cũng không nói người dùng nên làm gì tiếp.

`vietnamese-drill` là bộ luật chơi cho agent khi đụng vào tiếng Việt trong phần mềm:

- **Giữ chất kỹ thuật:** `commit`, `deploy`, `production`, `endpoint`, `cache`… giữ tiếng Anh khi dân dev vẫn nói vậy.
- **Đúng người đọc:** tài liệu cho dev khác UI cho người dùng cuối. UI dùng "Lưu", "Đăng nhập", "Tải xuống", không đẩy jargon lên mặt người dùng.
- **Không phá code:** không dịch tên biến, key i18n, placeholder, path, lệnh CLI.
- **Chuẩn i18n:** NFC, `vi-VN`, không ghép mảnh câu, ICU phức tạp thì kiểm bằng compiler thật của dự án.
- **Nói gọn mà không cụt:** bớt filler, nhưng không bao giờ bỏ phủ định, điều kiện, số liệu hay cảnh báo.

### Sao lại là "drill"?

Nhìn logo: chữ **"skill"** bị gạch **"sk"**, viết đè **"dr"**, thành **"drill"**.

Drill là dòng nhạc nhịp chắc, flow dày, không thừa chữ nào. Tiếng Việt trong sản phẩm cũng nên vậy: **gọn, rõ, đúng nhịp người đọc**. Skill thì có rồi, giờ lên drill.

---

## 🔥 Beat drop: trước và sau

Ví dụ hay gặp khi agent chưa có skill so với khi đã có `vietnamese-drill`:

| Ngữ cảnh | ❌ Chưa có drill | ✅ Có drill |
|---|---|---|
| Commit, tài liệu Git | Cam kết các thay đổi lên nhánh chính | Commit các thay đổi lên nhánh `main` |
| Tài liệu deploy | Triển khai ứng dụng đến môi trường sản xuất | Deploy ứng dụng lên production |
| Nút bấm | Thực hiện việc lưu cài đặt | Lưu cài đặt |
| Thông báo lỗi | Đã xảy ra lỗi. | Không lưu được cài đặt. Kiểm tra kết nối rồi thử lại. |
| Notification | Đơn hàng của bạn đã được xác nhận bởi hệ thống thành công! | Đơn hàng #1024 đã được xác nhận. Dự kiến giao ngày 05/11. |
| Spec, RFC | Bạn sẽ tự động thử lại request khi gặp lỗi | Hệ thống tự động retry request khi gặp lỗi |
| Câu văn dịch | Việc áp dụng cache giúp cho sự phản hồi trở nên nhanh hơn một cách đáng kể | Dùng cache giúp phản hồi nhanh hơn rõ rệt |
| File i18n | `"Xin chào {user}"` cho source `"Hello {name}"` | `"Xin chào {name}"`. Checker báo lỗi `PLACEHOLDER` nếu đổi tên biến |
| Agent trả lời | Tôi rất vui được hỗ trợ bạn! Dưới đây là những thay đổi mà tôi đã thực hiện… | Đã sửa `parseDate`. Đã chạy `npm test`: 42/42 pass. Còn lại: chưa test trên Safari. |
| Code trong câu trả lời | `` `/tối-ưu-hoá` `` (dịch luôn tên lệnh) | Chạy `` `/optimize` ``. Lệnh này tối ưu code hiện tại. |
| Lỗi dịch từ "failed" | Lưu hình ảnh thất bại. | Không lưu được hình ảnh. |
| Viết hoa nút bấm | Chọn Tất Cả | Chọn tất cả |
| Câu cầu kỳ | Hãy bắt đầu sử dụng phiên bản đầy đủ ngay | Dùng ngay phiên bản đầy đủ |
| Dấu phẩy kiểu Anh | Chọn mạng A, B, và C | Chọn mạng A, B và C |
| Đơn vị, phần trăm | Đã dùng 80 % bộ nhớ | Đã dùng 80% bộ nhớ |
| Giới tính | Nếu nhân viên nam hoặc nữ quên mật khẩu, anh ấy/cô ấy có thể đặt lại | Nhân viên quên mật khẩu có thể đặt lại |

> Các câu ở cột ✅ chỉ là ví dụ. Điều kiện kèm theo vẫn phải đúng thực tế: chỉ ghi "thử lại" khi app thật sự cho thử lại, chỉ ghi ngày giao khi có dữ liệu.

---

## ⚡ Cài 1 lệnh

Dùng [`skills` CLI](https://www.npmjs.com/package/skills). Một lệnh cài được cho Claude Code, Codex, Cursor, Gemini CLI, OpenCode, GitHub Copilot, Windsurf và nhiều agent khác:

```bash
npx skills add zt-hky/vietnamese-drill
```

CLI tự dò agent có trên máy và hỏi cài vào đâu. Vài flag hay dùng:

```bash
npx skills add zt-hky/vietnamese-drill --list         # xem có gì trước khi cài
npx skills add zt-hky/vietnamese-drill -g             # cài global cho user, không cài theo project
npx skills add zt-hky/vietnamese-drill -g --all       # mọi skill, mọi agent, không hỏi
npx skills update                                     # kéo bản mới
```

### Lười gõ lệnh? Đưa agent tự cài

Dán đoạn này vào agent đang dùng:

```text
Cài bộ skill tiếng Việt ở https://github.com/zt-hky/vietnamese-drill cho agent này.
Ưu tiên chạy `npx skills add zt-hky/vietnamese-drill -g -a <agent-của-bạn> -y`.
Nếu không chạy được, copy thư mục skills/vietnamese-product và skills/vietnamese-replies
vào thư mục skills global của agent. Cài xong, liệt kê skill đã cài và đường dẫn.
```

---

## 🎧 Featuring: cài cho từng agent

Mỗi agent đọc skill ở một thư mục riêng. Lệnh `npx` bên dưới cài global (`-g`) cho đúng một agent (`-a`). Muốn cài theo project thì bỏ `-g`.

### oh-my-pi (OMP): full combo

OMP nhận **full set**: 2 skill, rule luôn bật (2 dòng), tool `vi_check` + `vi_lookup`, subagent `vietnamese-reviewer`.

```bash
omp plugin install github:zt-hky/vietnamese-drill
```

Mở session mới để nạp rule và tool. Gỡ bằng `omp plugin uninstall vietnamese-drill`. Cập nhật bằng `omp plugin upgrade vietnamese-drill`.

Subagent mặc định chạy cùng model với session. Muốn ghim sang model rẻ (ví dụ Gemini Flash), thêm vào `~/.omp/agent/config.yml`:

```yaml
task:
  agentModelOverrides:
    vietnamese-reviewer: google-antigravity/gemini-3.8-flash
```

> Chỉ cần skill thôi? `npx skills add zt-hky/vietnamese-drill -g -a pi` cũng chạy được, vì OMP đọc cả `~/.agents/skills`.

### Claude Code

Cài như plugin, có luôn subagent `vietnamese-reviewer`:

```bash
claude plugin marketplace add zt-hky/vietnamese-drill
claude plugin install vietnamese-drill@vietnamese-drill
```

Hoặc chỉ cài skill: `npx skills add zt-hky/vietnamese-drill -g -a claude-code`. Cài tay: copy hai thư mục trong `skills/` vào `~/.claude/skills/` (theo project: `.claude/skills/`) và `agents/vietnamese-reviewer.md` vào `~/.claude/agents/`.

Muốn reviewer chạy model rẻ hơn, thêm `model: haiku` vào frontmatter của file agent.

### Codex (OpenAI)

```bash
npx skills add zt-hky/vietnamese-drill -g -a codex
```

Cài tay: `~/.agents/skills/` (theo project: `.agents/skills/`). Skill có sẵn `agents/openai.yaml` nên Codex tự gọi được khi gặp chuỗi UI tiếng Việt.

Subagent tuỳ chọn: copy [`codex/vietnamese_reviewer.toml`](codex/vietnamese_reviewer.toml) vào `~/.codex/agents/`. Không có file này thì skill vẫn chạy: Codex dùng subagent mặc định với lời nhắc trong `SKILL.md`. Phần Codex chưa được tác giả chạy thử trực tiếp, chỉ làm theo [tài liệu chính thức](https://developers.openai.com/codex/subagents).

### Cursor

```bash
npx skills add zt-hky/vietnamese-drill -g -a cursor
```

Cài tay: `~/.cursor/skills/`. Theo project thì dùng `.agents/skills/`.

### Gemini CLI

```bash
npx skills add zt-hky/vietnamese-drill -g -a gemini-cli
```

Cài tay: `~/.gemini/skills/`.

### Antigravity

```bash
npx skills add zt-hky/vietnamese-drill -g -a antigravity
```

Cài tay: `~/.gemini/antigravity/skills/`.

### OpenCode · GitHub Copilot · Windsurf

```bash
npx skills add zt-hky/vietnamese-drill -g -a opencode
npx skills add zt-hky/vietnamese-drill -g -a github-copilot
npx skills add zt-hky/vietnamese-drill -g -a windsurf
```

Cài tay lần lượt vào `~/.config/opencode/skills/`, `~/.copilot/skills/`, `~/.codeium/windsurf/skills/`.

### Agent khác

Agent nào hỗ trợ chuẩn [Agent Skills](https://agentskills.io) (`<thư-mục-skills>/<tên>/SKILL.md`) thì copy nguyên hai thư mục `skills/vietnamese-product` và `skills/vietnamese-replies`. Giữ cả `scripts/` và `references/` bên trong.

Agent chưa hỗ trợ skill: dán nội dung `SKILL.md` vào file rule hoặc instruction của agent đó (ví dụ `AGENTS.md`, `.cursor/rules/`). Bỏ phần frontmatter giữa hai dòng `---`.

---

## 📚 Từ điển UI chuẩn

`skills/vietnamese-product/assets/glossary.vi-ui.tsv`: **329 thuật ngữ** giao diện (Lưu, Hủy, Cài đặt, Tải xuống, Đăng nhập, Thanh toán, Thông báo…), mỗi dòng ghi từ ưu tiên, dạng chấp nhận được, dạng **bị loại** và nguồn.

| Nguồn | Dùng để |
|---|---|
| Android (AOSP), Firefox cho Android | Cặp EN-VI thật từ sản phẩm đã phát hành (Apache-2.0, MPL-2.0) |
| Microsoft Terminology (19.427 thuật ngữ vi) | Đối chiếu thuật ngữ và phát hiện từ đã cũ ("thiết đặt", "hủy bỏ") |
| MoMo UX Writing, Microsoft style guide | Quy tắc nút bấm, thông báo lỗi, giọng văn |

174/329 dòng được từ hai nguồn trở lên đồng thuận, 59 dòng là quyết định biên tập (ghi rõ `E`). Chọn dạng ngắn, hiện đại hơn khi các hãng khác nhau.

**Không nhét cả từ điển vào prompt.** Agent chạy `check.mjs lookup` và chỉ nhận vài dòng liên quan tới chuỗi đang làm:

```bash
echo '{"strings":[{"id":"1","src":"Learn more"},{"id":"2","src":"Mute this conversation"}]}' \
  | node skills/vietnamese-product/scripts/check.mjs lookup
```

```text
learn more = Tìm hiểu thêm | avoid: Học thêm | "Học thêm" is a typical machine translation
mute … conversation = Tắt thông báo | alt: Tắt tiếng | Messaging apps: Tắt thông báo
```

| Nạp vào context | Token (o200k) |
|---|---|
| Cả glossary | 5.110 |
| Lát cắt cho 10 chuỗi / 62 chuỗi | **116** / 908 |
| `SKILL.md` (chỉ khi được kích hoạt) / playbook subagent | 1.660 / 660 |

Glossary của dự án (cùng cột TSV, mẫu ở `assets/project-glossary.template.tsv`) luôn thắng: `check.mjs lookup --glossary project.tsv`.

**Đã đo có hiệu quả không?** Có, vừa phải. Trên 62 chuỗi mới viết sau khi chốt từ điển: độ dùng đúng thuật ngữ của Gemini Flash từ **90,2% lên 96,7%**, Claude Haiku từ 94,6–95,7% lên 96,7–97,8%; giám khảo mù (Claude Sonnet) nghiêng về bản có glossary (27:19 và 38:30). Phép đo đầu tiên bị bão hoà (baseline đã 100% vì chuỗi Android/Firefox là dữ liệu công khai), và glossary trần trụi từng làm câu dịch sát chữ hơn trước khi thêm lời nhắc "tự nhiên". Toàn bộ số liệu, thất bại và cách chạy lại ở [`evals/README.md`](evals/README.md).

---

## 🧪 Checker offline

Kiểm những lỗi máy bắt được, khỏi tốn token LLM. Chỉ cần Node.js, không có dependency, không gọi mạng, không tự sửa gì. Chỉ đọc glossary đi kèm (và file glossary dự án nếu bạn truyền `--glossary`).

```bash
echo '{"text":"Xin chào {user}","sourceText":"Hello {name}"}' \
  | node skills/vietnamese-product/scripts/check.mjs
```

```json
{"status":"error","findings":[{"code":"PLACEHOLDER","severity":"error","path":"$","message":"Supported placeholder names/types/counts differ from source"}],"total":1,"truncated":false,"semanticReview":"not-run"}
```

File i18n dạng JSON thì thêm `"mode":"json"`: checker so từng leaf key, kiểu dữ liệu và placeholder với file nguồn.

| Kiểm được | Không kiểm (nói thẳng) |
|---|---|
| Unicode chưa NFC, ký tự ẩn hoặc lỗi | Câu có tự nhiên hay không. Phần này để LLM hoặc người review |
| JSON thiếu/thừa key, đổi kiểu, đổi giá trị không phải chuỗi | Parse ICU, HTML, Markdown đầy đủ |
| Placeholder `{name}`, `{{name}}`, `${name}`, `%s`, `%1$d`… | Font, layout, hiển thị thật trên UI |
| Vài cụm dịch sát quen mặt (`cam kết các thay đổi`…) | Chấm "điểm tiếng Việt". Không có con số ảo |
| Gợi ý phong cách và địa phương hoá (chỉ là cảnh báo): dấu cách trước dấu câu, dấu phẩy trước `và`/`hoặc`, `80 %`, "… thất bại", `xin vui lòng`, Viết Hoa Từng Chữ, ngày kiểu Mỹ `12/15/2024`, `9 PM`, lẫn `tệp`/`tập tin`, lẫn `bạn`/`quý khách` | Quyết định có nên nghe theo gợi ý hay không. Ngoại lệ như trích dẫn, tên riêng vẫn do bạn quyết |
| ICU phức tạp: báo `ICU_UNCHECKED`, không cho qua im lặng | |
| Khi có `sourceText`: dạng bị loại trong glossary (`GLOSSARY_AVOID`: `Học thêm`, `Thiết đặt`, `Đăng ký` cho Sign in…); dạng ưu tiên vắng mặt chỉ báo mức `info` (`GLOSSARY_MISS`) | Biến thể hợp lệ ngoài glossary, nghĩa của câu |
| Lẫn kiểu dấu thanh trong cả lô (`hóa`/`hoá`, `hủy`/`huỷ`: `TONE_MIX`) | |

Exit code: `0` sạch hoặc chỉ có cảnh báo · `1` lỗi contract · `2` request sai định dạng.

---

## 💿 Tracklist

```text
vietnamese-drill/
├── skills/
│   ├── vietnamese-product/             # UI/UX, content, notification, i18n (kích hoạt khi cần)
│   │   ├── SKILL.md
│   │   ├── agents/openai.yaml          # Codex: gọi ngầm được
│   │   ├── scripts/check.mjs           # checker + lookup (CLI)
│   │   ├── scripts/glossary.mjs        # nạp, khớp, lint glossary
│   │   ├── assets/glossary.vi-ui.tsv   # 329 thuật ngữ UI
│   │   ├── assets/project-glossary.template.tsv
│   │   └── references/                 # reviewer, microsoft-vi-style, locale-and-glossary, sources
│   └── vietnamese-replies/             # cách agent trả lời bạn bằng tiếng Việt
├── agents/vietnamese-reviewer.md       # subagent dùng chung Claude Code + OMP
├── codex/vietnamese_reviewer.toml      # subagent tuỳ chọn cho Codex
├── .claude-plugin/                     # plugin + marketplace cho Claude Code
├── rules/vietnamese.md                 # OMP: rule luôn bật, 2 dòng
├── tools/vi-check.ts                   # OMP: tool vi_check + vi_lookup
├── evals/                              # bộ đo hiệu quả, kết quả và thất bại
└── package.json                        # manifest plugin OMP
```

| Track | Vai trò | Ai dùng |
|---|---|---|
| `vietnamese-product` | Chuẩn hoá chữ trong phần mềm: docs, UI, web, noti, i18n | Mọi agent |
| `vietnamese-replies` | Chuẩn hoá cách agent trả lời: gọn, có dẫn chứng, giữ technical English | Mọi agent |
| `check.mjs` (`check`, `lookup`) | Kiểm lỗi cơ học và lấy lát cắt glossary, chạy local | Mọi agent có Node (OMP có sẵn tool `vi_check`, `vi_lookup`) |
| `vietnamese-reviewer` | Dịch/review **một batch** chuỗi UI, tự gọi `lookup`, chỉ trả dòng đã đổi | Claude Code, OMP, Codex (tuỳ chọn) |
| `rules/vietnamese.md` | Nhắc agent dùng đúng skill khi gặp UI tiếng Việt | OMP |

---

## 🧠 Flow chạy và vì sao ít tốn token

Học từ [caveman](https://github.com/JuliusBrussee/caveman): nói ít, nhưng giữ đủ ý.

1. **Chỉ kích hoạt khi cần.** Description hẹp: chỉ chuỗi UI/product copy tiếng Việt, không phải chat. Việc khác không tốn token nào ngoài dòng mô tả.
2. **Agent chính không nạp glossary.** Với 3 chuỗi trở lên, nó giao **một batch** cho subagent kèm đường dẫn skill. Subagent đọc playbook (660 token), chạy `lookup`, trả về các dòng đã đổi. Harness không có subagent thì agent tự làm đúng các bước đó.
3. **Chỉ lấy phần liên quan.** 116 token cho 10 chuỗi thay vì 5.110 token cho cả từ điển. Đo được: dán cả từ điển còn cho kết quả kém hơn lát cắt.
4. **Checker local chạy sau**: placeholder, key, NFC, dạng bị loại bằng code, không bằng LLM.
5. **Gọn nhưng không cụt.** Lát cắt luôn kèm một dòng nhắc "phần còn lại phải tự nhiên, bỏ 'của bạn' khi đã rõ". Thiếu dòng này, model dịch sát chữ hơn (đã đo).

Glossary của dự án luôn thắng. Dự án đã chọn "máy chủ" thay vì "server" thì agent theo dự án.

---

## 🛡️ Dữ liệu đi đâu

- `check.mjs` / `vi_check`: **chạy 100% trên máy**, không gửi gì ra ngoài.
- `vietnamese-reviewer`: gửi batch chuỗi cần review tới provider của model mà subagent đang dùng (Claude, OpenAI, Google…). Skill yêu cầu bỏ secret và dữ liệu khách hàng trước khi gửi, nhưng bạn vẫn nên tự kiểm tra.

---

## 🗺️ Giới hạn

- Rule và skill là **hướng dẫn cho agent**, không phải hook chặn output. Agent vẫn có thể làm sai, nên review vẫn cần.
- Checker không thay compiler i18n của dự án. ICU, HTML, Markdown phức tạp vẫn phải chạy công cụ thật.
- Mẫu đo nhỏ (44–62 chuỗi, 2 lượt, một giám khảo), tiêu chí "dùng đúng thuật ngữ" do chính glossary định nghĩa. Cải thiện có thật nhưng vừa phải; xem [`evals/README.md`](evals/README.md).
- Glossary chỉ phủ thuật ngữ giao diện phổ biến. Từ chuyên ngành (y tế, luật, tài chính) cần glossary của dự án.
- Codex chưa được chạy thử trực tiếp.

---

## 🤝 Vào cypher

Gặp câu agent viết sai hoặc nghe "văn dịch"? Mở issue gồm:

1. Câu gốc (nếu có) và câu agent viết.
2. Ngữ cảnh: UI, docs, noti, commit, chat…; người đọc là ai.
3. Câu bạn thấy đúng và lý do.

PR sửa rule nhớ kèm các cặp câu trước/sau. Đừng thêm luật cấm cứng một từ nếu từ đó vẫn có chỗ dùng đúng.

---

## 📼 Liner notes

Rule do repo tự viết. Ý tưởng tham khảo từ:

- [trussary/vietnamese-language-skill](https://github.com/trussary/vietnamese-language-skill): thuật ngữ kỹ thuật, xưng hô, rủi ro i18n.
- [abm-dungtq/viet-pro](https://github.com/abm-dungtq/viet-pro): nhận diện văn dịch theo ngữ cảnh.
- [luongnv89/claude-howto: TRANSLATION_NOTES](https://github.com/luongnv89/claude-howto/blob/main/vi/TRANSLATION_NOTES.md): glossary, không dịch code.
- [Microsoft Vietnamese Localization Style Guide (PDF 60 trang)](https://download.microsoft.com/download/b/f/e/bfecb1b4-21ab-48fd-a48c-c2471b026f8f/vie-vnm-StyleGuide.pdf): giọng văn, từ ngữ hiện đại, viết hoa câu, dấu câu, mẫu thông báo lỗi, ngôn ngữ trung tính về giới. Đã đọc hết và rút thành `references/microsoft-vi-style.md`; bản gốc vẫn thuộc Microsoft. Tham khảo thêm [Microsoft Localization Style Guides](https://learn.microsoft.com/en-us/globalization/reference/microsoft-style-guides).
- [Nguyen LNP: Vietnamese Localization Style Guide](https://nguyenlnp.com/vietnamese-localization-style-guide/): style guide khác glossary, ngữ cảnh cần đính kèm, quy trình có AI và người duyệt.
- [GTE Localize: Vietnamese Localization](https://gtelocalize.net/vietnamese-localization/): định dạng ngày giờ, tên, địa chỉ, đại từ, phương ngữ, SEO. Chỉ lấy phần kiểm chứng được; phần mâu thuẫn hoặc chưa kiểm chứng được ghi rõ ở `references/sources.md`.
- [JuliusBrussee/caveman](https://github.com/JuliusBrussee/caveman): nói ít, giữ payload nguyên văn.

Logo dùng font [Pricedown](https://typodermicfonts.com/pricedown/) (Typodermic, bản free cho thiết kế tĩnh), [Mr Dafoe](https://fonts.google.com/specimen/Mr+Dafoe) và [Be Vietnam Pro](https://fonts.google.com/specimen/Be+Vietnam+Pro) (SIL OFL). Logo chỉ lấy cảm hứng từ không khí Vice City, không liên quan tới Rockstar Games hay GTA. File thiết kế nằm ở [`design/logo.html`](design/logo.html). Repo không chứa file font.

License: [MIT](LICENSE).

---

<div align="center">

### 🎙️ Outro

*README này 100% do AI agent viết, dùng chính skill `vietnamese-drill`:*
*viết theo `vietnamese-product`, kiểm bằng `vi_check`, review bằng `vietnamese-reviewer`.*

**Peace out. Viết tiếng Việt cho có flow. ✌️**

</div>
