// data.js — Acesso singleton a obras.json
// Carrega /data/obras.json uma vez por carregamento de página e compartilha o resultado
// entre todos os módulos importadores (gallery.js, obra.js, carousel.js).

let _cache = null;
let _inflight = null;

/**
 * Retorna o array completo de obras. Faz fetch apenas na primeira chamada.
 * Chamadas concorrentes durante o fetch inicial reaproveitam a mesma promise (_inflight).
 * @returns {Promise<Array>}
 */
export async function getObras() {
  if (_cache) return _cache;
  if (_inflight) return _inflight;

  _inflight = (async () => {
    const res = await fetch('/data/obras.json');
    if (!res.ok) {
      _inflight = null;
      throw new Error('Falha ao carregar obras.json');
    }
    const data = await res.json();
    _cache = data;
    _inflight = null;
    return _cache;
  })();

  return _inflight;
}

/**
 * Retorna a obra com o id informado, ou null se não existir.
 * Aceita id como number ou string (URLSearchParams sempre devolve string).
 * @param {number|string} id
 * @returns {Promise<Object|null>}
 */
export async function getObra(id) {
  const obras = await getObras();
  const target = Number(id);
  if (Number.isNaN(target)) return null;
  return obras.find(o => o.id === target) ?? null;
}

/**
 * Retorna a lista de nomes únicos de coleções presentes no dataset.
 * @returns {Promise<string[]>}
 */
export async function getColecoes() {
  const obras = await getObras();
  const seen = new Set();
  const result = [];
  for (const o of obras) {
    if (!seen.has(o.colecao)) {
      seen.add(o.colecao);
      result.push(o.colecao);
    }
  }
  return result;
}
