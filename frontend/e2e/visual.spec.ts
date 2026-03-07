import { test, expect } from '@playwright/test'
import { mockLarvisApi } from './api-mock'
import { loginAs } from './auth-helper'

test.describe('Visual regression', () => {
  test.beforeEach(async ({ page }) => {
    await mockLarvisApi(page)
  })

  test('login page matches snapshot', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByRole('heading', { name: /secure terminal access/i })).toBeVisible()
    await expect(page).toHaveScreenshot('login-page.png')
  })

  test('activities page matches snapshot when authenticated', async ({ page }) => {
    await loginAs(page)
    await page.waitForLoadState('networkidle')
    await expect(page.getByRole('heading', { name: /activities/i })).toBeVisible()
    await expect(page).toHaveScreenshot('activities-page.png')
  })

  test('settings page matches snapshot when authenticated', async ({ page }) => {
    await loginAs(page)
    await page.getByRole('link', { name: /settings/i }).click()
    await expect(page.getByRole('heading', { name: /settings/i })).toBeVisible()
    await page.waitForLoadState('networkidle')
    await expect(page).toHaveScreenshot('settings-page.png')
  })
})
