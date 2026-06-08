import Link from 'next/link'

export default function TermsOfService() {
  return (
    <div className="min-h-screen text-gray-900 dark:text-gray-100" style={{ background: 'var(--background)' }}>
      {/* Navigation */}
      <nav className="border-b py-4 sticky top-0 z-50" style={{ background: 'var(--surface-0)', borderColor: 'var(--surface-3)' }}>
        <div className="max-w-4xl mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="gradient-text text-2xl font-bold">DMPilot</Link>
          <Link href="/" className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">← Back to Home</Link>
        </div>
      </nav>

      <div className="relative max-w-4xl mx-auto px-6 py-16">
        <h1 className="text-4xl lg:text-5xl font-bold mb-3 gradient-text">Terms of Service</h1>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-12">Last updated: April 15, 2026</p>

        <div className="space-y-8">
          <section className="rounded-2xl p-8 border shadow-sm" style={{ background: 'var(--surface-0)', borderColor: 'var(--surface-3)' }}>
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">1. Acceptance of Terms</h2>
            <p className="text-gray-600 dark:text-gray-300">By using DMPilot, you agree to these terms. If you do not agree, do not use our service.</p>
          </section>

          <section className="rounded-2xl p-8 border shadow-sm" style={{ background: 'var(--surface-0)', borderColor: 'var(--surface-3)' }}>
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">2. Service Description</h2>
            <p className="text-gray-600 dark:text-gray-300">DMPilot provides automated messaging automation for Instagram and Facebook Business accounts. Our service uses Meta&apos;s official Graph API to send direct messages on your behalf.</p>
          </section>

          <section className="rounded-2xl p-8 border shadow-sm" style={{ background: 'var(--surface-0)', borderColor: 'var(--surface-3)' }}>
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">3. User Responsibilities</h2>
            <ul className="space-y-3 text-gray-600 dark:text-gray-300">
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

          <section className="rounded-2xl p-8 border shadow-sm" style={{ background: 'var(--surface-0)', borderColor: 'var(--surface-3)' }}>
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">4. Prohibited Use</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">You may not use DMPilot to:</p>
            <ul className="space-y-3 text-gray-600 dark:text-gray-300">
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

          <section className="rounded-2xl p-8 border shadow-sm" style={{ background: 'var(--surface-0)', borderColor: 'var(--surface-3)' }}>
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">5. Payment Terms</h2>
            <p className="text-gray-600 dark:text-gray-300">Paid plans are billed monthly or yearly. You can cancel anytime. No refunds for partial periods.</p>
          </section>

          <section className="rounded-2xl p-8 border shadow-sm" style={{ background: 'var(--surface-0)', borderColor: 'var(--surface-3)' }}>
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">6. Limitation of Liability</h2>
            <p className="text-gray-600 dark:text-gray-300">DMPilot is not responsible for any actions taken by Meta against your account, message deliverability issues, or any indirect damages arising from use of our service.</p>
          </section>

          <section className="rounded-2xl p-8 border shadow-sm" style={{ background: 'var(--surface-0)', borderColor: 'var(--surface-3)' }}>
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">7. Contact</h2>
            <p className="text-gray-600 dark:text-gray-300">For questions, contact us at: <a href="mailto:arwebcrafts@gmail.com" className="text-[#DD2A7B] hover:underline font-semibold">arwebcrafts@gmail.com</a></p>
          </section>
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 text-center text-sm text-gray-400 dark:text-gray-500" style={{ borderTop: '1px solid var(--surface-3)' }}>
          © 2026 DMPilot. All rights reserved.
        </div>
      </div>
    </div>
  )
}
