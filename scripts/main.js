import { fetchAnimeData } from './modules/api.js';
import { initMobileMenu, createEnhancedFilterSelect } from './modules/dom.js'; // Atualizado para createEnhancedFilterSelect
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

// Funções auxiliares LOCAIS atualizadas
const extractUniqueOptions = (animes, extractFn, sortFn) => {
  const optionsMap = new Map();
  
  animes.forEach(anime => {
    const items = extractFn(anime) || [];
    items.forEach(item => {
      if (!optionsMap.has(item.value)) {
        optionsMap.set(item.value, item);
      }
    });
  });
  
  const options = Array.from(optionsMap.values());
  return sortFn ? options.sort(sortFn) : options;
};

const getCurrentFilters = () => {
  return FILTER_CONFIG.reduce((acc, { id, isMultiSelect }) => {
    const select = document.getElementById(id);
    if (select) {
      if (isMultiSelect) {
        // Para selects múltiplos (como gêneros e estúdios)
        acc[id] = Array.from(select.selectedOptions).map(opt => opt.value);
      } else {
        // Para selects simples
        acc[id] = select.value ? [select.value] : [];
      }
    }
    return acc;
  }, {});
};

// Função principal
(async function initApp() {
  // 1. Inicialização do DOM
  initMobileMenu();
  showLoadingSkeleton();
  initCloudButton();

  // 2. Carregamento de dados
  allAnimes = await fetchAnimeData();
  console.log("Dados carregados:", allAnimes.length, "animes");

  // 3. Configuração de filtros aprimorados
  FILTER_CONFIG.forEach(({ id, label, extract, sort, isMultiSelect, searchable, description }) => {
    const options = extractUniqueOptions(allAnimes, extract, sort);
    
    const select = createEnhancedFilterSelect({
      id,
      label,
      options,
      isMultiSelect,
      searchable,
      description
    });
    
    select.addEventListener('change', () => {
      filteredAnimes = applyFilters(allAnimes, getCurrentFilters());
      currentChunk = 0;
      renderAnimeGrid(filteredAnimes, 0, CHUNK_SIZE);
      
      // Atualizar contadores (opcional)
      updateFilterCounters();
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
  
  // 7. Inicializar contadores de filtros (opcional)
  updateFilterCounters();
})();

// Função para atualizar contadores nos filtros (UX melhorado)
function updateFilterCounters() {
  const activeFilters = getCurrentFilters();
  
  FILTER_CONFIG.forEach(({ id }) => {
    const filterElement = document.getElementById(`${id}-filter`);
    if (!filterElement) return;
    
    const counterElement = filterElement.querySelector('.filter-counter');
    if (counterElement) {
      const count = activeFilters[id]?.length || 0;
      counterElement.textContent = count > 0 ? `(${count})` : '';
      counterElement.style.display = count > 0 ? 'inline' : 'none';
    }
  });
}

// Exposição para debug (opcional)
if (import.meta.env?.MODE === 'development') {
  window._debug = { 
    allAnimes: () => allAnimes,
    filteredAnimes: () => filteredAnimes,
    currentFilters: getCurrentFilters
  };
}
