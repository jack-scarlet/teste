export const FILTER_CONFIG = [
  // 1. Filtro por Categoria (A-Z, #)
  {
    id: 'category',
    label: 'Categoria',
    extract: (anime, allAnimes) => {
      // Esta função precisa ser implementada no componente que usa os filtros
      // pois depende de como você organiza os animes por categoria
      return [];
    },
    isSpecialFilter: true // Marca que este filtro precisa de tratamento especial
  },
  
  // 2. Filtro por Nacionalidade
  {
    id: 'nationality',
    label: 'Nacionalidade',
    extract: anime => {
      if (!anime.nat) return [];
      const countryName = getCountryName(anime.nat);
      return [{ value: anime.nat, label: countryName }];
    }
  },
  
  // 3. Filtro por Gênero
  {
    id: 'genre',
    label: 'Gênero',
    extract: anime => anime.genres?.map(g => ({ 
      value: g.name, 
      label: g.name 
    })) || []
  },
  
  // 4. Filtro por Temporada (season)
  {
    id: 'season',
    label: 'Temporada',
    extract: anime => {
      if (!anime.start_season?.season) return [];
      const seasonName = getSeasonName(anime.start_season.season);
      return [{ value: anime.start_season.season, label: seasonName }];
    }
  },
  
  // 5. Filtro por Ano
  {
    id: 'year',
    label: 'Ano',
    extract: anime => anime.start_season?.year 
      ? [{ value: anime.start_season.year, label: anime.start_season.year }]
      : []
  },
  
  // 6. Filtro por Tipo de Mídia
  {
    id: 'media_type',
    label: 'Tipo de Mídia',
    extract: anime => {
      if (!anime.media_type) return [];
      const typeName = getMediaTypeName(anime.media_type);
      return [{ value: anime.media_type, label: typeName }];
    }
  },
  
  // 7. Filtro por Estúdio
  {
    id: 'studio',
    label: 'Estúdio',
    extract: anime => anime.studios?.map(s => ({ 
      value: s.name, 
      label: s.name 
    })) || []
  }
];

// Funções auxiliares para formatar os valores
function getCountryName(code) {
  const countries = {
    'JP': 'Japão',
    'CN': 'China',
    'KR': 'Coreia do Sul',
    'US': 'Estados Unidos',
    'FR': 'França',
    'DE': 'Alemanha',
    'IT': 'Itália',
    'ES': 'Espanha',
    'GB': 'Reino Unido',
    'RU': 'Rússia',
    'BR': 'Brasil'
  };
  return countries[code] || code;
}

function getSeasonName(season) {
  const seasons = {
    'winter': 'Inverno',
    'spring': 'Primavera',
    'summer': 'Verão',
    'fall': 'Outono'
  };
  return seasons[season] || season;
}

function getMediaTypeName(type) {
  const types = {
    'tv': 'TV',
    'movie': 'Filme',
    'ova': 'OVA',
    'ona': 'ONA',
    'special': 'Especial',
    'music': 'Música'
  };
  return types[type] || type;
}

export function applyFilters(animes, filters) {
  return animes.filter(anime => {
    return Object.entries(filters).every(([key, values]) => {
      if (!values || values.length === 0) return true;
      
      const filterValues = Array.isArray(values) ? values : [values];
      
      switch(key) {
        case 'category':
          // Este filtro precisa ser implementado no componente pai
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
