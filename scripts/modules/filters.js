// modules/filters.js
export const FILTER_CONFIG = [
  {
    id: 'nationality',
    label: 'Nacionalidade',
    extract: anime => {
      const result = [];

      if (anime.nat) {
        result.push({ value: anime.nat, label: getCountryName(anime.nat) });
      }

      if (anime.dub) {
        result.push({ value: anime.dub, label: getCountryName(anime.dub) });
      }

      return result;
    }
  },
  {
    id: 'genre',
    label: 'Gênero',
    extract: anime => anime.genres?.map(g => ({ value: g.name, label: g.name })) || [],
    sort: (a, b) => a.label.localeCompare(b.label) // Ordena alfabeticamente
  },
  {
    id: 'year',
    label: 'Ano',
    extract: anime => anime.start_season?.year 
      ? [{ value: anime.start_season.year, label: anime.start_season.year }]
      : [],
    sort: (a, b) => b.value - a.value // Ordena do mais recente
  },
  {
    id: 'studio',
    label: 'Estúdio',
    extract: anime => anime.studios?.map(s => ({ value: s.name, label: s.name })) || [],
    sort: (a, b) => a.label.localeCompare(b.label) // Ordena alfabeticamente
  }
];

// Função auxiliar para nome de países
function getCountryName(code) {
  const countries = {
    'JP': 'Japão',
    'CN': 'China',
    'KR': 'Coreia',
    'OT': 'Outros'
    // Adicione outros conforme necessário
  };
  return countries[code] || code;
}

export function applyFilters(animes, filters) {
  return animes.filter(anime => {
    return Object.entries(filters).every(([key, value]) => {
      if (!value) return true;
      
      switch(key) {
        case 'nationality':
          return anime.nat === value;
        case 'genre':
          return anime.genres?.some(g => g.name === value);
        case 'year':
          return anime.start_season?.year == value;
        case 'studio':
          return anime.studios?.some(s => s.name === value);
        default:
          return true;
      }
    });
  });
}
