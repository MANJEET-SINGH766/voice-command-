# Voice Command Shopping Assistant 🎙️🛒

An advanced, mobile-responsive, voice-driven shopping list manager. It leverages the browser **Web Speech API** for real-time speech capturing, performs dual-tier command parsing (high-speed local regex + **Google Gemini AI** fallback), automatically categorizes grocery items, and offers smart suggestions.

Upgraded with advanced **Hinglish auto-detection**, **Text-to-Speech (TTS) vocal confirmations**, **Dietary and Health Profiles**, and a **glowing audio waveform visualizer**.

---

## 🚀 Key Features

### 1. Advanced Voice Recognition & NLP
* **Dual-Tier Parser:** Uses deterministic local regex rules for sub-millisecond, zero-cost parsing, falling back to Google Gemini Pro API for complex, unstructured sentences.
* **Auto-Hinglish Detection:** Automatically switch-detects Hinglish phrasing (e.g. *"do banana add karo"*) even in English mode, parsing quantities and names accurately.
* **Multilingual Input:** Fully supports speech inputs in English (`en-US`), Hindi (`hi-IN`), and Hinglish.

### 2. Conversational Feedback & TTS
* **Vocal Confirmations:** The assistant speaks back (vocalizes) to confirm successful commands (e.g., *"Added 2 apples to Produce"* or *"दूध सूची से हटा दिया गया है"*).
* **Verbal Error Handling:** Spoken error notifications alert the user when speech is muffled or commands are not understood.

### 3. Dietary & Health Profiles
* **Dynamic Filters:** Toggle **Vegan**, **Gluten-Free**, or **Organic** profiles in the settings drawer.
* **Smart Filtering:** Recommendation lists and search results automatically filter catalog items to match selected profiles (e.g. suggesting almond milk for vegan profiles).

### 4. Interactive UX/UI
* **Audio Wave Visualizer:** Real-time Web Audio API analyzer renders a glowing, neon sound wave canvas when recording.
* **Glassmorphic Theme:** Sleek dark-and-light blended glassmorphic styling, categorized listing cards, and smooth micro-interactions.

---

## 🛠️ Technology Stack

* **Frontend:** React (Vite), Web Speech API, Web Audio API, Lucide Icons, Vanilla CSS
* **Backend:** Node.js, Express REST API
* **Database:** MongoDB via Mongoose object modeling
* **AI Engine:** Google Gemini AI API (`gemini-1.5-flash` model)

---

## 📦 Project Structure

```
voice-assistant/
├── client/          # Frontend React codebase
│   ├── src/
│   │   ├── components/  # VoiceController, Recommendations, SearchResults, ShoppingList
│   │   ├── context/     # AppContext (Core state + SpeechSynthesis TTS)
│   │   ├── hooks/       # useSpeech (Mic capture + AnalyserNode Web Audio API)
│   │   └── index.css    # Responsive theme and glassmorphic variables
├── server/          # Backend Node.js / Express codebase
│   ├── config/      # MongoDB connection configs
│   ├── models/      # Mongoose schemas: Product, ShoppingItem, ShoppingHistory
│   ├── routes/      # REST Endpoints: list, products, suggestions, voice
│   └── utils/       # nlpParser (Regex extraction + Hindi normalization + Gemini AI)
```

---

## 🔧 Installation & Setup

### Prerequisites
* Node.js (v18+)
* MongoDB database instance
* Google Gemini API Key (Optional, for advanced NLP fallback)

### 1. Backend Server Setup
1. Navigate to the server folder:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `server` root directory:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   GEMINI_API_KEY=your_gemini_api_key
   ```
4. Seed the database with product catalog assets:
   ```bash
   node seed.js
   ```
5. Spin up the server in development mode:
   ```bash
   npm run dev
   ```

### 2. Frontend Client Setup
1. Navigate to the client folder:
   ```bash
   cd ../client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Spin up the client environment:
   ```bash
   npm run dev
   ```
4. Open `http://localhost:5173` in Google Chrome or Safari to test.

---

## 🗣️ Voice Command Cheat Sheet

The parser extracts intents from both English, Hindi, and Hinglish speech patterns:

| Intent | English Examples | Hindi / Hinglish Examples |
| :--- | :--- | :--- |
| **Add Item** | *"Add 3 bottles of water"*<br>*"Buy milk"* | *"mujhe do kela chahiye"*<br>*"doodh add karo"* |
| **Remove Item** | *"Remove milk"*<br>*"Delete apples"* | *"milk hata do"*<br>*"apple delete kar do"* |
| **Update Quantity**| *"Set milk to 3"*<br>*"Update apples quantity to 5"* | *"milk update kar do 5"*<br>*"apple ki quantity teen badlo"* |
| **Search Catalog** | *"Find toothpaste under $5"*<br>*"Look for Colgate"* | *"pasta dhundho under 200 rupees"*<br>*"sasta aaloo dikhao"* |
| **Clear List** | *"Clear entire list"*<br>*"Empty shopping list"* | *"list saaf kar do"*<br>*"kuch nahi chahiye"* |

---

## 📝 Approach & Architecture Write-up

This application is built with a focus on high performance, accessibility, and zero-cost scaling. 

Our core architecture uses a **dual-tier parsing pipeline**. High-frequency, deterministic commands (such as adds, deletes, and quantity sets) are parsed locally in milliseconds using optimized regular expression filters on the server. When sentences are highly conversational or unstructured, the parser seamlessly falls back to Google's Gemini AI to parse the intent, minimizing AI API cost and latency.

Hinglish/Hindi inputs are normalized into standard English SVO (Subject-Verb-Object) commands before parsing. Pronoun stripping, ignore lists, and global verb mapping filters prevent helper verbs (like *"do"* in *"delete kar do"*) from polluting parsed items. Real-time visual feedback (Canvas oscilloscopes) and voice feedback (SpeechSynthesis TTS) create a completely hands-free shopping experience.

---

## 📄 License
This project is licensed under the MIT License - see the LICENSE file for details.
