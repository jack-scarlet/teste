import { fetchAnimeData, cacheData, getCachedData } from './modules/api.js';
import { initMobileMenu, createFilterSelect } from './modules/dom.js';
import { FILTER_CONFIG, applyFilters } from './modules/filters.js';
import { renderAnimeGrid, showLoadingSkeleton } from './modules/render.js';
import { initSearch } from './modules/search.js';
import { setupIntersectionObserver } from './modules/utils.js';

// Estado global
let allAnimes = [];
let filteredAnimes = [];
let currentChunk = 0;
const CHUNK_SIZE = 30;

(async function initApp() {
  // 1. Inicializa componentes DOM
  initMobileMenu();
  showLoadingSkeleton();

  // 2. Carrega dados
  allAnimes = getCachedData() || await fetchAnimeData();
  if (allAnimes) cacheData(allAnimes);

  // 3. Inicializa filtros
  FILTER_CONFIG.forEach(({ id, label, extract }) => {
    const options = extractUniqueOptions(allAnimes, extract);
    const select = createFilterSelect(id, label, options);
    
    select.addEventListener('change', () => {
      const filters = getCurrentFilters();
      filteredAnimes = applyFilters(allAnimes, filters);
      currentChunk = 0;
      renderAnimeGrid(filteredAnimes, 0, CHUNK_SIZE);
    });
  });

  // 4. Inicializa busca
  initSearch(allAnimes, (results) => {
    filteredAnimes = results;
    currentChunk = 0;
    renderAnimeGrid(filteredAnimes, 0, CHUNK_SIZE);
  });

  // 5. Carregamento lazy
  setupIntersectionObserver(() => {
    currentChunk += 1;
    renderAnimeGrid(
      filteredAnimes, 
      currentChunk * CHUNK_SIZE, 
      CHUNK_SIZE
    );
  });

  // 6. Primeiro render
  filteredAnimes = [...allAnimes];
  renderAnimeGrid(filteredAnimes, 0, CHUNK_SIZE);
})();

// Funções auxiliares locais
function extractUniqueOptions(animes, extractFn) {
  const options = new Set();
  animes.forEach(anime => {
    const items = extractFn(anime) || [];
    items.forEach(item => options.add(item.value));
  });
  return Array.from(options).map(value => ({ value, label: value }));
}

function getCurrentFilters() {
  return FILTER_CONFIG.reduce((acc, { id }) => {
    const select = document.getElementById(id);
    if (select) acc[id] = select.value;
    return acc;
  }, {});
}

// scripts/main.js
async function initApp() {
  // Carrega dados diretamente SEM cache
  const allAnimes = await fetchAnimeData();
  renderAnimeGrid(allAnimes);
  
  // Debug opcional (remove em produção)
  console.log("Total de animes:", allAnimes.length);
}
