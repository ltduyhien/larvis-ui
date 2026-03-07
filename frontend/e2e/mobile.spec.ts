import { test, expect } from '@playwright/test'
import { mockLarvisApi } from './api-mock'
import { loginAs } from './auth-helper'

test.describe('Mobile viewport', () => {
  test.use({ viewport: { width: 375, height: 667 } })

  test.beforeEach(async ({ page }) => {
    await mockLarvisApi(page)
  })

  test('shows hamburger menu on mobile', async ({ page }) => {
    await loginAs(page)
    await expect(page.getByRole('button', { name: /open menu/i })).toBeVisible()
  })

  test('sidebar opens and closes on mobile', async ({ page }) => {
    await loginAs(page)
    await page.getByRole('button', { name: /open menu/i }).click()
    await expect(page.getByRole('link', { name: /activities/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /reporting/i })).toBeVisible()

    await page.getByRole('button', { name: /close menu/i }).click()
    await expect(page.getByRole('link', { name: /activities/i })).not.toBeVisible()
  })

  test('reports page shows month dropdown on mobile', async ({ page }) => {
    await loginAs(page)
    await page.getByRole('link', { name: /reporting/i }).click()
    await expect(page.getByText(/monthly reports/i)).toBeVisible()
    await expect(page.getByLabel(/select report month/i)).toBeVisible()
  })
})
