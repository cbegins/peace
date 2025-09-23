import Header from "@/components/header"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white text-black flex flex-col">
      <Header />

      <main className="flex-1 px-6 py-16">
        <div className="w-full max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-light mb-12 tracking-tight">
            About Peace
          </h1>

          <div className="space-y-12 text-left">
            <section className="border-b border-neutral-200 pb-8">
              <h2 className="text-xl font-medium mb-4">Who We Are</h2>
              <p className="text-neutral-700 leading-relaxed">
                Peace is a digital space built to provide calm, thoughtful, and
                supportive conversations powered by AI. Our goal is to help you
                pause, reflect, and find clarity in moments when life feels
                overwhelming.
              </p>
            </section>

            <section className="border-b border-neutral-200 pb-8">
              <h2 className="text-xl font-medium mb-4">What We Believe</h2>
              <p className="text-neutral-700 leading-relaxed">
                We believe emotional support should be accessible to everyone —
                immediate, private, and judgment-free. Technology should not
                replace human connection, but it can create a safe space for
                self-expression and reflection whenever you need it.
              </p>
            </section>

            <section className="border-b border-neutral-200 pb-8">
              <h2 className="text-xl font-medium mb-4">How Peace Helps</h2>
              <ul className="list-disc list-inside space-y-2 text-neutral-700 leading-relaxed">
                <li>Offering a calm, distraction-free space to talk</li>
                <li>Providing thoughtful responses and perspectives</li>
                <li>Encouraging reflection and self-awareness</li>
                <li>Respecting your privacy and independence</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-medium mb-4">Our Mission</h2>
              <p className="text-neutral-700 leading-relaxed">
                To create a trusted companion for moments of stress, reflection,
                and growth — helping people move through challenges with greater
                peace, balance, and understanding.
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}
