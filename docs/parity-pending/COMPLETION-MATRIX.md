# สรุปความครบถ้วน — ลำดับพัฒนา PM Pepsi

อัปเดต: **2026-05-16** · ซิงค์กับ [`PHP-REACT-PARITY-CHECKLIST.md`](../PHP-REACT-PARITY-CHECKLIST.md)

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
| 8 | Dashboard/Planning | กำลังทำ | summary+list | ไม่ | **ยังไม่มี** | [`08-dashboard-planning.md`](08-dashboard-planning.md) |
| 9 | Confirmation | ยังไม่ทำ | ไม่ | ไม่ | **ยังไม่มี** | [`09-confirmation.md`](09-confirmation.md) |
| 10 | Personnel | ยังไม่ทำ | ไม่ | ไม่ | **ยังไม่มี** | [`10-personnel.md`](10-personnel.md) |
| 11 | Manhours/Worktime | ยังไม่ทำ | ไม่ | ไม่ | **ยังไม่มี** | [`11-manhours-worktime.md`](11-manhours-worktime.md) |
| 12 | Reports/Summary | ยังไม่ทำ | ไม่ | ไม่ | **ยังไม่มี** | [`12-reports-summary.md`](12-reports-summary.md) |
| 13 | Deploy offline | ยังไม่ทำ | — | — | **ยังไม่มี** | [`13-deploy-offline.md`](13-deploy-offline.md) |

**คำอธิบายสถานะ**

- **เสร็จ (แกน)** — login, RBAC, API หลัก, หน้า React ใช้งานได้กับ PostgreSQL; ยังไม่ครบทุก modal/FullCalendar ของ PHP — **ไม่เท่ากับ stack เต็มรูปแบบ** (ดู [`00-stack-target.md`](00-stack-target.md))
- **Stack เต็ม** — ครบตาม [`skills.md`](../../skills.md) §2–§4 สำหรับโมดูลนั้น (Shadcn ครบจุด, DnD/offline/charts/Docker ตามสัญญา) — **ตอนนี้ยังไม่มีโมดูลใด**
- **กำลังทำ** — มี migration + API บางส่วน
- **ยังไม่ทำ** — placeholder หรือยังไม่เริ่ม
