import { fetchAnimeData } from './modules/api.js';
import { initMobileMenu, createFilterSelect, initFilterToggle } from './modules/dom.js';
import { FILTER_CONFIG, applyFilters } from './modules/filters.js';
import { renderAnimeGrid, showLoadingSkeleton } from './modules/render.js';
import { initSearch } from './modules/search.js';
import { setupIntersectionObserver } from './modules/utils.js';
import { initCloudButton } from './modules/cloud.js';

// Configurações
const HOME_PAGE_DISPLAY_COUNT = 24;

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

// Processa estrutura complexa do JSON
const processAnimeData = (data) => {
  let animeList = [];
  let historyAnime = null;

  // Caso 1: Dados são um array direto
  if (Array.isArray(data)) {
    animeList = [...data];
    historyAnime = data.find(anime => 
      anime.genres?.some(g => g.name.toLowerCase().includes('history'))
    );
  } 
  // Caso 2: Dados são objeto com categorias
  else {
    // Compila animes de todas as categorias
    const validCategories = [
      '#', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
      'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
      'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'
    ];

    validCategories.forEach(category => {
      if (data[category] && Array.isArray(data[category])) {
        animeList = [...animeList, ...data[category]];
      }
    });

    // Pega anime history
    historyAnime = data.history?.[0];
  }

  return { animeList, historyAnime };
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
    console.log('Estrutura dos dados recebidos:', response);

    // Processa os dados
    const { animeList, historyAnime } = processAnimeData(response);
    allAnimes = animeList;
    
    console.log('Total de animes:', allAnimes.length);
    console.log('Anime history:', historyAnime);

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

      console.log('Lista final:', {
        total: filteredAnimes.length,
        primeiro: filteredAnimes[0]?.title,
        historyId: historyAnime?.id,
        historyPresente: historyAnime ? filteredAnimes[0]?.id === historyAnime.id : false,
        sample: filteredAnimes.slice(0, 3).map(a => a.title)
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
        <small>Verifique o console (F12) para detalhes</small>
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
