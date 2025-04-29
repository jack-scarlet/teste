// modules/cloud.js
export const initCloudButton = () => {
    const cloudButton = document.getElementById('cloudButton');
    const CLOUD_KEY = 'anitsu_cloud_link';
    
    // Verificação segura do elemento
    if (!cloudButton) {
        console.warn('Elemento #cloudButton não encontrado');
        return;
    }

    // Inicializa a estrutura do botão
    initializeButtonStructure(cloudButton);
    
    // Carrega link salvo e atualiza aparência
    const savedLink = localStorage.getItem(CLOUD_KEY);
    updateButtonAppearance(cloudButton, savedLink);
    
    // Event listeners
    cloudButton.addEventListener('click', handleButtonClick);
    
    // Funções auxiliares
    function initializeButtonStructure(button) {
        if (!button.querySelector('i')) {
            const icon = document.createElement('i');
            icon.className = 'fas fa-cloud';
            icon.ariaHidden = true;
            
            const textSpan = document.createElement('span');
            textSpan.className = 'button-text';
            textSpan.textContent = 'Nuvem';
            
            button.innerHTML = '';
            button.append(icon, textSpan);
        }
    }

    function handleButtonClick() {
        const existingPrompt = document.querySelector('.cloud-prompt');
        if (existingPrompt) {
            existingPrompt.classList.add('fade-out');
            setTimeout(() => existingPrompt.remove(), 300);
            return;
        }
        
        renderCloudPrompt();
    }

    function renderCloudPrompt() {
        const savedLink = localStorage.getItem(CLOUD_KEY);
        const promptHTML = `
            <div class="cloud-prompt">
                <div class="prompt-header">
                    <button class="close-prompt" aria-label="Fechar">
                    <h3>Configurar Link da Nuvem</h3>
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="prompt-body">
                    <p>Insira o link no formato:</p>
                    <p class="link-format"><code>https://cloud.anitsu.moe/nextcloud/s/randomstring</code></p>
                    <input type="text" 
                           id="cloudLinkInput" 
                           placeholder="Cole o link completo aqui"
                           value="${savedLink || ''}"
                           aria-label="Link da nuvem">
                    <div class="prompt-actions">
                        <button id="saveCloudLink" class="prompt-button save">
                            <i class="fas fa-save"></i> Salvar
                        </button>
                        <button id="clearCloudLink" class="prompt-button clear">
                            <i class="fas fa-trash-alt"></i> Limpar
                        </button>
                        <button id="acervoButton" class="prompt-button acervo">
                            <i class="fas fa-book"></i> Acervo
                        </button>
                    </div>
                    <div id="cloudError" class="error-message" aria-live="polite"></div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', promptHTML);
        
        // Configura eventos
        setupPromptEvents();
        
        // Foco automático no input
        document.getElementById('cloudLinkInput').focus();
    }

    function setupPromptEvents() {
        // Fechar prompt
        document.querySelector('.close-prompt').addEventListener('click', () => {
            document.querySelector('.cloud-prompt').classList.add('fade-out');
            setTimeout(() => document.querySelector('.cloud-prompt').remove(), 300);
        });
        
        // Salvar link
        document.getElementById('saveCloudLink').addEventListener('click', saveCloudLink);
        
        // Limpar link
        document.getElementById('clearCloudLink').addEventListener('click', clearCloudLink);
        
        // Abrir acervo
        document.getElementById('acervoButton').addEventListener('click', () => {
            window.open('https://anitsu.moe', '_blank');
        });
        
        // Suporte para tecla Enter
        document.getElementById('cloudLinkInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') saveCloudLink();
        });
    }

    function saveCloudLink() {
        const linkInput = document.getElementById('cloudLinkInput');
        const errorElement = document.getElementById('cloudError');
        const link = linkInput.value.trim();
        
        // Validação
        if (!link) {
            showError(errorElement, 'Por favor, insira um link');
            return;
        }
        
        if (!isValidCloudLink(link)) {
            showError(errorElement, 'Formato incorreto! Use: https://cloud.anitsu.moe/nextcloud/s/seucodigo');
            return;
        }
        
        // Salva e atualiza
        localStorage.setItem(CLOUD_KEY, link);
        updateButtonAppearance(cloudButton, link);
        showToast('Link da nuvem salvo com sucesso!', 'success');
        closePrompt();
        
        // Recarrega após breve delay
        setTimeout(() => window.location.reload(), 800);
    }

    function clearCloudLink() {
        localStorage.removeItem(CLOUD_KEY);
        updateButtonAppearance(cloudButton, null);
        showToast('Link da nuvem removido', 'warning');
        closePrompt();
    }

    function updateButtonAppearance(button, link) {
        const icon = button.querySelector('i');
        const textSpan = button.querySelector('.button-text');
        
        if (link) {
            icon.className = 'fas fa-cloud-check';
            button.title = `Link configurado: ${link}`;
            button.classList.add('active');
            textSpan.textContent = ' Nuvem';
        } else {
            icon.className = 'fas fa-cloud';
            button.title = 'Configurar link da nuvem';
            button.classList.remove('active');
            textSpan.textContent = ' Nuvem';
        }
    }

    function isValidCloudLink(link) {
        return /^https:\/\/cloud\.anitsu\.moe\/nextcloud\/s\/[a-zA-Z0-9]+$/.test(link);
    }

    function showError(element, message) {
        element.textContent = message;
        element.style.display = 'block';
        element.focus();
    }

    function showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast-notification ${type}`;
        toast.setAttribute('aria-live', 'assertive');
        toast.innerHTML = `
            <i class="fas ${getIconClass(type)}"></i>
            <span>${message}</span>
        `;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('fade-out');
            setTimeout(() => toast.remove(), 500);
        }, 3000);
    }

    function getIconClass(type) {
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };
        return icons[type] || 'fa-info-circle';
    }

    function closePrompt() {
        const prompt = document.querySelector('.cloud-prompt');
        if (prompt) {
            prompt.classList.add('fade-out');
            setTimeout(() => prompt.remove(), 300);
        }
    }
};
