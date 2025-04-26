import { fetchAnimeData } from './modules/api.js';
import { initMobileMenu, createFilterSelect, initFilterToggle } from './modules/dom.js';
import { FILTER_CONFIG, applyFilters } from './modules/filters.js';
import { renderAnimeGrid, showLoadingSkeleton } from './modules/render.js';
import { initSearch } from './modules/search.js';
import { setupIntersectionObserver } from './modules/utils.js';
import { initCloudButton } from './modules/cloud.js';

// Estado global
let allAnimes = [];
let filteredAnimes = [];
let currentChunk = 0;
const CHUNK_SIZE = 30;

// Função auxiliar para extrair opções únicas com ordenação
const extractUniqueOptions = (animes, extractFn, sortFn) => {
  const options = new Map();
  animes.forEach(anime => {
    const items = extractFn(anime) || [];
    items.forEach(item => {
      if (!options.has(item.value)) {
        options.set(item.value, item);
      }
    });
  });
  const sortedOptions = Array.from(options.values());
  return sortFn ? sortedOptions.sort(sortFn) : sortedOptions;
};

const getCurrentFilters = () => {
  return FILTER_CONFIG.reduce((acc, { id }) => {
    const select = document.getElementById(id);
    if (select) acc[id] = select.value;
    return acc;
  }, {});
};

// Função principal
(async function initApp() {
  // 1. Inicialização do DOM
  initMobileMenu();
  initFilterToggle(); // Inicializa o botão de filtro (mostrar/ocultar)
  showLoadingSkeleton();
  initCloudButton();

  // 2. Carregamento de dados
  allAnimes = await fetchAnimeData();
  console.log("Dados carregados:", allAnimes.length, "animes");

  // 3. Configuração de filtros simplificados
  FILTER_CONFIG.forEach(({ id, label, extract, sort }) => {
    const options = extractUniqueOptions(allAnimes, extract, sort);
    const select = createFilterSelect(id, label, options);
    
    select.addEventListener('change', () => {
      filteredAnimes = applyFilters(allAnimes, getCurrentFilters());
      currentChunk = 0;
      renderAnimeGrid(filteredAnimes, 0, CHUNK_SIZE);
    });
  });

  // 4. Configuração da busca
  initSearch(allAnimes, (results) => {
    filteredAnimes = results;
    currentChunk = 0;
    renderAnimeGrid(filteredAnimes, 0, CHUNK_SIZE);
  });

  // 5. Carregamento lazy
  setupIntersectionObserver(() => {
    if (filteredAnimes.length > currentChunk * CHUNK_SIZE) {
      currentChunk += 1;
      renderAnimeGrid(filteredAnimes, currentChunk * CHUNK_SIZE, CHUNK_SIZE);
    }
  });

  // 6. Renderização inicial
  filteredAnimes = [...allAnimes];
  renderAnimeGrid(filteredAnimes, 0, CHUNK_SIZE);
})();

// Debug
if (import.meta.env?.MODE === 'development') {
  window._debug = { allAnimes: () => allAnimes };
}
