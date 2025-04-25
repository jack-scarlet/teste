// Em dom/createFilters.js
const FILTER_CONFIG = [
  { id: 'genre', name: 'Gênero', extract: anime => anime.genres?.map(g => g.name) },
  { id: 'year', name: 'Ano', extract: anime => anime.start_season?.year },
  // ... outros filtros
];

export function initFilters(data) {
  FILTER_CONFIG.forEach(({ id, name, extract }) => {
    const options = getUniqueOptions(data, extract);
    createFilterSelect(id, name, options);
  });
}
