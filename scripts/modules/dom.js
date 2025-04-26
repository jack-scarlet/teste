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

export function createFilterSelect(id, label, options) {
  const container = document.getElementById('filterDropdown');
  
  const wrapper = document.createElement('div');
  wrapper.className = 'filter-group';

  const labelElement = document.createElement('label');
  labelElement.htmlFor = id;
  labelElement.textContent = label;

  const select = document.createElement('select');
  select.id = id;
  
  const defaultOption = document.createElement('option');
  defaultOption.value = '';
  defaultOption.textContent = `Todos ${label.toLowerCase()}`;
  select.appendChild(defaultOption);

  options.forEach(option => {
    const optElement = document.createElement('option');
    optElement.value = option.value;
    optElement.textContent = option.label;
    select.appendChild(optElement);
  });

  wrapper.appendChild(labelElement);
  wrapper.appendChild(select);
  container.appendChild(wrapper);

  return select;
}
