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
  }
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
