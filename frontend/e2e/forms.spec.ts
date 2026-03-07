import { test, expect } from '@playwright/test'
import { mockLarvisApi } from './api-mock'
import { loginAs } from './auth-helper'

test.describe('Form interactions and validation', () => {
  test.beforeEach(async ({ page }) => {
    await mockLarvisApi(page)
  })

  test.describe('Settings - Change password', () => {
    test.beforeEach(async ({ page }) => {
      await loginAs(page)
      await page.getByRole('link', { name: /settings/i }).click()
      await expect(page.getByRole('heading', { name: /change password/i })).toBeVisible({
        timeout: 5000,
      })
    })

    test('shows mismatch error when passwords do not match', async ({ page }) => {
      await page.getByLabel(/old password/i).fill('1234')
      await page.getByLabel(/new password/i).fill('newpass')
      await page.getByLabel(/password confirmation|re-enter/i).fill('different')
      await page.getByRole('button', { name: /change password/i }).click()

      await expect(page.getByText(/do not match/i)).toBeVisible({ timeout: 5000 })
    })

    test('shows incorrect old password error', async ({ page }) => {
      await page.getByLabel(/old password/i).fill('wrong')
      await page.getByLabel(/new password/i).fill('newpass')
      await page.getByLabel(/password confirmation|re-enter/i).fill('newpass')
      await page.getByRole('button', { name: /change password/i }).click()

      await expect(page.getByText(/incorrect old password/i)).toBeVisible({ timeout: 8000 })
    })

    test('succeeds with correct credentials', async ({ page }) => {
      await page.getByLabel(/old password/i).fill('1234')
      await page.getByLabel(/new password/i).fill('newpass')
      await page.getByLabel(/password confirmation|re-enter/i).fill('newpass')
      await page.getByRole('button', { name: /change password/i }).click()

      await expect(page.getByText(/password changed|updated successfully/i)).toBeVisible({
        timeout: 8000,
      })
    })
  })

  test.describe('Settings - Humor slider', () => {
    test.beforeEach(async ({ page }) => {
      await loginAs(page)
      await page.getByRole('link', { name: /settings/i }).click()
    })

    test('humor slider updates displayed value', async ({ page }) => {
      const slider = page.getByRole('slider', { name: /humor level/i })
      await expect(slider).toBeVisible()

      const valueSpan = page.locator('span.w-12.shrink-0.text-right')
      await expect(valueSpan).toContainText(/\d+%/)

      await slider.fill('75')
      await expect(valueSpan).toContainText('75%')
    })
  })

  test.describe('Reports - Form elements', () => {
    test.beforeEach(async ({ page }) => {
      await loginAs(page)
      await page.getByRole('link', { name: /reporting/i }).click()
      await page.waitForLoadState('networkidle')
    })

    test('notes textarea accepts input', async ({ page }) => {
      const textarea = page.getByPlaceholder(/add any additional notes/i)
      await expect(textarea).toBeVisible()
      await textarea.fill('Test report notes')
      await expect(textarea).toHaveValue('Test report notes')
    })
  })
})
