# ลำดับที่ 6 — Work orders + master filters

**สถานะรวม:** กำลังทำ  
**Stack เต็มรูปแบบ ([skills.md](../../skills.md)):** ยังไม่มี — ดู [00-stack-target.md](00-stack-target.md)
**Checklist หลัก:** `workorder.php`, `W_confirm*`, master filter  
**Migration:** [`005_tbwkzb_tbfunctional.sql`](../../database/migrations/005_tbwkzb_tbfunctional.sql)  
**Route:** `/work-orders`

---

## ทำแล้ว (แกน)

- [x] `GET /api/v1/work-orders` (ค้นหา `q`, กรอง `status`)
- [x] `GET /api/v1/work-orders/:id` (lookup `idiw37` หรือ `wkorder`)
- [x] `tbwkzb`, `tbfunctional` ใช้ใน backlog filter-options
- [x] [`WorkOrdersPage.tsx`](../../PM-Pepsi-App/frontend/src/features/work-orders/WorkOrdersPage.tsx) เรียก API จริง
- [x] Backlog modal รายละเอียด WO ต่อ PG

---

## ยังไม่ทำ

### หน้า Work orders

- [ ] Badge **API + DB** บน WorkOrdersPage (สอดคล้องโมดูลอื่น)
- [ ] Deep link เปิด WO รายตัว เช่น `/work-orders/:id` (Planning ลิงก์ไปแค่รายการรวม)
- [ ] Parity [`workorder.php`](../../sap/pages/workorder.php), `Work_Order_Status.php`
- [ ] ชุด `W_confirm*.php` — ยืนยันปิดงาน (อาจทับกับลำดับ 9 Confirmation)

### Master UI สำหรับ filter tables

- [ ] CRUD UI `M_functional*` (ตารางมีใน `005`)
- [ ] CRUD UI สำหรับ work center zone / `tbwkzb` ถ้ามีหน้า PHP แยก

### Modal

- [ ] [`ModalOrderDetail.php`](../../sap/modalPages/ModalOrderDetail.php) เต็มรูปแบบ (แท็บ machine/material/planning ฯลฯ)

---

## บันทึกการอัปเดต

| วันที่ | สรุป |
|--------|------|
| 2026-05-16 | สร้างไฟล์ |
