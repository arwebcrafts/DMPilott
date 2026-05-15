import Link from 'next/link'

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-[#f0f0f5]">
      {/* Decorative background orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-96 h-96 bg-[#8134AF]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-40 left-20 w-80 h-80 bg-[#F58529]/8 rounded-full blur-3xl" />
      </div>

      {/* Navigation */}
      <nav className="glass-card-static py-4 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="gradient-text text-2xl font-bold">DMPilot</Link>
          <Link href="/" className="text-sm text-[#8a8a9a] hover:text-white transition-colors">← Back to Home</Link>
        </div>
      </nav>

      <div className="relative max-w-4xl mx-auto px-6 py-16">
        <h1 className="text-4xl lg:text-5xl font-bold mb-3 gradient-text">Terms of Service</h1>
        <p className="text-sm text-[#8a8a9a] mb-12">Last updated: April 15, 2026</p>

        <div className="space-y-8">
          <section className="glass-card rounded-2xl p-8">
            <h2 className="text-xl font-semibold mb-4 text-white">1. Acceptance of Terms</h2>
            <p className="text-[#8a8a9a]">By using DMPilot, you agree to these terms. If you do not agree, do not use our service.</p>
          </section>

          <section className="glass-card rounded-2xl p-8">
            <h2 className="text-xl font-semibold mb-4 text-white">2. Service Description</h2>
            <p className="text-[#8a8a9a]">DMPilot provides automated messaging automation for Instagram and Facebook Business accounts. Our service uses Meta&apos;s official Graph API to send direct messages on your behalf.</p>
          </section>

          <section className="glass-card rounded-2xl p-8">
            <h2 className="text-xl font-semibold mb-4 text-white">3. User Responsibilities</h2>
            <ul className="space-y-3 text-[#8a8a9a]">
              <li className="flex items-start gap-3">
                <span className="text-[#22c55e] mt-1 flex-shrink-0">•</span>
                You must have a valid Instagram Business/Creator account or Facebook Page to use our service
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#22c55e] mt-1 flex-shrink-0">•</span>
                You are responsible for the content of messages sent through DMPilot
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#22c55e] mt-1 flex-shrink-0">•</span>
                You must comply with Meta&apos;s community guidelines and terms of service
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#22c55e] mt-1 flex-shrink-0">•</span>
                You are responsible for maintaining the security of your connected accounts
              </li>
            </ul>
          </section>

          <section className="glass-card rounded-2xl p-8">
            <h2 className="text-xl font-semibold mb-4 text-white">4. Prohibited Use</h2>
            <p className="text-[#8a8a9a] mb-4">You may not use DMPilot to:</p>
            <ul className="space-y-3 text-[#8a8a9a]">
              <li className="flex items-start gap-3">
                <span className="text-[#ef4444] mt-1 flex-shrink-0">✕</span>
                Send spam or unsolicited messages
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#ef4444] mt-1 flex-shrink-0">✕</span>
                Harass or target individuals without consent
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#ef4444] mt-1 flex-shrink-0">✕</span>
                Violate any laws or regulations
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#ef4444] mt-1 flex-shrink-0">✕</span>
                Send content that violates Meta&apos;s policies
              </li>
            </ul>
          </section>

          <section className="glass-card rounded-2xl p-8">
            <h2 className="text-xl font-semibold mb-4 text-white">5. Payment Terms</h2>
            <p className="text-[#8a8a9a]">Paid plans are billed monthly or yearly. You can cancel anytime. No refunds for partial periods.</p>
          </section>

          <section className="glass-card rounded-2xl p-8">
            <h2 className="text-xl font-semibold mb-4 text-white">6. Limitation of Liability</h2>
            <p className="text-[#8a8a9a]">DMPilot is not responsible for any actions taken by Meta against your account, message deliverability issues, or any indirect damages arising from use of our service.</p>
          </section>

          <section className="glass-card rounded-2xl p-8">
            <h2 className="text-xl font-semibold mb-4 text-white">7. Contact</h2>
            <p className="text-[#8a8a9a]">For questions, contact us at: <a href="mailto:arwebcrafts@gmail.com" className="text-[#DD2A7B] hover:underline font-semibold">arwebcrafts@gmail.com</a></p>
          </section>
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-[#22223a] text-center text-sm text-[#5a5a6e]">
          © 2026 DMPilot. All rights reserved.
        </div>
      </div>
    </div>
  )
}
