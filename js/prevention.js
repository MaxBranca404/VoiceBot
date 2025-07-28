const introduzione = "Benvenuto! Questo è un test di prevenzione sanitaria completo, progettato per aiutarti a valutare il tuo stato di salute e identificare possibili fattori di rischio. Compilare il test richiederà circa 20 minuti, ma potrebbe davvero fare la differenza nella tua vita. Le tue risposte saranno utilizzate per fornirti consigli personalizzati secondo le linee guida sanitarie ufficiali. Iniziamo!";

const domandeBase = [
  { key: "eta", testo: "Quanti anni hai?" },
  { key: "sesso", testo: "Qual è il tuo sesso biologico?" },
  { key: "origine_etnica", testo: "Qual è la tua origine etnica?" },
  { key: "altezza", testo: "Qual è la tua altezza in centimetri?" },
  { key: "peso", testo: "Qual è il tuo peso in kilogrammi?" },
  { key: "vita", testo: "La misura del tuo giro vita è maggiore a 88 centimetri (se sei donna) o maggiore a 102 centimetri (se sei uomo)?" },
  { key: "circonferenza_vita", testo: "A quanto corrisponde la tua circonferenza vita in centimetri?", tipo: "numero" },
  { key: "glicemia", testo: "La tua glicemia è inferiore a 100 mg/dL?" },
  { key: "glicemia_valore", testo: "Sai a quanto corrisponde il valore della tua glicemia a digiuno?" },
  { key: "hba1c", testo: "Conosci il valore della tua emoglobina glicata (HbA1c)? (in %)" },
  { key: "colesterolo_totale", testo: "Qual è il valore del tuo colesterolo totale (mg/dL)?" },
  { key: "colesterolo_ldl", testo: "Il tuo colesterolo LDL supera il valore di 70 mg/dL?" },

  { key: "colesterolo_hdl_valore", testo: "Qual è il valore del tuo colesterolo HDL (se lo conosci)?" },
  { key: "pressione", testo: "La tua pressione arteriosa media è inferiore a 130/85 mmHg?" },
  { key: "pressione_sistolica", testo: "Qual è la tua pressione sistolica (massima) in mmHg?" },
  { key: "pressione_diastolica", testo: "Qual è la tua pressione diastolica (minima) in mmHg?" },
  { key: "ast", testo: "Conosci il valore delle tue transaminasi AST (GOT)? (U/L)" },
  { key: "alt", testo: "Conosci il valore delle tue transaminasi ALT (GPT)? (U/L)" },
  {
    key: "ggt",
    testo: "Qual è il tuo valore di Gamma‑GT (U/L), se  noto?",
    tipo: "numero"
  },
  {
    key: "regione_rischio_cv",
    testo: "Sai in quale categoria di rischio cardiovascolare ti trovi?",
    tipo: "scelta",
    opzioni: ["basso", "moderato", "alto", "molto alto"]
  },

  { key: "piastrine", testo: "Conosci il valore delle tue piastrine? (x10^9/L o x1000/mm³)" },
  { key: "albumina", testo: "Conosci il valore della tua albumina sierica? (g/dL)" },
  {
    key: "egfr",
    testo: "Qual'è il tuo valore di eGFR (ml/min/1.73 m²), se noto?",
    tipo: "numero"
  },
  {
    key: "diabete",
    testo: "Ti è stato diagnosticato il diabete di tipo 2?",
    tipo: "scelta",
    opzioni: ["sì", "no"]
  },
  {
    key: "eta_diagnosi_diabete",
    testo: "A che età ti è stato diagnosticato il diabete?",
    tipo: "numero",
    condizione: "diabete"
  },
  { key: "linfociti", testo: "Conosci il numero dei tuoi linfociti? (per mm³)" },
  { key: "malattie_croniche", testo: "Hai malattie croniche diagnosticate (es. ipertensione)?" },
  { key: "farmaci", testo: "Assumi farmaci?" },
  { key: "farmaci_dettaglio", testo: "Se assumi farmaci, elencali nella casella di testo sottostante.", condizione: "farmaci" },
  { key: "interventi", testo: "Hai subito interventi chirurgici rilevanti?" },
  { key: "interventi_dettaglio", testo: "Se hai subito interventi chirurgici rilevanti, elencali nella casella di testo sottostante." , condizione: "interventi" },
  { key: "familiarita_tumori", testo: "Ci sono stati casi di tumore in famiglia?" },
  { key: "sede_tumore", testo: "Da quale tipo di tumore è stato affetto il tuo familiare?" , condizione: "familiarita_tumori" },
  { key: "fumatore", testo: "Fumi?" },
  { key: "n_sigarette", testo: "Quante sigarette fumi al giorno?" , condizione: "fumatore" },
  { key: "alcol", testo: "Consumi bevande alcoliche?" },
  { key: "unita_alcoliche", testo: "Quante unità alcoliche bevi al giorno? (1 unità = 1 bicchiere di vino / birra / shot)" , condizione: "alcol" },
  { key: "attivita_fisica", testo: "Svolgi attività fisica settimanale?" },
  { key: "frequenza_attivita_fisica", testo: "Con quale frequenza svogli questa attività" , condizione: "attivita_fisica" },
  { key: "tipo_attivita", testo: "Che tipo di attività fisica svolgi? (aerobica, rafforzamento muscolare, rafforzamento osseo e stretching)" , condizione: "attivita_fisica" },
  { key: "durata_attivita", testo: "Quanto dura ogni allenamento? (in minuti)" , condizione: "attivita_fisica" },
  { key: "predimed_1", testo: "Usi l'olio extravergine di oliva come condimento principale (es. per cucinare, condire insalate)?" },
  { key: "trigliceridi", testo: "Qual è il valore dei tuoi trigliceridi (mg/dL)?" },
  { key: "predimed_2", testo: "Ne usi più di 4 cucchiai al giorno?" },
  { key: "predimed_3", testo: "Mangi almeno 2 porzioni di verdura al giorno? (1 porzione = 200g circa)" },
  { key: "predimed_4", testo: "Mangi almeno 3 porzioni di frutta al giorno? (1 porzione = 1 frutto medio o 100g circa)" },
  { key: "predimed_5", testo: "Mangi meno di 1 porzione al giorno di carne rossa o salumi?" },
  { key: "predimed_6", testo: "Bevi meno di 1 bevanda zuccherata al giorno?" },
  { key: "predimed_7", testo: "Bevi vino in quantità moderate? (1-7 bicchieri/settimana per le donne, 1-14 per gli uomini)" },
  { key: "predimed_8", testo: "Mangi almeno 3 porzioni di legumi alla settimana?" },
  { key: "predimed_9", testo: "Mangi almeno 3 porzioni di pesce o frutti di mare alla settimana?" },
  { key: "predimed_10", testo: "Consumi dolci industriali meno di 3 volte a settimana?" },
  { key: "predimed_11", testo: "Preferisci carni bianche rispetto a carni rosse?" },
  { key: "predimed_12", testo: "Mangi frutta secca almeno 3 volte a settimana?" },
  { key: "predimed_13", testo: "Usi soffritti con pomodoro, cipolla, aglio e olio d'oliva almeno 2 volte a settimana?" },
  { key: "predimed_14", testo: "Pensi che la tua alimentazione sia vicina alla dieta mediterranea?" },
  { key: "stanchezza", testo: "In genere ti senti stanco/a?" },
  { key: "depressione", testo: "Hai mai avuto episodi di depressione?" },
  { key: "insonnia", testo: "Hai difficoltà a dormire?" },
  { key: "tipo_insonnia", testo: "Se hai difficoltà a dormire, descrivi la difficoltà (es. fatica ad addormentarti, risvegli notturni...)" },
  { key: "stress", testo: "Livello percepito di stress (da 1 = niente stress a 10 = stress molto elevato)" },
  { key: "preferenze", testo: "C'è qualcosa di specifico sulla tua salute che ti interessa approfondire? (es: alimentazione, cuore, sonno, stress, screening oncologici, attività fisica, benessere mentale)" }

];

const domandeOver65 = [
  { key: "stanchezza", testo: "Ti senti stanco/a frequentemente?" },
  { key: "camminata", testo: "Riesci a camminare un isolato (circa 100 metri)?" },
  { key: "malattie_croniche", testo: "Hai più di 5 malattie croniche?" },
  { key: "perdita_peso", testo: "Hai perso più di 5 kg nell’ultimo anno senza volerlo?" },
  { key: "sedia", testo: "Hai problemi ad alzarti da una sedia?" },

];

const domandeFemminili = [
  { key: "eta_menarca", testo: "A che età hai avuto il primo ciclo mestruale?" },
  { key: "contraccettivi", testo: "Hai mai usato contraccettivi ormonali?" },
  { key: "gravidanza", testo: "Hai avuto una o più gravidanze?" },
  { key: "eta_menopausa", testo: "A che età sei andata in menopausa? (facoltativo)" },
  { key: "diabete_gestazionale", testo: "Hai mai sofferto di diabete gestazionale?" },
  { key: "familiarita_seno", testo: "Tua madre o tua nonna hanno avuto un tumore al seno?" },
  { key: "screening_seno", testo: "Hai mai svolto una mammografia o un'ecografia mammaria? (se hai più di 25 anni)" },
  { key: "papsmear", testo: "Svolgi regolarmente il Pap test? (se hai più di 25 anni)" }
];
