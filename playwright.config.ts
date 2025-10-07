import { defineConfig, devices } from '@playwright/test'


export default defineConfig({
testDir: 'e2e',
timeout: 30_000,
expect: { timeout: 5_000 },
retries: 0,
use: {
baseURL: 'http://localhost:3000',
trace: 'on-first-retry',
headless: true,
},
projects: [
{ name: 'chromium', use: { ...devices['Desktop Chrome'] } },
],
webServer: {
command: 'npm run dev',
url: 'http://localhost:3000',
reuseExistingServer: true,
timeout: 120_000,
},
})