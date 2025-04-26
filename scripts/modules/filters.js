export const FILTER_CONFIG = [
  // 1. Filtro por Categoria (A-Z, #) - Especial
  {
    id: 'category',
    label: '🔠 Categoria',
    icon: 'font', // Ícone opcional para interfaces
    extract: () => [], // Implementado no componente
    isSpecialFilter: true,
    description: 'Filtrar por letra inicial do título'
  },
  
  // 2. Filtro por Nacionalidade
  {
    id: 'nationality',
    label: '🌎 Nacionalidade',
    icon: 'globe',
    extract: anime => {
      if (!anime.nat) return [];
      const countryName = getCountryName(anime.nat);
      return [{ value: anime.nat, label: `${getFlagEmoji(anime.nat)} ${countryName}` }];
    },
    sort: (a, b) => a.label.localeCompare(b.label),
    description: 'Filtrar por país de origem'
  },
  
  // 3. Filtro por Gênero (ordenado alfabeticamente)
  {
    id: 'genre',
    label: '🎭 Gêneros',
    icon: 'tags',
    extract: anime => anime.genres?.map(g => ({ 
      value: g.name, 
      label: `${getGenreEmoji(g.name)} ${g.name}` 
    })) || [],
    sort: (a, b) => a.label.localeCompare(b.label),
    description: 'Selecione um ou mais gêneros',
    isMultiSelect: true,
    searchable: true
  },
  
  // 4. Filtro por Temporada (com ordenação lógica)
  {
    id: 'season',
    label: '❄️ Temporada',
    icon: 'calendar',
    extract: anime => {
      if (!anime.start_season?.season) return [];
      const seasonName = getSeasonName(anime.start_season.season);
      return [{ 
        value: anime.start_season.season, 
        label: `${getSeasonEmoji(anime.start_season.season)} ${seasonName}` 
      }];
    },
    sort: (a, b) => SEASON_ORDER.indexOf(a.value) - SEASON_ORDER.indexOf(b.value),
    description: 'Filtrar por temporada de lançamento'
  },
  
  // 5. Filtro por Ano (com ordenação decrescente)
  {
    id: 'year',
    label: '📅 Ano',
    icon: 'calendar-alt',
    extract: anime => anime.start_season?.year 
      ? [{ value: anime.start_season.year, label: `🗓️ ${anime.start_season.year}` }]
      : [],
    sort: (a, b) => b.value - a.value, // Ordem decrescente
    description: 'Filtrar por ano de lançamento'
  },
  
  // 6. Filtro por Tipo de Mídia
  {
    id: 'media_type',
    label: '🎬 Tipo de Mídia',
    icon: 'film',
    extract: anime => {
      if (!anime.media_type) return [];
      const typeName = getMediaTypeName(anime.media_type);
      return [{ 
        value: anime.media_type, 
        label: `${getMediaTypeEmoji(anime.media_type)} ${typeName}` 
      }];
    },
    sort: (a, b) => a.label.localeCompare(b.label),
    description: 'Tipo de produção (TV, Filme, OVA, etc.)'
  },
  
  // 7. Filtro por Estúdio (ordenado alfabeticamente)
  {
    id: 'studio',
    label: '🏢 Estúdios',
    icon: 'building',
    extract: anime => anime.studios?.map(s => ({ 
      value: s.name, 
      label: `🎨 ${s.name}` 
    })) || [],
    sort: (a, b) => a.label.localeCompare(b.label),
    description: 'Selecione um ou mais estúdios',
    isMultiSelect: true,
    searchable: true
  }
];

// Constantes para ordenação
const SEASON_ORDER = ['winter', 'spring', 'summer', 'fall'];

// Funções auxiliares melhoradas
function getCountryName(code) {
  const countries = {
    'JP': 'Japão', 'CN': 'China', 'KR': 'Coreia', 'US': 'EUA',
    'FR': 'França', 'DE': 'Alemanha', 'IT': 'Itália', 'ES': 'Espanha',
    'GB': 'Reino Unido', 'RU': 'Rússia', 'BR': 'Brasil'
  };
  return countries[code] || code;
}

function getFlagEmoji(countryCode) {
  const flagOffsets = {
    'JP': '🇯🇵', 'CN': '🇨🇳', 'KR': '🇰🇷', 'US': '🇺🇸',
    'FR': '🇫🇷', 'DE': '🇩🇪', 'IT': '🇮🇹', 'ES': '🇪🇸',
    'GB': '🇬🇧', 'RU': '🇷🇺', 'BR': '🇧🇷'
  };
  return flagOffsets[countryCode] || '🌐';
}

function getSeasonName(season) {
  const seasons = {
    'winter': 'Inverno', 'spring': 'Primavera',
    'summer': 'Verão', 'fall': 'Outono'
  };
  return seasons[season] || season;
}

function getSeasonEmoji(season) {
  const emojis = {
    'winter': '❄️', 'spring': '🌸',
    'summer': '☀️', 'fall': '🍂'
  };
  return emojis[season] || '📅';
}

function getMediaTypeName(type) {
  const types = {
    'tv': 'Série TV', 'movie': 'Filme',
    'ova': 'OVA', 'ona': 'ONA',
    'special': 'Especial', 'music': 'Clipe Musical'
  };
  return types[type] || type;
}

function getMediaTypeEmoji(type) {
  const emojis = {
    'tv': '📺', 'movie': '🎬',
    'ova': '📼', 'ona': '🖥️',
    'special': '🎁', 'music': '🎵'
  };
  return emojis[type] || '🎞️';
}

function getGenreEmoji(genre) {
  const emojis = {
    'Action': '💥', 'Adventure': '🌍',
    'Comedy': '😂', 'Drama': '🎭',
    'Fantasy': '🦄', 'Horror': '👻',
    'Mystery': '🕵️', 'Romance': '💘',
    'Sci-Fi': '🚀', 'Slice of Life': '🏡',
    'Sports': '⚽', 'Supernatural': '🔮',
    'Thriller': '🔪', 'Harem': '👨👧👧'
  };
  return emojis[genre] || '🏷️';
}

export function applyFilters(animes, filters) {
  return animes.filter(anime => {
    return Object.entries(filters).every(([key, values]) => {
      if (!values || values.length === 0) return true;
      
      const filterValues = Array.isArray(values) ? values : [values];
      
      switch(key) {
        case 'category':
          // Implementar no componente conforme a lógica de categorias
          return true;
        
        case 'nationality':
          return filterValues.includes(anime.nat);
        
        case 'genre':
          return anime.genres?.some(g => filterValues.includes(g.name));
        
        case 'season':
          return anime.start_season?.season && 
                 filterValues.includes(anime.start_season.season);
        
        case 'year':
          return anime.start_season?.year && 
                 filterValues.includes(String(anime.start_season.year));
        
        case 'media_type':
          return filterValues.includes(anime.media_type);
        
        case 'studio':
          return anime.studios?.some(s => filterValues.includes(s.name));
        
        default:
          return true;
      }
    });
  });
}
