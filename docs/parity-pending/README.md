# งานค้าง / สถุบันตามลำดับพัฒนา (1–14)

เอกสารชุดนี้แยกรายการออกจาก [`PHP-REACT-PARITY-CHECKLIST.md`](../PHP-REACT-PARITY-CHECKLIST.md) — **อัปเดตคู่กันทุกครั้ง** ที่ปิดงาน

**ภาพรวม:** [`COMPLETION-MATRIX.md`](COMPLETION-MATRIX.md)

> **Stack เต็มรูปแบบ ([`skills.md`](../../skills.md)):** ตอนนี้ **ยังไม่มี** — งานที่ปิดแล้วเป็นระดับ **แกน (API + PostgreSQL + React พื้นฐาน)** ไม่ใช่ครบ Shadcn/DnD/offline/Docker/CI ตามสัญญา stack  
> รายละเอียดและตารางเทียบ component: **[`00-stack-target.md`](00-stack-target.md)**

---

## ไฟล์ทั้งหมด

| ลำดับ | ไฟล์ | สถานะรวม | Stack เต็ม (skills.md) |
|------|------|-----------|-------------------------|
| — | [`00-cross-cutting.md`](00-cross-cutting.md) | กำลังทำ | ยังไม่มี |
| — | [`00-stack-target.md`](00-stack-target.md) | อ้างอิงเป้า stack | — |
| **1** | [**`01-auth.md`**](01-auth.md) | **เสร็จ (แกน)** | ยังไม่มี |
| 2 | [`02-master-data.md`](02-master-data.md) | กำลังทำ | ยังไม่มี |
| 3 | [`03-line-calendar.md`](03-line-calendar.md) | กำลังทำ | ยังไม่มี |
| 4 | [`04-work-calendar.md`](04-work-calendar.md) | กำลังทำ | ยังไม่มี |
| 5 | [`05-backlog.md`](05-backlog.md) | กำลังทำ | ยังไม่มี |
| 6 | [`06-work-orders-master-filters.md`](06-work-orders-master-filters.md) | กำลังทำ | ยังไม่มี |
| 7 | [`07-iw37n.md`](07-iw37n.md) | กำลังทำ | ยังไม่มี |
| 8 | [`08-dashboard-planning.md`](08-dashboard-planning.md) | กำลังทำ | ยังไม่มี |
| 9 | [`09-confirmation.md`](09-confirmation.md) | ยังไม่ทำ | ยังไม่มี |
| 10 | [`10-personnel.md`](10-personnel.md) | ยังไม่ทำ | ยังไม่มี |
| 11 | [`11-manhours-worktime.md`](11-manhours-worktime.md) | ยังไม่ทำ | ยังไม่มี |
| 12 | [`12-reports-summary.md`](12-reports-summary.md) | ยังไม่ทำ | ยังไม่มี |
| 13 | [`13-deploy-offline.md`](13-deploy-offline.md) | ยังไม่ทำ | ยังไม่มี |
| **14** | [**`14-administrator.md`**](14-administrator.md) | ยังไม่ทำ (ออกแบบ scope แล้ว) | **เป้าหมาย stack เต็ม** — admin จะเป็นโมดูลแรกที่ผ่านเกณฑ์ skills.md §2–§4 หลัง Phase A–F |

---

## วิธีซิงค์

1. ติ๊ก `[x]` ในไฟล์ลำดับนั้น
2. แก้สถานะแถว PHP ใน checklist หลัก §4/§5
3. อัปเดต [`COMPLETION-MATRIX.md`](COMPLETION-MATRIX.md) และ §7 ใน checklist หลัก
4. เมื่อโมดูลครบ §3 → เปลี่ยนสถานะรวมเป็น **เสร็จ** หรือ **เสร็จ (แกน)**
5. **Stack เต็มรูปแบบ** — อัปเดต [`00-stack-target.md`](00-stack-target.md) และคอลัมน์ Stack ใน matrix **เฉพาะเมื่อ** ครบเกณฑ์ [`skills.md`](../../skills.md) §2–§4 (ไม่ใช่แค่มี API+DB)

---

## Migration & seed (Auth)

| ขั้น | ไฟล์ |
|------|------|
| Schema | `001`, `008` |
| Seed dev | [`database/seeds/009_dev_auth_seed.sql`](../../database/seeds/009_dev_auth_seed.sql) |
| Import MySQL | [`database/scripts/import-auth-from-mysql.ps1`](../../database/scripts/import-auth-from-mysql.ps1) → `seeds/generated/*.sql` |

ลำดับรวม: `001` → `002` → … → `008` ใน schema **`app`**
