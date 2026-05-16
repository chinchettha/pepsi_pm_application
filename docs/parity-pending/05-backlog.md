# ลำดับที่ 5 — Backlog

**สถานะรวม:** กำลังทำ  
**Stack เต็มรูปแบบ ([skills.md](../../skills.md)):** ยังไม่มี — ดู [00-stack-target.md](00-stack-target.md)
**Checklist หลัก:** `backlog.php`  
**Migration:** ใช้ `004` (`view_order`) — ไม่มีไฟล์แยก  
**Route:** `/backlog`

---

## ทำแล้ว (แกน)

- [x] `GET /api/v1/backlog/filter-options` (รวม `tbwkzb`, `tbfunctional` จาก `005`)
- [x] `POST /api/v1/backlog/events`
- [x] Logic ร่วม [`scheduling-shared.ts`](../../PM-Pepsi-App/backend/src/services/scheduling-shared.ts)
- [x] [`BacklogPage.tsx`](../../PM-Pepsi-App/frontend/src/features/backlog/BacklogPage.tsx) — ฟิลเตอร์ + ปฏิทิน + badge API+DB
- [x] Modal รายละเอียด WO ผ่าน `GET /api/v1/work-orders/:id` (PG)

---

## ยังไม่ทำ

### ปฏิทิน / interaction

- [ ] FullCalendar แบบ [`backlog.php`](../../sap/pages/backlog.php)
- [ ] Drag-and-drop ย้ายงานบนปฏิทิน
- [ ] [`MovePlant.php`](../../sap/modalPages/MovePlant.php) — flow ย้ายแผนครบ

### Manhour / modal อื่น

- [ ] [`ModalMHshow.php`](../../sap/modalPages/ModalMHshow.php) — ตอนนี้ Manhour dialog ยัง **mock** ใน BacklogPage
- [ ] [`FilterDetail.php`](../../sap/modalPages/FilterDetail.php) ถ้า PHP เรียกจาก backlog

### Parity checklist

- [ ] เปลี่ยนแถว `backlog.php` ใน checklist หลักจาก **กำลังทำ** → **เสร็จ** เมื่อครบ §3

---

## บันทึกการอัปเดต

| วันที่ | สรุป |
|--------|------|
| 2026-05-16 | สร้างไฟล์ |
