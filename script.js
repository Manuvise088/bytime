let currentUser = localStorage.getItem('username') || null;
let timers = JSON.parse(localStorage.getItem('timers')) || [];
let alarms = JSON.parse(localStorage.getItem('alarms')) || [];
let cronometers = JSON.parse(localStorage.getItem('cronometers')) || []; 
let activeTimer = null;
let clockStyle = localStorage.getItem('clockStyle') || 'digital';
let timezones = JSON.parse(localStorage.getItem('timezones')) || [];
let stopwatch = {
    running: false,
    startTime: 0,
    elapsed: 0,
    laps: []
};
let currentSection = 'home';
let userAvatar = localStorage.getItem('userAvatar') || null;
let currentTheme = localStorage.getItem('theme') || 'default';
let notificationPermission = false;
let serviceWorkerRegistration = null;
let deferredPrompt = null;

const mainContent = document.getElementById('main-content');
const headerTitle = document.getElementById('header-title');
const accountBtn = document.getElementById('account-btn');
const backBtn = document.getElementById('back-btn');
const timerModal = document.getElementById('timer-modal');
const alarmModal = document.getElementById('alarm-modal');
const addBtn = document.getElementById('add-btn');
const addMenu = document.getElementById('add-menu');
const addTimerMenu = document.getElementById('add-timer-menu');
const addAlarmMenu = document.getElementById('add-alarm-menu');

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    applyTheme();
    
    if (!currentUser) {
        showUsernamePrompt();
    } else {
        loadSection(currentSection);
    }
    
    setupEventListeners();

    // Request notification permission
    if ('Notification' in window) {
        Notification.requestPermission().then(permission => {
            notificationPermission = permission === 'granted';
        });
    }
    
    // Register service worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js').then(registration => {
            serviceWorkerRegistration = registration;
        }).catch(err => {
            console.error('ServiceWorker registration failed: ', err);
        });
    }
    
    // Handle PWA installation prompt
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
    });
    
    // Load active timer if exists
    const savedActiveTimer = localStorage.getItem('activeTimer');
    if (savedActiveTimer) {
        activeTimer = JSON.parse(savedActiveTimer);
        startTimerCountdown(activeTimer);
    }
    
    // Load stopwatch state if exists
    const savedStopwatch = localStorage.getItem('stopwatch');
    if (savedStopwatch) {
        const parsed = JSON.parse(savedStopwatch);
        stopwatch = {
            running: false, // Always start as not running
            startTime: parsed.startTime,
            elapsed: parsed.elapsed,
            laps: parsed.laps || []
        };
    }
    
    // Start checking alarms
    checkAlarms();
});

function showUsernamePrompt() {
    document.querySelector('nav').style.display = 'none';
    document.getElementById('add-btn').style.display = 'none';
    
    mainContent.innerHTML = `
        <div class="username-page">
            <div class="username-header">
                <h1>Benvenuto in ByTime</h1>
                <p>Personalizza la tua esperienza</p>
            </div>
            
            <div class="avatar-section">
                <div class="avatar-preview" id="avatar-preview">
                    <span class="material-icons default-avatar">account_circle</span>
                </div>
                <label for="avatar-upload" class="btn-upload">
                    <span class="material-icons">add_a_photo</span>
                    Scegli immagine
                </label>
                <input type="file" id="avatar-upload" accept="image/*" style="display: none;">
            </div>
            
            <div class="username-form">
                <div class="input-container">
                    <label for="username-input">Il tuo nome</label>
                    <input 
                        type="text" 
                        id="username-input" 
                        placeholder="Come vuoi essere chiamato?" 
                        maxlength="20"
                        autocomplete="off"
                        autocapitalize="words"
                    >
                    <div class="input-border"></div>
                </div>
                
                <div class="username-actions">
                    <button id="save-username-btn" class="btn-primary" disabled>
                        <span class="material-icons">check</span>
                        Conferma
                    </button>
                    <button id="skip-username-btn" class="btn-secondary">
                        <span class="material-icons">arrow_forward</span>
                        Salta e continua
                    </button>
                </div>
            </div>
            
            <div class="username-footer">
                <p>Puoi cambiare nome e immagine in qualsiasi momento dalle impostazioni</p>
            </div>
        </div>
    `;

    // Add styles for avatar section
    const style = document.createElement('style');
    style.textContent = `
        .username-page {
            padding: 20px;
            max-width: 500px;
            margin: 0 auto;
        }
        .username-header {
            text-align: center;
            margin-bottom: 20px;
        }
        .avatar-section {
            display: flex;
            flex-direction: column;
            align-items: center;
            margin: 20px 0;
        }
        .avatar-preview {
            width: 100px;
            height: 100px;
            border-radius: 50%;
            background-color: #f0f0f0;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            margin-bottom: 10px;
            border: 2px solid var(--primary-color);
        }
        .avatar-preview img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        .avatar-preview .default-avatar {
            font-size: 48px;
            color: #666;
        }
        .btn-upload {
            background-color: var(--primary-color);
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            display: flex;
            align-items: center;
            gap: 8px;
            cursor: pointer;
            font-size: 14px;
            transition: opacity 0.3s;
        }
        .btn-upload:hover {
            opacity: 0.9;
        }
        .username-form {
            margin-top: 20px;
        }
        .input-container {
            margin-bottom: 20px;
        }
        .username-actions {
            display: flex;
            gap: 10px;
            margin-top: 20px;
        }
        .username-footer {
            margin-top: 30px;
            text-align: center;
            font-size: 0.9em;
            color: #666;
        }
    `;
    document.head.appendChild(style);

    let avatarFile = null;
    const avatarPreview = document.getElementById('avatar-preview');
    const avatarUpload = document.getElementById('avatar-upload');
    const usernameInput = document.getElementById('username-input');
    const saveButton = document.getElementById('save-username-btn');

    // Handle image upload
    avatarUpload.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.match('image.*')) {
                alert('Seleziona un file immagine valido');
                return;
            }
            
            const reader = new FileReader();
            reader.onload = function(event) {
                avatarPreview.innerHTML = '';
                const img = document.createElement('img');
                img.src = event.target.result;
                avatarPreview.appendChild(img);
                avatarFile = file;
            };
            reader.readAsDataURL(file);
        }
    });

    // Validate username input
    usernameInput.addEventListener('input', function() {
        const username = this.value.trim();
        saveButton.disabled = !username;
        saveButton.classList.toggle('disabled', !username);
    });

    // Save user data
    document.getElementById('save-username-btn').addEventListener('click', function() {
        const username = usernameInput.value.trim();
        if (!username) return;
        
        currentUser = username;
        localStorage.setItem('username', username);
        
        // Save image if present
        if (avatarFile) {
            const reader = new FileReader();
            reader.onload = function(event) {
                localStorage.setItem('userAvatar', event.target.result);
                userAvatar = event.target.result;
                restoreUI();
                loadSection('home');
            };
            reader.readAsDataURL(avatarFile);
        } else {
            restoreUI();
            loadSection('home');
        }
    });
    
    // Skip username setup
    document.getElementById('skip-username-btn').addEventListener('click', function() {
        currentUser = 'Guest';
        localStorage.setItem('username', 'Guest');
        localStorage.removeItem('userAvatar');
        userAvatar = null;
        restoreUI();
        loadSection('home');
    });

    function restoreUI() {
        document.querySelector('nav').style.display = 'flex';
        document.getElementById('add-btn').style.display = 'flex';
        document.head.removeChild(style);
    }
}

function getGreeting() {
    if (!currentUser) return "Benvenuto in ByTime";
    
    const now = new Date();
    const hours = now.getHours();
    
    if (hours >= 6 && hours < 12) {
        return `Buongiorno, ${currentUser}!`;
    } else if (hours >= 12 && hours <= 13) {
        return `Buon pranzo, ${currentUser}!`;
    } else if (hours > 13 && hours <= 18) {
        return `Buon pomeriggio, ${currentUser}!`;
    } else if (hours > 18 && hours <= 22) {
        return `Buonasera, ${currentUser}!`;
    } else {
        return `Buona notte, ${currentUser}!`;
    }
}

function setupEventListeners() {
    // Navigation buttons
    document.querySelectorAll('.nav-btn').forEach(button => {
        button.addEventListener('click', function() {
            const section = this.dataset.section;
            loadSection(section);
            
            document.querySelectorAll('.nav-btn').forEach(navBtn => navBtn.classList.remove('active'));
            this.classList.add('active');
            
            backBtn.style.display = section === 'home' ? 'none' : 'flex';
        });
    });

    // Back button
    backBtn.addEventListener('click', () => {
        loadSection('home');
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.section === 'home') {
                btn.classList.add('active');
            }
        });
        backBtn.style.display = 'none';
    });

    // Add button menu
    addBtn.addEventListener('click', toggleAddMenu);
    addTimerMenu.addEventListener('click', () => {
        timerModal.style.display = 'block';
        addMenu.classList.remove('show');
        addBtn.classList.remove('menu-open');
    });
    addAlarmMenu.addEventListener('click', () => {
        alarmModal.style.display = 'block';
        addMenu.classList.remove('show');
        addBtn.classList.remove('menu-open');
    });
    
    // Close modal buttons
    Array.from(document.getElementsByClassName('close')).forEach(button => {
        button.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
        });
    });
    
    // Timer and alarm creation
    document.getElementById('start-timer').addEventListener('click', createNewTimer);
    document.getElementById('save-alarm').addEventListener('click', createNewAlarm);
    
    // Alarm days selection
    document.querySelectorAll('.days button').forEach(button => {
        button.addEventListener('click', function() {
            this.classList.toggle('active');
        });
    });
    
    // Close modals when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
        
        if (!event.target.closest('#add-btn') && !event.target.closest('.add-menu')) {
            addMenu.classList.remove('show');
            addBtn.classList.remove('menu-open');
        }
    });
    
    // Account button
    accountBtn.addEventListener('click', () => {
        loadSection('settings');
        document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
        backBtn.style.display = 'flex';
    });
}

function toggleAddMenu() {
    addMenu.classList.toggle('show');
    addBtn.classList.toggle('menu-open');
}

function loadSection(section) {
    currentSection = section;
    headerTitle.textContent = getSectionTitle(section);
    
    switch(section) {
        case 'home':
            loadHomeSection();
            break;
        case 'cronometers':
            loadStopwatchSection();
            break;
        case 'timers':
            loadTimersSection();
            break;
        case 'alarms':
            loadAlarmsSection();
            break;
        case 'settings':
            loadSettingsSection();
            break;
        case 'feed':
            loadFeedSection();
            break;
        default:
            loadHomeSection();
    }
}

function loadHomeSection() {
    mainContent.innerHTML = `
        <div class="greeting">
            <h1>${getGreeting()}</h1>
        </div>
        
        <div class="section-title">
            <h2>Timer recenti</h2>
            <a href="#" class="section-btn" data-section="timers">
                <span class="material-icons">timer</span>
                <span>Vedi tutti</span>
            </a>
        </div>
        
        ${timers.length > 0 ? 
            timers.slice(0, 3).map(timer => `
                <div class="card" data-id="${timer.id}">
                    <div class="card-content">
                        <div>
                            <h3>${timer.name || 'Timer'}</h3>
                            <p class="time-display">${formatTime(timer.duration)}</p>
                        </div>
                        <button class="icon-btn play-btn">
                            <span class="material-icons">${timer.id === activeTimer?.id ? 'pause' : 'play_arrow'}</span>
                        </button>
                    </div>
                    ${timer.id === activeTimer?.id ? 
                        `<div class="progress-bar">
                            <div class="progress" style="width: ${calculateProgress(activeTimer)}%;"></div>
                        </div>` : ''
                    }
                </div>
            `).join('') : 
            `<div class="empty-state">
                <span class="material-icons">timer</span>
                <p>Nessun timer impostato</p>
            </div>`
        }
        
        <div class="separator"></div>
        
        <div class="section-title">
            <h2>Sveglie recenti</h2>
            <a href="#" class="section-btn" data-section="alarms">
                <span class="material-icons">alarm</span>
                <span>Vedi tutti</span>
            </a>
        </div>
        
        ${alarms.length > 0 ? 
            alarms.slice(0, 3).map(alarm => `
                <div class="card" data-id="${alarm.id}">
                    <div class="card-content">
                        <div>
                            <h3>${alarm.name || 'Sveglia'}</h3>
                            <p class="time-display">${formatAlarmTime(alarm.time)} ${alarm.days ? `(${formatDays(alarm.days)})` : ''}</p>
                        </div>
                        <div class="alarm-status">
                            <button class="icon-btn toggle-alarm-btn">
                                <span class="material-icons ${alarm.active ? 'active' : 'inactive'}">${alarm.active ? 'notifications_active' : 'notifications_off'}</span>
                            </button>
                        </div>
                    </div>
                </div>
            `).join('') : 
            `<div class="empty-state">
                <span class="material-icons">alarm</span>
                <p>Nessuna sveglia impostata</p>
            </div>`
        }
    `;
    
    // Add event listeners to dynamic elements
    document.querySelectorAll('.play-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const timerId = this.closest('.card').dataset.id;
            const timer = timers.find(t => t.id === timerId);
            toggleTimer(timer);
        });
    });
    
    document.querySelectorAll('.toggle-alarm-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const alarmId = this.closest('.card').dataset.id;
            toggleAlarm(alarmId);
        });
    });
    
    document.querySelectorAll('.section-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            loadSection(this.dataset.section);
            document.querySelectorAll('.nav-btn').forEach(navBtn => {
                navBtn.classList.remove('active');
                if (navBtn.dataset.section === this.dataset.section) {
                    navBtn.classList.add('active');
                }
            });
            backBtn.style.display = 'flex';
        });
    });
}

function loadTimersSection() {
    document.querySelector('.fab').style.display = 'flex';
    
    mainContent.innerHTML = `
        <div class="tabs">
            <button class="tab-btn active" data-tab="timers">Timer</button>
            <button class="tab-btn" data-tab="alarms">Sveglie</button>
        </div>
        
        <div class="tab-content active" id="timers-tab">
            ${timers.length > 0 ? 
                timers.map(timer => `
                    <div class="card" data-id="${timer.id}">
                        <div class="card-content">
                            <div>
                                <h3>${timer.name || 'Timer'}</h3>
                                <p class="time-display">${formatTime(timer.duration)}</p>
                            </div>
                            <div class="timer-actions">
                                <button class="icon-btn play-btn">
                                    <span class="material-icons">${timer.id === activeTimer?.id ? 'pause' : 'play_arrow'}</span>
                                </button>
                                <button class="icon-btn delete-timer-btn">
                                    <span class="material-icons">delete</span>
                                </button>
                            </div>
                        </div>
                        ${timer.id === activeTimer?.id ? 
                            `<div class="progress-bar">
                                <div class="progress" style="width: ${calculateProgress(activeTimer)}%;"></div>
                            </div>` : ''
                        }
                    </div>
                `).join('') : 
                `<div class="empty-state">
                    <span class="material-icons">timer</span>
                    <p>Nessun timer impostato</p>
                    <button id="create-first-timer" class="btn-primary">
                        <span class="material-icons">add</span>
                        Crea il tuo primo timer
                    </button>
                </div>`
            }
        </div>
        
        <div class="tab-content" id="alarms-tab">
            ${alarms.length > 0 ? 
                alarms.map(alarm => `
                    <div class="card" data-id="${alarm.id}">
                        <div class="card-content">
                            <div>
                                <h3>${alarm.name || 'Sveglia'}</h3>
                                <p class="time-display">${formatAlarmTime(alarm.time)} ${alarm.days ? `(${formatDays(alarm.days)})` : ''}</p>
                            </div>
                            <div class="alarm-actions">
                                <button class="icon-btn toggle-alarm-btn">
                                    <span class="material-icons ${alarm.active ? 'active' : 'inactive'}">${alarm.active ? 'notifications_active' : 'notifications_off'}</span>
                                </button>
                                <button class="icon-btn delete-alarm-btn">
                                    <span class="material-icons">delete</span>
                                </button>
                            </div>
                        </div>
                    </div>
                `).join('') : 
                `<div class="empty-state">
                    <span class="material-icons">alarm</span>
                    <p>Nessuna sveglia impostata</p>
                    <button id="create-first-alarm" class="btn-primary">
                        <span class="material-icons">add</span>
                        Crea la tua prima sveglia
                    </button>
                </div>`
            }
        </div>
    `;

    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const tabId = this.dataset.tab;
            
            document.querySelectorAll('.tab-btn').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            document.getElementById(`${tabId}-tab`).classList.add('active');
        });
    });

    // Timer controls
    document.querySelectorAll('.play-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const timerId = this.closest('.card').dataset.id;
            const timer = timers.find(t => t.id === timerId);
            toggleTimer(timer);
        });
    });

    // Delete timer
    document.querySelectorAll('.delete-timer-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const timerId = this.closest('.card').dataset.id;
            deleteTimer(timerId);
        });
    });

    // Toggle alarm
    document.querySelectorAll('.toggle-alarm-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const alarmId = this.closest('.card').dataset.id;
            toggleAlarm(alarmId);
        });
    });

    // Delete alarm
    document.querySelectorAll('.delete-alarm-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const alarmId = this.closest('.card').dataset.id;
            deleteAlarm(alarmId);
        });
    });

    // Create first timer button
    document.getElementById('create-first-timer')?.addEventListener('click', function() {
        timerModal.style.display = 'block';
    });

    // Create first alarm button
    document.getElementById('create-first-alarm')?.addEventListener('click', function() {
        alarmModal.style.display = 'block';
    });
}

function loadStopwatchSection() {
    document.querySelector('.fab').style.display = 'none';
    
    mainContent.innerHTML = `
        <div class="stopwatch-container">
            <div id="stopwatch-display">${formatStopwatchTime(stopwatch.elapsed)}</div>
            
            <div class="stopwatch-controls">
                <button id="stopwatch-start-stop" class="stopwatch-btn ${stopwatch.running ? 'stop' : 'start'}">
                    <span class="material-icons">${stopwatch.running ? 'pause' : 'play_arrow'}</span>
                </button>
                <button id="stopwatch-lap-reset" class="stopwatch-btn ${stopwatch.running ? 'lap' : 'reset'}">
                    <span class="material-icons">${stopwatch.running ? 'flag' : 'replay'}</span>
                </button>
            </div>
            
            <div id="laps-container" class="laps-container">
                ${stopwatch.laps.length > 0 ? `
                    <div class="laps-header">
                        <span>Giro</span>
                        <span>Tempo</span>
                    </div>
                    ${stopwatch.laps.map((lap, index) => `
                        <div class="lap-item">
                            <span>Giro ${index + 1}</span>
                            <span>${formatStopwatchTime(lap)}</span>
                        </div>
                    `).join('')}
                ` : ''}
            </div>
        </div>
    `;

    // Start/stop button
    document.getElementById('stopwatch-start-stop').addEventListener('click', toggleStopwatch);
    
    // Lap/reset button
    document.getElementById('stopwatch-lap-reset').addEventListener('click', function() {
        if (stopwatch.running) {
            addLap();
        } else {
            resetStopwatch();
        }
    });

    // Update display if running
    if (stopwatch.running) {
        startStopwatchUpdate();
    }
}

function loadFeedSection() {
    document.querySelector('.fab').style.display = 'none';
    
    mainContent.innerHTML = `
        <div class="feed-page">
            <div class="clock-display">
                <div id="clock" class="${clockStyle}">
                    ${clockStyle === 'analog' ? `
                        <div class="analog-clock">
                            <div class="clock-face">
                                <div class="hand hour-hand"></div>
                                <div class="hand minute-hand"></div>
                                <div class="hand second-hand"></div>
                            </div>
                        </div>
                    ` : `
                        <div class="digital-clock" id="local-time">
                            ${formatTime(new Date())}
                        </div>
                    `}
                </div>
                <div class="clock-style-toggle">
                    <button class="style-btn ${clockStyle === 'digital' ? 'active' : ''}" data-style="digital">Digitale</button>
                    <button class="style-btn ${clockStyle === 'analog' ? 'active' : ''}" data-style="analog">Analogico</button>
                </div>
            </div>
            
            <div class="weather-section">
                <h3>Meteo locale</h3>
                <div id="weather-container" class="weather-container">
                    <div class="weather-loading">
                        <span class="material-icons">cloud</span>
                        <p>Caricamento dati meteo...</p>
                    </div>
                </div>
            </div>
            
            <div class="local-info">
                <h3>Informazioni locali</h3>
                <div class="info-grid">
                    <div class="info-item">
                        <span class="material-icons">calendar_today</span>
                        <div>
                            <span id="local-date">${new Date().toLocaleDateString('it-IT', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                            <small id="local-time-full">${new Date().toLocaleTimeString('it-IT', {hour: '2-digit', minute:'2-digit', second:'2-digit'})}</small>
                        </div>
                    </div>
                    <div class="info-item">
                        <span class="material-icons">brightness_5</span>
                        <div>
                            <div id="sun-times">Caricamento dati sole...</div>
                            <small id="location-status" class="status-text"></small>
                        </div>
                    </div>
                    <div class="info-item">
                        <span class="material-icons">location_on</span>
                        <div>
                            <span id="local-location">${Intl.DateTimeFormat().resolvedOptions().timeZone.replace(/_/g, ' ')}</span>
                            <small id="local-coords">Caricamento coordinate...</small>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    const clockElement = document.getElementById('clock');
    const styleButtons = document.querySelectorAll('.style-btn');
    
    // Clock style toggle
    styleButtons.forEach(button => {
        button.addEventListener('click', function() {
            styleButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            clockStyle = this.dataset.style;
            localStorage.setItem('clockStyle', clockStyle);
            
            if (clockStyle === 'digital') {
                clockElement.innerHTML = `
                    <div class="digital-clock" id="local-time">
                        ${formatTime(new Date())}
                    </div>
                `;
            } else {
                clockElement.innerHTML = `
                    <div class="analog-clock">
                        <div class="clock-face">
                            <div class="hand hour-hand"></div>
                            <div class="hand minute-hand"></div>
                            <div class="hand second-hand"></div>
                        </div>
                    </div>
                `;
                updateClock();
            }
        });
    });

    // Initialize info sections
    updateLocalInfo();
    updateClock();
    loadSunTimesWithFallback();
    updateLocalCoordinates();
    loadWeatherData();
}

async function loadWeatherData() {
    const weatherContainer = document.getElementById('weather-container');
    
    try {
        const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true,
                timeout: 10000
            });
        });

        const { latitude, longitude } = position.coords;
        
        // Use OpenWeatherMap API
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&lang=it&appid=83b3ef42d80b78619a949ea0617b1eb5`);
        const data = await response.json();
        
        if (data.cod === 200) {
            const weather = {
                temp: Math.round(data.main.temp),
                feels_like: Math.round(data.main.feels_like),
                description: data.weather[0].description,
                icon: data.weather[0].icon,
                humidity: data.main.humidity,
                wind: Math.round(data.wind.speed * 3.6),
                city: data.name
            };
            
            weatherContainer.innerHTML = `
                <div class="weather-current">
                    <div class="weather-main">
                        <div class="weather-icon">
                            <img src="https://openweathermap.org/img/wn/${weather.icon}@2x.png" alt="${weather.description}">
                        </div>
                        <div class="weather-temp">
                            <span class="temp-value">${weather.temp}°</span>
                            <span class="temp-feels">Percepiti ${weather.feels_like}°</span>
                        </div>
                    </div>
                    <div class="weather-details">
                        <div class="weather-description">${capitalizeFirstLetter(weather.description)}</div>
                        <div class="weather-city">${weather.city}</div>
                    </div>
                </div>
                <div class="weather-stats">
                    <div class="weather-stat">
                        <span class="material-icons">water_drop</span>
                        <span>${weather.humidity}%</span>
                    </div>
                    <div class="weather-stat">
                        <span class="material-icons">air</span>
                        <span>${weather.wind} km/h</span>
                    </div>
                </div>
            `;
        } else {
            throw new Error(data.message || 'Errore nel recupero dati meteo');
        }
    } catch (error) {
        console.error("Errore nel recupero dati meteo:", error);
        weatherContainer.innerHTML = `
            <div class="weather-error">
                <span class="material-icons">error</span>
                <p>Impossibile caricare i dati meteo</p>
                <button id="retry-weather-btn" class="btn-secondary small">
                    <span class="material-icons">refresh</span>
                    Riprova
                </button>
            </div>
        `;
        
        document.getElementById('retry-weather-btn')?.addEventListener('click', loadWeatherData);
    }
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function loadSettingsSection() {
    document.querySelector('.fab').style.display = 'none';
    mainContent.innerHTML = `
        <div class="settings-page">
            <div class="settings-header">
                <button id="settings-back-btn" class="icon-btn back-btn">
                    <span class="material-icons">arrow_back</span>
                </button>
                <h3>Torna indietro</h3>
            </div>
            
            <div class="settings-section">
                <h4>Account</h4>
                <div class="account-details">
                    ${userAvatar ? 
                        `<img src="${userAvatar}" alt="Avatar" class="user-avatar">` : 
                        `<span id="icon_account" class="material-icons">account_circle</span>`
                    }
                    <div class="account-text">
                        <h3>${currentUser || 'Utente'}</h3>
                        <p class="account-type">Account locale</p>
                    </div>
                </div>
                <button id="change-username-btn" class="btn-secondary small">
                    <span class="material-icons">edit</span>
                    Modifica
                </button>
            </div>
            
            <div class="settings-section">
                <h4>Tema</h4>
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
                <h4>Notifiche</h4>
                <div class="switch-container">
                    <label class="switch">
                        <input type="checkbox" id="notifications-toggle" ${notificationPermission ? 'checked' : ''}>
                        <span class="slider round"></span>
                    </label>
                    <span>Abilita notifiche</span>
                </div>
            </div>
            
            <div class="settings-section">
                <h4>Localizzazione</h4>
                <div class="switch-container">
                    <label class="switch">
                        <input type="checkbox" id="location-toggle">
                        <span class="slider round"></span>
                    </label>
                    <span>Abilita geolocalizzazione</span>
                </div>
                <p class="location-hint">Per visualizzare informazioni precise su alba e tramonto</p>
            </div>
            
            <div class="settings-section">
                <h4>Informazioni</h4>
                <div class="info-item">
                    <span>Versione</span>
                    <span>1.3.0</span>
                </div>
                <div class="info-item">
                    <span>Sviluppatore</span>
                    <span>Visentin Manuel</span>
                </div>
                <a href="mailto:mvisentin2008@gmail.com">
                    <button class="segnala">
                        <span class="material-icons">bug_report</span>
                        Segnala un bug
                    </button>
                </a>
            </div>
        </div>
    `;

    // Add styles for settings section
    const style = document.createElement('style');
    style.textContent = `
        .settings-page {
            padding: 20px;
        }
        .settings-header {
            display: flex;
            align-items: center;
            gap: 16px;
            margin-bottom: 24px;
            padding-bottom: 12px;
            border-bottom: 1px solid var(--border-color);
        }
        .settings-header h3 {
            margin: 0;
            font-size: 1.5rem;
            color: var(--text-primary);
        }
        #settings-back-btn {
            background: none;
            border: none;
            color: var(--primary-color);
            cursor: pointer;
            padding: 8px;
            border-radius: 50%;
            transition: background-color 0.3s;
            background-color: white;
        }
        .settings-section {
            margin-bottom: 24px;
            padding-bottom: 16px;
            border-bottom: 1px solid var(--border-color);
        }
        .settings-section:last-child {
            border-bottom: none;
        }
        .settings-section h4 {
            margin-bottom: 12px;
            color: var(--text-primary);
        }
        .account-details {
            display: flex;
            align-items: center;
            gap: 3vh;
            margin-bottom: 16px;
        }
        .user-avatar, #icon_account {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            object-fit: cover;
            font-size: 60px;
            color: var(--primary-color);
        }
        #icon_account {
            margin-right: 5vh;
        }
        .account-text h3 {
            margin: 0;
            font-size: 1.2rem;
        }
        .account-type {
            margin: 0;
            font-size: 0.9rem;
            color: var(--text-secondary);
        }
        .theme-options {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
        }
        .theme-option {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 8px;
            padding: 12px;
            border-radius: 8px;
            border: 1px solid var(--border-color);
            background: none;
            cursor: pointer;
        }
        .theme-preview {
            border-radius: 2vh;
        }
        .theme-preview.default {
            background-color: #5782c9;
        }
        .theme-preview.green {
            background-color: #2E7D32;
        }
        .theme-preview.red {
            background-color: #C62828;
        }
        .theme-preview.purple {
            background-color: #6A1B9A;
        }
        .switch-container {
            display: flex;
            align-items: center;
            gap: 12px;
        }
        .switch {
            position: relative;
            display: inline-block;
            width: 60px;
            height: 34px;
        }
        .switch input {
            opacity: 0;
            width: 0;
            height: 0;
        }
        .slider {
            position: absolute;
            cursor: pointer;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: #ccc;
            transition: .4s;
        }
        .slider:before {
            position: absolute;
            content: "";
            height: 26px;
            width: 26px;
            left: 4px;
            bottom: 4px;
            background-color: white;
            transition: .4s;
        }
        input:checked + .slider {
            background-color: var(--primary-color);
        }
        input:checked + .slider:before {
            transform: translateX(16px);
        }
        .slider.round {
            border-radius: 34px;
        }
        .slider.round:before {
            border-radius: 50%;
        }
        .location-hint {
            margin-top: 8px;
            font-size: 0.9rem;
            color: var(--text-secondary);
        }
        .info-item {
            display: flex;
            justify-content: space-between;
            margin-bottom: 12px;
        }
        .segnala, .segnala a {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-top: 16px;
            padding: 8px 16px;
            background-color: var(--primary-color);
            color: white;
            border: none;
            border-radius: 20px;
            cursor: pointer;
            text-decoration: none;
        }
    `;
    document.head.appendChild(style);

    // Back button in settings
    document.getElementById('settings-back-btn').addEventListener('click', () => {
        loadSection('home');
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.section === 'home') {
                btn.classList.add('active');
            }
        });
        backBtn.style.display = 'none';
        document.head.removeChild(style);
    });

    // Theme selection
    document.querySelectorAll('.theme-option').forEach(option => {
        option.addEventListener('click', function() {
            const theme = this.dataset.theme;
            setTheme(theme);
        });
    });
    
    // Notifications toggle
    document.getElementById('notifications-toggle')?.addEventListener('change', function() {
        if (this.checked) {
            Notification.requestPermission().then(permission => {
                notificationPermission = permission === 'granted';
                if (!notificationPermission) {
                    this.checked = false;
                }
            });
        } else {
            notificationPermission = false;
        }
    });
    
    // Change username button
    document.getElementById('change-username-btn')?.addEventListener('click', function() {
        showUsernamePrompt();
    });
    
    // Request location permission
    document.getElementById('request-location-btn')?.addEventListener('click', function() {
        requestLocationPermission();
    });
}

function toggleStopwatch() {
    if (stopwatch.running) {
        stopStopwatch();
    } else {
        startStopwatch();
    }
}

function startStopwatch() {
    if (!stopwatch.running) {
        stopwatch.running = true;
        stopwatch.startTime = Date.now() - stopwatch.elapsed;
        startStopwatchUpdate();
        saveStopwatch();
        
        const startStopBtn = document.getElementById('stopwatch-start-stop');
        const lapResetBtn = document.getElementById('stopwatch-lap-reset');
        
        if (startStopBtn) {
            startStopBtn.className = 'stopwatch-btn stop';
            startStopBtn.innerHTML = '<span class="material-icons">pause</span>';
        }
        
        if (lapResetBtn) {
            lapResetBtn.className = 'stopwatch-btn lap';
            lapResetBtn.innerHTML = '<span class="material-icons">flag</span>';
        }
    }
}

function stopStopwatch() {
    if (stopwatch.running) {
        stopwatch.running = false;
        stopwatch.elapsed = Date.now() - stopwatch.startTime;
        saveStopwatch();
        
        const startStopBtn = document.getElementById('stopwatch-start-stop');
        const lapResetBtn = document.getElementById('stopwatch-lap-reset');
        
        if (startStopBtn) {
            startStopBtn.className = 'stopwatch-btn start';
            startStopBtn.innerHTML = '<span class="material-icons">play_arrow</span>';
        }
        
        if (lapResetBtn) {
            lapResetBtn.className = 'stopwatch-btn reset';
            lapResetBtn.innerHTML = '<span class="material-icons">replay</span>';
        }
    }
}

function resetStopwatch() {
    stopwatch = {
        running: false,
        startTime: 0,
        elapsed: 0,
        laps: []
    };
    saveStopwatch();
    updateStopwatchDisplay();
    
    const lapsContainer = document.getElementById('laps-container');
    if (lapsContainer) {
        lapsContainer.innerHTML = '';
    }
}

function addLap() {
    if (stopwatch.running) {
        const lapTime = Date.now() - stopwatch.startTime;
        stopwatch.laps.push(lapTime);
        saveStopwatch();
        
        const lapsContainer = document.getElementById('laps-container');
        if (lapsContainer) {
            if (stopwatch.laps.length === 1) {
                lapsContainer.innerHTML = `
                    <div class="laps-header">
                        <span>Giro</span>
                        <span>Tempo</span>
                    </div>
                `;
            }
            
            const lapItem = document.createElement('div');
            lapItem.className = 'lap-item';
            lapItem.innerHTML = `
                <span>Giro ${stopwatch.laps.length}</span>
                <span>${formatStopwatchTime(lapTime)}</span>
            `;
            lapsContainer.appendChild(lapItem);
        }
    }
}

function startStopwatchUpdate() {
    if (stopwatch.running) {
        updateStopwatchDisplay();
        setTimeout(startStopwatchUpdate, 10);
    }
}

function updateStopwatchDisplay() {
    const display = document.getElementById('stopwatch-display');
    if (display) {
        const elapsed = stopwatch.running ? Date.now() - stopwatch.startTime : stopwatch.elapsed;
        display.textContent = formatStopwatchTime(elapsed);
    }
}

function formatStopwatchTime(ms) {
    const date = new Date(ms);
    const hours = date.getUTCHours().toString().padStart(2, '0');
    const minutes = date.getUTCMinutes().toString().padStart(2, '0');
    const seconds = date.getUTCSeconds().toString().padStart(2, '0');
    const milliseconds = Math.floor(date.getUTCMilliseconds() / 10).toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}.${milliseconds}`;
}

function saveStopwatch() {
    localStorage.setItem('stopwatch', JSON.stringify({
        startTime: stopwatch.startTime,
        elapsed: stopwatch.elapsed,
        laps: stopwatch.laps
    }));
}

function createNewTimer() {
    const hours = parseInt(document.getElementById('hours').value) || 0;
    const minutes = parseInt(document.getElementById('minutes').value) || 0;
    const seconds = parseInt(document.getElementById('seconds').value) || 0;
    const name = document.getElementById('timer-name').value;
    
    if (hours === 0 && minutes === 0 && seconds === 0) {
        alert('Inserisci un tempo valido');
        return;
    }
    
    const totalSeconds = (hours * 3600) + (minutes * 60) + seconds;
    const duration = hours * 3600 + minutes * 60 + seconds;
    
    const timer = {
        id: generateId(),
        name: name,
        duration: duration,
        createdAt: new Date().toISOString()
    };
    
    timers.unshift(timer);
    saveTimers();
    timerModal.style.display = 'none';
    
    if (currentSection === 'home' || currentSection === 'timers') {
        loadSection(currentSection);
    }
    
    // Reset form
    document.getElementById('hours').value = '';
    document.getElementById('minutes').value = '';
    document.getElementById('seconds').value = '';
    document.getElementById('timer-name').value = '';
}

function createNewAlarm() {
    const time = document.getElementById('alarm-time').value;
    const name = document.getElementById('alarm-name').value;
    
    if (!time) {
        alert('Inserisci un orario valido');
        return;
    }
    
    const days = [];
    document.querySelectorAll('.days button.active').forEach(btn => {
        days.push(parseInt(btn.dataset.day));
    });
    
    const alarm = {
        id: generateId(),
        name: name,
        time: time,
        days: days.length > 0 ? days : null,
        active: true,
        createdAt: new Date().toISOString()
    };
    
    alarms.unshift(alarm);
    saveAlarms();
    alarmModal.style.display = 'none';
    
    if (currentSection === 'home' || currentSection === 'alarms') {
        loadSection(currentSection);
    }
    
    // Reset form
    document.getElementById('alarm-time').value = '';
    document.getElementById('alarm-name').value = '';
    document.querySelectorAll('.days button').forEach(btn => {
        btn.classList.remove('active');
    });
}

function toggleTimer(timer) {
    if (activeTimer && activeTimer.id === timer.id) {
        clearInterval(activeTimer.interval);
        activeTimer = null;
        localStorage.removeItem('activeTimer');
        closeAllNotifications();
    } else {
        if (activeTimer) {
            clearInterval(activeTimer.interval);
            closeAllNotifications();
        }
        
        const now = new Date().getTime();
        const endTime = now + (timer.duration * 1000);
        
        activeTimer = {
            id: timer.id,
            name: timer.name,
            endTime: endTime,
            duration: timer.duration
        };
        
        localStorage.setItem('activeTimer', JSON.stringify(activeTimer));
        startTimerCountdown(activeTimer);
    }
    
    if (currentSection === 'home' || currentSection === 'timers') {
        loadSection(currentSection);
    }
}

function startTimerCountdown(timer) {
    showNotification('Timer avviato', `Timer "${timer.name || 'Senza nome'}" avviato`);
    
    timer.interval = setInterval(() => {
        const now = new Date().getTime();
        const remaining = timer.endTime - now;
        
        if (remaining <= 0) {
            clearInterval(timer.interval);
            activeTimer = null;
            localStorage.removeItem('activeTimer');
            
            showNotification('Timer completato!', `Il timer "${timer.name || 'Senza nome'}" è scaduto`, true);
            
            if (currentSection === 'home' || currentSection === 'timers') {
                loadSection(currentSection);
            }
        }
        
        if (currentSection === 'home' || currentSection === 'timers') {
            const progressBars = document.querySelectorAll(`.card[data-id="${timer.id}"] .progress`);
            progressBars.forEach(bar => {
                bar.style.width = `${calculateProgress(timer)}%`;
            });
        }
        
        if (document.hidden) {
            updateTimerNotification(timer, remaining);
        }
    }, 1000);
}

function checkAlarms() {
    const now = new Date();
    const currentHours = now.getHours().toString().padStart(2, '0');
    const currentMinutes = now.getMinutes().toString().padStart(2, '0');
    const currentDay = now.getDay();
    
    alarms.forEach(alarm => {
        if (!alarm.active) return;
        
        const [alarmHours, alarmMinutes] = alarm.time.split(':');
        
        if (alarmHours === currentHours && alarmMinutes === currentMinutes) {
            if (!alarm.days || alarm.days.includes(currentDay)) {
                showNotification(
                    alarm.name || 'Sveglia', 
                    `È ora! (${alarm.time})`, 
                    true
                );
            }
        }
    });
    
    // Check again in 1 minute
    setTimeout(checkAlarms, 60000 - now.getSeconds() * 1000 - now.getMilliseconds());
}

function calculateProgress(timer) {
    const now = new Date().getTime();
    const elapsed = timer.duration * 1000 - (timer.endTime - now);
    return Math.min(100, (elapsed / (timer.duration * 1000)) * 100);
}

function toggleAlarm(alarmId) {
    const alarm = alarms.find(a => a.id === alarmId);
    if (alarm) {
        alarm.active = !alarm.active;
        saveAlarms();
        loadSection(currentSection);
    }
}

function deleteTimer(timerId) {
    timers = timers.filter(t => t.id !== timerId);
    saveTimers();
    
    if (activeTimer && activeTimer.id === timerId) {
        clearInterval(activeTimer.interval);
        activeTimer = null;
        localStorage.removeItem('activeTimer');
    }
    
    loadSection(currentSection);
}

function deleteAlarm(alarmId) {
    alarms = alarms.filter(a => a.id !== alarmId);
    saveAlarms();
    loadSection(currentSection);
}

function saveTimers() {
    localStorage.setItem('timers', JSON.stringify(timers));
}

function saveAlarms() {
    localStorage.setItem('alarms', JSON.stringify(alarms));
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function formatTime(time) {
    if (typeof time === 'number') {
        const hours = Math.floor(time / 3600);
        const minutes = Math.floor((time % 3600) / 60);
        const seconds = time % 60;
        
        return [
            hours.toString().padStart(2, '0'),
            minutes.toString().padStart(2, '0'),
            seconds.toString().padStart(2, '0')
        ].join(':');
    } else if (time instanceof Date) {
        return time.toLocaleTimeString('it-IT', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    }
    return '00:00:00';
}

function formatAlarmTime(timeStr) {
    const [hours, minutes] = timeStr.split(':');
    return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
}

function formatDays(days) {
    const dayNames = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];
    return days.map(day => dayNames[day]).join(', ');
}

function setTheme(theme) {
    currentTheme = theme;
    localStorage.setItem('theme', theme);
    applyTheme();
}

function applyTheme() {
    const root = document.documentElement;
    
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

function showNotification(title, body, requireInteraction = false) {
    if (!('Notification' in window)) return;
    
    if (Notification.permission === 'granted') {
        const options = {
            body: body,
            icon: '/icons/icon-192x192.png',
            badge: '/icons/badge-72x72.png',
            vibrate: [200, 100, 200],
            requireInteraction: requireInteraction
        };
        
        if (serviceWorkerRegistration) {
            serviceWorkerRegistration.showNotification(title, options);
        } else {
            new Notification(title, options);
        }
    }
}

function closeAllNotifications() {
    if ('serviceWorker' in navigator && serviceWorkerRegistration) {
        serviceWorkerRegistration.getNotifications().then(notifications => {
            notifications.forEach(notification => {
                notification.close();
            });
        });
    }
}

async function loadSunTimesWithFallback() {
    const statusEl = document.getElementById('location-status');
    const sunTimesEl = document.getElementById('sun-times');
    
    if (navigator.geolocation) {
        try {
            statusEl.textContent = "Ricerca posizione in corso...";
            statusEl.className = "status-text";
            
            const position = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(
                    resolve, 
                    reject, 
                    {
                        enableHighAccuracy: true,
                        timeout: 10000,
                        maximumAge: 0
                    }
                );
            });

            const { latitude, longitude } = position.coords;
            
            const times = await getSunriseSunset(latitude, longitude);
            
            if (times) {
                sunTimesEl.textContent = `${formatTime(times.sunrise)} | ${formatTime(times.sunset)}`;
                statusEl.textContent = "Posizione rilevata";
                statusEl.className = "status-text success";
            } else {
                throw new Error("Dati alba/tramonto non disponibili");
            }
        } catch (error) {
            console.error("Errore geolocalizzazione:", error);
            
            try {
                statusEl.textContent = "Ricerca posizione approssimata...";
                const ipLocation = await fetchApproximateLocation();
                
                if (ipLocation) {
                    const times = await getSunriseSunset(ipLocation.lat, ipLocation.lon);
                    if (times) {
                        sunTimesEl.textContent = `Alba: ~${formatTime(times.sunrise)} | Tramonto: ~${formatTime(times.sunset)}`;
                        statusEl.textContent = ipLocation.city || "Posizione approssimativa";
                        statusEl.className = "status-text warning";
                    } else {
                        throw new Error("Dati alba/tramonto non disponibili");
                    }
                } else {
                    throw new Error("Impossibile determinare la posizione via IP");
                }
            } catch (ipError) {
                console.error("Errore posizione IP:", ipError);
                
                showDefaultItalianTimes();
                statusEl.textContent = "Attiva la geolocalizzazione per orari precisi";
                statusEl.className = "status-text error";
                
                const retryBtn = document.createElement('button');
                retryBtn.id = 'retry-location-btn';
                retryBtn.className = 'location-btn small';
                retryBtn.innerHTML = '<span class="material-icons">refresh</span> Riprova';
                retryBtn.addEventListener('click', () => {
                    requestLocationPermission();
                });
                statusEl.appendChild(retryBtn);
            }
        }
    } else {
        showDefaultItalianTimes();
        statusEl.textContent = "Geolocalizzazione non supportata dal tuo browser";
        statusEl.className = "status-text error";
    }
}

async function requestLocationPermission() {
    try {
        const statusEl = document.getElementById('location-status');
        statusEl.textContent = "Richiesta permesso di geolocalizzazione...";
        statusEl.className = "status-text";
        
        const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
                resolve, 
                reject, 
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                }
            );
        });

        const { latitude, longitude } = position.coords;
        const times = await getSunriseSunset(latitude, longitude);
        
        if (times) {
            const sunTimesEl = document.getElementById('sun-times');
            sunTimesEl.textContent = `Alba: ${formatTime(times.sunrise)} | Tramonto: ${formatTime(times.sunset)}`;
            statusEl.textContent = `Posizione: ${latitude.toFixed(2)}°N, ${longitude.toFixed(2)}°E`;
            statusEl.className = "status-text success";
        }
    } catch (error) {
        console.error("Errore nella richiesta di geolocalizzazione:", error);
        const statusEl = document.getElementById('location-status');
        statusEl.textContent = "Permesso di geolocalizzazione negato";
        statusEl.className = "status-text error";
    }
}

async function fetchApproximateLocation() {
    try {
        const response = await fetch('https://ipapi.co/json/');
        if (!response.ok) throw new Error("Network response was not ok");
        const data = await response.json();
        return {
            lat: data.latitude,
            lon: data.longitude,
            city: data.city
        };
    } catch (error) {
        console.error("Errore nel recupero posizione IP:", error);
        return null;
    }
}

async function getSunriseSunset(lat, lon) {
    try {
        const response = await fetch(`https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lon}&formatted=0`);
        const data = await response.json();
        
        if (data.status === 'OK') {
            return {
                sunrise: new Date(data.results.sunrise),
                sunset: new Date(data.results.sunset)
            };
        }
        return null;
    } catch (error) {
        console.error("Errore nel recupero orari alba/tramonto:", error);
        return null;
    }
}

function showDefaultItalianTimes() {
    const now = new Date();
    const month = now.getMonth();
    const isSummer = month >= 4 && month <= 9;
    
    const sunrise = isSummer ? '5:45' : '7:30';
    const sunset = isSummer ? '20:30' : '17:45';
    
    document.getElementById('sun-times').textContent = 
        `Alba: ~${sunrise} | Tramonto: ~${sunset} (Italia)`;
}

function getSectionTitle(section) {
    const titles = {
        'home': 'Home',
        'cronometers': 'Cronometro',
        'timers': 'Timer e Sveglie',
        'alarms': 'Sveglie',
        'settings': 'Impostazioni',
        'feed': 'Feed'
    };
    return titles[section] || 'ByTime';
}

async function updateLocalCoordinates() {
    const coordsElement = document.getElementById('local-coords');
    
    if (navigator.geolocation) {
        try {
            const position = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                    enableHighAccuracy: true,
                    timeout: 5000
                });
            });
            
            const lat = position.coords.latitude.toFixed(4);
            const lon = position.coords.longitude.toFixed(4);
            coordsElement.textContent = `${lat}°N, ${lon}°E`;
            
        } catch (error) {
            console.error("Errore geolocalizzazione:", error);
            coordsElement.textContent = "Coordinate non disponibili";
        }
    } else {
        coordsElement.textContent = "Geolocalizzazione non supportata";
    }
}

function updateLocalInfo() {
    const now = new Date();
    
    document.getElementById('local-date').textContent = 
        now.toLocaleDateString('it-IT', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    
    document.getElementById('local-time-full').textContent = 
        now.toLocaleTimeString('it-IT', {hour: '2-digit', minute:'2-digit', second:'2-digit'});
    
    if (clockStyle === 'digital') {
        const digitalClock = document.getElementById('local-time');
        if (digitalClock) {
            digitalClock.textContent = formatTime(now);
        }
    }
    
    setTimeout(updateLocalInfo, 1000);
}

function updateClock() {
    if (currentSection === 'feed') {
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const seconds = now.getSeconds();
        
        if (clockStyle === 'digital') {
            const digitalClock = document.getElementById('local-time');
            if (digitalClock) {
                digitalClock.textContent = formatTime(now);
            }
        } else {
            const hourHand = document.querySelector('.hour-hand');
            const minuteHand = document.querySelector('.minute-hand');
            const secondHand = document.querySelector('.second-hand');
            
            if (hourHand && minuteHand && secondHand) {
                const hourDegrees = (hours * 30) + (minutes * 0.5);
                const minuteDegrees = minutes * 6;
                const secondDegrees = seconds * 6;
                
                hourHand.style.transform = `rotate(${hourDegrees}deg)`;
                minuteHand.style.transform = `rotate(${minuteDegrees}deg)`;
                secondHand.style.transform = `rotate(${secondDegrees}deg)`;
            }
        }
        
        setTimeout(updateClock, 1000);
    }
}