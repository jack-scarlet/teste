import { normalizeString } from './utils.js';

export function initSearch(data, onSearch) {
  const input = document.getElementById('searchInput');
  const button = document.getElementById('searchButton');

  // Função que detecta se um título tem caracteres especiais
  const hasSpecialChars = (title) => /[:._-]/.test(title);

  // Normalização condicional
  const prepareForSearch = (str, isTarget) => {
    let normalized = normalizeString(str);
    if (isTarget) {
      normalized = normalized.replace(/[:._-]/g, '');
    }
    return normalized;
  };

  const handleSearch = () => {
    const rawTerm = input.value.trim();
    if (!rawTerm) {
      onSearch(data);
      return;
    }

    const results = data.filter(anime => {
      const searchFields = [
        { text: anime.title, isSpecial: hasSpecialChars(anime.title) },
        ...(anime.alternative_titles?.synonyms?.map(text => ({
          text,
          isSpecial: hasSpecialChars(text)
        })) || []),
        {
          text: anime.alternative_titles?.en,
          isSpecial: anime.alternative_titles?.en && hasSpecialChars(anime.alternative_titles.en)
        },
        {
          text: anime.alternative_titles?.ja,
          isSpecial: anime.alternative_titles?.ja && hasSpecialChars(anime.alternative_titles.ja)
        }
      ].filter(item => item.text);

      return searchFields.some(({ text, isSpecial }) => {
        const preparedTitle = prepareForSearch(text, isSpecial);
        const preparedTerm = prepareForSearch(rawTerm, isSpecial);
        
        return preparedTitle.includes(preparedTerm);
      });
    });

    // Restante do código (mensagens de erro)...
    if (results.length === 0) {
      displayNoResultsMessage(rawTerm);
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
