"use client"

export default function HeroContent() {
  return (
    <main className="absolute bottom-8 left-8 z-20 max-w-lg">
      <div className="text-left">
        <div
          className="inline-flex items-center px-3 py-1 rounded-full bg-white/5 backdrop-blur-sm mb-4 relative"
          style={{
            filter: "url(#glass-effect)",
          }}
        >
          <div className="absolute top-0 left-1 right-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-full" />
          <span className="text-white/90 text-xs font-light relative z-10">✨ નવો પેપર શેડર્સ અનુભવ</span>
        </div>

        {/* Main Heading */}
        <h1 className="text-5xl md:text-6xl md:leading-16 tracking-tight font-light text-white mb-4">
          <span className="font-medium italic instrument">સુંદર</span> શેડર
          <br />
          <span className="font-light tracking-tight text-white">અનુભવો</span>
        </h1>

        {/* Description */}
        <p className="text-xs font-light text-white/70 mb-4 leading-relaxed">
          અમારી અદ્યતન શેડર ટેકનોલોજી સાથે અદ્ભુત દ્રશ્ય અનુભવો બનાવો. ઇન્ટરેક્ટિવ લાઇટિંગ, સરળ એનિમેશન અને સુંદર ઇફેક્ટ્સ જે તમારી દરેક
          હિલચાલને પ્રતિસાદ આપે છે.
        </p>
      </div>
    </main>
  )
}
