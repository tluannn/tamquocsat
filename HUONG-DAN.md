# Hướng dẫn dự án: Tam Quốc Sát – Quốc Chiến

Tài liệu này giải thích game đang được làm thế nào, cách chạy, cách thêm tướng, bài, đổi tranh, và lộ trình để làm bản online.

## 1. Tổng quan

- **Một file duy nhất:** `quoc-chien.html` chứa cả giao diện (CSS), luật chơi (JavaScript) và ảnh (nhúng dạng base64). Không cần cài gì, không cần mạng.
- **Chạy:** lưu file về máy, bấm đúp để mở bằng trình duyệt.
- **Chế độ:** Quốc Chiến, 5 đến 8 người, bạn chơi với bot.
- **Hiện trạng:** bản thử một người. Chưa có online, trang bị, khoảng cách tấn công, bài Vô hiệu hóa.

## 2. Luật đã làm

| Phần | Cách làm |
|---|---|
| Tướng | Mỗi người 2 tướng úp. Máu tối đa = trung bình máu hai tướng, làm tròn xuống |
| Lật tướng | Lật để lộ nước. Tướng thứ hai chỉ lật được khi cùng nước với tướng đã lật |
| Kỹ năng bị động | Chỉ có tác dụng khi tướng đã lật (ví dụ Bào Hao, Vô Song, Long Đảm) |
| Kỹ năng kích hoạt | Khi bị mất máu, game hỏi bạn có lật tướng để dùng không (Gian Hùng, Phản Kích, Cương Liệt, Thiên Hương) |
| Lượt | Lật tướng, rút 2 lá, ra bài, bỏ bài thừa so với số máu |
| Sát | 1 lần mỗi lượt (trừ Trương Phi). Bị Sát phải ra Thiểm, không thì mất 1 máu |
| Hết máu | Dùng Đào tự cứu, không có thì bị loại |
| Thưởng, phạt | Hạ người khác nước: rút 3 lá. Giết người cùng nước: bỏ hết bài |
| Thắng | Mọi người còn sống đều cùng một nước |

Một số chỗ là **bản rút gọn tự đặt**, không phải luật gốc: công thức máu tối đa, nhiều kỹ năng tướng, và việc bỏ qua khoảng cách tấn công. Bạn nên đối chiếu với cách bạn quen chơi.

## 3. Cấu trúc code (trong thẻ `<script>`)

### Dữ liệu
- `G`: danh sách tướng, mỗi dòng là `[tên, nước, máu, id kỹ năng, mô tả]`.
- `C`: danh sách bài (tên, biểu tượng, mô tả). `TG` là các bài cần chọn mục tiêu, `TRICK` là các bài mưu kế.
- `IMG`, `BG`, `CB`, `PP`, `BN`, `HT`: ảnh nhúng (chân dung, nền, mặt sau bài, nền lá bài, cờ nước, trái tim).

### Trạng thái ván đấu
- `P`: mảng người chơi. Mỗi người có `g` (2 tướng, mỗi tướng có cờ `rev` là đã lật hay chưa), `k` (nước đã lộ), `hp`, `max`, `hand`, `alive`.
- `D` (bộ bài), `disc` (bài bỏ), `cur` (lượt của ai), `used` (số Sát đã dùng trong lượt), `over` (nước thắng).

### Các hàm chính
- **`game()`**: vòng lặp lượt, chạy bất đồng bộ (`async`). Mỗi lượt gọi `hturn` (người) hoặc `bturn` (bot).
- **`choose(msg, ok, btns)`**: hàm quan trọng nhất cho phần giao diện. Nó hiện câu hỏi và **chờ người chơi bấm**, trả về kết quả bằng Promise. Nhờ vậy luật chơi viết thành chuỗi `await` tự nhiên, ví dụ "hỏi người này có ra Thiểm không, chờ xong mới xử lý tiếp".
- **`use(p, i, tid)`**: xử lý khi ra một lá bài (Sát, Quyết đấu, Vạn tiễn...).
- **`need(p, loại, số lượng)`**: yêu cầu người chơi ra bài phản ứng. Với bot thì tự quyết, với người thì gọi `choose`.
- **`hurt(src, t, n)`**: trừ máu, kích hoạt kỹ năng khi bị thương, xử lý cứu bằng Đào hoặc chết.
- **`die(t, src)`**: loại người chơi, thưởng phạt, kiểm tra điều kiện thắng.
- **`has(p, id)`** kiểm tra kỹ năng bị động đang bật. **`skillOn(p, id)`** dùng cho kỹ năng kích hoạt, sẽ hỏi lật tướng nếu cần.
- **`pickT`, `bturn`**: trí tuệ của bot (xem mục 6).
- **`render()`**: vẽ lại toàn bộ giao diện từ trạng thái hiện tại.

## 4. Thêm tướng mới

1. Thêm một dòng vào `G`, ví dụ:
   `['Mã Siêu','Thục',4,'thietky','Thiết Kỵ: 50% Sát không thể né']`
2. Viết hiệu ứng ở đúng chỗ, dùng `has(p,'thietky')`:
   - Kỹ năng thay đổi cách ra Sát: sửa trong nhánh `sat` của hàm `use`.
   - Kỹ năng đầu lượt: sửa chỗ rút bài trong `bturn` và `hturn`.
   - Kỹ năng khi bị mất máu: thêm một dòng vào `hurt` với `await skillOn(t,'id')`.
   - Kỹ năng bấm nút: thêm nút trong `hturn` và thêm điều kiện cho bot trong `bturn`.
3. Thêm chân dung vào `IMG` với khóa là đúng tên tướng. Không có tranh thì game dùng màu thay thế.

Lưu ý: số tướng phải **lớn hơn hoặc bằng 2 lần số người chơi** (8 người cần 16 tướng).

## 5. Thêm bài mới

1. Thêm vào `C`, thêm số lượng trong bảng `cnt` ở hàm `init`.
2. Nếu cần chọn mục tiêu thì thêm vào `TG` và `targets`/`canUse`.
3. Thêm nhánh xử lý trong `use`.
4. Cho bot biết cách dùng: thêm vào danh sách ưu tiên trong `bturn`.

## 6. Bot hoạt động thế nào

- Đầu lượt lật tướng ngẫu nhiên (50%).
- Ưu tiên dùng Đào khi thiếu máu, rồi Vô trung, Quyết đấu, Sát...
- Chọn mục tiêu bằng `pickT`: tránh đánh người đã lộ cùng nước, ưu tiên người đã lộ khác nước, người chưa lộ thì đánh với xác suất.
- Hạn chế hiện tại: bot không suy luận được nước của người chưa lộ, không phối hợp đồng đội.

## 7. Đổi hoặc thêm tranh

Ảnh nguyên liệu gốc là một tấm ghép. Mình đã cắt bằng Python (thư viện Pillow), thu nhỏ rồi mã hóa base64 để nhúng thẳng vào file.

```python
from PIL import Image
import base64, io
im = Image.open("tam-anh-ghep.png").convert("RGB")
t = im.crop((x1, y1, x2, y2)).resize((112, 190))
buf = io.BytesIO(); t.save(buf, "JPEG", quality=82)
data = "data:image/jpeg;base64," + base64.b64encode(buf.getvalue()).decode()
```

Gán `data` vào `IMG["Tên tướng"]`. Khi dự án lớn hơn nên để ảnh thành file riêng trong thư mục `assets/` thay vì nhúng, để file code gọn và tải nhanh hơn.

## 8. Lộ trình làm bản online

**Nguyên tắc chính:** máy chủ giữ trạng thái ván đấu, máy người chơi chỉ gửi hành động. Nếu để máy khách giữ trạng thái thì ai cũng xem được bài và nước của người khác.

1. **Tách bộ máy luật** (phần `use`, `hurt`, `die`, `need`, `game`) ra khỏi giao diện, thành module chạy được bằng Node.js.
2. **Thay `choose`:** thay vì hiện nút trên màn hình của một người, máy chủ gửi câu hỏi đến đúng người đó qua WebSocket và chờ trả lời.
3. **Giấu thông tin:** mỗi người chỉ nhận bài của mình, và chỉ thấy tướng đã lật của người khác.
4. **Phòng chơi:** tạo phòng, mã mời, ghép người, bot lấp chỗ trống, kết nối lại khi rớt mạng, giới hạn thời gian mỗi lượt.
5. **Tài khoản, sảnh, bảng xếp hạng** (làm sau cùng).
6. **Thay `Math.random` bằng bộ ngẫu nhiên phía máy chủ** để chống gian lận khi xáo bài.
7. **Công nghệ gợi ý:** Node.js với thư viện `ws` hoặc `socket.io`. Có thể thuê máy chủ nhỏ như Render, Railway hay Fly.io. Lưu dữ liệu tài khoản bằng PostgreSQL hoặc SQLite.

## 9. Việc nên làm tiếp

- [ ] Thêm trang bị (vũ khí, giáp, ngựa) và khoảng cách tấn công.
- [ ] Thêm bài Vô hiệu hóa và cho phép cứu người khác bằng Đào.
- [ ] Thêm tướng, và bổ sung tranh cho Hoa Đà.
- [ ] Làm tranh riêng cho từng loại bài.
- [ ] Làm bot thông minh hơn.
- [ ] Tách thành nhiều file, rồi làm phần online.

## 10. Lưu ý về bản quyền

Luật chơi thì ai cũng dùng được. Nhưng tranh, tên kỹ năng và lời mô tả trong bản gốc của Sanguosha do nhà phát hành giữ bản quyền. Hiện tại mô tả kỹ năng trong game là do mình tự viết lại, còn tranh là ảnh bạn cung cấp. Nếu định **phát hành công khai hoặc kiếm tiền**, bạn nên kiểm tra lại nguồn gốc ảnh và cân nhắc tự thiết kế tên bài, kỹ năng riêng.
