import { test, expect } from '@playwright/test'


test('home renders hero and CTAs', async ({ page }) => {
await page.goto('http://localhost:3000')
await expect(page.getByRole('heading', { name: /gameverse '25/i })).toBeVisible()
await expect(page.getByRole('link', { name: /register your team/i })).toBeVisible()
await expect(page.getByRole('link', { name: /view leaderboard/i })).toBeVisible()
})


test('leaderboard page loads and shows tabs', async ({ page }) => {
await page.goto('http://localhost:3000/leaderboard')
await expect(page.getByRole('heading', { name: /leaderboard/i })).toBeVisible()
await expect(page.getByRole('button', { name: /bgmi/i })).toBeVisible()
})