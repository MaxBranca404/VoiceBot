// questionnaire.js - Sistema di questionario medico integrato

class MedicalQuestionnaire {
    constructor(voiceBot) {
        this.voiceBot = voiceBot;
        this.isActive = false;
        this.currentQuestionIndex = 0;
        this.responses = {};
        this.questions = [];
        this.hasIntroduced = false;

        // Carica le domande dal file prevention.js
        this.loadQuestions();
    }

    loadQuestions() {
        // Domande base sempre presenti
        this.questions = [...domandeBase];

        // Le domande specifiche verranno aggiunte dinamicamente
        // in base alle risposte dell'utente
    }

    startQuestionnaire() {
        if (this.isActive) {
            this.voiceBot.addToTranscript("Questionario già in corso...", 'bot');
            return;
        }

        this.isActive = true;
        this.currentQuestionIndex = 0;
        this.responses = {};
        this.hasIntroduced = false;

        // Resetta le domande
        this.questions = [...domandeBase];

        // Disabilita il riconoscimento vocale normale
        this.voiceBot.stopListening();

        // Inizia con l'introduzione
        this.askIntroduction();
    }

    askIntroduction() {
        this.voiceBot.addToTranscript("🏥 QUESTIONARIO MEDICO AVVIATO", 'bot');
        this.voiceBot.addToTranscript(introduzione, 'bot');
        this.voiceBot.speak(introduzione);

        setTimeout(() => {
            this.hasIntroduced = true;
            this.askNextQuestion();
        }, 30000);
    }

    askNextQuestion() {
        if (!this.isActive) return;

        // Controlla se abbiamo finito le domande base
        if (this.currentQuestionIndex >= this.questions.length) {
            this.addConditionalQuestions();

            // Se non ci sono più domande, termina
            if (this.currentQuestionIndex >= this.questions.length) {
                this.finishQuestionnaire();
                return;
            }
        }

        const question = this.questions[this.currentQuestionIndex];

        // Controlla se la domanda ha una condizione
        if (question.condizione) {
            const conditionKey = question.condizione;
            const conditionValue = this.responses[conditionKey];

            // Salta la domanda se la condizione non è soddisfatta
            if (!this.shouldAskConditionalQuestion(conditionKey, conditionValue)) {
                this.currentQuestionIndex++;
                this.askNextQuestion();
                return;
            }
        }

        const questionText = `Domanda ${this.currentQuestionIndex + 1}: ${question.testo}`; // di ${this.questions.length}: ${question.testo}`;

        this.voiceBot.addToTranscript(questionText, 'bot');
        this.voiceBot.speak(questionText);

        // Mostra opzioni se è una domanda a scelta multipla
        if (question.tipo === 'scelta' && question.opzioni) {
            const opzioni = `Opzioni: ${question.opzioni.join(', ')}`;
            this.voiceBot.addToTranscript(opzioni, 'bot');
        }
    }

    shouldAskConditionalQuestion(conditionKey, conditionValue) {
        switch (conditionKey) {
            case 'fumatore':
                return this.isPositiveResponse(conditionValue);
            case 'alcol':
                return this.isPositiveResponse(conditionValue);
            case 'attivita_fisica':
                return this.isPositiveResponse(conditionValue);
            case 'farmaci':
                return this.isPositiveResponse(conditionValue);
            case 'interventi':
                return this.isPositiveResponse(conditionValue);
            case 'familiarita_tumori':
                return this.isPositiveResponse(conditionValue);
            case 'diabete':
                return conditionValue === 'sì';
            default:
                return true;
        }
    }

    isPositiveResponse(response) {
        if (typeof response === 'string') {
            const normalized = response.toLowerCase().trim();
            return normalized === 'sì' || normalized === 'si' || normalized === 'yes' ||
                   normalized === 'vero' || normalized === 'true' || normalized === 'certo';
        }
        return false;
    }

    addConditionalQuestions() {
        const eta = parseInt(this.responses.eta);
        const sesso = this.responses.sesso;

        // Aggiungi domande per over 65
        if (eta > 65) {
            const over65NotAdded = domandeOver65.filter(q =>
                !this.questions.some(existing => existing.key === q.key)
            );
            this.questions.push(...over65NotAdded);
        }

        // Aggiungi domande femminili
        if (sesso && sesso.toLowerCase().includes('femm')) {
            const femminiliNotAdded = domandeFemminili.filter(q =>
                !this.questions.some(existing => existing.key === q.key)
            );
            this.questions.push(...femminiliNotAdded);
        }
    }

    processResponse(userResponse) {
        if (!this.isActive) return false;

        const question = this.questions[this.currentQuestionIndex];
        if (!question) return false;

        // Salva la risposta
        this.responses[question.key] = userResponse;

        // Aggiungi la risposta alla trascrizione
        // this.voiceBot.addToTranscript(`Risposta: ${userResponse}`, 'user');

        // Passa alla domanda successiva
        this.currentQuestionIndex++;

        // Breve pausa prima della prossima domanda
        setTimeout(() => {
            this.askNextQuestion();
        }, 1000);

        return true;
    }

    async finishQuestionnaire() {
        this.isActive = false;

        const completionMessage = "Questionario completato! Sto elaborando i tuoi dati per fornirti un'analisi personalizzata...";
        this.voiceBot.addToTranscript(completionMessage, 'bot');
        this.voiceBot.speak(completionMessage);

        // Attendi che finisca di parlare prima di chiamare l'IA
        setTimeout(() => {
            this.sendToAI();
        }, 3000);
    }

    async sendToAI() {
        const prompt = this.buildPrompt();

        try {
            await this.voiceBot.sendToAI(prompt, true);
        } catch (error) {
            const errorMessage = "Mi dispiace, si è verificato un errore nell'elaborazione dei tuoi dati. Potresti riprovare più tardi.";
            this.voiceBot.addToTranscript(errorMessage, 'bot');
            this.voiceBot.speak(errorMessage);
        }

        // Riabilita il funzionamento normale
        this.resetQuestionnaire();
    }

    buildPrompt() {
        const responsesSummary = Object.entries(this.responses)
            .map(([key, value]) => `${key}: ${value}`)
            .join('\n');

        return `Ho completato un questionario medico completo. Ecco i miei dati:

${responsesSummary}

Per favore, fornisci un'analisi personalizzata del mio stato di salute basata su questi dati. Includi:
1. Valutazione generale del mio profilo di rischio
2. Eventuali aree di attenzione o preoccupazione
3. Consigli specifici per migliorare la mia salute
4. Screening o controlli medici che potrei dover considerare
5. Suggerimenti per lo stile di vita

Ricorda che questa non è una diagnosi medica ma solo un'analisi informativa. Rispondi in modo chiaro e comprensibile.`;
    }

    resetQuestionnaire() {
        this.isActive = false;
        this.currentQuestionIndex = 0;
        this.responses = {};
        this.hasIntroduced = false;
        this.questions = [...domandeBase];
    }

    stopQuestionnaire() {
        if (this.isActive) {
            this.isActive = false;
            const stopMessage = "Questionario interrotto. Puoi riavviarlo quando vuoi.";
            this.voiceBot.addToTranscript(stopMessage, 'bot');
            this.voiceBot.speak(stopMessage);
            this.resetQuestionnaire();
        }
    }
}

// Estendi la classe VoiceChatBot per integrare il questionario
(function() {
    const originalInit = VoiceChatBot.prototype.initElements;
    const originalBindEvents = VoiceChatBot.prototype.bindEvents;
    const originalSendToAI = VoiceChatBot.prototype.sendToAI;

    VoiceChatBot.prototype.initElements = function() {
        originalInit.call(this);

        // Inizializza il questionario
        this.questionnaire = new MedicalQuestionnaire(this);

        // Aggiungi il pulsante per avviare il questionario
        this.addQuestionnaireButton();
    };

    VoiceChatBot.prototype.addQuestionnaireButton = function() {
        const sidebarMenu = document.querySelector('.sidebar-menu');
        if (sidebarMenu) {
            const questionnaireBtn = document.createElement('button');
            questionnaireBtn.className = 'menu-btn questionnaire-btn';
            questionnaireBtn.id = 'questionnaireBtn';
            questionnaireBtn.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
            `;
            questionnaireBtn.onclick = () => this.startQuestionnaire();
            sidebarMenu.appendChild(questionnaireBtn);
        }
    };

    VoiceChatBot.prototype.startQuestionnaire = function() {
        this.questionnaire.startQuestionnaire();
    };

    VoiceChatBot.prototype.stopQuestionnaire = function() {
        this.questionnaire.stopQuestionnaire();
    };

    // Intercetta i messaggi per il questionario
    VoiceChatBot.prototype.sendToAI = function(message, shouldSpeak = true) {
        // Se il questionario è attivo, elabora la risposta
        if (this.questionnaire && this.questionnaire.isActive) {
            const processed = this.questionnaire.processResponse(message);
            if (processed) {
                return; // Non inviare all'IA normale
            }
        }

        // Comportamento normale
        return originalSendToAI.call(this, message, shouldSpeak);
    };

    // Aggiungi comandi vocali per il questionario
    VoiceChatBot.prototype.bindEvents = function() {
        originalBindEvents.call(this);

        // Aggiungi listener per comandi speciali
        const originalAddToTranscript = this.addToTranscript;
        this.addToTranscript = function(text, sender) {
            // Controlla comandi speciali
            if (sender === 'user') {
                const normalizedText = text.toLowerCase().trim();

                if (normalizedText.includes('avvia questionario') ||
                    normalizedText.includes('questionario medico') ||
                    normalizedText.includes('test salute')) {
                    this.startQuestionnaire();
                    return;
                }

                if (normalizedText.includes('ferma questionario') ||
                    normalizedText.includes('stop questionario')) {
                    this.stopQuestionnaire();
                    return;
                }
            }

            originalAddToTranscript.call(this, text, sender);
        };
    };
})();

// Aggiungi stili CSS per il pulsante del questionario
(function() {
    const style = document.createElement('style');
    style.textContent = `
        .questionnaire-btn {
            background: rgba(34, 197, 94, 0.1) !important;
            border-color: rgba(34, 197, 94, 0.2) !important;
            color: #22c55e !important;
        }

        .questionnaire-btn:hover {
            background: rgba(34, 197, 94, 0.2) !important;
            border-color: rgba(34, 197, 94, 0.4) !important;
        }

        .questionnaire-btn svg {
            stroke: #22c55e !important;
        }
    `;
    document.head.appendChild(style);
})();

// Comandi vocali globali per il questionario
window.startMedicalQuestionnaire = function() {
    if (window.voiceBot) {
        window.voiceBot.startQuestionnaire();
    }
};

window.stopMedicalQuestionnaire = function() {
    if (window.voiceBot) {
        window.voiceBot.stopQuestionnaire();
    }
};
