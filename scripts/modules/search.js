// search.js - Versão integrada com o sistema de filtros principal

import { normalizeString } from './utils.js';

/**
 * Inicializa o sistema de busca integrado com os filtros
 * @param {Array} data - Lista completa de animes
 * @param {Function} onSearch - Callback chamado quando há uma busca
 */
export function initSearch(data, onSearch) {
  const input = document.getElementById('searchInput');
  const button = document.getElementById('searchButton');

  // Função para normalizar termos de busca
  const normalizeSearchTerm = (str) => {
    return normalizeString(str).replace(/[:\-_\.\s]/g, '');
  };

  // Manipulador principal da busca
  const handleSearch = () => {
    const searchTerm = input.value.trim();
    onSearch(searchTerm); // Passa o termo de busca para o callback
  };

  // Event listeners
  input.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') handleSearch();
  });

  button.addEventListener('click', handleSearch);
}

/**
 * Exibe mensagem quando não há resultados
 * @param {string} term - Termo de busca que não retornou resultados
 */
export function displayNoResultsMessage(term) {
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
}

/**
 * Remove a mensagem de "nenhum resultado"
 */
export function removeNoResultsMessage() {
  const existingMsg = document.getElementById('noResultsMessage');
  if (existingMsg) existingMsg.remove();
}

/**
 * Função auxiliar para aplicar busca em um conjunto de dados
 * @param {Array} animes - Lista de animes para filtrar
 * @param {string} searchTerm - Termo de busca
 * @returns {Array} Lista de animes filtrados e pontuados
 */
export function applySearch(animes, searchTerm) {
  const normalizeSearchTerm = (str) => {
    return normalizeString(str).replace(/[:\-_\.\s]/g, '');
  };
  
  const normalizedTerm = normalizeSearchTerm(searchTerm);
  if (!normalizedTerm) return animes;

  return animes.map(anime => {
    let score = 0;
    const fields = [
      { value: anime.title, priority: 4 },
      ...(anime.alternative_titles?.synonyms?.map(text => ({ value: text, priority: 3 })) || []),
      { value: anime.alternative_titles?.en, priority: 2 },
      { value: anime.alternative_titles?.ja, priority: 1 }
    ].filter(field => field.value);

    fields.forEach(field => {
      if (normalizeSearchTerm(field.value).includes(normalizedTerm)) {
        score = Math.max(score, field.priority);
      }
    });

    return { anime, score };
  })
  .filter(item => item.score > 0)
  .sort((a, b) => b.score - a.score)
  .map(item => item.anime);
}
