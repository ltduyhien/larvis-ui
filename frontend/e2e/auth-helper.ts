import { Page } from '@playwright/test'

/**
 * Log in as a user. Must be called for each test that needs authentication
 * because the app stores the JWT in memory (not cookies/localStorage),
 * so storageState cannot persist auth across page loads.
 */
export async function loginAs(page: Page, userId = 'alice', password = '1234'): Promise<void> {
  await page.goto('/login')
  await page.getByLabel(/username/i).fill(userId)
  await page.getByLabel(/password/i).fill(password)
  await page.getByRole('button', { name: /sign in/i }).click()
  await page.waitForURL(/\/activities$/, { timeout: 5000 })
}
