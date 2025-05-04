// Versão modificada com integração de filtros e categorias
import { normalizeString } from './utils.js';

let globalData = [];
let currentSearchTerm = '';
let scoredMap = new Map();

export function initSearch(data, onSearch) {
  globalData = data;

  const input = document.getElementById('searchInput');
  const button = document.getElementById('searchButton');

  const normalizeSearchTerm = (str) => {
    return normalizeString(str).replace(/[:\\-_.\\s]/g, '');
  };

  const handleSearch = () => {
    currentSearchTerm = normalizeSearchTerm(input.value);
    filterAndSearch(onSearch);
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

  input.addEventListener('input', handleSearch);
  button.addEventListener('click', handleSearch);
}

export function filterAndSearch(onSearchCallback) {
  const selectedGenres = Array.from(document.querySelectorAll('.genre-checkbox:checked')).map(el => el.value);
  const selectedStatus = document.querySelector('.status-filter.active')?.dataset.status;
  const selectedQuality = document.querySelector('.quality-filter.active')?.dataset.quality;
  const selectedCategory = window.selectedCategory || null;

  let filtered = globalData.filter(anime => {
    const matchesGenre = selectedGenres.length === 0 || selectedGenres.every(genre => anime.genres.includes(genre));
    const matchesStatus = !selectedStatus || anime.status_anime === selectedStatus;
    const matchesQuality = !selectedQuality || anime.qualidade === selectedQuality;

    const firstLetter = anime.title.charAt(0).toUpperCase();
    const matchesCategory = !selectedCategory || selectedCategory === '#' ? true : firstLetter === selectedCategory;

    return matchesGenre && matchesStatus && matchesQuality && matchesCategory;
  });

  // Aplica pontuação se houver termo de busca
  if (currentSearchTerm) {
    const scoredResults = filtered.map(anime => {
      let score = 0;
      const fields = [
        { value: anime.title, priority: 4 },
        ...(anime.alternative_titles?.synonyms?.map(text => ({ value: text, priority: 3 })) || []),
        { value: anime.alternative_titles?.en, priority: 2 },
        { value: anime.alternative_titles?.ja, priority: 1 }
      ].filter(field => field.value);

      fields.forEach(field => {
        if (normalizeString(field.value).replace(/[:\\-_.\\s]/g, '').includes(currentSearchTerm)) {
          score = Math.max(score, field.priority);
        }
      });

      return { anime, score };
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(item => item.anime);

    filtered = scoredResults;
  }

  if (filtered.length === 0) {
    displayNoResultsMessage(currentSearchTerm);
  } else {
    const msg = document.getElementById('noResultsMessage');
    if (msg) msg.remove();
  }

  onSearchCallback(filtered);
}
