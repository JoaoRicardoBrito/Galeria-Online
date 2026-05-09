const API_URL = 'https://api.frankfurter.dev/v1/latest?from=BRL&to=USD,EUR';
const CACHE_KEY = 'gv_fx_cache';
const CACHE_TTL = 6 * 60 * 60 * 1000; // 6h

export async function getConversions(brl) {
  try {
    const cached = _loadCache();
    const rates = cached || await _fetchRates();
    if (!rates) return null;

    return {
      usd: (brl * rates.USD).toFixed(2),
      eur: (brl * rates.EUR).toFixed(2),
    };
  } catch {
    return null;
  }
}

async function _fetchRates() {
  const res = await fetch(API_URL);
  if (!res.ok) return null;
  const data = await res.json();
  const rates = data.rates;
  sessionStorage.setItem(CACHE_KEY, JSON.stringify({ rates, ts: Date.now() }));
  return rates;
}

function _loadCache() {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { rates, ts } = JSON.parse(raw);
    return Date.now() - ts < CACHE_TTL ? rates : null;
  } catch {
    return null;
  }
}
