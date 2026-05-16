# ลำดับที่ 3 — Line calendar

**สถานะรวม:** กำลังทำ  
**Stack เต็มรูปแบบ ([skills.md](../../skills.md)):** ยังไม่มี — ดู [00-stack-target.md](00-stack-target.md)
**Checklist หลัก:** `line_calendar.php`, `M_lineschdul*`  
**Migration:** [`003_tblineschdul.sql`](../../database/migrations/003_tblineschdul.sql)  
**Route:** `/line-calendar`

---

## ทำแล้ว (แกน)

- [x] `GET /api/v1/line-calendar/events?year=&month=`
- [x] [`LineCalendarPage.tsx`](../../PM-Pepsi-App/frontend/src/features/line-calendar/LineCalendarPage.tsx) — ปฏิทินรายเดือน + badge API+DB
- [x] ค่าเริ่มต้นหลัง login ชี้มาที่ route นี้

---

## ยังไม่ทำ

### UI / ปฏิทิน

- [ ] **FullCalendar** แบบ [`line_calendar.php`](../../sap/pages/line_calendar.php)
- [ ] สีกิจกรรม `#408a63` / `#bfbfbf` ตรง PHP
- [ ] Modal คลิกวัน / แก้ไขกิจกรรม

### CRUD ข้อมูลเส้น

- [ ] `M_lineschdul.php` — รายการ
- [ ] `M_lineschdul_form.php` — เพิ่ม/แก้
- [ ] `M_lineschdul_imports.php` — นำเข้า
- [ ] API `POST/PUT/DELETE` สำหรับ `app.tblineschdul`

### View / DB

- [ ] View `view_lineschdul` ใน PG (ถ้า PHP ใช้ view แยกจากตาราง — ตรวจ DDL legacy)

### Cross-cutting

- [ ] FullCalendar — ดู [`00-cross-cutting.md`](00-cross-cutting.md)

---

## บันทึกการอัปเดต

| วันที่ | สรุป |
|--------|------|
| 2026-05-16 | สร้างไฟล์ |
