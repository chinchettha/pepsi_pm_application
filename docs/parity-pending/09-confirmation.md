# ลำดับที่ 9 — Confirmation / รับรองงาน

**สถานะรวม:** ยังไม่ทำ  
**Stack เต็มรูปแบบ ([skills.md](../../skills.md)):** ยังไม่มี — ดู [00-stack-target.md](00-stack-target.md)
**Route:** `/confirmation` (placeholder)  
**Checklist หลัก:** `M_confirmation.php`, `W_confirmation.php`, `modalPages/autocomplete.php`, `confirmTab*`

---

## ทำแล้ว

- [x] Route + placeholder ใน sidebar (เมนู `tbmenu` / seed)
- [x] Migration: `026_confirmation_tables.sql` (`tbcofirm`, `view_confirmation`)
- [x] `GET /api/v1/workcenters` (รายชื่อช่าง)
- [x] `GET /api/v1/confirmation/by-wkorder/:wkorder` (โหลดรายการ close ต่อ WO)
- [x] `POST /api/v1/confirmation/:idiw37/close` (เพิ่ม/แก้ เวลา close ต่อช่าง)
- [x] `DELETE /api/v1/confirmation/close/:idclose` (ลบรายการ close)
- [x] `/confirmation` แทน placeholder → ใช้งานได้ Phase 1 (Work Order + Confirmation)

---

## ยังไม่ทำ

- [ ] Import confirm (`M_Confirm*`) + validate แถว (Excel skip 2 rows)
- [ ] Tab 1: รายละเอียด WO + tasklist (`confirmTab1.php`)
- [ ] Tab 3: Upload images (`confirmTab3.php`)
- [ ] Tab 4: Planning (`confirmTab4.php`)
- [ ] Export Excel (`M_Export_confirm*`)
- [ ] เกณฑ์ §3 ครบ

---

## บันทึกการอัปเดต

| วันที่ | สรุป |
|--------|------|
| 2026-05-16 | สร้างไฟล์ลำดับ 9 |
