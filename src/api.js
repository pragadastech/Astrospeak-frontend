const TAB_KEY = 'astro.tab'
const API_CANDIDATES = [import.meta.env.VITE_API_URL, import.meta.env.VITE_API_URL_FALLBACK]
  .map((value) => String(value || '').replace(/\/$/, ''))
  .filter((value, index, all) => value && all.indexOf(value) === index)

function requestUrl(url, base) {
  if (!base || /^https?:\/\//i.test(url)) return url
  return base + (url.startsWith('/') ? url : '/' + url)
}

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
  const bases = API_CANDIDATES.length ? API_CANDIDATES : ['']
  let res
  for (let i = 0; i < bases.length; i++) {
    try {
      res = await fetch(requestUrl(url, bases[i]), {
        ...opts,
        credentials: 'omit',
        headers,
        body: opts.body instanceof FormData ? opts.body : opts.body ? JSON.stringify(opts.body) : undefined,
      })
      break
    } catch (err) {
      if (i === bases.length - 1) throw err
    }
  }
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
  if (!iso) return '—'
  // Support both YYYY-MM-DD and full ISO strings like 2026-11-20T16:45:00.000Z
  try {
    const d = new Date(iso)
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    }
  } catch (e) {}
  const parts = String(iso).split('T')[0].split('-').map(Number)
  if (parts.length >= 3 && parts[0] && parts[1] && parts[2]) {
    return new Date(parts[0], parts[1] - 1, parts[2]).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  }
  return String(iso).substring(0, 10) || '—'
}

export function to24(hour, minute, ap) {
  let h = Number(hour) % 12
  if (ap === 'PM') h += 12
  return `${String(h).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00`
}
