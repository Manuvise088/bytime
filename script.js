function loadSettingsSection() {
    document.querySelector('.fab').style.display = 'none';
    mainContent.innerHTML = `
        <div class="settings-page">
            <div class="settings-section">
                <h3>Tema</h3>
                <div class="theme-options">
                    <button class="theme-option ${currentTheme === 'default' ? 'active' : ''}" data-theme="default">
                        <div class="theme-preview default"></div>
                        <span>Predefinito</span>
                    </button>
                    <button class="theme-option ${currentTheme === 'green' ? 'active' : ''}" data-theme="green">
                        <div class="theme-preview green"></div>
                        <span>Verde</span>
                    </button>
                    <button class="theme-option ${currentTheme === 'red' ? 'active' : ''}" data-theme="red">
                        <div class="theme-preview red"></div>
                        <span>Rosso</span>
                    </button>
                    <button class="theme-option ${currentTheme === 'purple' ? 'active' : ''}" data-theme="purple">
                        <div class="theme-preview purple"></div>
                        <span>Viola</span>
                    </button>
                </div>
            </div>
            
            <div class="settings-section">
                <h3>Accessibilità</h3>
                <div class="switch-container">
                    <label class="switch">
                        <input type="checkbox" id="accessibility-toggle" ${accessibilityMode ? 'checked' : ''}>
                        <span class="slider round"></span>
                    </label>
                    <span>Modalità accessibilità</span>
                </div>
            </div>
            
            <div class="settings-section">
                <h3>Notifiche</h3>
                <div class="switch-container">
                    <label class="switch">
                        <input type="checkbox" id="notifications-toggle" ${notificationPermission ? 'checked' : ''}>
                        <span class="slider round"></span>
                    </label>
                    <span>Abilita notifiche</span>
                </div>
            </div>
            
            <div class="settings-section">
                <h3>Informazioni</h3>
                <div class="info-item">
                    <span>Versione</span>
                    <span>1.1.0</span>
                </div>
                <div class="info-item">
                    <span>Sviluppatore</span>
                    <span>Visentin Manuel</span>
                </div>
                <a href="mailto:mvisentin2008@gmail.com"><button class="segnala"><span class="material-icons">bug_report</span>Segnala un bug</button></a>
            </div>
        </div>
    `;
    
    document.querySelectorAll('.theme-option').forEach(option => {
        option.addEventListener('click', function() {
            const theme = this.dataset.theme;
            setTheme(theme);
        });
    });
    
    document.getElementById('accessibility-toggle')?.addEventListener('change', function() {
        accessibilityMode = this.checked;
        localStorage.setItem('accessibilityMode', accessibilityMode);
        applyTheme();
    });
    
    document.getElementById('notifications-toggle')?.addEventListener('change', function() {
        if (this.checked) {
            Notification.requestPermission().then(permission => {
                notificationPermission = permission === 'granted';
                if (!notificationPermission) {
                    this.checked = false;
                }
            });
        }
    });
    
    document.getElementById('install-btn')?.addEventListener('click', () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            deferredPrompt.userChoice.then((choiceResult) => {
                if (choiceResult.outcome === 'accepted') {
                    console.log('User accepted the install prompt');
                } else {
                    console.log('User dismissed the install prompt');
                }
                deferredPrompt = null;
            });
        }
    });
}

function applyTheme() {
    const root = document.documentElement;
    
    if (accessibilityMode) {
        document.body.classList.add('accessibility-mode');
    } else {
        document.body.classList.remove('accessibility-mode');
    }
    
    switch(currentTheme) {
        case 'green':
            root.style.setProperty('--primary-color', '#2E7D32');
            root.style.setProperty('--secondary-color', '#66BB6A');
            root.style.setProperty('--accent-color', '#FF7043');
            break;
        case 'red':
            root.style.setProperty('--primary-color', '#C62828');
            root.style.setProperty('--secondary-color', '#EF5350');
            root.style.setProperty('--accent-color', '#FFA000');
            break;
        case 'purple':
            root.style.setProperty('--primary-color', '#6A1B9A');
            root.style.setProperty('--secondary-color', '#AB47BC');
            root.style.setProperty('--accent-color', '#26C6DA');
            break;
        case 'dark':
            root.style.setProperty('--primary-color', '#121212');
            root.style.setProperty('--secondary-color', '#1E1E1E');
            root.style.setProperty('--accent-color', '#BB86FC');
            break;
        default:
            root.style.setProperty('--primary-color', '#5782c9');
            root.style.setProperty('--secondary-color', '#34A853');
            root.style.setProperty('--accent-color', '#EA4335');
    }
}