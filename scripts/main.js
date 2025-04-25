import { fetchAnimeData } from './modules/api.js'; // Removidas cacheData/getCachedData
import { initMobileMenu, createFilterSelect } from './modules/dom.js';
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

// Funções auxiliares LOCAIS
const extractUniqueOptions = (animes, extractFn) => {
  const options = new Set();
  animes.forEach(anime => {
    const items = extractFn(anime) || [];
    items.forEach(item => options.add(item.value));
  });
  return Array.from(options).map(value => ({ value, label: value }));
};

const getCurrentFilters = () => {
  return FILTER_CONFIG.reduce((acc, { id }) => {
    const select = document.getElementById(id);
    if (select) acc[id] = select.value;
    return acc;
  }, {});
};

// Função principal ÚNICA
(async function initApp() {
  // 1. Inicialização do DOM
  initMobileMenu();
  showLoadingSkeleton();
  initCloudButton(); // Inicializa o botão da nuvem

  // 2. Carregamento de dados (SEM cache)
  allAnimes = await fetchAnimeData();
  console.log("Dados carregados:", allAnimes.length, "animes"); // Debug

  // 3. Configuração de filtros
  FILTER_CONFIG.forEach(({ id, label, extract }) => {
    const select = createFilterSelect(
      id, 
      label, 
      extractUniqueOptions(allAnimes, extract)
    );
    
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

// Exposição para debug (opcional)
if (import.meta.env?.MODE === 'development') {
  window._debug = { allAnimes: () => allAnimes };
}
