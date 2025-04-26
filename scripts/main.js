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
import { fetchAnimeData } from './modules/api.js';
import { initMobileMenu, createFilterSelect, initFilterToggle } from './modules/dom.js';
import { FILTER_CONFIG, applyFilters } from './modules/filters.js';
import { renderAnimeGrid, showLoadingSkeleton } from './modules/render.js';
import { initSearch } from './modules/search.js';
import { setupIntersectionObserver } from './modules/utils.js';
import { initCloudButton } from './modules/cloud.js';

// Configurações
const HOME_PAGE_DISPLAY_COUNT = 24;
const HISTORY_GENRE = 'history';

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
    const rawData = await fetchAnimeData();
    console.log('Dados brutos recebidos:', rawData);

    // Processa estrutura de dados
    let historyAnime = null;
    
    // Caso 1: Dados com propriedade history separada
    if (rawData && rawData.history && Array.isArray(rawData.history)) {
      console.log('Estrutura com history separado detectada');
      historyAnime = rawData.history[0];
      allAnimes = Array.isArray(rawData.animes) ? rawData.animes : [];
      
      // Garante que o history anime esteja na lista principal
      if (historyAnime && !allAnimes.some(a => a.id === historyAnime.id)) {
        allAnimes.unshift(historyAnime);
      }
    } 
    // Caso 2: Array simples
    else if (Array.isArray(rawData)) {
      console.log('Estrutura de array simples detectada');
      allAnimes = rawData;
      historyAnime = allAnimes.find(anime => 
        anime.genres?.some(g => g.name.toLowerCase().includes(HISTORY_GENRE))
      );
    } 
    // Caso 3: Estrutura inválida
    else {
      throw new Error('Formato de dados inválido');
    }

    console.log('Total de animes:', allAnimes.length);
    console.log('Anime history encontrado:', historyAnime);

    // Página inicial - Lógica especial
    if (isHomePage) {
      // Filtra animes não-history
      const nonHistoryAnimes = historyAnime
        ? allAnimes.filter(anime => anime.id !== historyAnime.id)
        : [...allAnimes];

      // Seleciona aleatórios
      const randomCount = Math.min(23, nonHistoryAnimes.length);
      const randomAnimes = getRandomItems(nonHistoryAnimes, randomCount);

      // Combina os resultados
      filteredAnimes = historyAnime
        ? [historyAnime, ...randomAnimes].slice(0, HOME_PAGE_DISPLAY_COUNT)
        : randomAnimes.slice(0, HOME_PAGE_DISPLAY_COUNT);

      console.log('Lista final:', {
        total: filteredAnimes.length,
        primeiro: filteredAnimes[0]?.title,
        historyPresente: filteredAnimes.some(a => a.id === historyAnime?.id)
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
    console.error('Erro crítico:', error);
    document.getElementById('animeGrid').innerHTML = `
      <div class="error-message">
        <i class="fas fa-exclamation-triangle"></i>
        <h3>Erro ao carregar conteúdo</h3>
        <p>${error.message}</p>
        <button onclick="window.location.reload()">Recarregar</button>
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
      allAnimes = await fetchAnimeData();
      console.log('Dados recarregados');
    },
    findHistory: () => allAnimes.find(a => 
      a.id === allAnimes.history?.[0]?.id || 
      a.genres?.some(g => g.name.toLowerCase().includes(HISTORY_GENRE))
    )
  };
}
