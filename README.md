# Voice Command Shopping Assistant

The **Voice Command Shopping Assistant** is a mobile-responsive, voice-driven shopping list manager. It captures speech commands in real-time, extracts user intent and quantities, categorizes products automatically, and provides smart seasonal, history-based, and substitute recommendations.

---

## 1. System Architecture

The application separates frontend UI from backend language processing, routing all transcripts to a dedicated backend parser API:

```
Speech-to-Text (Web Speech API)
              ↓
  POST /api/voice/command (Server)
              ↓
  Rule/Regex Pattern Parser
              ↓
         Recognized?
   ┌──────────┴──────────┐
  YES                   NO
   ↓                     ↓
Execute DB            Gemini AI Fallback
Command                  Translate & Parse
                         ↓
                      Validate (Zod)
                         ↓
                      Execute DB Command
```
