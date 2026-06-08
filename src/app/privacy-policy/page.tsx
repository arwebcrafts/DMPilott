import Link from 'next/link'

export default function PrivacyPolicy() {
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
        <h1 className="text-4xl lg:text-5xl font-bold mb-3 gradient-text">Privacy Policy</h1>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-12">Last updated: April 15, 2026</p>

        <div className="space-y-8">
          <section className="rounded-2xl p-8 border shadow-sm" style={{ background: 'var(--surface-0)', borderColor: 'var(--surface-3)' }}>
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">1. Information We Collect</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">DMPilot collects information you provide directly, including:</p>
            <ul className="space-y-3 text-gray-600 dark:text-gray-300">
              <li className="flex items-start gap-3">
                <span className="text-[#22c55e] mt-1 flex-shrink-0">•</span>
                Account information (email, name) when you sign up via Supabase Auth
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#22c55e] mt-1 flex-shrink-0">•</span>
                Meta API access tokens when you connect your Instagram or Facebook account
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#22c55e] mt-1 flex-shrink-0">•</span>
                Instagram/Facebook page data (username, profile picture, follower count)
              </li>
            </ul>
          </section>

          <section className="rounded-2xl p-8 border shadow-sm" style={{ background: 'var(--surface-0)', borderColor: 'var(--surface-3)' }}>
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">2. How We Use Your Information</h2>
            <ul className="space-y-3 text-gray-600 dark:text-gray-300">
              <li className="flex items-start gap-3">
                <span className="text-[#22c55e] mt-1 flex-shrink-0">•</span>
                To authenticate and manage your connected Meta accounts
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#22c55e] mt-1 flex-shrink-0">•</span>
                To send automated DMs on your behalf via Meta&apos;s official Graph API
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#22c55e] mt-1 flex-shrink-0">•</span>
                To display your account statistics in the dashboard
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#22c55e] mt-1 flex-shrink-0">•</span>
                To improve our service and communicate with you
              </li>
            </ul>
          </section>

          <section className="rounded-2xl p-8 border shadow-sm" style={{ background: 'var(--surface-0)', borderColor: 'var(--surface-3)' }}>
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">3. Data Storage and Security</h2>
            <p className="text-gray-600 dark:text-gray-300">Access tokens are encrypted using AES-256 before storage. We use Supabase as our database provider and implement industry-standard security measures. Your tokens are stored securely and never shared with third parties.</p>
          </section>

          <section className="rounded-2xl p-8 border shadow-sm" style={{ background: 'var(--surface-0)', borderColor: 'var(--surface-3)' }}>
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">4. Meta API Compliance</h2>
            <p className="text-gray-600 dark:text-gray-300">DMPilot uses Meta&apos;s official Graph API to send messages. We comply with Meta&apos;s Platform Terms and Data Use Policy. All messaging operations are performed on your behalf using your authorized access tokens.</p>
          </section>

          <section className="rounded-2xl p-8 border shadow-sm" style={{ background: 'var(--surface-0)', borderColor: 'var(--surface-3)' }}>
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">5. Your Rights</h2>
            <p className="text-gray-600 dark:text-gray-300">You can disconnect your Meta accounts at any time through the dashboard. You can request deletion of your account data by contacting us at <a href="mailto:arwebcrafts@gmail.com" className="text-[#DD2A7B] hover:underline">arwebcrafts@gmail.com</a>.</p>
          </section>

          <section className="rounded-2xl p-8 border shadow-sm" style={{ background: 'var(--surface-0)', borderColor: 'var(--surface-3)' }}>
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">6. Contact</h2>
            <p className="text-gray-600 dark:text-gray-300">For privacy concerns, contact us at: <a href="mailto:arwebcrafts@gmail.com" className="text-[#DD2A7B] hover:underline font-semibold">arwebcrafts@gmail.com</a></p>
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
