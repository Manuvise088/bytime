let currentUser = null;
let timers = JSON.parse(localStorage.getItem('timers')) || [];
let alarms = JSON.parse(localStorage.getItem('alarms')) || [];
let activeTimer = null;
let currentSection = 'home';
let currentTheme = localStorage.getItem('theme') || 'default';

const mainContent = document.getElementById('main-content');
const headerTitle = document.getElementById('header-title');
const accountBtn = document.getElementById('account-btn');
const timerModal = document.getElementById('timer-modal');
const alarmModal = document.getElementById('alarm-modal');
const settingsModal = document.getElementById('settings-modal');
const closeButtons = document.getElementsByClassName('close');

document.addEventListener('DOMContentLoaded', function() {
    applyTheme();
    loadSection(currentSection);
    setupEventListeners();
    
    const savedActiveTimer = localStorage.getItem('activeTimer');
    if (savedActiveTimer) {
        activeTimer = JSON.parse(savedActiveTimer);
        startTimerCountdown(activeTimer);
    }
    
    checkAlarms();
});

function setupEventListeners() {
    // Navigation buttons
    document.querySelectorAll('.nav-btn').forEach(button => {
        button.addEventListener('click', function() {
            const section = this.dataset.section;
            loadSection(section);
            
            document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Timer and alarm creation buttons
    document.addEventListener('click', function(e) {
        if (e.target.id === 'new-timer' || e.target.closest('#new-timer')) {
            timerModal.style.display = 'block';
        }
    });
    
    document.addEventListener('click', function(e) {
        if (e.target.id === 'new-alarm' || e.target.closest('#new-alarm')) {
            alarmModal.style.display = 'block';
        }
    });
    
    // Modal close buttons
    Array.from(closeButtons).forEach(button => {
        button.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
        });
    });
    
    // Timer and alarm creation
    document.getElementById('start-timer').addEventListener('click', createNewTimer);
    document.getElementById('save-alarm').addEventListener('click', createNewAlarm);
    
    // Alarm repeat days
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
    });
    
    // Settings modal
    accountBtn.addEventListener('click', () => {
        settingsModal.style.display = 'block';
        loadSettings();
    });
    
    document.getElementById('back-btn').addEventListener('click', () => {
        settingsModal.style.display = 'none';
    });
    
    // Theme options
    document.querySelectorAll('.theme-option').forEach(option => {
        option.addEventListener('click', function() {
            const theme = this.dataset.theme;
            setTheme(theme);
        });
    });
}

function loadSection(section) {
    currentSection = section;
    headerTitle.textContent = getSectionTitle(section);
    
    switch(section) {
        case 'home':
            loadHomeSection();
            break;
        case 'timers':
            loadTimersSection();
            break;
    }
}

function getSectionTitle(section) {
    const titles = {
        'home': 'Home',
        'timers': 'Timer e Sveglie'
    };
    return titles[section] || 'ByTime';
}

function loadHomeSection() {
    mainContent.innerHTML = `
        <div class="section-title">
            <h2>Timer recenti</h2>
            <a href="#" class="section-btn" data-section="timers">
                <span class="material-icons">timer</span>
                <span>Timer</span>
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
                            <span class="material-icons">play_arrow</span>
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
        
        <button class="fab" id="new-timer">
            <span class="material-icons">timer</span>
        </button>
        
        <div class="separator"></div>
        
        <div class="section-title">
            <h2>Sveglie recenti</h2>
            <a href="#" class="section-btn" data-section="timers">
                <span class="material-icons">alarm</span>
                <span>Sveglie</span>
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
                            <span class="material-icons ${alarm.active ? 'active' : 'inactive'}">${alarm.active ? 'notifications_active' : 'notifications_off'}</span>
                            <button class="icon-btn">
                                <span class="material-icons">more_vert</span>
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
        
        <button class="fab" id="new-alarm">
            <span class="material-icons">alarm_add</span>
        </button>
    `;
    
    // Setup event listeners for dynamic content
    document.querySelectorAll('.play-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const timerId = this.closest('.card').dataset.id;
            const timer = timers.find(t => t.id === timerId);
            toggleTimer(timer);
        });
    });
    
    document.querySelectorAll('.alarm-status .material-icons').forEach(icon => {
        icon.addEventListener('click', function() {
            const alarmId = this.closest('.card').dataset.id;
            toggleAlarm(alarmId);
        });
    });
    
    document.querySelectorAll('.section-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.dataset.section;
            loadSection(section);
            
            document.querySelectorAll('.nav-btn').forEach(navBtn => {
                navBtn.classList.remove('active');
                if (navBtn.dataset.section === section) {
                    navBtn.classList.add('active');
                }
            });
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
    
    // Timers tab
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
        
        <!-- Alarm tab content -->
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
        
        <button class="fab" id="new-timer">
            <span class="material-icons">timer</span>
        </button>
        
        <button class="fab" id="new-alarm">
            <span class="material-icons">alarm_add</span>
        </button>
    `;
    
    mainContent.innerHTML = html;
    
    updateCurrentTime();
    
    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const tab = this.dataset.tab;
            
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
            document.getElementById(`${tab}-tab`).classList.add('active');
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
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const timerId = this.closest('.card').dataset.id;
            deleteTimer(timerId);
        });
    });
    
    // Alarm controls
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
                if (Notification.permission === 'granted') {
                    new Notification(alarm.name || 'Sveglia', {
                        body: `È ora! (${alarm.time})`
                    });
                } else if (Notification.permission !== 'denied') {
                    Notification.requestPermission().then(permission => {
                        if (permission === 'granted') {
                            new Notification(alarm.name || 'Sveglia', {
                                body: `È ora! (${alarm.time})`
                            });
                        }
                    });
                }
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
    
    if (currentSection === 'home' || currentSection === 'timers') {
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
        // Pause the timer
        clearInterval(activeTimer.interval);
        activeTimer = null;
        localStorage.removeItem('activeTimer');
    } else {
        if (activeTimer) {
            clearInterval(activeTimer.interval);
        }
        
        const now = new Date().getTime();
        const endTime = now + (timer.duration * 1000);
        
        activeTimer = {
            id: timer.id,
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
    timer.interval = setInterval(() => {
        const now = new Date().getTime();
        const remaining = timer.endTime - now;
        
        if (remaining <= 0) {
            clearInterval(timer.interval);
            activeTimer = null;
            localStorage.removeItem('activeTimer');
            
            if (Notification.permission === 'granted') {
                new Notification('Timer completato!');
            } else if (Notification.permission !== 'denied') {
                Notification.requestPermission().then(permission => {
                    if (permission === 'granted') {
                        new Notification('Timer completato!');
                    }
                });
            }
            
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
    }, 1000);
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
        // It's a duration in seconds
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

function loadSettings() {
    // Set selected theme
    document.querySelectorAll('.theme-option').forEach(option => {
        option.classList.toggle('active', option.dataset.theme === currentTheme);
    });
}

function setTheme(theme) {
    currentTheme = theme;
    localStorage.setItem('theme', theme);
    applyTheme();
    loadSettings();
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
        default: // default theme
            root.style.setProperty('--primary-color', '#5782c9');
            root.style.setProperty('--secondary-color', '#34A853');
            root.style.setProperty('--accent-color', '#EA4335');
    }
}