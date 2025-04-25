/**
 * Configuração dos filtros para o catálogo de animes
 * Adaptado para a estrutura específica do anime_list.json
 */

// Tipos de filtros disponíveis
export const FILTER_TYPES = {
  LETTER: 'letter',
  GENRE: 'genre',
  STUDIO: 'studio',
  YEAR: 'year',
  SEASON: 'season',
  MEDIA_TYPE: 'media_type',
  NATIONALITY: 'nat'
};

// Mapeamento de valores para labels
const LABEL_MAPPINGS = {
  [FILTER_TYPES.SEASON]: {
    'winter': 'Inverno',
    'spring': 'Primavera',
    'summer': 'Verão',
    'fall': 'Outono'
  },
  [FILTER_TYPES.MEDIA_TYPE]: {
    'tv': 'TV',
    'movie': 'Filme',
    'ova': 'OVA',
    'special': 'Especial'
  },
  [FILTER_TYPES.NATIONALITY]: {
    'JP': 'Japão',
    'CN': 'China',
    'KR': 'Coreia'
  }
};

// Configuração principal dos filtros
export const FILTER_CONFIG = [
  {
    id: FILTER_TYPES.LETTER,
    label: 'Letra Inicial',
    extract: anime => {
      const firstChar = anime.title.charAt(0).toUpperCase();
      return [{ value: firstChar, label: firstChar }];
    },
    sort: (a, b) => a.localeCompare(b)
  },
  {
    id: FILTER_TYPES.GENRE,
    label: 'Gênero',
    extract: anime => anime.genres || [],
    sort: (a, b) => a.localeCompare(b)
  },
  {
    id: FILTER_TYPES.STUDIO,
    label: 'Estúdio',
    extract: anime => anime.studios || [],
    sort: (a, b) => a.localeCompare(b)
  },
  {
    id: FILTER_TYPES.YEAR,
    label: 'Ano',
    extract: anime => anime.start_season?.year 
      ? [{ value: anime.start_season.year, label: anime.start_season.year }]
      : [],
    sort: (a, b) => b - a // Ordem decrescente
  },
  {
    id: FILTER_TYPES.SEASON,
    label: 'Temporada',
    extract: anime => anime.start_season?.season
      ? [{ 
          value: anime.start_season.season, 
          label: LABEL_MAPPINGS[FILTER_TYPES.SEASON][anime.start_season.season] || anime.start_season.season 
        }]
      : [],
    sort: (a, b) => ['winter', 'spring', 'summer', 'fall'].indexOf(a) - ['winter', 'spring', 'summer', 'fall'].indexOf(b)
  },
  {
    id: FILTER_TYPES.MEDIA_TYPE,
    label: 'Tipo',
    extract: anime => anime.media_type
      ? [{ 
          value: anime.media_type, 
          label: LABEL_MAPPINGS[FILTER_TYPES.MEDIA_TYPE][anime.media_type] || anime.media_type 
        }]
      : [],
    sort: (a, b) => a.localeCompare(b)
  },
  {
    id: FILTER_TYPES.NATIONALITY,
    label: 'Nacionalidade',
    extract: anime => anime.nat
      ? [{ 
          value: anime.nat, 
          label: LABEL_MAPPINGS[FILTER_TYPES.NATIONALITY][anime.nat] || anime.nat 
        }]
      : [],
    sort: (a, b) => a.localeCompare(b)
  }
];

/**
 * Aplica filtros aos animes
 */
export function applyFilters(animes, activeFilters) {
  return animes.filter(anime => {
    return Object.entries(activeFilters).every(([filterType, filterValue]) => {
      if (!filterValue) return true;
      
      switch(filterType) {
        case FILTER_TYPES.LETTER:
          return anime.title.charAt(0).toUpperCase() === filterValue;
          
        case FILTER_TYPES.GENRE:
          return anime.genres?.some(g => g.name === filterValue);
          
        case FILTER_TYPES.STUDIO:
          return anime.studios?.some(s => s.name === filterValue);
          
        case FILTER_TYPES.YEAR:
          return anime.start_season?.year == filterValue;
          
        case FILTER_TYPES.SEASON:
          return anime.start_season?.season === filterValue;
          
        case FILTER_TYPES.MEDIA_TYPE:
          return anime.media_type === filterValue;
          
        case FILTER_TYPES.NATIONALITY:
          return anime.nat === filterValue;
          
        default:
          return true;
      }
    });
  });
}

/**
 * Extrai opções únicas para um filtro específico
 */
export function getFilterOptions(animes, filterId) {
  const config = FILTER_CONFIG.find(f => f.id === filterId);
  if (!config) return [];
  
  const options = new Set();
  
  animes.forEach(anime => {
    const items = config.extract(anime) || [];
    items.forEach(item => {
      if (item && item.value) {
        options.add(item.value);
      }
    });
  });
  
  return Array.from(options)
    .sort(config.sort)
    .map(value => ({
      value,
      label: LABEL_MAPPINGS[filterId]?.[value] || value
    }));
}
