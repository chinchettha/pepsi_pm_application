# สรุปความครบถ้วน — ลำดับพัฒนา PM Pepsi

อัปเดต: **2026-05-19** · ซิงค์กับ [`PHP-REACT-PARITY-CHECKLIST.md`](../PHP-REACT-PARITY-CHECKLIST.md)

| ลำดับ | โมดูล | สถานะรวม | แกน API+DB | Parity PHP เต็ม | Stack เต็ม ([skills.md](../../skills.md)) | เอกสาร |
|------|--------|-----------|------------|-----------------|---------------------------------------------|--------|
| — | Cross-cutting | กำลังทำ | migration+seed+docs | ไม่ | **ยังไม่มี** | [`00-cross-cutting.md`](00-cross-cutting.md) — §DB เสร็จ |
| — | Stack target (อ้างอิง) | — | — | — | **ยังไม่มีโมดูลใด** | [`00-stack-target.md`](00-stack-target.md) |
| **1** | **Auth** | **เสร็จ (แกน)** | **ใช่** | บางส่วน | **ยังไม่มี** | [`01-auth.md`](01-auth.md) |
| 2 | Master data | กำลังทำ | activitytype | ไม่ | **ยังไม่มี** | [`02-master-data.md`](02-master-data.md) |
| 3 | Line calendar | กำลังทำ | events | ไม่ | **ยังไม่มี** | [`03-line-calendar.md`](03-line-calendar.md) |
| 4 | Work calendar | กำลังทำ | events | ไม่ | **ยังไม่มี** | [`04-work-calendar.md`](04-work-calendar.md) |
| 5 | Backlog | กำลังทำ | filter+events | ไม่ | **ยังไม่มี** | [`05-backlog.md`](05-backlog.md) |
| 6 | Work orders | กำลังทำ | list+detail | ไม่ | **ยังไม่มี** | [`06-work-orders-master-filters.md`](06-work-orders-master-filters.md) |
| 7 | IW37N | กำลังทำ | import+batches | ไม่ | **ยังไม่มี** | [`07-iw37n.md`](07-iw37n.md) |
| **8** | **Dashboard/Planning** | **เสร็จ (แกน)** — 2026-05-19 | **ใช่** — summary + list (open/closed) + assign + close + WO detail link | **บางส่วน** — `M_planwork_view` / `M_planwork_view_form` / `M_planwork_close*` / `W_planwork_view*` + `plan_confirmTab*` รวมใน `WorkOrderDetailDialog` | **ยังไม่มี** (FullCalendar DnD ใน Planning, charts KPI Dashboard, IndexedDB offline, Docker ส่งมอบ) | [`08-dashboard-planning.md`](08-dashboard-planning.md) |
| **9** | **Confirmation** | **เสร็จ (แกน + UX preview)** — 2026-05-19 | **ใช่** — search/autocomplete WO + close ช่าง + Import + Export (preview `/confirmation/export` + download) + images + planning | **เกือบครบ** — `M_confirmation.php`, `M_Confirm*`, `M_Export_confirm*` (preview page เทียบ PHP), `confirmTab1/2/3/4` ครบแกน; ขาด filter UI / pagination ใน preview | **ยังไม่มี** | [`09-confirmation.md`](09-confirmation.md) |
| 10 | Personnel | **เสร็จ (แกน + Multi-assign + Role-based + Explicit userrole + Lookup dropdown + Workstatus filter + Batch-assign UI + §3 Tests)** — 2026-05-19 | **ใช่** — `/personnel` = Personal Dashboard (4 role จาก explicit `tbworkcenter.userrole`: admin/manager/planner/technician); `/personnel/admin` = CRUD + Excel import + WebP image storage + dropdown 5 master + `userrole` dropdown + workstatus lookup `tbwkctrstatus` + filter `all/active/inactive/CODE`; `/personnel/confirm` = Admin progress bar %; multi-assign `tbplangingwork` (idiw37, wkctr) + `POST /api/v1/work-orders/:id/planning/batch` (จ่ายงานหลายคนคลิกเดียว) + component `PlanningMultiAssign` ใช้ร่วม WorkOrderDetailDialog + ConfirmationParityPage | **ครบ** — `M_personel*` + `_confirm*` + `AddPlan.php` (multi-assign + batch) + `personel_form_tab2` dropdown + `user.php` JOIN `tbwkctrstatus` + explicit role enum + tests; backend 3 files/10 tests + frontend 2 files/4 tests | **มี** — Vitest backend/frontend (`npm test`) ครอบคลุม CRUD schema, confirm/dashboard contract, multi-assign business rules + UI, role-based dashboard contract | [`10-personnel.md`](10-personnel.md) |
| 11 | Manhours/Worktime | **เสร็จ** — 2026-05-19 | **ใช่** | **ครบ** — `/worktime` 2 แท็บ, charts, admin | **มี** — Vitest backend 26+ / frontend 15+ | [`11-manhours-worktime.md`](11-manhours-worktime.md) |
| 12 | Reports/Summary | **เสร็จ (แกน + §3)** — 2026-05-19 | **ใช่** | **ครบแกน** — `/reports` KPI + `/summary-weekly` + filter `from`/`to` + fullscreen chart | **มี** — `reports-range.test.ts`, `ReportsDateFilter.test.tsx`, schema/chart tests | [`12-reports-summary.md`](12-reports-summary.md) |
| 13 | Deploy offline | ยังไม่ทำ | — | — | **ยังไม่มี** | [`13-deploy-offline.md`](13-deploy-offline.md) |
| **14** | **Administrator** | **ยังไม่ทำ (ออกแบบ scope แล้ว)** — 2026-05-19 | — (รอ Phase A: RBAC engine + migration tbl_role/tbl_permission/tbl_setting/tbl_audit_log) | — (ส่วนขยายใหม่นอก PHP เดิม — รวม Logo customize + Theme + Backup + Audit ตาม skills.md) | **เป้าหมาย stack เต็ม** — admin จะเป็นโมดูลแรกที่ผ่านเกณฑ์ skills.md §2–§4 หลัง Phase A–F | [`14-administrator.md`](14-administrator.md) |

**คำอธิบายสถานะ**

- **เสร็จ (แกน)** — login, RBAC, API หลัก, หน้า React ใช้งานได้กับ PostgreSQL; ยังไม่ครบทุก modal/FullCalendar ของ PHP — **ไม่เท่ากับ stack เต็มรูปแบบ** (ดู [`00-stack-target.md`](00-stack-target.md))
- **Stack เต็ม** — ครบตาม [`skills.md`](../../skills.md) §2–§4 สำหรับโมดูลนั้น (Shadcn ครบจุด, DnD/offline/charts/Docker ตามสัญญา) — **ตอนนี้ยังไม่มีโมดูลใด**
- **กำลังทำ** — มี migration + API บางส่วน
- **ยังไม่ทำ** — placeholder หรือยังไม่เริ่ม
