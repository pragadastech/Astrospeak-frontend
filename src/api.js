const TAB_KEY = 'astro.tab'

export function tabToken() {
  try { return sessionStorage.getItem(TAB_KEY) || '' } catch { return '' }
}

export function saveTab(token) {
  if (!token) return
  sessionStorage.setItem(TAB_KEY, token)
}

export function clearTab() {
  try { sessionStorage.removeItem(TAB_KEY) } catch { /* private mode */ }
}

export async function api(url, opts = {}) {
  const headers = new Headers(opts.headers || {})
  if (!(opts.body instanceof FormData) && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json')
  const token = tabToken()
  if (token && !headers.has('Authorization')) headers.set('Authorization', 'Bearer ' + token)
  const res = await fetch(url, {
    ...opts,
    credentials: 'omit',
    headers,
    body: opts.body instanceof FormData ? opts.body : opts.body ? JSON.stringify(opts.body) : undefined,
  })
  if (String(url).endsWith('/api/auth/logout')) clearTab()
  const text = await res.text()
  const data = text ? JSON.parse(text) : {}
  if (!res.ok) throw new Error(data.error || 'Request failed')
  if (data && typeof data.token === 'string') {
    saveTab(data.token)
    delete data.token
  }
  return data
}

export const inr = (n) => '₹' + Number(n).toLocaleString('en-IN', { maximumFractionDigits: 2 })
export const usd = (n) => '$' + Number(n).toLocaleString('en-US')

export function moneyMinor(currency, minor) {
  const major = Number(minor) / 100
  return currency === 'USD' ? usd(major) : inr(major)
}

export function spokenDate(iso) {
  if (!iso) return ''
  const [y, m, d] = iso.split('-').map(Number)
  if (!y || !m || !d) return ''
  return new Date(y, m - 1, d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

export function to24(hour, minute, ap) {
  let h = Number(hour) % 12
  if (ap === 'PM') h += 12
  return `${String(h).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00`
}
