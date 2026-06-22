# แผน Phase + Checklist — Personnel Lookup (Admin จัดการ dropdown เอง)

> **ใช้ไฟล์นี้ติ๊กงาน** สำหรับ dropdown ใน **Admin → Users → Work info**  
> Department · Technician type · Position · Work center group · Level  
> ให้ admin **เพิ่ม / แก้ / ลบ** รายการได้เอง — ไม่รู้สึกว่า “fix ไว้แก้ไม่ได้”

**อัปเดต:** 2026-06-22  
**Workflow AI:** [`SUPERPOWERS-PM-APP.md`](../SUPERPOWERS-PM-APP.md) · [`AGENTS.md`](../../AGENTS.md)

**หน้าเป้าหมาย:** `http://localhost:5173/admin/users` (modal Add/Edit → แท็บ **Work info**)  
**Master data ที่มีอยู่แล้ว:** `/master-data?entity=…` · `/admin/master` (hub)

---

## วัตถุประสงค์

| เป้าหมาย | รายละเอียด |
|----------|-------------|
| **Admin จัดการ lookup เอง** | เพิ่มแผนก/ตำแหน่ง/กลุ่ม/ประเภทช่าง/ระดับ ได้โดยไม่ต้องแก้ DB มือ |
| **UX ชัดเจน** | จากฟอร์ม Users เห็นทางไปจัดการ · หรือเพิ่มรายการ inline |
| **ปลอดภัย** | ลบได้เมื่อไม่ถูกอ้างอิง · แจ้ง error ชัด |

---

## สถานะปัจจุบัน (baseline)

### สิ่งที่มีแล้ว (ไม่ต้องสร้าง API ใหม่ทั้งก้อน)

| ฟิลด์ใน UI (Work info) | ตาราง PostgreSQL | Entity ใน Master Data | API CRUD |
|-------------------------|------------------|------------------------|----------|
| **Department** | `app.tbdepartment` | `department` | `GET/POST/PATCH/DELETE /api/v1/master-data/department` |
| **Technician type** | `app.tbwkctrtype` | `worktype` | `…/master-data/worktype` |
| **Position** | `app.tbposition` | `position` | `…/master-data/position` |
| **Work center group** | `app.tbwkctrgroup` | `group` | `…/master-data/group` |
| **Level** | `app.tbwklevel` | `level` | `…/master-data/level` |

- Frontend **`MasterDataPage`** (`/master-data`) — ตาราง + เพิ่ม/แก้/ลบ ครบ 5 entity ด้านบน  
- **`fetchPersonnelLookups()`** — ดึง 5 ชุดจาก master-data API มาใส่ `<select>` ในฟอร์ม Users  
- RBAC: `master-data.read` / `master-data.write`

### ทำไม admin รู้สึกว่า “fix ไว้ แก้ไม่ได้”

| ปัญหา | รายละเอียด |
|--------|-------------|
| **Dropdown อ่านอย่างเดียว** | ฟอร์ม Users มีแค่ `<select>` — ไม่มีปุ่ม Add/Edit/Delete |
| **ไม่รู้ว่ามี Master Data** | ต้องไป `/master-data` หรือ `/admin/master` เอง — ไม่มีลิงก์จาก modal |
| **ข้อมูลว่าง** | ถ้า migration 011/014/019/020/021 ยังไม่รัน / seed ว่าง → เห็นแค่ `-- Select --` |
| **Cache lookup 5 นาที** | แก้ที่ master-data แล้ว dropdown ใน modal อาจยังไม่อัปเดตทันที |
| **ชื่อ entity สับสน** | UI ว่า “Technician type” แต่ API ใช้ entity `worktype` (ตาราง `tbwkctrtype`) |

---

## สัญลักษณ์สถานะ

| สัญลักษณ์ | ความหมาย |
|-----------|----------|
| `[ ]` | ยังไม่ทำ / ยังไม่ผ่าน |
| `[~]` | โค้ดบางส่วน · รอ UAT |
| `[x]` | ปิดแล้ว |
| `[—]` | N/A / เลื่อน |

**Phase ปัจจุบัน:** _______________  
**อัปเดตล่าสุดโดย:** _______________ **วันที่:** _______________

---

## ภาพรวม Phase

```text
[x] L0  ค้นหา + ลิงก์ — จาก Users ไปจัดการ master data · refresh lookup
  ↓
[x] L1  Inline “เพิ่มรายการ” — dialog สั้นใน modal Users (ไม่ต้องออกจากฟอร์ม)
  ↓
[x] L2  Inline แก้/ลบ + ป้องกันลบเมื่อถูกใช้งาน
  ↓
[ ] L3  Hub เฉพาะ lookup ช่าง (ทางเลือก) — /admin/personnel-lookups
  ↓
[ ] L4  UAT + เอกสาร + seed โรงงาน
```

**หลักการ:** **L0 ทำได้เร็วสุด** (แค่ UX + invalidate cache) · **L1–L2** ตอบ requirement “เพิ่ม/ลบเอง” ในหน้า Users · **L3** ถ้าต้องการศูนย์กลางแยกจาก master-data 17 entity

---

## ตารางความคืบหน้า

| Phase | ชื่อ | สถานะ | เกณฑ์ผ่านสั้นๆ |
|-------|------|--------|----------------|
| **L0** | ลิงก์ + refresh | `[ ]` | จาก Work info ไปจัดการ lookup ได้ · กลับมา dropdown อัปเดต |
| **L1** | Quick add | `[ ]` | เพิ่มรายการใหม่จาก modal Users ได้ 5 ฟิลด์ |
| **L2** | Edit/Delete + guard | `[x]` | แก้/ลบได้ · ลบไม่ได้ถ้ามีช่างอ้างอิง |
| **L3** | Lookup hub (optional) | `[—]` | หน้า admin รวม 5 ตาราง (ถ้าลูกค้าไม่พอใจ master-data) |
| **L4** | UAT + docs | `[ ]` | คู่มือ + checklist ลูกค้าผ่าน |

---

## L0 — ลิงก์จาก Users + refresh lookup (ไม่ต้อง migration)

> เป้า: admin รู้ว่าจัดการรายการ dropdown ที่ไหน · ไม่ต้องเดา

### UI — แท็บ Work info (`PersonnelAdminPage`)

- [x] ใต้หรือข้างแต่ละ dropdown แสดงลิงก์ **Manage options** (หรือไอคอน ⚙) ไป:
  - Department → `/master-data?entity=department`
  - Technician type → `/master-data?entity=worktype`
  - Position → `/master-data?entity=position`
  - Work center group → `/master-data?entity=group`
  - Level → `/master-data?entity=level`
- [x] เปิดลิงก์ใน **แท็บใหม่** (ไม่ปิด modal Users) หรือ drawer ข้าง — เลือกแบบใดแบบหนึ่งแล้วทำให้สม่ำเสมอ
- [x] แถบ hint ด้านบน Work info: *“Dropdown options are managed in Master Data — use Manage options or ask an admin with Master Data access.”*
- [x] ถ้าไม่มี `master-data.write` — แสดงลิงก์ read-only + ข้อความ “Contact admin to add options”

### Cache / data

- [x] หลังกลับจาก master-data (focus window / `visibilitychange`) → `invalidateQueries(['personnel','admin','lookups'])`
- [x] ลด `staleTime` lookup ใน modal เป็น 0 หรือ 30s ขณะ modal เปิด (optional)
- [x] ตรวจ dev DB ว่ารัน migration `011`, `014`, `019`, `020`, `021` และมี seed อย่างน้อย 1 แถวต่อตาราง

**ตรวจ DB:** `cd PM-Pepsi-App/backend && npx tsx scripts/verify-personnel-lookup-tables.ts` (เพิ่ม `--fix` ถ้า `tbwkctrgroup` ว่าง — seed `GRP01`)

### i18n

- [x] `personnel.admin.lookup.manageLink` · `manageHint` · `emptyOptions` ครบ EN + TH

### ทดสอบ L0

- [x] Admin มี `master-data.write` → เปิดลิงก์ → เพิ่ม Department → กลับ modal → dropdown มีรายการใหม่
- [x] User ไม่มี write → เห็น hint ไม่มีปุ่มแก้

**อัตโนมัติ:** `frontend/e2e/personnel-lookup-l0.spec.ts` (3 tests · `E2E_USE_DEV_SEED=1` · `--workers=1`)

**เกณฑ์ปิด L0:** 5 ฟิลด์มีลิงก์จัดการ · lookup refresh หลังแก้ master-data

---

## L1 — Quick add ใน modal Users

> เป้า: เพิ่มรายการใหม่ **โดยไม่ออกจากฟอร์ม Add personnel**

### UI ต่อฟิลด์

- [x] ปุ่ม **+ Add** ข้าง dropdown แต่ละตัว (เฉพาะ `master-data.write`)
- [x] Dialog สั้น:
  - Department: `iddepartment` + `department` (name)
  - Technician type: `idwkctrtype` + `wkctrtype`
  - Position: `idposition` + `position`
  - Work center group: `wkctrgroup` + `wkctrdescription` (optional)
  - Level: `idwklevel` + `wklevel`
- [x] หลัง save สำเร็จ → เลือกค่าใหม่ใน dropdown อัตโนมัติ · invalidate lookups

### API (reuse)

- [x] เรียก `createDepartment` / `createWorkType` / … จาก `api-public` / master-data client ที่มีอยู่
- [x] แสดง error 409 (รหัสซ้ำ) · 400 validation เป็นข้อความ i18n

### Component

- [x] สร้าง `PersonnelLookupQuickAddDialog.tsx` (entity type discriminated union)
- [x] ใช้ร่วม `/admin/users` และ legacy `/personnel/admin` (ถ้ายังมี)

### ทดสอบ L1

- [x] Add personnel ใหม่ → Quick add Department → บันทึก personnel ได้
- [x] รหัสซ้ำ → toast error ไม่ crash

**อัตโนมัติ:** `frontend/e2e/personnel-lookup-l1.spec.ts` (3 tests · `E2E_USE_DEV_SEED=1` · `--workers=1`)

**เกณฑ์ปิด L1:** เพิ่มรายการใหม่ได้ครบ 5 ประเภทจาก modal Users

---

## L2 — แก้ / ลบ + ป้องกันการลบ

> เป้า: ลบได้เมื่อปลอดภัย · แก้ชื่อ/รหัสตามกติกา master-data

### Edit

- [x] ปุ่ม **Edit** ข้าง dropdown เมื่อมีค่าเลือก (หรือเมนู ⋮)
- [x] Dialog แก้ label/description — เรียก PATCH master-data
- [x] **Work center group:** แก้ `wkctrgroup` / description (id เป็น serial — ไม่เปลี่ยน PK)

### Delete

- [x] ปุ่ม **Delete** + ConfirmPhrase หรือ AlertDialog
- [x] Backend: ก่อน DELETE ตรวจว่ามี `tbworkcenter` อ้างอิง FK หรือไม่:
  - `iddepartment`, `idposition`, `idwkctrgroup`, `idwkctrtype`, `idwklevel`
- [x] ถ้ามีการใช้งาน → `409 IN_USE` + จำนวน record ที่อ้างอิง
- [x] Frontend แสดงข้อความ “Cannot delete — used by N technicians”

### Backend tasks

- [x] เพิ่ม `assertLookupNotInUse()` ใน `master-data.ts` หรือ middleware ก่อน delete 5 entity
- [x] Unit test: delete ว่างผ่าน · delete ที่ถูกใช้ fail

### ทดสอบ L2

- [x] ลบ Department ที่ไม่มีช่าง → สำเร็จ · หายจาก dropdown
- [x] ลบ Department ที่ WC001 ใช้อยู่ → 409 + ข้อความชัด

**อัตโนมัติ:** `frontend/e2e/personnel-lookup-l2.spec.ts` (3 tests · `E2E_USE_DEV_SEED=1` · `--workers=1`)

**เกณฑ์ปิด L2:** CRUD ครบจาก UX ที่ admin เข้าใจ · ลบปลอดภัย

---

## L3 — Lookup hub (ทางเลือก)

> ทำเมื่อลูกค้าไม่อยากเข้า Master Data 17 หมวด

- [ ] หน้า `/admin/personnel-lookups` หรือแท็บใน `/admin/users`
- [ ] 5 แท็บย่อย: Department · Technician type · Position · Group · Level
- [ ] Reuse `MasterDataPage` panel หรือ extract `MasterDataSimpleTable` component
- [ ] เมนู `tbmenu` + permission `master-data.read` (หรือ `admin.users.write`)

**เกณฑ์ปิด L3:** admin จัดการ 5 lookup ได้โดยไม่เห็น entity อื่น

---

## L4 — UAT, seed โรงงาน, เอกสาร

### Seed / migration (on-site)

- [ ] สคริปต์หรือ Excel template นำเข้า lookup เริ่มต้นของลูกค้า (แผนกจริง)
- [ ] เอกสารรัน migration `011`, `014`, `019`, `020`, `021` ใน [`SETUP-NEW-MACHINE.md`](../SETUP-NEW-MACHINE.md) § personnel lookups

### UAT checklist (ลูกค้า / QC)

- [ ] เพิ่ม Department ใหม่ → สร้างช่างเลือกแผนกนั้นได้
- [ ] แก้ชื่อ Position → แสดงใน dropdown ถูกต้อง
- [ ] ลบ Level ที่ไม่มีใครใช้ → หายจาก list
- [ ] ลบ Group ที่มีช่างใช้ → ระบบปฏิเสธพร้อมเหตุผล
- [ ] ช่างไม่มีสิทธิ master-data → ไม่เห็นปุ่ม Add/Delete

### เอกสาร

- [ ] อัปเดต [`USER-MANUAL-TH.md`](../USER-MANUAL-TH.md) § Admin Users → Work info → จัดการ lookup
- [ ] อัปเดต [`parity-pending/14-administrator.md`](../parity-pending/14-administrator.md) § Users / master-data cross-link

**เกณฑ์ปิด L4:** UAT 5 ข้อผ่าน · คู่มืออัปเดต

---

## ไฟล์อ้างอิง (implement)

| ชั้น | Path |
|------|------|
| Users form | `frontend/src/features/personnel/PersonnelAdminPage.tsx` |
| Lookups client | `frontend/src/lib/api-public.ts` → `fetchPersonnelLookups` |
| Master CRUD UI | `frontend/src/features/master-data/MasterDataPage.tsx` |
| Master entities | `frontend/src/features/admin/master/master-entities.ts` |
| Backend CRUD | `backend/src/services/master-data.ts` · `routes/master-data.ts` |
| DB | `database/migrations/011_tbdepartment.sql` … `021_tbwkctrgroup.sql` |
| Personnel FK | `database/migrations/035_tbworkcenter_full_personnel_columns.sql` |

---

## ลำดับ implement แนะนำ

1. **L0** (0.5–1 วัน) — ลิงก์ + invalidate cache + hint + ตรวจ seed DB  
2. **L1** (1–2 วัน) — Quick add dialog  
3. **L2** (1–2 วัน) — delete guard backend + edit/delete UI  
4. **L4** — UAT + manual  
5. **L3** — เฉพาะถ้าลูกค้าขอ hub แยก

---

## ความสัมพันธ์กับแผนอื่น

| เอกสาร | ความสัมพันธ์ |
|--------|----------------|
| [`BRANDING-SCHEDULE-PHASES.md`](BRANDING-SCHEDULE-PHASES.md) | แผน Branding / สีรายวัน (คนละเรื่อง) |
| [`UI-POLISH-PHASES.md`](UI-POLISH-PHASES.md) | Token / shell — lookup ใช้ component มาตรฐาน |
| [`PRE-UAT-MASTER-PHASES.md`](../PRE-UAT-MASTER-PHASES.md) P5 Admin | ปิด L0–L2 ก่อน UAT Users |

---

## ประวัติการเปลี่ยนแปลงเอกสาร

| วันที่ | รายการ |
|--------|--------|
| 2026-06-22 | สร้างฉบับแรก — L0–L4 จาก requirement dropdown Users (Department · Technician type · Position · Group · Level) |
