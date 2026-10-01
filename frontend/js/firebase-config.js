/**
 * CourseCraft Firebase Configuration & Client Initializer
 * Connected directly to user's Firebase Project: coursecraft-c31f9
 */

window.CourseCraftFirebase = (function() {
  // Live Firebase Configuration provided by user
  const defaultConfig = {
    apiKey: "AIzaSyA5ecqLE2jqseOWQVGNQw-50GwCBIqjoEE",
    authDomain: "coursecraft-c31f9.firebaseapp.com",
    projectId: "coursecraft-c31f9",
    storageBucket: "coursecraft-c31f9.firebasestorage.app",
    messagingSenderId: "26763948239",
    appId: "1:26763948239:web:7ea95e07bd79876a8547ba",
    measurementId: "G-TWGG8PKKDS"
  };

  // Allow custom overrides stored in localStorage
  function getConfig() {
    try {
      const stored = localStorage.getItem('coursecraft_firebase_config');
      if (stored) {
        return { ...defaultConfig, ...JSON.parse(stored) };
      }
    } catch (e) {
      console.warn('Could not parse custom Firebase config:', e);
    }
    return defaultConfig;
  }

  let isInitialized = false;
  let auth = null;
  let db = null;
  let storage = null;
  let status = 'INITIALIZING';

  function init() {
    const config = getConfig();
    try {
      if (typeof firebase !== 'undefined' && firebase.initializeApp) {
        if (!firebase.apps.length) {
          firebase.initializeApp(config);
        }
        auth = firebase.auth ? firebase.auth() : null;
        db = firebase.firestore ? firebase.firestore() : null;
        storage = firebase.storage ? firebase.storage() : null;
        isInitialized = true;
        status = 'FIREBASE_ONLINE';
        console.log('✅ Firebase initialized successfully for project:', config.projectId);
      } else {
        status = 'HYBRID_MODE';
        console.log('ℹ️ Firebase SDK running in REST/Local-First fallback mode');
      }
    } catch (err) {
      status = 'OFFLINE_FALLBACK';
      console.warn('⚠️ Firebase init error, using local-first storage:', err.message);
    }
  }

  // Initialize immediately
  init();

  return {
    getConfig,
    saveConfig: function(newConfig) {
      localStorage.setItem('coursecraft_firebase_config', JSON.stringify(newConfig));
      location.reload();
    },
    resetConfig: function() {
      localStorage.removeItem('coursecraft_firebase_config');
      location.reload();
    },
    getAuth: () => auth,
    getDb: () => db,
    getStorage: () => storage,
    getStatus: () => status,
    isOnline: () => status === 'FIREBASE_ONLINE'
  };
})();
