/** SAP IW37N export columns — same order/labels as customer ZB02All template. */
export type Iw37nColumnGroup = 'export'

export type Iw37nColumnLayout = {
  id: string
  labelKey: string
  group: Iw37nColumnGroup
  sticky?: 1 | 2
  align?: 'left' | 'center'
  valign?: 'top' | 'middle'
  widthClass: string
}

/** Column order matches `Templete IW37N on PM App - ZB02All*.xlsx` */
export const IW37N_ITEM_COLUMNS: Iw37nColumnLayout[] = [
  { id: 'mntPlan', labelKey: 'mntPlan', group: 'export', sticky: 1, widthClass: 'min-w-[8.5rem] max-w-[9.5rem]', align: 'left', valign: 'middle' },
  { id: 'order', labelKey: 'order', group: 'export', sticky: 2, widthClass: 'min-w-[6.25rem] max-w-[7rem]', align: 'left', valign: 'middle' },
  { id: 'type', labelKey: 'type', group: 'export', widthClass: 'min-w-[3.75rem] max-w-[4.5rem]', align: 'center', valign: 'middle' },
  { id: 'mat', labelKey: 'mat', group: 'export', widthClass: 'min-w-[3rem] max-w-[3.75rem]', align: 'center', valign: 'middle' },
  { id: 'bscStart', labelKey: 'bscStart', group: 'export', widthClass: 'min-w-[5.25rem] max-w-[5.75rem]', align: 'center', valign: 'middle' },
  { id: 'actFinish', labelKey: 'actFinish', group: 'export', widthClass: 'min-w-[5.25rem] max-w-[5.75rem]', align: 'center', valign: 'middle' },
  { id: 'systemStatus', labelKey: 'systemStatus', group: 'export', widthClass: 'min-w-[9rem] max-w-[11rem]', align: 'left', valign: 'middle' },
  { id: 'opAc', labelKey: 'opAc', group: 'export', widthClass: 'min-w-[2.75rem] max-w-[3.25rem]', align: 'center', valign: 'middle' },
  { id: 'operationShort', labelKey: 'operationShort', group: 'export', widthClass: 'min-w-[9.5rem] max-w-xs', align: 'left', valign: 'top' },
  { id: 'description', labelKey: 'description', group: 'export', widthClass: 'min-w-[11rem] max-w-sm', align: 'left', valign: 'top' },
  { id: 'cknow', labelKey: 'cknow', group: 'export', widthClass: 'min-w-[2rem] max-w-[2.5rem]', align: 'center', valign: 'middle' },
  { id: 'wkctr', labelKey: 'wkctr', group: 'export', widthClass: 'min-w-[4.75rem] max-w-[6rem]', align: 'left', valign: 'middle' },
  { id: 'work', labelKey: 'work', group: 'export', widthClass: 'min-w-[3rem] max-w-[3.75rem]', align: 'center', valign: 'middle' },
  { id: 'actWork', labelKey: 'actWork', group: 'export', widthClass: 'min-w-[3rem] max-w-[3.75rem]', align: 'center', valign: 'middle' },
  { id: 'unit', labelKey: 'unit', group: 'export', widthClass: 'min-w-[2.5rem] max-w-[3rem]', align: 'center', valign: 'middle' },
  { id: 'equipment', labelKey: 'equipment', group: 'export', widthClass: 'min-w-[5.25rem] max-w-[6.5rem]', align: 'left', valign: 'middle' },
  { id: 'equDescrip', labelKey: 'equDescrip', group: 'export', widthClass: 'min-w-[8.5rem] max-w-xs', align: 'left', valign: 'top' },
  { id: 'functionalLoc', labelKey: 'functionalLoc', group: 'export', widthClass: 'min-w-[6.25rem] max-w-[7.5rem]', align: 'left', valign: 'middle' },
  { id: 'funcLocDesc', labelKey: 'funcLocDesc', group: 'export', widthClass: 'min-w-[9.5rem] max-w-xs', align: 'left', valign: 'top' },
]

export function iw37nHeaderClass(col: Iw37nColumnLayout, extra?: string): string {
  const parts = [
    col.widthClass,
    col.align === 'center' ? 'text-center' : 'text-left',
    extra ?? '',
  ]
  return parts.filter(Boolean).join(' ')
}

export function iw37nCellClass(col: Iw37nColumnLayout, extra?: string): string {
  const parts = [
    col.widthClass,
    col.align === 'center' ? 'text-center' : 'text-left',
    col.valign === 'top' ? 'align-top' : 'align-middle',
    extra ?? '',
  ]
  return parts.filter(Boolean).join(' ')
}
