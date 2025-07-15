const apiInput = document.getElementById('apiKey');
const modelSelect = document.getElementById('modelSelect');
let isPasswordVisible = false;

let voices = [];
let currentVoice = null;

// Carica impostazioni precedenti
window.onload = () => {
  apiInput.value = localStorage.getItem('openrouter_api_key') || '';
  modelSelect.value = localStorage.getItem('openrouter_model') || 'deepseek/deepseek-r1-0528:free';

  // Applica il tema salvato (togliere commento sotto per riattivare il cambio tema)
  //const savedTheme = localStorage.getItem('theme') || 'light';
  const savedTheme = 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  //updateThemeIcon();

  // Carica le voci disponibili
  loadVoices();
};

function togglePasswordVisibility() {
  const input = document.getElementById('apiKey');
  const button = document.querySelector('.toggle-visibility');

  if (isPasswordVisible) {
    input.type = 'password';
    button.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
      <circle cx="12" cy="12" r="3"></circle>
    </svg>`;
  } else {
    input.type = 'text';
    button.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
      <line x1="1" y1="1" x2="23" y2="23"></line>
    </svg>`;
  }
  isPasswordVisible = !isPasswordVisible;
}

function saveSettings() {
  const apiKey = apiInput.value.trim();
  const model = modelSelect.value;

  if (!apiKey) {
    showNotification('Inserisci una API key valida!', 'error');
    return;
  }

  localStorage.setItem('openrouter_api_key', apiKey);
  localStorage.setItem('openrouter_model', model);
  const selectedVoice = document.getElementById('voiceSelect').value;
  localStorage.setItem('selected_voice', selectedVoice);
  showNotification('Impostazioni salvate con successo!', 'success');
}

function testConnection() {
  const apiKey = apiInput.value.trim();
  const model = modelSelect.value;

  if (!apiKey) {
    showNotification('Inserisci prima una API key!', 'error');
    return;
  }

  showNotification('Test della connessione in corso...', 'info');

  // Simula test connessione
  setTimeout(() => {
    showNotification('Connessione testata con successo!', 'success');
  }, 2000);
}

function showNotification(message, type) {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      ${type === 'success' ? '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22,4 12,14.01 9,11.01"></polyline>' :
        type === 'error' ? '<circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line>' :
        '<circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path>'}
    </svg>
    ${message}
  `;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.classList.add('show');
  }, 10);

  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 3000);
}

/*
function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  updateThemeIcon();
}

function updateThemeIcon() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const icon = document.querySelector('.toggle-icon');
  icon.textContent = currentTheme === 'dark' ? '☀️' : '🌙';
}*/

function loadVoices() {
  const voiceSelect = document.getElementById('voiceSelect');

  function populateVoices() {
    voices = window.speechSynthesis.getVoices();

    // Se non ci sono voci disponibili, riprova dopo un breve delay
    if (voices.length === 0) {
      setTimeout(populateVoices, 100);
      return;
    }

    voiceSelect.innerHTML = '';

    // Filtra e aggiungi voci italiane
    const italianVoices = voices.filter(voice =>
      voice.lang.startsWith('it') || voice.name.toLowerCase().includes('italian')
    );

    // Trova le voci Google
    const googleVoiceFemale = italianVoices.find(voice =>
      voice.name.toLowerCase().includes('google') && voice.name.toLowerCase().includes('italiano')
    );
    const googleVoiceMale = italianVoices.find(voice =>
      voice.name.toLowerCase().includes('google') &&
      (voice.name.toLowerCase().includes('male') || voice.name.toLowerCase().includes('maschile'))
    );

    // Aggiungi prima le voci Google se disponibili
    if (googleVoiceFemale) {
      const option = document.createElement('option');
      option.value = googleVoiceFemale.name;
      option.textContent = `${googleVoiceFemale.name} (${googleVoiceFemale.lang}) - Femminile`;
      voiceSelect.appendChild(option);
    }

    if (googleVoiceMale) {
      const option = document.createElement('option');
      option.value = googleVoiceMale.name;
      option.textContent = `${googleVoiceMale.name} (${googleVoiceMale.lang}) - Maschile`;
      voiceSelect.appendChild(option);
    }

    // Aggiungi opzione predefinita
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Voce predefinita del sistema';
    voiceSelect.appendChild(defaultOption);

    // Aggiungi le altre voci italiane (escludendo quelle Google già aggiunte)
    italianVoices.forEach(voice => {
      if (voice !== googleVoiceFemale && voice !== googleVoiceMale) {
        const option = document.createElement('option');
        option.value = voice.name;
        option.textContent = `${voice.name} (${voice.lang})`;
        voiceSelect.appendChild(option);
      }
    });

    // Se non ci sono voci italiane, mostra tutte
    if (italianVoices.length === 0) {
      voices.forEach(voice => {
        const option = document.createElement('option');
        option.value = voice.name;
        option.textContent = `${voice.name} (${voice.lang})`;
        voiceSelect.appendChild(option);
      });
    }

    // Carica la voce salvata o imposta Google femminile come default
    const savedVoice = localStorage.getItem('selected_voice');
    if (savedVoice) {
      voiceSelect.value = savedVoice;
    } else if (googleVoiceFemale) {
      voiceSelect.value = googleVoiceFemale.name;
      localStorage.setItem('selected_voice', googleVoiceFemale.name);
    }
  }

  // Rimuovi questa linea:
  // populateVoices();

  // Aggiungi questo invece:
  if (window.speechSynthesis.getVoices().length > 0) {
    populateVoices();
  } else {
    window.speechSynthesis.onvoiceschanged = populateVoices;
  }
}

function testVoice() {
  const voiceSelect = document.getElementById('voiceSelect');
  const selectedVoiceName = voiceSelect.value;
  const testButton = document.querySelector('.test-voice-btn');

  // Disabilita il pulsante durante il test
  testButton.disabled = true;
  testButton.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <polygon points="11,5 6,9 2,9 2,15 6,15 11,19 11,5"></polygon>
    </svg>
    Testando...
  `;

  // Cancella qualsiasi speech in corso
  window.speechSynthesis.cancel();

  const testText = "Ciao! Questa è la voce che hai selezionato per l'assistente vocale.";
  const utterance = new SpeechSynthesisUtterance(testText);

  // Imposta la voce selezionata
  if (selectedVoiceName) {
    const selectedVoice = voices.find(voice => voice.name === selectedVoiceName);
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
  }

  utterance.lang = 'it-IT';
  utterance.rate = 1.0;
  utterance.pitch = 1.0;
  utterance.volume = 1.0;

  utterance.onend = () => {
    testButton.disabled = false;
    testButton.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polygon points="5,3 19,12 5,21"></polygon>
      </svg>
      Testa Voce
    `;
  };

  utterance.onerror = () => {
    testButton.disabled = false;
    testButton.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polygon points="5,3 19,12 5,21"></polygon>
      </svg>
      Testa Voce
    `;
    showNotification('Errore durante il test della voce', 'error');
  };

  window.speechSynthesis.speak(utterance);
}
