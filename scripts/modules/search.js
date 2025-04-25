import { normalizeString } from './utils.js';

export function initSearch(data, onSearch) {
  const input = document.getElementById('searchInput');
  const button = document.getElementById('searchButton');

  const handleSearch = () => {
    const term = normalizeString(input.value);
    if (!term) {
      onSearch(data);
      return;
    }

    const results = data.filter(anime => 
      normalizeString(anime.title).includes(term) ||
      anime.alternative_titles?.some(t => 
        normalizeString(t).includes(term)
      )
    );
    
    onSearch(results);
  };

  input.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') handleSearch();
  });

  button.addEventListener('click', handleSearch);
}