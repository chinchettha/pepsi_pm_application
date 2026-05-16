# ลำดับที่ 8 — Dashboard + Planning

**สถานะรวม:** กำลังทำ  
**Stack เต็มรูปแบบ ([skills.md](../../skills.md)):** ยังไม่มี — ดู [00-stack-target.md](00-stack-target.md)
**Checklist หลัก:** `content.php` (แทน Home), `M_planwork*`  
**Migration:** [`007_tbplangingwork_view_planwork.sql`](../../database/migrations/007_tbplangingwork_view_planwork.sql)  
**Route:** `/` (Home), `/planning`

---

## ทำแล้ว (แกน)

- [x] `app.tbplangingwork`, view `app.view_planwork`
- [x] `GET /api/v1/dashboard/summary`
- [x] `GET /api/v1/planning/orders` — กรอง `idwkctr` session + `syst IN ('CRTD','REL')`
- [x] [`HomePage.tsx`](../../PM-Pepsi-App/frontend/src/features/home/HomePage.tsx) — การ์ดสรุปจาก PG
- [x] [`PlanningPage.tsx`](../../PM-Pepsi-App/frontend/src/features/planning/PlanningPage.tsx) — ตารางแผน + badge API+DB

---

## ยังไม่ทำ

### Dashboard (`/`)

- [ ] คำอธิบายการ์ด “รอยืนยันบุคลากร” — ตอนนี้นับ WO ที่ยังไม่มี `tbplangingwork` (ไม่ใช่โมดูล personnel)
- [ ] ลิงก์จากการ์ดไปโมดูลที่เกี่ยว (planning, iw37n, work-orders)
- [ ] KPI เพิ่มเติมถ้า PHP มีใน `index2` / รายงาน (phase 2)

### Planning (`/planning`)

- [ ] [`M_planwork_view_form.php`](../../sap/pages/M_planwork_view_form.php) — จ่ายงาน → insert/update `tbplangingwork`
- [ ] API `POST /api/v1/planning/assign` (หรือชื่อที่ตกลง)
- [ ] [`M_planwork_close.php`](../../sap/pages/M_planwork_close.php), `M_planwork_view_form_close.php`
- [ ] [`W_planwork_view.php`](../../sap/pages/W_planwork_view.php), `W_planwork_view_close.php`
- [ ] Modal ทีม / แท็บ [`plan_confirmTab*`](../../sap/modalPages/) ใน §5 checklist

### Navigation

- [ ] ลิงก์ WO จาก Planning → `/work-orders/:id` (ไม่ใช่แค่รายการรวม)

### ข้อมูล

- [ ] ต้องมีแถวใน `tbiw37n` + `wkctr` ตรง user ถึงจะเห็นแผนในตาราง

---

## บันทึกการอัปเดต

| วันที่ | สรุป |
|--------|------|
| 2026-05-16 | สร้างไฟล์ |
