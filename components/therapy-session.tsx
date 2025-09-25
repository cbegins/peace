"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"

interface Message {
  role: "user" | "assistant"
  content: string
}

export default function TherapySession() {
  const router = useRouter()
  const audioRef = useRef<HTMLAudioElement>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const [currentQuestion, setCurrentQuestion] = useState("")
  const [lastUserResponse, setLastUserResponse] = useState("")
  const [conversationHistory, setConversationHistory] = useState<Message[]>([])
  const [currentInput, setCurrentInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [sessionEnded, setSessionEnded] = useState(false)
  const [showInitialPeacefulMusic, setShowInitialPeacefulMusic] = useState(true)
  const [chatStarted, setChatStarted] = useState(false)
  const [showBreathing, setShowBreathing] = useState(false)
  const [breathingPhase, setBreathingPhase] = useState<"inhale" | "exhale">("inhale")
  const [breathingTimer, setBreathingTimer] = useState(180)
  const [breathingPhaseProgress, setBreathingPhaseProgress] = useState(0)
  const [breathingPhaseTimer, setBreathingPhaseTimer] = useState(4)
  const [showPeacefulMusic, setShowPeacefulMusic] = useState(false)
  const [musicTimer, setMusicTimer] = useState(55)
  const [showFeedback, setShowFeedback] = useState(false)
  const [feedbackInput, setFeedbackInput] = useState("")
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false)
  const [audioLoaded, setAudioLoaded] = useState(false)
  const [audioError, setAudioError] = useState(false)
  const [showInitialBreathing, setShowInitialBreathing] = useState(true)
  const [breathCount, setBreathCount] = useState(0)
  const [maxBreaths] = useState(3)
  const [showNewChatButton, setShowNewChatButton] = useState(false)
  const [isPostBreathingMusic, setIsPostBreathingMusic] = useState(false)

  const newChatButtonTrigger = useMemo(() => (Math.random() > 0.5 ? 7 : 8), [])

  const cleanup = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const playAudio = useCallback(async () => {
    if (audioRef.current) {
      try {
        audioRef.current.currentTime = 0
        audioRef.current.loop = isPostBreathingMusic
        await audioRef.current.play()
      } catch (error) {
        console.error("Audio play failed:", error)
        setAudioError(true)
      }
    }
  }, [isPostBreathingMusic])

  const startSession = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/therapy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [],
          sessionState: "beginning",
        }),
      })

      const data = await response.json()
      setCurrentQuestion(data.question)
    } catch (error) {
      console.error("Failed to start session:", error)
      setCurrentQuestion("આજે તમે કેવું અનુભવી રહ્યા છો?")
    }
    setIsLoading(false)
  }, [])

  const sendMessage = useCallback(async () => {
    if (!currentInput.trim() || isLoading) return

    const userMessage = { role: "user" as const, content: currentInput }
    const updatedHistory = [
      ...conversationHistory,
      { role: "assistant" as const, content: currentQuestion },
      userMessage,
    ]

    setConversationHistory(updatedHistory)
    setLastUserResponse(currentInput)
    setCurrentInput("")
    setIsLoading(true)

    const messageCount = Math.floor(updatedHistory.length / 2)
    if (messageCount >= newChatButtonTrigger && !showNewChatButton) {
      setShowNewChatButton(true)
    }

    try {
      const response = await fetch("/api/therapy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedHistory,
          sessionState: updatedHistory.length > 8 ? "progressing" : "beginning",
        }),
      })

      const data = await response.json()

      if (data.shouldEnd) {
        setSessionEnded(true)
        setCurrentQuestion("")
      } else {
        setLastUserResponse("")
        setCurrentQuestion(data.question)
      }
    } catch (error) {
      console.error("Failed to send message:", error)
      setCurrentQuestion("તે વિશે વધુ કહો.")
    }
    setIsLoading(false)
  }, [currentInput, isLoading, conversationHistory, currentQuestion, newChatButtonTrigger, showNewChatButton])

  const startBreathing = useCallback(() => {
    setShowBreathing(true)
    setBreathingPhaseProgress(0)
    setBreathingPhaseTimer(4)

    const phaseProgressInterval = setInterval(() => {
      setBreathingPhaseTimer((prev) => {
        if (prev <= 1) {
          setBreathingPhaseTimer(4)
          setBreathingPhaseProgress(0)
          return 4
        }
        return prev - 1
      })

      setBreathingPhaseProgress((prev) => {
        if (prev >= 100) {
          return 0
        }
        return prev + 100 / 4 // 25% per second for 4-second phases
      })
    }, 1000)

    const breathingInterval = setInterval(() => {
      setBreathingPhase((prev) => (prev === "inhale" ? "exhale" : "inhale"))
      setBreathingPhaseProgress(0)
      setBreathingPhaseTimer(4)
    }, 4000)

    const timerInterval = setInterval(() => {
      setBreathingTimer((prev) => {
        if (prev <= 1) {
          clearInterval(breathingInterval)
          clearInterval(timerInterval)
          clearInterval(phaseProgressInterval)
          setShowBreathing(false)
          setBreathingTimer(180)
          setBreathingPhaseProgress(0)
          setBreathingPhaseTimer(4)
          setIsPostBreathingMusic(true)
          setShowPeacefulMusic(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [])

  const startPeacefulMusic = useCallback(() => {
    cleanup() // Clear any existing intervals
    playAudio() // Start audio playback

    if (isPostBreathingMusic) {
      // For post-breathing music, just start the audio and let it loop
      // No timer needed as it should play indefinitely
      return
    }

    intervalRef.current = setInterval(() => {
      setMusicTimer((prev) => {
        if (prev <= 1) {
          cleanup()
          setMusicTimer(55)
          if (showInitialPeacefulMusic) {
            setShowInitialPeacefulMusic(false)
            setChatStarted(true)
            startSession()
          } else {
            setShowPeacefulMusic(false)
            setShowFeedback(true)
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [cleanup, playAudio, showInitialPeacefulMusic, startSession, isPostBreathingMusic])

  const handleMusicStart = useCallback(() => {
    if (!audioLoaded && !audioError) {
      playAudio()
    }
    startPeacefulMusic()
  }, [audioLoaded, audioError, playAudio, startPeacefulMusic])

  const skipToChat = useCallback(() => {
    cleanup() // Clear any existing intervals
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    setMusicTimer(55)
    setShowInitialPeacefulMusic(false)
    setChatStarted(true)
    startSession()
  }, [cleanup, startSession])

  const startInitialBreathing = useCallback(() => {
    const breathingInterval = setInterval(() => {
      setBreathingPhase((prev) => {
        if (prev === "exhale") {
          setBreathCount((count) => {
            const newCount = count + 1
            if (newCount >= maxBreaths) {
              clearInterval(breathingInterval)
              setTimeout(() => {
                setShowInitialBreathing(false)
                setShowInitialPeacefulMusic(true)
              }, 2000)
            }
            return newCount
          })
          return "inhale"
        }
        return "exhale"
      })
    }, 4000)
  }, [maxBreaths])

  useEffect(() => {
    if (showInitialBreathing) {
      startInitialBreathing()
    }
  }, [showInitialBreathing, startInitialBreathing])

  useEffect(() => {
    if (showPeacefulMusic) {
      startPeacefulMusic()
    }
  }, [showPeacefulMusic, startPeacefulMusic])

  useEffect(() => {
    return cleanup
  }, [cleanup])

  const submitFeedback = useCallback(async () => {
    if (!feedbackInput.trim()) return

    try {
      const deviceInfo = {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        timestamp: new Date().toISOString(),
        feedback: feedbackInput.trim(),
      }

      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(deviceInfo),
      })

      setFeedbackSubmitted(true)
    } catch (error) {
      console.error("Failed to submit feedback:", error)
      setFeedbackSubmitted(true)
    }
  }, [feedbackInput])

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }, [])

  const handleNewSession = useCallback(() => {
    cleanup() // Clean up before navigation
    router.push("/")
    setTimeout(() => {
      window.location.reload()
    }, 100)
  }, [cleanup, router])

  const handleCloseSession = useCallback(() => {
    cleanup() // Clean up intervals
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    setSessionEnded(true)
    setCurrentQuestion("શું તમે વધારાના આરામ માટે 3 મિનિટનું શ્વાસ સત્ર ઈચ્છો છો?")
  }, [cleanup])

  const handleTextareaKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault()
        sendMessage()
      }
    },
    [sendMessage],
  )

  const handleFeedbackKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault()
        submitFeedback()
      }
    },
    [submitFeedback],
  )

  const gradientStyle = useMemo(
    () => ({
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    }),
    [],
  )

  const breathProgressWidth = useMemo(() => `${(breathCount / maxBreaths) * 100}%`, [breathCount, maxBreaths])
  const breathingProgressWidth = useMemo(() => `${breathingPhaseProgress}%`, [breathingPhaseProgress])

  if (showInitialBreathing) {
    return (
      <main
        className="absolute inset-0 z-20 flex items-center justify-center p-4 min-h-screen w-full overflow-hidden touch-action-manipulation"
        style={gradientStyle}
      >
        <div className="text-center text-white w-full max-w-md">
          {" "}
          {/* Added w-full and max-w-md for better responsiveness */}
          <div className="mb-6 sm:mb-8">
            <div className="w-48 sm:w-64 h-2 bg-white/20 rounded-full mx-auto mb-4">
              <div
                className="h-full bg-white/60 rounded-full transition-all duration-500"
                style={{ width: breathProgressWidth }}
              />
            </div>
            <p className="text-white/70 text-sm">
              {breathCount}/{maxBreaths} શ્વાસ પૂર્ણ
            </p>
          </div>
          <div
            className={`w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 mx-auto mb-6 sm:mb-8 rounded-full border-2 border-white/40 transition-all duration-[4000ms] ease-in-out will-change-transform ${
              breathingPhase === "inhale" ? "scale-125 bg-white/20 shadow-lg shadow-white/20" : "scale-100 bg-white/10"
            }`}
          />
          <p className="text-xl sm:text-2xl md:text-3xl font-light mb-4 text-balance">
            {breathingPhase === "inhale" ? "શ્વાસ અંદર લો" : "શ્વાસ બહાર કાઢો"}
          </p>
          {breathCount >= maxBreaths && (
            <p className="text-white/80 text-base sm:text-lg animate-fade-in">શાબાશ! આગળ વધી રહ્યા છીએ...</p>
          )}
        </div>
      </main>
    )
  }

  if (showInitialPeacefulMusic) {
    return (
      <main className="absolute inset-0 z-20 flex items-center justify-center p-4 min-h-screen w-full overflow-hidden touch-action-manipulation">
        <div className="text-center text-white w-full max-w-xs sm:max-w-2xl mx-auto">
          {" "}
          {/* Removed px-4 sm:px-8 as p-4 on main handles it */}
          <div className="mb-4 sm:mb-6 md:mb-8">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-light text-white mb-3 sm:mb-4 md:mb-6 leading-relaxed text-balance">
              શાંત સંગીત કેમ જરૂરી છે?
            </h2>
            <p className="text-white/80 text-sm sm:text-base md:text-lg leading-relaxed mb-4 sm:mb-6 md:mb-8 text-balance">
              શાંત સંગીત તમારા મનને આરામ આપે છે, તણાવ ઘટાડે છે અને આંતરિક શાંતિ લાવે છે. આ 55 સેકન્ડ માટે આ શાંતિપૂર્ણ સંગીત સાંભળો અને તમારા
              મનને સ્થિર કરો.
            </p>
          </div>
          <div className="mb-3 sm:mb-4 md:mb-6">
            <audio
              ref={audioRef}
              controls
              preload="auto"
              className="w-full max-w-xs sm:max-w-sm md:max-w-md mx-auto rounded-lg shadow-lg"
              onLoadedData={() => setAudioLoaded(true)}
              onError={() => setAudioError(true)}
              onCanPlayThrough={() => setAudioLoaded(true)}
            >
              <source
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/peaceful-music-rWO7ahVZVbnxCzswIEZ85iGFsa47NK.mp3"
                type="audio/mpeg"
              />
              તમારું બ્રાઉઝર ઓડિયો સપોર્ટ કરતું નથી.
            </audio>
          </div>
          {!audioLoaded && !audioError && (
            <button
              onClick={handleMusicStart}
              className="mb-3 sm:mb-4 px-4 sm:px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all duration-200 backdrop-blur-sm border border-white/20 text-sm sm:text-base"
            >
              સંગીત શરૂ કરો
            </button>
          )}
          {audioError && (
            <p className="text-red-400 text-xs sm:text-sm mb-3 sm:mb-4">
              ઓડિયો લોડ કરવામાં સમસ્યા. કૃપા કરીને પેજ રિફ્રેશ કરો.
            </p>
          )}
          <div className="space-y-2">
            <button
              onClick={skipToChat}
              className="px-4 sm:px-6 md:px-8 py-2 sm:py-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all duration-200 backdrop-blur-sm border border-white/20 text-sm sm:text-base"
            >
              આગળ વધો
            </button>
            <p className="text-white/60 text-xs sm:text-sm">શાંત સંગીત સાંભળો અને આરામ કરો</p>
          </div>
        </div>
      </main>
    )
  }
  if (showBreathing) {
    return (
      <main className="absolute inset-0 z-20 flex items-center justify-center p-4 min-h-screen w-full overflow-hidden touch-action-manipulation">
        <div className="text-center text-white w-full max-w-md">
          {" "}
          {/* Added w-full and max-w-md for better responsiveness */}
          <div className="mb-6 sm:mb-8">
            <p className="text-yellow-300 text-sm sm:text-base font-medium">{breathingPhaseTimer} સેકન્ડ બાકી</p>
          </div>
          <div
            className={`w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 mx-auto mb-4 sm:mb-6 md:mb-8 rounded-full border-2 border-white/30 transition-all ease-in-out will-change-transform ${
              breathingPhase === "inhale"
                ? "scale-150 bg-white/10 duration-[4000ms]"
                : breathingPhase === "exhale"
                  ? "scale-100 bg-white/5 duration-[6000ms]"
                  : "scale-100 bg-white/0 duration-[4000ms]"
            }`}
          />
          <p className="text-lg sm:text-xl md:text-2xl font-light mb-2 text-balance">
            {breathingPhase === "inhale" ? "શ્વાસ અંદર લો" : breathingPhase === "exhale" ? "શ્વાસ બહાર કાઢો" : "રોકો"}
          </p>
          <p className="text-white/70 text-sm">{formatTime(breathingTimer)} બાકી</p>
        </div>
      </main>
    )
  }

  if (showPeacefulMusic) {
    return (
      <main className="absolute inset-0 z-20 flex items-center justify-center p-4 min-h-screen w-full overflow-hidden touch-action-manipulation">
        <div className="text-center text-white w-full max-w-xs sm:max-w-2xl mx-auto">
          {" "}
          {/* Removed px-4 sm:px-8 as p-4 on main handles it */}
          <div className="mb-4 sm:mb-6 md:mb-8">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-light text-white mb-3 sm:mb-4 md:mb-6 leading-relaxed text-balance">
              શાંત સંગીત કેમ જરૂરી છે?
            </h2>
            <p className="text-white/80 text-sm sm:text-base md:text-lg leading-relaxed mb-4 sm:mb-6 md:mb-8 text-balance">
              શાંત સંગીત તમારા મનને આરામ આપે છે, તણાવ ઘટાડે છે અને આંતરિક શાંતિ લાવે છે. આ 55 સેકન્ડ માટે આ શાંતિપૂર્ણ સંગીત સાંભળો અને તમારા
              મનને સ્થિર કરો.
            </p>
          </div>
          <div className="mb-3 sm:mb-4 md:mb-6">
            <audio
              ref={audioRef}
              controls
              preload="auto"
              className="w-full max-w-xs sm:max-w-sm md:max-w-md mx-auto rounded-lg shadow-lg"
              onLoadedData={() => setAudioLoaded(true)}
              onError={() => setAudioError(true)}
            >
              <source
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/peaceful-music-rWO7ahVZVbnxCzswIEZ85iGFsa47NK.mp3"
                type="audio/mpeg"
              />
              તમારું બ્રાઉઝર ઓડિયો સપોર્ટ કરતું નથી.
            </audio>
          </div>
          {isPostBreathingMusic ? (
            <div>
              <p className="text-white/70 text-sm mb-2 sm:mb-4">શાંત સંગીત ચાલુ છે...</p>
              <p className="text-white/60 text-xs sm:text-sm">આરામ કરો અને સંગીત સાંભળો</p>
              <button
                onClick={() => {
                  if (audioRef.current) {
                    audioRef.current.pause()
                    audioRef.current.currentTime = 0
                  }
                  setShowPeacefulMusic(false)
                  setShowFeedback(true)
                }}
                className="mt-4 px-4 sm:px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all duration-200 backdrop-blur-sm border border-white/20 text-sm sm:text-base"
              >
                પ્રતિસાદ પર જાઓ
              </button>
            </div>
          ) : (
            <div>
              <p className="text-white/70 text-sm mb-2 sm:mb-4">{musicTimer} સેકન્ડ બાકી</p>
              <p className="text-white/60 text-xs sm:text-sm">શાંત સંગીત સાંભળો અને આરામ કરો</p>
            </div>
          )}
        </div>
      </main>
    )
  }

  if (!chatStarted) {
    return null
  }

  return (
    <main className="absolute inset-0 z-20 flex items-center justify-center p-4 min-h-screen w-full overflow-hidden touch-action-manipulation">
      <div className="w-full max-w-xs sm:max-w-2xl">
        <div className="mb-4 sm:mb-6 md:mb-8 space-y-3 sm:space-y-4 md:space-y-6 text-center">
          {lastUserResponse && (
            <p className="text-white/60 text-xs sm:text-sm mb-3 sm:mb-4 italic text-balance">"{lastUserResponse}"</p>
          )}
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-light text-white mb-4 sm:mb-6 md:mb-8 leading-relaxed text-balance">
            {currentQuestion}
          </h2>
        </div>

        {showNewChatButton && !sessionEnded && (
          <div className="fixed top-4 right-4 z-30">
            <div className="flex flex-col gap-2">
              <button
                onClick={handleNewSession}
                className="px-2 py-1 bg-white/10 hover:bg-white/20 text-white rounded text-xs border border-white/20 backdrop-blur-sm transition-all duration-200"
              >
                New Chat Session
              </button>
              <button
                onClick={handleCloseSession}
                className="px-2 py-1 bg-red-500/20 hover:bg-red-500/30 text-white rounded text-xs border border-red-300/20 backdrop-blur-sm transition-all duration-200"
              >
                Close Session
              </button>
            </div>
          </div>
        )}

        {!sessionEnded && (
          <div className="text-center">
            <Textarea
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              placeholder="તમારા વિચારો શેર કરો..."
              className="w-full max-w-xs sm:max-w-lg mx-auto mb-4 sm:mb-6 bg-white/5 border-white/20 text-white placeholder:text-white/40 text-center resize-none min-h-[80px] sm:min-h-[100px] md:min-h-[120px] text-sm sm:text-base md:text-lg leading-relaxed backdrop-blur-sm"
              onKeyDown={handleTextareaKeyDown}
              disabled={isLoading}
            />
          </div>
        )}

        {sessionEnded && !showFeedback && (
          <div className="text-center space-y-3 sm:space-y-4">
            <button
              onClick={startBreathing}
              className="px-4 sm:px-6 md:px-8 py-2 sm:py-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all duration-200 backdrop-blur-sm border border-white/20 text-sm sm:text-base"
            >
              શ્વાસ સત્ર શરૂ કરો
            </button>
            <button
              onClick={() => setShowFeedback(true)}
              className="block mx-auto px-4 sm:px-6 md:px-8 py-2 sm:py-3 bg-transparent hover:bg-white/10 text-white/80 hover:text-white rounded-full transition-all duration-200 text-xs sm:text-sm"
            >
              પ્રતિસાદ પર જાઓ
            </button>
          </div>
        )}

        {showFeedback && !feedbackSubmitted && (
          <div className="text-center space-y-3 sm:space-y-4 md:space-y-6">
            <h3 className="text-lg sm:text-xl md:text-2xl font-light text-white mb-3 sm:mb-4 text-balance">
              તમારો અનુભવ કેવો રહ્યો?
            </h3>
            <Textarea
              value={feedbackInput}
              onChange={(e) => setFeedbackInput(e.target.value)}
              placeholder="આ સત્ર વિશે તમારા વિચારો શેર કરો..."
              className="w-full max-w-xs sm:max-w-lg mx-auto mb-3 sm:mb-4 md:mb-6 bg-white/5 border-white/20 text-white placeholder:text-white/40 text-center resize-none min-h-[80px] sm:min-h-[100px] md:min-h-[120px] text-sm sm:text-base md:text-lg leading-relaxed backdrop-blur-sm"
              onKeyDown={handleFeedbackKeyDown}
            />
            <button
              onClick={submitFeedback}
              className="px-4 sm:px-6 md:px-8 py-2 sm:py-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all duration-200 backdrop-blur-sm border border-white/20 text-sm sm:text-base"
            >
              પ્રતિસાદ મોકલો
            </button>
          </div>
        )}

        {feedbackSubmitted && (
          <div className="text-center space-y-3 sm:space-y-4 md:space-y-6">
            <h3 className="text-lg sm:text-xl md:text-2xl font-light text-white mb-3 sm:mb-4 text-balance">
              તમારો પ્રતિસાદ માટે આભાર!
            </h3>
            <p className="text-white/70 mb-3 sm:mb-4 md:mb-6 text-xs sm:text-sm md:text-base text-balance">
              તમારો અનુભવ અમને સુધારવામાં મદદ કરે છે.
            </p>
            <button
              onClick={handleNewSession}
              className="px-4 sm:px-6 md:px-8 py-2 sm:py-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all duration-200 backdrop-blur-sm border border-white/20 text-sm sm:text-base"
            >
              નવું સત્ર શરૂ કરો
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
