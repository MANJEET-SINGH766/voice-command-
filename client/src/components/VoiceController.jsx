import React, { useState, useEffect } from "react";
import { Mic, MicOff, Globe, ArrowRight, XCircle, CheckCircle } from "lucide-react";
import { useSpeech } from "../hooks/useSpeech";
import { useApp } from "../context/AppContext";

function VoiceController() {
  const {
    isListening,
    transcript,
    error: speechError,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
    setError: setSpeechError,
    analyser
  } = useSpeech();

  const canvasRef = React.useRef(null);

  useEffect(() => {
    if (!analyser || !isListening) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    let animationFrameId;

    const draw = () => {
      if (!analyser || !isListening) return;
      
      animationFrameId = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.lineWidth = 3;
      ctx.strokeStyle = "#0ea5e9";
      ctx.shadowBlur = 8;
      ctx.shadowColor = "#0ea5e9";
      ctx.beginPath();

      const sliceWidth = canvas.width / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * canvas.height) / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [analyser, isListening]);

  const {
    selectedLanguage,
    setSelectedLanguage,
    loading: processing,
    error: apiError,
    setError: setApiError,
    voiceResult: result,
    setVoiceResult: setResult,
    processVoiceCommand
  } = useApp();

  const [editableTranscript, setEditableTranscript] = useState("");

  // Sync speech recognition transcript with editable text box
  useEffect(() => {
    if (transcript) {
      setEditableTranscript(transcript);
    }
  }, [transcript]);

  const handleMicClick = () => {
    if (isListening) {
      stopListening();
    } else {
      setResult(null);
      setApiError(null);
      setSpeechError(null);
      setEditableTranscript("");
      resetTranscript();
      startListening(selectedLanguage);
    }
  };

  const handleSendSubmit = () => {
    if (!editableTranscript.trim()) return;

    setResult(null);
    setApiError(null);

    processVoiceCommand(editableTranscript).catch((err) => {
      console.error("Voice command processing failed:", err);
    });
  };

  if (!isSupported) {
    return (
      <div className="glass-panel" style={{ padding: "20px", marginTop: "20px" }}>
        <div style={{ display: "flex", gap: "10px", color: "var(--color-error)", alignItems: "center", marginBottom: "12px" }}>
          <MicOff size={20} />
          <h3 style={{ fontWeight: 600 }}>Voice Input Unsupported</h3>
        </div>
        <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", marginBottom: "15px" }}>
          Your web browser does not support the Web Speech API. Please try Google Chrome or Apple Safari for voice features.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: "500" }}>Manual Input Simulation</label>
          <div style={{ display: "flex", gap: "8px" }}>
            <input
              type="text"
              placeholder="Type a command (e.g. Add milk)..."
              value={editableTranscript}
              onChange={(e) => setEditableTranscript(e.target.value)}
              style={{
                flex: 1,
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid var(--border-glass)",
                borderRadius: "var(--radius-sm)",
                padding: "10px",
                color: "var(--text-primary)",
                outline: "none"
              }}
            />
            <button
              onClick={handleSendSubmit}
              disabled={processing || !editableTranscript.trim()}
              style={{
                background: "var(--color-accent-gradient)",
                border: "none",
                borderRadius: "var(--radius-sm)",
                padding: "0 15px",
                color: "#000",
                fontWeight: "600",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "5px"
              }}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-panel" style={{ padding: "25px", width: "100%", marginTop: "20px" }}>
      {/* Top Header controls */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <span style={{ fontSize: "0.95rem", fontWeight: "600", color: "var(--text-secondary)" }}>
          Voice Command Capture
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "rgba(255, 255, 255, 0.05)", padding: "6px 12px", borderRadius: "var(--radius-sm)" }}>
          <Globe size={14} style={{ color: "var(--text-secondary)" }} />
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            disabled={isListening}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--text-primary)",
              fontSize: "0.85rem",
              fontWeight: "500",
              outline: "none",
              cursor: "pointer"
            }}
          >
            <option value="en-US" style={{ background: "var(--bg-secondary)", color: "#fff" }}>English (US)</option>
            <option value="hi-IN" style={{ background: "var(--bg-secondary)", color: "#fff" }}>Hindi (हिन्दी)</option>
          </select>
        </div>
      </div>

      {/* Main Microphone Button */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", margin: "20px 0" }}>
        <button
          onClick={handleMicClick}
          disabled={processing}
          className={isListening ? "animate-pulse-wave" : ""}
          style={{
            width: "80px",
            height: "80px",
            borderRadius: "50%",
            background: isListening ? "var(--color-accent-gradient)" : "rgba(255,255,255,0.05)",
            border: `1px solid ${isListening ? "var(--color-accent)" : "var(--border-glass)"}`,
            color: isListening ? "#000" : "var(--text-primary)",
            cursor: "pointer",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            boxShadow: isListening ? "var(--shadow-neon)" : "none",
            transition: "var(--transition-smooth)"
          }}
        >
          <Mic size={32} />
        </button>
        <span style={{ marginTop: "12px", fontSize: "0.85rem", color: isListening ? "var(--color-accent)" : "var(--text-secondary)", fontWeight: "500" }}>
          {isListening ? (
            <>
              <span className="dot-listening" style={{ marginRight: "6px" }} />
              Listening... Click to Pause
            </>
          ) : "Tap to Speak"}
        </span>
      </div>

      {/* Audio Waveform Visualizer Canvas */}
      {isListening && analyser && (
        <div style={{ display: "flex", justifyContent: "center", width: "100%", margin: "0 0 20px 0" }}>
          <canvas
            ref={canvasRef}
            width={300}
            height={50}
            style={{
              background: "rgba(0, 0, 0, 0.2)",
              border: "1px solid var(--border-glass)",
              borderRadius: "var(--radius-md)",
              width: "100%",
              height: "50px"
            }}
          />
        </div>
      )}

      {/* Error Output alert (Speech or API parsing errors) */}
      {(speechError || apiError) && (
        <div style={{
          display: "flex",
          gap: "8px",
          background: "rgba(239, 68, 68, 0.1)",
          border: "1px solid var(--color-error)",
          borderRadius: "var(--radius-sm)",
          padding: "12px",
          color: "var(--color-error)",
          fontSize: "0.85rem",
          marginBottom: "15px"
        }}>
          <XCircle size={16} style={{ flexShrink: 0, marginTop: "2px" }} />
          <span>{speechError || apiError}</span>
        </div>
      )}

      {/* Transcript Textbox display */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px", width: "100%" }}>
        <label style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: "600" }}>
          Spoken Transcript
        </label>
        <textarea
          placeholder="Speak to see your transcript populate here..."
          value={editableTranscript}
          onChange={(e) => setEditableTranscript(e.target.value)}
          disabled={isListening || processing}
          style={{
            width: "100%",
            minHeight: "80px",
            background: "rgba(0, 0, 0, 0.2)",
            border: "1px solid var(--border-glass)",
            borderRadius: "var(--radius-md)",
            padding: "12px",
            color: "var(--text-primary)",
            fontSize: "0.95rem",
            lineHeight: "1.4",
            outline: "none",
            resize: "none",
            fontFamily: "inherit"
          }}
        />

        {/* Submit command button */}
        {editableTranscript.trim() && !isListening && (
          <button
            onClick={handleSendSubmit}
            disabled={processing}
            style={{
              background: "var(--color-accent-gradient)",
              border: "none",
              borderRadius: "var(--radius-md)",
              padding: "12px",
              color: "#000",
              fontWeight: "600",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              marginTop: "8px",
              boxShadow: "var(--shadow-neon)"
            }}
          >
            {processing ? "Processing voice command..." : (
              <>
                Process Voice Command <ArrowRight size={16} />
              </>
            )}
          </button>
        )}
      </div>

      {/* Verification results display */}
      {result && (
        <div style={{
          marginTop: "20px",
          background: "rgba(16, 185, 129, 0.08)",
          border: "1px solid rgba(16, 185, 129, 0.2)",
          borderRadius: "var(--radius-md)",
          padding: "15px"
        }}>
          <div style={{ display: "flex", gap: "8px", color: "var(--color-success)", alignItems: "center", marginBottom: "8px" }}>
            <CheckCircle size={16} />
            <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>Voice Parser Success</span>
          </div>
          <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", display: "flex", flexDirection: "column", gap: "4px" }}>
            <div><strong>Intent:</strong> <span style={{ color: "var(--color-accent)", fontWeight: "600" }}>{result.intent}</span></div>
            {result.item && <div><strong>Item:</strong> "{result.item}"</div>}
            {result.quantity && <div><strong>Quantity:</strong> {result.quantity}</div>}
            {result.unit && <div><strong>Unit:</strong> {result.unit}</div>}
            {result.category && <div><strong>Category:</strong> {result.category}</div>}
            {result.maxPrice && <div><strong>Max Price:</strong> ${result.maxPrice}</div>}
            {result.brand && <div><strong>Brand:</strong> {result.brand}</div>}
          </div>
        </div>
      )}
    </div>
  );
}

export default VoiceController;
