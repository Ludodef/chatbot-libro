# 📚 Il Custode della Biblioteca Infinita
di Ludovica De Fazio 
defazioludovica95@gmail.com

> "Benvenuto, viandante tra i volumi. Qui, tra il profumo della carta antica e il silenzio delle sale infinite, troveremo insieme la tua prossima storia."

**Il Custode della Biblioteca Infinita** è un chatbot bibliotecario magico progettato per risolvere il blocco del lettore attraverso un percorso di scoperta emotiva e sensoriale. Dimentica i generi letterari noiosi: qui parliamo di atmosfere, scintille e desideri.

---

## ✨ Caratteristiche

- **Persona Immersiva:** Un bibliotecario colto, accogliente e un po' magico che ti guida con garbo.
- **Ricerca Emozionale:** Il chatbot indaga sulle tue "Sfumature Emotive" (nostalgia, euforia, tensione) anziché limitarsi a categorie standard.
- **Filtro "Mai Più":** Esclude attivamente tropi o libri che non sopporti per garantirti una lettura perfetta.
- **Consigli d'Atmosfera:** Ogni libro è presentato con un *Pitch* evocativo e una *Scintilla* (citazione iconica).
- **Design Raffinato:** Interfaccia utente in stile "Warm Organic" con tipografia serif elegante e animazioni fluide.

## 🛠️ Tecnologie Utilizzate

- **Frontend:** React 19 + TypeScript
- **Styling:** Tailwind CSS 4
- **Animazioni:** Motion (framer-motion)
- **AI:** Google Gemini API (@google/genai)
- **Icone:** Lucide React
- **Markdown:** React Markdown

## 🚀 Installazione Locale

Segui questi passaggi per portare il Custode sul tuo computer:

1. **Clona il repository:**
   ```bash
   git clone https://github.com/tuo-username/il-custode-biblioteca.git
   cd il-custode-biblioteca
   ```

2. **Installa le dipendenze:**
   ```bash
   npm install
   ```

3. **Configura le variabili d'ambiente:**
   Crea un file `.env` nella root del progetto e aggiungi la tua chiave API di Gemini:
   ```env
   VITE_GEMINI_API_KEY=la_tua_chiave_api_qui
   ```
   *Puoi ottenere una chiave gratuita su [Google AI Studio](https://aistudio.google.com/app/apikey).*

4. **Avvia l'applicazione:**
   ```bash
   npm run dev
   ```
   L'applicazione sarà disponibile su `http://localhost:3000`.

## 📖 Flusso della Conversazione

Il Custode ti guiderà attraverso un rito di tre domande:
1. **L'Origine:** Il tuo ultimo libro letto o il tuo genere preferito.
2. **L'Anima:** La sfumatura emotiva che cerchi oggi.
3. **L'Ombra:** Ciò che assolutamente NON vuoi leggere.

Alla fine, riceverai 2 o 3 volumi scelti con cura per te.

---

*Creato con passione per tutti gli amanti dei libri che si sono persi tra gli scaffali.*
