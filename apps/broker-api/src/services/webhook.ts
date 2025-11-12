import fetch from 'node-fetch';

export async function notifyWebhook(url: string, payload: any): Promise<void> {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      timeout: 5000
    });

    if (!response.ok) {
      console.error(`Webhook notification failed: ${response.status}`);
    }
  } catch (error) {
    console.error('Webhook notification error:', error);
  }
}
