// modules/filters.js
export const FILTER_CONFIG = [
  {
    id: 'media_type',
    label: 'Tipo',
    extract: item => item.media_type 
      ? [{ value: item.media_type, label: item.media_type }]
      : []
  },
  {
    id: 'genre',
    label: 'Gênero',
    extract: item => item.genres?.map(g => ({ value: g.name, label: g.name })) || [],
    sort: (a, b) => a.label.localeCompare(b.label)
  },
  {
    id: 'year',
    label: 'Ano',
    extract: item => {
      try {
        if (!item.start_date) return [];
        
        const match = item.start_date.match(/^(\d{4})-/);
        if (!match) return [];
        
        const year = parseInt(match[1]);
        if (isNaN(year)) return [];
        
        return [{
          value: year,
          label: String(year)
        }];
      } catch {
        return [];
      }
    },
    sort: (a, b) => b.value - a.value
  },
  {
    id: 'authors',
    label: 'Autor',
    extract: item => {
      // Verifica se authors é string (como no seu JSON) ou array de objetos
      if (typeof item.authors === 'string') {
        return [{ value: item.authors, label: item.authors }];
      }
      return item.authors?.map(s => ({ 
        value: s.name || s, 
        label: s.name || s 
      })) || [];
    },
    sort: (a, b) => a.label.localeCompare(b.label)
  }
];

export function applyFilters(items, filters) {
  return items.filter(item => {
    return Object.entries(filters).every(([key, filterValue]) => {
      if (!filterValue) return true;
      
      switch(key) {
        case 'media_type':
          return item.media_type === filterValue;
        case 'genre':
          return item.genres?.some(g => g.name === filterValue);
        case 'year':
          // Verifica tanto start_date quanto start_season.year para compatibilidade
          const itemYear = item.start_date?.split('-')[0] || item.start_season?.year;
          return itemYear == filterValue;
        case 'authors':
          // Trata tanto string quanto array de objetos
          if (typeof item.authors === 'string') {
            return item.authors === filterValue;
          }
          return item.authors?.some(s => s.name === filterValue || s === filterValue);
        default:
          return true;
      }
    });
  });
}
