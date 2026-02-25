// autoAuth.ts — Side-effect module that logs in immediately at import time.
// NEW FILE: cannot be browser-cached because it never existed before.

console.log('[AUTH] autoAuth.ts loaded — attempting login...');

const LOGIN_URL = '/api/auth/login';
const CREDENTIALS = { email: 'test@shotpilot.com', password: 'testpassword123' };

// Fire login immediately — this runs before React mounts
export const authReady: Promise<boolean> = fetch(LOGIN_URL, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(CREDENTIALS),
})
.then(r => {
    console.log('[AUTH] Login response:', r.status);
    return r.ok;
})
.catch(err => {
    console.error('[AUTH] Login failed:', err);
    return false;
});
