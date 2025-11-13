import { test, expect } from '@playwright/test';
import axios from 'axios';

test('Civic Sovereign Node demo flow', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Mobius/i);

  const base = process.env.OAA_API_BASE || 'http://localhost:3001';
  const createResp = await axios.post(base + '/api/companion/create', {
    owner_id: 'demo-user',
    persona_seed: 'guide',
    ledger_id: 'demo-ledger'
  });
  expect(createResp.status).toBe(201);
  const companionId = createResp.data.companion_id;
  expect(companionId).toBeTruthy();
});

