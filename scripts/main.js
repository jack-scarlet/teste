// main.js - Versão final com correção de integração busca/filtros

import { fetchAnimeData } from './modules/api.js';
import { initMobileMenu, initFilterToggle } from './modules/dom.js';
import { FILTER_CONFIG, applyFilters, extractUniqueOptions } from './modules/filters.js';
import { renderAnimeGrid, showLoadingSkeleton } from './modules/render.js';
import { initSearch, displayNoResultsMessage, removeNoResultsMessage, applySearch } from './modules/search.js';
import { setupIntersectionObserver, normalizeString } from './modules/utils.js';
import { initCloudButton } from './modules/cloud.js';

// Configurações
const ANIMES_PER_PAGE = 24;
const INITIAL_RANDOM_COUNT = 23;

// Estado global
let allAnimes = [];
let filteredAnimes = [];
let currentPage = 1;
let isFetching = false;

// Filtros
const currentFilters = {
  category: null,
  nationality: null,
  genre: null,
  season: null,
  year: null,
  mediaType: null,
  studio: null,
  searchTerm: null
};

// Funções auxiliares
const getRandomItems = (array, count) => {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

const isHomePage = !window.location.pathname.includes('/pages/');

const processAnimeData = (data) => {
  let animeList = [];
  let lastAnime = null;

  if (Array.isArray(data)) {
    animeList = [...data];
    lastAnime = data[data.length - 1];
  } else {
    const validCategories = ['#','0','1','2','3','4','5','6','7','8','9','A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];
    validCategories.forEach(category => {
      if (Array.isArray(data[category])) {
        animeList = [...animeList, ...data[category]];
      }
    });
    const lastCategory = validCategories[validCategories.length - 1];
    if (Array.isArray(data[lastCategory]) && data[lastCategory].length > 0) {
      lastAnime = data[lastCategory][data[lastCategory].length - 1];
    }
  }

  return { animeList, lastAnime };
};

// Função para verificar match de categoria
function checkCategoryMatch(title, category) {
  if (!title) return false;
  const firstChar = title.trim()[0].toUpperCase();
  
  if (category === '#') {
    return !/^[A-Z]/.test(firstChar);
  } else {
    return firstChar === category;
  }
}

// Limpa completamente os resultados antes de aplicar novos filtros
function clearResults() {
  const animeGrid = document.getElementById('animeGrid');
  animeGrid.innerHTML = '';
  removeNoResultsMessage();
}

// Atualiza todos os filtros e renderiza os resultados
function updateFilters() {
  clearResults(); // Limpa os resultados antes de aplicar novos filtros
  
  // Aplica busca primeiro se houver termo
  let results = currentFilters.searchTerm 
    ? applySearch(allAnimes, currentFilters.searchTerm)
    : [...allAnimes];

  // Aplica os demais filtros
  filteredAnimes = results.filter(anime => {
    const matchesCategory = !currentFilters.category || 
      (anime.title && checkCategoryMatch(anime.title, currentFilters.category));
    
    const matchesNationality = !currentFilters.nationality || 
      anime.nat === currentFilters.nationality || 
      anime.dub === currentFilters.nationality;
    
    const matchesGenre = !currentFilters.genre || 
      (anime.genres && anime.genres.some(g => g.name === currentFilters.genre));
    
    const matchesYear = !currentFilters.year || 
      (anime.start_season && anime.start_season.year === parseInt(currentFilters.year));
    
    const matchesSeason = !currentFilters.season || 
      (anime.start_season && anime.start_season.season === currentFilters.season);
    
    const matchesMediaType = !currentFilters.mediaType || 
      anime.media_type === currentFilters.mediaType;
    
    const matchesStudio = !currentFilters.studio || 
      (anime.studios && anime.studios.some(s => s.name === currentFilters.studio));

    return matchesCategory && matchesNationality && matchesGenre && 
           matchesYear && matchesSeason && matchesMediaType && matchesStudio;
  });

  // Atualiza a exibição
  if (filteredAnimes.length === 0) {
    if (currentFilters.searchTerm) {
      displayNoResultsMessage(currentFilters.searchTerm);
    } else {
      const activeFilters = Object.entries(currentFilters)
        .filter(([_, value]) => value)
        .map(([key]) => key);
      
      if (activeFilters.length > 0) {
        document.getElementById('animeGrid').innerHTML = `
          <div class="no-results">
            <p>Nenhum anime encontrado com os filtros aplicados</p>
          </div>
        `;
      }
    }
  } else {
    currentPage = 1;
    renderAnimeGrid(filteredAnimes, 0, ANIMES_PER_PAGE);
  }

  updateSearchStatus();
}

// Atualiza a mensagem de status
function updateSearchStatus() {
  const searchStatus = document.getElementById('searchStatus');
  if (!searchStatus) return;
  
  if (currentFilters.searchTerm) {
    searchStatus.textContent = filteredAnimes.length > 0 
      ? `Exibindo ${filteredAnimes.length} resultados para "${currentFilters.searchTerm}"`
      : `Nenhum resultado para "${currentFilters.searchTerm}"`;
  } else if (currentFilters.category) {
    searchStatus.textContent = `Exibindo ${filteredAnimes.length} animes da categoria "${currentFilters.category}"`;
  } else {
    const activeFilters = Object.entries(currentFilters)
      .filter(([key, value]) => value && key !== 'searchTerm' && key !== 'category');
    
    if (activeFilters.length > 0) {
      searchStatus.textContent = `Exibindo ${filteredAnimes.length} animes com os filtros aplicados`;
    } else {
      searchStatus.textContent = '';
    }
  }
}

function renderFiltersFromConfig() {
  const filtersContainer = document.getElementById('filters');

  FILTER_CONFIG.forEach(filter => {
    const options = extractUniqueOptions(allAnimes, filter);

    const select = document.createElement('select');
    select.id = filter.id;
    select.className = 'filter-select';
    select.innerHTML = `
      <option value="">Todos</option>
      ${options.map(opt => `<option value="${opt.value}">${opt.label}</option>`).join('')}
    `;

    select.addEventListener('change', () => {
      currentFilters[filter.id] = select.value || null;
      updateFilters();
    });

    const container = document.createElement('div');
    container.className = 'filter-container';
    container.innerHTML = `<label for="${filter.id}">${filter.label}</label>`;
    container.appendChild(select);

    filtersContainer.appendChild(container);
  });
}

function showError(error) {
  document.getElementById('animeGrid').innerHTML = `
    <div class="error-message">
      <i class="fas fa-exclamation-triangle"></i>
      <h3>Erro ao carregar conteúdo</h3>
      <p>${error.message}</p>
      <button onclick="window.location.reload()">Recarregar Página</button>
    </div>
  `;
}

function initMenuButton() {
  const menuButton = document.getElementById('menuButton');
  const menuCategories = document.getElementById('menuCategories');
  const filterButton = document.getElementById('toggleFilter');
  const filtersContainer = document.getElementById('filters');
  
  const categories = ['#', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
                     'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

  // Cria botões para cada categoria
  categories.forEach(category => {
    const button = document.createElement('button');
    button.className = 'categoria-botao';
    button.textContent = category;
    button.addEventListener('click', () => {
      currentFilters.category = category;
      updateFilters();
      closeAllPanels();
    });
    menuCategories.appendChild(button);
  });

  // Função para fechar todos os painéis
  function closeAllPanels() {
    menuCategories.classList.remove('visible');
    filtersContainer.classList.remove('visible');
    menuButton.classList.remove('active');
    filterButton.classList.remove('active');
    resetIcons();
  }

  // Alterna visibilidade do painel de menu
  menuButton.addEventListener('click', () => {
    if (menuCategories.classList.contains('visible')) {
      closeAllPanels();
    } else {
      closeAllPanels();
      menuCategories.classList.add('visible');
      menuButton.classList.add('active');
      menuButton.querySelector('i').classList.replace('fa-bars', 'fa-times');
    }
  });

  // Alterna visibilidade do painel de filtros
  filterButton.addEventListener('click', () => {
    if (filtersContainer.classList.contains('visible')) {
      closeAllPanels();
    } else {
      closeAllPanels();
      filtersContainer.classList.add('visible');
      filterButton.classList.add('active');
      filterButton.querySelector('i').classList.replace('fa-filter', 'fa-times');
    }
  });

  // Fecha painéis ao clicar fora
  document.addEventListener('click', (e) => {
    if (!menuButton.contains(e.target) && !menuCategories.contains(e.target) &&
        !filterButton.contains(e.target) && !filtersContainer.contains(e.target)) {
      closeAllPanels();
    }
  });

  // Função para resetar ícones
  function resetIcons() {
    menuButton.querySelector('i').classList.replace('fa-times', 'fa-bars');
    filterButton.querySelector('i').classList.replace('fa-times', 'fa-filter');
  }
}

function initHomeButton() {
  const homeButton = document.getElementById('homeButton');
  
  homeButton.addEventListener('click', () => {
    // Resetar todos os filtros
    Object.keys(currentFilters).forEach(key => {
      currentFilters[key] = null;
    });
    
    // Resetar selects de filtro
    document.querySelectorAll('.filter-select').forEach(select => {
      select.value = '';
    });
    
    // Resetar busca
    const searchInput = document.getElementById('searchInput');
    searchInput.value = '';
    removeNoResultsMessage();
    
    // Se for home page, mostrar os animes aleatórios + featured
    if (isHomePage) {
      const nonLastAnimes = allAnimes.filter(anime => !anime.isFeatured);
      const randomAnimes = getRandomItems(nonLastAnimes, INITIAL_RANDOM_COUNT);
      const featuredAnime = allAnimes.find(anime => anime.isFeatured);
      
      filteredAnimes = featuredAnime ? [featuredAnime, ...randomAnimes] : randomAnimes;
    } else {
      // Se não for home page, mostrar todos os animes
      filteredAnimes = [...allAnimes];
    }
    
    // Renderizar grid
    currentPage = 1;
    renderAnimeGrid(filteredAnimes, 0, ANIMES_PER_PAGE);
    
    // Resetar status
    updateSearchStatus();
  });
}

// Inicializa a aplicação
(async function initApp() {
  initMobileMenu();
  initFilterToggle();
  showLoadingSkeleton();
  initHomeButton();
  initCloudButton();
  initMenuButton();

  try {
    const response = await fetchAnimeData();
    const { animeList, lastAnime } = processAnimeData(response);
    allAnimes = animeList;

    renderFiltersFromConfig();

    // Inicializa a busca
    initSearch(allAnimes, (searchTerm) => {
      currentFilters.searchTerm = searchTerm;
      updateFilters();
    });

    if (isHomePage) {
      const nonLastAnimes = lastAnime ? allAnimes.filter(anime => anime.id !== lastAnime.id) : [...allAnimes];
      const randomAnimes = getRandomItems(nonLastAnimes, INITIAL_RANDOM_COUNT);

      filteredAnimes = lastAnime ? [lastAnime, ...randomAnimes] : randomAnimes;

      if (lastAnime) {
        lastAnime.isFeatured = true;
      }

      renderAnimeGrid(filteredAnimes, 0, ANIMES_PER_PAGE);
    } else {
      setupIntersectionObserver(() => {
        if (isFetching) return;
        const currentCount = document.querySelectorAll('.anime-card').length;
        if (currentCount < filteredAnimes.length) {
          isFetching = true;
          renderAnimeGrid(filteredAnimes, currentCount, ANIMES_PER_PAGE);
          isFetching = false;
        }
      });

      filteredAnimes = [...allAnimes];
      renderAnimeGrid(filteredAnimes, 0, ANIMES_PER_PAGE);
    }
  } catch (error) {
    console.error('Erro ao carregar dados:', error);
    showError(error);
  }
})();

// Debug em desenvolvimento
if (import.meta.env?.MODE === 'development') {
  window._anitsuDebug = {
    getData: () => ({ allAnimes, filteredAnimes, currentFilters }),
    reload: async () => {
      const newData = await fetchAnimeData();
      console.log('Dados recarregados:', newData);
      return newData;
    }
  };
}
