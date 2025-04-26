// modules/dom.js
export function createFilterSelect(id, label, options) {
  const container = document.createElement('div');
  container.className = 'filter-container';
  
  const labelElement = document.createElement('label');
  labelElement.htmlFor = id;
  labelElement.textContent = label;
  
  const select = document.createElement('select');
  select.id = id;
  select.className = 'filter-select';
  
  // Opção padrão
  const defaultOption = document.createElement('option');
  defaultOption.value = '';
  defaultOption.textContent = `Todos ${label.toLowerCase()}`;
  select.appendChild(defaultOption);
  
  // Adiciona opções
  options.forEach(option => {
    const opt = document.createElement('option');
    opt.value = option.value;
    opt.textContent = option.label;
    select.appendChild(opt);
  });
  
  container.appendChild(labelElement);
  container.appendChild(select);
  
  // Adiciona ao DOM - assumindo que existe um elemento com id 'filters'
  const filtersContainer = document.getElementById('filters') || document.body;
  filtersContainer.appendChild(container);
  
  return select;
}

// Outras funções do dom.js...
export function initMobileMenu() {
  // Implementação existente
}

export function initFilterToggle() {
  const toggleButton = document.getElementById('toggleFilter');
  const filterContainer = document.getElementById('filters');

  toggleButton.addEventListener('click', () => {
    // Alterna a visibilidade da div de filtros
    filterContainer.classList.toggle('hidden');
  });
}

