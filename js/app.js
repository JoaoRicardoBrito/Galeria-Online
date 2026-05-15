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
  await dispatchPage();
}

// Executa init imediatamente — `<script type="module">` já é deferido.
init();
