// data.js — Acesso singleton a obras.json
// Carrega /data/obras.json uma vez por carregamento de página e compartilha o resultado
// entre todos os módulos importadores (gallery.js, obra.js, carousel.js).

let _cache = null;
let _inflight = null;

const COLECAO_DESCRICOES = {
  'Paisagens Urbanas': 'O cotidiano brasileiro visto através de avenidas, fachadas e mercados populares.',
  'Grandeza do Mundo': 'A imensidão da natureza em montanhas, oceanos e chapadas que provocam silêncio interior.',
};

function slugify(value) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function getDescricaoColecao(nome, total) {
  if (COLECAO_DESCRICOES[nome]) return COLECAO_DESCRICOES[nome];
  const obraLabel = total === 1 ? 'obra' : 'obras';
  return `Seleção com ${total} ${obraLabel} da coleção ${nome}.`;
}

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
 * Retorna a lista de coleções únicas presentes no dataset.
 * @returns {Promise<Array<{ id: string, nome: string, descricao: string, capa: string, capaAlt: string }>>}
 */
export async function getColecoes() {
  const obras = await getObras();
  const porNome = new Map();

  for (const o of obras) {
    if (!o.colecao) continue;
    if (!porNome.has(o.colecao)) {
      porNome.set(o.colecao, {
        nome: o.colecao,
        capa: o.imagem,
        capaAlt: o.imagemAlt,
        total: 0,
      });
    }
    porNome.get(o.colecao).total += 1;
  }

  return Array.from(porNome.values()).map(colecao => ({
    id: slugify(colecao.nome),
    nome: colecao.nome,
    descricao: getDescricaoColecao(colecao.nome, colecao.total),
    capa: colecao.capa,
    capaAlt: colecao.capaAlt,
  }));
}
