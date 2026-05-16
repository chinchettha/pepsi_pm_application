# ลำดับที่ 2 — Master data (Activity type + อื่นๆ)

**สถานะรวม:** กำลังทำ  
**Stack เต็มรูปแบบ ([skills.md](../../skills.md)):** ยังไม่มี — ดู [00-stack-target.md](00-stack-target.md)
**Checklist หลัก:** แถว `M_activitytype*` และ master `M_*` อื่นใน §4  
**Migration:** [`002_tbactivitytype.sql`](../../database/migrations/002_tbactivitytype.sql)

---

## ทำแล้ว (แกน)

- [x] `GET/POST/PUT/DELETE /api/v1/master-data/activitytype`
- [x] `POST /api/v1/master-data/activitytype/import` (CSV rows ใน body)
- [x] [`ActivityTypePanel.tsx`](../../PM-Pepsi-App/frontend/src/features/master-data/ActivityTypePanel.tsx) + [`master-data-api.ts`](../../PM-Pepsi-App/frontend/src/lib/master-data-api.ts)
- [x] แท็บ activity type บน `/master-data` ต่อ PostgreSQL (badge API+DB)

---

## ยังไม่ทำ

### Activity type (parity `M_activitytype.php`)

- [ ] อัปโหลดไฟล์ **`.xlsx`** ตรงแบบ PHP (ตอนนี้ paste CSV ใน textarea)
- [ ] UI แยก modal เทียบ `M_activitytype_form.php` / `M_activitytype_imports.php` (ถ้าต้องการ layout เดิม)
- [ ] Validation / ข้อความ error แบบ PHP ครบทุกกรณี

### Master อื่น (แท็บยัง MSW)

- [ ] `M_department*` → migration + API + แท็บ `/master-data`
- [ ] `M_equipment*` + imports
- [ ] `M_functional*` (ตาราง `005` มีแล้ว — ยังไม่มี CRUD UI)
- [ ] `M_material*`, `M_machine*`, `M_lineproduct*`, `M_level*`, `M_position*`, `M_reason*`, `M_worktype*`, `M_workstatus*`, `M_Group*`, `M_tasklist*` ฯลฯ
- [ ] ลบหรือแยก badge **MSW mock** ใน [`MasterDataPage.tsx`](../../PM-Pepsi-App/frontend/src/features/master-data/MasterDataPage.tsx) เมื่อแต่ละ entity ต่อ DB

### เกณฑ์ §3

- [ ] ติ๊ก §3 สำหรับ activity type อย่างน้อย → **เสร็จ** ใน checklist หลัก
- [ ] แผน phase สำหรับ master ที่เหลือ (ลำดับ 9+ หรือแทรกใน 2)

---

## บันทึกการอัปเดต

| วันที่ | สรุป |
|--------|------|
| 2026-05-16 | สร้างไฟล์ |
