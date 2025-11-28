import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar, Container, Button, Card } from '../../components/ui';
import { ArrowRight, Camera, CheckCircle2, Mic, UploadCloud, Radio, Zap, AlertCircle, StopCircle, User, Bot, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api, endpoints, getWebSocketUrl } from '../../services/api';
import OpenAI from 'openai';

const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: import.meta.env.VITE_OPENROUTER_API_KEY,
  dangerouslyAllowBrowser: true
});

const SYSTEM_PROMPT = `
You are a voice AI agent for an insurance claims system. Your job is to greet callers, detect their intent, collect required information, confirm it, and end the flow cleanly once all details are gathered.

FLOW LOGIC

1. Start by greeting the caller briefly and offering exactly two options:
   - "Register a new claim"
   - "Check status of an existing claim"

2. Detect the caller's intent from their reply. Choose exactly one of:
   - NEW_CLAIM
   - CHECK_STATUS

3. Ask one question at a time. Use short, polite utterances suitable for TTS. Confirm each key detail after collecting it.

INTENT: NEW_CLAIM
- Required fields (in this order):
  1. policy_number  
  2. vehicle_number (registration number)  
  3. accident_details (what happened, when, where)

- After each field: confirm in one short sentence.
- If a required field is missing, unclear, or invalid, ask again for ONLY that field.
- Once **all required fields are collected and confirmed**, IMMEDIATELY output:
    **EXIT: NEW_CLAIM_DETAILS_COLLECTED**
  and END THE CONVERSATION. Do not respond to any further user input.

INTENT: CHECK_STATUS
- Required field:
  1. case_number

- Confirm once provided.
- If unclear, ask again.
- When **case_number is confirmed**, IMMEDIATELY output:
    **EXIT: CASE_NUMBER_COLLECTED**
  and END THE CONVERSATION. Do not respond to any further user input.

CONVERSATION END BEHAVIOR (CRITICAL):
- When you output **EXIT: NEW_CLAIM_DETAILS_COLLECTED** or **EXIT: CASE_NUMBER_COLLECTED**, the conversation ends immediately.
- Do NOT respond to any further user messages after producing an exit command.
`;

interface Message {
  id: string;
  role: 'agent' | 'user' | 'system';
  text: string;
}

// Add SpeechRecognition type definition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const VoiceVisualizer: React.FC<{ isActive: boolean }> = ({ isActive }) => {
  return (
    <div className="flex items-center justify-center gap-1.5 h-16 w-full max-w-[200px]">
      {[...Array(7)].map((_, i) => (
        <motion.div
          key={i}
          animate={{
            height: isActive ? [16, 48, 16] : 8,
            opacity: isActive ? 1 : 0.3,
            backgroundColor: isActive ? '#3b82f6' : '#94a3b8'
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: i * 0.1,
            ease: "easeInOut"
          }}
          className="w-2 rounded-full"
          {...({} as any)}
        />
      ))}
    </div>
  );
};

const NewClaimWizard: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0); // 0 = Mode Selection
  const [mode, setMode] = useState<'voice' | 'form'>('form');

  // Form State
  const [description, setDescription] = useState('');
  const [imageCaptured, setImageCaptured] = useState<string | null>(null);
  const [fileId, setFileId] = useState<string | null>(null); // Store backend file ID
  const [isCapturing, setIsCapturing] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Analysis State
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  // Voice State
  const [isRecording, setIsRecording] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState(''); // Text input fallback
  const wsRef = useRef<WebSocket | null>(null);
  const recognitionRef = useRef<any>(null); // Use SpeechRecognition instead of MediaRecorder
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Camera Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Auto-scroll chat
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // --- Voice Agent Logic (Frontend LLM) ---
  useEffect(() => {
    if (step === 1 && mode === 'voice') {
      // Initial Greeting
      const greeting = "Hey there! Welcome to the platform. I'm your virtual assistant, here to guide you through the claims process—saving you time and skipping the old-fashioned paperwork. How can I help you today?";
      setMessages([{ id: 'init', role: 'agent', text: greeting }]);
      speak(greeting);
    }
  }, [step, mode]);

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Stop previous
      const utterance = new SpeechSynthesisUtterance(text);

      // improved voice selection for Chrome
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(v => v.name === 'Google US English') ||
        voices.find(v => v.name === 'Samantha') || // macOS default
        voices.find(v => v.lang === 'en-US');

      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.rate = 1.0; // Normal speed
      utterance.pitch = 1.0; // Normal pitch
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  // Keep messages ref updated to avoid stale closures in callbacks
  const messagesRef = useRef(messages);
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const generateResponse = async (userText: string) => {
    // Use ref to get latest messages
    const currentMessages = messagesRef.current;
    const newHistory = [...currentMessages, { id: Date.now().toString(), role: 'user' as const, text: userText }];

    // Filter for API
    const apiMessages = newHistory
      .filter(m => m.role === 'agent' || m.role === 'user')
      .map(m => ({
        role: m.role === 'agent' ? 'assistant' : 'user',
        content: m.text
      }));

    try {
      const completion = await openai.chat.completions.create({
        model: 'x-ai/grok-4.1-fast:free',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...apiMessages
        ] as any
      });

      const aiText = completion.choices[0]?.message?.content || "Sorry, I didn't catch that.";

      // Check for Exit
      if (aiText.includes("EXIT:")) {
        const cleanText = aiText.split("**EXIT:")[0].replace("EXIT:", "").trim();
        if (cleanText) {
          setMessages(prev => [...prev, { id: Date.now().toString(), role: 'agent', text: cleanText }]);
          speak(cleanText);
        }
        setMessages(prev => [...prev, { id: 'exit', role: 'system', text: 'Details collected. Proceeding...' }]);
        setTimeout(() => setStep(2), 3000);
        return;
      }

      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'agent', text: aiText }]);
      speak(aiText);

    } catch (error: any) {
      console.error("LLM Error Details:", error);
      setMessages(prev => [...prev, { id: 'err-llm', role: 'system', text: `AI Error: ${error.message || 'Unknown error'}` }]);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        setMessages(prev => [...prev, { id: 'err-stt', role: 'system', text: 'Browser does not support Speech Recognition. Please type.' }]);
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      let hasFinalResult = false;

      recognition.onstart = () => {
        setIsRecording(true);
        hasFinalResult = false;
      };

      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        if (interimTranscript) {
          setInputText(interimTranscript);
        }

        if (finalTranscript) {
          console.log("Recognized Final:", finalTranscript);
          hasFinalResult = true;
          setInputText(finalTranscript);

          setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', text: finalTranscript }]);
          generateResponse(finalTranscript);
          setTimeout(() => setInputText(''), 100);
        }
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsRecording(false);
        if (event.error === 'not-allowed') {
          setMessages(prev => [...prev, { id: 'err-mic', role: 'system', text: 'Microphone access denied.' }]);
        }
      };

      recognition.onend = () => {
        setIsRecording(false);
        // If stopped but no final result, send what we have in input
        if (!hasFinalResult && inputText.trim()) {
          console.log("Manual stop/end detected, sending pending text:", inputText);
          setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', text: inputText }]);
          generateResponse(inputText);
          setInputText('');
        }
      };

      recognition.start();
      recognitionRef.current = recognition;
    }
  };

  const handleSendText = () => {
    if (!inputText.trim()) return;

    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', text: inputText }]);
    generateResponse(inputText);
    setInputText('');
  };

  // --- File Upload Logic (Mocked) ---
  const handleFileUpload = async (file: File) => {
    setUploading(true);

    // Simulate upload delay
    setTimeout(() => {
      const mockFileId = 'FILE-' + Math.floor(Math.random() * 10000);
      setFileId(mockFileId);
      console.log("File uploaded (Mock), ID:", mockFileId);

      const reader = new FileReader();
      reader.onloadend = () => {
        setImageCaptured(reader.result as string);
        setUploading(false);
      };
      reader.readAsDataURL(file);
    }, 1000);
  };

  // --- Analysis Logic ---
  useEffect(() => {
    if (step === 3 && !analysisResult && !analyzing) {
      const runAnalysis = async () => {
        setAnalyzing(true);
        try {
          const payload = {
            user_submission: {
              description: description || "Voice reported claim",
              file_id: fileId
            },
            location: "New York, NY", // Mock location for now
            date: new Date().toISOString()
          };

          // Mock Analysis for MVP Simulation
          setTimeout(() => {
            const mockResult = {
              analysis_result: {
                score: 1,
                reasoning_behind_score: "The damage description matches the visual evidence provided. Policy is active and coverage includes collision. No anomalies detected in the claim report."
              }
            };
            setAnalysisResult(mockResult);
            setAnalyzing(false);
          }, 2000);

          /* 
          // Backend Integration (Disabled for MVP Simulation)
          const response = await api.post(endpoints.analyze, payload);
          setAnalysisResult(response.data);
          */
        } catch (e) {
          console.error("Analysis failed", e);
          setAnalysisResult({ error: "Analysis failed. Please try again." });
        } finally {
          // setAnalyzing(false); // Handled in timeout
        }
      };
      runAnalysis();
    }
  }, [step, fileId, description]);


  // --- Step 2 Actions (Camera) ---
  const startCamera = async () => {
    setIsCapturing(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      console.error("Camera error", err);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], "camera_capture.png", { type: "image/png" });
            handleFileUpload(file);
            stopCamera();
          }
        });
      }
    }
  };

  const stopCamera = useCallback(() => {
    setIsCapturing(false);
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
  }, []);

  // --- RENDERERS ---

  const renderModeSelection = () => (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6" {...({} as any)}>
      <h2 className="text-xl font-bold text-slate-900 text-center">How would you like to file?</h2>

      <div
        onClick={() => setMode('voice')}
        className={`p-6 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${mode === 'voice' ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-blue-200'}`}
      >
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${mode === 'voice' ? 'bg-blue-200 text-blue-700' : 'bg-slate-100 text-slate-500'}`}>
            <Mic size={24} />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">Voice Assistant</h3>
            <p className="text-sm text-slate-500">Speak naturally. Our AI handles the details.</p>
          </div>
        </div>
        {mode === 'voice' && <div className="w-4 h-4 rounded-full bg-blue-500"></div>}
      </div>

      <div
        onClick={() => setMode('form')}
        className={`p-6 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${mode === 'form' ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-blue-200'}`}
      >
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${mode === 'form' ? 'bg-blue-200 text-blue-700' : 'bg-slate-100 text-slate-500'}`}>
            <Radio size={24} />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">Standard Form</h3>
            <p className="text-sm text-slate-500">Manual entry and photo uploads.</p>
          </div>
        </div>
        {mode === 'form' && <div className="w-4 h-4 rounded-full bg-blue-500"></div>}
      </div>

      <Button onClick={() => setStep(1)} className="w-full h-12 text-lg">
        Continue <ArrowRight className="ml-2 w-5 h-5" />
      </Button>
    </motion.div>
  );

  const renderVoiceStep = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col h-[600px] bg-slate-50 rounded-2xl overflow-hidden border border-slate-200 shadow-xl" {...({} as any)}>
      {/* Chat Header */}
      <div className="bg-white border-b border-slate-200 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="font-bold text-slate-700 text-sm">AI Agent Active</span>
        </div>
        <Button variant="ghost" size="sm" onClick={() => setStep(2)} className="text-xs text-slate-400">
          Skip to Evidence
        </Button>
      </div>

      {/* Chat Messages */}
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              {...({} as any)}
            >
              <div className={`
                       max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed shadow-sm
                       ${msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : msg.role === 'system'
                    ? 'bg-slate-200 text-slate-600 text-xs py-2 text-center w-full max-w-none rounded-lg'
                    : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none'}
                    `}>
                {msg.role !== 'system' && (
                  <div className="flex items-center gap-2 mb-1 opacity-70">
                    {msg.role === 'agent' ? <Bot size={12} /> : <User size={12} />}
                    <span className="text-[10px] font-bold uppercase">{msg.role}</span>
                  </div>
                )}
                {msg.text}
              </div>
            </motion.div>
          ))}
          {isRecording && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-end" {...({} as any)}>
              <div className="bg-blue-50 text-blue-600 text-xs px-3 py-1 rounded-full animate-pulse border border-blue-100">
                Listening...
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Voice Controls */}
      <div className="bg-white border-t border-slate-200 p-6 flex flex-col items-center">
        <VoiceVisualizer isActive={isRecording} />

        <div className="mt-6 flex items-center gap-6 w-full justify-center">
          <Button
            onClick={toggleRecording}
            className={`
                     w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-all transform hover:scale-105 active:scale-95
                     ${isRecording ? 'bg-red-500 hover:bg-red-600 shadow-red-200' : 'bg-gradient-to-r from-blue-600 to-indigo-600 shadow-blue-200'}
                   `}
          >
            {isRecording ? <StopCircle size={32} /> : <Mic size={32} />}
          </Button>
        </div>
        <p className="text-center text-xs text-slate-400 mt-4 font-medium mb-4">
          {isRecording ? "Listening..." : "Tap microphone to speak"}
        </p>

        {/* Text Input Fallback */}
        <div className="w-full max-w-md flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendText()}
            placeholder="Or type your response..."
            className="flex-1 p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 text-sm"
          />
          <Button onClick={handleSendText} disabled={!inputText.trim()}>
            Send
          </Button>
        </div>
      </div>
    </motion.div>
  );

  const renderFormStep1 = () => (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} {...({} as any)}>
      <div className="mb-6">
        <label className="block text-sm font-bold text-slate-700 mb-2">
          Tell us what happened
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 min-h-[150px]"
          placeholder="I was rear-ended at..."
        />
      </div>
      <Button
        onClick={() => setStep(2)}
        className="w-full"
        disabled={description.length < 5}
      >
        Next: Evidence <ArrowRight className="ml-2 w-4 h-4" />
      </Button>
    </motion.div>
  );

  const renderFormStep2 = () => (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} {...({} as any)}>
      <h2 className="text-lg font-bold text-slate-800 mb-2">Upload Evidence</h2>
      <p className="text-sm text-slate-500 mb-6">Backend connected: Uploads go to /ingest/upload</p>

      <div className="relative bg-black rounded-2xl overflow-hidden aspect-[3/4] mb-6 shadow-xl">
        {imageCaptured ? (
          <img src={imageCaptured} alt="Captured" className="w-full h-full object-cover" />
        ) : !isCapturing ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
            <Camera size={48} className="mb-4" />
            <Button variant="ghost" onClick={startCamera} className="text-white border-white/20 mb-4">
              Open Camera
            </Button>
            <div className="relative overflow-hidden">
              <Button variant="secondary" className="cursor-pointer">
                <UploadCloud className="mr-2 w-4 h-4" /> Upload File
              </Button>
              <input
                type="file"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={(e) => {
                  if (e.target.files?.[0]) handleFileUpload(e.target.files[0]);
                }}
              />
            </div>
          </div>
        ) : (
          <>
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            <div className="absolute inset-0 border-2 border-emerald-500/50 m-8 rounded-lg flex items-center justify-center">
              <div className="w-full h-0.5 bg-emerald-500/80 absolute top-1/2 animate-pulse"></div>
            </div>
          </>
        )}
        <canvas ref={canvasRef} className="hidden" />

        {uploading && (
          <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white mb-2"></div>
            <span>Uploading to Backend...</span>
          </div>
        )}
      </div>

      {imageCaptured ? (
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setImageCaptured(null)} className="flex-1">Retake</Button>
          <Button onClick={() => setStep(3)} className="flex-1">Use Photo</Button>
        </div>
      ) : isCapturing ? (
        <div className="flex justify-center w-full">
          <Button
            onClick={capturePhoto}
            className="w-full py-6 text-lg bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-200"
          >
            <Camera className="w-6 h-6 mr-2" /> Capture Photo
          </Button>
        </div>
      ) : null}
    </motion.div>
  );

  const renderStep3 = () => (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="text-center" {...({} as any)}>
      {analyzing ? (
        <div className="py-12">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
            <Sparkles className="w-10 h-10 text-blue-600 animate-spin" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Analyzing Claim...</h2>
          <p className="text-slate-500">Cross-referencing with police reports & weather data.</p>
        </div>
      ) : analysisResult ? (
        <div className="py-6">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${analysisResult.analysis_result?.score === 1 ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
            {analysisResult.analysis_result?.score === 1 ? <CheckCircle2 className="w-10 h-10" /> : <AlertCircle className="w-10 h-10" />}
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            {analysisResult.analysis_result?.score === 1 ? 'Claim Approved' : 'Flagged for Review'}
          </h2>
          <div className="bg-slate-50 p-4 rounded-xl text-left text-sm text-slate-600 mb-8 border border-slate-200">
            <p className="font-bold mb-1">AI Reasoning:</p>
            {analysisResult.analysis_result?.reasoning_behind_score}
          </div>
          <Button onClick={() => navigate('/customer')} className="w-full">
            Return to Dashboard
          </Button>
        </div>
      ) : (
        <div>
          <p>Waiting for analysis...</p>
        </div>
      )}
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-white">
      <Navbar title="New Claim" backLink={step > 0 ? undefined : "/customer"} type="customer" />

      {step > 0 && (
        <div className="w-full h-1 bg-slate-100">
          <div
            className="h-full bg-blue-600 transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          ></div>
        </div>
      )}

      <Container className="max-w-lg mx-auto pt-10 pb-20">
        <AnimatePresence mode="wait">
          {step === 0 && renderModeSelection()}
          {step === 1 && mode === 'voice' && renderVoiceStep()}
          {step === 1 && mode === 'form' && renderFormStep1()}
          {step === 2 && renderFormStep2()}
          {step === 3 && renderStep3()}
        </AnimatePresence>
      </Container>
    </div>
  );
};

export default NewClaimWizard;