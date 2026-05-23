import { WKTYPE_MAPPING_SOURCE, WKTYPE_ZD_ZB_ROWS } from '@/lib/wktype-zd-mapping'

/** หมายเหตุใต้ตัวกรอง Type — นิยาม ZD จากประชุมลูกค้า · กรองด้วย ZB ใน IW37N */
export function WktypeZdMappingNote() {
  return (
    <details className="mt-1 rounded-button border border-sky-200/80 bg-sky-50/60 px-2 py-2 text-xs text-sky-950">
      <summary className="cursor-pointer font-medium">
        ประเภทงาน SAP (ZD) ตามประชุมลูกค้า — ในไฟล์ IW37N ใช้รหัส ZB
      </summary>
      <p className="mt-1 text-sky-800/90">{WKTYPE_MAPPING_SOURCE}</p>
      <ul className="mt-2 space-y-1 pl-1">
        {WKTYPE_ZD_ZB_ROWS.map((r) => (
          <li key={r.zb}>
            <span className="font-mono text-sky-900">{r.zd}</span> {r.zdLabelTh}
            <span className="text-sky-700/90">
              {' '}
              ← กรอง <span className="font-mono">{r.zb}</span> ({r.iw37nLabel})
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-sky-800/90">
        เอกสาร: <code className="rounded bg-sky-100/80 px-1">docs/customer-requirements/WKTYPE-ZD-ZB-MAPPING.md</code>
      </p>
    </details>
  )
}
