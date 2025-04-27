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

export function createEnhancedFilterSelect({
  id,
  label,
  options,
  isMultiSelect = false,
  searchable = false,
  description = ''
}) {
  const container = document.createElement('div');
  container.className = 'filter-container';
  container.id = `${id}-filter`;
  
  const labelElement = document.createElement('label');
  labelElement.htmlFor = id;
  labelElement.innerHTML = `
    ${label}
    <span class="filter-counter" style="display: none;"></span>
    ${description ? `<span class="filter-tooltip">ℹ️<span class="tooltip-text">${description}</span></span>` : ''}
  `;
  
  const select = document.createElement('select');
  select.id = id;
  select.className = 'filter-select';
  
  if (isMultiSelect) {
    select.multiple = true;
    select.size = Math.min(options.length, 5); // Mostra até 5 opções
  }
  
  // Adiciona opção padrão
  const defaultOption = document.createElement('option');
  defaultOption.value = '';
  defaultOption.textContent = isMultiSelect ? `Selecione ${label.toLowerCase()}...` : `Todos ${label.toLowerCase()}`;
  select.appendChild(defaultOption);
  
  // Adiciona opções
  options.forEach(option => {
    const optElement = document.createElement('option');
    optElement.value = option.value;
    optElement.textContent = option.label;
    optElement.dataset.emoji = option.label.match(/^\p{Emoji}/u)?.[0] || ''; // Preserva emoji
    select.appendChild(optElement);
  });
  
  // Adiciona busca se necessário
  if (searchable && options.length > 10) {
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = `Buscar ${label.toLowerCase()}...`;
    searchInput.className = 'filter-search';
    
    searchInput.addEventListener('input', (e) => {
      const searchTerm = e.target.value.toLowerCase();
      Array.from(select.options).forEach(opt => {
        if (opt.value === '') return;
        const matches = opt.textContent.toLowerCase().includes(searchTerm);
        opt.style.display = matches ? '' : 'none';
      });
    });
    
    container.appendChild(searchInput);
  }
  
  container.appendChild(labelElement);
  container.appendChild(select);
  
  document.querySelector('.filters-section').appendChild(container);
  return select;
}


export function initMobileMenu() {
  const menuButton = document.getElementById('mobileMenuButton');
  const mainNav = document.getElementById('mainNav');

  menuButton?.addEventListener('click', () => {
    mainNav.classList.toggle('visible');
    menuButton.setAttribute(
      'aria-expanded', 
      mainNav.classList.contains('visible')
    );
  });
}

export function initFilterToggle() {
  const toggleButton = document.getElementById('toggleFilter');
  const filterContainer = document.getElementById('filters');

  toggleButton.addEventListener('click', () => {
    // Alterna a visibilidade da div de filtros
    filterContainer.classList.toggle('hidden');
  });
}
