# Folio Project Rules: Impeccable Design Standard

Tất cả các thay đổi giao diện (HTML/CSS/JS) trong dự án này phải tuân thủ nghiêm ngặt nguyên tắc thiết kế tinh tế của **Impeccable** (`https://impeccable.style/`):

1. **Thẩm mỹ trang giấy & Tối giản (Paper Aesthetic):**
   - Giữ màu nền giấy tự nhiên (`--bg`, `--surface`), chữ đen tuyền tương phản tốt (`--ink`), nhấn vàng ấm (`--gold`, `--accent`).
   - Tuyệt đối không dùng gradient màu tím/xanh đại trà của AI ("AI slop"), không lạm dụng viền bo tròn quá mức (giữ border-radius ở mức 2px - 4px tinh tế).
   - Loại bỏ các thành phần thẻ lồng thẻ ("cards inside cards") và badge màu lộn xộn ("status-chip soup").

2. **Typography & Tiếng Việt (Typesetting):**
   - Sử dụng font Be Vietnam Pro (`FolioSans`) và serif (`Georgia`) hài hoà.
   - Luôn đảm bảo `line-height` từ 1.7 - 1.85 cho phần đọc nội dung để dấu thanh tiếng Việt không bị cắt hoặc dính dòng.
   - Chiều dài dòng đọc giới hạn tối đa 65-75 ký tự (khoảng 680px - 760px).

3. **Phân cấp thị giác (Hierarchy & Distill):**
   - Nút hành động chính (Primary) phải dứt khoát, nổi bật. Các nút phụ (Secondary, filters, toggles) dùng kiểu ghost hoặc text phẳng kín đáo.
   - Giữ nhịp điệu khoảng cách đồng nhất (spacing scale: 4, 8, 12, 16, 24, 32, 48px).

4. **Trạng thái & Phản hồi (Harden & Delight):**
   - Vùng kéo thả, empty state, thông báo lỗi phải có giọng điệu tự nhiên, lịch thiệp, hướng dẫn cụ thể thay vì mã lỗi kỹ thuật.
   - Hiệu ứng chuyển động (animations/transitions) phải nhanh gọn (150-200ms), tinh tế và luôn tôn trọng `prefers-reduced-motion`.
