// scripts/modules/api.js
export async function fetchAnimeData() {
  try {
    const response = await fetch('list/anime_list.json');
    if (!response.ok) throw new Error('Erro ao carregar dados');
    return await response.json();
  } catch (error) {
    console.error("Falha ao carregar animes:", error);
    return [];
  }
}

// REMOVA completamente as funções cacheData e getCachedData
