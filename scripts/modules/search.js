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

    const results = data.filter(anime => {
      // Verifica título principal
      if (normalizeString(anime.title).includes(term)) return true;
      
      // Verifica títulos alternativos (estrutura do seu JSON)
      const altTitles = anime.alternative_titles;
      if (altTitles) {
        // Verifica synonyms (array)
        if (altTitles.synonyms?.some(s => normalizeString(s).includes(term))) {
          return true;
        }
        // Verifica título em inglês (string)
        if (altTitles.en && normalizeString(altTitles.en).includes(term)) {
          return true;
        }
        // Verifica título em japonês (string)
        if (altTitles.ja && normalizeString(altTitles.ja).includes(term)) {
          return true;
        }
      }
      
      return false;
    });
    
    onSearch(results);
  };

  input.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') handleSearch();
  });

  button.addEventListener('click', handleSearch);
}
