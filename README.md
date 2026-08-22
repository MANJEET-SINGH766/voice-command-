# Voice Command Shopping Assistant

A mobile-responsive, voice-driven shopping list manager. It captures user speech transcripts in real-time, extracts quantities and products, automatically groups items into categories, and offers contextual, history-based, and seasonal product suggestions.

## Key Features

- **Voice Command Processing:** Real-time speech capturing using Web Speech API with fallback processing to Google Gemini Pro API for unstructured natural language command parsing.
- **Intelligent Categorization:** Automatic item mapping to organized food groups and store sections.
- **Contextual Suggestions:** Dynamic recommendations system offering seasonal items, purchase history insights, and substitute recommendations.

## Tech Stack

- **Frontend:** React (Vite), modern CSS, Lucide Icons.
- **Backend:** Node.js, Express REST API server.
- **Database:** MongoDB via Mongoose object modeling.
- **AI Integration:** Google Gemini API for natural language extraction.

## Getting Started

### 1. Server Setup
```bash
cd server
npm install
# Create a .env file with MONGODB_URI and GEMINI_API_KEY
npm run dev
```

### 2. Client Setup
```bash
cd client
npm install
npm run dev
```

## License
Distributed under the MIT License. See LICENSE for details.
