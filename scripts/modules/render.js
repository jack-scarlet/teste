let observer = null; // Para controlar o observer atual

export function renderAnimeGrid(animes, startIdx = 0, chunkSize = 30) {
  const grid = document.getElementById('animeGrid');
  
  if (startIdx === 0) {
    grid.innerHTML = ''; // Limpa se for novo carregamento
  }

  const itemsToRender = animes.slice(startIdx, startIdx + chunkSize);
  const fragment = document.createDocumentFragment();

  itemsToRender.forEach(anime => {
    fragment.appendChild(createAnimeCard(anime));
  });

  grid.appendChild(fragment);

  // Se ainda tem mais animes para carregar, ativa Lazy Loading
  if (startIdx + chunkSize < animes.length) {
    setupLazyLoad(animes, startIdx + chunkSize, chunkSize);
  } else {
    // Se terminou todos os animes, para o observer
    if (observer) {
      observer.disconnect();
    }
  }
}

// Função para ativar o Lazy Load
function setupLazyLoad(animes, nextStartIdx, chunkSize) {
  if (observer) observer.disconnect(); // Se já tem observer, limpa

  const loadTrigger = document.createElement('div');
  loadTrigger.className = 'load-more-trigger';
  document.getElementById('animeGrid').appendChild(loadTrigger);

  observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      observer.disconnect(); // Desliga para evitar chamadas duplicadas
      loadTrigger.remove();  // Remove o trigger antigo
      renderAnimeGrid(animes, nextStartIdx, chunkSize); // Carrega mais animes
    }
  }, { threshold: 0.1 });

  observer.observe(loadTrigger);
}
