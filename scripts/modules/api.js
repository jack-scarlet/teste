// scripts/modules/api.js
export async function fetchAnimeData() {
  try {
    const response = await fetch('list/anime_list.json');
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Falha ao carregar dados:", error);
    return []; // Retorna array vazio para segurança
  }
}
