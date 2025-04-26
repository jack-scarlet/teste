// modules/cloud.js
export const initCloudButton = () => {
    const cloudButton = document.getElementById('cloudButton');
    const CLOUD_KEY = 'anitsu_cloud_link';
    
    // Verifica se já tem link salvo no localStorage
    const savedLink = localStorage.getItem(CLOUD_KEY);
    updateButtonAppearance(savedLink);
    
    cloudButton.addEventListener('click', () => {
        showCloudPrompt();
    });
    
    function showCloudPrompt() {
        // Remove prompt existente se houver
        const existingPrompt = document.querySelector('.cloud-prompt');
        if (existingPrompt) existingPrompt.remove();
        
        const promptHTML = `
            <div class="cloud-prompt">
                <h3>Configurar Link da Nuvem</h3>
                <p>Insira o link no formato:</p>
                <p><code>https://cloud.anitsu.moe/nextcloud/s/randomstring</code></p>
                <input type="text" id="cloudLinkInput" placeholder="Cole o link completo aqui" 
                       value="${savedLink || ''}">
                <div class="prompt-actions">
                    <button id="saveCloudLink" class="prompt-button save">Salvar</button>
                    <button id="clearCloudLink" class="prompt-button clear">Limpar</button>
                    <button id="acervoButton" class="prompt-button acervo">
                        <i class="fas fa-book"></i> Acervo
                    </button>
                </div>
                <div id="cloudError" class="error-message"></div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', promptHTML);
        
        // Foca no input automaticamente
        document.getElementById('cloudLinkInput').focus();
        
        document.getElementById('saveCloudLink').addEventListener('click', saveCloudLink);
        document.getElementById('clearCloudLink').addEventListener('click', clearCloudLink);
        document.getElementById('acervoButton').addEventListener('click', () => {
            window.open('https://anitsu.moe', '_blank');
        });
        
        // Adiciona suporte para tecla Enter
        document.getElementById('cloudLinkInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') saveCloudLink();
        });
    }
    
    function saveCloudLink() {
    const linkInput = document.getElementById('cloudLinkInput').value.trim();
    const errorElement = document.getElementById('cloudError');
    
    if (!linkInput) {
        errorElement.textContent = 'Por favor, insira um link';
        errorElement.style.display = 'block';
        return;
    }
    
    if (!isValidCloudLink(linkInput)) {
        errorElement.textContent = 'Formato incorreto! Use: https://cloud.anitsu.moe/nextcloud/s/seucodigo';
        errorElement.style.display = 'block';
        return;
    }
    
    localStorage.setItem(CLOUD_KEY, linkInput);
    updateButtonAppearance(linkInput);
    document.querySelector('.cloud-prompt').remove();
    showToast('Link da nuvem salvo com sucesso!');
    
    // Recarrega a página após 1 segundo para aplicar as mudanças
    setTimeout(() => {
        window.location.reload();
    }, 500);
}
    
    function clearCloudLink() {
        localStorage.removeItem(CLOUD_KEY);
        updateButtonAppearance(null);
        document.querySelector('.cloud-prompt').remove();
        showToast('Link da nuvem removido.', 'warning');
    }
    
    function updateButtonAppearance(link) {
        if (link) {
            cloudButton.innerHTML = '<i class="fas fa-cloud-check"></i> Nuvem';
            cloudButton.title = `Link configurado: ${link}`;
            cloudButton.classList.add('active');
        } else {
            cloudButton.innerHTML = '<i class="fas fa-cloud"></i> Nuvem';
            cloudButton.title = 'Configurar link da nuvem';
            cloudButton.classList.remove('active');
        }
    }
    
    function isValidCloudLink(link) {
        return /^https:\/\/cloud\.anitsu\.moe\/nextcloud\/s\/[a-zA-Z0-9]+$/.test(link);
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
};
