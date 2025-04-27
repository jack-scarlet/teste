export function renderAnimeGrid(animes, startIdx = 0, chunkSize = 24) { // Default 24
  const grid = document.getElementById('animeGrid');
  grid.innerHTML = ''; // Sempre limpa ao renderizar

  const itemsToRender = animes.slice(startIdx, startIdx + chunkSize);
  const fragment = document.createDocumentFragment();

  itemsToRender.forEach(anime => {
    fragment.appendChild(createAnimeCard(anime));
  });

  grid.appendChild(fragment);
}

function createAnimeCard(anime) {
  const card = document.createElement('div');
  card.className = 'anime-card';
  
  // Verifica se o anime tem URL
  if (!anime.url || anime.url === '#') {
    card.innerHTML = `
      <div class="anime-card-container unavailable">
        <img 
          src="${anime.image}" 
          alt="${anime.title}"
          loading="lazy"
         
        >
        <div class="anime-title-overlay">
          <span>${anime.title}</span>
        </div>
        <div class="unavailable-overlay">
          <i class="fas fa-exclamation-circle"></i>
          <span>Indisponível</span>
        </div>
      </div>
    `;
    
    // Adiciona evento para mostrar mensagem
    card.addEventListener('click', (e) => {
      e.preventDefault();
      showUnavailableMessage();
    });
    
    return card;
  }

  // Obtém o link completo
  const fullUrl = getAnimeFullUrl(anime);
  const isCloudLink = fullUrl.includes('cloud.anitsu.moe');
  
  card.innerHTML = `
    <div class="anime-card-container">
      <a href="${fullUrl}" target="_blank" aria-label="${anime.title}" class="anime-image-link">
        <img 
          src="${anime.image}" 
          alt="${anime.title}"
          loading="lazy"
          onerror="this.src='placeholder.jpg'"
        >
        <div class="anime-title-overlay">
          <span>${anime.title}</span>
        </div>
        ${isCloudLink ? '<span class="cloud-indicator" title="Abrir na nuvem"><i class="fas fa-cloud"></i></span>' : ''}
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

function getAnimeFullUrl(anime) {
  const CLOUD_KEY = 'anitsu_cloud_link';
  const cloudBaseUrl = localStorage.getItem(CLOUD_KEY);
  
  // Se não tem URL no anime, retorna fallback ou '#'
  if (!anime.url || anime.url === '#') return anime.fallbackUrl || '#';
  
  // Se já é uma URL completa, retorna diretamente
  if (anime.url.startsWith('http')) {
    return anime.url;
  }
  
  // Se tem cloud configurada, combina com o caminho do anime
  if (cloudBaseUrl) {
    // Remove o '?path=' inicial se existir
    const animePath = anime.url.startsWith('?path=') ? anime.url.substring(6) : anime.url;
    
    // Verifica se a URL base já tem parâmetros
    const hasQuery = cloudBaseUrl.includes('?');
    
    // Se a URL base já tem parâmetros, usa &, senão usa ?
    const separator = hasQuery ? '&' : '?';
    
    // Monta a URL final
    return `${cloudBaseUrl}${separator}path=${animePath}`;
  }
  
  // Fallback padrão (pode ser seu site principal ou outro)
  return `https://anitsu.moe${anime.url.startsWith('/') ? '' : '/'}${anime.url}`;
}

function openModal(anime) {
  // Se o anime não tem URL, mostra mensagem e não abre modal
  if (!anime.url || anime.url === '#') {
    showUnavailableMessage();
    return;
  }

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

  const fullUrl = getAnimeFullUrl(anime);
  const isCloudLink = fullUrl.includes('cloud.anitsu.moe');
  const CLOUD_KEY = 'anitsu_cloud_link';
  const hasCloudConfig = !!localStorage.getItem(CLOUD_KEY);

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
          ${isCloudLink ? '<span class="cloud-badge"><i class="fas fa-cloud"></i> Nuvem</span>' : ''}
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

      <div class="modal-footer">
        <a href="${fullUrl}" target="_blank" class="modal-button open-link">
          <i class="fas fa-external-link-alt"></i> ${isCloudLink ? 'Abrir na Nuvem' : 'Abrir Anime'}
        </a>
        
        <button class="modal-button cloud-config" data-action="config">
          <i class="fas fa-cog"></i> ${hasCloudConfig ? 'Alterar Nuvem' : 'Configurar Nuvem'}
        </button>
        
        <button class="modal-button watchlist">
          <i class="fas fa-bookmark"></i> Favoritos
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Configurar eventos
  modal.querySelector('.close-modal').addEventListener('click', () => modal.remove());
  modal.addEventListener('click', (e) => e.target === modal && modal.remove());
  
  // Configurar botão da nuvem
  modal.querySelector('.cloud-config').addEventListener('click', (e) => {
    e.stopPropagation();
    showCloudConfigPrompt();
    modal.remove();
  });
}

function showUnavailableMessage() {
  // Remove notificação existente se houver
  const existingToast = document.querySelector('.unavailable-toast');
  if (existingToast) existingToast.remove();

  const toast = document.createElement('div');
  toast.className = 'unavailable-toast';
  toast.innerHTML = `
    <i class="fas fa-exclamation-triangle"></i>
    <span>Anime não disponível no acervo</span>
  `;
  
  document.body.appendChild(toast);
  
  // Remove após 3 segundos
  setTimeout(() => {
    toast.classList.add('fade-out');
    setTimeout(() => toast.remove(), 500);
  }, 3000);
}

function showCloudConfigPrompt() {
  const CLOUD_KEY = 'anitsu_cloud_link';
  const existingPrompt = document.querySelector('.cloud-prompt');
  if (existingPrompt) existingPrompt.remove();

  const promptHTML = `
    <div class="cloud-prompt">
      <h3>Configurar Link da Nuvem</h3>
      <p>Insira o link base da sua nuvem no formato:</p>
      <p><code>https://cloud.anitsu.moe/nextcloud/s/randomstring</code></p>
      <input type="text" id="cloudLinkInput" placeholder="Cole o link base aqui" 
             value="${localStorage.getItem(CLOUD_KEY) || ''}">
      <div class="prompt-actions">
        <button id="saveCloudLink" class="prompt-button save">Salvar</button>
        <button id="clearCloudLink" class="prompt-button clear">Limpar</button>
      </div>
      <div class="cloud-hint">
        <i class="fas fa-info-circle"></i> O link será combinado com os caminhos específicos de cada anime
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', promptHTML);
  document.getElementById('cloudLinkInput').focus();

  // Configurar eventos do prompt
  document.getElementById('saveCloudLink').addEventListener('click', saveCloudConfig);
  document.getElementById('clearCloudLink').addEventListener('click', clearCloudConfig);
  
  // Adicionar suporte para tecla Enter
  document.getElementById('cloudLinkInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') saveCloudConfig();
  });
}

function saveCloudConfig() {
  const CLOUD_KEY = 'anitsu_cloud_link';
  const input = document.getElementById('cloudLinkInput');
  const link = input.value.trim();

  if (isValidCloudLink(link)) {
    localStorage.setItem(CLOUD_KEY, link);
    document.querySelector('.cloud-prompt').remove();
    showToast('Configuração da nuvem salva com sucesso!', 'success');
  } else {
    showToast('Por favor, insira um link válido no formato especificado.', 'error');
    input.focus();
  }
}

function clearCloudConfig() {
  const CLOUD_KEY = 'anitsu_cloud_link';
  localStorage.removeItem(CLOUD_KEY);
  document.querySelector('.cloud-prompt').remove();
  showToast('Configuração da nuvem removida.', 'warning');
}

function isValidCloudLink(link) {
  return /^https:\/\/cloud\.anitsu\.moe\/nextcloud\/s\/[a-zA-Z0-9]+(\?.*)?$/.test(link);
}

function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast-notification ${type}`;
  toast.innerHTML = `
    <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
    <span>${message}</span>
  `;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('fade-out');
    setTimeout(() => toast.remove(), 500);
  }, 3000);
}

export function showLoadingSkeleton(count = 12) {
  const grid = document.getElementById('animeGrid');
  grid.innerHTML = Array(count).fill(`
    <div class="skeleton-loader"></div>
  `).join('');
}
