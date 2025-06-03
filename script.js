// script.js
let currentUser = null;
let timers = JSON.parse(localStorage.getItem('timers')) || [];
let alarms = JSON.parse(localStorage.getItem('alarms')) || [];
let cronometers = JSON.parse(localStorage.getItem('cronometers')) || []; 
let activeTimer = null;
let stopwatch = {
    running: false,
    startTime: 0,
    elapsed: 0,
    laps: []
};
let currentSection = 'home';
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

document.addEventListener('DOMContentLoaded', function() {
    applyTheme();
    loadSection(currentSection);
    setupEventListeners();

    if ('Notification' in window) {
        Notification.requestPermission().then(permission => {
            notificationPermission = permission === 'granted';
        });
    }
    
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js').then(registration => {
            serviceWorkerRegistration = registration;
        }).catch(err => {
            console.log('ServiceWorker registration failed: ', err);
        });
    }
    
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
    });
    
    const savedActiveTimer = localStorage.getItem('activeTimer');
    if (savedActiveTimer) {
        activeTimer = JSON.parse(savedActiveTimer);
        startTimerCountdown(activeTimer);
    }
    
    const savedStopwatch = localStorage.getItem('stopwatch');
    if (savedStopwatch) {
        const parsed = JSON.parse(savedStopwatch);
        stopwatch = {
            running: false,
            startTime: parsed.startTime,
            elapsed: parsed.elapsed,
            laps: parsed.laps || []
        };
    }
    
    checkAlarms();
});

function setupEventListeners() {
    document.querySelectorAll('.nav-btn').forEach(button => {
        button.addEventListener('click', function() {
            const section = this.dataset.section;
            loadSection(section);
            
            document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            backBtn.style.display = section === 'home' ? 'none' : 'flex';
        });
    });

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
    
    Array.from(document.getElementsByClassName('close')).forEach(button => {
        button.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
        });
    });
    
    document.getElementById('start-timer').addEventListener('click', createNewTimer);
    document.getElementById('save-alarm').addEventListener('click', createNewAlarm);
    
    document.querySelectorAll('.days button').forEach(button => {
        button.addEventListener('click', function() {
            this.classList.toggle('active');
        });
    });
    
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
        
        if (!event.target.closest('#add-btn') && !event.target.closest('.add-menu')) {
            addMenu.classList.remove('show');
            addBtn.classList.remove('menu-open');
        }
    });
    
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
    }
}

function getSectionTitle(section) {
    const titles = {
        'home': 'Home',
        'cronometers': 'Cronometro',
        'timers': 'Timer e Sveglie',
        'alarms': 'Sveglie',
        'settings': 'Impostazioni'
    };
    return titles[section] || 'ByTime';
}

function loadHomeSection() {
    mainContent.innerHTML = `
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
            <a href="#" class="section-btn" data-section="timers">
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

function loadStopwatchSection() {
    mainContent.innerHTML = `
        <div class="section-title">
            <h2>Cronometri recenti</h2>
            <a href="#" class="section-btn" data-section="cronometers">
                <span class="material-icons">timer</span>
                <span>Vedi tutti</span>
            </a>
        </div>
        
        <div class="stopwatch-card">
            <div class="stopwatch-display" id="stopwatch-display">${formatStopwatchTime(stopwatch.elapsed)}</div>
            
            <div class="stopwatch-controls">
                <button id="stopwatch-start-stop" class="stopwatch-btn ${stopwatch.running ? 'stop' : 'start'}">
                    <span class="material-icons">${stopwatch.running ? 'pause' : 'play_arrow'}</span>
                </button>
                <button id="stopwatch-lap-reset" class="stopwatch-btn ${stopwatch.running ? 'lap' : 'reset'}">
                    <span class="material-icons">${stopwatch.running ? 'flag' : 'replay'}</span>
                </button>
            </div>
            
            ${stopwatch.laps.length > 0 ? `
                <div class="laps-container" id="laps-container">
                    <div class="laps-header">
                        <span>Giro</span>
                        <span>Tempo</span>
                    </div>
                    ${stopwatch.laps.slice(0, 3).map((lap, index) => `
                        <div class="lap-item">
                            <span>Giro ${index + 1}</span>
                            <span>${formatStopwatchTime(lap)}</span>
                        </div>
                    `).join('')}
                </div>
            ` : ''}
        </div>
    `;

    const startStopBtn = document.getElementById('stopwatch-start-stop');
    const lapResetBtn = document.getElementById('stopwatch-lap-reset');

    startStopBtn.addEventListener('click', toggleStopwatch);
    lapResetBtn.addEventListener('click', stopwatch.running ? addLap : resetStopwatch);

    if (stopwatch.running) {
        startStopwatchUpdate();
    }

    document.querySelectorAll('.section-btn').forEach(btn => {
        btn.addEventListener('click', function (e) {
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
    let html = `
        <div class="current-time" id="current-time">${formatTime(new Date())}</div>
        
        <div class="tabs">
            <button class="tab-btn active" data-tab="timers">Timer</button>
            <button class="tab-btn" data-tab="alarms">Sveglie</button>
        </div>
    `;
    
    html += `
        <div id="timers-tab" class="tab-content active">
            <div class="section-title">
                <h2>I tuoi timer</h2>
            </div>
    `;
    
    if (timers.length > 0) {
        html += timers.map(timer => `
            <div class="card" data-id="${timer.id}">
                <div class="card-content">
                    <div>
                        <h3>${timer.name || 'Timer'}</h3>
                        <p class="time-display">${formatTime(timer.duration)}</p>
                    </div>
                    <div>
                        <button class="icon-btn play-btn">
                            <span class="material-icons">${timer.id === activeTimer?.id ? 'pause' : 'play_arrow'}</span>
                        </button>
                        <button class="icon-btn delete-btn">
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
        `).join('');
    } else {
        html += `
            <div class="empty-state">
                <span class="material-icons">timer</span>
                <p>Nessun timer impostato</p>
                <button id="create-first-timer" class="icon-btn" style="color: white; margin-top: 20px;">
                    <span class="material-icons">add</span> Crea il tuo primo timer
                </button>
            </div>
        `;
    }
    
    html += `
        </div>
        
        <div id="alarms-tab" class="tab-content">
            <div class="section-title">
                <h2>Le tue sveglie</h2>
            </div>
    `;
    
    if (alarms.length > 0) {
        html += alarms.map(alarm => `
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
        `).join('');
    } else {
        html += `
            <div class="empty-state">
                <span class="material-icons">alarm</span>
                <p>Nessuna sveglia impostata</p>
                <button id="create-first-alarm" class="icon-btn" style="color: white; margin-top: 20px;">
                    <span class="material-icons">add</span> Crea la tua prima sveglia
                </button>
            </div>
        `;
    }
    
    html += `
        </div>
        
        <button class="fab" id="add-btn">
            <span class="material-icons">add</span>
        </button>
    `;
    
    mainContent.innerHTML = html;
    
    updateCurrentTime();
    
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const tab = this.dataset.tab;
            
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
            document.getElementById(`${tab}-tab`).classList.add('active');
        });
    });
    
    document.querySelectorAll('.play-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const timerId = this.closest('.card').dataset.id;
            const timer = timers.find(t => t.id === timerId);
            toggleTimer(timer);
        });
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const timerId = this.closest('.card').dataset.id;
            deleteTimer(timerId);
        });
    });
    
    document.querySelectorAll('.toggle-alarm-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const alarmId = this.closest('.card').dataset.id;
            toggleAlarm(alarmId);
        });
    });
    
    document.querySelectorAll('.delete-alarm-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const alarmId = this.closest('.card').dataset.id;
            deleteAlarm(alarmId);
        });
    });
    
    if (document.getElementById('create-first-timer')) {
        document.getElementById('create-first-timer').addEventListener('click', () => {
            timerModal.style.display = 'block';
        });
    }
    
    if (document.getElementById('create-first-alarm')) {
        document.getElementById('create-first-alarm').addEventListener('click', () => {
            alarmModal.style.display = 'block';
        });
    }
    
    // Reimposta gli event listener per il pulsante add
    addBtn.addEventListener('click', toggleAddMenu);
}

function loadAlarmsSection() {
    mainContent.innerHTML = `
        <div class="section-header">
            <h2>Sveglie</h2>
            <button id="add-alarm-btn" class="icon-btn">
                <span class="material-icons">add</span>
            </button>
        </div>
        
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
                <button id="create-first-alarm" class="icon-btn" style="color: white; margin-top: 20px;">
                    <span class="material-icons">add</span> Crea la tua prima sveglia
                </button>
            </div>`
        }
    `;
    
    document.getElementById('add-alarm-btn')?.addEventListener('click', () => {
        alarmModal.style.display = 'block';
    });
    
    document.getElementById('create-first-alarm')?.addEventListener('click', () => {
        alarmModal.style.display = 'block';
    });
    
    document.querySelectorAll('.toggle-alarm-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const alarmId = this.closest('.card').dataset.id;
            toggleAlarm(alarmId);
        });
    });
    
    document.querySelectorAll('.delete-alarm-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const alarmId = this.closest('.card').dataset.id;
            deleteAlarm(alarmId);
        });
    });
}

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
                <a href="mailto:mvisentin2008@gmail.com"<button class="segnala"><span class="material-icons">bug_report</span>Segnala un bug</button>
            </div>
        </div>
    `;
    
    document.querySelectorAll('.theme-option').forEach(option => {
        option.addEventListener('click', function() {
            const theme = this.dataset.theme;
            setTheme(theme);
        });
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

// Funzioni per il cronometro
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
    
    setTimeout(checkAlarms, 60000 - now.getSeconds() * 1000 - now.getMilliseconds());
}

function updateCurrentTime() {
    if (currentSection === 'timers') {
        document.getElementById('current-time').textContent = formatTime(new Date());
        setTimeout(updateCurrentTime, 1000);
    }
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
