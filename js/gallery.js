import { getColecoes, getObras } from '/js/data.js';
import { initFilters } from '/js/filters.js';

export async function initGallery() {
  const grid = document.getElementById('gallery-grid');
  const empty = document.getElementById('gallery-empty');
  if (!grid) return;

  const obras = await getObras();
  const colecoes = await getColecoes();
  const count = document.getElementById('gallery-count');

  initFilters({
    obras,
    colecoes,
    onChange(filteredObras) {
      renderGrid(filteredObras, grid, empty);
      if (count) {
        count.textContent = `${filteredObras.length} obra${filteredObras.length !== 1 ? 's' : ''}`;
      }
    },
  });
}

export function renderGrid(obras, grid, empty) {
  grid.innerHTML = '';

  if (!obras.length) {
    if (empty) empty.hidden = false;
    return;
  }
  if (empty) empty.hidden = true;

  obras.forEach(obra => {
    const card = document.createElement('article');
    card.className = 'artwork-card';

    card.innerHTML = `
      <a href="/obra.html?id=${obra.id}" class="artwork-card__link" aria-label="${obra.nome}">
        <div class="artwork-card__img-wrap">
          <img
            src="/${obra.imagem}"
            alt="${obra.imagemAlt}"
            class="artwork-card__image"
            loading="lazy"
            width="400"
            height="500"
          >
          ${obra.status === 'vendido'
            ? '<span class="badge--vendido" aria-label="Obra vendida">Vendido</span>'
            : ''}
        </div>
        <div class="artwork-card__info">
          <h2 class="artwork-card__name">${obra.nome}</h2>
          <p class="artwork-card__meta">${obra.tecnica}</p>
          <p class="artwork-card__price">R$ ${obra.preco.toLocaleString('pt-BR')}</p>
        </div>
      </a>
    `;

    grid.appendChild(card);
  });
}
