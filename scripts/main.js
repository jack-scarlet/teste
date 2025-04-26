import { fetchAnimeData } from './modules/api.js';
import { initMobileMenu, createFilterSelect, initFilterToggle } from './modules/dom.js';
import { FILTER_CONFIG, applyFilters } from './modules/filters.js';
import { renderAnimeGrid, showLoadingSkeleton } from './modules/render.js';
import { initSearch } from './modules/search.js';
import { setupIntersectionObserver } from './modules/utils.js';
import { initCloudButton } from './modules/cloud.js';

// Configurações
const HOME_PAGE_DISPLAY_COUNT = 24;
const HISTORY_KEY = 'history';

// Estado global
let allAnimes = [];
let filteredAnimes = [];

// Funções auxiliares
const getRandomItems = (array, count) => {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

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
  // Inicialização
  initMobileMenu();
  initFilterToggle();
  showLoadingSkeleton();
  initCloudButton();

  try {
    // Carrega dados
    const response = await fetchAnimeData();
    console.log('Resposta completa da API:', response);

    // Extrai os animes principais e o history
    allAnimes = Array.isArray(response) ? response : response.animes || [];
    const historyAnime = response[HISTORY_KEY]?.[0];
    
    console.log('Total de animes:', allAnimes.length);
    console.log('Anime history:', historyAnime);

    // Verifica se o history anime existe na lista principal
    if (historyAnime) {
      const existsInMainList = allAnimes.some(a => a.id === historyAnime.id);
      console.log('History anime existe na lista principal?', existsInMainList);
      
      if (!existsInMainList) {
        allAnimes.unshift(historyAnime); // Adiciona no início se não existir
        console.log('History anime adicionado à lista principal');
      }
    }

    // Página inicial - Lógica especial
    if (isHomePage) {
      // Filtra animes não-history (por ID)
      const nonHistoryAnimes = historyAnime
        ? allAnimes.filter(anime => anime.id !== historyAnime.id)
        : [...allAnimes];

      // Seleciona aleatórios
      const randomCount = Math.min(23, nonHistoryAnimes.length);
      const randomAnimes = getRandomItems(nonHistoryAnimes, randomCount);

      // Combina os resultados (history primeiro se existir)
      filteredAnimes = historyAnime
        ? [historyAnime, ...randomAnimes].slice(0, HOME_PAGE_DISPLAY_COUNT)
        : randomAnimes.slice(0, HOME_PAGE_DISPLAY_COUNT);

      console.log('Lista final para renderização:', {
        total: filteredAnimes.length,
        primeiro: filteredAnimes[0]?.title,
        historyId: historyAnime?.id,
        historyPresente: historyAnime ? filteredAnimes[0]?.id === historyAnime.id : false
      });

      // Renderização
      renderAnimeGrid(filteredAnimes, 0, HOME_PAGE_DISPLAY_COUNT);
    } 
    // Outras páginas - Lógica normal
    else {
      // Configura filtros
      FILTER_CONFIG.forEach(({ id, label, extract, sort }) => {
        const options = extractUniqueOptions(allAnimes, extract, sort);
        const select = createFilterSelect(id, label, options);
        
        select.addEventListener('change', () => {
          filteredAnimes = applyFilters(allAnimes, getCurrentFilters());
          renderAnimeGrid(filteredAnimes, 0, HOME_PAGE_DISPLAY_COUNT);
        });
      });

      // Configura busca
      initSearch(allAnimes, (results) => {
        filteredAnimes = results;
        renderAnimeGrid(filteredAnimes, 0, HOME_PAGE_DISPLAY_COUNT);
      });

      // Lazy loading
      setupIntersectionObserver(() => {
        const currentCount = document.querySelectorAll('.anime-card').length;
        if (filteredAnimes.length > currentCount) {
          renderAnimeGrid(filteredAnimes, currentCount, HOME_PAGE_DISPLAY_COUNT);
        }
      });

      // Renderização inicial
      filteredAnimes = [...allAnimes];
      renderAnimeGrid(filteredAnimes, 0, HOME_PAGE_DISPLAY_COUNT);
    }
  } catch (error) {
    console.error('Erro ao carregar dados:', error);
    document.getElementById('animeGrid').innerHTML = `
      <div class="error-message">
        <i class="fas fa-exclamation-triangle"></i>
        <h3>Erro ao carregar conteúdo</h3>
        <p>${error.message}</p>
        <button onclick="window.location.reload()">Recarregar Página</button>
      </div>
    `;
  }
})();

// Função para extrair opções de filtro
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
  return Array.from(options.values()).sort(sortFn);
};

// Ferramentas de debug
if (import.meta.env?.MODE === 'development') {
  window._anitsuDebug = {
    getData: () => ({ allAnimes, filteredAnimes }),
    reload: async () => {
      const newData = await fetchAnimeData();
      console.log('Dados recarregados:', newData);
      return newData;
    },
    findHistory: () => allAnimes.find(a => a.id === allAnimes.history?.[0]?.id)
  };
}
