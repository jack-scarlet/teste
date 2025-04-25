// modules/cloud.js
export const initCloudButton = () => {
    const cloudButton = document.getElementById('cloudButton');
    const CLOUD_KEY = 'anitsu_cloud_link';
    
    // Verifica se já tem link salvo
    const savedLink = sessionStorage.getItem(CLOUD_KEY);
    if (savedLink) {
        cloudButton.innerHTML = '<i class="fas fa-cloud-check"></i> Nuvem';
        cloudButton.title = 'Link da nuvem configurado';
    }
    
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
                <div>
                    <button id="saveCloudLink">Salvar</button>
                    <button id="clearCloudLink">Limpar</button>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', promptHTML);
        
        document.getElementById('saveCloudLink').addEventListener('click', () => {
            const linkInput = document.getElementById('cloudLinkInput').value.trim();
            
            if (linkInput && isValidCloudLink(linkInput)) {
                sessionStorage.setItem(CLOUD_KEY, linkInput);
                cloudButton.innerHTML = '<i class="fas fa-cloud-check"></i> Nuvem';
                cloudButton.title = 'Link da nuvem configurado';
                document.querySelector('.cloud-prompt').remove();
            } else {
                alert('Por favor, insira um link válido no formato especificado.');
            }
        });
        
        document.getElementById('clearCloudLink').addEventListener('click', () => {
            sessionStorage.removeItem(CLOUD_KEY);
            cloudButton.innerHTML = '<i class="fas fa-cloud"></i> Nuvem';
            cloudButton.title = '';
            document.querySelector('.cloud-prompt').remove();
        });
    }
    
    function isValidCloudLink(link) {
        return /^https:\/\/cloud\.anitsu\.moe\/nextcloud\/s\/[a-zA-Z0-9]+$/.test(link);
    }
};
