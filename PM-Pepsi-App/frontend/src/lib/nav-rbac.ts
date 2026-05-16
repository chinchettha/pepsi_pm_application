import { appNav, type NavEntry, type NavLinkEntry } from '@/components/layout/nav-config'

/** เทียบ `$_SESSION['UserST']` และ `menuright` แบบ `A:U:W` ใน `left_menu.php` */
export type UserSt = 'A' | 'U' | 'W'

export function parseUserSt(value: string | undefined): UserSt | null {
  if (value === 'A' || value === 'U' || value === 'W') return value
  return null
}

/** เทียบ backend `canAccessMenuright` — รองรับ userst จาก DB โดยตรง (ไม่บังคับ parse แค่ A|U|W) */
export function canAccessByMenuright(userst: string, menuright: string): boolean {
  const role = userst.trim()
  if (!role) return false
  const allowed = menuright.split(':').map((s) => s.trim()).filter(Boolean)
  return allowed.includes(role)
}

/** กรองเมนู sidebar — ซ่อน heading ที่ไม่มี item ใต้กลุ่มที่มองเห็น */
export function filterNavForUser(userst: string, entries: NavEntry[] = appNav): NavEntry[] {
  const out: NavEntry[] = []
  let i = 0
  while (i < entries.length) {
    const entry = entries[i]
    if (entry.kind === 'heading') {
      const block: NavEntry[] = []
      let j = i + 1
      while (j < entries.length && entries[j].kind !== 'heading') {
        const item = entries[j] as NavLinkEntry
        if (canAccessByMenuright(userst, item.menuright)) block.push(item)
        j++
      }
      if (block.length > 0) {
        out.push(entry)
        out.push(...block)
      }
      i = j
      continue
    }
    i++
  }
  return out
}
