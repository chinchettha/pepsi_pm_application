# ข้อกำหนดและ Checklist — Parity หน้า PHP (`sap`) → React (`PM-Pepsi-App/frontend`)

เอกสารนี้ใช้เป็น **ข้อกำหนดขั้นต่ำ** และ **checklist ติดตามความคืบหน้า** ว่าแต่ละหน้า/โมดูลจากระบบเก่า (`index.php` / `index2.php` + `?module=...` → `sap/pages/*.php`) ได้ถูกวิเคราะห์/ออกแบบ/พอร์ตไปยังแอป React แล้วหรือยัง

**อ้างอิงโครงสร้างเก่า:** [`sap/STRUCTURE.md`](../sap/STRUCTURE.md) และ [`sap-legacy-STRUCTURE.md`](../sap-legacy-STRUCTURE.md)

---

## 1) วิธีใช้ checklist

1. **ทำทีละหน้า (หรือทีละกลุ่มที่มีความหมายเดียวกัน)** — เมื่อเริ่มงานให้เปลี่ยนสถานะจาก `ยังไม่ทำ` เป็น `กำลังทำ` และเมื่อครบเกณฑ์ในข้อ 3 ให้เปลี่ยนเป็น `เสร็จ`
2. **บันทึกในแต่ละแถว:** วันที่, route ใน React (ถ้ามี), ลิงก์ PR/commit, หมายเหตุสั้นๆ
3. **ไฟล์ `*_bk*`, `Test_*`, `test_*`, `import_test`** — ถือเป็นไฟล์สำรอง/ทดสอบ: ระบุว่า **ข้าม** หรือ **รวมความต้องการ** จากไฟล์หลักที่ใช้ production แทน
4. **`navbar.php`, `left_menu.php`, `footer.php`** — ไม่ใช่หน้า `module` โดยตรง แต่เป็นส่วน shell; ตรวจ parity ร่วมกับ layout React (`AppShell` / sidebar) — **เมนู sidebar** อยู่ที่ [`nav-config.ts`](../PM-Pepsi-App/frontend/src/components/layout/nav-config.ts) + กรอง `menuright` ตาม `UserST` ([`nav-rbac.ts`](../PM-Pepsi-App/frontend/src/lib/nav-rbac.ts)); รอ sync รายการจาก `tbmenu` ใน PG/API
5. **สัญญา API + MSW** — endpoint ใหม่: ล็อกด้วย Zod ใน [`schemas.ts`](../PM-Pepsi-App/frontend/src/api/schemas.ts) + handler ใน [`handlers.ts`](../PM-Pepsi-App/frontend/src/mocks/handlers.ts); **ห้าม** ใส่ business logic หนักใน mock — ดูหัวข้อ **“สัญญา API และ MSW”** ใน [`skills.md`](../skills.md)

รูปแบบสถานะที่แนะนำในตาราง: `ยังไม่ทำ` | `กำลังทำ` | `เสร็จ` | `ข้าม`

### 1.1) เอกสารงานค้างแยกตามลำดับพัฒนา (1–8)

รายการ **ที่ยังไม่ครบ** แยกเป็นไฟล์ `.md` ใน [`docs/parity-pending/`](parity-pending/README.md) — **อัปเดตคู่กับเอกสารนี้ทุกครั้ง** ที่ปิดงาน:

| ลำดับ | ไฟล์งานค้าง |
|------|----------------|
| — | [`parity-pending/00-cross-cutting.md`](parity-pending/00-cross-cutting.md) |
| 1 | [`parity-pending/01-auth.md`](parity-pending/01-auth.md) |
| 2 | [`parity-pending/02-master-data.md`](parity-pending/02-master-data.md) |
| 3 | [`parity-pending/03-line-calendar.md`](parity-pending/03-line-calendar.md) |
| 4 | [`parity-pending/04-work-calendar.md`](parity-pending/04-work-calendar.md) |
| 5 | [`parity-pending/05-backlog.md`](parity-pending/05-backlog.md) |
| 6 | [`parity-pending/06-work-orders-master-filters.md`](parity-pending/06-work-orders-master-filters.md) |
| 7 | [`parity-pending/07-iw37n.md`](parity-pending/07-iw37n.md) |
| 8 | [`parity-pending/08-dashboard-planning.md`](parity-pending/08-dashboard-planning.md) |
| 9 | [`parity-pending/09-confirmation.md`](parity-pending/09-confirmation.md) |
| 10 | [`parity-pending/10-personnel.md`](parity-pending/10-personnel.md) |
| 11 | [`parity-pending/11-manhours-worktime.md`](parity-pending/11-manhours-worktime.md) |
| 12 | [`parity-pending/12-reports-summary.md`](parity-pending/12-reports-summary.md) |
| 13 | [`parity-pending/13-deploy-offline.md`](parity-pending/13-deploy-offline.md) |
| — | [`parity-pending/COMPLETION-MATRIX.md`](parity-pending/COMPLETION-MATRIX.md) — ตารางสรุปทุกลำดับ |

**วิธีซิงค์:** ติ๊ก `[x]` ในไฟล์ลำดับนั้น → แก้สถานะแถว PHP ใน §4/§5 ด้านล่าง → เพิ่มบรรทัด §7 — ดูขั้นตอนใน [`parity-pending/README.md`](parity-pending/README.md)

---

## 2) แมปกลุ่มงาน → Route ใน React (ปัจจุบัน)

ใช้เป็นแนวทางว่า checklist แต่ละกลุ่มจะไปลงที่ route ไหนใน `PM-Pepsi-App/frontend` (ปรับตามที่ทีมตั้งชื่อจริง)

| กลุ่มงานหลัก (PHP) | Route / หน้า React (แนวทาง) |
|---------------------|------------------------------|
| ปฏิทินงาน / **`calendar.php`** (Work scheduling + `M_filter_iw37`), `W_calendar*` | **`/calendar`** — FullCalendar + filter form (POST) + modal รายละเอียด + ลากย้ายแผน → **`GET /api/v1/calendar/events`**, **`GET /api/v1/calendar/filter-options`**, **`POST /api/v1/calendar/events`** (PG `view_order`) |
| ปฏิทินตาม WC / **`calendar_wkctr.php`** (`view_confrim`, ลิงก์จาก `user.php`) | **`/calendar?wkctr=`** หรือ **`/calendar/wc/:code`** — prefill ตัวกรอง `wkctr` แล้วใช้ `POST /api/v1/calendar/events` (กรอง `wkctr` จะอ่านจาก `app.view_confrim`) |
| ปฏิทินเส้น / `line_calendar.php` (**ค่าเริ่มต้น** `index.php` เมื่อไม่ส่ง `module`) | **`/line-calendar`** — FullCalendar รายเดือน + modal create/edit + drag & drop → **`GET /api/v1/line-calendar/events`** (PG `app.tblineschdul`) + `POST/PUT /api/v1/master-data/lineschdul` |
| Backlog / `backlog.php` (view_order CRTD+REL + FullCalendar เดิม) | **`/backlog`** — ฟิลเตอร์ + **`GET /backlog/filter-options`**, **`POST /backlog/events`** (PG `view_order`); รายละเอียด WO ยัง MSW |
| รับรอง / `M_confirmation` (admin) หรือ flow ช่างจาก `W_planwork_view` | **`/confirmation`** (placeholder) |
| ดู worktime รวม / `W_worktime_view.php` | **`/worktime`** (placeholder) |
| Manhour HR / `W_manhours_hr.php` | **`/manhours-hr`** (placeholder) |
| สรุปรายสัปดาห์ / `W_summary_weekly*.php` | **`/summary-weekly`** (placeholder) |
| ใบงาน / `workorder`, `W_*` ที่เกี่ยว work order | `/work-orders` |
| IW37N / `M_iw37n*`, `iw37n*` | **`/iw37n`** — multipart import + `GET /iw37n/batches` (PG) |
| ข้อมูลหลัก / `M_*`, `tb*`, master ต่างๆ | `/master-data` (แท็บย่อยตาม entity) |
| แผนงาน / `M_planwork*`, `view_planwork` | **`/planning`** — `GET /api/v1/planning/orders` จาก `app.view_planwork` (CRTD/REL ตาม WC login); ยังไม่มี form จ่ายงาน / close |
| Manhour / `M_manhour*`, `worktime_*` | `/manhours` |
| บุคลากร / `M_personel*`, `member*` | `/personnel` |
| รายงาน / กราฟ KPI (ไม่รวม `charts.php` เทมเพลต demo) | `/reports` |
| หน้าแรก / shell `content.php` (ค่าเริ่มต้น `index2.php` เมื่อไม่ส่ง `module`) | **`/`** (`HomePage`) — `GET /api/v1/dashboard/summary` (PG); ไม่พอร์ตเทมเพลต SB Admin |
| ตั้งค่า / user, register | `/settings` |
| Login / logout | **`/login`** · **`RequireAuth`** + **`GET /auth/me`** (JWT) · RBAC เมนู (`menuright`) · redirect → **`/line-calendar`** · logout + API |

---

## 3) เกณฑ์ขั้นต่ำว่า “เสร็จ” ต่อหนึ่งหน้า/โมดูล

- [ ] **UI:** ครบตาม **ข้อ 3.1** ด้านล่าง (ฟอร์ม / ตาราง / ปุ่มหลักตาม use case หน้า PHP — ยอมตัด skin เดิม แต่ฟังก์ชันต้องเทียบได้)
- [ ] **ข้อมูล:** ครบตาม **ข้อ 3.2** (ฟิลด์/โครงสร้างจาก query & ฟอร์ม PHP สะท้อนใน React + schema/mock/API)
- [ ] **กฎธุรกิจ:** ครบตาม **ข้อ 3.3** (validation + สิทธิ์เมนู `tbmenu` / session — มีแผนหรือ implement ในแอปใหม่)
- [ ] **Modal / แท็บย่อย:** ครบตาม **ข้อ 3.4** (ถ้า PHP เรียก `modalPages/*` ให้มีรายการใน checklist ส่วน modal และทำหรือข้ามพร้อมเหตุผล)
- [ ] **ทดสอบ:** ครบตาม **ข้อ 3.5** (mock MSW หรือ API จริงตามที่โปรเจกต์ใช้)

### 3.6 สรุป §3 — โมดูล Auth (ลำดับที่ 1) — เสร็จ 2026-05-16

โมดูล Auth/Shell ถือว่าผ่านเกณฑ์ §3 สำหรับ **ขอบเขตแกน** (login, logout, เมนู DB, footer, โปรไฟล์อ่าน) — รายละเอียดใน [`parity-pending/01-auth.md`](parity-pending/01-auth.md)

- [x] **3.1 UI** — Login (WC+member), `/logout`, sidebar จาก `tbmenu`, footer, แท็บโปรไฟล์ `/settings`
- [x] **3.2 ข้อมูล** — Zod `authUser` / `userProfile`; PG `tbworkcenter`, `tbl_member`, `tbmenu`
- [x] **3.3 กฎธุรกิจ** — `menuright`, bcrypt, `tbworkcenter_userlog` / `tbl_system_userlog`
- [x] **3.4 Modal** — ไม่มี modal auth บังคับใน PHP หลัก (N/A)
- [x] **3.5 ทดสอบ** — MSW + ทดสอบกับ PG (`009` seed, import MySQL)

### 3.1 UI — ฟอร์ม / ตาราง / ปุ่ม (เทียบ use case หน้า PHP)

**คำจำกัดความ “เทียบได้”:** ผู้ใช้ทำ **งานหลักชุดเดียวกับของเดิม** บนหน้า PHP ได้จบบน React (หรือ flow ที่ลูกค้า/ทีมอนุมัติให้ทดแทน — ต้องบันทึกในหมายเหตุ checklist)

**ไม่ต้อง parity:** สกิน Bootstrap/jQuery/DataTables แบบ pixel-perfect, ธีม SB Admin เดิม — ใช้ Shadcn + Tailwind ตาม [`skills.md`](../skills.md) ได้

#### ก่อนติ๊ก UI — สแกนหน้า PHP อย่างรวดเร็ว

| แหล่งในไฟล์ PHP | ดูอะไร |
|-----------------|--------|
| HTML ฟอร์ม | `input` / `select` / `textarea` / `name=` / ปุ่ม submit |
| ตาราง | `<table>`, class DataTables, จำนวนคอลัมน์, ปุ่มต่อแถว |
| ลิงก์ / ปุ่ม | `href`, `onclick`, `$.ajax` / `fetch`, URL ไป `modalPages/` |
| PHP ด้านบน | `$_POST` / `$_GET` / `$_REQUEST` ว่ามีพารามิเตอร์อะไรบ้าง |

#### Checklist UI แยกตามประเภท (ติ๊กเฉพาะข้อที่หน้านั้นมีจริง)

**ก) ฟอร์ม (ค้นหา / เพิ่ม / แก้ / import ฯลฯ)**

- [ ] ฟิลด์ที่ส่งต่อ backend (ชื่อ + ความหมาย) **ครบ** สำหรับ action หลักของหน้า — เทียบจากฟอร์ม HTML + ตัวแปร `$_POST`/`$_GET` ใน PHP
- [ ] ป้ายชื่อ (label) / placeholder / หน่วย — ไม่จำเป็นต้องถ้อยคำเดิมทุกตัว แต่ผู้ใช้ต้องเข้าใจฟิลด์เดียวกัน
- [ ] ปุ่มหลักครบ: เช่น บันทึก / ยกเลิก / ล้างค่า / นำเข้า — เทียบปุ่มและผลลัพธ์กับ PHP
- [ ] สถานะโหลดขณะ submit และกัน double-submit (disabled หรือ spinner)
- [ ] แสดงข้อความ error จาก validation/API ในจุดที่มองเห็น (อาจใช้ toast ตาม stack โปรเจกต์)

**ข) ตาราง / รายการข้อมูล**

- [ ] คอลัมน์ที่ใช้ตัดสินใจงาน **ยังมีครบ** (ลำดับคอลัมน์ปรับ UX ได้ถ้าไม่ทำให้ขาดข้อมูลสำคัญ)
- [ ] การค้นหา / กรอง / เรียงลำดับ / แบ่งหน้า — ถ้ามีใน PHP ให้มีใน React **หรือ** ระบุใน checklist ว่า “phase 2” พร้อมเหตุผล
- [ ] การกระทำต่อแถว: ดู / แก้ / ลบ / เปิด modal — เทียบพฤติกรรม PHP
- [ ] Empty state เมื่อไม่มีข้อมูล

**ค) ปุ่มและ flow รอบหน้า**

- [ ] ปุ่มรองรับ use case: export, import, พิมพ์, sync, ฯลฯ — ถ้ามีใน PHP ต้องมีแผนหรือปุ่มจริงบน React
- [ ] การกลับไปรายการ / ปิดฟอร์ม — flow ไม่ค้าง

**ง) โครงสร้างหน้าซับซ้อน**

- [ ] แท็บ / wizard / partial ที่ `include` ใน PHP — แมปเป็น `Tabs` / หลาย route / sub-component ใน React
- [ ] จุดที่โหลด `modalPages/*.php` — แมปเป็น `Dialog` / `Sheet` / หน้าย่อย + ติ๊กใน checklist ส่วน modal

**จ) ความเหมาะสมกับการใช้งานจริง**

- [ ] ใช้งานได้บนขนาดจอที่โรงงานใช้ (เดสก์ท็อปเป็นหลัก; responsive ตาม [`skills.md`](../skills.md))

#### หลักฐานแนะนำตอนปิดงาน (แนบใน PR หรือหมายเหตุแถว checklist)

1. รายการ **use case** แบบ bullet (จาก PHP) เทียบว่า React รองรับครบ
2. **Route** + ชื่อ component/หน้าหลักที่เกี่ยวข้อง
3. (ถ้ามี) สครีนช็อต 1–2 ภาพ หรือลิงก์ไฟล์ออกแบบสั้นๆ

### 3.2 ข้อมูล — ฟิลด์ / โครงสร้าง / contract กับ API

**หลักการ:** ฝั่ง UI แสดงและส่งข้อมูล **สอดคล้อง** กับที่ PHP อ่าน/เขียนจริง (ชื่อฟิลด์อาจเปลี่ยนเป็น camelCase ใน JSON ได้ แต่ต้องมี **ตารางแมป** หรือคอมเมนต์ใน schema)

#### ก่อนติ๊กข้อมูล — สแกน PHP

| แหล่ง | ดูอะไร |
|--------|--------|
| `SELECT` / `mysqli_query` / `fetch_assoc` | ชื่อคอลัมน์ที่แสดงและที่ใช้บันทึก |
| `INSERT` / `UPDATE` | ฟิลด์บังคับ, default, ค่าที่ derive ใน PHP |
| ฟอร์ม + `$_POST` | ชื่อพารามิเตอร์ที่รับจริง |
| ไฟล์อัปโหลด | ชนิดไฟล์, ขนาด, การเก็บ path — เทียบ SRS / [`skills.md`](../skills.md) |

#### Checklist ข้อมูล (ติ๊กเฉพาะข้อที่เกี่ยวกับหน้านั้น)

- [ ] รายการ **ฟิลด์สำคัญ** (แสดง + บันทึก) ตรงกับ query/ฟอร์ม PHP — ไม่หลุดฟิลด์ที่ผู้ใช้เคยกรอกหรือเคยเห็นในตาราง
- [ ] **ชนิดข้อมูล** สมเหตุสมผล (วันที่, ตัวเลข, enum, null) — ลด bug แปลงจาก PHP string/number
- [ ] มี **TypeScript type** และถ้าโปรเจกต์ใช้ — **Zod schema** (หรือเทียบเท่า) คู่กับฟอร์ม/response ที่เกี่ยวข้อง
- [ ] **Request/Response** ของ API ที่หน้าเรียก มีเอกสารหรือ type ชัด — path, method, body ตรงกับที่ออกแบบแทน PHP
- [ ] ช่วง **mock (MSW)** (`handlers.ts` ฯลฯ) คืนข้อมูลโครงสร้างเดียวกับที่ UI คาด (หรือระบุว่า dev ใช้ API จริงแทน)
- [ ] กรณี **แบ่งหน้า / กรอง / sort** — พารามิเตอร์ query ตรงกับ backend ใหม่ (ไม่ทิ้ง logic จาก PHP แบบเงียบๆ)

### 3.3 กฎธุรกิจ — validation และสิทธิ์ (เมนู / session)

**หลักการ:** ตาม [`skills.md`](../skills.md) — **ฝั่งเซิร์ฟเวอร์เป็นที่สุด**; ฝั่ง React ทำเพื่อ UX และลดคำขอผิดรูปแบบ

#### Validation

- [ ] กฎที่ผู้ใช้เห็นใน PHP (HTML5 `required`, `maxlength`, JS alert, ข้อความ error ภาษาไทย) มี **อย่างน้อยหนึ่งชั้น** บน React (RHF + Zod ตาม stack)
- [ ] กฎที่ซับซ้อน / ความปลอดภัย — **ซ้ำหรือเข้มกว่า** บน API (Express + Zod ตามแผน backend)
- [ ] ข้อความ error ใกล้ฟิลด์หรือ toast — ผู้ใช้แก้รายการได้โดยไม่งง

#### สิทธิ์และเมนู (`tbmenu`, `$_SESSION`)

- [ ] รู้ว่าเมนู/ปุ่มในหน้า PHP ถูกซ่อน/แสดงจากสิทธิ์ใด (เทียบ `left_menu.php` / logic ในแต่ละหน้า)
- [ ] ใน React มี **แผน** route guard / ซ่อนปุ่ม / disabled ตาม role — หรือ implement แล้วถ้า auth/RBAC พร้อม
- [ ] ไม่มีฟีเจอร์ที่ “ซ่อนบน UI แต่ยังเรียก API ได้” โดยไม่ตั้งใจ (ลดช่องโหว่)

### 3.4 Modal / แท็บย่อย — เทียบ `modalPages/` และ fragment ใน `pages/`

- [ ] สร้าง **รายการไฟล์** `modalPages/*.php` ที่หน้านี้โหลด (ajax, include, iframe)
- [ ] แต่ละไฟล์: กำหนดว่าเป็น **Dialog / Sheet / แท็บในหน้า / route ย่อย** ใน React และติ๊กใน **ตาราง checklist `sap/modalPages/` (ข้อ 5 ด้านล่าง)** ว่า **เสร็จ / กำลังทำ / ข้าม + เหตุผล**
- [ ] **Payload** ที่ส่งระหว่าง parent ↔ modal (เทียบ `$_GET`/`$_POST` / JSON ใน ajax เดิม) ถูกแมปใน API หรือ state ใหม่
- [ ] ปิด modal / ยกเลิก — state ไม่รั่ว (ข้อมูลค้าง, list ไม่รีเฟรชเมื่อต้องรีเฟรช)

### 3.5 ทดสอบ — MSW และ/หรือ API จริง

- [ ] **Happy path:** การกระทำหลักของหน้า (โหลด, ค้นหา, บันทึก, นำเข้า ฯลฯ) ผ่านบน environment ที่ตั้งค่าไว้ (dev + mock หรือ staging + API)
- [ ] **กรณีผิดพลาด:** อย่างน้อยหนึ่ง scenario ต่อหมวดที่สำคัญ — เช่น 401/403/500, validation error, network ล้ม (ตามที่โปรเจกต์รองรับ — อาจใช้หน้า `/error/:code` ที่ frontend)
- [ ] **Regression สั้นๆ:** บันทึกใน PR ว่า “ทดสอบอะไรแล้ว” (bullet 3–6 ข้อ)

---


## 4) Checklist — `sap/pages/` (เรียงตามชื่อไฟล์)

อัปเดตคอลัมน์ **สถานะ** และ **หมายเหตุ** เมื่อทำงานแต่ละไฟล์

| สถานะ | ไฟล์ PHP | หมายเหตุ / Route React |
|--------|----------|-------------------------|
| ข้าม | `aa.php` | เนื้อหาไฟล์มีแค่ข้อความ `aa` ไม่มี PHP/HTML — ไม่พบ `module=aa` ใน `sap/` — ไม่ต้องพอร์ต React |
| ข้าม | `autocomplete.php` | **หน้า `pages/`** — ตัวอย่าง autocomplete (โหลด `wkorder` ทั้งหมดจาก `tbiw37n` เป็น array ใน JS) ฟอร์มส่งไป `/action_page.php` — ไม่พบการลิงก์ `module=autocomplete` — ไม่ต้องมี route แยก; ฟังก์ชันจริงใช้ `modalPages/autocomplete.php` |
| เสร็จ | `backlog.php` | **Route:** `/backlog` — **BE:** `GET /api/v1/backlog/filter-options` + `POST /api/v1/backlog/events` + `POST /api/v1/scheduling/move-plan` + **`GET /api/v1/work-orders/:id`** (PG) — **React:** [`BacklogPage`](../PM-Pepsi-App/frontend/src/features/backlog/BacklogPage.tsx) + FullCalendar month/week/day + tooltip + select ช่วงวัน + drag&drop เปิด `MovePlanDialog` |
| ข้าม | `blankpage_bk17052563.php` | **สำรอง** — ไฟล์เป็น fragment เทมเพลต SB Admin “Blank Page” (ไม่มี `<?php` ไม่มี logic) — **ไม่พบ** `module=blankpage_bk17052563` ในโค้ดที่ใช้งาน (มีแค่ `module=blankpage` ใน `left_menu_bk09052563.php` ซึ่งเป็นเมนูสำรอง) — ไม่ต้องพอร์ต React |
| ข้าม | `calc_birthday.php` | **ไม่ใช่หน้า module** — ส่วน include แสดง “ปัจจุบันอายุ” จาก `$_SESSION['birthday']` + `timespan()` ใน [`include/function_calc_birthday.php`](../sap/include/function_calc_birthday.php); ใน `navbar.php` **ถูกคอมเมนต์** (`include('calc_birthday.php')`) — ไม่ต้องมี route แยก; พอร์ตเมื่อทำ **โปรไฟล์ผู้ใช้ / header** ให้คำนวณอายุแบบเดียวกับ `timespan` (เทียบ `index2.php` + `function_calc_birthday.php`) |
| ข้าม | `calc_worktime.php` | **ไม่ใช่หน้า module** — fragment include แสดง “อายุการทำงาน” จาก `$_SESSION['startwork']` + `timespan($startwork, $today)` ใน [`include/function_calc_birthday.php`](../sap/include/function_calc_birthday.php) (ฟังก์ชัน `timespan` ใช้ร่วมกับ `calc_birthday.php`); **ไม่พบ**การอ้างชื่อไฟล์ใน repo อื่น — ไม่ต้องมี route แยก; พอร์ตคู่กับ **โปรไฟล์ผู้ใช้ / header** เมื่อมีวันที่เริ่มงานจาก API |
| เสร็จ | `calendar.php` | **`index.php?module=calendar`** — FullCalendar + `M_filter_iw37.php` + `view_order` + สี `tbwkstatus` / ย้ายแผน — **React/BE:** [`004_tbiw37n_calendar.sql`](../database/migrations/004_tbiw37n_calendar.sql) + `GET /api/v1/calendar/events` + `GET /api/v1/calendar/filter-options` + `POST /api/v1/calendar/events` + [`CalendarPage`](../PM-Pepsi-App/frontend/src/features/calendar/CalendarPage.tsx) — **Parity:** filter form (Activity/Type/Status/Resources/Team/Product Line/Equipment/ช่วงวันที่) + modal รายละเอียด + drag เปิด MovePlanDialog |
| ข้าม | `calendar_bk170563.php` | สำรองของ `calendar.php` (bootstrap-select แบบ local แทน CDN) — ไม่พอร์ตแยก |
| เสร็จ | `calendar_wkctr.php` | **`index.php?module=calendar_wkctr&wkctr=`** — PDO อ่าน `view_confrim WHERE wkctr=…` + FullCalendar; ถูกเรียกจาก `user.php` — **React:** รองรับ `/calendar?wkctr=` และ `/calendar/wc/:code` (prefill `wkctr`) และ backend เลือกอ่าน `app.view_confrim` เมื่อมี filter `wkctr` (migration `028_view_confrim.sql`) |
| ข้าม | `charts.php` | **เทมเพลต SB Admin** — กราฟ Chart.js ตัวอย่าง (Area/Bar/Pie) **ไม่เชื่อม DB**; พบลิงก์ใน [`left_menu_bk09052563.php`](../sap/pages/left_menu_bk09052563.php) เป็น `index2.php?module=charts` เท่านั้น — ไม่พอร์ตเป็นหน้าแยก; รายงาน/KPI จริงให้ไป **`/reports`** |
| ข้าม | `Confirmation.php` | **ไม่ใช่เมนู production** — เมนูที่ใช้ชี้ไป **`M_confirmation.php`** (`index2.php?module=M_confirmation`); ไฟล์นี้โหลด `SELECT * FROM confirmation` แต่ปุ่ม/ลิงก์ส่วนใหญ่เป็น **`member_form.php` / `member_edit.php`** (คัดลอกจากโมดูลสมาชิก) — ถือเป็น dead/wrong template — **ไม่พอร์ต**; รวมความต้องการ “รับรองงาน” กับ **`/confirmation`** + `M_confirmation.php` / `W_confirmation.php` |
| ข้าม | `content.php` | **เทมเพลต SB Admin “Dashboard”** — การ์ดสี + กราฟตัวอย่าง + DataTable ข้อมูลสมมติ (พนักงาน Tiger Nixon ฯลฯ) **ไม่มี logic ระบบ** — ค่าเริ่มต้น [`index2.php`](../sap/index2.php) เมื่อไม่ส่ง `module` (`$module` = `content`) — ไม่พอร์ต clone ไฟล์นี้; หน้าแรก React ใช้ **`/`** (`HomePage`) แทน |
| ข้าม | `count_worktime.php` | **ไม่ใช่หน้า module** — fragment ~10 บรรทัด: query `tb_iw37n` แถวแรกที่ `workctr = $_SESSION['username']` แล้ว `echo` ค่า `worktime` เท่านั้น (ไม่มี HTML); ใน [`user.php`](../sap/pages/user.php) มี **`//include('count_worktime.php');`** ถูกคอมเมนต์ — ไม่พอร์ต route แยก; ถ้าต้องการแสดงเวลางานให้รวมเมื่อพอร์ต **โปรไฟล์ / `user.php`** + API |
| ข้าม | `datepicker.php` | **ตัวอย่าง jQuery UI แยกไฟล์** — เอกสาร HTML เต็ม (`<!doctype>` …) + `#datepicker` (`dateFormat: 'dd.mm.yy'`) **ไม่ถูก include** ใน shell หลัก; การเลือกวันที่จริงใช้ `$.datepicker` ในหน้าอื่น (`calendar.php`, `M_filter_iw37.php`, modal ฯลฯ) — ไม่พอร์ตไฟล์นี้; ใน React ใช้ date picker ของชุด UI (เช่น Shadcn Calendar) ตามหน้าที่พอร์ต |
| เสร็จ | `footer.php` | **React:** [`AppFooter.tsx`](../PM-Pepsi-App/frontend/src/components/layout/AppFooter.tsx) ใน `AppShell` — Copyright / Privacy / 7151 & Lays Lamphun — 2026-05-16 |
| ข้าม | `import_test.php` | **ทดสอบ / dev** — ฟอร์มอัปโหลด CSV + บล็อก `if ($action == "updata")` อ่าน `file_upload/*` แล้ว `INSERT` ลง `tb_equipment` (สคริปต์มีข้อผิดพลาด SQL `value` แทน `VALUES` และไม่มีเมนูอ้าง `module=import_test` ใน repo) — **ไม่พอร์ต**; นำเข้าข้อมูลจริงให้ไป flow **`M_*` / IW37N** + API ตาม [`skills.md`](../skills.md) |
| ข้าม | `info.php` | **เทมเพลต SB Admin** — หน้า “info” เนื้อหาเดียวกับ [`charts.php`](../sap/pages/charts.php) (Chart.js ตัวอย่าง ไม่เชื่อม DB); ใน [`login.php`](../sap/pages/login.php) / [`login-bk.php`](../sap/pages/login-bk.php) มี redirect ไป `?module=info` **ถูกคอมเมนต์** — ไม่พอร์ต route แยก; รายงาน/KPI ไป **`/reports`** |
| ข้าม | `iw37n.php` | **Legacy CRUD บน `tbiw37n`** — รายการ DataTable + `op=save`/`op=del` (SQL ต่อสตริงจาก `$_REQUEST`); ปุ่มนำเข้าชี้ `?module=iw37n_imports` แต่ใน repo **ไม่มี** `iw37n_imports.php` (มีแค่ [`M_iw37n_imports.php`](../sap/pages/M_iw37n_imports.php)) — **ไม่พบ** `module=iw37n` ในเมนูที่ใช้งาน; เมนูจริงใช้ **`index2.php?module=M_iw37n`** — **ไม่พอร์ต**; parity IW37N ไปที่ **`/iw37n`** + แถว checklist **`M_iw37n*.php`** |
| ข้าม | `iw37n_form.php` | **ฟอร์ม modal คู่ `iw37n.php`** — POST กลับ `?module=iw37n` ฟิลด์ 21 คอลัมน์ `tbiw37n` (ลูป `$filed[2..21]`); โหลดใน `#ajaxLargeModal` — ใช้คู่กับไฟล์ legacy ด้านบน — **ข้าม**; ฟอร์ม/นำเข้าจริงใช้ **`M_iw37n_form.php`** / **`M_iw37n_imports.php`** |
| เสร็จ | `left_menu.php` | **`GET /api/v1/nav/menu`** + import สคริปต์ [`import-auth-from-mysql.ps1`](../database/scripts/import-auth-from-mysql.ps1) — 2026-05-16 (แกน §3.6) |
| ข้าม | `left_menu_bk09052563.php` | **สำรอง** — เมนูคงที่ (calendar, backlog, line_calendar, M_iw37n, …) — ใช้เป็น **อ้างอิง parity** เท่านั้น — ไม่พอร์ตแยก |
| ข้าม | `left_menu_bk17052563.php` | **สำรอง** — เมนูคงที่ + เงื่อนไข `UserST` บางส่วน — **อ้างอิง parity** ใน checklist / sidebar — ไม่พอร์ตแยก |
| เสร็จ | `line_calendar.php` | **`index.php?module=line_calendar`** — PDO **`view_lineschdul`** / `tblineschdul` + สี `#408a63` / `#bfbfbf` — **React/BE:** migration [`003_tblineschdul.sql`](../database/migrations/003_tblineschdul.sql) + unique index [`023_tblineschdul_unique.sql`](../database/migrations/023_tblineschdul_unique.sql) + view [`027_view_lineschdul.sql`](../database/migrations/027_view_lineschdul.sql) + `GET /api/v1/line-calendar/events` + [`LineCalendarPage`](../PM-Pepsi-App/frontend/src/features/line-calendar/LineCalendarPage.tsx) — **Parity:** FullCalendar + สี `#408a63`/`#bfbfbf` + modal คลิกวัน(สร้าง)/คลิกกิจกรรม(แก้ไข) + drag & drop (เรียก `POST/PUT /api/v1/master-data/lineschdul`) |
| เสร็จ | `login.php` | Work center + member tabs, bcrypt, seed `009`, profile API — §3.6 — 2026-05-16 |
| ข้าม | `login-bk.php` | **สำรอง** — ล็อกอิน **`tbl_member`** + `last_login` + `tbl_system_userlog`; meta refresh ไป **`?module=info`** — ไม่ใช่ flow หลักของ `login.php` (`tbworkcenter`) — **ไม่พอร์ต** |
| เสร็จ | `logout.php` | `/logout` + API + userlog — §3.6 — 2026-05-16 |
| เสร็จ | `M_activitytype.php` | **PHP:** `tbactivitytype` + Excel/CRUD — **React/BE:** [`002_tbactivitytype.sql`](../database/migrations/002_tbactivitytype.sql) + CRUD/import API + [`ActivityTypePanel`](../PM-Pepsi-App/frontend/src/features/master-data/ActivityTypePanel.tsx) — **Parity:** import รองรับ `.csv/.xls/.xlsx/.xlsm/.xlsb` + skip 2 แถวแรกสำหรับ Excel; ฟอร์ม modal add/edit/delete (English-first validation+errors) |
| เสร็จ | `M_activitytype_form.php` | รวมกับ **`M_activitytype.php`** — modal ฟอร์มใน React: create/edit/delete โหมดเดียวกับ PHP |
| เสร็จ | `M_activitytype_imports.php` | รวมกับ **`M_activitytype.php`** — modal import file ใน React (file upload เป็นหลัก + CSV paste สำรอง) |
| ยังไม่ทำ | `M_Confirm.php` | import confirm (phase 2) |
| ยังไม่ทำ | `M_Confirm_form.php` | (phase 2) |
| ยังไม่ทำ | `M_Confirm_imports.php` | (phase 2) |
| กำลังทำ | `M_confirmation.php` | **React:** `/confirmation` — Phase 1: ค้นหา WO + tab Confirmation (เพิ่ม/ลบช่าง + เวลา) |
| กำลังทำ | `M_confirmation_form.php` | รวมกับ `M_confirmation.php` (Phase 1) |
| เสร็จ | `M_department.php` | **PHP:** `tbdepartment` + CRUD — **React/BE:** migration [`011_tbdepartment.sql`](../database/migrations/011_tbdepartment.sql) + `GET/POST/PUT/DELETE /api/v1/master-data/department` + แท็บ `department` ใน [`MasterDataPage`](../PM-Pepsi-App/frontend/src/features/master-data/MasterDataPage.tsx) (modal create/edit/delete, English-first validation+errors) |
| เสร็จ | `M_department_form.php` | รวมกับ **`M_department.php`** — modal ฟอร์มใน React: create/edit/delete โหมดเดียวกับ PHP |
| เสร็จ | `M_equipment.php` | **PHP:** `tbequipment` + Excel import/CRUD — **React/BE:** migration [`012_tbequipment.sql`](../database/migrations/012_tbequipment.sql) + `GET/POST/PUT/DELETE /api/v1/master-data/equipment` + `POST /api/v1/master-data/equipment/import` + แท็บ `equipment` ใน [`MasterDataPage`](../PM-Pepsi-App/frontend/src/features/master-data/MasterDataPage.tsx) (modal create/edit/delete + import file, English-first validation+errors; Excel skip 2 rows) |
| เสร็จ | `M_equipment_form.php` | รวมกับ **`M_equipment.php`** — modal ฟอร์มใน React: create/edit/delete โหมดเดียวกับ PHP |
| เสร็จ | `M_equipment_imports.php` | รวมกับ **`M_equipment.php`** — modal import file ใน React (file upload เป็นหลัก + CSV paste สำรอง) |
| ยังไม่ทำ | `M_Export_confirm.php` | |
| ยังไม่ทำ | `M_Export_confirm_excel.php` | |
| ยังไม่ทำ | `M_filter_iw37.php` | |
| เสร็จ | `M_functional.php` | **PHP:** `tbfunctional` + Excel import/CRUD — **React/BE:** ใช้ migration [`005_tbwkzb_tbfunctional.sql`](../database/migrations/005_tbwkzb_tbfunctional.sql) + `GET/POST/PUT/DELETE /api/v1/master-data/functional` + `POST /api/v1/master-data/functional/import` + แท็บ `functional` ใน [`MasterDataPage`](../PM-Pepsi-App/frontend/src/features/master-data/MasterDataPage.tsx) (modal create/edit/delete + import file, English-first validation+errors; Excel skip 2 rows) |
| เสร็จ | `M_functional_form.php` | รวมกับ **`M_functional.php`** — modal ฟอร์มใน React: create/edit/delete โหมดเดียวกับ PHP |
| เสร็จ | `M_functional_imports.php` | รวมกับ **`M_functional.php`** — modal import file ใน React (file upload เป็นหลัก + CSV paste สำรอง) |
| เสร็จ | `M_Group.php` | **PHP:** `tbwkctrgroup` CRUD — **React/BE:** migration [`021_tbwkctrgroup.sql`](../database/migrations/021_tbwkctrgroup.sql) + `GET/POST/PUT/DELETE /api/v1/master-data/group` + แท็บ `group` ใน [`MasterDataPage`](../PM-Pepsi-App/frontend/src/features/master-data/MasterDataPage.tsx) (modal create/edit/delete, English-first validation+errors) |
| เสร็จ | `M_group_form.php` | รวมกับ **`M_Group.php`** — modal ฟอร์มใน React: create/edit/delete |
| ยังไม่ทำ | `M_importConfrim.php` | |
| กำลังทำ | `M_iw37n.php` | **PHP:** Excel → `tbiw37n` (upsert wkorder+opac) — **React/BE:** [`006_tbiw37n_import_batch.sql`](../database/migrations/006_tbiw37n_import_batch.sql) + `POST /api/v1/iw37n/import` (multipart) + [`Iw37nPage`](../PM-Pepsi-App/frontend/src/features/iw37n/Iw37nPage.tsx) — **ยังไม่ครบ:** ตารางผล import รายแถวแบบ PHP, CRUD modal |
| กำลังทำ | `M_iw37n_form.php` | รวมกับ flow IW37N — ฟอร์มแก้รายการเดียว (ภายหลัง) |
| กำลังทำ | `M_iw37n_imports.php` | รวมกับ **`M_iw37n.php`** — modal upload ใน React |
| เสร็จ | `M_level.php` | **PHP:** `tbwklevel` CRUD — **React/BE:** migration [`019_tbwklevel.sql`](../database/migrations/019_tbwklevel.sql) + `GET/POST/PUT/DELETE /api/v1/master-data/level` + แท็บ `level` ใน [`MasterDataPage`](../PM-Pepsi-App/frontend/src/features/master-data/MasterDataPage.tsx) (modal create/edit/delete, English-first validation+errors) |
| เสร็จ | `M_level_form.php` | รวมกับ **`M_level.php`** — modal ฟอร์มใน React: create/edit/delete โหมดเดียวกับ PHP |
| เสร็จ | `M_lineproduct.php` | **PHP:** `tbproductline` + Excel import/CRUD — **React/BE:** migration [`015_tbproductline.sql`](../database/migrations/015_tbproductline.sql) + `GET/POST/PUT/DELETE /api/v1/master-data/lineproduct` + `POST /api/v1/master-data/lineproduct/import` + แท็บ `lineproduct` ใน [`MasterDataPage`](../PM-Pepsi-App/frontend/src/features/master-data/MasterDataPage.tsx) (modal create/edit/delete + import file; Excel skip 2 rows) |
| เสร็จ | `M_lineproduct_form.php` | รวมกับ **`M_lineproduct.php`** — modal ฟอร์มใน React: create/edit/delete โหมดเดียวกับ PHP |
| เสร็จ | `M_lineproduct_imports.php` | รวมกับ **`M_lineproduct.php`** — modal import file ใน React (file upload เป็นหลัก + CSV paste สำรอง) |
| เสร็จ | `M_lineschdul.php` | **PHP:** `tblineschdul` + Excel import/CRUD — **React/BE:** migration [`003_tblineschdul.sql`](../database/migrations/003_tblineschdul.sql) + unique index [`023_tblineschdul_unique.sql`](../database/migrations/023_tblineschdul_unique.sql) + `GET/POST/PUT/DELETE /api/v1/master-data/lineschdul` + `POST /api/v1/master-data/lineschdul/import` + แท็บ `lineschdul` ใน [`MasterDataPage`](../PM-Pepsi-App/frontend/src/features/master-data/MasterDataPage.tsx) (modal create/edit/delete + import file; Excel skip 2 rows; รองรับ CSV ด้วย) |
| เสร็จ | `M_lineschdul_form.php` | รวมกับ **`M_lineschdul.php`** — modal ฟอร์มใน React: create/edit/delete |
| เสร็จ | `M_lineschdul_imports.php` | รวมกับ **`M_lineschdul.php`** — modal import file ใน React (file upload เป็นหลัก + CSV paste สำรอง) |
| เสร็จ | `M_machine.php` | **PHP:** `tbmainteanance` + Excel import/CRUD (map Zone/Type) — **React/BE:** migrations [`016_tbzone.sql`](../database/migrations/016_tbzone.sql), [`017_tbmainteanance.sql`](../database/migrations/017_tbmainteanance.sql) + `GET/POST/PUT/DELETE /api/v1/master-data/machine` + `POST /api/v1/master-data/machine/import` + แท็บ `machine` ใน [`MasterDataPage`](../PM-Pepsi-App/frontend/src/features/master-data/MasterDataPage.tsx) (modal create/edit/delete + import file; Excel skip 2 rows) |
| เสร็จ | `M_machine_form.php` | รวมกับ **`M_machine.php`** — modal ฟอร์มใน React: create/edit/delete โหมดเดียวกับ PHP |
| เสร็จ | `M_machine_imports.php` | รวมกับ **`M_machine.php`** — modal import file ใน React (file upload เป็นหลัก + CSV paste สำรอง) |
| ยังไม่ทำ | `M_manhour.php` | |
| ยังไม่ทำ | `M_manhour_chart.php` | |
| ยังไม่ทำ | `M_manhour_chart_performance.php` | |
| ยังไม่ทำ | `M_manhour_chart_show.php` | |
| ยังไม่ทำ | `M_manhour_form.php` | |
| ยังไม่ทำ | `M_manhour_imports.php` | |
| เสร็จ | `M_material.php` | **PHP:** `tbmaterial` + Excel import/CRUD — **React/BE:** migration [`018_tbmaterial.sql`](../database/migrations/018_tbmaterial.sql) + `GET/POST/PUT/DELETE /api/v1/master-data/material` + `POST /api/v1/master-data/material/import` + แท็บ `material` ใน [`MasterDataPage`](../PM-Pepsi-App/frontend/src/features/master-data/MasterDataPage.tsx) (modal create/edit/delete + import file; Excel skip 2 rows; เก็บ `date` ใน PG) |
| เสร็จ | `M_material_form.php` | รวมกับ **`M_material.php`** — modal ฟอร์มใน React: create/edit/delete โหมดเดียวกับ PHP |
| เสร็จ | `M_material_imports.php` | รวมกับ **`M_material.php`** — modal import file ใน React (file upload เป็นหลัก + CSV paste สำรอง) |
| ยังไม่ทำ | `M_personel.php` | |
| ยังไม่ทำ | `M_personel_confirm.php` | |
| ยังไม่ทำ | `M_personel_confirm_form.php` | |
| ยังไม่ทำ | `M_personel_form.php` | |
| ยังไม่ทำ | `M_personel_imports.php` | |
| ยังไม่ทำ | `M_plan_calendar.php` | |
| ยังไม่ทำ | `M_planwork_close.php` | |
| กำลังทำ | `M_planwork_view.php` | React **`/planning`** + `007_tbplangingwork_view_planwork.sql` + `GET /planning/orders`; ยังไม่มี `M_planwork_view_form` / modal จ่ายทีม |
| ยังไม่ทำ | `M_planwork_view_form.php` | |
| ยังไม่ทำ | `M_planwork_view_form_close.php` | |
| เสร็จ | `M_position.php` | **PHP:** `tbposition` CRUD — **React/BE:** migration [`020_tbposition.sql`](../database/migrations/020_tbposition.sql) + `GET/POST/PUT/DELETE /api/v1/master-data/position` + แท็บ `position` ใน [`MasterDataPage`](../PM-Pepsi-App/frontend/src/features/master-data/MasterDataPage.tsx) (modal create/edit/delete, English-first validation+errors) |
| เสร็จ | `M_position_form.php` | รวมกับ **`M_position.php`** — modal ฟอร์มใน React: create/edit/delete โหมดเดียวกับ PHP |
| เสร็จ | `M_reason.php` | **PHP:** `tbreason` CRUD — **React/BE:** ใช้ migration [`009_tbreason.sql`](../database/migrations/009_tbreason.sql) + `GET/POST/PUT/DELETE /api/v1/master-data/reason` + แท็บ `reason` ใน [`MasterDataPage`](../PM-Pepsi-App/frontend/src/features/master-data/MasterDataPage.tsx) (modal create/edit/delete, English-first validation+errors) |
| เสร็จ | `M_reason_form.php` | รวมกับ **`M_reason.php`** — modal ฟอร์มใน React: create/edit/delete โหมดเดียวกับ PHP |
| เสร็จ | `M_tasklist.php` | **PHP:** `tbtasklist` + Excel import/CRUD — **React/BE:** migration [`022_tbtasklist.sql`](../database/migrations/022_tbtasklist.sql) + `GET/POST/PUT/DELETE /api/v1/master-data/tasklist` + `POST /api/v1/master-data/tasklist/import` + แท็บ `tasklist` ใน [`MasterDataPage`](../PM-Pepsi-App/frontend/src/features/master-data/MasterDataPage.tsx) (modal create/edit/delete + import file; Excel skip 2 rows; รองรับ CSV ด้วย) |
| เสร็จ | `M_tasklist_form.php` | รวมกับ **`M_tasklist.php`** — modal ฟอร์มใน React: create/edit/delete |
| เสร็จ | `M_tasklist_imports.php` | รวมกับ **`M_tasklist.php`** — modal import file ใน React (file upload เป็นหลัก + CSV paste สำรอง) |
| เสร็จ | `M_UserLog.php` | **React:** `/user-log` — **BE:** `GET /api/v1/user-log` (filter ตามผู้ใช้ที่ล็อกอิน; limit 50) |
| เสร็จ | `M_workstatus.php` | **PHP:** `tbwkstatus` CRUD — **React/BE:** migration [`013_tbwkstatus_add_wkstreason.sql`](../database/migrations/013_tbwkstatus_add_wkstreason.sql) (เพิ่ม `wkstreason`) + `GET/POST/PUT/DELETE /api/v1/master-data/workstatus` + แท็บ `workstatus` ใน [`MasterDataPage`](../PM-Pepsi-App/frontend/src/features/master-data/MasterDataPage.tsx) (modal create/edit/delete, English-first validation+errors) |
| เสร็จ | `M_workstatus_form.php` | รวมกับ **`M_workstatus.php`** — modal ฟอร์มใน React: create/edit/delete โหมดเดียวกับ PHP |
| เสร็จ | `M_worktype.php` | **PHP:** `tbwkctrtype` CRUD — **React/BE:** migration [`014_tbwkctrtype.sql`](../database/migrations/014_tbwkctrtype.sql) + `GET/POST/PUT/DELETE /api/v1/master-data/worktype` + แท็บ `worktype` ใน [`MasterDataPage`](../PM-Pepsi-App/frontend/src/features/master-data/MasterDataPage.tsx) (modal create/edit/delete, English-first validation+errors) |
| เสร็จ | `M_worktype_form.php` | รวมกับ **`M_worktype.php`** — modal ฟอร์มใน React: create/edit/delete โหมดเดียวกับ PHP |
| เสร็จ | `M_zb.php` | **PHP:** `tbwkzb` CRUD — **React/BE:** ใช้ migration [`005_tbwkzb_tbfunctional.sql`](../database/migrations/005_tbwkzb_tbfunctional.sql) + `GET/POST/PUT/DELETE /api/v1/master-data/zb` + แท็บ `zb` ใน [`MasterDataPage`](../PM-Pepsi-App/frontend/src/features/master-data/MasterDataPage.tsx) (modal create/edit/delete, English-first validation+errors) |
| เสร็จ | `M_zb_form.php` | รวมกับ **`M_zb.php`** — modal ฟอร์มใน React: create/edit/delete |
| เสร็จ | `M_zone.php` | **Dependency สำหรับ Machine:** migration [`016_tbzone.sql`](../database/migrations/016_tbzone.sql) + `GET/POST/PUT/DELETE /api/v1/master-data/zone` + แท็บ `zone` ใน [`MasterDataPage`](../PM-Pepsi-App/frontend/src/features/master-data/MasterDataPage.tsx) |
| เสร็จ | `M_zone_form.php` | รวมกับ **`M_zone.php`** — modal ฟอร์มใน React: create/edit/delete |
| เสร็จ | `M_zone_imports.php` | **PHP:** Excel import `tbzone` (skip 2 rows; map `productline` → `idproductline`) — **React/BE:** migration [`016_tbzone.sql`](../database/migrations/016_tbzone.sql) + extend [`024_tbzone_extend.sql`](../database/migrations/024_tbzone_extend.sql) + `POST /api/v1/master-data/zone/import` + แท็บ `zone` ใน [`MasterDataPage`](../PM-Pepsi-App/frontend/src/features/master-data/MasterDataPage.tsx) (import file รองรับ CSV/Excel + skip 2 rows; เพิ่มฟิลด์ `zonedescrip` + `idproductline`) |
| ยังไม่ทำ | `member.php` | |
| ยังไม่ทำ | `member_change_password.php` | |
| ยังไม่ทำ | `member_change_password_process.php` | |
| ยังไม่ทำ | `member_chk_password.php` | |
| ยังไม่ทำ | `member_edit.php` | |
| ยังไม่ทำ | `member_export.php` | |
| ยังไม่ทำ | `member_form.php` | |
| ยังไม่ทำ | `member_import.php` | |
| ยังไม่ทำ | `member_import_process.php` | |
| ยังไม่ทำ | `navbar.php` | shell |
| ยังไม่ทำ | `password.php` | |
| ยังไม่ทำ | `personel_form_tab1.php` | |
| ยังไม่ทำ | `personel_form_tab2.php` | |
| ยังไม่ทำ | `personel_form_tab3.php` | |
| ยังไม่ทำ | `register.php` | |
| ยังไม่ทำ | `Scheduing.php` | |
| ยังไม่ทำ | `select_equipment.php` | |
| ยังไม่ทำ | `selectMunti.php` | |
| ยังไม่ทำ | `show_form.php` | |
| ยังไม่ทำ | `slectall.php` | |
| ยังไม่ทำ | `tables.php` | |
| ยังไม่ทำ | `tabs.php` | |
| ยังไม่ทำ | `tb_confirm.php` | |
| ยังไม่ทำ | `tb_equipment.php` | |
| ยังไม่ทำ | `tb_equipment_delete.php` | |
| ยังไม่ทำ | `tb_equipment_export.php` | |
| ยังไม่ทำ | `tb_equipment_exports.php` | |
| ยังไม่ทำ | `tb_equipment_form.php` | |
| ยังไม่ทำ | `tb_equipment_form_process.php` | |
| ยังไม่ทำ | `tb_equipment_import.php` | |
| ยังไม่ทำ | `tb_equipment_import_process.php` | |
| ยังไม่ทำ | `tb_equipment_imports.php` | |
| ยังไม่ทำ | `tb_equipment_imports_process.php` | |
| ยังไม่ทำ | `tb_equipment-bk.php` | สำรอง |
| ยังไม่ทำ | `tb_functional.php` | |
| ยังไม่ทำ | `tb_functional_delete.php` | |
| ยังไม่ทำ | `tb_functional_form.php` | |
| ยังไม่ทำ | `tb_ip19.php` | |
| ยังไม่ทำ | `tb_ip19_form.php` | |
| ยังไม่ทำ | `tb_iw37n.php` | |
| ยังไม่ทำ | `tb_iw37n_form.php` | |
| ยังไม่ทำ | `tb_machine.php` | |
| ยังไม่ทำ | `tb_machine_form.php` | |
| ยังไม่ทำ | `tb_manhour_imports.php` | |
| ยังไม่ทำ | `tb_mc_work.php` | |
| ยังไม่ทำ | `tb_mc_work_form.php` | |
| ยังไม่ทำ | `tb_mntplan.php` | |
| ยังไม่ทำ | `tb_mntplan_form.php` | |
| ยังไม่ทำ | `tb_striped_product.php` | |
| ยังไม่ทำ | `tb_striped_product_form.php` | |
| ยังไม่ทำ | `tb_workcentre.php` | |
| ยังไม่ทำ | `tb_workcentre_form.php` | |
| ยังไม่ทำ | `tb_workcentretype.php` | |
| ยังไม่ทำ | `tb_workcentretype_form.php` | |
| ยังไม่ทำ | `tb_zone.php` | |
| ยังไม่ทำ | `tb_zone_form.php` | |
| ยังไม่ทำ | `tbdepartment.php` | |
| ยังไม่ทำ | `tbdepartment_form.php` | |
| ยังไม่ทำ | `tbposition.php` | |
| ยังไม่ทำ | `tbposition_form.php` | |
| ยังไม่ทำ | `tbwkctrgroup.php` | |
| ยังไม่ทำ | `tbwkctrgroup_form.php` | |
| ยังไม่ทำ | `tbwkctrtype.php` | |
| ยังไม่ทำ | `tbwkctrtype_form.php` | |
| ยังไม่ทำ | `test_date.php` | ทดสอบ |
| ยังไม่ทำ | `test_date3.php` | ทดสอบ |
| ยังไม่ทำ | `Test_fileinput.php` | ทดสอบ |
| ยังไม่ทำ | `user.php` | |
| ยังไม่ทำ | `user_form.php` | |
| ยังไม่ทำ | `user_form_tab1.php` | |
| ยังไม่ทำ | `user_form_tab2.php` | |
| ยังไม่ทำ | `user_form_tab4.php` | |
| ยังไม่ทำ | `user_form-bk.php` | สำรอง |
| ยังไม่ทำ | `user_profile.php` | |
| ยังไม่ทำ | `view_confirm.php` | |
| ยังไม่ทำ | `view_planwork.php` | |
| ยังไม่ทำ | `W_add_image.php` | |
| ยังไม่ทำ | `W_add_image_upload.php` | |
| ยังไม่ทำ | `W_calc_birthday.php` | |
| ยังไม่ทำ | `W_calc_birthday_worktime.php` | |
| ยังไม่ทำ | `W_calc_worktime.php` | |
| ยังไม่ทำ | `W_calendar.php` | |
| ยังไม่ทำ | `W_calendar_wkctr.php` | |
| เสร็จ | `W_confirm_form.php` | **React:** แท็บ `Confirm` ใน `WorkOrderDetailDialog` รวม 3 แท็บ (Close Images/Close Detail/Close Work) |
| เสร็จ | `W_confirm_formcom.php` | **React:** Close Detail (comment) — API: `GET/POST/PUT/DELETE /api/v1/confirmation/...comments...` (migration `029_confirmation_comments_images.sql`) |
| เสร็จ | `W_confirm_formcom_edit.php` | **React:** edit comment ใน Close Detail |
| เสร็จ | `W_confirm_formimg.php` | **React:** Close Images (upload/list/delete/view) — API: `GET/POST/DELETE /api/v1/confirmation/...images...` + `GET /api/v1/confirmation/images/:idcimg/data` |
| เสร็จ | `W_confirm_formimg2.php` | **React:** Close Images (รองรับ JPEG) |
| เสร็จ | `W_confirm_workclose.php` | **React:** Close Work Confirm — API: `GET /api/v1/confirmation/by-wkorder/:wkorder` + `POST /api/v1/confirmation/:idiw37/close` + `DELETE /api/v1/confirmation/close/:idclose` |
| เสร็จ | `W_confirmation.php` | **React:** รายละเอียด WO → Confirm tab (รวม flow confirmation) |
| เสร็จ | `W_confirmation_form.php` | **React:** ฟอร์มปิดงานใน Confirm tab |
| ยังไม่ทำ | `W_manhours_hr.php` | |
| ยังไม่ทำ | `W_planwork_view.php` | |
| ยังไม่ทำ | `W_planwork_view_close.php` | |
| ยังไม่ทำ | `W_summary_weekly.php` | |
| ยังไม่ทำ | `W_summary_weekly_chart.php` | |
| ยังไม่ทำ | `W_summary_weekly_chart_full.php` | |
| ยังไม่ทำ | `W_summary_weekly_chart2.php` | |
| ยังไม่ทำ | `W_summary_weekly_chart2_full.php` | |
| ยังไม่ทำ | `W_worktime_count.php` | |
| ยังไม่ทำ | `W_worktime_view.php` | |
| เสร็จ | `Work_Order_Status.php` | **React:** `/work-orders` แสดงตาราง status จาก `app.tbwkstatus` (syst/wkstreason/wkstcolor) |
| เสร็จ | `workorder.php` | **React:** `/work-orders` ฟิลเตอร์แบบ `M_filter_iw37` + ตารางรายการจาก `app.view_order` + เลือก Team A/B/P ต่อแถว (API: `GET /api/v1/work-orders/filter-options`, `POST /api/v1/work-orders/search`, `PUT /api/v1/work-orders/:id/team`) |
| ยังไม่ทำ | `worktime_count.php` | |
| ยังไม่ทำ | `worktime_manhours.php` | |
| ยังไม่ทำ | `worktime_view.php` | |

---

## 5) Checklist — `sap/modalPages/` (fragment / modal / AJAX)

| สถานะ | ไฟล์ PHP | หมายเหตุ |
|--------|----------|---------|
| ยังไม่ทำ | `AddClose.php` | |
| ยังไม่ทำ | `AddClosePersonel.php` | |
| ยังไม่ทำ | `AddPlan.php` | |
| ยังไม่ทำ | `AddTeam.php` | |
| ยังไม่ทำ | `autocomplete.php` | **`modalPages/`** — endpoint AJAX: `GET ?q=` ค้น `view_order.wkorder` (LOCATE) จำกัด 50 แถว; คืน `<li>` แสดง `wkorder` / `wktype` / `operationshorttext` — ถูกเรียกจาก `pages/M_confirmation.php` → พอร์ตเป็น API + combobox คู่กับหน้า confirmation / work order |
| ยังไม่ทำ | `ChackStatus.php` | |
| ยังไม่ทำ | `confirmTab1.php` | |
| ยังไม่ทำ | `confirmTab2.php` | |
| ยังไม่ทำ | `confirmTab3.php` | |
| ยังไม่ทำ | `confirmTab4.php` | |
| เสร็จ | `FilterDetail.php` | **React:** `/backlog` แสดง “สรุปตัวกรอง” (WorkOrder + breakdown ตาม `tbwkzb` + completion + Team A/B/P + sum(work)) — **API:** `POST /api/v1/backlog/filter-detail` |
| ยังไม่ทำ | `FilterDetail_AddTeam.php` | |
| เสร็จ | `ModalMHshow.php` | **React:** `/backlog` manhour dialog (เลือกช่วงวันจาก FullCalendar / DatePicker) → **API:** `POST /api/v1/backlog/manhour-summary` (รวม plan/action, breakdown ตาม `tbwkzb`, completion, ตารางรายการจาก `view_order`) |
| เสร็จ | `ModalOrderDetail.php` | **React:** `WorkOrderDetailDialog` (แท็บ Work Order / Task List / Machine / Planning / Material / Confirm) — **API:** `GET /api/v1/work-orders/:id/modal-detail` + **Planning:** `PUT/DELETE /api/v1/work-orders/:id/planning` |
| ยังไม่ทำ | `ModalOrderDetailXXX.php` | |
| ยังไม่ทำ | `MovePlant.php` | |
| ยังไม่ทำ | `plan_confirmTab1.php` | |
| ยังไม่ทำ | `plan_confirmTab1_close.php` | |
| ยังไม่ทำ | `plan_confirmTab2.php` | |
| ยังไม่ทำ | `plan_confirmTab2_close.php` | |
| ยังไม่ทำ | `plan_confirmTab3.php` | |
| ยังไม่ทำ | `plan_confirmTab3_close.php` | |
| ยังไม่ทำ | `plan_ShowClose_close.php` | |
| ยังไม่ทำ | `plan_ShowImgUpload_close.php` | |
| ยังไม่ทำ | `plan_submit_upload_file.php` | |
| ยังไม่ทำ | `ShowClose.php` | |
| ยังไม่ทำ | `ShowImgUpload.php` | |
| ยังไม่ทำ | `ShowPlan.php` | |
| ยังไม่ทำ | `ShowPlan_Close.php` | |
| ยังไม่ทำ | `ShowPlanGroup.php` | |
| ยังไม่ทำ | `ShowWorkClose.php` | |
| ยังไม่ทำ | `submit_upload_file.php` | |
| ยังไม่ทำ | `TabMachine.php` | |
| ยังไม่ทำ | `TabMaterial.php` | |
| ยังไม่ทำ | `TabPlanning.php` | |
| ยังไม่ทำ | `TabTarkList.php` | |
| ยังไม่ทำ | `TabWorkOrder.php` | |

---

## 6) สรุปจำนวน (อัปเดตเมื่อมีการข้าม/รวมไฟล์)

| พื้นที่ | จำนวนไฟล์ (ประมาณ) |
|---------|---------------------|
| `sap/pages/*.php` | 204 |
| `sap/modalPages/*.php` | 37 |
| **รวมรายการใน checklist** | 241 |

เมื่อทำงานจริง อาจลดจำนวนแถวโดยรวม `_form` + list หลักเป็น “ชุดเดียว” แต่ **ต้องระบุในหมายเหตุ** ว่ารวมแล้ว

---

## 7) ประวัติการอัปเดตเอกสาร

| วันที่ | ผู้แก้ | สรุป |
|--------|--------|------|
| 2026-05-16 | — | สร้างเอกสารครั้งแรก — เติมรายการครบจาก `sap/pages` และ `sap/modalPages` |
| 2026-05-16 | — | `aa.php` — วิเคราะห์แล้ว: stub ว่าง → สถานะ **ข้าม** (ไม่พอร์ต) |
| 2026-05-16 | — | `pages/autocomplete.php` — ตัวอย่าง/ทดลอง → **ข้าม**; `modalPages/autocomplete.php` — endpoint ค้น work order → คง **ยังไม่ทำ** จนกว่าจะพอร์ต `M_confirmation` + API |
| 2026-05-16 | — | ขยาย **ข้อ 3.1 UI** — checklist ฟอร์ม/ตาราง/ปุ่ม/โครงสร้างหน้า + วิธีสแกน PHP; แก้ชื่อ layout เป็น `AppShell` |
| 2026-05-16 | — | เพิ่ม **ข้อ 3.2–3.5** (ข้อมูล / กฎธุรกิจ / modal / ทดสอบ) และอัปเดต bullet หลักข้อ 3 ให้อ้างอิงหมวดย่อย |
| 2026-05-16 | — | **Sidebar** — จัดกลุ่มเมนู + เพิ่มลิงก์ parity (`line-calendar`, `confirmation`, `worktime`, `manhours-hr`, `summary-weekly`) อ้างอิง `left_menu.php` / `left_menu_bk17052563.php` |
| 2026-05-16 | — | **`calc_birthday.php`** — fragment navbar + `timespan` → **ข้าม** เป็น route; รวมความต้องการกับโปรไฟล์/ `function_calc_birthday.php` เมื่อทำ auth |
| 2026-05-16 | — | **`blankpage_bk17052563.php`** — fragment เทมเพลตสำรอง → **ข้าม** (ไม่พอร์ต) |
| 2026-05-16 | — | **`calendar.php` / `calendar_bk170563.php` / `calendar_wkctr.php`** — วิเคราะห์: หลัก = FullCalendar+`M_filter_iw37`; bk=ข้าม; wkctr=`view_confrim`+ลิงก์จาก `user.php` → อัปเดต checklist + แมปข้อ 2 |
| 2026-05-16 | — | **`calc_worktime.php`** — fragment “อายุการทำงาน” (`startwork` + `timespan`) → **ข้าม** เป็น route; คู่ `calc_birthday.php` ในโปรไฟล์ |
| 2026-05-16 | — | **`backlog.php` → React** `/backlog` + MSW `filter-options` / `events`; checklist **เสร็จ** (ยังเหลือ MovePlant / DnD เต็มรูปแบบ) |
| 2026-05-16 | — | **`charts.php` / `Confirmation.php` / `content.php`** — วิเคราะห์: เทมเพลตหรือโค้ดค้างที่ไม่สอดคล้องเมนูหลัก → checklist **ข้าม**; แก้แมปข้อ 2 (`/reports` ไม่นับ demo `charts.php`; เพิ่มแถว `content.php` → **`/`**) |
| 2026-05-16 | — | **`count_worktime.php` / `datepicker.php` / `footer.php`** — fragment/query echo + demo jQuery UI แยกไฟล์ → **ข้าม** สองแรก; `footer.php` = shell ยังไม่ครบใน `AppShell` (ไม่มีแถบล่าง) |
| 2026-05-16 | — | **สัญญา API + MSW** — เพิ่มหัวข้อใน `skills.md`; checklist ข้อ 1 bullet 5; คอมเมนต์อ้างอิงใน `schemas.ts` / `handlers.ts` |
| 2026-05-16 | — | **MSW + Zod** — เพิ่ม `mocks/jsonFromSchema.ts`; handlers หลักใช้ `safeParse` ก่อนคืน JSON; เพิ่ม `healthResponseSchema`, `iw37nBatchItemSchema`, `iw37nImportResponseSchema` ใน `schemas.ts`; อัปเดต `skills.md` |
| 2026-05-16 | — | **`import_test.php` / `info.php`** — วิเคราะห์: ทดสอบ import + เทมเพลต demo — checklist **ข้าม** |
| 2026-05-16 | — | **`iw37n.php` / `iw37n_form.php`** — legacy CRUD `tbiw37n` ไม่มีเมนู; เมนูจริง = `M_iw37n*` — checklist **ข้าม**; parity ที่ **`/iw37n`** + แถว `M_iw37n*.php` |
| 2026-05-16 | — | **`left_menu*.php` / `line_calendar.php` / `login.php` / `login-bk.php` / `logout.php`** — วิเคราะห์: เมนู DB + default `line_calendar`; login WC vs backup member; logout + userlog — อัปเดต checklist |
| 2026-05-16 | — | **`M_activitytype.php` (+ `_form` / `_imports`)** — `tbactivitytype` + Excel import ในไฟล์หลัก; React `/master-data` แท็บ activitytype ยัง mock ไม่ครบ — checklist **กำลังทำ** |
| 2026-05-16 | — | **เอกสาร `docs/PM-BACKEND-DATABASE-DESIGN.md`** — สรุปแหล่ง MySQL `sap_lay` + `db_lays.sql`, inventory ตาราง/view, กลยุทธ์ PG, middleware, แมป API, phase migration; อัปเดต `PROJECT-STRUCTURE.md` §0 + `skills.md` ลิงก์ |
| 2026-05-16 | — | **โฟลเดอร์ `database/`** — `README.md`, `migrations/001_init_auth_tables.sql`, `legacy-reference/README`, `scripts/export-sap-lay-schema.ps1`, `database.env.example`; อัปเดต `PM-BACKEND-DATABASE-DESIGN.md` §7 + `PROJECT-STRUCTURE` §4 |
| 2026-05-16 | — | **Backend scaffold** — `PM-Pepsi-App/backend/` (Express + TS, health + PG); Vite `server.proxy` `/api` → API; `healthResponseSchema` + MSW/Settings รองรับ `db`; อัปเดต `database/README`, `PROJECT-STRUCTURE` |
| 2026-05-16 | — | **Auth API** — `POST /api/v1/auth/login` + `logout`; PG `pepsi_pm` @ **5433**; `LoginPage` + `AppShell` logout; Zod `loginResponseSchema` / MSW; อัปเดตแถว `login.php` / `logout.php` ใน checklist |
| 2026-05-16 | — | **Route guard** — `RequireAuth` / `GuestOnly` ใน [`AuthGuards.tsx`](../PM-Pepsi-App/frontend/src/features/auth/AuthGuards.tsx); หลัง login → `/line-calendar`; deep link กลับ path เดิม; อัปเดต checklist `login.php` |
| 2026-05-16 | — | **Auth ลำดับที่ 1** — RBAC sidebar (`nav-rbac`, `menuright` A/U/W); `NavRouteGuard`; JWT + `GET /auth/me` + cookie; `SESSION_SECRET`; อัปเดต checklist `left_menu` / login / logout |
| 2026-05-16 | — | **Master data ลำดับที่ 2** — `002_tbactivitytype.sql`; `GET /api/v1/master-data/activitytype`; Zod `activityTypeItemSchema`; UI แท็บ activitytype ต่อ DB; อัปเดต `M_activitytype.php` ใน checklist |
| 2026-05-16 | — | **Line calendar ลำดับที่ 3** — `003_tblineschdul.sql`; `GET /api/v1/line-calendar/events`; [`LineCalendarPage`](../PM-Pepsi-App/frontend/src/features/line-calendar/LineCalendarPage.tsx) + MSW; route `/line-calendar` แทน placeholder |
| 2026-05-16 | — | **Work calendar ลำดับที่ 4** — `004_tbiw37n_calendar.sql` (`tbiw37n`, `tbwkstatus`, `tbmoveplan`, `view_order`); `GET /api/v1/calendar/events`; [`CalendarPage`](../PM-Pepsi-App/frontend/src/features/calendar/CalendarPage.tsx) ต่อ DB |
| 2026-05-16 | — | **Backlog ลำดับที่ 5** — `GET /api/v1/backlog/filter-options` + `POST /api/v1/backlog/events` (PG); แชร์ logic กับ calendar ใน `scheduling-shared.ts`; [`BacklogPage`](../PM-Pepsi-App/frontend/src/features/backlog/BacklogPage.tsx) badge API+DB |
| 2026-05-16 | — | **ลำดับที่ 6** — `005_tbwkzb_tbfunctional.sql`; CRUD/import activitytype; `GET /work-orders` + `/:id` จาก `tbiw37n`; [`ActivityTypePanel`](../PM-Pepsi-App/frontend/src/features/master-data/ActivityTypePanel.tsx) |
| 2026-05-16 | — | **IW37N ลำดับที่ 7** — `006_tbiw37n_import_batch.sql`; `POST /iw37n/import` (xlsx/csv + SHA256); [`Iw37nPage`](../PM-Pepsi-App/frontend/src/features/iw37n/Iw37nPage.tsx) |
| 2026-05-16 | — | **Dashboard + Planning ลำดับที่ 8** — `007_tbplangingwork_view_planwork.sql`; `GET /dashboard/summary`, `GET /planning/orders`; [`HomePage`](../PM-Pepsi-App/frontend/src/features/home/HomePage.tsx), [`PlanningPage`](../PM-Pepsi-App/frontend/src/features/planning/PlanningPage.tsx) badge API+DB |
| 2026-05-16 | — | **เอกสารงานค้าง** — โฟลเดอร์ [`docs/parity-pending/`](parity-pending/README.md) แยก `.md` ลำดับ 1–8 + `00-cross-cutting`; อ้างอิงจาก §1.1 ใน checklist นี้ |
| 2026-05-16 | — | **Auth ลำดับที่ 1 (ต่อ)** — `008_auth_tbmenu_member.sql`; `GET /nav/menu`; bcrypt + member login; `/logout`; อัปเดต [`01-auth.md`](parity-pending/01-auth.md) |
| 2026-05-16 | — | **Auth ลำดับที่ 1 (ปิดแกน)** — import MySQL script, seed `009`, footer, `GET /auth/profile`, §3.6 เสร็จ; parity-pending ลำดับ 9–13 + [`COMPLETION-MATRIX.md`](parity-pending/COMPLETION-MATRIX.md) |
| 2026-05-16 | — | **Cross-cutting §DB** — `run-all-migrations.ps1`, `run-all-seeds.ps1`, `verify_app_schema.sql`, seed `010`, [`ON-SITE-DATABASE-SETUP.md`](ON-SITE-DATABASE-SETUP.md) |
| 2026-05-18 | — | **`M_activitytype.php` (+ `_form` / `_imports`)** — ปิด parity: import รองรับ `.csv/.xls/.xlsx/.xlsm/.xlsb` + skip 2 แถวแรก (Excel), modal ฟอร์ม create/edit/delete, validation+errors ฝั่ง UI (English-first); อัปเดต [`parity-pending/02-master-data.md`](parity-pending/02-master-data.md) |
| 2026-05-18 | — | **`M_department.php` (+ `_form`)** — ปิด parity: migration `011_tbdepartment.sql`, CRUD API `.../master-data/department`, แท็บ Department ต่อ DB ใน `/master-data` (modal create/edit/delete, English-first validation+errors); อัปเดต [`parity-pending/02-master-data.md`](parity-pending/02-master-data.md) |
| 2026-05-18 | — | **`M_equipment.php` (+ `_form` / `_imports`)** — ปิด parity: migration `012_tbequipment.sql`, CRUD/import API `.../master-data/equipment`, แท็บ Equipment ต่อ DB ใน `/master-data` (modal create/edit/delete + import file, English-first validation+errors; Excel skip 2 rows); อัปเดต [`parity-pending/02-master-data.md`](parity-pending/02-master-data.md) |
| 2026-05-18 | — | **`M_functional.php` (+ `_form` / `_imports`)** — ปิด parity: ใช้ migration `005_tbwkzb_tbfunctional.sql`, CRUD/import API `.../master-data/functional`, แท็บ Functional loc. ต่อ DB ใน `/master-data` (modal create/edit/delete + import file, English-first validation+errors; Excel skip 2 rows); อัปเดต [`parity-pending/02-master-data.md`](parity-pending/02-master-data.md) |
| 2026-05-18 | — | **`M_reason.php` (+ `_form`)** — ปิด parity: ใช้ migration `009_tbreason.sql`, CRUD API `.../master-data/reason`, แท็บ Reason ต่อ DB ใน `/master-data` (modal create/edit/delete, English-first validation+errors); อัปเดต [`parity-pending/02-master-data.md`](parity-pending/02-master-data.md) |
| 2026-05-18 | — | **`M_workstatus.php` (+ `_form`)** — ปิด parity: migration `013_tbwkstatus_add_wkstreason.sql` เพิ่ม `wkstreason`, CRUD API `.../master-data/workstatus`, แท็บ Work status ต่อ DB ใน `/master-data` (modal create/edit/delete, English-first validation+errors); อัปเดต [`parity-pending/02-master-data.md`](parity-pending/02-master-data.md) |
| 2026-05-18 | — | **`M_worktype.php` (+ `_form`)** — ปิด parity: migration `014_tbwkctrtype.sql`, CRUD API `.../master-data/worktype`, แท็บ Work type ต่อ DB ใน `/master-data` (modal create/edit/delete, English-first validation+errors); อัปเดต [`parity-pending/02-master-data.md`](parity-pending/02-master-data.md) |
| 2026-05-18 | — | **`M_lineproduct.php` (+ `_form` / `_imports`)** — ปิด parity: migration `015_tbproductline.sql`, CRUD/import API `.../master-data/lineproduct`, แท็บ Line product ต่อ DB ใน `/master-data` (modal create/edit/delete + import file; Excel skip 2 rows); อัปเดต [`parity-pending/02-master-data.md`](parity-pending/02-master-data.md) |
| 2026-05-18 | — | **`M_zone.php` (+ `_form`)** — ปิด parity: migration `016_tbzone.sql`, CRUD API `.../master-data/zone`, แท็บ Zone ต่อ DB ใน `/master-data`; อัปเดต [`parity-pending/02-master-data.md`](parity-pending/02-master-data.md) |
| 2026-05-18 | — | **`M_machine.php` (+ `_form` / `_imports`)** — ปิด parity: migration `017_tbmainteanance.sql` + dependency `tbzone`/`tbwkctrtype`, CRUD/import API `.../master-data/machine`, แท็บ Machine ต่อ DB ใน `/master-data` (modal create/edit/delete + import file; Excel skip 2 rows); อัปเดต [`parity-pending/02-master-data.md`](parity-pending/02-master-data.md) |
| 2026-05-18 | — | **`M_material.php` (+ `_form` / `_imports`)** — ปิด parity: migration `018_tbmaterial.sql`, CRUD/import API `.../master-data/material`, แท็บ Material ต่อ DB ใน `/master-data` (modal create/edit/delete + import file; Excel skip 2 rows; เก็บ date ใน PG); อัปเดต [`parity-pending/02-master-data.md`](parity-pending/02-master-data.md) |
| 2026-05-18 | — | **Line calendar docs** — อัปเดตแมปข้อ 2 ให้ตรงสถานะจริง (มี FullCalendar/modal/DnD แล้ว) และระบุ dependency `023_tblineschdul_unique.sql` สำหรับ upsert/import |
| 2026-05-18 | — | **PG view_lineschdul** — เพิ่ม migration `027_view_lineschdul.sql` สร้าง `app.view_lineschdul` เพื่อ parity กับ legacy `SELECT * FROM view_lineschdul` |
| 2026-05-18 | — | **Work calendar** — ปิด parity `calendar.php` (ฟิลเตอร์ `M_filter_iw37` บน React) ด้วย `GET /calendar/filter-options` + `POST /calendar/events`; อัปเดต [`parity-pending/04-work-calendar.md`](parity-pending/04-work-calendar.md) |
| 2026-05-18 | — | **calendar_wkctr route** — เพิ่ม route `/calendar/wc/:code` และรองรับ query `/calendar?wkctr=` เพื่อ prefill ตัวกรอง `wkctr` (ยังไม่ต่อ `view_confrim`) |
| 2026-05-18 | — | **PG view_confrim** — เพิ่ม migration `028_view_confrim.sql` สร้าง `app.view_confrim` และให้ calendar ใช้ view นี้เมื่อกรอง `wkctr` |
