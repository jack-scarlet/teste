// main.js

// Ajuste dos números de exibição na home
const HOME_PAGE_DISPLAY_COUNT = 20;

// Função principal para processar dados
const processAnimeData = (data) => {
  let animeList = [];
  let historyAnime = null;

  if (Array.isArray(data)) {
    animeList = [...data];
    historyAnime = data.find(anime => 
      anime.genres?.some(g => g.name.toLowerCase().includes('history'))
    );
    if (historyAnime) {
      animeList = animeList.filter(anime => anime.id !== historyAnime.id);
    }
  } else {
    historyAnime = data.history?.[0];

    const validCategories = [
      '#', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
      'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
      'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'
    ];

    validCategories.forEach(category => {
      if (data[category] && Array.isArray(data[category])) {
        const filteredCategory = historyAnime
          ? data[category].filter(anime => anime.id !== historyAnime.id)
          : data[category];

        animeList = [...animeList, ...filteredCategory];
      }
    });
  }

  return { animeList, historyAnime };
};

// Função para carregar os animes e renderizar na página
const loadAnimes = async () => {
  try {
    const response = await fetch('caminho/do/seu/anime_list.json');
    const data = await response.json();

    const { animeList, historyAnime } = processAnimeData(data);

    const randomAnimes = animeList.sort(() => Math.random() - 0.5);

    const filteredAnimes = historyAnime
      ? [historyAnime, ...randomAnimes].slice(0, HOME_PAGE_DISPLAY_COUNT)
      : randomAnimes.slice(0, HOME_PAGE_DISPLAY_COUNT);

    // Exibe os animes (você deve ter sua função de renderização)
    renderAnimeCards(filteredAnimes);

    // Para debugging
    window._anitsuDebug = {
      animeList,
      historyAnime,
      randomAnimes,
      filteredAnimes
    };

  } catch (error) {
    console.error('Erro ao carregar os animes:', error);
  }
};

// Função para renderizar os cards (exemplo)
const renderAnimeCards = (animes) => {
  const container = document.getElementById('anime-container');
  container.innerHTML = '';

  animes.forEach(anime => {
    const card = document.createElement('div');
    card.className = 'anime-card';

    card.innerHTML = `
      <img src="${anime.image}" alt="${anime.title}" />
      <h3>${anime.title}</h3>
      <a href="${anime.url}">Ver mais</a>
    `;

    container.appendChild(card);
  });
};

// Inicia o carregamento ao abrir a página
window.addEventListener('DOMContentLoaded', loadAnimes);
