<div align="center">

<img src="assets/logo.png" alt="vietnamese-drill: chữ vietnamese skill, cụm sk bị gạch và viết đè thành dr" width="820">

# vietnamese-drill

**Cài một lần. Agent của bạn viết tiếng Việt như người làm sản phẩm thật.**

[![License: MIT](https://img.shields.io/badge/license-MIT-ff4fd8?style=flat-square)](LICENSE)
[![Agent Skill](https://img.shields.io/badge/Agent%20Skill-1%20skill-3df5ff?style=flat-square)](skills/vietnamese)
[![21 ngành](https://img.shields.io/badge/21%20ng%C3%A0nh-7.800%2B%20thu%E1%BA%ADt%20ng%E1%BB%AF-ffe14d?style=flat-square)](#-21-ngành)
[![vi-VN](https://img.shields.io/badge/locale-vi--VN-ff7a3c?style=flat-square)](#)

**[Xem demo](#-trước-và-sau) · [Kết quả](#-kết-quả) · [21 ngành](#-21-ngành) · [Cài đặt](#-cài-1-lệnh) · [Nhờ agent](#-nhờ-agent-thế-nào)**

</div>

---

## 🎬 Trước và sau

<p align="center"><img src="assets/demo-ui.gif" alt="Năm cảnh trước/sau: nút hộp thoại, nút cố định độ rộng, thông báo đẩy, lỗi dưới ô nhập, thuật ngữ đúng ngành" width="840"></p>

Cùng một câu tiếng Anh, drill viết khác nhau tùy chỗ hiển thị: nút trong hộp thoại thì gọn, thông báo đẩy thì đủ ý, chữ trên nút luôn vừa khung. Thuật ngữ thì đúng giọng người trong ngành.

---

## 🏆 Kết quả

<p align="center"><img src="assets/results.gif" alt="Thuật ngữ ngành đúng 78,3% lên 94%; lỗi hiển thị UI 12 xuống 0; chữ gọn hơn 18%; độ tự nhiên giữ nguyên; nhận đúng ngành 21/21" width="840"></p>

- **Thuật ngữ chuyên ngành đúng: 78,3% → 94,0%** trên 188 chuỗi thuộc 21 ngành.
- **Lỗi hiển thị trên UI: 12 → 0**: hết tràn khung, hết sai dấu câu, thông báo lỗi luôn có bước tiếp theo.
- **Gọn hơn 18%** mà vẫn đủ ý; **độ tự nhiên giữ nguyên** khi chấm mù (56 : 56).

| Câu gốc | ❌ Không có drill | ✅ Có drill |
|---|---|---|
| Delete this card *(nút trong hộp thoại "Xóa thẻ này?")* | Xóa thẻ này | Xóa |
| Top up your wallet now… *(nút tối đa 18 ký tự)* | Nạp tiền vào ví ngay để tiếp tục thanh toán hóa đơn tự động | Nạp tiền ngay |
| Payment failed *(thông báo đẩy)* | Thanh toán thất bại | Không thanh toán được 250.000 ₫ cho EVN Hà Nội do số dư không đủ. Nạp thêm tiền để thử lại. |
| Changes saved *(sau khi bấm Lưu)* | Thao tác lưu đã được thực hiện thành công! | Đã lưu |
| Send money *(ví điện tử)* | Gửi tiền | Chuyển tiền |
| Submit homework *(giáo dục)* | Gửi bài tập về nhà | Nộp bài tập về nhà |
| Commit your changes *(tài liệu dev)* | Cam kết các thay đổi | Commit các thay đổi |
| Failed to save image | Lưu hình ảnh thất bại. | Không lưu được hình ảnh. |
| Select All | Chọn Tất Cả | Chọn tất cả |

---

## ⌨️ Một câu nhờ, cả file chuẩn

<p align="center"><img src="assets/terminal.gif" alt="Agent dịch locales/en.json sang vi.json: 11 chuỗi, 0 lỗi, 1 cảnh báo SMS" width="860"></p>

Kết quả thật từ một lần chạy: agent tự đọc giới hạn trong README dự án, giữ nguyên `{amount}`, `{biller}`, `{code}`, nút vừa 15/18 ký tự, mô tả cửa hàng đúng 80/80. Chỗ không thể vừa thì nó nói thẳng: mã OTP cần 2 tin SMS.

---

## 🏭 21 ngành

<p align="center"><img src="assets/industries.png" alt="21 ngành: fintech, thương mại điện tử, y tế, giáo dục, logistics, nhân sự, kế toán, bảo hiểm, pháp lý, bất động sản, du lịch, F&B, viễn thông, SaaS, dev, game, di chuyển, ERP, mạng xã hội, dịch vụ công, bảo mật" width="900"></p>

Agent tự nhận app của bạn thuộc ngành nào. Dự án có bảng thuật ngữ riêng thì bảng đó luôn được ưu tiên.

---

## ⚡ Cài 1 lệnh

<p align="center"><img src="assets/agents.png" alt="Chạy trên Claude Code, Codex, Cursor, Gemini CLI, Antigravity, OpenCode, GitHub Copilot, Windsurf, oh-my-pi" width="900"></p>

```bash
npx skills add zt-hky/vietnamese-drill
```

<details>
<summary><b>Claude Code</b> (kèm subagent review)</summary>

```bash
claude plugin marketplace add zt-hky/vietnamese-drill
claude plugin install vietnamese-drill@vietnamese-drill
```
</details>

<details>
<summary><b>Codex</b></summary>

```bash
npx skills add zt-hky/vietnamese-drill -g -a codex
```
Subagent tùy chọn: copy [`codex/vietnamese_reviewer.toml`](codex/vietnamese_reviewer.toml) vào `~/.codex/agents/`.
</details>

<details>
<summary><b>oh-my-pi</b> (đủ bộ: skill, rule, tool, subagent)</summary>

```bash
omp plugin install github:zt-hky/vietnamese-drill
```
</details>

<details>
<summary><b>Cursor · Gemini CLI · Antigravity · OpenCode · Copilot · Windsurf</b></summary>

```bash
npx skills add zt-hky/vietnamese-drill -g -a <cursor|gemini-cli|antigravity|opencode|github-copilot|windsurf>
```
</details>

<details>
<summary>Đang dùng bản 1.x?</summary>

Hai skill cũ đã gộp thành một. Gỡ bản cũ: `npx skills remove vietnamese-product vietnamese-replies`, rồi cài lại như trên.
</details>

Cần Node.js 18 trở lên. Không cần API key riêng: drill dùng chính model agent đang chạy.

---

## 💬 Nhờ agent thế nào

Cứ nói tự nhiên, drill tự bật khi cần:

```text
Dịch locales/en.json sang locales/vi.json cho app này.
Rà lại tiếng Việt trong màn hình thanh toán, nút tối đa 16 ký tự.
Viết thông báo đẩy khi đơn hàng giao thất bại.
Review file vi.json, app của mình là app bảo hiểm.
```

---

## 🛡️ Dữ liệu của bạn

Phần kiểm tra chạy hoàn toàn trên máy. Chỉ khi agent nhờ subagent review, các chuỗi mới đi tới model agent đang dùng, và drill dặn bỏ secret, dữ liệu khách hàng trước khi gửi.

---

## 🤝 Góp sức

Thấy thuật ngữ chưa đúng, hay ngành bạn chưa có? [Mở issue](https://github.com/zt-hky/vietnamese-drill/issues) kèm câu gốc, câu agent viết và câu bạn thấy đúng.

---

<details>
<summary>📼 Liner notes</summary>

Tham khảo và nguồn dữ liệu (kèm giấy phép): [`skills/vietnamese/references/sources.md`](skills/vietnamese/references/sources.md). Số liệu đo: [`evals/`](evals/).

Logo dùng font [Pricedown](https://typodermicfonts.com/pricedown/) (Typodermic, bản free cho thiết kế tĩnh), [Mr Dafoe](https://fonts.google.com/specimen/Mr+Dafoe) và [Be Vietnam Pro](https://fonts.google.com/specimen/Be+Vietnam+Pro) (SIL OFL). Không liên quan tới Rockstar Games hay GTA. License: [MIT](LICENSE).
</details>

<div align="center">

### 🎙️ Outro

*README này 100% do AI agent viết bằng chính skill `vietnamese`.*

**Peace out. Viết tiếng Việt cho có flow. ✌️**

</div>
