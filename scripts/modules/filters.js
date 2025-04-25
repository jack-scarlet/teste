export const FILTER_CONFIG = [
  {
    id: 'genre',
    label: 'Gênero',
    extract: anime => anime.genres?.map(g => ({ value: g.name, label: g.name }))
  },
  {
    id: 'year', 
    label: 'Ano',
    extract: anime => anime.start_season?.year 
      ? [{ value: anime.start_season.year, label: anime.start_season.year }]
      : []
  },
  // Adicione outros filtros conforme necessário
];

export function applyFilters(animes, filters) {
  return animes.filter(anime => {
    return Object.entries(filters).every(([key, value]) => {
      if (!value) return true;
      
      switch(key) {
        case 'genre':
          return anime.genres?.some(g => g.name === value);
        case 'year':
          return anime.start_season?.year == value;
        default:
          return true;
      }
    });
  });
}