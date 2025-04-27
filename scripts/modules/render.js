export function renderAnimeGrid(animes, startIdx = 0, chunkSize = 30) {
  const grid = document.getElementById('animeGrid');
  const chunk = animes.slice(startIdx, startIdx + chunkSize);

  // Limpa apenas no primeiro carregamento
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
    <a href="${anime.url}" target="_blank" aria-label="${anime.title}">
      <img 
        src="${anime.image}" 
        alt="${anime.title}" 
        loading="lazy"
        onerror="this.src='placeholder.jpg'"
      >
      <h3>${anime.title}</h3>
    </a>
  `;
  return card;
}

export function showLoadingSkeleton(count = 12) {
  const grid = document.getElementById('animeGrid');
  grid.innerHTML = Array(count).fill(`
    <div class="skeleton-loader"></div>
  `).join('');
}
