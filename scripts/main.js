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
const HOME_PAGE_DISPLAY_COUNT = 24; // 1 History + 23 random

// Função para selecionar N itens aleatórios sem repetição
const getRandomItems = (array, count) => {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// Verifica se é a página inicial
const isHomePage = !window.location.pathname.includes('/pages/');

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
  initFilterToggle();
  showLoadingSkeleton();
  initCloudButton();

  // 2. Carregamento de dados
  try {
    const data = await fetchAnimeData();
    
    // Extrai os animes principais e o anime history separadamente
    allAnimes = Array.isArray(data) ? data : data.animes || [];
    const historyAnime = data.history?.[0]; // Pega o primeiro anime de history

    console.log("Total animes:", allAnimes.length);
    console.log("History anime:", historyAnime?.title);

    // 3. Lógica especial para a página inicial
    if (isHomePage) {
      // Filtra animes que não são o history anime (por ID)
      const nonHistoryAnimes = historyAnime 
        ? allAnimes.filter(anime => anime.id !== historyAnime.id)
        : [...allAnimes];

      // Seleciona 23 aleatórios (ou todos se não houver suficientes)
      const randomCount = Math.min(23, nonHistoryAnimes.length);
      const randomAnimes = getRandomItems(nonHistoryAnimes, randomCount);

      // Combina (History primeiro se existir)
      filteredAnimes = historyAnime 
        ? [historyAnime, ...randomAnimes].slice(0, HOME_PAGE_DISPLAY_COUNT)
        : randomAnimes.slice(0, HOME_PAGE_DISPLAY_COUNT);

      console.log("Filtered animes count:", filteredAnimes.length);
      console.log("First anime:", filteredAnimes[0]?.title);

      // Renderiza exatamente HOME_PAGE_DISPLAY_COUNT animes
      renderAnimeGrid(filteredAnimes, 0, HOME_PAGE_DISPLAY_COUNT);
    } 
    // 4. Lógica padrão para outras páginas
    else {
      // Configuração de filtros
      FILTER_CONFIG.forEach(({ id, label, extract, sort }) => {
        const options = extractUniqueOptions(allAnimes, extract, sort);
        const select = createFilterSelect(id, label, options);
        
        select.addEventListener('change', () => {
          filteredAnimes = applyFilters(allAnimes, getCurrentFilters());
          renderAnimeGrid(filteredAnimes, 0, HOME_PAGE_DISPLAY_COUNT);
        });
      });

      // Configuração da busca
      initSearch(allAnimes, (results) => {
        filteredAnimes = results;
        renderAnimeGrid(filteredAnimes, 0, HOME_PAGE_DISPLAY_COUNT);
      });

      // Carregamento lazy (apenas em páginas não-iniciais)
      setupIntersectionObserver(() => {
        const currentCount = document.querySelectorAll('.anime-card').length;
        if (filteredAnimes.length > currentCount) {
          renderAnimeGrid(
            filteredAnimes, 
            currentCount, 
            HOME_PAGE_DISPLAY_COUNT
          );
        }
      });

      // Renderização inicial
      filteredAnimes = [...allAnimes];
      renderAnimeGrid(filteredAnimes, 0, HOME_PAGE_DISPLAY_COUNT);
    }
  } catch (error) {
    console.error("Falha ao carregar animes:", error);
    document.getElementById('animeGrid').innerHTML = `
      <div class="error-message">
        <i class="fas fa-exclamation-triangle"></i>
        <p>Falha ao carregar animes. Recarregue a página.</p>
        ${error.message ? `<small>${error.message}</small>` : ''}
      </div>
    `;
  }
})();

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

// Debug
if (import.meta.env?.MODE === 'development') {
  window._debug = { 
    allAnimes: () => allAnimes,
    filteredAnimes: () => filteredAnimes,
    reloadData: async () => {
      allAnimes = await fetchAnimeData();
      console.log("Data reloaded");
    }
  };
}
