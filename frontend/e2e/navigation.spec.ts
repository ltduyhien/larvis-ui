import { test, expect } from '@playwright/test'
import { mockLarvisApi } from './api-mock'
import { loginAs } from './auth-helper'

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await mockLarvisApi(page)
  })

  test('can navigate between pages via sidebar when authenticated', async ({
    page,
  }) => {
    await loginAs(page)

    await page.getByRole('link', { name: /reporting/i }).click()
    await expect(page).toHaveURL(/\/reports$/)
    await expect(page.getByText(/monthly reports|reporting/i)).toBeVisible()

    await page.getByRole('link', { name: /settings/i }).click()
    await expect(page).toHaveURL(/\/settings$/)
    await expect(page.getByRole('heading', { name: /settings/i })).toBeVisible()

    await page.getByRole('link', { name: /activities/i }).click()
    await expect(page).toHaveURL(/\/activities$/)
  })

  test('root path redirects to activities', async ({ page }) => {
    await loginAs(page)
    await page.goto('/')
    await expect(page).toHaveURL(/\/activities$/)
  })
})
