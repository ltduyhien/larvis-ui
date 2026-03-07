import { Page } from '@playwright/test'

/** Mock LARVIS API responses so E2E tests run without the backend */
export async function mockLarvisApi(page: Page) {
  await page.route('**/api/token', async (route) => {
    const postData = route.request().postDataJSON()
    const validPasswords = ['1234', 'newpass'] // 1234 = default, newpass = after change-password
    if (postData?.user_id && validPasswords.includes(postData?.password)) {
      await route.fulfill({ json: { access: 'mock-jwt-token' } })
    } else {
      await route.fulfill({ status: 401, json: { detail: 'Invalid credentials' } })
    }
  })

  await page.route('**/api/users', async (route) => {
    if (route.request().headers()['authorization']?.includes('Bearer')) {
      await route.fulfill({
        json: [
          { user_id: 'alice', name: 'Alice' },
          { user_id: 'bob', name: 'Bob' },
          { user_id: 'charlie', name: 'Charlie' },
        ],
      })
    } else {
      await route.fulfill({ status: 401 })
    }
  })

  await page.route('**/api/users/*', async (route) => {
    const auth = route.request().headers()['authorization']
    if (!auth?.includes('Bearer')) {
      await route.fulfill({ status: 401 })
      return
    }
    const url = route.request().url()
    const userId = url.split('/users/')[1]?.split('/')[0] ?? 'alice'
    if (route.request().method() === 'POST') {
      const body = route.request().postDataJSON() ?? {}
      await route.fulfill({
        json: {
          user_id: userId,
          name: body.name ?? userId.charAt(0).toUpperCase() + userId.slice(1),
          password: body.password ?? '1234',
        },
      })
    } else {
      await route.fulfill({
        json: {
          user_id: userId,
          name: userId.charAt(0).toUpperCase() + userId.slice(1),
          password: '1234',
        },
      })
    }
  })

  await page.route('**/api/acquisitions', async (route) => {
    if (route.request().headers()['authorization']?.includes('Bearer')) {
      await route.fulfill({ json: [] })
    } else {
      await route.fulfill({ status: 401 })
    }
  })
}
