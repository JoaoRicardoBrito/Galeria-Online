const API_URL = 'https://open.er-api.com/v6/latest/BRL';
const CACHE_KEY = 'gv_fx_cache';
const CACHE_TTL = 6 * 60 * 60 * 1000; // 6h
const FETCH_TIMEOUT = 4000;

/**
 * Converte valor em BRL para USD e EUR.
 * Retorna null em qualquer falha para manter a renderização principal livre.
 * @param {number} brl
 * @returns {Promise<{ usd: string, eur: string } | null>}
 */
export async function getConversions(brl) {
  try {
    const amount = Number(brl);
    if (!Number.isFinite(amount)) return null;

    const rates = _loadCache() || await _fetchRates();
    if (!rates?.USD || !rates?.EUR) return null;

    return {
      usd: _formatEstimate(amount * rates.USD, 'USD'),
      eur: _formatEstimate(amount * rates.EUR, 'EUR'),
    };
  } catch {
    return null;
  }
}

async function _fetchRates() {
  const controller = typeof AbortController === 'function'
    ? new AbortController()
    : null;
  const timeout = controller
    ? globalThis.setTimeout(() => controller.abort(), FETCH_TIMEOUT)
    : null;

  try {
    const res = await fetch(API_URL, { signal: controller?.signal });
    if (!res.ok) return null;

    const data = await res.json();
    const rates = data?.rates;
    if (!rates?.USD || !rates?.EUR) return null;

    _saveCache(rates);
    return rates;
  } finally {
    if (timeout) globalThis.clearTimeout(timeout);
  }
}

function _formatEstimate(value, currency) {
  const formatted = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency,
  }).format(value);

  return `aprox. ${formatted}`;
}

function _saveCache(rates) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ rates, ts: Date.now() }));
  } catch {
    // Cache é opcional; falhas aqui não devem impactar a página.
  }
}

function _loadCache() {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;

    const { rates, ts } = JSON.parse(raw);
    if (!rates || !ts) return null;

    return Date.now() - ts < CACHE_TTL ? rates : null;
  } catch {
    return null;
  }
}
