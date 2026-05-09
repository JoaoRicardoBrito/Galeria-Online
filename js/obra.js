import { getObra, getObras } from '/js/data.js';
import { getConversions } from '/js/currency.js';
import { buildWhatsAppLink } from '/js/whatsapp.js';

export async function initObra() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  const obra = id ? await getObra(id) : null;

  const root = document.getElementById('obra-root');
  if (!root) return;

  if (!obra) {
    root.innerHTML = `
      <div class="obra-not-found">
        <h1 class="obra-not-found__title">Esta obra não está disponível</h1>
        <p class="obra-not-found__text">A obra que procura não foi encontrada ou foi removida do portfólio.</p>
        <a href="/obras.html" class="btn btn--primary">Ver todas as obras</a>
      </div>`;
    return;
  }

  // Atualiza SEO dinamicamente
  document.title = `${obra.nome} — Carlos Ventura`;
  document.querySelector('meta[name="description"]')
    ?.setAttribute('content', obra.descricao.slice(0, 155));
  document.querySelector('meta[property="og:title"]')
    ?.setAttribute('content', obra.nome);
  document.querySelector('meta[property="og:image"]')
    ?.setAttribute('content', `/${obra.imagem}`);

  const vendido = obra.status === 'vendido';

  root.innerHTML = `
    <div class="obra-layout">
      <div class="obra-layout__img">
        <div class="obra-img-wrap">
          <img
            src="/${obra.imagem}"
            alt="${obra.imagemAlt}"
            class="obra-img"
            fetchpriority="high"
            onerror="this.closest('.obra-img-wrap').classList.add('obra-img-wrap--error')"
          >
        </div>
      </div>

      <div class="obra-layout__info">
        <p class="obra-collection meta">${obra.colecao}</p>
        <h1 class="obra-title">${obra.nome}</h1>

        <ul class="obra-meta-list">
          <li class="meta">${obra.tecnica}</li>
          <li class="meta">${obra.tamanho}</li>
          <li class="meta">${obra.orientacao === 'vertical' ? 'Vertical' : 'Horizontal'} · ${obra.ano}</li>
        </ul>

        <div class="obra-price-wrap">
          <p class="obra-price">R$ ${obra.preco.toLocaleString('pt-BR')}</p>
          <p class="obra-price-fx" id="obra-price-fx" aria-live="polite"></p>
        </div>

        <p class="obra-desc">${obra.descricao}</p>

        <div class="obra-cta">
          ${vendido
            ? '<p class="obra-vendida">Esta obra foi adquirida por um colecionador.</p>'
            : `<a href="${buildWhatsAppLink(obra)}" target="_blank" rel="noopener" class="btn btn--primary obra-whatsapp-btn">
                Adquirir esta obra
               </a>`
          }
        </div>
      </div>
    </div>
  `;

  // Conversão de moeda assíncrona — não bloqueia render
  if (!vendido) {
    getConversions(obra.preco).then(fx => {
      const el = document.getElementById('obra-price-fx');
      if (!el || !fx) return;
      el.textContent = `aprox. USD ${fx.usd} · EUR ${fx.eur}`;
    });
  }

  // Obras relacionadas
  _renderRelated(obra);
}

async function _renderRelated(obra) {
  const todas = await getObras();
  const relacionadas = todas
    .filter(o => o.id !== obra.id && (o.colecao === obra.colecao || o.tecnica === obra.tecnica))
    .slice(0, 3);

  if (!relacionadas.length) return;

  const section = document.getElementById('obras-relacionadas');
  if (!section) return;

  section.hidden = false;
  const grid = section.querySelector('.relacionadas-grid');
  if (!grid) return;

  relacionadas.forEach(o => {
    const item = document.createElement('a');
    item.href = `/obra.html?id=${o.id}`;
    item.className = 'relacionada-card';
    item.innerHTML = `
      <div class="relacionada-card__img-wrap">
        <img src="/${o.imagem}" alt="${o.imagemAlt}" loading="lazy">
      </div>
      <p class="relacionada-card__name">${o.nome}</p>
      <p class="relacionada-card__price">R$ ${o.preco.toLocaleString('pt-BR')}</p>
    `;
    grid.appendChild(item);
  });
}
