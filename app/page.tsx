"use client"

import { useState } from "react"
import Header from "@/components/header"
import TherapySession from "@/components/therapy-session"
import ShaderBackground from "@/components/shader-background"
import LoadingExperience from "@/components/loading-experience"

export default function TherapyApp() {
  const [showLoading, setShowLoading] = useState(true)

  const handleLoadingComplete = () => {
    setShowLoading(false)
  }

  return (
    <>
      {showLoading && <LoadingExperience onComplete={handleLoadingComplete} />}
      <div className={`transition-opacity duration-1000 ${showLoading ? "opacity-0" : "opacity-100"}`}>
        <ShaderBackground>
          <Header />
          <TherapySession />
        </ShaderBackground>
      </div>
    </>
  )
}
