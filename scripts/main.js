// main.js corrigido para funcionar a busca na home

import { fetchAnimeData } from './modules/api.js';
import { initMobileMenu, initFilterToggle } from './modules/dom.js';
import { FILTER_CONFIG, applyFilters } from './modules/filters.js';
import { renderAnimeGrid, showLoadingSkeleton } from './modules/render.js';
import { initSearch } from './modules/search.js';
import { setupIntersectionObserver } from './modules/utils.js';
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
  studio: null
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

const applyAllFilters = (animes) => {
  return animes.filter(anime => {
    const matchesCategory = !currentFilters.category || (anime.category && anime.category === currentFilters.category);
    const matchesNationality = !currentFilters.nationality || anime.nat === currentFilters.nationality;
    const matchesGenre = !currentFilters.genre || (anime.genres && anime.genres.some(g => g.name === currentFilters.genre));
    const matchesSeason = !currentFilters.season || (anime.start_season && anime.start_season.season === currentFilters.season);
    const matchesYear = !currentFilters.year || (anime.start_season && anime.start_season.year === parseInt(currentFilters.year));
    const matchesMediaType = !currentFilters.mediaType || anime.media_type === currentFilters.mediaType;
    const matchesStudio = !currentFilters.studio || (anime.studios && anime.studios.some(s => s.name === currentFilters.studio));

    return matchesCategory && matchesNationality && matchesGenre && matchesSeason && matchesYear && matchesMediaType && matchesStudio;
  });
};

function renderFiltersFromConfig() {
  const filtersContainer = document.getElementById('filters');

  FILTER_CONFIG.forEach(filter => {
    const options = extractUniqueOptions(allAnimes, filter);

    const select = document.createElement('select');
    select.id = filter.id;
    select.className = 'filter-select';
    select.innerHTML = `
      <option value="">Todos ${filter.label.toLowerCase()}</option>
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

function extractUniqueOptions(animes, filterConfig) {
  const options = new Set();
  animes.forEach(anime => {
    const extracted = filterConfig.extract(anime);
    extracted.forEach(opt => options.add(JSON.stringify(opt)));
  });
  return Array.from(options).map(opt => JSON.parse(opt)).sort(filterConfig.sort || ((a, b) => a.label.localeCompare(b.label)));
}

function updateFilters() {
  filteredAnimes = applyAllFilters(allAnimes);
  currentPage = 1;
  renderAnimeGrid(filteredAnimes, 0, filteredAnimes.length); // ✅ Todos os resultados
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

(async function initApp() {
  initMobileMenu();
  initFilterToggle();
  showLoadingSkeleton();
  initCloudButton();
  initMenuButton();

  try {
    const response = await fetchAnimeData();
    const { animeList, lastAnime } = processAnimeData(response);
    allAnimes = animeList;

    renderFiltersFromConfig();

    // Sempre inicializar busca
    initSearch(allAnimes, (searchResults) => {
  filteredAnimes = applyAllFilters(searchResults);
  currentPage = 1;
  renderAnimeGrid(filteredAnimes, 0, filteredAnimes.length); // ✅ Todos os resultados

  const searchInput = document.getElementById('searchInput');
  if (searchInput.value.trim()) {
    document.getElementById('searchStatus').textContent =
      `Exibindo ${filteredAnimes.length} resultados`;
  }
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

      filteredAnimes = applyAllFilters(allAnimes);
      renderAnimeGrid(filteredAnimes, 0, ANIMES_PER_PAGE);
    }

  } catch (error) {
    console.error('Erro ao carregar dados:', error);
    showError(error);
  }
})();

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

function initMenuButton() {
  const menuButton = document.getElementById('menuButton');
  const menuCategories = document.getElementById('menuCategories');
  
  const categories = ['#', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
                      'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

  // Cria botões para cada categoria
  categories.forEach(category => {
    const button = document.createElement('button');
    button.className = 'botao categoria-botao';
    button.textContent = category;
    button.addEventListener('click', () => {
      filterByCategory(category);
      menuCategories.classList.add('hidden'); // fecha o painel depois de clicar
    });
    menuCategories.appendChild(button);
  });

  // Alterna visibilidade do painel ao clicar no botão "Menu"
  menuButton.addEventListener('click', () => {
    menuCategories.classList.toggle('hidden');
  });
}

// Filtra animes por categoria/letra
function filterByCategory(category) {
  filteredAnimes = allAnimes.filter(anime => {
    if (!anime.title) return false;
    const firstChar = anime.title.trim()[0].toUpperCase();
    if (category === '#') {
      return !/^[A-Z]/.test(firstChar);
    } else {
      return firstChar === category;
    }
  });

  currentPage = 1;
  renderAnimeGrid(filteredAnimes, 0, filteredAnimes.length); // ✅ Todos os resultados

  const searchStatus = document.getElementById('searchStatus');
  if (searchStatus) {
    searchStatus.textContent = `Exibindo ${filteredAnimes.length} animes da categoria "${category}"`;
  }
}
