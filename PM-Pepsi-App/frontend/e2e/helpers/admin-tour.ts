import { expect, type Locator, type Page } from '@playwright/test'
import { ADMIN_TOUR_STEP_COUNT } from '../../src/components/admin/admin-tour-steps'

export { ADMIN_TOUR_STEP_COUNT }

/** Custom Joyride tooltip (AdminTourTooltip) */
export function adminTourTooltip(page: Page): Locator {
  return page.locator('.admin-tour-tooltip')
}

export function adminTourFooter(page: Page): Locator {
  return adminTourTooltip(page).locator('.admin-tour-tooltip__footer')
}

export class AdminTourPage {
  constructor(readonly page: Page) {}

  async openFromConsole() {
    await this.page.getByRole('button', { name: /ทัวร์ Admin/i }).click()
    await expect(adminTourTooltip(this.page)).toBeVisible({ timeout: 10_000 })
  }

  async expectProgress(current: number, total = ADMIN_TOUR_STEP_COUNT) {
    await expect(adminTourTooltip(this.page).locator('.admin-tour-tooltip__step-pill')).toHaveText(
      `${current} / ${total}`,
    )
  }

  skipButton() {
    return adminTourFooter(this.page).getByRole('button', { name: 'ข้าม' })
  }

  nextButton() {
    return adminTourFooter(this.page).getByRole('button', { name: 'ถัดไป' })
  }

  finishButton() {
    return adminTourFooter(this.page).getByRole('button', { name: 'เสร็จสิ้น' })
  }

  async skipTour() {
    await this.skipButton().click()
    await expect(adminTourTooltip(this.page)).toHaveCount(0, { timeout: 10_000 })
  }

  async advanceToFinish(maxClicks = ADMIN_TOUR_STEP_COUNT + 2) {
    const next = this.nextButton()
    const finish = this.finishButton()
    let clicks = 0
    while (clicks < maxClicks) {
      if (await finish.isVisible()) {
        await finish.click()
        return clicks
      }
      await next.click()
      clicks += 1
      await this.page.waitForTimeout(350)
    }
    throw new Error(`Tour did not reach finish within ${maxClicks} clicks`)
  }
}
