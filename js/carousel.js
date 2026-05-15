import { getObras } from '/js/data.js';

const INTERVAL = 5000;
const TRANSITION = 600;

export async function initCarousel() {
  const track = document.querySelector('.carousel__track');
  if (!track) return;
  track.id = track.id || 'carousel-track';

  const obras = await getObras();
  const slides = obras.slice(0, 5);

  slides.forEach((obra, i) => {
    const slide = document.createElement('div');
    slide.className = 'carousel__slide' + (i === 0 ? ' carousel__slide--active' : '');
    slide.id = `carousel-slide-${i + 1}`;
    slide.setAttribute('role', 'group');
    slide.setAttribute('aria-roledescription', 'slide');
    slide.setAttribute('aria-label', `${i + 1} de ${slides.length}: ${obra.nome}`);
    slide.setAttribute('aria-hidden', String(i !== 0));
    if (i === 0) slide.setAttribute('aria-live', 'polite');
    slide.innerHTML = `
      <img src="/${obra.imagem}" alt="${obra.imagemAlt}" class="carousel__img" ${i === 0 ? 'fetchpriority="high"' : 'loading="lazy"'}>
      <div class="carousel__overlay">
        <span class="carousel__collection">${obra.colecao}</span>
        <h2 class="carousel__title">${obra.nome}</h2>
        <a href="/obra.html?id=${obra.id}" class="carousel__link" aria-label="Ver obra ${obra.nome}">Ver obra</a>
      </div>
    `;
    if (i !== 0) {
      slide.querySelector('.carousel__link')?.setAttribute('tabindex', '-1');
    }
    track.appendChild(slide);
  });

  const dots = document.querySelector('.carousel__dots');
  slides.forEach((obra, i) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.id = `carousel-tab-${i + 1}`;
    dot.className = 'carousel__dot' + (i === 0 ? ' carousel__dot--active' : '');
    dot.setAttribute('aria-controls', `carousel-slide-${i + 1}`);
    dot.setAttribute('aria-label', `Mostrar slide ${i + 1}: ${obra.nome}`);
    if (i === 0) dot.setAttribute('aria-current', 'true');
    dot.addEventListener('click', () => goTo(i));
    dots.appendChild(dot);
  });

  let current = 0;
  let timer = null;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function setSlideInteractive(slide, interactive) {
    slide.querySelectorAll('a[href], button, input, select, textarea, [tabindex]').forEach(el => {
      if (interactive) {
        el.removeAttribute('tabindex');
      } else {
        el.setAttribute('tabindex', '-1');
      }
    });
  }

  function goTo(index) {
    const allSlides = track.querySelectorAll('.carousel__slide');
    const allDots = dots.querySelectorAll('.carousel__dot');
    allSlides[current].classList.remove('carousel__slide--active');
    allSlides[current].setAttribute('aria-hidden', 'true');
    allSlides[current].removeAttribute('aria-live');
    setSlideInteractive(allSlides[current], false);
    allDots[current].classList.remove('carousel__dot--active');
    allDots[current].removeAttribute('aria-current');
    current = (index + slides.length) % slides.length;
    allSlides[current].classList.add('carousel__slide--active');
    allSlides[current].setAttribute('aria-hidden', 'false');
    allSlides[current].setAttribute('aria-live', 'polite');
    setSlideInteractive(allSlides[current], true);
    allDots[current].classList.add('carousel__dot--active');
    allDots[current].setAttribute('aria-current', 'true');
  }

  function start() {
    if (reduced) return;
    timer = setInterval(() => goTo(current + 1), INTERVAL);
  }

  function stop() {
    clearInterval(timer);
  }

  document.querySelector('.carousel__btn--prev')
    ?.addEventListener('click', () => { stop(); goTo(current - 1); start(); });
  document.querySelector('.carousel__btn--next')
    ?.addEventListener('click', () => { stop(); goTo(current + 1); start(); });

  const carousel = document.querySelector('.carousel');
  carousel?.addEventListener('mouseenter', stop);
  carousel?.addEventListener('mouseleave', start);

  start();

  // Obra em destaque — primeira obra disponível
  const featured = obras.find(o => o.status === 'disponivel') || obras[0];
  const featuredEl = document.getElementById('featured-content');
  if (featuredEl && featured) {
    featuredEl.innerHTML = `
      <div class="featured__img-wrap">
        <a href="/obra.html?id=${featured.id}">
          <img src="/${featured.imagem}" alt="${featured.imagemAlt}" loading="lazy">
        </a>
      </div>
      <div class="featured__info">
        <p class="featured__meta meta">${featured.tecnica} · ${featured.tamanho} · ${featured.ano}</p>
        <h2 class="featured__title">${featured.nome}</h2>
        <p class="featured__desc">${featured.descricao}</p>
        <p class="featured__price">R$ ${featured.preco.toLocaleString('pt-BR')}</p>
        <a href="/obra.html?id=${featured.id}" class="btn btn--primary" aria-label="Ver obra ${featured.nome}">Ver obra</a>
      </div>
    `;
  }
}
