// scripts/modules/api.js
export async function fetchAnimeData() {
  try {
    const response = await fetch('../list/desenho_list.json?_=' + Date.now());
    if (!response.ok) throw new Error("HTTP error: " + response.status);
    
    const data = await response.json();
    
    // Converte o objeto de categorias em array único
    const allAnimes = Object.values(data).flat();
    
    if (!Array.isArray(allAnimes)) {
      throw new Error("Formato inválido após conversão");
    }
    
    return allAnimes;
  } catch (error) {
    console.error("Falha ao carregar animes:", error);
    return [];
  }
}
