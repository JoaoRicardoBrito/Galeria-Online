// app.js — Entry point único de cada página HTML.
// Responsabilidades:
// 1. Injetar fragmentos compartilhados (header, footer) via fetch.
// 2. Marcar o link de navegação correspondente à página atual com aria-current.
// 3. Despachar para o módulo de página correto (a partir da Phase 2/3 quando
//    gallery.js, obra.js, etc. existirem).

/**
 * Após injeção do header, marca o link da página atual com aria-current="page"
 * e classe active. Compara document.body.id com o atributo data-page de cada link.
 */
function markActiveNav() {
  const currentPage = document.body.id;
  if (!currentPage) return;
  const links = document.querySelectorAll('#site-header [data-page]');
  links.forEach(link => {
    if (link.dataset.page === currentPage) {
      link.setAttribute('aria-current', 'page');
      link.classList.add('active');
    }
  });
}

function enableSpaceActivationForLinks() {
  document.addEventListener('keydown', event => {
    if (event.key !== ' ' && event.key !== 'Spacebar') return;
    const link = event.target?.closest?.('a[href]');
    if (!link) return;
    event.preventDefault();
    link.click();
  });
}

function initMobileMenu() {
  const toggle = document.getElementById('menu-toggle');
  const nav = document.getElementById('primary-navigation');
  if (!toggle || !nav) return;

  const desktopMedia = window.matchMedia('(min-width: 769px)');
  const links = Array.from(nav.querySelectorAll('a[href]'));
  let isOpen = false;

  function setOpen(open, { focusFirst = false, returnFocus = false } = {}) {
    isOpen = open;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');

    if (desktopMedia.matches) {
      nav.hidden = false;
      return;
    }

    nav.hidden = !open;

    if (open && focusFirst) {
      requestAnimationFrame(() => links[0]?.focus());
    } else if (!open && returnFocus) {
      toggle.focus();
    }
  }

  function syncMenuVisibility() {
    nav.hidden = !desktopMedia.matches && !isOpen;
  }

  function trapFocus(event) {
    if (!isOpen || desktopMedia.matches || event.key !== 'Tab') return;
    const focusable = [toggle, ...links].filter(el => !el.hidden);
    if (!focusable.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  toggle.addEventListener('click', () => {
    setOpen(!isOpen, { focusFirst: !isOpen, returnFocus: isOpen });
  });

  links.forEach(link => {
    link.addEventListener('click', () => {
      if (!desktopMedia.matches) setOpen(false);
    });
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && isOpen && !desktopMedia.matches) {
      setOpen(false, { returnFocus: true });
      return;
    }
    trapFocus(event);
  });

  if (desktopMedia.addEventListener) {
    desktopMedia.addEventListener('change', syncMenuVisibility);
  } else {
    desktopMedia.addListener(syncMenuVisibility);
  }

  syncMenuVisibility();
}

/**
 * Despacha para o módulo de inicialização da página atual.
 * Phase 1: nenhum módulo de página existe ainda — função é stub.
 * Phases 2-5 vão expandir este switch conforme módulos são criados.
 */
async function dispatchPage() {
  const page = document.body.id;
  switch (page) {
    case 'page-index': {
      const { initCarousel } = await import('/js/carousel.js');
      await initCarousel();
      break;
    }
    case 'page-obras': {
      const { initGallery } = await import('/js/gallery.js');
      await initGallery();
      break;
    }
    case 'page-obra': {
      const { initObra } = await import('/js/obra.js');
      await initObra();
      break;
    }
    case 'page-sobre':
      // Phase 5: nenhuma lógica dinâmica
      break;
    case 'page-colecoes': {
      const { initColecoes } = await import('/js/colecoes.js');
      await initColecoes();
      break;
    }
    default:
      console.warn(`[app] body id desconhecido: ${page}`);
  }
}

/**
 * Injeta header e footer de forma resiliente: falha em um não impede o outro.
 * @param {string} selector — seletor CSS do elemento destino
 * @param {Response} res — response do fetch já realizado
 */
async function injectResponse(selector, res, path) {
  const el = document.querySelector(selector);
  if (!el) return;
  if (!res.ok) {
    console.warn(`[app] Falha ao carregar ${path}: ${res.status}`);
    return;
  }
  el.innerHTML = await res.text();
}

/**
 * Inicialização principal: injeta header e footer em paralelo via Promise.all,
 * marca link ativo (depois que o header existe), e despacha para o módulo da página.
 */
async function init() {
  try {
    const [headerRes, footerRes] = await Promise.all([
      fetch('/components/header.html'),
      fetch('/components/footer.html'),
    ]);
    await injectResponse('#site-header', headerRes, '/components/header.html');
    await injectResponse('#site-footer', footerRes, '/components/footer.html');
  } catch (err) {
    console.warn('[app] Erro de rede ao carregar componentes:', err);
  }
  markActiveNav();
  initMobileMenu();
  enableSpaceActivationForLinks();
  await dispatchPage();
}

// Executa init imediatamente — `<script type="module">` já é deferido.
init();
