# สรุป CSS Design Tokens (`index.css`)

อัปเดต: 2026-05-22  
ไฟล์ต้นทาง: [`PM-Pepsi-App/frontend/src/index.css`](../../PM-Pepsi-App/frontend/src/index.css)  
อ้างอิง: [`skill-theme.md`](../../skill-theme.md) §12 · [`skills.md`](../../skills.md) (ขาว · ส้ม · ฟ้า · เขียว)

---

## แมปบรีฟลูกค้า → Token

| บรีฟลูกค้า (`skills.md`) | Token หลัก | Hex (ค่าเริ่มต้น) | ใช้ใน UI |
|--------------------------|------------|------------------|---------|
| **ขาว** | `--brand-pepsi-white`, `--app-surface`, `--admin-surface` | `#FFFFFF` | การ์ด, พื้นผิว, glass |
| **ฟ้า** | `--brand-pepsi-blue`, `--app-accent`, `--admin-primary` | `#004C97` | ลิงก์, ปุ่มรอง, Admin primary, KPI info |
| **ส้ม** | `--brand-pepsi-orange`, `--admin-warning` | `#FF9500` | คำเตือน, pending, KPI warning |
| **เขียว** | `--brand-pepsi-green`, `--admin-success` | `#34C759` | สำเร็จ, health OK, KPI success |
| **แดง (โลโก้)** | `--brand-pepsi-red`, `--app-primary`, `--admin-accent` | `#E31837` | ปุ่มหลักแอป, accent Admin, danger |

> **60/30/10 (Admin):** พื้น 60% = `--admin-bg` · ผิว 30% = `--admin-surface` / sidebar · เน้น 10% = `--admin-primary` / `--admin-accent`

---

## 1) `:root` — แบรนด์ + แอปทั่วไป

### `--brand-pepsi-*` (คงที่ · โลโก้)

| Variable | ค่า | หมายเหตุ |
|----------|-----|----------|
| `--brand-pepsi-red` | `#e31837` | แดงโลโก้ Pepsi |
| `--brand-pepsi-blue` | `#004c97` | น้ำเงิน corporate |
| `--brand-pepsi-white` | `#ffffff` | ขาว |
| `--brand-pepsi-orange` | `var(--sys-orange-light)` | ส้ม (บรีฟลูกค้า) |
| `--brand-pepsi-green` | `var(--sys-green-light)` | เขียว (บรีฟลูกค้า) |

### `--sys-*` (macOS semantic · ส้ม/เขียว/ฟ้า/แดง UI)

| Variable | Light | Dark |
|----------|-------|------|
| `--sys-orange-light` / `-dark` | `#ff9500` | `#ff9f0a` |
| `--sys-green-light` / `-dark` | `#34c759` | `#30d158` |
| `--sys-blue-light` / `-dark` | `#007aff` | `#0a84ff` |
| `--sys-red-light` / `-dark` | `#ff3b30` | `#ff453a` |

### `--app-*` (ทุกหน้า · override ได้จาก Admin Branding API)

| Variable | ค่าเริ่มต้น | บทบาท |
|----------|-------------|--------|
| `--app-primary` | → `--brand-pepsi-red` | ปุ่มหลัก, heading, sidebar hover tint |
| `--app-accent` | → `--brand-pepsi-blue` | ลิงก์, focus ring, เงาการ์ด |
| `--app-primary-rgb` | `227, 24, 55` | gradient / rgba |
| `--app-accent-rgb` | `0, 76, 151` | gradient / rgba |
| `--app-bg` | `#eef2f7` | พื้นหลังหน้า (`liquid-glass-bg`) |
| `--app-surface` | `#ffffff` | การ์ด `.app-card` |
| `--app-surface-muted` | `#f4f4f5` | พื้นรอง |
| `--app-text` | `#18181b` | ข้อความหลัก |
| `--app-text-muted` | `#71717a` | คำอธิบาย |
| `--app-border` | `#e4e4e7` | เส้นขอบ |
| `--app-heading-color` | → `--app-primary` | หัวข้อ |
| `--app-sidebar` | `#eaeaea` | พื้น sidebar (ไม่ใช่แผงน้ำเงินเต็ม) |
| `--app-sidebar-fg` | `#1f2937` | ข้อความเมนู |
| `--app-sidebar-fg-muted` | `#6b7280` | heading เมนูจาง |
| `--app-sidebar-border` | `#d4d4d8` | เส้นแบ่ง |
| `--app-sidebar-hover` | mix primary 10% | hover รายการ |
| `--app-sidebar-active` | mix primary 16% | active รายการ |
| `--app-glass-bg` | `rgba(255,255,255,0.7)` | glass panel |
| `--app-glass-border` | `rgba(255,255,255,0.18)` | ขอบ glass |

### Typography `--app-font-*` (ฟอนต์เดียวทั้งแอป)

| ระดับ | Variable | ค่าเริ่มต้น (comfortable 15px) | ใช้เมื่อ |
|-------|----------|--------------------------------|----------|
| Caption | `--app-font-size-caption` | `13px` | คำอธิบายใต้หัวข้อ, hint, `small` |
| Body | `--app-font-size-base` | `15px` | ข้อความหลัก, ตาราง, form |
| Body sm | `--app-font-size-sm` | `13px` | แท็บเมนู, eyebrow |
| Section (h3) | `--app-font-size-lg` | `17px` | หัวข้อย่อยในการ์ด |
| Section (h2) | `--app-font-size-xl` | `20px` | หัวข้อส่วน |
| Page (h1) | `--app-font-size-page-title` | `24px` | `PageHeader` / `AdminPageHeader` |
| Nav | `--app-nav-link-size` | `15px` | ลิงก์ sidebar |

| อื่น ๆ | Variable | ค่า |
|--------|----------|-----|
| ฟอนต์ | `--app-font-family` | `"Sarabun", "Segoe UI", system-ui` |
| บรรทัด | `--app-line-height-tight` / `body` / `relaxed` | `1.25` / `1.5` / `1.6` |
| สีหัวข้อ | `--app-heading-color` | `--app-primary` (หรือจาก branding) |

**Scale:** `deriveTypographyScale()` ใน `frontend/src/lib/typography-tokens.ts` — preset `compact` 14px · `comfortable` 15px · `large` 17px

**CSS utilities** (`index.css`): `.text-caption` · `.text-body` · `.text-body-sm` · `.text-heading-section` · `.text-heading-page` · `.text-eyebrow` · `.text-sidebar-muted` · `.text-code` · `.text-badge` — ภายใน `.app-page-content` ใช้ `h1`–`h4` อัตโนมัติตาม scale

**Migration:** แทน `text-[10–11px]` / Tailwind `text-sm` ด้วย utilities ข้างบน — สคริปต์ `frontend/scripts/migrate-typography.mjs` (รันซ้ำได้ถ้ามีไฟล์ใหม่)

**Override:** `applyTypographyToDocument()` จาก `GET /api/v1/settings/public` (Branding → Typography)

### Radius / shadow `--app-radius-*` · `--app-shadow-*`

| องค์ประกอบ | Variable | ค่า | Tailwind utility |
|------------|----------|-----|------------------|
| Card / table shell / KPI | `--app-radius-card` | `12px` | `rounded-card` · `.app-card` |
| Button / input / select | `--app-radius-button` | `8px` | `rounded-button` |
| Dialog | `--app-radius-dialog` | `16px` | `rounded-dialog` · `.macos-dialog-glass` |

| Shadow | Variable | ใช้กับ |
|--------|----------|--------|
| Card | `--app-shadow-card` | `.app-card`, `.app-table-shell`, `shadow-app-card` |
| Card hover | `--app-shadow-card-hover` | `.app-card:hover`, `.admin-card:hover` |
| Button | `--app-shadow-button` | `Button`, outline variant |
| Dialog | `--app-shadow-dialog` | `DialogContent`, `.macos-dialog-glass` |

**Migration:** `node scripts/migrate-radius.mjs` — แทน `rounded-xl/md/lg` ใน features (ไม่แตะ `ui/dialog.tsx`)

### Spacing `--app-space-*`

| Step | Variable | px | Tailwind (หลัง `@theme`) |
|------|----------|-----|---------------------------|
| 1 | `--app-space-1` | 4 | `1`, `0.5` |
| 2 | `--app-space-2` | 8 | `2`, `1.5` |
| 3 | `--app-space-3` | 12 | `3`, `2.5` |
| 4 | `--app-space-4` | 16 | `4`, `3.5`, `5` |
| 5 | `--app-space-5` | 24 | `6`, `7` |
| 6 | `--app-space-6` | 32 | `8`…`32` (สูงสุด) |

**Layout:** ใช้ `gap-*` / `.app-stack` / `.app-stack-tight` แทน `margin-top` สุ่ม · `.app-page-content` / `.admin-page-content` ใช้ token padding

**Migration:** `node scripts/migrate-spacing.mjs` · ค่าอ้างอิง [`spacing-scale.ts`](../../PM-Pepsi-App/frontend/src/lib/spacing-scale.ts)

### Card padding `--app-card-padding*`

| โหมด | Variable | px | ใช้เมื่อ |
|------|----------|-----|----------|
| default | `--app-card-padding` | 24 (`--app-space-5`) | `AppCard` / `AdminCard` + `CardHeader` / `CardContent` |
| compact | `--app-card-padding-compact` | 16 (`--app-space-4`) | แถบฟิลเตอร์ · KPI แถว · `app-card-pad-compact` |
| gap หัวข้อ | `--app-card-inner-gap` | 8 | ระหว่าง title / description ใน header |

**Component:** [`AppCard.tsx`](../../PM-Pepsi-App/frontend/src/components/layout/AppCard.tsx) · [`AdminCard.tsx`](../../PM-Pepsi-App/frontend/src/components/admin/AdminCard.tsx) — prop `pad="default" | "compact" | "none"`

**CSS:** `.app-card-pad` · `.app-card-pad-compact` · Admin compact density ลด `--app-card-padding` ทั้งหน้า

**Migration:** `node scripts/normalize-app-card-padding.mjs` — แทน `app-card p-4` / `p-6` แบบ hard-code

---

## 2) `--sb-menu-*` (Sidebar macOS)

กำหนดบน `.macos-sidebar` — **ไม่** อยู่ใน `:root` โดยตรง

### แอปหลัก (default `.macos-sidebar`)

| Variable | ชี้ไปที่ |
|----------|----------|
| `--sb-menu-text` | `--app-sidebar-fg` |
| `--sb-menu-muted` | `--app-sidebar-fg-muted` |
| `--sb-menu-accent` | `--app-primary` (แดง) |
| `--sb-menu-highlight` | `--app-accent` (ฟ้า) |
| `--sb-menu-active-surface` | `--app-sidebar` |

### Admin (`.macos-admin .macos-sidebar`)

| Variable | ชี้ไปที่ |
|----------|----------|
| `--sb-menu-text` | `--admin-text` |
| `--sb-menu-muted` | mix admin-text 65% |
| `--sb-menu-accent` | `--admin-primary` (ฟ้า) |
| `--sb-menu-highlight` | `--admin-accent` (แดง) |
| `--sb-menu-active-surface` | `--admin-surface` |

**CSS ที่ใช้:** `.macos-sidebar nav a` — hover/active ใช้ `--sb-menu-accent` · แถบซ้าย active ใช้ `--sb-menu-highlight`

---

## 3) `.macos-admin` — `--admin-*` + `--pepsi-*`

| Variable | Light | บทบาท |
|----------|-------|--------|
| `--admin-primary` | Pepsi blue | ปุ่มหลัก Admin, ลิงก์, KPI info |
| `--admin-accent` | Pepsi red | ไฮไลต์, stripe |
| `--admin-success` | `--pepsi-green` | `data-tone="success"` |
| `--admin-warning` | `--pepsi-orange` | `data-tone="warning"` |
| `--admin-danger` | `--sys-red-light` | `data-tone="danger"` |
| `--admin-info` | `--sys-blue-light` | `data-tone="info"` |
| `--admin-bg` | `#eef2f7` | พื้นหลัง Admin |
| `--admin-surface` | `#ffffff` | การ์ด `.admin-card` |
| `--admin-surface-muted` | `#f8fafc` | zebra / muted |
| `--admin-border` | `#dce3ed` | ขอบ |
| `--admin-text` | `#1e293b` | ข้อความ |
| `--admin-text-muted` | `#64748b` | รอง |
| `--admin-shadow` | multi-layer | การ์ด + layout glass |

**Dark:** `html.dark .macos-admin` — `--admin-bg: #0f172a`, surface `#1c1c1e`, ข้อความขาว 92%

---

## 4) คลาสที่ consume token (ไม่ต้องจำ hex ใน TSX)

| Class | Token หลัก |
|-------|------------|
| `.liquid-glass-bg` | `--app-bg` + radial `--app-accent` / `--app-primary` |
| `.app-card` | `--app-surface`, `--app-border`, shadow accent |
| `.app-table-shell` | เหมือนการ์ด ไม่ hover lift |
| `.app-page-header` | `--app-surface`, `--app-border` |
| `.app-page-content` | padding `--app-space-4/5/6` |
| `.app-stack` / `.app-stack-tight` / `.app-stack-loose` | vertical gap 16 / 8 / 24px |
| `.app-tone-info` / `.app-tone-info-row` / `.app-badge-accent` | พื้นหลัง/แถบ info — Pepsi blue (แทน `violet-*`) |
| `.text-app` / `.text-app-muted` / `.border-app` / `.bg-app-muted` / `.bg-app-subtle` | แทน `text-zinc-*`, `border-zinc-*`, `bg-zinc-50/100` |
| `.ring-app` / `.focus-app-ring` | แทน `ring-zinc-*`, focus ring |
| `.macos-admin .text-app` ฯลฯ | map เป็น `--admin-*` ใน Admin |
| `.admin-card` | `--admin-surface`, `--admin-shadow` |
| `.admin-kpi-card[data-tone]` | `--admin-success/warning/danger/info` |
| `.macos-sidebar` | `--sb-menu-*` |
| `.macos-topbar` | `--app-surface`, `--app-border` |
| `.dashboard-kpi--pepsi-blue` | `--brand-pepsi-blue` |

---

## 5) กฎสำหรับนักพัฒนา

1. **ห้าม** hard-code `#004c97` ใน component — ใช้ `var(--brand-pepsi-blue)` หรือ Tailwind ที่ map จาก theme  
2. หน้า **ใหม่** ใช้ `PageHeader` + `app-page-content` + `app-card`  
3. หน้า **`/admin/*`** ใช้ `AdminPageHeader` + `admin-card` + `admin-page-content`  
4. สถานะ: `data-tone="success|warning|danger|info"` บน KPI / badge  
5. สีจากลูกค้า: ปรับที่ **Admin → Branding** → `apply-theme.ts` เขียน `--app-primary`, `--app-accent`, `--app-bg`

---

## 6) ตรวจค่าบนเบราว์เซอร์

```js
// DevTools Console
getComputedStyle(document.documentElement).getPropertyValue('--brand-pepsi-blue').trim()
getComputedStyle(document.querySelector('.macos-sidebar')).getPropertyValue('--sb-menu-accent').trim()
```

---

## 7) Checklist U0 (`UI-POLISH-PHASES.md`)

- [x] สรุป token ในไฟล์นี้ + [`skill-theme.md`](../../skill-theme.md) §12  
- [x] สีหลัก: ขาว · ฟ้า `#004c97` · แดง `#e31837` · ส้ม/เขียว ผ่าน `--sys-*` / `--admin-*`  
- [x] Radius/shadow scale — `--app-radius-card|button|dialog` + `--app-shadow-*` · `rounded-card|button|dialog`
- [x] Spacing scale `4/8/12/16/24/32` — `@theme` spacing · `.app-stack*` · `migrate-spacing.mjs`
