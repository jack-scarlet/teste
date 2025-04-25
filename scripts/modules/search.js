import { normalizeString } from './utils.js';

export function initSearch(data, onSearch) {
  const input = document.getElementById('searchInput');
  const button = document.getElementById('searchButton');

  // Normalização mais inteligente
  const prepareSearchTerm = (str) => {
    return normalizeString(str)
      .replace(/[:\-_\.]/g, ' ') // Substitui caracteres especiais por espaço
      .replace(/\s+/g, ' ');     // Remove espaços extras
  };

  const handleSearch = () => {
    const term = prepareSearchTerm(input.value).trim();
    if (!term) {
      onSearch(data);
      return;
    }

    const results = data.filter(anime => {
      const searchFields = [
        anime.title,
        ...(anime.alternative_titles?.synonyms || []),
        anime.alternative_titles?.en,
        anime.alternative_titles?.ja
      ].filter(Boolean);

      // Busca por correspondência exata ou palavras separadas
      return searchFields.some(field => {
        const normalizedField = prepareSearchTerm(field);
        
        // Verifica se o termo está contido OU se há correspondência de palavras
        return normalizedField.includes(term) || 
               term.split(' ').every(word => 
                 normalizedField.includes(word)
               );
      });
    });

    // Restante do código (mensagens)...
    if (results.length === 0) {
      displayNoResultsMessage(input.value); // Mostra o termo original
    } else {
      removeNoResultsMessage();
    }
    
    onSearch(results);
  };

  // ... (mantenha o restante do código igual)
}
