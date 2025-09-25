"use client"

import { useState, useEffect } from "react"

interface LoadingExperienceProps {
  onComplete: () => void
}

export default function LoadingExperience({ onComplete }: LoadingExperienceProps) {
  const [phase, setPhase] = useState<"instruction" | "breathing" | "complete">("instruction")
  const [breathingPhase, setBreathingPhase] = useState<"in" | "hold" | "out">("in")
  const [breathingCycle, setBreathingCycle] = useState(0)
  const [voicesLoaded, setVoicesLoaded] = useState(false)

  const speak = (text: string) => {
    console.log("Attempting to speak:", text)

    if (!("speechSynthesis" in window)) {
      console.log("Speech synthesis not supported")
      return
    }

    // Cancel any ongoing speech
    speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    const voices = speechSynthesis.getVoices()

    console.log("Available voices:", voices.length)

    // Look for Gujarati voices first, then fallback to Hindi or English
    const preferredVoice =
      voices.find((voice) => voice.lang.includes("gu")) || // Gujarati
      voices.find((voice) => voice.lang.includes("hi")) || // Hindi as fallback
      voices.find((voice) => voice.lang.includes("en") && voice.localService) ||
      voices[0]

    if (preferredVoice) {
      console.log("Using voice:", preferredVoice.name, preferredVoice.lang)
      utterance.voice = preferredVoice
      utterance.lang = preferredVoice.lang
    } else {
      console.log("No preferred voice found, using default with gu-IN")
      utterance.lang = "gu-IN"
    }

    // More natural speech settings
    utterance.rate = 0.8
    utterance.pitch = 0.9
    utterance.volume = 1.0

    utterance.onstart = () => console.log("Speech started")
    utterance.onend = () => console.log("Speech ended")
    utterance.onerror = (e) => console.log("Speech error:", e)

    // Small delay to ensure proper speech synthesis
    setTimeout(() => {
      speechSynthesis.speak(utterance)
    }, 100)
  }

  useEffect(() => {
    const loadVoices = () => {
      const voices = speechSynthesis.getVoices()
      console.log("Voices loaded:", voices.length)

      if (voices.length > 0) {
        setVoicesLoaded(true)
        speechSynthesis.removeEventListener("voiceschanged", loadVoices)

        // Start initial instruction
        setTimeout(() => {
          speak("અમારી સાથે શ્વાસ લેવા માટે એક ક્ષણ લો")
        }, 500)
      }
    }

    // Load voices immediately if available
    if (speechSynthesis.getVoices().length > 0) {
      loadVoices()
    } else {
      // Wait for voices to load
      speechSynthesis.addEventListener("voiceschanged", loadVoices)
    }

    // Show instruction for 4 seconds to allow voice to complete
    const instructionTimer = setTimeout(() => {
      setPhase("breathing")
      startBreathingCycle()
    }, 4000)

    return () => {
      clearTimeout(instructionTimer)
      speechSynthesis.removeEventListener("voiceschanged", loadVoices)
      speechSynthesis.cancel()
    }
  }, [])

  const startBreathingCycle = () => {
    let currentCycle = 0
    const totalCycles = 3

    const runCycle = () => {
      if (currentCycle >= totalCycles) {
        setPhase("complete")
        speak("હવે તમે તમારી આંખો ખોલી શકો છો. પીસમાં આપનું સ્વાગત છે.")
        setTimeout(onComplete, 3000) // 3 seconds for voice to complete
        return
      }

      // Breathe in (5 seconds)
      setBreathingPhase("in")
      setTimeout(() => speak("ધીરે ધીરે શ્વાસ અંદર લો"), 150)

      setTimeout(() => {
        // Hold (3 seconds)
        setBreathingPhase("hold")
        setTimeout(() => speak("રોકો"), 200)

        setTimeout(() => {
          // Breathe out (5 seconds)
          setBreathingPhase("out")
          setTimeout(() => speak("ધીરે ધીરે શ્વાસ બહાર કાઢો"), 150)

          setTimeout(() => {
            currentCycle++
            setBreathingCycle(currentCycle)
            runCycle()
          }, 5000)
        }, 3000)
      }, 5000)
    }

    runCycle()
  }

  const getBreathingText = () => {
    switch (breathingPhase) {
      case "in":
        return "શ્વાસ અંદર લો..."
      case "hold":
        return "રોકો..."
      case "out":
        return "શ્વાસ બહાર કાઢો..."
    }
  }

  const getBreathingScale = () => {
    switch (breathingPhase) {
      case "in":
        return "scale-110"
      case "hold":
        return "scale-110"
      case "out":
        return "scale-90"
    }
  }

  if (phase === "complete") {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
        <div className="text-center">
          <div className="w-32 h-32 rounded-full bg-gradient-to-r from-violet-500 to-purple-600 mx-auto mb-8 animate-pulse" />
          <p className="text-black text-3xl font-light font-instrument">Peace માં આપનું સ્વાગત છે</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
      <div className="text-center max-w-md px-6">
        {phase === "instruction" ? (
          <div className="animate-fade-in">
            <div className="w-24 h-24 rounded-full bg-gradient-to-r from-violet-500 to-purple-600 mx-auto mb-8 animate-pulse" />
            <h1 className="text-black/30 text-2xl font-light mb-4 font-instrument">અમારી સાથે શ્વાસ લેવા માટે એક ક્ષણ લો</h1>
          </div>
        ) : (
          <div className="animate-fade-in">
            <div
              className={`w-32 h-32 rounded-full bg-gradient-to-r from-violet-500 to-purple-600 mx-auto mb-8 transition-transform duration-1000 ease-in-out ${getBreathingScale()}`}
            />
            <h2 className="text-black/60 text-3xl font-light mb-2 font-instrument transition-all duration-500">
              {getBreathingText()}
            </h2>
            <div className="flex justify-center space-x-2 mt-6">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                    i < breathingCycle ? "bg-violet-500/30" : "bg-gray-600/30"
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
