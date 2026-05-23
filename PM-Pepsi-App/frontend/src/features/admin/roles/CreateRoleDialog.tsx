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
import { createAdminRole } from '@/lib/admin-roles-api'
import { useMutation } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

export function CreateRoleDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  onCreated: () => void
}) {
  const [roleCode, setRoleCode] = useState('')
  const [roleName, setRoleName] = useState('')
  const [roleColor, setRoleColor] = useState('#0A84FF')
  const [description, setDescription] = useState('')

  const createMut = useMutation({
    mutationFn: () =>
      createAdminRole({
        roleCode: roleCode.trim().toUpperCase(),
        roleName: roleName.trim(),
        roleColor,
        description: description.trim() || null,
      }),
    onSuccess: () => {
      toast.success('สร้าง role แล้ว')
      setRoleCode('')
      setRoleName('')
      setDescription('')
      onOpenChange(false)
      onCreated()
    },
    onError: (e: Error) => {
      toast.error(e.message || 'สร้าง role ไม่สำเร็จ')
    },
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>สร้าง role ใหม่</DialogTitle>
          <DialogDescription>
            รหัส role ต้องตรงกับค่า userst ใน tbworkcenter (เช่น OPS, QA_LEAD)
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label htmlFor="roleCode">รหัส (role_code)</Label>
            <Input
              id="roleCode"
              value={roleCode}
              onChange={(e) => setRoleCode(e.target.value.toUpperCase())}
              placeholder="OPS"
              maxLength={16}
            />
          </div>
          <div>
            <Label htmlFor="roleName">ชื่อแสดง</Label>
            <Input id="roleName" value={roleName} onChange={(e) => setRoleName(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="roleColor">สี</Label>
            <div className="flex gap-2">
              <Input
                id="roleColor"
                type="color"
                value={roleColor}
                onChange={(e) => setRoleColor(e.target.value)}
                className="h-10 w-14 p-1"
              />
              <Input value={roleColor} onChange={(e) => setRoleColor(e.target.value)} />
            </div>
          </div>
          <div>
            <Label htmlFor="roleDesc">คำอธิบาย</Label>
            <Input
              id="roleDesc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            ยกเลิก
          </Button>
          <Button
            type="button"
            disabled={!roleCode.trim() || !roleName.trim() || createMut.isPending}
            onClick={() => createMut.mutate()}
          >
            {createMut.isPending ? <Loader2 className="size-4 animate-spin" /> : 'สร้าง'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}