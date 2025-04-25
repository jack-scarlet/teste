export function renderAnimeGrid(animes, startIdx = 0, chunkSize = 30) {
  const grid = document.getElementById('animeGrid');
  const chunk = animes.slice(startIdx, startIdx + chunkSize);

  if (startIdx === 0) {
    grid.innerHTML = '';
  }

  const fragment = document.createDocumentFragment();

  chunk.forEach(anime => {
    const card = createAnimeCard(anime);
    fragment.appendChild(card);
  });

  grid.appendChild(fragment);
}

function createAnimeCard(anime) {
  const card = document.createElement('div');
  card.className = 'anime-card';
  
  card.innerHTML = `
    <div class="anime-card-container">
      <a href="${anime.url}" target="_blank" aria-label="${anime.title}" class="anime-image-link">
        <img 
          src="${anime.image}" 
          alt="${anime.title}"
          loading="lazy"
          onerror="this.src='placeholder.jpg'"
        >
        <div class="anime-title-overlay">
          <span>${anime.title}</span>
        </div>
      </a>
      <button class="anime-add-button" data-anime-id="${anime.id}">
        <span class="plus-icon">+</span>
      </button>
    </div>
  `;

  // Adiciona o event listener para o botão
  const addButton = card.querySelector('.anime-add-button');
  addButton.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    openModal(anime);
  });

  return card;
}

function openModal(anime) {
  // Mapeamento de valores para exibição amigável
  const nationalityMap = {
    'JP': 'Japão',
    'KR': 'Coreia do Sul', 
    'CN': 'China',
    '': 'Outros'
  };

  const seasonMap = {
    'winter': 'Inverno',
    'spring': 'Primavera',
    'summer': 'Verão',
    'fall': 'Outono'
  };

  // Formatação dos dados
  const formatDate = (dateString) => {
    if (!dateString) return 'Não disponível';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const modal = document.createElement('div');
  modal.className = 'anime-modal';
  modal.innerHTML = `
    <div class="modal-content">
      <span class="close-modal">&times;</span>
      
      <div class="modal-header">
        <h3>${anime.title}</h3>
        <div class="anime-meta">
          <span class="anime-type ${anime.media_type}">${anime.media_type || 'N/A'}</span>
          <span class="anime-nationality">${nationalityMap[anime.nat] || 'Outros'}</span>
        </div>
      </div>

      <div class="modal-body">
        <div class="info-grid">
          <div class="info-group">
            <h4>Informações Básicas</h4>
            <p><strong>Data de início:</strong> ${formatDate(anime.start_date)}</p>
            <p><strong>Data de término:</strong> ${formatDate(anime.end_date)}</p>
            <p><strong>Episódios:</strong> ${anime.num_episodes || 'N/A'}</p>
          </div>

          <div class="info-group">
            <h4>Temporada</h4>
            <p>${seasonMap[anime.start_season?.season] || 'N/A'} ${anime.start_season?.year || ''}</p>
          </div>

          <div class="info-group">
            <h4>Origem</h4>
            <p><strong>Tipo:</strong> ${anime.media_type || 'N/A'}</p>
            <p><strong>Fonte:</strong> ${anime.source || 'N/A'}</p>
            <p><strong>Estúdio:</strong> ${anime.studios?.map(s => s.name).join(', ') || 'N/A'}</p>
          </div>
        </div>

        <div class="info-group">
          <h4>Gêneros</h4>
          <div class="genre-tags">
            ${anime.genres?.map(g => `<span class="genre-tag">${g.name}</span>`).join('') || 'N/A'}
          </div>
        </div>

        ${anime.synopsis ? `
        <div class="info-group">
          <h4>Sinopse</h4>
          <p class="synopsis">${anime.synopsis}</p>
        </div>
        ` : ''}

        ${anime.alternative_titles?.synonyms?.length ? `
        <div class="info-group">
          <h4>Títulos Alternativos</h4>
          <p>${anime.alternative_titles.synonyms.join(', ')}</p>
        </div>
        ` : ''}
      </div>

    
  `;

  document.body.appendChild(modal);

  // Fechar modal
  modal.querySelector('.close-modal').addEventListener('click', () => modal.remove());
  modal.addEventListener('click', (e) => e.target === modal && modal.remove());
}

export function showLoadingSkeleton(count = 12) {
  const grid = document.getElementById('animeGrid');
  grid.innerHTML = Array(count).fill(`
    <div class="skeleton-loader"></div>
  `).join('');
}
