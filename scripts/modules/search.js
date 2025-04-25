import { normalizeString } from './utils.js';

export function initSearch(data, onSearch) {
  const input = document.getElementById('searchInput');
  const button = document.getElementById('searchButton');

  // Remove caracteres especiais para busca mais ampla
  const normalizeSearchTerm = (str) => {
    return normalizeString(str).replace(/[:\-_\.]/g, ' ');
  };

  const handleSearch = () => {
    const term = normalizeSearchTerm(input.value);
    if (!term) {
      onSearch(data);
      return;
    }

    const results = data.filter(anime => {
      // Campos para buscar
      const searchFields = [
        anime.title,
        ...(anime.alternative_titles?.synonyms || []),
        anime.alternative_titles?.en,
        anime.alternative_titles?.ja
      ].filter(Boolean);

      return searchFields.some(field => 
        normalizeSearchTerm(field).includes(term)
      );
    });

    // Exibe mensagem se nenhum resultado for encontrado
    if (results.length === 0) {
      displayNoResultsMessage(term);
    } else {
      removeNoResultsMessage();
    }
    
    onSearch(results);
  };

  // Mensagem quando não encontra resultados
  const displayNoResultsMessage = (term) => {
    removeNoResultsMessage();
    
    const message = document.createElement('div');
    message.id = 'noResultsMessage';
    message.className = 'no-results';
    message.innerHTML = `
      <p>Nenhum anime encontrado para <strong>"${term}"</strong></p>
      <p class="suggestion">Sugestão: Tente buscar por termos mais gerais</p>
    `;
    
    const animeGrid = document.getElementById('animeGrid');
    animeGrid.parentNode.insertBefore(message, animeGrid);
  };

  const removeNoResultsMessage = () => {
    const existingMsg = document.getElementById('noResultsMessage');
    if (existingMsg) existingMsg.remove();
  };

  // Event listeners
  input.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') handleSearch();
  });

  button.addEventListener('click', handleSearch);
}
