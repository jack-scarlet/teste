export function applyFilters(animes, filters) {
  return animes.filter(anime => {
    return Object.entries(filters).every(([key, value]) => {
      if (!value || (Array.isArray(value) && value.length === 0)) return true;

      switch(key) {
        case 'genre':
          return anime.genres?.some(g => 
            Array.isArray(value) ? value.includes(g.name) : g.name === value
          );
        case 'year':
          return Array.isArray(value)
            ? value.includes(anime.start_season?.year)
            : anime.start_season?.year == value;
        default:
          return true;
      }
    });
  });
}
