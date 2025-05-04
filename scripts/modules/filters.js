// filters.js - Sistema de Filtros Integrado

/**
 * Configuração completa dos filtros disponíveis
 */
export const FILTER_CONFIG = [
  {
    id: 'nationality',
    label: 'Nacionalidade',
    extract: anime => {
      const result = [];
      const seen = new Set();

      // Adiciona nacionalidade principal
      if (anime.nat && !seen.has(anime.nat)) {
        result.push({ value: anime.nat, label: getCountryName(anime.nat) });
        seen.add(anime.nat);
      }

      // Adiciona dublagem se diferente
      if (anime.dub && anime.dub !== anime.nat && !seen.has(anime.dub)) {
        result.push({ value: anime.dub, label: getCountryName(anime.dub) });
        seen.add(anime.dub);
      }

      return result;
    },
    sort: (a, b) => a.label.localeCompare(b.label)
  },
  {
    id: 'genre',
    label: 'Gênero',
    extract: anime => anime.genres?.map(g => ({ 
      value: g.name, 
      label: g.name,
      count: 1 // Para contagem de frequência
    })) || [],
    sort: (a, b) => a.label.localeCompare(b.label)
  },
  {
    id: 'year',
    label: 'Ano',
    extract: anime => anime.start_season?.year 
      ? [{ 
          value: anime.start_season.year, 
          label: anime.start_season.year,
          count: 1
        }]
      : [],
    sort: (a, b) => b.value - a.value
  },
  {
    id: 'season',
    label: 'Temporada',
    extract: anime => anime.start_season?.season
      ? [{
          value: anime.start_season.season,
          label: getSeasonName(anime.start_season.season),
          count: 1
        }]
      : [],
    sort: (a, b) => {
      const seasonOrder = { 'winter': 1, 'spring': 2, 'summer': 3, 'fall': 4 };
      return seasonOrder[a.value] - seasonOrder[b.value];
    }
  },
  {
    id: 'studio',
    label: 'Estúdio',
    extract: anime => anime.studios?.map(s => ({ 
      value: s.name, 
      label: s.name,
      count: 1
    })) || [],
    sort: (a, b) => a.label.localeCompare(b.label)
  },
  {
    id: 'mediaType',
    label: 'Tipo de Mídia',
    extract: anime => anime.media_type
      ? [{
          value: anime.media_type,
          label: getMediaTypeName(anime.media_type),
          count: 1
        }]
      : [],
    sort: (a, b) => a.label.localeCompare(b.label)
  }
];

/**
 * Aplica todos os filtros aos animes
 * @param {Array} animes - Lista de animes a filtrar
 * @param {Object} filters - Objeto com os filtros ativos
 * @returns {Array} Animes filtrados
 */
export function applyFilters(animes, filters) {
  return animes.filter(anime => {
    return Object.entries(filters).every(([key, value]) => {
      if (!value) return true;
      
      switch(key) {
        case 'nationality':
          return anime.nat === value || anime.dub === value;
        case 'genre':
          return anime.genres?.some(g => g.name === value);
        case 'year':
          return anime.start_season?.year == value;
        case 'season':
          return anime.start_season?.season === value;
        case 'studio':
          return anime.studios?.some(s => s.name === value);
        case 'mediaType':
          return anime.media_type === value;
        default:
          return true;
      }
    });
  });
}

/**
 * Extrai opções únicas para os filtros com contagem
 * @param {Array} animes - Lista de animes
 * @param {Object} filterConfig - Configuração do filtro
 * @returns {Array} Opções únicas com contagem
 */
export function extractUniqueOptions(animes, filterConfig) {
  const optionsMap = new Map();

  // Conta ocorrências de cada opção
  animes.forEach(anime => {
    const extracted = filterConfig.extract(anime);
    extracted.forEach(opt => {
      const key = JSON.stringify({ value: opt.value, label: opt.label });
      if (optionsMap.has(key)) {
        const existing = optionsMap.get(key);
        optionsMap.set(key, { ...existing, count: existing.count + 1 });
      } else {
        optionsMap.set(key, { ...opt, count: opt.count || 1 });
      }
    });
  });

  // Converte para array e ordena
  return Array.from(optionsMap.values())
    .sort(filterConfig.sort || ((a, b) => a.label.localeCompare(b.label)));
}

// Funções auxiliares para tradução/normalização
function getCountryName(code) {
  const countries = {
    'JP': 'Japão',
    'CN': 'China',
    'KR': 'Coreia',
    'US': 'Estados Unidos',
    'BR': 'Brasil',
    'OT': 'Outros'
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
    'special': 'Especial'
  };
  return types[type] || type;
}

/**
 * Atualiza as contagens dos filtros com base nos animes visíveis
 * @param {Array} visibleAnimes - Animes atualmente visíveis
 * @param {Array} allAnimes - Todos os animes disponíveis
 */
export function updateFilterCounts(visibleAnimes, allAnimes) {
  FILTER_CONFIG.forEach(filter => {
    const select = document.getElementById(filter.id);
    if (!select) return;

    const allOptions = extractUniqueOptions(allAnimes, filter);
    const visibleOptions = extractUniqueOptions(visibleAnimes, filter);
    const visibleCounts = new Map(visibleOptions.map(opt => [opt.value, opt.count]));

    // Atualiza os options com as contagens
    Array.from(select.options).forEach(option => {
      if (option.value) {
        const allCount = allOptions.find(o => o.value === option.value)?.count || 0;
        const visibleCount = visibleCounts.get(option.value) || 0;
        
        // Mostra contagem no formato "visível/total"
        option.text = `${option.text.split(' (')[0]} (${visibleCount}/${allCount})`;
        
        // Desabilita opções sem itens visíveis
        option.disabled = visibleCount === 0 && option.value !== select.value;
      }
    });
  });
}
