import { isAuthApiError } from '@/lib/auth-api-error'
import type { TFunction } from 'i18next'

export function personnelLookupQuickAddErrorMessage(
  err: unknown,
  t: TFunction<'personnel'>,
): string {
  return personnelLookupMutateErrorMessage(err, t)
}

export function personnelLookupMutateErrorMessage(
  err: unknown,
  t: TFunction<'personnel'>,
): string {
  if (isAuthApiError(err)) {
    if (err.httpStatus === 409 && err.code === 'IN_USE') {
      const count =
        typeof err.meta?.usageCount === 'number' ? err.meta.usageCount : 0
      return t('admin.lookup.delete.inUse', { count })
    }
    if (err.httpStatus === 409 || err.code === 'CONFLICT') {
      return t('admin.lookup.quickAdd.duplicate')
    }
    if (err.httpStatus === 400 || err.code === 'VALIDATION_ERROR') {
      return err.message || t('admin.lookup.quickAdd.validation')
    }
  }
  if (err instanceof Error && err.message) return err.message
  return t('admin.lookup.quickAdd.failed')
}
