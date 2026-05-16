# ลำดับที่ 4 — Work calendar (IW37 / scheduling)

**สถานะรวม:** กำลังทำ  
**Stack เต็มรูปแบบ ([skills.md](../../skills.md)):** ยังไม่มี — ดู [00-stack-target.md](00-stack-target.md)
**Checklist หลัก:** `calendar.php`, `M_filter_iw37.php`, `calendar_wkctr.php`  
**Migration:** [`004_tbiw37n_calendar.sql`](../../database/migrations/004_tbiw37n_calendar.sql)  
**Route:** `/calendar`

---

## ทำแล้ว (แกน)

- [x] ตาราง `tbiw37n`, `tbwkstatus`, `tbmoveplan`, view `app.view_order`
- [x] `GET /api/v1/calendar/events`
- [x] [`CalendarPage.tsx`](../../PM-Pepsi-App/frontend/src/features/calendar/CalendarPage.tsx) — ปฏิทินรายเดือน + badge API+DB

---

## ยังไม่ทำ

### ฟิลเตอร์

- [ ] [`M_filter_iw37.php`](../../sap/pages/M_filter_iw37.php) — ฟอร์มกรอง + **POST** แบบ PHP
- [ ] API `POST /api/v1/calendar/events` (หรือ query ซับซ้อนเทียบ PHP)
- [ ] แชร์ logic กับ backlog ถ้าฟิลเตอร์เหมือนกัน

### ปฏิทิน / modal

- [ ] FullCalendar + สีจาก `tbwkstatus.wkstcolor`
- [ ] Modal รายละเอียด WO บนปฏิทิน
- [ ] [`MovePlant.php`](../../sap/modalPages/MovePlant.php) — ย้ายแผน + อัปเดต `tbmoveplan`

### ปฏิทินตาม work center

- [ ] [`calendar_wkctr.php`](../../sap/pages/calendar_wkctr.php) — route เช่น `/calendar?wkctr=` หรือ `/calendar/wc/:code`
- [ ] อ่าน `view_confrim` (หรือ view ที่เทียบเท่าใน PG)

### Cross-cutting

- [ ] FullCalendar, MovePlant — [`00-cross-cutting.md`](00-cross-cutting.md)

---

## บันทึกการอัปเดต

| วันที่ | สรุป |
|--------|------|
| 2026-05-16 | สร้างไฟล์ |
