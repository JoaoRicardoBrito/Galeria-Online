import { getColecoes } from '/js/data.js';

export async function initColecoes() {
  const root = document.getElementById('colecoes-root');
  if (!root) return;

  const colecoes = await getColecoes();
  const grid = document.createElement('div');
  grid.className = 'colecoes-grid';

  colecoes.forEach(colecao => {
    const card = document.createElement('article');
    card.className = 'colecao-card';

    const link = document.createElement('a');
    link.className = 'colecao-card__link';
    link.href = `/obras.html?colecao=${encodeURIComponent(colecao.id)}`;
    link.setAttribute('aria-label', `Ver obras da coleção ${colecao.nome}`);

    const imageWrap = document.createElement('div');
    imageWrap.className = 'colecao-card__img-wrap';

    const image = document.createElement('img');
    image.className = 'colecao-card__image';
    image.src = `/${colecao.capa}`;
    image.alt = colecao.capaAlt;
    image.loading = 'lazy';
    image.width = 600;
    image.height = 400;

    const body = document.createElement('div');
    body.className = 'colecao-card__body';

    const title = document.createElement('h2');
    title.className = 'colecao-card__name';
    title.textContent = colecao.nome;

    const description = document.createElement('p');
    description.className = 'colecao-card__desc';
    description.textContent = colecao.descricao;

    imageWrap.appendChild(image);
    body.append(title, description);
    link.append(imageWrap, body);
    card.appendChild(link);
    grid.appendChild(card);
  });

  root.replaceChildren(grid);
}
