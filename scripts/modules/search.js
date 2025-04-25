import { normalizeString } from './utils.js';

export function initSearch(data, onSearch) {
  const input = document.getElementById('searchInput');
  const button = document.getElementById('searchButton');

  // Remove caracteres especiais para busca mais ampla
  const normalizeSearchTerm = (str) => {
    return normalizeString(str).replace(/[:\-_\.\s]/g, '');
  };

  const handleSearch = () => {
    const term = normalizeSearchTerm(input.value);
    if (!term) {
      onSearch(data);
      return;
    }

    // Primeiro: Filtra e classifica os resultados
    const scoredResults = data.map(anime => {
      let score = 0;
      const fields = [
        { value: anime.title, priority: 4 },         // Maior prioridade
        ...(anime.alternative_titles?.synonyms?.map(text => ({ value: text, priority: 3 })) || []),
        { value: anime.alternative_titles?.en, priority: 2 },
        { value: anime.alternative_titles?.ja, priority: 1 }  // Menor prioridade
      ].filter(field => field.value);

      // Verifica cada campo e atribui pontuação
      fields.forEach(field => {
        if (normalizeSearchTerm(field.value).includes(term)) {
          score = Math.max(score, field.priority);
        }
      });

      return { anime, score };
    })
    .filter(item => item.score > 0)  // Remove itens sem match
    .sort((a, b) => b.score - a.score)  // Ordena por prioridade
    .map(item => item.anime);  // Extrai apenas os animes

    // Exibe mensagem se nenhum resultado for encontrado
    if (scoredResults.length === 0) {
      displayNoResultsMessage(input.value);  // Mostra o termo original
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
