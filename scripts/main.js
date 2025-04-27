// main.js atualizado

import { fetchAnimeData } from './modules/api.js';
import { initMobileMenu, initFilterToggle, } from './modules/dom.js';
import { FILTER_CONFIG, applyFilters } from './modules/filters.js';
import { renderAnimeGrid, showLoadingSkeleton } from './modules/render.js';
import { initSearch } from './modules/search.js';
import { setupIntersectionObserver } from './modules/utils.js';
import { initCloudButton } from './modules/cloud.js';



// Configurações
const ANIMES_PER_PAGE = 24;
const INITIAL_RANDOM_COUNT = 23; // 23 aleatórios + 1 destaque

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

// Processa estrutura do JSON
const processAnimeData = (data) => {
  let animeList = [];
  let lastAnime = null;

  if (Array.isArray(data)) {
    animeList = [...data];
    lastAnime = data[data.length - 1];
  } else {
    // Extrai animes de todas as categorias válidas
    const validCategories = [
      '#', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
      'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
      'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'
    ];

    validCategories.forEach(category => {
      if (Array.isArray(data[category])) {
        animeList = [...animeList, ...data[category]];
      }
    });

    // Pega o último anime da última categoria
    const lastCategory = validCategories[validCategories.length - 1];
    if (Array.isArray(data[lastCategory]) && data[lastCategory].length > 0) {
      lastAnime = data[lastCategory][data[lastCategory].length - 1];
    }
  }

  return { animeList, lastAnime };
};

// Aplica todos os filtros
const applyAllFilters = (animes) => {
  return animes.filter(anime => {
    const matchesCategory = !currentFilters.category || 
      (anime.category && anime.category === currentFilters.category);
    
    const matchesNationality = !currentFilters.nationality || 
      anime.nat === currentFilters.nationality;
    
    const matchesGenre = !currentFilters.genre || 
      (anime.genres && anime.genres.some(g => g.name === currentFilters.genre));
    
    const matchesSeason = !currentFilters.season || 
      (anime.start_season && anime.start_season.season === currentFilters.season);
    
    const matchesYear = !currentFilters.year || 
      (anime.start_season && anime.start_season.year === parseInt(currentFilters.year));
    
    const matchesMediaType = !currentFilters.mediaType || 
      anime.media_type === currentFilters.mediaType;
    
    const matchesStudio = !currentFilters.studio || 
      (anime.studios && anime.studios.some(s => s.name === currentFilters.studio));

    return matchesCategory && matchesNationality && matchesGenre && 
           matchesSeason && matchesYear && matchesMediaType && matchesStudio;
  });
};

// Função principal
(async function initApp() {
  initMobileMenu();
  initFilterToggle();
  showLoadingSkeleton();
  initCloudButton();


  try {
  const response = await fetchAnimeData();
  const { animeList, lastAnime } = processAnimeData(response);
  allAnimes = animeList;

  // Renderiza os filtros baseados em FILTER_CONFIG
  renderFiltersFromConfig();

  if (isHomePage) {
    // ... resto do código da página inicial
  } else {
    // ... resto do código das outras páginas
  }
} catch (error) {
  console.error('Erro ao carregar dados:', error);
  showError(error);
}

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

// Configura os filtros
function setupFilters() {
  // Nacionalidade
  createFilterSelect('nationality', 'Nacionalidade', [
    { value: '', label: 'Todos' },
    { value: 'JP', label: 'Japão' },
    { value: 'CN', label: 'China' },
    { value: 'KR', label: 'Coreia' }
  ], value => {
    currentFilters.nationality = value || null;
    updateFilters();
  });

  // Gêneros
  const genres = [...new Set(allAnimes.flatMap(a => 
    a.genres ? a.genres.map(g => g.name) : []
  ))].sort();

  createFilterSelect('genre', 'Gênero', [
    { value: '', label: 'Todos os gêneros' },
    ...genres.map(g => ({ value: g, label: g }))
  ], value => {
    currentFilters.genre = value || null;
    updateFilters();
  });

  // Temporadas
  createFilterSelect('season', 'Temporada', [
    { value: '', label: 'Todas as temporadas' },
    { value: 'spring', label: 'Primavera' },
    { value: 'summer', label: 'Verão' },
    { value: 'fall', label: 'Outono' },
    { value: 'winter', label: 'Inverno' }
  ], value => {
    currentFilters.season = value || null;
    updateFilters();
  });

  // Anos
  const years = [...new Set(allAnimes.map(a => 
    a.start_season?.year
  ).filter(Boolean))].sort((a, b) => b - a);

  createFilterSelect('year', 'Ano', [
    { value: '', label: 'Todos os anos' },
    ...years.map(y => ({ value: y, label: y }))
  ], value => {
    currentFilters.year = value || null;
    updateFilters();
  });

  // Tipos de mídia
  const mediaTypes = [...new Set(allAnimes.map(a => a.media_type))].filter(Boolean);

  createFilterSelect('mediaType', 'Tipo de Mídia', [
    { value: '', label: 'Todos os tipos' },
    ...mediaTypes.map(m => ({ value: m, label: m.toUpperCase() }))
  ], value => {
    currentFilters.mediaType = value || null;
    updateFilters();
  });

  // Estúdios
  const studios = [...new Set(allAnimes.flatMap(a => 
    a.studios ? a.studios.map(s => s.name) : []
  ))].sort();

  createFilterSelect('studio', 'Estúdio', [
    { value: '', label: 'Todos os estúdios' },
    ...studios.map(s => ({ value: s, label: s }))
  ], value => {
    currentFilters.studio = value || null;
    updateFilters();
  });
}

// Atualiza os filtros e re-renderiza
function updateFilters() {
  filteredAnimes = applyAllFilters(allAnimes);
  currentPage = 1;
  renderAnimeGrid(filteredAnimes, 0, ANIMES_PER_PAGE);
}

// Mostra mensagem de erro
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

// Ferramentas de debug
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
