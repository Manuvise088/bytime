let currentUser = localStorage.getItem('username') || null;
let liquidGlassMode = localStorage.getItem('liquidGlassMode') === 'true' || false;
let m3ExpressiveMode = localStorage.getItem('m3ExpressiveMode') === 'true' || false;
let timers = JSON.parse(localStorage.getItem('timers')) || [];
let alarms = JSON.parse(localStorage.getItem('alarms')) || [];
let cronometers = JSON.parse(localStorage.getItem('cronometers')) || []; 
let activeTimer = null;
let clockStyle = localStorage.getItem('clockStyle') || 'digital';
let timezones = JSON.parse(localStorage.getItem('timezones')) || [];
let timerGroups = JSON.parse(localStorage.getItem('timerGroups')) || [{ id: 'all', name: 'Tutti i timer', isDefault: true }];
let showTimerGroups = localStorage.getItem('showTimerGroups') === 'true' || false;
let stopwatch = {
    running: false,
    startTime: 0,
    elapsed: 0,
    laps: []
};
let autoplayEnabled = localStorage.getItem('autoplayEnabled') !== 'false';
let amoledMode = localStorage.getItem('amoledMode') === 'true' || false;
let currentSection = 'home';
let userAvatar = localStorage.getItem('userAvatar') || null;
let currentTheme = localStorage.getItem('theme') || 'default';
let notificationPermission = false;
let serviceWorkerRegistration = null;
let deferredPrompt = null;

const mainContent = document.getElementById('main-content');
const headerTitle = document.getElementById('header-title');
const accountBtn = document.getElementById('account-btn');
const resetModal = document.createElement('div');
const backBtn = document.getElementById('back-btn');
const timerModal = document.getElementById('timer-modal');
const alarmModal = document.getElementById('alarm-modal');
const addBtn = document.getElementById('add-btn');
const addMenu = document.getElementById('add-menu');
const addTimerMenu = document.getElementById('add-timer-menu');
const addAlarmMenu = document.getElementById('add-alarm-menu');
const alarmFilters = {
    all: 'all',
    repeating: 'repeating'
};
const translations = {
    it: {
        appName: "bytime",
        greetings: {
            morning: "Buongiorno",
            lunch: "Buon pranzo",
            afternoon: "Buon pomeriggio",
            evening: "Buonasera",
            night: "Buonanotte",
            welcome: "Benvenuto in ByTime"
        },
        sections: {
            home: "Home",
            timers: "Timer",
            alarms: "Sveglie",
            cronometers: "Cronometro",
            settings: "Impostazioni",
            feed: "Feed",
            weather: "Meteo"
        },
        buttons: {
            seeAll: "Vedi tutti",
            start: "Avvia",
            stop: "Ferma",
            pause: "Pausa",
            resume: "Riprendi",
            save: "Salva",
            cancel: "Annulla",
            delete: "Elimina",
            edit: "Modifica",
            add: "Aggiungi",
            confirm: "Conferma",
            skip: "Salta",
            back: "Indietro",
            retry: "Riprova",
            refresh: "Aggiorna",
            snooze: "Posticipa",
            dismiss: "Annulla"
        },
        timer: {
            createFirst: "Crea il tuo primo timer",
            noTimers: "Nessun timer impostato",
            recentTimers: "Timer recenti",
            namePlaceholder: "Nome del timer (opzionale)",
            hours: "HH",
            minutes: "MM",
            seconds: "SS",
            groupAll: "Tutti",
            groupWork: "Lavoro",
            groupPersonal: "Personale",
            groupFitness: "Fitness",
            groupStudy: "Studio",
            invalidTime: "Timer invalido!",
            time: "Tempo",
            started: "avviato",
            completed: "completato",
            unnamed: "Senza nome",
            timer: "Timer"
        },
        alarm: {
            createFirst: "Crea la tua prima sveglia",
            noAlarms: "Nessuna sveglia impostata",
            recentAlarms: "Sveglie recenti",
            namePlaceholder: "Nome sveglia (opzionale)",
            repeat: "Ripeti",
            days: ["L", "M", "M", "G", "V", "S", "D"],
            active: "Attiva",
            inactive: "Disattiva",
            allAlarms: "Tutte le sveglie",
            repeatingAlarms: "Sveglie ripetute",
            noRepeatingAlarms: "Nessuna sveglia ripetuta",
            invalidTime: "Orario non valido",
            time: "Orario",
            alarm: "Sveglia"
        },
        stopwatch: {
            start: "Avvia",
            stop: "Ferma",
            lap: "Giro",
            reset: "Azzera",
            laps: "Giri",
            noLaps: "Nessun giro registrato"
        },
        settings: {
            account: "Account",
            accountType: "Account locale",
            changeUsername: "Modifica profilo",
            appearance: "Aspetto",
            theme: "Tema dell'app",
            preferences: "Preferenze",
            personalize: "Personalizza la tua esperienza",
            notifications: "Notifiche",
            notificationsDesc: "Notifiche push per timer e sveglie",
            location: "Localizzazione",
            locationDesc: "Condividi la posizione per informazioni locali",
            timerGroups: "Gruppi timer",
            timerGroupsDesc: "Organizza i timer in categorie",
            amoledMode: "Modalità AMOLED",
            amoledModeDesc: "Sfondo nero puro per schermi AMOLED",
            autoplay: "Autoplay timer",
            autoplayDesc: "Avvia automaticamente i nuovi timer",
            experimental: "Impostazioni sperimentali",
            liquidGlass: "Stile Liquid Glass",
            liquidGlassDesc: "Effetto vetro smerigliato con bordi fluidi",
            info: "Informazioni",
            version: "Versione",
            developer: "Sviluppatore",
            reportBug: "Segnala un bug",
            language: "Lingua",
            input: "Immissione",
            languageTitle: "Lingua e immissione",
            languageDesc: "Lingua dell'app",
            themeDefault: "Default",
            themeGreen: "Verde",
            themeRed: "Rosso",
            themePurple: "Blu",
            resetAll: "Ripristina tutto",
            resetWarning: "Cancella tutti i dati e ripristina ogni impostazione e preferenza dell'utente",
            resetConfirm: "Sicuro di voler cancellare tutti i dati?",
            resetSlide: "Scorri per confermare",
            resetComplete: "Reset completato!",
            resetNo: "No, torna indietro!",
            resetDetails: "Verranno rimossi: <br>-Timer <br>-Sveglie <br>-Cronometri <br>-Impostazioni e dettagli utente",
            user: "Utente",
            searchPlaceholder: "Cerca nelle impostazioni",
            noResults: "Nessun risultato trovato"
        },
        weather: {
            current: "Meteo Attuale",
            forecast: "Previsioni",
            feelsLike: "Percepiti",
            humidity: "Umidità",
            wind: "Vento",
            sunrise: "Alba",
            sunset: "Tramonto",
            loading: "Caricamento dati meteo...",
            loadingForecast: "Caricamento dati previsioni...",
            error: "Impossibile caricare i dati meteo",
            stats: "Statistiche Meteo",
            maxTemp: "Record massimo",
            minTemp: "Record minimo",
            avgHumidity: "Umidità media",
            maxWind: "Vento massimo",
            sun: "Sole",
            locating: "Localizzazione in corso...",
            locationFound: "Posizione trovata",
            approxLocation: "Posizione approssimativa",
            geoUnsupported: "Geolocalizzazione non supportata",
            sunDataUnavailable: "Dati sole non disponibili",
            windUnit: "km/h"
        },
        modals: {
            newTimer: "Nuovo Timer",
            newAlarm: "Nuova Sveglia",
            usernameTitle: "Modifica il tuo profilo",
            usernameSubtitle: "Aggiorna il tuo nome e la tua immagine",
            usernameLabel: "Il tuo nome",
            usernamePlaceholder: "Come vuoi essere chiamato?",
            avatarLabel: "Scegli immagine",
            saveChanges: "Salva modifiche",
            continue: "Continua",
            footerText: "Puoi cambiare nome e immagine in qualsiasi momento dalle impostazioni"
        },
        notifications: {
            timerStart: "Timer avviato",
            timerComplete: "Timer completato!",
            alarm: "Sveglia"
        }
    },
    en: {
        appName: "bytime",
        greetings: {
            morning: "Good morning",
            lunch: "Lunch time",
            afternoon: "Good afternoon",
            evening: "Good evening",
            night: "Good night",
            welcome: "Welcome to bytime!"
        },
        sections: {
            home: "Home",
            timers: "Timers",
            alarms: "Alarms",
            cronometers: "Stopwatch",
            settings: "Settings",
            feed: "Feed",
            weather: "Weather"
        },
        buttons: {
            seeAll: "See all",
            start: "Start",
            stop: "Stop",
            pause: "Pause",
            resume: "Resume",
            save: "Save",
            cancel: "Cancel",
            delete: "Delete",
            edit: "Edit",
            add: "Add",
            confirm: "Confirm",
            skip: "Skip",
            back: "Back",
            retry: "Retry",
            refresh: "Refresh",
            snooze: "Snooze",
            dismiss: "Dismiss"
        },
        timer: {
            createFirst: "Create your first timer",
            noTimers: "No timers set",
            recentTimers: "Recent timers",
            namePlaceholder: "Timer name (optional)",
            hours: "HH",
            minutes: "MM",
            seconds: "SS",
            groupAll: "All",
            groupWork: "Work",
            groupPersonal: "Personal",
            groupFitness: "Fitness",
            groupStudy: "Study",
            invalidTime: "Invalid time!",
            time: "Time",
            started: "started",
            completed: "completed",
            unnamed: "Unnamed",
            timer: "Timer"
        },
        alarm: {
            createFirst: "Create your first alarm",
            noAlarms: "No alarms set",
            recentAlarms: "Recent alarms",
            namePlaceholder: "Alarm name (optional)",
            repeat: "Repeat",
            days: ["S", "M", "T", "W", "T", "F", "S"],
            active: "Active",
            inactive: "Inactive",
            allAlarms: "All alarms",
            repeatingAlarms: "Repeating alarms",
            noRepeatingAlarms: "No repeating alarms",
            invalidTime: "Invalid time",
            time: "Time",
            alarm: "Alarm"
        },
        stopwatch: {
            start: "Start",
            stop: "Stop",
            lap: "Lap",
            reset: "Reset",
            laps: "Laps",
            noLaps: "No laps recorded"
        },
        settings: {
            account: "Account",
            accountType: "Local account",
            changeUsername: "Edit profile",
            appearance: "Appearance",
            theme: "App theme",
            preferences: "Preferences",
            notifications: "Notifications",
            notificationsDesc: "Push notifications for timers and alarms",
            location: "Location",
            personalize: "Personalize your experience",
            locationDesc: "Share location for local information",
            timerGroups: "Timer groups",
            timerGroupsDesc: "Organize timers into categories",
            amoledMode: "AMOLED mode",
            amoledModeDesc: "Pure black background for AMOLED screens",
            autoplay: "Timer autoplay",
            autoplayDesc: "Automatically start new timers",
            experimental: "Experimental features",
            liquidGlass: "Liquid Glass style",
            liquidGlassDesc: "Frosted glass effect with fluid edges",
            info: "Information",
            version: "Version",
            developer: "Developer",
            reportBug: "Report a bug",
            language: "Language",
            input: "Input",
            languageTitle: "Language & Input",
            languageDesc: "App language",
            themeDefault: "Default",
            themeGreen: "Green",
            themeRed: "Red",
            themePurple: "Blue",
            resetAll: "Full reset",
            resetWarning: "Delete all data and reset any user settings and preferencies",
            resetConfirm: "Are you sure about deleting every data?",
            resetNo: "No, go back!",
            resetComplete: "Reset completed successfully!",
            resetSlide: "Slide to confirm",
            resetDetails: "Removed data: <br>-Timers <br>-Alarms <br>-Stopwatches <br>-Settings and user details",
            user: "User",
            searchPlaceholder: "Search settings",
            noResults: "No results found"
        },
        weather: {
            current: "Current Weather",
            forecast: "Forecast",
            feelsLike: "Feels like",
            humidity: "Humidity",
            wind: "Wind",
            sunrise: "Sunrise",
            sunset: "Sunset",
            loading: "Loading weather data...",
            error: "Failed to load weather data",
            stats: "Weather Stats",
            maxTemp: "Max record",
            minTemp: "Min record",
            avgHumidity: "Avg humidity",
            maxWind: "Max wind",
            loadingForecast: "Loading forecast data...",
            errorForecast: "Error loading forecast data.",
            sun: "Sun",
            locating: "Locating...",
            locationFound: "Location found",
            approxLocation: "Approximate location",
            geoUnsupported: "Geolocation not supported",
            sunDataUnavailable: "Sun data unavailable",
            windUnit: "km/h"
        },
        modals: {
            newTimer: "New Timer",
            newAlarm: "New Alarm",
            usernameTitle: "Edit your profile",
            usernameSubtitle: "Update your name and image",
            usernameLabel: "Your name",
            usernamePlaceholder: "What should we call you?",
            avatarLabel: "Choose image",
            saveChanges: "Save changes",
            continue: "Continue",
            footerText: "You can change name and image anytime in settings"
        },
        notifications: {
            timerStart: "Timer started",
            timerComplete: "Timer completed!",
            alarm: "Alarm"
        }
    },
    es: {
        appName: "bytime",
        greetings: {
            morning: "Buenos días",
            lunch: "Hora de comer",
            afternoon: "Buenas tardes",
            evening: "Buenas noches",
            night: "Buenas noches",
            welcome: "Bienvenido a ByTime"
        },
        sections: {
            home: "Inicio",
            timers: "Temporizadores",
            alarms: "Alarmas",
            cronometers: "Cronómetro",
            settings: "Ajustes",
            feed: "Noticias",
            weather: "Clima"
        },
        buttons: {
            seeAll: "Ver todos",
            start: "Iniciar",
            stop: "Detener",
            pause: "Pausa",
            resume: "Continuar",
            save: "Guardar",
            cancel: "Cancelar",
            delete: "Eliminar",
            edit: "Editar",
            add: "Añadir",
            confirm: "Confirmar",
            skip: "Saltar",
            back: "Atrás",
            retry: "Reintentar",
            refresh: "Actualizar",
            snooze: "Posponer",
            dismiss: "Descartar"
        },
        timer: {
            createFirst: "Crea tu primer temporizador",
            noTimers: "No hay temporizadores",
            recentTimers: "Temporizadores recientes",
            namePlaceholder: "Nombre del temporizador (opcional)",
            hours: "Horas",
            minutes: "Minutos",
            seconds: "Segundos",
            groupAll: "Todos",
            groupWork: "Trabajo",
            groupPersonal: "Personal",
            groupFitness: "Fitness",
            groupStudy: "Estudio",
            invalidTime: "¡Tiempo inválido!",
            time: "Tiempo",
            started: "iniciado",
            completed: "completado",
            unnamed: "Sin nombre",
            timer: "Temporizadores"
        },
        alarm: {
            createFirst: "Crea tu primera alarma",
            noAlarms: "No hay alarmas",
            recentAlarms: "Alarmas recientes",
            namePlaceholder: "Nombre de alarma (opcional)",
            repeat: "Repetir",
            days: ["D", "L", "M", "X", "J", "V", "S"],
            active: "Activa",
            inactive: "Inactiva",
            allAlarms: "Todas las alarmas",
            repeatingAlarms: "Alarmas repetitivas",
            noRepeatingAlarms: "No hay alarmas repetitivas",
            invalidTime: "Hora inválida",
            time: "Hora",
            alarm: "Alarma"
        },
        stopwatch: {
            start: "Iniciar",
            stop: "Detener",
            lap: "Vuelta",
            reset: "Reiniciar",
            laps: "Vueltas",
            noLaps: "No hay vueltas registradas"
        },
        settings: {
            account: "Cuenta",
            accountType: "Cuenta local",
            changeUsername: "Editar perfil",
            appearance: "Apariencia",
            theme: "Tema de la app",
            preferences: "Preferencias",
            notifications: "Notificaciones",
            notificationsDesc: "Notificaciones push para temporizadores y alarmas",
            location: "Ubicación",
            locationDesc: "Compartir ubicación para información local",
            timerGroups: "Grupos de temporizadores",
            timerGroupsDesc: "Organizar temporizadores en categorías",
            amoledMode: "Modo AMOLED",
            amoledModeDesc: "Fondo negro puro para pantallas AMOLED",
            autoplay: "Autoplay de temporizadores",
            personalize: "Personaliza tu experiencia",
            autoplayDesc: "Iniciar automáticamente nuevos temporizadores",
            experimental: "Características experimentales",
            liquidGlass: "Estilo Liquid Glass",
            liquidGlassDesc: "Efecto vidrio esmerilado con bordes fluidos",
            info: "Información",
            version: "Versión",
            developer: "Desarrollador",
            reportBug: "Reportar un error",
            language: "Idioma",
            input: "Entrada",
            languageTitle: "Idioma y entrada",
            languageDesc: "Idioma de la app",
            themeDefault: "Default",
            themeGreen: "Verde",
            themeRed: "Rojo",
            themePurple: "Azul",
            resetAll: "Restaura todo",
            resetWarning: "Borrar todos los datos y restaurar la configuración predeterminada",
            resetConfirm: "¿Estás seguro de que quieres eliminar todos los datos?",
            resetComplete: "¡Reinicio completo!",
            resetSlide: "Desliza el dedo para confirmar",
            resetNo: "No, vuelve atrás",
            resetDetails: "Se eliminarán: <br>- Temporizadores <br>- Alarmas <br>- Cronómetros <br>- Ajustes y detalles del usuario",
            user: "Usuario",
            searchPlaceholder: "Buscar en ajustes",
            noResults: "No se encontraron resultados"
        },
        weather: {
            current: "Tiempo Actual",
            forecast: "Pronóstico",
            feelsLike: "Sensación",
            humidity: "Humedad",
            wind: "Viento",
            sunrise: "Amanecer",
            sunset: "Atardecer",
            loading: "Cargando datos del tiempo...",
            error: "Error al cargar datos del tiempo",
            stats: "Estadísticas del Tiempo",
            maxTemp: "Máximo récord",
            minTemp: "Mínimo récord",
            avgHumidity: "Humedad promedio",
            maxWind: "Viento máximo",
            loadingForecast: "Carga de datos de previsión...",
            errorForecast: "Previsiones de error al cargar.",
            sun: "Sol",
            locating: "Localizando...",
            locationFound: "Ubicación encontrada",
            approxLocation: "Ubicación aproximada",
            geoUnsupported: "Geolocalización no soportada",
            sunDataUnavailable: "Datos solares no disponibles",
            windUnit: "km/h"
        },
        modals: {
            newTimer: "Nuevo Temporizador",
            newAlarm: "Nueva Alarma",
            usernameTitle: "Edita tu perfil",
            usernameSubtitle: "Actualiza tu nombre e imagen",
            usernameLabel: "Tu nombre",
            usernamePlaceholder: "¿Cómo quieres que te llamemos?",
            avatarLabel: "Elegir imagen",
            saveChanges: "Guardar cambios",
            continue: "Continuar",
            footerText: "Puedes cambiar nombre e imagen en cualquier momento en ajustes"
        },
        notifications: {
            timerStart: "Temporizador iniciado",
            timerComplete: "¡Temporizador completado!",
            alarm: "Alarma"
        }
    },
    fr: {
        appName: "bytime",
        greetings: {
            morning: "Bonjour",
            lunch: "Bon appétit",
            afternoon: "Bon après-midi",
            evening: "Bonsoir",
            night: "Bonne nuit",
            welcome: "Bienvenue sur bytime"
        },
        sections: {
            home: "Accueil",
            timers: "Minuteurs",
            alarms: "Alarmes",
            cronometers: "Chronomètre",
            settings: "Paramètres",
            feed: "Flux",
            weather: "Météo"
        },
        buttons: {
            seeAll: "Voir tout",
            start: "Démarrer",
            stop: "Arrêter",
            pause: "Pause",
            resume: "Reprendre",
            save: "Enregistrer",
            cancel: "Annuler",
            delete: "Supprimer",
            edit: "Modifier",
            add: "Ajouter",
            confirm: "Confirmer",
            skip: "Passer",
            back: "Retour",
            retry: "Réessayer",
            refresh: "Actualiser",
            snooze: "Snooze",
            dismiss: "Rejeter"
        },
        timer: {
            createFirst: "Créez votre premier minuteur",
            noTimers: "Aucun minuteur",
            recentTimers: "Minuteurs récents",
            namePlaceholder: "Nom du minuteur (optionnel)",
            hours: "Heures",
            minutes: "Minutes",
            seconds: "Secondes",
            groupAll: "Tous",
            groupWork: "Travail",
            groupPersonal: "Personnel",
            groupFitness: "Fitness",
            groupStudy: "Étude",
            invalidTime: "Temps invalide !",
            time: "Temps",
            started: "démarré",
            completed: "terminé",
            unnamed: "Sans nom",
            timer: "Minuteur"
        },
        alarm: {
            createFirst: "Créez votre première alarme",
            noAlarms: "Aucune alarme",
            recentAlarms: "Alarmes récentes",
            namePlaceholder: "Nom de l'alarme (optionnel)",
            repeat: "Répéter",
            days: ["L", "M", "M", "J", "V", "S", "D"],
            active: "Active",
            inactive: "Inactive",
            allAlarms: "Toutes les alarmes",
            repeatingAlarms: "Alarmes répétitives",
            noRepeatingAlarms: "Pas d'alarmes répétitives",
            invalidTime: "Heure invalide",
            time: "Heure",
            alarm: "Alarme"
        },
        stopwatch: {
            start: "Démarrer",
            stop: "Arrêter",
            lap: "Tour",
            reset: "Réinitialiser",
            laps: "Tours",
            noLaps: "Aucun tour enregistré"
        },
        settings: {
            account: "Compte",
            accountType: "Compte local",
            changeUsername: "Modifier le profil",
            appearance: "Apparence",
            theme: "Thème de l'application",
            preferences: "Préférences",
            notifications: "Notifications",
            notificationsDesc: "Notifications push pour les minuteurs et alarmes",
            location: "Localisation",
            locationDesc: "Partager la position pour des informations locales",
            timerGroups: "Groupes de minuteurs",
            timerGroupsDesc: "Organiser les minuteurs en catégories",
            amoledMode: "Mode AMOLED",
            amoledModeDesc: "Fond noir pur pour écrans AMOLED",
            autoplay: "Lecture automatique",
            autoplayDesc: "Démarrer automatiquement les nouveaux minuteurs",
            experimental: "Fonctionnalités expérimentales",
            liquidGlass: "Style Liquid Glass",
            liquidGlassDesc: "Effet verre dépoli avec bords fluides",
            info: "Information",
            version: "Version",
            developer: "Développeur",
            reportBug: "Signaler un bug",
            language: "Langue",
            input: "Saisie",
            languageTitle: "Langue et saisie",
            languageDesc: "Langue de l'application",
            themeDefault: "Faire défaut",
            themeGreen: "Vert",
            themeRed: "Rouge",
            themePurple: "Bleu",
            resetAll: "Restaurer",
            resetWarning: "Effacer toutes les données et restaurer les paramètres par défaut",
            resetConfirm: "Êtes-vous sûr de vouloir supprimer toutes les données?",
            resetComplete: "Réinitialisation terminée !",
            resetSlide: "Balayez pour confirmer",
            resetNo: "Non, retournez",
            personalize: "Personnalisez votre expérience",
            removeDetails: "Les éléments suivants seront supprimés :<br>- Minuteurs<br>- Alarmes<br>- Chronomètres<br>- Paramètres et détails de l'utilisateur",
            user: "Utilisateur",
            searchPlaceholder: "Rechercher dans les paramètres",
        },
        weather: {
            current: "Météo Actuelle",
            forecast: "Prévisions",
            feelsLike: "Ressenti",
            humidity: "Humidité",
            wind: "Vent",
            sunrise: "Lever",
            sunset: "Coucher",
            loading: "Chargement des données météo...",
            error: "Échec du chargement des données météo",
            stats: "Statistiques Météo",
            maxTemp: "Record max",
            minTemp: "Record min",
            avgHumidity: "Humidité moy",
            maxWind: "Vent max",
            loadingForecast: "Chargement des données prévisionnelles...",
            errorForecast: "Erreur de chargement des prévisions.",
            sun: "Soleil",
            locating: "Localisation en cours...",
            locationFound: "Localisation trouvée",
            approxLocation: "Localisation approximative",
            geoUnsupported: "Géolocalisation non supportée",
            sunDataUnavailable: "Données solaires indisponibles",
            windUnit: "km/h"
        },
        modals: {
            newTimer: "Nouveau Minuteur",
            newAlarm: "Nouvelle Alarme",
            usernameTitle: "Modifier votre profil",
            usernameSubtitle: "Mettre à jour votre nom et image",
            usernameLabel: "Votre nom",
            usernamePlaceholder: "Comment voulez-vous être appelé?",
            avatarLabel: "Choisir une image",
            saveChanges: "Enregistrer les modifications",
            continue: "Continuer",
            footerText: "Vous pouvez changer nom et image à tout moment dans les paramètres"
        },
        notifications: {
            timerStart: "Minuteur démarré",
            timerComplete: "Minuteur terminé!",
            alarm: "Alarme"
        }
    },
    de: {
        appName: "bytime",
        greetings: {
            morning: "Guten Morgen",
            lunch: "Mittagessen",
            afternoon: "Guten Tag",
            evening: "Guten Abend",
            night: "Gute Nacht",
            welcome: "Willkommen bei ByTime"
        },
        sections: {
            home: "Startseite",
            timers: "Timer",
            alarms: "Alarme",
            cronometers: "Stoppuhr",
            settings: "Einstellungen",
            feed: "Feed",
            weather: "Wetter"
        },
        buttons: {
            seeAll: "Alle anzeigen",
            start: "Starten",
            stop: "Stoppen",
            pause: "Pause",
            resume: "Fortsetzen",
            save: "Speichern",
            cancel: "Abbrechen",
            delete: "Löschen",
            edit: "Bearbeiten",
            add: "Hinzufügen",
            confirm: "Bestätigen",
            skip: "Überspringen",
            back: "Zurück",
            retry: "Erneut versuchen",
            refresh: "Aktualisieren",
            snooze: "Snooze",
            dismiss: "Verwerfen"
        },
        timer: {
            createFirst: "Erstellen Sie Ihren ersten Timer",
            noTimers: "Keine Timer",
            recentTimers: "Letzte Timer",
            namePlaceholder: "Timer-Name (optional)",
            hours: "Stunden",
            minutes: "Minuten",
            seconds: "Sekunden",
            groupAll: "Alle",
            groupWork: "Arbeit",
            groupPersonal: "Persönlich",
            groupFitness: "Fitness",
            groupStudy: "Studium",
            invalidTime: "Ungültige Zeit!",
            time: "Zeit",
            started: "gestartet",
            completed: "abgeschlossen",
            unnamed: "Unbenannt",
            timer: "Timer"
        },
        alarm: {
            createFirst: "Erstellen Sie Ihren ersten Alarm",
            noAlarms: "Keine Alarme",
            recentAlarms: "Letzte Alarme",
            namePlaceholder: "Alarmname (optional)",
            repeat: "Wiederholen",
            days: ["M", "D", "M", "D", "F", "S", "S"],
            active: "Aktiv",
            inactive: "Inaktiv",
            allAlarms: "Alle Alarme",
            repeatingAlarms: "Wiederholende Alarme",
            noRepeatingAlarms: "Keine wiederholenden Alarme",
            invalidTime: "Ungültige Zeit",
            time: "Zeit",
            alarm: "Alarm"
        },
        stopwatch: {
            start: "Starten",
            stop: "Stoppen",
            lap: "Runde",
            reset: "Zurücksetzen",
            laps: "Runden",
            noLaps: "Keine Runden aufgezeichnet"
        },
        settings: {
            account: "Konto",
            accountType: "Lokales Konto",
            changeUsername: "Profil bearbeiten",
            appearance: "Aussehen",
            theme: "App-Design",
            preferences: "Einstellungen",
            notifications: "Benachrichtigungen",
            notificationsDesc: "Push-Benachrichtigungen für Timer und Alarme",
            location: "Standort",
            locationDesc: "Standort für lokale Informationen teilen",
            timerGroups: "Timer-Gruppen",
            timerGroupsDesc: "Timer in Kategorien organisieren",
            amoledMode: "AMOLED-Modus",
            amoledModeDesc: "Reiner schwarzer Hintergrund für AMOLED-Bildschirme",
            autoplay: "Timer-Autoplay",
            autoplayDesc: "Neue Timer automatisch starten",
            experimental: "Experimentelle Funktionen",
            liquidGlass: "Liquid Glass-Stil",
            liquidGlassDesc: "Milchglaseffekt mit fließenden Rändern",
            info: "Information",
            version: "Version",
            developer: "Entwickler",
            reportBug: "Fehler melden",
            language: "Sprache",
            input: "Eingabe",
            languageTitle: "Sprache & Eingabe",
            languageDesc: "App-Sprache",
            themeDefault: "Vorgabe",
            themeRed: "Rot",
            themeGreen: "grün",
            themePurple: "blau",
            resetAll: "Wiederherstellen",
            resetWarning: "Löschen Sie alle Daten und stellen Sie die Standardeinstellungen wieder her",
            resetConfirm: "Sind Sie sicher, dass Sie alle Daten löschen möchten?",
            resetComplete: "Zurücksetzen abgeschlossen!",
            resetSlide: "Zum Bestätigen wischen",
            resetNo: "Nein, zurück",
            personalize: "Passen Sie Ihr Erlebnis an ",
            resetDetails: "Folgendes wird entfernt: <br>- Timer <br>- Wecker <br>- Stoppuhren <br>- Einstellungen und Benutzerdetails",
            user: "Benutzer",
            searchPlaceholder: "Einstellungen durchsuchen",
            noResults: "Keine Ergebnisse gefunden"
        },
        weather: {
            current: "Aktuelles Wetter",
            forecast: "Vorhersage",
            feelsLike: "Gefühlt",
            humidity: "Luftfeuchtigkeit",
            wind: "Wind",
            sunrise: "Sonnenaufgang",
            sunset: "Sonnenuntergang",
            loading: "Wetterdaten werden geladen...",
            error: "Fehler beim Laden der Wetterdaten",
            stats: "Wetterstatistiken",
            maxTemp: "Rekordmaximum",
            minTemp: "Rekordminimum",
            avgHumidity: "Durchschn. Luftfeuchtigkeit",
            maxWind: "Maximaler Wind",
            loadingForecast: "Laden von Prognosedaten...",
            errorForecast: "Fehler beim Laden von Prognosen.",
            sun: "Sonne",
            locating: "Standortermittlung...",
            locationFound: "Standort gefunden",
            approxLocation: "Ungefährer Standort",
            geoUnsupported: "Geolokalisierung nicht unterstützt",
            sunDataUnavailable: "Sonnendaten nicht verfügbar",
            windUnit: "km/h"
        },
        modals: {
            newTimer: "Neuer Timer",
            newAlarm: "Neuer Alarm",
            usernameTitle: "Ihr Profil bearbeiten",
            usernameSubtitle: "Aktualisieren Sie Ihren Namen und Ihr Bild",
            usernameLabel: "Ihr Name",
            usernamePlaceholder: "Wie sollen wir Sie nennen?",
            avatarLabel: "Bild auswählen",
            saveChanges: "Änderungen speichern",
            continue: "Weiter",
            footerText: "Sie können Name und Bild jederzeit in den Einstellungen ändern"
        },
        notifications: {
            timerStart: "Timer gestartet",
            timerComplete: "Timer abgeschlossen!",
            alarm: "Alarm"
        }
    }
};

document.addEventListener('DOMContentLoaded', function() {
    currentLanguage = localStorage.getItem('language') || 'it';
    document.title = translations[currentLanguage]?.appName || 'bytime';
    applyTheme();
    applyLiquidGlassEffect();
    initializeTimerGroups();
    updateModalTexts();
    
    if (m3ExpressiveMode) {
        document.body.classList.add('m3-expressive');
    }


    if (!currentUser) {
        showUsernamePrompt();
    } else {
        loadSection(currentSection);
    }

    setupEventListeners();

    if ('Notification' in window) {
            Notification.requestPermission().then(permission => {
                notificationPermission = permission === 'granted';
            });
        }
    
    if ('Notification' in window) {
            Notification.requestPermission().then(permission => {
                notificationPermission = permission === 'granted';
        });
    }
    navigator.serviceWorker.addEventListener('message', function(event) {
        if (event.data.type === 'stopAlarm' && typeof window.stopAlarmSound === 'function') {
            window.stopAlarmSound();
        }
    })
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

function updateThemeColor() {
    const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim();
    const metaThemeColor = document.querySelector('#theme-color-meta');
    
    if (metaThemeColor && primaryColor) {
        metaThemeColor.setAttribute('content', primaryColor);
    }
}

updateThemeColor();

document.addEventListener('DOMContentLoaded', () => {
    const observer = new MutationObserver(updateThemeColor);
    observer.observe(document.body, { 
        attributes: true, 
        attributeFilter: ['class'] 
    });
});

function updateModalTexts() {
    const timerModal = document.getElementById('timer-modal');
    if (timerModal) {
        timerModal.querySelectorAll('[data-translate]').forEach(el => {
            const key = el.getAttribute('data-translate');
            if (el.tagName === 'INPUT' && el.hasAttribute('data-placeholder')) {
                el.setAttribute('placeholder', t(el.getAttribute('data-placeholder')));
            } else {
                el.textContent = t(key);
            }
        });
        const accountBtnText = accountBtn.querySelector('[data-translate]');
        if (accountBtnText) {
            accountBtnText.textContent = t('sections.settings');
        }
        const groupSelect = timerModal.querySelector('#timer-group');
        if (groupSelect) {
            Array.from(groupSelect.options).forEach(option => {
                if (option.hasAttribute('data-translate')) {
                    option.textContent = t(option.getAttribute('data-translate'));
                }
            });
        }
    }
    
    const alarmModal = document.getElementById('alarm-modal');
    if (alarmModal) {
        alarmModal.querySelectorAll('[data-translate]').forEach(el => {
            const key = el.getAttribute('data-translate');
            if (el.tagName === 'INPUT' && el.hasAttribute('data-placeholder')) {
                el.setAttribute('placeholder', t(el.getAttribute('data-placeholder')));
            } else {
                el.textContent = t(key);
            }
        });
        
        const dayNames = translations[currentLanguage]?.alarm?.days || ['L', 'M', 'M', 'G', 'V', 'S', 'D'];
        alarmModal.querySelectorAll('.days button').forEach((btn, index) => {
            btn.textContent = dayNames[index];
        });
    }
    
    const resetModal = document.getElementById('reset-modal');
    if (resetModal) {
        resetModal.querySelectorAll('[data-translate]').forEach(el => {
            const key = el.getAttribute('data-translate');
            el.textContent = t(key);
        });
    }
}


function getDayNames() {
    return translations[currentLanguage]?.alarm?.days || ['L', 'M', 'M', 'G', 'V', 'S', 'D'];
}

function saveTimerGroups() {
    localStorage.setItem('timerGroups', JSON.stringify(timerGroups));
    localStorage.setItem('showTimerGroups', showTimerGroups);
}

function showUsernamePrompt() {
    const isEditing = !!currentUser;
    document.querySelector('nav').style.display = 'none';
    document.getElementById('add-btn').style.display = 'none';
    document.getElementById('account-btn').style.display = 'none';
    
    mainContent.innerHTML = `
        <div class="username-page">
            <div class="username-header">
                <h1>${isEditing ? t('modals.usernameTitle') : t('greetings.welcome')}</h1>
                <p>${isEditing ? t('modals.usernameSubtitle') : t('settings.personalize')}</p>
            </div>
            
            <div class="avatar-section">
                <div class="avatar-preview" id="avatar-preview">
                    ${userAvatar ? 
                        `<img src="${userAvatar}" alt="Avatar">` : 
                        `<span class="material-icons default-avatar">account_circle</span>`
                    }
                </div>
                <label for="avatar-upload" class="btn-upload">
                    <span class="material-icons">add_a_photo</span>
                    ${t('modals.avatarLabel')}
                </label>
                <input type="file" id="avatar-upload" accept="image/*" style="display: none;">
            </div>
            
            <div class="username-form">
                <div class="input-container">
                    <label for="username-input">${t('modals.usernameLabel')}</label>
                    <input 
                        type="text" 
                        id="username-input" 
                        placeholder="${t('modals.usernamePlaceholder')}" 
                        maxlength="20"
                        autocomplete="off"
                        autocapitalize="words"
                        value="${currentUser || ''}"
                    >
                    <div class="input-border"></div>
                </div>
                
                <div class="username-actions">
                    <button id="save-username-btn" class="btn-primary" ${isEditing ? '' : 'disabled'}>
                        <span class="material-icons">check</span>
                        ${isEditing ? t('modals.saveChanges') : t('buttons.confirm')}
                    </button>
                    <button id="skip-username-btn" class="btn-secondary">
                        <span class="material-icons">${isEditing ? 'arrow_back' : 'arrow_forward'}</span>
                        ${isEditing ? t('buttons.back') : t('buttons.skip')}
                    </button>
                </div>
            </div>
            
            <div class="username-footer">
                <p>${t('modals.footerText')}</p>
            </div>
        </div>
    `;

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
            color: black;
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

    if (isEditing) {
        saveButton.disabled = !currentUser;
    }

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

    usernameInput.addEventListener('input', function() {
        const username = this.value.trim();
        saveButton.disabled = !username;
        saveButton.classList.toggle('disabled', !username);
    });

 document.getElementById('save-username-btn').addEventListener('click', function() {
        const username = usernameInput.value.trim();
        if (!username) return;
        
        currentUser = username;
        localStorage.setItem('username', username);
        
        if (avatarFile) {
            const reader = new FileReader();
            reader.onload = function(event) {
                localStorage.setItem('userAvatar', event.target.result);
                userAvatar = event.target.result;
                restoreUI();
                if (isEditing) {
                    loadSection('settings');
                } else {
                    loadSection('home');
                }
            };
            reader.readAsDataURL(avatarFile);
        } else {
            if (!isEditing) {
                localStorage.removeItem('userAvatar');
                userAvatar = null;
            }
            restoreUI();
            if (isEditing) {
                loadSection('settings');
            } else {
                loadSection('home');
            }
        }
    });

    document.getElementById('skip-username-btn').addEventListener('click', function() {
        if (isEditing) {
            restoreUI();
            loadSection('settings');
        } else {
            currentUser = 'Guest';
            localStorage.setItem('username', 'Guest');
            localStorage.removeItem('userAvatar');
            userAvatar = null;
            restoreUI();
            loadSection('home');
        }
    });

    function restoreUI() {
        document.querySelector('nav').style.display = 'flex';
        document.getElementById('add-btn').style.display = 'flex';
        document.getElementById('account-btn').style.display = 'flex';
        document.head.removeChild(style);
    }
}

function getGreeting() {
    if (!currentUser) {
        return translations[currentLanguage]?.greetings?.welcome || "Welcome";
    }
    
    const now = new Date();
    const hours = now.getHours();
    const greetings = translations[currentLanguage]?.greetings || {};
    
    if (hours >= 6 && hours < 12) return `${greetings.morning}, ${currentUser}!`;
    if (hours >= 12 && hours <= 13) return `${greetings.lunch}, ${currentUser}!`;
    if (hours > 13 && hours <= 18) return `${greetings.afternoon}, ${currentUser}!`;
    if (hours > 18 && hours <= 22) return `${greetings.evening}, ${currentUser}!`;
    return `${greetings.night}, ${currentUser}!`;
}

function t(key) {
    const keys = key.split('.');
    let result = translations[currentLanguage];
    
    for (const k of keys) {
        result = result?.[k];
        if (result === undefined) {
            console.warn(`Translation missing for key: ${key} in language: ${currentLanguage}`);
            return translations['en'][keys[0]][keys[1]] || key;
        }
    }
    
    return result;
}

function updateNavTexts() {
    document.querySelectorAll('.nav-btn').forEach(button => {
        const section = button.dataset.section;
        const textSpan = button.querySelector('span:not(.material-icons)');
        if (textSpan) {
            textSpan.textContent = t(`sections.${section}`);
        }
    });
}

function setupEventListeners() {
    document.querySelectorAll('.nav-btn').forEach(button => {
        const section = button.dataset.section;
        const icon = button.querySelector('.material-icons');
        const textSpan = button.querySelector('span:not(.material-icons)');

        
        if (textSpan) {
            textSpan.textContent = t(`sections.${section}`);
        }
        
        button.addEventListener('click', function() {
            const section = this.dataset.section;
            loadSection(section);
        });
    });
    document.getElementById('add-timer-menu').addEventListener('click', () => {
        toggleAddMenu();
        timerModal.style.display = 'block';
        const currentGroup = localStorage.getItem('currentTimerGroup') || 'all';
        const groupSelect = document.getElementById('timer-group');
        if (groupSelect) {
            groupSelect.value = currentGroup;
        }
    });
    backBtn.addEventListener('click', () => {
        loadSection('home');
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.section === 'home') {
                btn.classList.add('active');
            }
        });
    });

    document.getElementById('reset-all-btn')?.addEventListener('click', () => {
        document.getElementById('reset-modal').style.display = 'block';
        initResetSlider();
    });

    document.getElementById('add-timer-menu').addEventListener('click', () => {
            toggleAddMenu();
            timerModal.style.display = 'block';
        });

    document.getElementById('add-alarm-menu').addEventListener('click', () => {
        toggleAddMenu();
        alarmModal.style.display = 'block';
    });
    document.getElementById('add-btn').addEventListener('click', toggleAddMenu);

    document.getElementById('add-timer-menu').addEventListener('click', () => {
        toggleAddMenu();
        timerModal.style.display = 'block';
    });

    document.getElementById('add-alarm-menu').addEventListener('click', () => {
        toggleAddMenu();
        alarmModal.style.display = 'block';
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
        if (event.target.classList.contains('add-menu-overlay')) {
            toggleAddMenu();
        }
        
        if (!event.target.closest('#add-btn') && !event.target.closest('.add-menu')) {
            document.querySelector('.add-menu').classList.remove('show');
            document.querySelector('.add-menu-overlay').classList.remove('show');
            addBtn.classList.remove('menu-open');
        }
    });
    
    accountBtn.addEventListener('click', () => {
        loadSection('settings');
        document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
        backBtn.style.display = 'flex';
    });
}

function initResetSlider() {
    const sliderTrack = document.querySelector('.reset-slider-track');
    const sliderThumb = document.querySelector('.reset-slider-thumb');
    const sliderText = document.querySelector('.reset-slider-text');
    
    let isDragging = false;
    let startX = 0;
    let currentX = 0;
    
    sliderThumb.style.transform = 'translateX(0)';
    sliderThumb.style.backgroundColor = 'var(--primary-color)';
    
    const startDrag = (e) => {
        isDragging = true;
        startX = e.type === 'mousedown' ? e.clientX : e.touches[0].clientX;
        currentX = startX;
        sliderThumb.style.transition = 'none';
        e.preventDefault();
    };
    
    const drag = (e) => {
        if (!isDragging) return;
        
        const x = e.type === 'mousemove' ? e.clientX : e.touches[0].clientX;
        const deltaX = x - startX;
        const maxX = sliderTrack.offsetWidth - sliderThumb.offsetWidth;
        
        currentX = Math.min(Math.max(0, deltaX), maxX);
        sliderThumb.style.transform = `translateX(${currentX}px)`;
        
        if (currentX >= maxX - 10) {
            sliderThumb.style.backgroundColor = '#e53935';
        } else {
            sliderThumb.style.backgroundColor = 'var(--primary-color)';
        }
    };
    
    const endDrag = () => {
        if (!isDragging) return;
        isDragging = false;
        
        const maxX = sliderTrack.offsetWidth - sliderThumb.offsetWidth;
        
        if (currentX >= maxX - 10) {
            performFullReset();
        } else {
            sliderThumb.style.transition = 'transform 0.3s ease';
            sliderThumb.style.transform = 'translateX(0)';
            sliderThumb.style.backgroundColor = 'var(--primary-color)';
        }
    };
    
    sliderThumb.addEventListener('mousedown', startDrag);
    sliderThumb.addEventListener('touchstart', startDrag);
    
    document.addEventListener('mousemove', drag);
    document.addEventListener('touchmove', drag);
    document.addEventListener('mouseup', endDrag);
    document.addEventListener('touchend', endDrag);
    
    return () => {
        sliderThumb.removeEventListener('mousedown', startDrag);
        sliderThumb.removeEventListener('touchstart', startDrag);
        document.removeEventListener('mousemove', drag);
        document.removeEventListener('touchmove', drag);
        document.removeEventListener('mouseup', endDrag);
        document.removeEventListener('touchend', endDrag);
    };
}

function performFullReset() {
    localStorage.clear();
    currentUser = null;
    timers = [];
    alarms = [];
    cronometers = [];
    activeTimer = null;
    currentTheme = 'default';
    currentLanguage = 'it';
    liquidGlassMode = false;
    amoledMode = false;
    autoplayEnabled = true;
    showTimerGroups = false;
    timerGroups = [{ id: 'all', name: 'Tutti i timer', isDefault: true }];
    
    document.getElementById('reset-modal').style.display = 'none';
    
    showNotification(t('settings.resetComplete'), '', false);
    
    setTimeout(() => {
        location.reload();
    }, 1500);
}

function toggleAddMenu() {
    const addMenu = document.querySelector('.add-menu');
    const overlay = document.querySelector('.add-menu-overlay');
    const addBtn = document.getElementById('add-btn');
    
    if (addMenu.classList.contains('show')) {
        addMenu.classList.remove('show');
        overlay.classList.remove('show');
        addBtn.classList.remove('menu-open');
    } else {
        addMenu.classList.add('show');
        overlay.classList.add('show');
        addBtn.classList.add('menu-open');
    }
}

function loadSection(section) {
    currentSection = section;
    localStorage.setItem('currentSection', section);
    headerTitle.textContent = getSectionTitle(section);
    
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.section === section) {
            btn.classList.add('active');
        }
    });
    
    if (section === 'home' || section === 'settings') {
        backBtn.style.display = 'none';
    } else {
        backBtn.style.display = 'flex';
    }
    
    if (section === 'settings') {
        accountBtn.style.display = 'none';
    } else {
        accountBtn.style.display = 'flex';
    }
    
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
        
        <div class="section-title-home">
            <h2>${t('timer.recentTimers')}</h2>
            <a href="#" class="section-btn" data-section="timers">
                <span class="material-icons">timer</span>
                <span>${t('buttons.seeAll')}</span>
            </a>
        </div>
        
        ${timers.length > 0 ? 
            timers.slice(0, 3).map(timer => `
                <div class="card home-timer-item" data-id="${timer.id}">
                    <div class="card-content">
                        <div class="timer-info">
                           ${timer.group && timer.group !== 'all' ? 
                                `<span class="timer-badge" style="background-color:${getGroupColor(timer.group)}">${t(`timer.group${timer.group.charAt(0).toUpperCase() + timer.group.slice(1)}`)}</span>` : ''}
                            <h3>${timer.name || t('timer.timer')}</h3>
                            <p class="time-display">${formatTime(timer.duration)}</p>
                        </div>
                        <button class="icon-btn play-btn">
                            <span class="material-icons">${timer.id === activeTimer?.id ? (activeTimer?.isPaused ? 'play_arrow' : 'pause') : 'play_arrow'}</span>
                        </button>
                    </div>
                    ${(timer.id === activeTimer?.id && !activeTimer?.isPaused) ? 
                        `<div class="progress-bar">
                            <div class="progress" style="width: ${calculateProgress(activeTimer)}%;"></div>
                        </div>` : ''
                    }
                </div>
            `).join('') : 
            `<div class="empty-state">
                <span class="material-icons">timer</span>
                <p>${t('timer.noTimers')}</p>
            </div>`
        }
        
        <div class="separator"></div>
        
        <div class="section-title-home">
            <h2>${t('alarm.recentAlarms')}</h2>
            <a href="#" class="section-btn" data-section="alarms">
                <span class="material-icons">alarm</span>
                <span>${t('buttons.seeAll')}</span>
            </a>
        </div>
        
        ${alarms.length > 0 ? 
            alarms.slice(0, 3).map(alarm => `
                <div class="card" data-id="${alarm.id}">
                    <div class="card-content">
                        <div>
                            <h3>${alarm.name || t('alarm.alarm')}</h3>
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
                <p>${t('alarm.noAlarms')}</p>
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

function loadTimersSection() {
    document.querySelector('.fab').style.display = 'flex';
    
    const groupFilter = localStorage.getItem('currentTimerGroup') || 'all';
    const timersToShow = groupFilter === 'all' ? timers : timers.filter(t => t.group === groupFilter);
    
    mainContent.innerHTML = '';
    
    if (showTimerGroups && timerGroups.length > 1) {
        mainContent.innerHTML += `
            <div class="group-selector">
                ${timerGroups.map(group => `
                    <button class="group-btn ${groupFilter === group.id ? 'active' : ''}" data-group="${group.id}">
                        ${group.id === 'all' ? t('timer.groupAll') : 
                          group.id === 'work' ? t('timer.groupWork') :
                          group.id === 'personal' ? t('timer.groupPersonal') :
                          group.id === 'fitness' ? t('timer.groupFitness') :
                          group.id === 'study' ? t('timer.groupStudy') : 
                          group.name}
                    </button>
                `).join('')}
            </div>
        `;
    }
    
    mainContent.innerHTML += `
        ${timersToShow.length > 0 ? 
            timersToShow.map(timer => `
                <div class="card timer-item" data-id="${timer.id}">
                    <div class="card-content">
                        <div class="timer-info">
                            ${timer.group && timer.group !== 'all' ? 
                                `<span class="timer-badge" style="background-color: ${getGroupColor(timer.group)}">
                                    ${timerGroups.find(g => g.id === timer.group)?.name || timer.group}
                                </span>` : ''}
                            <h3>${timer.name || t('timer.timer')}</h3>
                            <p class="time-display">${formatTime(timer.duration)}</p>
                        </div>
                        <div class="timer-actions">
                            <button class="icon-btn play-btn">
                                <span class="material-icons">${timer.id === activeTimer?.id ? (activeTimer?.isPaused ? 'play_arrow' : 'pause') : 'play_arrow'}</span>
                            </button>
                            <button class="icon-btn reset-timer-btn">
                                <span class="material-icons">replay</span>
                            </button>
                            <button class="icon-btn delete-timer-btn">
                                <span class="material-icons">delete</span>
                            </button>
                        </div>
                    </div>
                    ${(timer.id === activeTimer?.id && !activeTimer?.isPaused) ? 
                        `<div class="progress-bar">
                            <div class="progress" style="width: ${calculateProgress(activeTimer)}%;"></div>
                        </div>` : ''
                    }
                </div>
            `).join('') :
            `<div class="empty-state">
                <span class="material-icons">timer</span>
                <p>${t('timer.noTimers')}</p>
                <button id="create-first-timer" class="btn-primary">
                    <span class="material-icons">add</span>
                    ${t('timer.createFirst')}
                </button>
            </div>`
        }
    `;
    
    document.querySelectorAll('.group-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const group = this.dataset.group;
            localStorage.setItem('currentTimerGroup', group);
            loadTimersSection();
        });
    });
    
    document.querySelectorAll('.play-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const timerId = this.closest('.card').dataset.id;
            const timer = timers.find(t => t.id === timerId);
            toggleTimer(timer);
        });
    });

    document.querySelectorAll('.reset-timer-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const timerId = this.closest('.card').dataset.id;
            resetTimer(timerId);
        });
    });

    document.querySelectorAll('.delete-timer-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const timerId = this.closest('.card').dataset.id;
            deleteTimer(timerId);
        });
    });

    document.getElementById('create-first-timer')?.addEventListener('click', function() {
        timerModal.style.display = 'block';
        const currentGroup = localStorage.getItem('currentTimerGroup') || 'all';
        const groupSelect = document.getElementById('timer-group');
        if (groupSelect) {
            groupSelect.value = currentGroup;
        }
    });
}

function getGroupColor(groupId) {
        if (m3ExpressiveMode) {
        const m3Colors = {
            'work': '#6750A4',
            'personal': '#625B71',
            'fitness': '#7D5260',
            'study': '#958DA5'
        };
        return m3Colors[groupId] || '#6750A4';
    } else {
        const colors = {
            'work': '#4CAF50',
            'personal': '#9C27B0',
            'fitness': '#FF9800',
            'study': '#2196F3'
        };
        return colors[groupId] || '#607D8B';
    }
}

function loadAlarmsSection() {
    document.querySelector('.fab').style.display = 'flex';
    
    const currentAlarmFilter = localStorage.getItem('currentAlarmFilter') || alarmFilters.all;
    
    mainContent.innerHTML = `
        <div class="filter-selector">
            <button class="filter-btn ${currentAlarmFilter === alarmFilters.all ? 'active' : ''}" data-filter="${alarmFilters.all}">
                ${t('alarm.allAlarms')}
            </button>
            <button class="filter-btn ${currentAlarmFilter === alarmFilters.repeating ? 'active' : ''}" data-filter="${alarmFilters.repeating}">
                ${t('alarm.repeatingAlarms')}
            </button>
        </div>
    `;
    
    const alarmsToShow = currentAlarmFilter === alarmFilters.all ? 
        alarms : 
        alarms.filter(alarm => alarm.days && alarm.days.length > 0);
    
    mainContent.innerHTML += `
        ${alarmsToShow.length > 0 ? 
            alarmsToShow.map(alarm => `
                <div class="card" data-id="${alarm.id}">
                    <div class="card-content">
                        <div>
                            <h3>${alarm.name || t('alarm.alarm')}</h3>
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
                <p>${currentAlarmFilter === alarmFilters.repeating ? 
                    t('alarm.noRepeatingAlarms') : 
                    t('alarm.noAlarms')}</p>
                <button id="create-first-alarm" class="btn-primary">
                    <span class="material-icons">add</span>
                    ${t('alarm.createFirst')}
                </button>
            </div>`
        }
    `;

    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const filter = this.dataset.filter;
            localStorage.setItem('currentAlarmFilter', filter);
            loadAlarmsSection();
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

    document.getElementById('create-first-alarm')?.addEventListener('click', function() {
        alarmModal.style.display = 'block';
    });
}

function setLanguage(lang) {
    currentLanguage = lang;
    localStorage.setItem('language', lang);
    document.title = translations[lang]?.appName || 'bytime';
    
    updateNavTexts();
    updateModalTexts();
    loadSection(currentSection);
}

function updateUITexts() {
    headerTitle.textContent = getSectionTitle(currentSection);
    
    document.querySelectorAll('.nav-btn span:last-child').forEach((span, index) => {
        const sections = ['home', 'timers', 'alarms', 'cronometers', 'feed', 'settings'];
        if (index < sections.length) {
            span.textContent = t(`sections.${sections[index]}`);
        }
    });
    
    if (currentSection === 'settings') {
        document.querySelectorAll('.section-title').forEach(el => {
            const section = el.textContent.trim();
            el.textContent = t(`settings.${section.toLowerCase().replace(' ', '')}`) || section;
        });
    }
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
                        <span>${t('stopwatch.lap')}</span>
                        <span>${t('timer.time')}</span>
                    </div>
                    ${stopwatch.laps.map((lap, index) => `
                        <div class="lap-item">
                            <span>${t('stopwatch.lap')} ${index + 1}</span>
                            <span>${formatStopwatchTime(lap)}</span>
                        </div>
                    `).join('')}
                ` : `
                    <div class="no-laps">
                        <span class="material-icons">flag</span>
                        <p>${t('stopwatch.noLaps')}</p>
                    </div>
                `}
            </div>
        </div>
    `;
    

    document.getElementById('stopwatch-start-stop').addEventListener('click', toggleStopwatch);
    
    document.getElementById('stopwatch-lap-reset').addEventListener('click', function() {
        if (stopwatch.running) {
            addLap();
        } else {
            resetStopwatch();
        }
    });

    if (stopwatch.running) {
        startStopwatchUpdate();
    }
}
function formatStopwatchTimeShort(ms) {
    const date = new Date(ms);
    const hours = date.getUTCHours();
    const minutes = date.getUTCMinutes();
    const seconds = date.getUTCSeconds();
    
    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
        return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
}

function calculateUsageDays() {
    const timestamps = [];
    
    timers.forEach(timer => {
        timestamps.push(new Date(timer.createdAt).getTime());
    });
    
    alarms.forEach(alarm => {
        timestamps.push(new Date(alarm.createdAt).getTime());
    });
    
    if (stopwatch.elapsed > 0) {
        const now = new Date().getTime();
        timestamps.push(now - stopwatch.elapsed);
    }
    
    if (timestamps.length === 0) return "Oggi";
    
    const oldestDate = new Date(Math.min(...timestamps));
    const diffTime = Math.abs(new Date() - oldestDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays === 0 ? "Oggi" : `${diffDays} giorni`;
}

function loadFeedSection() {
    document.querySelector('.fab').style.display = 'none';
    
    mainContent.innerHTML = `
        <div class="weather-page">
            <div class="weather-current-section">
                <div class="weather-header">
                    <h2><span class="material-icons">cloud</span> ${t('weather.current')}</h2>
                    <button id="refresh-weather" class="icon-btn">
                        <span class="material-icons">refresh</span>
                    </button>
                </div>
                
                <div class="weather-container">
                    <div id="weather-effect" class="weather-effect"></div>
                    <div id="weather-content" class="weather-content">
                        <div class="weather-loading">
                            <span class="material-icons spinning">autorenew</span>
                            <p>${t('weather.loading')}</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="forecast-section">
                <h2><span class="material-icons">calendar_today</span> ${t('weather.forecast')}</h2>
                <div id="forecast-content" class="forecast-content">
                    <div class="forecast-loading">
                        <span class="material-icons spinning">autorenew</span>
                        <p>${t('weather.loadingForecast')}</p>
                    </div>
                </div>
            </div>
            
            <div class="sun-section">
                <h2><span class="material-icons">wb_sunny</span> ${t('weather.sun')}</h2>
                <div class="sun-cards">
                    <div class="sun-card">
                        <span class="material-icons">brightness_7</span>
                        <div>
                            <span>${t('weather.sunrise')}</span>
                            <strong id="sunrise-time">--:--</strong>
                        </div>
                    </div>
                    <div class="sun-card">
                        <span class="material-icons">brightness_3</span>
                        <div>
                            <span>${t('weather.sunset')}</span>
                            <strong id="sunset-time">--:--</strong>
                        </div>
                    </div>
                </div>
                <p class="location-info" id="location-status">${t('weather.locating')}</p>
            </div>
            
            <div class="weather-stats-section">
                <h2><span class="material-icons">insights</span> ${t('weather.stats')}</h2>
                <div id="weather-stats" class="weather-stats">
                    <div class="stat-card">
                        <div>
                            <span>${t('weather.maxTemp')}</span>
                            <strong id="max-temp">--°</strong>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div>
                            <span>${t('weather.minTemp')}</span>
                            <strong id="min-temp">--°</strong>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div>
                            <span>${t('weather.avgHumidity')}</span>
                            <strong id="avg-humidity">--%</strong>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div>
                            <span>${t('weather.maxWind')}</span>
                            <strong id="max-wind">-- km/h</strong>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    loadWeatherData();
    loadSunTimesWithFallback();
    loadWeatherForecast();
    
    document.getElementById('refresh-weather')?.addEventListener('click', function() {
        loadWeatherData();
        loadWeatherForecast();
    });
}

async function loadWeatherForecast() {
    const forecastContainer = document.getElementById('forecast-content');
    forecastContainer.innerHTML = `
        <div class="forecast-loading">
            <span class="material-icons spinning">autorenew</span>
            <p>${t('weather.loadingForecast')}</p>
        </div>
    `;

    try {
        const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            });
        });

        const { latitude, longitude } = position.coords;
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&units=metric&lang=it&appid=4a01e12e352c7cc307f580cd772c8297`
        );
        
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const data = await response.json();
        if (data.cod !== "200") throw new Error(data.message || 'Errore nel recupero previsioni');

        const dailyForecasts = {};
        data.list.forEach(forecast => {
            const date = new Date(forecast.dt * 1000);
            const dayKey = date.toLocaleDateString('it-IT');
            
            if (!dailyForecasts[dayKey]) {
                dailyForecasts[dayKey] = {
                    date: date,
                    forecasts: [],
                    minTemp: Infinity,
                    maxTemp: -Infinity,
                    mainCondition: null,
                    icon: null,
                    description: null
                };
            }
            
            dailyForecasts[dayKey].minTemp = Math.min(dailyForecasts[dayKey].minTemp, forecast.main.temp_min);
            dailyForecasts[dayKey].maxTemp = Math.max(dailyForecasts[dayKey].maxTemp, forecast.main.temp_max);
            dailyForecasts[dayKey].forecasts.push(forecast);
             
            const hours = date.getHours();
            if (hours === 12 || !dailyForecasts[dayKey].icon) {
                dailyForecasts[dayKey].mainCondition = forecast.weather[0].main;
                dailyForecasts[dayKey].icon = forecast.weather[0].icon;
                dailyForecasts[dayKey].description = forecast.weather[0].description;
            }
        });

        forecastContainer.innerHTML = `
            <div class="forecast-days">
                ${Object.values(dailyForecasts).slice(0, 5).map(day => `
                    <div class="forecast-day">
                        <div class="forecast-day-header">
                            <span class="day-name">${day.date.toLocaleDateString(currentLanguage, { weekday: 'long' })}</span>
                            <div class="day-weather">
                                <img src="https://openweathermap.org/img/wn/${day.icon}.png" alt="${day.mainCondition}">
                                <span>${Math.round(day.minTemp)}° / ${Math.round(day.maxTemp)}°</span>
                            </div>
                        </div>
                        <div class="forecast-day-description">
                            ${capitalizeFirstLetter(day.description)}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

    } catch (error) {
        console.error("Error loading forecast:", error);
        forecastContainer.innerHTML = `
            <div class="forecast-error">
                <span class="material-icons">error</span>
                <p>${t('weather.errorForecast')}</p>
                <button id="retry-forecast-btn" class="btn-secondary small">
                    <span class="material-icons">refresh</span>
                    ${t('buttons.retry')}
                </button>
            </div>
        `;
        
        document.getElementById('retry-forecast-btn')?.addEventListener('click', loadWeatherForecast);
    }
}
async function loadWeatherData() {
    const weatherContainer = document.getElementById('weather-content');
    weatherContainer.innerHTML = `
        <div class="weather-loading">
            <span class="material-icons spinning">autorenew</span>
            <p>${t('weather.loading')}</p>
        </div>
    `;

    try {
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
        
        const timestamp = Date.now();
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&lang=it&appid=4a01e12e352c7cc307f580cd772c8297&_=${timestamp}`
        );
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.cod !== 200) {
            throw new Error(data.message || 'Errore nel recupero dati meteo');
        }

        const weather = {
            temp: Math.round(data.main.temp),
            feels_like: Math.round(data.main.feels_like),
            description: data.weather[0].description,
            icon: data.weather[0].icon,
            humidity: data.main.humidity,
            wind: Math.round(data.wind.speed * 3.6),
            city: data.name || "Posizione sconosciuta",
            condition: data.weather[0].main.toLowerCase()
        };
        
        const weatherEffects = getWeatherEffect(weather.condition);
        
        weatherContainer.innerHTML = `
            <div class="weather-effect-container">
                ${weatherEffects.animation}
                <div class="weather-current">
                    <div class="weather-main">
                        <div class="weather-icon">
                            <img src="https://openweathermap.org/img/wn/${weather.icon}@2x.png" alt="${weather.description}">
                        </div>
                        <div class="weather-temp">
                            <span class="temp-value">${weather.temp}°</span>
                            <span class="temp-feels">${t('weather.feelsLike')} ${weather.feels_like}°</span>
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
                        <span>${weather.humidity}% ${t('weather.humidity')}</span>
                    </div>
                    <div class="weather-stat">
                        <span class="material-icons">air</span>
                        <span>${weather.wind} ${t('weather.windUnit')}</span>
                    </div>
                </div>
            </div>
        `;
        
    } catch (error) {
        console.error("Error loading weather data:", error);
        weatherContainer.innerHTML = `
            <div class="weather-error">
                <span class="material-icons">error</span>
                <p>${t('weather.error')}</p>
                <button id="retry-weather-btn" class="btn-secondary small">
                    <span class="material-icons">refresh</span>
                    ${t('buttons.retry')}
                </button>
            </div>
        `;
        
        document.getElementById('retry-weather-btn')?.addEventListener('click', loadWeatherData);
    }
}

function getWeatherEffect(condition) {
    const effects = {
        rain: {
            animation: `<div class="weather-effect"></div>`,
            css: `
                .weather-effect {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    pointer-events: none;
                    z-index: 0;
                    overflow: hidden;
                }
                ${createRainDrops(30)}
                @keyframes rainDrop {
                    0% { transform: translateY(-20px); }
                    100% { transform: translateY(calc(100vh + 20px)); }
                }
            `
        },
        snow: {
            animation: `<div class="weather-effect"></div>`,
            css: `
                .weather-effect {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    pointer-events: none;
                    z-index: 0;
                    overflow: hidden;
                }
                ${createSnowFlakes(30)}
                @keyframes snowFall {
                    0% { transform: translateY(-10px) rotate(0deg); }
                    100% { transform: translateY(calc(100vh + 10px)) rotate(360deg); }
                }
            `
        },
        clear: {
            animation: `<div class="weather-effect"></div>`,
            css: `
                .weather-effect {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    pointer-events: none;
                    z-index: 0;
                    background: radial-gradient(
                        circle at center,
                        rgba(255,255,0,0.1) 0%,
                        rgba(255,255,0,0) 70%
                    );
                    animation: sunGlow 3s ease-in-out infinite alternate;
                }
                ${createSunRays(8)}
                @keyframes sunGlow {
                    0% { opacity: 0.3; }
                    100% { opacity: 0.6; }
                }
                @keyframes sunRaySpin {
                    0% { transform: rotate(0deg) translateY(-50%); }
                    100% { transform: rotate(360deg) translateY(-50%); }
                }
            `
        },
        clouds: {
            animation: `<div class="weather-effect"></div>`,
            css: `
                .weather-effect {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    pointer-events: none;
                    z-index: 0;
                    background: linear-gradient(
                        90deg,
                        rgba(255,255,255,0) 0%,
                        rgba(255,255,255,0.1) 50%,
                        rgba(255,255,255,0) 100%
                    );
                    animation: cloudsMove 20s linear infinite;
                }
                @keyframes cloudsMove {
                    0% { background-position: 0 0; }
                    100% { background-position: 100% 0; }
                }
            `
        },
        thunderstorm: {
            animation: `<div class="weather-effect thunder-effect"></div>`,
            css: `
                .thunder-effect {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: white;
                    animation: thunderFlash 8s linear infinite;
                    opacity: 0;
                }
                @keyframes thunderFlash {
                    0%, 85%, 100% { opacity: 0; }
                    5% { opacity: 0.8; }
                    6% { opacity: 0; }
                    10% { opacity: 0.5; }
                    11% { opacity: 0; }
                }
            `
        },
        default: {
            animation: '',
            css: ''
        }
    };

    return effects[condition] || effects.default;
}
async function loadWeatherData() {
    const weatherContainer = document.getElementById('weather-content');
    const weatherEffect = document.getElementById('weather-effect');
    
    weatherContainer.innerHTML = `
        <div class="weather-loading">
            <span class="material-icons spinning">autorenew</span>
            <p>Caricamento dati meteo...</p>
        </div>
    `;

    try {
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
        
        const timestamp = Date.now();
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&lang=it&appid=4a01e12e352c7cc307f580cd772c8297&_=${timestamp}`
        );
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.cod !== 200) {
            throw new Error(data.message || 'Errore nel recupero dati meteo');
        }

        const weather = {
            temp: Math.round(data.main.temp),
            feels_like: Math.round(data.main.feels_like),
            description: data.weather[0].description,
            icon: data.weather[0].icon,
            humidity: data.main.humidity,
            wind: Math.round(data.wind.speed * 3.6),
            city: data.name || "Posizione sconosciuta",
            condition: data.weather[0].main.toLowerCase()
        };
        
        updateWeatherEffect(weather.condition);
        
        weatherContainer.innerHTML = `
            <div class="weather-effect-container">
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
            </div>
        `;

    } catch (error) {
        console.error("Errore nel recupero dati meteo:", error);
        weatherContainer.innerHTML = `
            <div class="weather-error">
                <span class="material-icons">error</span>
                <p>${getUserFriendlyError(error)}</p>
                <button id="retry-weather-btn" class="btn-secondary small">
                    <span class="material-icons">refresh</span>
                    Riprova
                </button>
            </div>
        `;
        
        document.getElementById('retry-weather-btn')?.addEventListener('click', loadWeatherData);
    }
}

function updateWeatherEffect(condition) {
    const effectElement = document.getElementById('weather-effect');
    effectElement.innerHTML = '';
    effectElement.className = 'weather-effect';
    
    if (condition.includes('rain')) {
        effectElement.classList.add('rain');
        addRainDrops(30);
    } else if (condition.includes('snow')) {
        effectElement.classList.add('snow');
        addSnowFlakes(30);
    } else if (condition.includes('clear')) {
        effectElement.classList.add('sun');
        addSunRays(8);
    } else if (condition.includes('cloud')) {
        effectElement.classList.add('clouds');
    } else if (condition.includes('thunder')) {
        effectElement.classList.add('thunder');
    }
}

function addRainDrops(count) {
    const effectElement = document.getElementById('weather-effect');
    
    for (let i = 0; i < count; i++) {
        const drop = document.createElement('div');
        drop.className = 'rain-drop';
        drop.style.left = `${Math.random() * 100}%`;
        drop.style.animationDuration = `${0.5 + Math.random() * 1.5}s`;
        drop.style.animationDelay = `${Math.random() * 2}s`;
        drop.style.height = `${10 + Math.random() * 20}px`;
        effectElement.appendChild(drop);
    }
}

function addSnowFlakes(count) {
    const effectElement = document.getElementById('weather-effect');
    
    for (let i = 0; i < count; i++) {
        const flake = document.createElement('div');
        flake.className = 'snow-flake';
        flake.style.left = `${Math.random() * 100}%`;
        flake.style.width = `${2 + Math.random() * 4}px`;
        flake.style.height = flake.style.width;
        flake.style.animationDuration = `${5 + Math.random() * 10}s`;
        flake.style.animationDelay = `${Math.random() * 5}s`;
        effectElement.appendChild(flake);
    }
}

function addSunRays(count) {
    const effectElement = document.getElementById('weather-effect');
    
    for (let i = 0; i < count; i++) {
        const ray = document.createElement('div');
        ray.className = 'sun-ray';
        ray.style.transform = `rotate(${(360 / count) * i}deg) translateY(-50%)`;
        ray.style.height = `${30 + Math.random() * 20}%`;
        effectElement.appendChild(ray);
    }
}

function getUserFriendlyError(error) {
    if (error.message.includes('timeout')) {
        return "Timeout durante la geolocalizzazione";
    } else if (error.message.includes('denied')) {
        return "Permesso di geolocalizzazione negato";
    } else if (error.message.includes('unavailable')) {
        return "Geolocalizzazione non disponibile";
    } else if (error.message.includes('404')) {
        return "Dati meteo non trovati per questa posizione";
    }
    return "Impossibile caricare i dati meteo";
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function loadSettingsSection() {
    document.querySelector('.fab').style.display = 'none';
    document.getElementById('account-btn').style.display = 'none';
    
    mainContent.innerHTML = `
        <div class="settings-page">
        <div class="search-settings-container">
                <div class="search-box">
                    <span class="material-icons">search</span>
                    <input type="text" id="settings-search" placeholder="${t('settings.searchPlaceholder')}" autocomplete="off">
                </div>
            </div>
            <div class="settings-section">
                <h2 class="section-title">${t('settings.account')}</h2>
                <div class="section-content">
                    <div class="account-details">
                        ${userAvatar ? 
                            `<img src="${userAvatar}" alt="Avatar" class="user-avatar">` : 
                            `<span class="material-icons">account_circle</span>`
                        }
                        <div class="account-text">
                            <h3>${currentUser || t('settings.user')}</h3>
                            <p class="account-type">${t('settings.accountType')}</p>
                        </div>
                    </div>
                    <button id="change-username-btn" class="btn-secondary small">
                        <span class="material-icons">edit</span>
                        ${t('settings.changeUsername')}
                    </button>
                </div>
            </div>
            
            <div class="settings-divider"></div>
            
            <div class="settings-section">
                <h2 class="section-title">${t('settings.appearance')}</h2>
                <div class="section-content">
                    <div class="settings-group">
                        <h4 class="group-title">${t('settings.theme')}</h4>
                        <div class="theme-options">
                            <button class="theme-option ${currentTheme === 'default' ? 'active' : ''}" data-theme="default">
                                <div class="theme-preview default"></div>
                                <span>${t('settings.themeDefault')}</span>
                            </button>
                            <button class="theme-option ${currentTheme === 'green' ? 'active' : ''}" data-theme="green">
                                <div class="theme-preview green"></div>
                                <span>${t('settings.themeGreen')}</span>
                            </button>
                            <button class="theme-option ${currentTheme === 'red' ? 'active' : ''}" data-theme="red">
                                <div class="theme-preview red"></div>
                                <span>${t('settings.themeRed')}</span>
                            </button>
                            <button class="theme-option ${currentTheme === 'blue' ? 'active' : ''}" data-theme="blue">
                                <div class="theme-preview purple"></div>
                                <span>${t('settings.themePurple')}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="settings-divider"></div>
            
            <div class="settings-section">
                <h2 class="section-title">${t('settings.languageTitle')}</h2>
                <div class="section-content">
                    <div class="settings-group">
                        <h4 class="group-title">${t('settings.languageDesc')}</h4>
                        <select id="language-select" class="settings-select">
                            <option value="it" ${currentLanguage === 'it' ? 'selected' : ''}>Italiano</option>
                            <option value="en" ${currentLanguage === 'en' ? 'selected' : ''}>English</option>
                            <option value="es" ${currentLanguage === 'es' ? 'selected' : ''}>Español</option>
                            <option value="fr" ${currentLanguage === 'fr' ? 'selected' : ''}>Français</option>
                            <option value="de" ${currentLanguage === 'de' ? 'selected' : ''}>Deutsch</option>
                        </select>
                    </div>
                </div>
            </div>
            
            <div class="settings-divider"></div>
            
            <div class="settings-section">
                <h2 class="section-title">${t('settings.preferences')}</h2>
                <div class="section-content">
                    <div class="settings-group">
                        <div class="switch-container">
                            <div class="switch-info">
                                <h4 class="group-title">${t('settings.notifications')}</h4>
                                <p class="group-description">${t('settings.notificationsDesc')}</p>
                            </div>
                            <label class="switch">
                                <input type="checkbox" id="notifications-toggle" ${notificationPermission ? 'checked' : ''}>
                                <span class="slider round"></span>
                            </label>
                        </div>
                    </div>
                    
                    <div class="settings-group">
                        <div class="switch-container">
                            <div class="switch-info">
                                <h4 class="group-title">${t('settings.location')}</h4>
                                <p class="group-description">${t('settings.locationDesc')}</p>
                            </div>
                            <label class="switch">
                                <input type="checkbox" id="location-toggle">
                                <span class="slider round"></span>
                            </label>
                        </div>
                    </div>
                    
                    <div class="settings-group">
                        <div class="switch-container">
                            <div class="switch-info">
                                <h4 class="group-title">${t('settings.timerGroups')}</h4>
                                <p class="group-description">${t('settings.timerGroupsDesc')}</p>
                            </div>
                            <label class="switch">
                                <input type="checkbox" id="timer-groups-toggle" ${showTimerGroups ? 'checked' : ''}>
                                <span class="slider round"></span>
                            </label>
                        </div>
                    </div>
                    
                    <div class="settings-group">
                        <div class="switch-container">
                            <div class="switch-info">
                                <h4 class="group-title">${t('settings.amoledMode')}</h4>
                                <p class="group-description">${t('settings.amoledModeDesc')}</p>
                            </div>
                            <label class="switch">
                                <input type="checkbox" id="amoled-toggle" ${amoledMode ? 'checked' : ''}>
                                <span class="slider round"></span>
                            </label>
                        </div>
                    </div>
                    
                    <div class="settings-group">
                        <div class="switch-container">
                            <div class="switch-info">
                                <h4 class="group-title">${t('settings.autoplay')}</h4>
                                <p class="group-description">${t('settings.autoplayDesc')}</p>
                            </div>
                            <label class="switch">
                                <input type="checkbox" id="autoplay-toggle" ${autoplayEnabled ? 'checked' : ''}>
                                <span class="slider round"></span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="settings-divider"></div>
            
            <div class="settings-section">
                <h2 class="section-title">${t('settings.experimental')}</h2>
                <div class="section-content">
                    <div class="settings-group">
                        <div class="switch-container">
                            <div class="switch-info">
                                <h4 class="group-title">${t('settings.liquidGlass')}</h4>
                                <p class="group-description">${t('settings.liquidGlassDesc')}</p>
                            </div>
                            <label class="switch">
                                <input type="checkbox" id="liquid-glass-toggle" ${liquidGlassMode ? 'checked' : ''}>
                                <span class="slider round"></span>
                            </label>
                        </div>
                    </div>
                    <div class="settings-group">
                        <div class="switch-container">
                            <div class="switch-info">
                                <h4 class="group-title">Material 3 Expressive</h4>
                                <p class="group-description">Stile avanzato con forme espressive e tipografia dinamica</p>
                            </div>
                            <label class="switch">
                                <input type="checkbox" id="m3-expressive-toggle" ${m3ExpressiveMode ? 'checked' : ''}>
                                <span class="slider round"></span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="settings-divider"></div>
            
            <div class="settings-section">
                <h2 class="section-title">${t('settings.info')}</h2>
                <div class="section-content">
                    <div class="info-grid">
                        <div class="info-item">
                            <span>${t('settings.version')}</span>
                            <span>1.4.8</span>
                        </div>
                        <div class="info-item">
                            <span>Release Source:</span>
                            <span>OFFICIAL</span>
                        </div>
                        <div class="info-item">
                            <span>${t('settings.developer')}</span>
                            <span>bytime devTeam</span>
                        </div>
                    </div>
                </div>
                        <div class="settings-section">
                            <h2 class="section-title">Reset</h2>
                            <div class="section-content">
                                <button id="reset-all-btn" class="btn-danger">
                                    <span class="material-icons">delete_forever</span>
                                    ${t('settings.resetAll')}
                                </button>
                                <p class="reset-warning">${t('settings.resetWarning')}</p>
                            </div>
                        </div>
                        
                    <div class="settings-divider"></div>

                    <a href="mailto:mvisentin2008@gmail.com">
                        <button class="segnala">
                            <span class="material-icons">bug_report</span>
                            ${t('settings.reportBug')}
                        </button>
                    </a>
            </div>
        </div>
    `;
    
    const style = document.createElement('style');
    style.textContent = `
        .search-settings-container {
            padding: 1rem;
            position: sticky;
            top: 0;
            background-color: var(--background-color);
            z-index: 10;
        }
        
        .search-box {
            display: flex;
            align-items: center;
            background-color: #2a2a2a;
            border-radius: 24px;
            padding: 8px 16px;
            transition: all 0.3s ease;
        }
        
        .search-box:focus-within {
            box-shadow: 0 0 0 2px var(--primary-color);
        }
        
        .search-box .material-icons {
            color: #aaa;
            margin-right: 8px;
        }
        
        #settings-search {
            flex: 1;
            background: transparent;
            border: none;
            color: white;
            font-size: 1rem;
            padding: 8px 0;
        }
        
        #settings-search::placeholder {
            color: #666;
        }
        
        .settings-section.hidden {
            display: none;
        }
        
        .no-results {
            text-align: center;
            padding: 2rem;
            color: #aaa;
        }
        .settings-page {
            padding: 0;
        }
        
        .settings-header {
            display: flex;
            align-items: center;
            gap: 16px;
            margin-bottom: 24px;
            padding-bottom: 12px;
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
            padding: 1.5rem 1rem;
            margin-bottom: 0;
        }
        
        .settings-divider {
            height: 8px;
            background-color: #2a2a2a;
            margin: 0;
            border-radius: 2vh;
        }
        
        .section-title {
            font-size: 1.1rem;
            margin-bottom: 1.2rem;
            color: var(--primary-color);
            display: flex;
            align-items: center;
        }
        
        .section-title::before {
            content: '';
            display: inline-block;
            width: 4px;
            height: 1.1rem;
            background-color: var(--primary-color);
            margin-right: 0.8rem;
            border-radius: 2px;
        }
        
        .section-content {
            padding: 0 0.5rem;
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
        
        .settings-group {
            margin-bottom: 1.5rem;
        }
        
        .settings-group:last-child {
            margin-bottom: 0;
        }
        
        .group-title {
            font-size: 1rem;
            margin: 0 0 0.3rem 0;
            color: white;
        }
        
        .group-description {
            font-size: 0.85rem;
            color: #aaa;
            margin: 0;
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
            justify-content: space-between;
            align-items: center;
            padding: 0.8rem 0;
        }
        
        .switch-container:last-child {
            border-bottom: none;
        }
        
        .switch-info {
            flex: 1;
            margin-right: 1rem;
        }
        
        .switch {
            position: relative;
            display: inline-block;
            width: 60px;
            height: 30px;
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
            height: 24px;
            width: 24px;
            left: 4px;
            top: 3px;
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
        
        .info-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 0.8rem;
        }
        
        .info-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.8rem 0;
            border-bottom: 1px solid #444;
        }
        
        .info-item:last-child {
            border-bottom: none;
        }
        
        .info-item span:first-child {
            color: #aaa;
        }
        
        .info-item span:last-child {
            color: white;
            font-weight: normal;
        }
        
        .segnala, .segnala a {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-top: 1.5rem;
            padding: 8px 16px;
            background-color: var(--primary-color);
            color: white;
            border: none;
            border-radius: 20px;
            cursor: pointer;
            text-decoration: none;
            width: 100%;
            justify-content: center;
        }
    `;
    document.head.appendChild(style);

    document.getElementById('account-btn').style.display = 'none';
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.section === 'settings') {
            btn.classList.add('active');
        }
    });

    document.getElementById('settings-search')?.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        const sections = document.querySelectorAll('.settings-section');
        let hasResults = false;
        let previousVisibleSection = null;

        sections.forEach(section => {
            const title = section.querySelector('.section-title')?.textContent.toLowerCase() || '';
            const content = section.textContent.toLowerCase();
            
            if (title.includes(searchTerm) || content.includes(searchTerm)) {
                section.classList.remove('hidden');
                hasResults = true;
                
                const divider = section.previousElementSibling;
                if (divider && divider.classList.contains('settings-divider')) {
                    divider.style.display = previousVisibleSection ? 'block' : 'none';
                }
                
                previousVisibleSection = section;
            } else {
                section.classList.add('hidden');
                
                const divider = section.previousElementSibling;
                if (divider && divider.classList.contains('settings-divider')) {
                    divider.style.display = 'none';
                }
            }
        });

    const noResults = document.querySelector('.no-results');
    if (!hasResults) {
        if (!noResults) {
            const noResultsEl = document.createElement('div');
            noResultsEl.className = 'no-results';
            noResultsEl.innerHTML = `
                <span class="material-icons">search_off</span>
                <p>${t('settings.noResults')}</p>
            `;
            document.querySelector('.settings-page').appendChild(noResultsEl);
        }
    } else if (noResults) {
        noResults.remove();
    }
});
document.getElementById('liquid-glass-toggle')?.addEventListener('change', function() {
    liquidGlassMode = this.checked;
    localStorage.setItem('liquidGlassMode', liquidGlassMode);
    applyTheme();
    applyLiquidGlassEffect();
});
        document.getElementById('timer-groups-toggle')?.addEventListener('change', function() {
        showTimerGroups = this.checked;
        saveTimerGroups();
        if (currentSection === 'timers') {
            loadSection('timers');
        }
    });

    document.querySelectorAll('.theme-option').forEach(option => {
        option.addEventListener('click', function() {
            const theme = this.dataset.theme;
            setTheme(theme);
        });
    });
    document.getElementById('reset-all-btn')?.addEventListener('click', () => {
        document.getElementById('reset-modal').style.display = 'block';
        const cleanup = initResetSlider();
        
        const modal = document.getElementById('reset-modal');
        const closeModal = (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
                cleanup();
                modal.removeEventListener('click', closeModal);
            }
        };
        modal.addEventListener('click', closeModal);
    });
    document.getElementById('amoled-toggle').checked = amoledMode;
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
    document.getElementById('language-select')?.addEventListener('change', function() {
        setLanguage(this.value);
    });
    document.getElementById('autoplay-toggle')?.addEventListener('change', function() {
            autoplayEnabled = this.checked;
            localStorage.setItem('autoplayEnabled', autoplayEnabled);
        });
    document.getElementById('amoled-toggle')?.addEventListener('change', function() {
        amoledMode = this.checked;
        localStorage.setItem('amoledMode', amoledMode);
        applyTheme();
    });
    
    document.getElementById('change-username-btn')?.addEventListener('click', function() {
        showUsernamePrompt();
    });
    
    document.getElementById('request-location-btn')?.addEventListener('click', function() {
        requestLocationPermission();
    });
    document.getElementById('liquid-glass-toggle')?.addEventListener('change', function() {
        if (this.checked) {
            document.getElementById('m3-expressive-toggle').checked = false;
            m3ExpressiveMode = false;
            localStorage.setItem('m3ExpressiveMode', false);
            document.body.classList.remove('m3-expressive');
        }
        liquidGlassMode = this.checked;
        localStorage.setItem('liquidGlassMode', liquidGlassMode);
        applyTheme();
        applyLiquidGlassEffect();
    });

    document.getElementById('m3-expressive-toggle')?.addEventListener('change', function() {
        if (this.checked) {
            document.getElementById('liquid-glass-toggle').checked = false;
            liquidGlassMode = false;
            localStorage.setItem('liquidGlassMode', false);
            document.body.classList.remove('liquid-glass-mode');
            document.querySelectorAll('.liquid-effect').forEach(el => el.remove());
        }
        m3ExpressiveMode = this.checked;
        localStorage.setItem('m3ExpressiveMode', m3ExpressiveMode);
        document.body.classList.toggle('m3-expressive', m3ExpressiveMode);
        applyTheme();
    });
}

function applyLiquidGlassEffect() {
    const body = document.body;
    
    if (liquidGlassMode) {
        body.classList.add('liquid-glass-mode');
        
        const liquidEffect = document.createElement('div');
        liquidEffect.className = 'liquid-effect';
        document.body.appendChild(liquidEffect);
        
        setInterval(() => {
            liquidEffect.style.setProperty('--x', `${Math.random() * 100}%`);
            liquidEffect.style.setProperty('--y', `${Math.random() * 100}%`);
            liquidEffect.style.setProperty('--r', `${Math.random() * 360}deg`);
        }, 8000);
    } else {
        body.classList.remove('liquid-glass-mode');
        document.querySelectorAll('.liquid-effect').forEach(el => el.remove());
    }
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
    const currentGroup = localStorage.getItem('currentTimerGroup') || 'all';
    const groupSelect = document.getElementById('timer-group');
    
    if (groupSelect) {
        groupSelect.value = currentGroup;
    }
    
    const group = groupSelect ? groupSelect.value : 'all';
    
    if (hours === 0 && minutes === 0 && seconds === 0) {
        alert(t('timer.invalidTime'));
        return;
    }
    
    const duration = hours * 3600 + minutes * 60 + seconds;
    
    const timer = {
        id: generateId(),
        name: name,
        duration: duration,
        group: group,
        createdAt: new Date().toISOString()
    };
    
    timers.unshift(timer);
    saveTimers();
    timerModal.style.display = 'none';
    
    if (currentSection === 'home' || currentSection === 'timers') {
        loadSection(currentSection);
    }
    
    if (autoplayEnabled) {
        toggleTimer(timer);
    }
    
    document.getElementById('hours').value = '';
    document.getElementById('minutes').value = '';
    document.getElementById('seconds').value = '';
    document.getElementById('timer-name').value = '';
}


function filterTimersByGroup(groupId) {
    if (groupId === 'all') return timers;
    return timers.filter(timer => timer.group === groupId);
}

function initializeTimerGroups() {
    if (!localStorage.getItem('timerGroups')) {
        timerGroups = [
            { id: 'all', name: t('timer.groupAll'), isDefault: true },
            { id: 'work', name: t('timer.groupWork'), isDefault: false },
            { id: 'personal', name: t('timer.groupPersonal'), isDefault: false },
            { id: 'fitness', name: t('timer.groupFitness'), isDefault: false },
            { id: 'study', name: t('timer.groupStudy'), isDefault: false }
        ];
        localStorage.setItem('timerGroups', JSON.stringify(timerGroups));
    } else {
        timerGroups = JSON.parse(localStorage.getItem('timerGroups'));
        // Update names with translations if they exist
        timerGroups.forEach(group => {
            if (group.id !== 'all') {
                group.name = t(`timer.group${group.id.charAt(0).toUpperCase() + group.id.slice(1)}`);
            } else {
                group.name = t('timer.groupAll');
            }
        });
    }
    showTimerGroups = localStorage.getItem('showTimerGroups') === 'true' || false;
}
function createNewAlarm() {
    const time = document.getElementById('alarm-time').value;
    const name = document.getElementById('alarm-name').value;
    
    if (!time) {
        alert(t('alarm.invalidTime'));
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
        // Pause the timer if it's running
        if (!activeTimer.isPaused) {
            clearInterval(activeTimer.interval);
            activeTimer.pausedAt = Date.now();
            activeTimer.isPaused = true;
            localStorage.setItem('activeTimer', JSON.stringify(activeTimer));
            
            showNotification(t('notifications.timerPaused'), `${t('timer.timer')} "${timer.name || t('timer.unnamed')}" ${t('timer.paused')}`);
        } 
        // Resume the timer if it's paused
        else {
            const remaining = activeTimer.endTime - activeTimer.pausedAt;
            activeTimer.endTime = Date.now() + remaining;
            activeTimer.isPaused = false;
            activeTimer.interval = setInterval(() => updateTimerCountdown(activeTimer), 1000);
            localStorage.setItem('activeTimer', JSON.stringify(activeTimer));
            
            showNotification(t('notifications.timerResumed'), `${t('timer.timer')} "${timer.name || t('timer.unnamed')}" ${t('timer.resumed')}`);
        }
    } else {
        // Start a new timer
        if (activeTimer) {
            clearInterval(activeTimer.interval);
            closeAllNotifications();
        }
        
        const endTime = Date.now() + (timer.duration * 1000);
        
        activeTimer = {
            id: timer.id,
            name: timer.name,
            endTime: endTime,
            duration: timer.duration,
            interval: setInterval(() => updateTimerCountdown(activeTimer), 1000),
            isPaused: false
        };
        
        localStorage.setItem('activeTimer', JSON.stringify(activeTimer));
        showNotification(t('notifications.timerStart'), `${t('timer.timer')} "${timer.name || t('timer.unnamed')}" ${t('timer.started')}`);
    }
    
    // Update the UI immediately
    updateTimerIcon(timer.id);
    
    if (currentSection === 'home' || currentSection === 'timers') {
        loadSection(currentSection);
    }
}

// Helper function to update the timer icon
function updateTimerIcon(timerId) {
    const playButtons = document.querySelectorAll(`.card[data-id="${timerId}"] .play-btn .material-icons`);
    playButtons.forEach(icon => {
        if (activeTimer && activeTimer.id === timerId) {
            icon.textContent = activeTimer.isPaused ? 'play_arrow' : 'pause';
        } else {
            icon.textContent = 'play_arrow';
        }
    });
}
function resetTimer(timerId) {
    const timer = timers.find(t => t.id === timerId);
    if (!timer) return;

    if (activeTimer && activeTimer.id === timerId) {
        clearInterval(activeTimer.interval);
        activeTimer = null;
        localStorage.removeItem('activeTimer');
        closeAllNotifications();
    }

    // Aggiorna l'interfaccia utente
    updateTimerIcon(timerId);
    
    // Aggiorna la barra di progresso se visibile
    const progressBars = document.querySelectorAll(`.card[data-id="${timerId}"] .progress`);
    progressBars.forEach(bar => {
        bar.style.width = '0%';
    });

    // Ricarica la sezione corrente
    if (currentSection === 'home' || currentSection === 'timers') {
        loadSection(currentSection);
    }
}
function updateTimerCountdown(timer) {
    const now = Date.now();
    const remaining = timer.endTime - now;
    
    if (remaining <= 0) {
        clearInterval(timer.interval);
        activeTimer = null;
        localStorage.removeItem('activeTimer');
        
        showNotification(t('notifications.timerComplete'), `${t('timer.timer')} "${timer.name || t('timer.unnamed')}" ${t('timer.completed')}`, true);
        
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
}

function startTimerCountdown(timer) {
    if (timer.isPaused) return; // Non avviare il countdown se in pausa
    
    showNotification(t('notifications.timerStart'), `${t('timer.timer')} "${timer.name || t('timer.unnamed')}" ${t('timer.started')}`);
    
    timer.interval = setInterval(() => {
        const now = new Date().getTime();
        const remaining = timer.endTime - now;
        
        if (remaining <= 0) {
            clearInterval(timer.interval);
            activeTimer = null;
            localStorage.removeItem('activeTimer');
            
            showNotification(t('notifications.timerComplete'), `${t('timer.timer')} "${timer.name || t('timer.unnamed')}" ${t('timer.completed')}`, true);
            
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
                const lastTriggered = alarm.lastTriggeredDate;
                const today = now.toDateString();
                
                if (!lastTriggered || lastTriggered !== today) {
                    alarm.lastTriggeredDate = today;
                    saveAlarms();
                    
                    // Mostra la notifica
                    showNotification(
                        alarm.name || t('notifications.alarm'), 
                        `${t('alarm.time')}: ${alarm.time}`,
                        true,
                        true,
                        alarm.id
                    );
                    playAlarmSound();
                }
            }
        }
    });
    
    setTimeout(checkAlarms, 60000 - now.getSeconds() * 1000 - now.getMilliseconds());
}

function showNotification(title, body, requireInteraction = false, isAlarm = false, alarmId = null) {
    if (!('Notification' in window)) return;
    
    const notificationTitle = translations[currentLanguage]?.notifications?.[title] || title;
    const notificationBody = typeof body === 'string' ? 
                          (translations[currentLanguage]?.notifications?.[body] || body) : 
                          body;
    
    if (Notification.permission === 'granted') {
        const options = {
            body: notificationBody,
            icon: '/icons/icon-192x192.png',
            badge: '/icons/badge-72x72.png',
            vibrate: isAlarm ? [200, 100, 200, 100, 200] : [200, 100, 200],
            requireInteraction: isAlarm,
            data: {
                type: isAlarm ? 'alarm' : 'timer',
                alarmId: alarmId
            }
        };
        
        if (isAlarm) {
            options.actions = [
                { action: 'snooze', title: t('buttons.snooze') },
                { action: 'dismiss', title: t('buttons.dismiss') }
            ];
        }
        
        if (serviceWorkerRegistration) {
            serviceWorkerRegistration.showNotification(notificationTitle, options);
        } else if ('Notification' in window) {
            new Notification(notificationTitle, options);
        }
    } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                showNotification(title, body, requireInteraction, isAlarm, alarmId);
            }
        });
    }
}

function calculateProgress(timer) {
    const now = Date.now();
    const elapsed = timer.duration * 1000 - (timer.endTime - now);
    return Math.min(100, Math.max(0, (elapsed / (timer.duration * 1000)) * 100));
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
    const dayNames = translations[currentLanguage]?.alarm?.days || ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    return days.map(day => dayNames[day]).join(', ');
}

function setTheme(theme) {
    currentTheme = theme;
    localStorage.setItem('theme', theme);
    applyTheme();
}

function applyTheme() {
    const root = document.documentElement;
    const body = document.body;
    
    if (amoledMode) {
        body.style.backgroundColor = '#000000';
        body.classList.add('amoled-mode');
    } else {
        body.style.backgroundColor = '#1f1f1f';
        body.classList.remove('amoled-mode');
    }
    
    if (m3ExpressiveMode) {
        switch(currentTheme) {
            case 'green':
                body.style.setProperty('--primary-color', '#4CAF50');
                body.style.setProperty('--secondary-color', '#81C784');
                body.style.setProperty('--accent-color', '#FF8A65');
                body.style.setProperty('color', 'white');
                break;
            case 'red':
                body.style.setProperty('--primary-color', '#F44336');
                body.style.setProperty('--secondary-color', '#E57373');
                body.style.setProperty('--accent-color', '#FFB74D');
                break;
            case 'blue':
                body.style.setProperty('--primary-color', '#60adddff');
                body.style.setProperty('--secondary-color', '#BA68C8');
                body.style.setProperty('--accent-color', '#15609dff');
                break;
            default:
                body.style.setProperty('--primary-color', '#6750A4');
                body.style.setProperty('--secondary-color', '#958DA5');
                body.style.setProperty('--accent-color', '#7D5260');
        }
    } else {
        // Palette standard
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
            default: // default theme
                root.style.setProperty('--primary-color', '#5782c9');
                root.style.setProperty('--secondary-color', '#34A853');
                root.style.setProperty('--accent-color', '#EA4335');
        }
    }
}

function showNotification(title, body, requireInteraction = false, isAlarm = false, alarmId = null) {
    if (!('Notification' in window)) return;
    
    const translatedTitle = translations[currentLanguage]?.notifications?.[title] || title;
    const translatedBody = typeof body === 'string' ? 
                         (translations[currentLanguage]?.notifications?.[body] || body) : 
                         body;
    
    if (Notification.permission === 'granted') {
        const options = {
            body: translatedBody,
            icon: '/icons/icon-192x192.png',
            badge: '/icons/badge-72x72.png',
            vibrate: isAlarm ? [200, 100, 200, 100, 200] : [200, 100, 200],
            requireInteraction: isAlarm ? true : requireInteraction,
            data: {
                type: isAlarm ? 'alarm' : 'timer',
                alarmId: alarmId
            }
        };
        
        if (isAlarm) {
            options.actions = [
                { action: 'snooze', title: t('buttons.snooze') },
                { action: 'dismiss', title: t('buttons.dismiss') }
            ];
        }
        
        if (serviceWorkerRegistration) {
            serviceWorkerRegistration.showNotification(translatedTitle, options);
        } else {
            new Notification(translatedTitle, options);
        }
    }
}

async function requestWakeLock() {
    try {
        const wakeLock = await navigator.wakeLock.request('screen');
        wakeLock.addEventListener('release', () => {
            console.log('Wake Lock was released');
        });
        console.log('Wake Lock is active');
    } catch (err) {
        console.error(`${err.name}, ${err.message}`);
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

function playAlarmSound() {
    const alarmSound = new Audio('/sounds/alarm_sound.mp3');
    alarmSound.loop = true;
    alarmSound.play();
    
    window.stopAlarmSound = function() {
        alarmSound.pause();
        alarmSound.currentTime = 0;
    };
}

async function loadSunTimesWithFallback() {
    const statusEl = document.getElementById('location-status');
    const sunriseEl = document.getElementById('sunrise-time');
    const sunsetEl = document.getElementById('sunset-time');
    
    statusEl.textContent = t('weather.locating');
    
    if (navigator.geolocation) {
        try {
            const position = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                });
            });

            const { latitude, longitude } = position.coords;
            
            const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&lang=${currentLanguage}&appid=4a01e12e352c7cc307f580cd772c8297`);
            const data = await response.json();
            
            if (data.sys) {
                const sunriseTime = new Date(data.sys.sunrise * 1000);
                const sunsetTime = new Date(data.sys.sunset * 1000);
                
                sunriseEl.textContent = sunriseTime.toLocaleTimeString(currentLanguage, {hour: '2-digit', minute:'2-digit'});
                sunsetEl.textContent = sunsetTime.toLocaleTimeString(currentLanguage, {hour: '2-digit', minute:'2-digit'});
                
                statusEl.textContent = data.name || t('weather.locationFound');
            } else {
                throw new Error(t('weather.sunDataUnavailable'));
            }
        } catch (error) {
            console.error("Geolocation error:", error);
            showDefaultSunTimes();
            statusEl.textContent = t('weather.approxLocation');
        }
    } else {
        showDefaultSunTimes();
        statusEl.textContent = t('weather.geoUnsupported');
    }
}

function showDefaultItalianTimes() {
    const now = new Date();
    const month = now.getMonth();
    const isSummer = month >= 4 && month <= 9;
    
    const sunriseTime = isSummer ? '05:45' : '07:30';
    const sunsetTime = isSummer ? '20:30' : '17:45';
    
    document.getElementById('sunrise-time').textContent = sunriseTime;
    document.getElementById('sunset-time').textContent = sunsetTime;
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
    return translations[currentLanguage]?.sections?.[section] || section;
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
