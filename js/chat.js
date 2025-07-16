class VoiceChatBot {
    constructor() {
        this.recognition = null;
        this.synthesis = window.speechSynthesis;
        this.voices = [];
        this.isListening = false;
        this.isSpeaking = false;
        this.apiKey = '';
        this.currentModel = 'meta-llama/llama-3.3-70b-instruct:free';
        this.transcriptData = [];

        this.currentChatId = null;
        this.chatHistory = new Map();


        this.loadSettings();
        this.initElements();
        this.loadChats();
        this.initSpeechRecognition();
        this.initVoices();
        this.bindEvents();
    }

    loadSettings() {
        this.apiKey = localStorage.getItem('openrouter_api_key') || '';
        this.currentModel = localStorage.getItem('openrouter_model') || 'meta-llama/llama-3.3-70b-instruct:free';
        this.selectedVoice = localStorage.getItem('selected_voice') || '';
        this.currentChatId = localStorage.getItem('current_chat_id') || this.createNewChatId();
    }

    sendTextMessage() {
        const message = this.textInput.value.trim();
        if (!message) return;

        this.addToTranscript(message, 'user');
        this.textInput.value = '';
        this.sendToAI(message, false); // false = non parlare
    }

    scrollToBottom() {
        if (this.transcriptContent) {
            setTimeout(() => {
                this.transcriptContent.scrollTop = this.transcriptContent.scrollHeight;
            }, 100);
        }
    }

    loadChats() {
        const savedChats = localStorage.getItem('voice_bot_chats');
        if (savedChats) {
            const chatsData = JSON.parse(savedChats);
            this.chatHistory = new Map(chatsData.map(chat => [chat.id, chat]));
        }

        if (this.chatHistory.size === 0) {
            this.createNewChatId();
        } else {
            // Carica la trascrizione della chat corrente
            const currentChat = this.chatHistory.get(this.currentChatId);
            if (currentChat) {
                this.transcriptData = currentChat.transcript || [];
            }
        }

        this.updateChatList();
        this.updateTranscriptDisplay(); // AGGIUNGI questa linea
    }

    saveChats() {
        const chatsArray = Array.from(this.chatHistory.values());
        localStorage.setItem('voice_bot_chats', JSON.stringify(chatsArray));
        localStorage.setItem('current_chat_id', this.currentChatId);
    }

    createNewChatId() {
        const chatId = 'chat_' + Date.now();
        const newChat = {
            id: chatId,
            name: '',
            messages: [],
            transcript: [],
            createdAt: new Date().toISOString(),
            lastActivity: new Date().toISOString()
        };

        this.chatHistory.set(chatId, newChat);
        this.currentChatId = chatId;
        this.transcriptData = [];
        this.updateTranscriptDisplay();
        this.saveChats();
        this.updateChatList();
        return chatId;
    }

    switchToChat(chatId) {
        if (this.chatHistory.has(chatId)) {
            // Salva la chat corrente prima di cambiare
            this.saveCurrentChatState();

            // Cambia alla nuova chat
            this.currentChatId = chatId;
            const chat = this.chatHistory.get(chatId);
            this.transcriptData = chat.transcript || [];

            this.updateTranscriptDisplay();
            this.updateChatList();
            this.saveChats();

            // Aggiorna l'ultimo accesso
            chat.lastActivity = new Date().toISOString();
            this.chatHistory.set(chatId, chat);

            this.scrollToBottom();
        }
    }

    saveCurrentChatState() {
        if (this.currentChatId && this.chatHistory.has(this.currentChatId)) {
            const chat = this.chatHistory.get(this.currentChatId);
            chat.transcript = [...this.transcriptData];
            chat.lastActivity = new Date().toISOString();
            this.chatHistory.set(this.currentChatId, chat);
        }
    }

    updateChatList() {
        const chatList = document.getElementById('chatList');
        chatList.innerHTML = '';

        const sortedChats = Array.from(this.chatHistory.values())
            .sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity));

        sortedChats.forEach(chat => {
            const chatItem = document.createElement('div');
            chatItem.className = `chat-item ${chat.id === this.currentChatId ? 'active' : ''}`;

            const firstMessage = chat.transcript.find(msg => msg.sender === 'user');
            const preview = firstMessage ? firstMessage.text.substring(0, 30) + '...' : 'Chat vuota';

            const chatName = chat.name || preview;
            chatItem.innerHTML = `
                <div class="chat-preview">${chatName}</div>
                <input type="text" class="chat-name-input" value="${chatName}" onblur="saveRename('${chat.id}')" onkeypress="handleRenameKeypress(event, '${chat.id}')">
                <div class="chat-date">${new Date(chat.lastActivity).toLocaleDateString('it-IT')}</div>
                <div style="display: flex; gap: 4px;">
                    <button class="rename-chat-btn" onclick="startRename('${chat.id}', event)">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                    </button>
                    <button class="delete-chat-btn" onclick="deleteChat('${chat.id}', event)">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3,6 5,6 21,6"></polyline>
                            <path d="M19,6v14a2,2 0 0,1-2,2H7a2,2 0 0,1-2-2V6m3,0V4a2,2 0 0,1 2-2h4a2,2 0 0,1 2,2v2"></path>
                        </svg>
                    </button>
                </div>
            `;

            chatItem.onclick = (e) => {
                // Ignora i click se stiamo modificando il nome
                if (chatItem.classList.contains('editing') ||
                    e.target.closest('.delete-chat-btn') ||
                    e.target.closest('.rename-chat-btn') ||
                    e.target.closest('.chat-name-input')) {
                    return;
                }
                this.switchToChat(chat.id);
                toggleChatSelector();
            };

            chatList.appendChild(chatItem);
        });
    }

    initElements() {
        this.startBtn = document.getElementById('startBtn');
        this.status = document.getElementById('status');
        this.voiceCircle = document.getElementById('voiceCircle');
        this.voiceBars = document.getElementById('voiceBars');
        this.transcriptContainer = document.getElementById('transcriptContainer');
        this.transcriptContent = document.getElementById('transcriptContent');
        this.textInput = document.getElementById('textInput');
        this.sendTextBtn = document.getElementById('sendTextBtn');
    }

    initSpeechRecognition() {
        if ('webkitSpeechRecognition' in window) {
            this.recognition = new webkitSpeechRecognition();
        } else if ('SpeechRecognition' in window) {
            this.recognition = new SpeechRecognition();
        } else {
            this.updateStatus('Riconoscimento vocale non supportato', 'error');
            return;
        }

        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        this.recognition.lang = 'it-IT';

        this.recognition.onstart = () => {
            this.isListening = true;
            this.updateStatus('Sto ascoltando...', 'listening');
            this.startVoiceAnimation();
        };

        this.recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            this.addMessage(transcript, 'user');
            this.addToTranscript(transcript, 'user');
            this.sendToAI(transcript, true); // true = parla
        };

        this.recognition.onerror = (event) => {
            this.updateStatus(`Errore: ${event.error}`, 'error');
            this.stopVoiceAnimation();
            this.startBtn.classList.remove('active');
            // Ritorna allo stato di default dopo 3 secondi
            setTimeout(() => {
                this.updateStatus('Pronto per iniziare');
            }, 3000);
        };


        this.recognition.onend = () => {
            this.isListening = false;
            this.stopVoiceAnimation();
            this.startBtn.classList.remove('active');
            this.updateStatus('Pronto per iniziare');
        };
    }

    initVoices() {
        const loadVoices = () => {
            this.voices = this.synthesis.getVoices();
        };

        loadVoices();
        this.synthesis.onvoiceschanged = loadVoices;
    }

    bindEvents() {
        this.startBtn.addEventListener('click', () => this.startListening());
        this.sendTextBtn.addEventListener('click', () => this.sendTextMessage());
        this.textInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendTextMessage();
            }
        });
    }

    startListening() {
        const isFreeModel = this.currentModel.includes(':free');
        if (!isFreeModel && !this.apiKey) {
            this.updateStatus('Configura le impostazioni API prima di iniziare', 'error');
            return;
        }

        if (this.recognition && !this.isListening) {
            this.recognition.start();
            this.startBtn.classList.add('active');
        }
    }

    stopListening() {
        if (this.recognition && this.isListening) {
            this.recognition.stop();
            this.startBtn.classList.remove('active');
        }

        if (this.isSpeaking) {
            this.synthesis.cancel();
            this.isSpeaking = false;
            this.updateStatus('Pronto per iniziare');
            this.stopVoiceAnimation();
        }
    }

    async sendToAI(message, shouldSpeak = true) {
        this.updateStatus('Pensando...', 'thinking');

        try {
            const headers = {
                'Content-Type': 'application/json',
                'HTTP-Referer': window.location.href,
                'X-Title': 'VoiceBot AI'
            };

            if (this.apiKey) {
                headers['Authorization'] = `Bearer ${this.apiKey}`;
            }

            // NUOVA SEZIONE - COSTRUZIONE MESSAGGI CON CRONOLOGIA
            const currentChat = this.chatHistory.get(this.currentChatId);
            const messages = [
                {
                    role: 'system',
                    content: 'Sei un assistente vocale amichevole e utile. Rispondi sempre in italiano in modo conciso e conversazionale. IMPORTANTE: Non utilizzare mai emoji, emoticon, asterischi, virgolette o altre formattazioni speciali. Usa solo testo semplice e chiaro, facilmente leggibile dalla sintesi vocale. Non usare simboli come *, ", ", \', -, =, +, #, @, !, ?, () [] {} <> o simili per enfatizzare o formattare il testo. Scrivi in modo naturale come se stessi parlando.'
                }
            ];

            // Aggiungi la cronologia della chat corrente
            if (currentChat && currentChat.messages) {
                messages.push(...currentChat.messages);
            }

            // Aggiungi il messaggio corrente
            messages.push({
                role: 'user',
                content: message
            });

            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({
                    model: this.currentModel,
                    messages: messages,  // USA LA NUOVA VARIABILE messages
                    max_tokens: 150,
                    temperature: 0.7
                })
            });

            if (!response.ok) {
                throw new Error(`Errore API: ${response.status}`);
            }

            const data = await response.json();
            const aiResponse = data.choices[0].message.content;

            this.addMessage(aiResponse, 'bot');
            this.addToTranscript(aiResponse, 'bot');

            if (shouldSpeak) {
                this.speak(aiResponse);
            } else {
                this.updateStatus('Pronto per iniziare');
            }

            // Salva i messaggi nella cronologia
            if (!currentChat.messages) {
                currentChat.messages = [];
            }
            currentChat.messages.push({
                role: 'user',
                content: message
            });
            currentChat.messages.push({
                role: 'assistant',
                content: aiResponse
            });

            // Limita la cronologia a 20 messaggi (10 scambi)
            if (currentChat.messages.length > 20) {
                currentChat.messages = currentChat.messages.slice(-20);
            }

            this.chatHistory.set(this.currentChatId, currentChat);
            this.saveChats();

          } catch (error) {
              const errorMessage = 'Mi dispiace, c\'è stato un errore. Riprova.';
              this.addMessage(errorMessage, 'bot');
              this.addToTranscript(errorMessage, 'bot');
              this.updateStatus(`Errore: ${error.message}`, 'error');
              this.startBtn.classList.remove('active');
              // Ritorna allo stato di default dopo 3 secondi
              setTimeout(() => {
                  this.updateStatus('Pronto per iniziare');
              }, 3000);
          }
    }

    cleanTextForSpeech(text) {
        return text
            // Rimuovi emoji e emoticon
            .replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '')
            // Rimuovi asterischi e underscore per formattazione
            .replace(/\*+/g, '')
            .replace(/_+/g, '')
            // Rimuovi virgolette multiple
            .replace(/["""`]+/g, '')
            // Rimuovi simboli di formattazione
            .replace(/[#@$%^&+=\[\]{}\\|<>]/g, '')
            // Rimuovi trattini multipli
            .replace(/[-–—]{2,}/g, ' ')
            // Rimuovi punti multipli
            .replace(/\.{3,}/g, '.')
            // Rimuovi punti esclamativi e interrogativi multipli
            .replace(/[!?]{2,}/g, '.')
            // Rimuovi spazi multipli
            .replace(/\s+/g, ' ')
            // Sostituisci accenti comuni
            .replace(/e'/g, 'è')
            .replace(/a'/g, 'à')
            .replace(/i'/g, 'ì')
            .replace(/o'/g, 'ò')
            .replace(/u'/g, 'ù')
            // Rimuovi spazi all'inizio e alla fine
            .trim();
    }

    speak(text) {
        // Pulisci il testo prima della sintesi vocale
        const cleanText = this.cleanTextForSpeech(text);

        if (this.synthesis.speaking) {
            this.synthesis.cancel();
        }

        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = 'it-IT';
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;

        // Usa la voce selezionata dalle impostazioni
        if (this.selectedVoice) {
          const selectedVoice = this.voices.find(voice => voice.name === this.selectedVoice);
          if (selectedVoice) {
            utterance.voice = selectedVoice;
          }
        } else {
          // Fallback alle voci italiane se non è stata selezionata una voce specifica
          const italianVoices = this.voices.filter(voice =>
            voice.lang.startsWith('it') || voice.name.includes('Italia')
          );

          if (italianVoices.length > 0) {
            utterance.voice = italianVoices[0];
          }
        }

        utterance.onstart = () => {
            this.isSpeaking = true;
            this.updateStatus('Sto parlando...', 'speaking');
            this.startVoiceAnimation();
        };

        utterance.onend = () => {
            this.isSpeaking = false;
            this.updateStatus('Pronto per iniziare');
            this.stopVoiceAnimation();
            this.startBtn.classList.remove('active');
        };

        this.synthesis.speak(utterance);
    }

    addMessage(text, sender) {
        // Pulisci il testo anche per la visualizzazione se è una risposta del bot
        const displayText = sender === 'bot' ? this.cleanTextForSpeech(text) : text;

        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${sender}`;
        messageDiv.textContent = displayText;
    }

    addToTranscript(text, sender) {
        // Pulisci il testo anche per la trascrizione se è una risposta del bot
        const transcriptText = sender === 'bot' ? this.cleanTextForSpeech(text) : text;

        const timestamp = new Date().toLocaleTimeString('it-IT');
        this.transcriptData.push({
            text: transcriptText,
            sender: sender,
            timestamp: timestamp
        });
        this.updateTranscriptDisplay();
        this.saveCurrentChatState();
    }

    updateTranscriptDisplay() {
        if (!this.transcriptContent) {
            return; // Esci se l'elemento non è ancora inizializzato
        }

        if (this.transcriptData.length === 0) {
            this.transcriptContent.textContent = 'Nessuna trascrizione disponibile';
            return;
        }

        this.transcriptContent.innerHTML = '';
        this.transcriptData.forEach(entry => {
            const entryDiv = document.createElement('div');
            entryDiv.className = `transcript-entry ${entry.sender}`;
            entryDiv.innerHTML = `
                <div class="transcript-timestamp">${entry.timestamp}</div>
                <div>${entry.text}</div>
            `;
            this.transcriptContent.appendChild(entryDiv);
        });
        this.scrollToBottom();
    }

    updateStatus(message, type = '') {
        this.status.textContent = message;
        this.status.className = `status ${type}`;
    }

    startVoiceAnimation() {
        this.voiceCircle.classList.add('active');
        const bars = this.voiceBars.querySelectorAll('.voice-bar');
        bars.forEach((bar, index) => {
            setTimeout(() => {
                bar.classList.add('active');
            }, index * 100);
        });
    }

    stopVoiceAnimation() {
        this.voiceCircle.classList.remove('active');
        const bars = this.voiceBars.querySelectorAll('.voice-bar');
        bars.forEach(bar => {
            bar.classList.remove('active');
        });
    }
}

function toggleChatSelector() {
    const selector = document.getElementById('chatSelector');
    const btn = document.getElementById('chatBtn');

    selector.classList.toggle('show');

    if (selector.classList.contains('show')) {
        btn.style.background = 'rgba(0, 212, 255, 0.3)';
        btn.style.borderColor = 'rgba(0, 212, 255, 0.6)';
    } else {
        btn.style.background = 'rgba(255, 255, 255, 0.1)';
        btn.style.borderColor = 'rgba(255, 255, 255, 0.2)';
    }
}

function createNewChat() {
    if (window.voiceBot) {
        window.voiceBot.createNewChatId();
        toggleChatSelector();
    }
}

function deleteChat(chatId, event) {
    event.stopPropagation();

    if (window.voiceBot && window.voiceBot.chatHistory.size > 1) {
        window.voiceBot.chatHistory.delete(chatId);

        if (window.voiceBot.currentChatId === chatId) {
            const remainingChats = Array.from(window.voiceBot.chatHistory.keys());
            window.voiceBot.switchToChat(remainingChats[0]);
        }

        window.voiceBot.saveChats();
        window.voiceBot.updateChatList();
    }
}

function startRename(chatId, event) {
    event.stopPropagation();
    const chatItem = event.target.closest('.chat-item');
    chatItem.classList.add('editing');
    const input = chatItem.querySelector('.chat-name-input');

    // Previeni la propagazione dell'evento click sull'input
    input.onclick = (e) => e.stopPropagation();

    input.focus();
    input.select();
}

function saveRename(chatId) {
    const input = event.target; // Usa direttamente l'evento
    const chatItem = input.closest('.chat-item');
    const newName = input.value.trim();

    if (newName && window.voiceBot) {
        const chat = window.voiceBot.chatHistory.get(chatId);
        if (chat) {
            chat.name = newName;
            window.voiceBot.chatHistory.set(chatId, chat);
            window.voiceBot.saveChats();
            window.voiceBot.updateChatList();
        }
    }

    chatItem.classList.remove('editing');
}

function handleRenameKeypress(event, chatId) {
    if (event.key === 'Enter') {
        event.target.blur();
    } else if (event.key === 'Escape') {
        const chatItem = event.target.closest('.chat-item');
        chatItem.classList.remove('editing');
        window.voiceBot.updateChatList();
    }
}

// Funzioni globali per i bottoni
function toggleTranscript() {
    const container = document.getElementById('transcriptContainer');
    const btn = document.getElementById('transcriptBtn');

    container.classList.toggle('show');

    if (container.classList.contains('show')) {
        btn.style.background = 'rgba(0, 212, 255, 0.3)';
        btn.style.borderColor = 'rgba(0, 212, 255, 0.6)';
    } else {
        btn.style.background = 'rgba(255, 255, 255, 0.1)';
        btn.style.borderColor = 'rgba(255, 255, 255, 0.2)';
    }
}

function clearTranscript() {
    if (window.voiceBot) {
        window.voiceBot.transcriptData = [];
        window.voiceBot.updateTranscriptDisplay();
    }
}

// Inizializza l'app quando la pagina è caricata
document.addEventListener('DOMContentLoaded', () => {
    window.voiceBot = new VoiceChatBot();
});
