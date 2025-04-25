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
  // Cria o modal básico - você pode personalizar depois
  const modal = document.createElement('div');
  modal.className = 'anime-modal';
  modal.innerHTML = `
    <div class="modal-content">
      <span class="close-modal">&times;</span>
      <h3>${anime.title}</h3>
      <p>Adicionar às listas</p>
      <!-- Aqui você pode adicionar mais conteúdo depois -->
    </div>
  `;

  // Adiciona ao body
  document.body.appendChild(modal);

  // Fecha o modal ao clicar no X
  modal.querySelector('.close-modal').addEventListener('click', () => {
    modal.remove();
  });

  // Fecha o modal ao clicar fora
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });
}

export function showLoadingSkeleton(count = 12) {
  const grid = document.getElementById('animeGrid');
  grid.innerHTML = Array(count).fill(`
    <div class="skeleton-loader"></div>
  `).join('');
}
