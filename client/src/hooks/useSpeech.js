import { useState, useEffect, useRef, useCallback } from "react";

export function useSpeech() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState(null);
  const [isSupported, setIsSupported] = useState(true);

  const recognitionRef = useRef(null);

  useEffect(() => {
    // Check browser compatibility
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    // Instantiate SpeechRecognition
    const recognition = new SpeechRecognition();
    recognition.continuous = false; // Stop listening when user stops speaking
    recognition.interimResults = true; // Stream interim results in real-time

    recognitionRef.current = recognition;
  }, []);

  const startListening = useCallback((language = "en-US") => {
    if (!isSupported || !recognitionRef.current) {
      setError("Speech recognition is not supported in this browser.");
      return;
    }

    setError(null);
    setTranscript("");
    
    // Set active language code (e.g. "en-US" or "hi-IN")
    recognitionRef.current.lang = language;

    // Hook events
    recognitionRef.current.onstart = () => {
      setIsListening(true);
    };

    recognitionRef.current.onresult = (event) => {
      let finalTranscript = "";
      let interimTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      // Display what is heard in real-time
      setTranscript(finalTranscript || interimTranscript);
    };

    recognitionRef.current.onerror = (event) => {
      console.error("Speech Recognition Error:", event.error);
      setIsListening(false);
      
      switch (event.error) {
        case "not-allowed":
          setError("Microphone permission denied. Please allow microphone access in your browser settings.");
          break;
        case "no-speech":
          setError("No speech was detected. Please try speaking closer to your microphone.");
          break;
        case "audio-capture":
          setError("No microphone was found. Make sure your device has a working microphone.");
          break;
        case "network":
          setError("Network error: Chrome requires an active internet connection to process voice recognition.");
          break;
        default:
          setError(`An error occurred during voice recognition (${event.error}). Please try again.`);
      }
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
    };

    try {
      recognitionRef.current.start();
    } catch (err) {
      console.error("Recognition start failed:", err);
      setError("Unable to start speech recognition. It may already be running.");
    }
  }, [isSupported]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript("");
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  return {
    isListening,
    transcript,
    error,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
    setError
  };
}
