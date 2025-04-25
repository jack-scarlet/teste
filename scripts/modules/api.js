export async function fetchAnimeData() {
  try {
    const response = await fetch('../../list/anime_list.json'); // Caminho relativo
    
    if (!response.ok) {
      throw new Error('Falha ao carregar dados');
    }

    return await response.json();
  } catch (error) {
    console.error('Erro na API:', error);
    return null;
  }
}

export function getCachedData() {
  const cached = sessionStorage.getItem('animeData');
  return cached ? JSON.parse(cached) : null;
}

export function cacheData(data) {
  sessionStorage.setItem('animeData', JSON.stringify(data));
}