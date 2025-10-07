import { test, expect } from '@playwright/test'


test('register page renders form fields', async ({ page }) => {
await page.goto('/')
await page.goto('/dashboard/teams/register')
await expect(page.getByRole('heading', { name: /register your team/i })).toBeVisible()
await expect(page.getByText('Team Name')).toBeVisible()
await expect(page.getByText('College')).toBeVisible()
await expect(page.getByText('Captain Details')).toBeVisible()
await expect(page.getByRole('button', { name: /submit registration/i })).toBeVisible()
})