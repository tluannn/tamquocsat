# Tam Quốc Sát – Quốc Chiến | V2 Alpha 1

Bản nâng cấp đầu tiên trên **mã nguồn HTML offline đã có**, tập trung tách tài nguyên, nâng giao diện bàn đấu thủy mặc và thêm hiệu ứng 3D mà không viết lại luật game. Đây là dự án fan-made, không phải phiên bản chính thức.

## Chơi trên Windows

1. **Giải nén toàn bộ file ZIP** vào một thư mục (không mở HTML ngay trong cửa sổ ZIP).
2. Nhấp đúp `MO_GAME.bat` để mở bằng Microsoft Edge/Chrome; hoặc mở Chrome/Edge, nhấn **Ctrl+O**, chọn `index.html`.
3. Chọn số người chơi (5–8), chọn cặp tướng, bắt đầu trận.
4. Không cần Node.js, npm, máy chủ hay kết nối Internet để chơi. **Không được di chuyển riêng `index.html` ra ngoài thư mục** vì hình ảnh và code đã được tách thành nhiều file.

## Tính năng giao diện V2

- Bàn đấu có nền chiến trường núi mây thủy mặc, vòng đấu ảo và các lá bài nổi với phối cảnh, bóng đổ.
- Bài trên tay trải hình cung, nâng lên khi rê chuột, nghiêng theo vị trí con trỏ.
- Hoạt ảnh lá bài bay từ tay/ghế ra trung tâm hoặc mục tiêu khi sử dụng.
- Hiệu ứng mất máu và lật tướng; nút **✦ 3D: Bật/Tắt** để giảm hiệu ứng.
- Phím **1–9** chọn bài có thể dùng; **E** kết thúc lượt khi khả dụng; **Esc** đóng bảng xem tướng/kỹ năng/luật.
- Hỗ trợ màn hình máy tính và giao diện cuộn trên điện thoại.

## Tính năng luật được giữ lại

96 thẻ tướng (24 mỗi nước), ghép hai tướng cùng phe, 5–8 người với bot, bài cơ bản/mưu kế/trang bị, khoảng cách, lật tướng, cứu bằng Đào, Vô hiệu hóa, điều kiện thắng và thư viện xem tướng. **71 thẻ mới vẫn dùng các mẫu kỹ năng mô phỏng**, không phải toàn bộ luật Quốc Chiến chính thức. Một số tên thẻ viết tắt còn chờ xác minh.

## Cấu trúc dự án

```text
index.html                Điểm khởi động
MO_GAME.bat               Mở Chrome/Edge trên Windows
styles/base.css           CSS gốc, bố cục và thư viện tướng
styles/floating.css       Bài xòe và phối cảnh cơ bản
styles/immersive.css      Bàn đấu 3D, hiệu ứng, responsive
src/data/catalog.js      96 tướng, kỹ năng, loại bài, trang bị
src/data/assets.js       Đường dẫn 96 ảnh tướng và tài nguyên UI
src/game/engine.js       Luật game và lượt bot/người chơi
src/ui/render.js         Render giao diện, thao tác nút
src/ui/effects.js        Hoạt ảnh bay bài, sát thương, lật tướng
src/ui/interaction.js    Phím tắt, con trỏ và bật/tắt 3D
src/main.js              Khởi tạo giao diện
assets/heroes/            96 ảnh tướng WebP riêng
assets/scene/             Ảnh nền chiến trường
assets/ui/                Mặt sau bài, khung bài, biểu tượng
 tests/                   Kiểm thử tự động và mẫu smoke test
```

### Kiểm thử cho lập trình viên

Yêu cầu Node.js 18 trở lên:

```bash
npm run check
npm test
```

Bộ test kiểm tra dữ liệu tướng, tài nguyên ảnh, 48 cặp tướng, dựng bàn 5–8 người, tầm đánh, trang bị, Đào cứu người, Sát gây sát thương và giới hạn kỹ năng. Không cần cài thư viện npm.

### Lưu ý khi đưa lên GitHub

Giữ nguyên cấu trúc thư mục. Có thể đưa lên GitHub Pages vì game là HTML/CSS/JS tĩnh, nhưng cần kiểm tra quyền sử dụng hình ảnh và thương hiệu trước khi công khai.

## Phạm vi hoàn thành và bước tiếp theo

**Đã làm:** tách code thành các khu vực, đưa 96 ảnh thành file riêng, cải thiện bàn đấu và hoạt ảnh, thêm kiểm thử logic và chạy thử giao diện desktop/mobile.

**Chưa làm:** tái thiết kế toàn bộ engine thành hệ thống state/action độc lập, kiểm thử toàn bộ 96 kỹ năng theo luật chính thức, AI nâng cao, âm thanh và chơi online.

**Mốc kế tiếp:** chuẩn hóa luật, dữ liệu kỹ năng theo từng tướng và kiểm thử các trường hợp phản ứng/phản mưu kế, sau đó tối ưu AI và UX.

## Đồng bộ qua GitHub (nhánh feature/game-v2)

Phiên bản V2 nằm trong thư mục `v2/`; bản game cũ ở gốc repository vẫn được giữ nguyên.
Các ảnh WebP/JPEG được khôi phục từ `index.html` gốc thông qua `node v2/scripts/extract-assets.mjs` và GitHub Actions, thay vì phải tải thủ công 96 ảnh lên GitHub.

Sau khi workflow chạy thành công, toàn bộ `v2/assets/` được commit tự động vào nhánh và game V2 hoạt động offline khi tải/cloning **đầy đủ repository**.
Nếu workflow bị chặn bởi quyền Actions, chạy `node v2/scripts/extract-assets.mjs` từ thư mục gốc repository rồi commit thư mục `v2/assets/`.

**Không nên merge vào `main` trước khi kiểm tra đủ 96 ảnh và chạy thử trận đấu trong trình duyệt.**