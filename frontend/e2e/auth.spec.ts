import { test, expect } from '@playwright/test'
import { mockLarvisApi } from './api-mock'
import { loginAs } from './auth-helper'

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await mockLarvisApi(page)
  })

  test('redirects unauthenticated user to /login when visiting protected route', async ({
    page,
  }) => {
    await page.goto('/activities')
    await expect(page).toHaveURL(/\/login$/)
  })

  test('shows login form and validates required fields', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByRole('heading', { name: /secure terminal access/i })).toBeVisible()

    await page.getByRole('button', { name: /sign in/i }).click()
    await expect(page.getByText(/please fill out all fields/i)).toBeVisible({ timeout: 3000 })
  })

  test('validates username when password is filled', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel(/password/i).fill('1234')
    await page.getByRole('button', { name: /sign in/i }).click()
    await expect(page.getByText(/please fill out username/i)).toBeVisible({ timeout: 3000 })
  })

  test('validates password when username is filled', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel(/username/i).fill('alice')
    await page.getByRole('button', { name: /sign in/i }).click()
    await expect(page.getByText(/please fill out password/i)).toBeVisible({ timeout: 3000 })
  })

  test('shows error on invalid credentials', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel(/username/i).fill('alice')
    await page.getByLabel(/password/i).fill('wrong')
    await page.getByRole('button', { name: /sign in/i }).click()

    await expect(page.getByText(/invalid credentials/i)).toBeVisible({ timeout: 5000 })
  })

  test('logs in and redirects to activities with valid credentials', async ({
    page,
  }) => {
    await loginAs(page)
    await expect(page.getByRole('heading', { name: /activities/i })).toBeVisible()
  })

  test('logout redirects to login and protected routes require re-auth', async ({
    page,
  }) => {
    await loginAs(page)
    await expect(page).toHaveURL(/\/activities$/)

    await page.getByRole('link', { name: /settings/i }).click()
    await expect(page).toHaveURL(/\/settings$/)

    await page.getByRole('button', { name: /log out/i }).click()
    await expect(page).toHaveURL(/\/login$/, { timeout: 5000 })

    await page.goto('/activities')
    await expect(page).toHaveURL(/\/login$/)
  })
})
