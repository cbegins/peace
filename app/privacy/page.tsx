import Header from "@/components/header"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white text-black flex flex-col">
      <Header />

      <main className="flex-1 px-6 py-16">
        <div className="w-full max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-light mb-12 text-center tracking-tight">
            Privacy Policy
          </h1>

          <div className="space-y-12">
            <section className="border-b border-neutral-200 pb-8">
              <h2 className="text-xl font-medium mb-4">Your Privacy Matters</h2>
              <p className="text-neutral-700 leading-relaxed">
                At <span className="font-semibold">Peace</span>, we understand that your
                conversations are deeply personal. We are committed to protecting your
                privacy and ensuring your therapeutic sessions remain confidential.
              </p>
            </section>

            <section className="border-b border-neutral-200 pb-8">
              <h2 className="text-xl font-medium mb-4">Data Collection</h2>
              <p className="text-neutral-700 mb-4">
                We collect minimal information to provide our service:
              </p>
              <ul className="list-disc list-inside space-y-2 text-neutral-700">
                <li>Conversation messages during your therapy session</li>
                <li>Basic usage analytics to improve our service</li>
                <li>No personal identification information is required or stored</li>
              </ul>
            </section>

            <section className="border-b border-neutral-200 pb-8">
              <h2 className="text-xl font-medium mb-4">Data Security</h2>
              <p className="text-neutral-700 mb-4">
                Your conversations are protected through:
              </p>
              <ul className="list-disc list-inside space-y-2 text-neutral-700">
                <li>Encrypted transmission of all data</li>
                <li>No permanent storage of conversation content</li>
                <li>Sessions are cleared when you start a new session</li>
                <li>No sharing of personal information with third parties</li>
              </ul>
            </section>

            <section className="border-b border-neutral-200 pb-8">
              <h2 className="text-xl font-medium mb-4">Your Rights</h2>
              <p className="text-neutral-700 leading-relaxed">
                You have complete control over your data. Each session is independent,
                and no conversation history is maintained between sessions. You can end
                any session at any time, and all data from that session is immediately
                cleared.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-medium mb-4">Contact</h2>
              <p className="text-neutral-700 leading-relaxed">
                If you have any questions about this privacy policy or how we handle your
                data, please feel free to reach out to us through our support channels.
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}
