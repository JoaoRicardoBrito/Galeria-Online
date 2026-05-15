const SIZE_LABELS = ['P', 'M', 'G'];
const MOBILE_QUERY = '(max-width: 640px)';

function uniqueSorted(values, compare) {
  return Array.from(new Set(values.filter(Boolean))).sort(compare);
}

function formatCurrency(value) {
  return `R$ ${Number(value).toLocaleString('pt-BR')}`;
}

function getSizeCategory(obra) {
  const largestSide = Math.max(Number(obra.largura) || 0, Number(obra.altura) || 0);
  if (largestSide <= 40) return 'P';
  if (largestSide <= 80) return 'M';
  return 'G';
}

function hasActiveFilters(state, defaults) {
  return Boolean(
    state.tecnica ||
    state.tamanho ||
    state.colecao ||
    state.ano ||
    state.orientacao ||
    state.precoMin !== defaults.precoMin ||
    state.precoMax !== defaults.precoMax
  );
}

function matchesFilters(obra, state) {
  return (
    (!state.tecnica || obra.tecnica === state.tecnica) &&
    (!state.tamanho || getSizeCategory(obra) === state.tamanho) &&
    (!state.colecao || obra.colecao === state.colecao) &&
    (!state.ano || Number(obra.ano) === Number(state.ano)) &&
    (!state.orientacao || obra.orientacao === state.orientacao) &&
    Number(obra.preco) >= state.precoMin &&
    Number(obra.preco) <= state.precoMax
  );
}

function sortObras(obras, order) {
  const sorted = [...obras];
  if (order === 'preco-asc') {
    return sorted.sort((a, b) => Number(a.preco) - Number(b.preco));
  }
  if (order === 'preco-desc') {
    return sorted.sort((a, b) => Number(b.preco) - Number(a.preco));
  }
  return sorted.sort((a, b) => Number(b.ano) - Number(a.ano) || Number(b.id) - Number(a.id));
}

function fillSelect(select, values, currentValue = '') {
  if (!select) return;
  const firstOption = select.querySelector('option[value=""]')?.outerHTML ?? '<option value="">Todas</option>';
  select.innerHTML = firstOption;
  values.forEach(value => {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = value;
    select.appendChild(option);
  });
  select.value = currentValue;
}

function syncPressed(buttons, activeValue, attrName) {
  buttons.forEach(button => {
    const isActive = button.dataset[attrName] === activeValue;
    button.classList.toggle('filter-chip--active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
  });
}

function getInitialColecao(colecoes) {
  const params = new URLSearchParams(window.location.search);
  const preColecao = params.get('colecao');
  if (!preColecao) return '';
  const colecaoSelecionada = colecoes.find(colecao =>
    colecao.id === preColecao || colecao.nome === preColecao
  );
  return colecaoSelecionada?.nome ?? preColecao;
}

export function initFilters({ obras, colecoes, onChange }) {
  const tecnicaSelect = document.getElementById('filter-tecnica');
  const colecaoSelect = document.getElementById('filter-colecao');
  const anoSelect = document.getElementById('filter-ano');
  const sortSelect = document.getElementById('sort-order');
  const minRange = document.getElementById('filter-price-min');
  const maxRange = document.getElementById('filter-price-max');
  const minOutput = document.getElementById('filter-price-min-value');
  const maxOutput = document.getElementById('filter-price-max-value');
  const clearButton = document.getElementById('clear-filters');
  const panel = document.getElementById('filters-panel');
  const toggle = document.getElementById('filters-toggle');
  const sizeButtons = document.querySelectorAll('[data-filter-size]');
  const orientationButtons = document.querySelectorAll('[data-filter-orientation]');

  if (!tecnicaSelect || !colecaoSelect || !anoSelect || !sortSelect || !minRange || !maxRange) {
    onChange(sortObras(obras, 'recentes'));
    return;
  }

  const prices = obras.map(obra => Number(obra.preco));
  const defaults = {
    precoMin: Math.min(...prices),
    precoMax: Math.max(...prices),
  };

  const state = {
    tecnica: '',
    tamanho: '',
    colecao: getInitialColecao(colecoes),
    ano: '',
    precoMin: defaults.precoMin,
    precoMax: defaults.precoMax,
    orientacao: '',
    ordem: 'recentes',
  };

  fillSelect(tecnicaSelect, uniqueSorted(obras.map(obra => obra.tecnica), (a, b) => a.localeCompare(b, 'pt-BR')));
  fillSelect(colecaoSelect, uniqueSorted(colecoes.map(colecao => colecao.nome), (a, b) => a.localeCompare(b, 'pt-BR')), state.colecao);
  fillSelect(anoSelect, uniqueSorted(obras.map(obra => String(obra.ano)), (a, b) => Number(b) - Number(a)));

  [minRange, maxRange].forEach(range => {
    range.min = String(defaults.precoMin);
    range.max = String(defaults.precoMax);
    range.step = '100';
  });
  minRange.value = String(state.precoMin);
  maxRange.value = String(state.precoMax);

  function render() {
    if (state.precoMin > state.precoMax) {
      [state.precoMin, state.precoMax] = [state.precoMax, state.precoMin];
    }

    minRange.value = String(state.precoMin);
    maxRange.value = String(state.precoMax);
    if (minOutput) minOutput.value = formatCurrency(state.precoMin);
    if (maxOutput) maxOutput.value = formatCurrency(state.precoMax);

    syncPressed(sizeButtons, state.tamanho, 'filterSize');
    syncPressed(orientationButtons, state.orientacao, 'filterOrientation');

    if (clearButton) clearButton.hidden = !hasActiveFilters(state, defaults);

    const filtered = obras.filter(obra => matchesFilters(obra, state));
    onChange(sortObras(filtered, state.ordem));
  }

  tecnicaSelect.addEventListener('change', () => {
    state.tecnica = tecnicaSelect.value;
    render();
  });

  colecaoSelect.addEventListener('change', () => {
    state.colecao = colecaoSelect.value;
    render();
  });

  anoSelect.addEventListener('change', () => {
    state.ano = anoSelect.value;
    render();
  });

  sortSelect.addEventListener('change', () => {
    state.ordem = sortSelect.value;
    render();
  });

  minRange.addEventListener('input', () => {
    state.precoMin = Math.min(Number(minRange.value), state.precoMax);
    render();
  });

  maxRange.addEventListener('input', () => {
    state.precoMax = Math.max(Number(maxRange.value), state.precoMin);
    render();
  });

  sizeButtons.forEach(button => {
    button.addEventListener('click', () => {
      const next = SIZE_LABELS.includes(button.dataset.filterSize) ? button.dataset.filterSize : '';
      state.tamanho = state.tamanho === next ? '' : next;
      render();
    });
  });

  orientationButtons.forEach(button => {
    button.addEventListener('click', () => {
      const next = button.dataset.filterOrientation;
      state.orientacao = state.orientacao === next ? '' : next;
      render();
    });
  });

  clearButton?.addEventListener('click', () => {
    state.tecnica = '';
    state.tamanho = '';
    state.colecao = '';
    state.ano = '';
    state.precoMin = defaults.precoMin;
    state.precoMax = defaults.precoMax;
    state.orientacao = '';
    tecnicaSelect.value = '';
    colecaoSelect.value = '';
    anoSelect.value = '';
    render();
  });

  function setPanelCollapsed(collapsed) {
    if (!panel || !toggle) return;
    panel.dataset.collapsed = String(collapsed);
    toggle.setAttribute('aria-expanded', String(!collapsed));
  }

  const mobileMedia = window.matchMedia(MOBILE_QUERY);
  setPanelCollapsed(mobileMedia.matches);
  mobileMedia.addEventListener('change', event => setPanelCollapsed(event.matches));

  toggle?.addEventListener('click', () => {
    const isCollapsed = panel?.dataset.collapsed === 'true';
    setPanelCollapsed(!isCollapsed);
  });

  render();
}
