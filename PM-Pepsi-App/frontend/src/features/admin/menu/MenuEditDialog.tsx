import type { AdminMenuRow, CreateAdminMenuBody } from '@/api/schemas'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createAdminMenuItem, updateAdminMenuItem } from '@/lib/admin-menu-api'
import { useMutation } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import {
  MENU_ROLE_BITS,
  formatMenuright,
  menuSelectClass,
  parseMenuright,
} from './menu-form-utils'

export type MenuEditDialogProps = {
  open: boolean
  onOpenChange: (v: boolean) => void
  initial: AdminMenuRow | null
  onSaved: () => void
}

export function MenuEditDialog({ open, onOpenChange, initial, onSaved }: MenuEditDialogProps) {
  const isEdit = Boolean(initial)
  const [menuKind, setMenuKind] = useState<'heading' | 'item'>('item')
  const [menutitle, setMenutitle] = useState('')
  const [menurightBits, setMenurightBits] = useState<Set<string>>(() => new Set(['A']))
  const [menuicon, setMenuicon] = useState('')
  const [menulink, setMenulink] = useState('')
  const [reactRoute, setReactRoute] = useState('')
  const [menuname, setMenuname] = useState('')
  const [idmenusub, setIdmenusub] = useState('0')
  const [endExact, setEndExact] = useState(false)

  useEffect(() => {
    if (!open) return
    if (initial) {
      setMenuKind(initial.menuKind)
      setMenutitle(initial.menutitle)
      setMenurightBits(parseMenuright(initial.menuright))
      setMenuicon(initial.menuicon ?? '')
      setMenulink(initial.menulink ?? '')
      setReactRoute(initial.reactRoute ?? '')
      setMenuname(initial.menuname ?? '')
      setIdmenusub(initial.idmenusub)
      setEndExact(initial.endExact)
    } else {
      setMenuKind('item')
      setMenutitle('')
      setMenurightBits(new Set(['A']))
      setMenuicon('fa-circle')
      setMenulink('')
      setReactRoute('')
      setMenuname('')
      setIdmenusub('0')
      setEndExact(false)
    }
  }, [open, initial])

  const saveMut = useMutation({
    mutationFn: async () => {
      const body: CreateAdminMenuBody = {
        menuKind,
        menutitle: menutitle.trim(),
        menuright: formatMenuright(menurightBits),
        menuicon: menuicon.trim() || null,
        menulink: menulink.trim() || null,
        reactRoute: reactRoute.trim() || null,
        menuname: menuname.trim() || null,
        idmenusub: idmenusub.trim() || '0',
        endExact,
      }
      if (isEdit && initial) {
        return updateAdminMenuItem(initial.idmenu, body)
      }
      return createAdminMenuItem(body)
    },
    onSuccess: () => {
      toast.success(isEdit ? 'บันทึกเมนูแล้ว' : 'เพิ่มเมนูแล้ว')
      onOpenChange(false)
      onSaved()
    },
    onError: (e: Error) => toast.error(e.message || 'บันทึกไม่สำเร็จ'),
  })

  const toggleRole = (r: string) => {
    setMenurightBits((prev) => {
      const next = new Set(prev)
      if (next.has(r)) next.delete(r)
      else next.add(r)
      if (next.size === 0) next.add('A')
      return next
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'แก้ไขเมนู' : 'เพิ่มเมนู'}</DialogTitle>
          <DialogDescription>บันทึกลง app.tbmenu — ลำดับจัดด้วย drag ในตาราง</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>ประเภท</Label>
            <select
              className={menuSelectClass}
              value={menuKind}
              onChange={(e) => setMenuKind(e.target.value as 'heading' | 'item')}
            >
              <option value="heading">หัวข้อกลุ่ม (heading)</option>
              <option value="item">รายการเมนู (item)</option>
            </select>
          </div>
          <div>
            <Label htmlFor="menutitle">ชื่อแสดง</Label>
            <Input id="menutitle" value={menutitle} onChange={(e) => setMenutitle(e.target.value)} />
          </div>
          <div>
            <Label>สิทธิ์ (menuright)</Label>
            <div className="mt-1 flex flex-wrap gap-2">
              {MENU_ROLE_BITS.map((r) => (
                <Button
                  key={r}
                  type="button"
                  size="sm"
                  variant={menurightBits.has(r) ? 'default' : 'outline'}
                  onClick={() => toggleRole(r)}
                >
                  {r}
                </Button>
              ))}
            </div>
          </div>
          {menuKind === 'item' ? (
            <>
              <div>
                <Label htmlFor="reactRoute">React route</Label>
                <Input
                  id="reactRoute"
                  value={reactRoute}
                  onChange={(e) => setReactRoute(e.target.value)}
                  placeholder="/planning"
                />
              </div>
              <div>
                <Label htmlFor="menulink">Legacy menulink (PHP)</Label>
                <Input
                  id="menulink"
                  value={menulink}
                  onChange={(e) => setMenulink(e.target.value)}
                  placeholder="index2.php?module=..."
                />
              </div>
              <div>
                <Label htmlFor="menuicon">ไอคอน (fa-* หรือ lucide hint)</Label>
                <Input id="menuicon" value={menuicon} onChange={(e) => setMenuicon(e.target.value)} />
              </div>
              <label className="flex items-center gap-2 text-body-sm">
                <input
                  type="checkbox"
                  checked={endExact}
                  onChange={(e) => setEndExact(e.target.checked)}
                />
                end_exact (active เฉพาะ path ตรง)
              </label>
            </>
          ) : null}
          <div>
            <Label htmlFor="idmenusub">idmenusub (parent)</Label>
            <Input id="idmenusub" value={idmenusub} onChange={(e) => setIdmenusub(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="menuname">menuname (optional)</Label>
            <Input id="menuname" value={menuname} onChange={(e) => setMenuname(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            ยกเลิก
          </Button>
          <Button
            type="button"
            disabled={!menutitle.trim() || saveMut.isPending}
            onClick={() => saveMut.mutate()}
          >
            {saveMut.isPending ? <Loader2 className="size-4 animate-spin" /> : 'บันทึก'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
