// Versão final consolidada
import { normalizeString } from './utils.js';

export function initSearch(data, onSearch) {
  const input = document.getElementById('searchInput');
  const button = document.getElementById('searchButton');

  const normalizeSearchTerm = (str) => {
    return normalizeString(str).replace(/[:\-_\.\s]/g, '');
  };

  const handleSearch = () => {
    const term = normalizeSearchTerm(input.value);
    if (!term) {
      onSearch(data);
      return;
    }

    const scoredResults = data.map(anime => {
      let score = 0;
      const fields = [
        { value: anime.title, priority: 4 },
        ...(anime.alternative_titles?.synonyms?.map(text => ({ value: text, priority: 3 })) || []),
        { value: anime.alternative_titles?.en, priority: 2 },
        { value: anime.alternative_titles?.ja, priority: 1 }
      ].filter(field => field.value);

      fields.forEach(field => {
        if (normalizeSearchTerm(field.value).includes(term)) {
          score = Math.max(score, field.priority);
        }
      });

      return { anime, score };
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(item => item.anime);

    if (scoredResults.length === 0) {
      displayNoResultsMessage(input.value);
    } else {
      removeNoResultsMessage();
    }
    
    onSearch(scoredResults);
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
