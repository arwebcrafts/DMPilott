import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Data Deletion Instructions — DMPilot',
  description:
    'How to delete your DMPilot account and every piece of Instagram or Facebook data we hold about you.',
}

const SUPPORT_EMAIL = 'arwebcrafts@gmail.com'

export default function DataDeletion() {
  return (
    <div className="min-h-screen text-gray-900 dark:text-gray-100" style={{ background: 'var(--background)' }}>
      <nav className="border-b py-4 sticky top-0 z-50" style={{ background: 'var(--surface-0)', borderColor: 'var(--surface-3)' }}>
        <div className="max-w-4xl mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="gradient-text text-2xl font-bold">DMPilot</Link>
          <Link href="/" className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">← Back to Home</Link>
        </div>
      </nav>

      <div className="relative max-w-4xl mx-auto px-6 py-16">
        <h1 className="text-4xl lg:text-5xl font-bold mb-3 gradient-text">Data Deletion Instructions</h1>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-12">Last updated: July 29, 2026</p>

        <div className="space-y-8">
          <section className="rounded-2xl p-8 border shadow-sm" style={{ background: 'var(--surface-0)', borderColor: 'var(--surface-3)' }}>
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Option 1 — Disconnect a single account</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              To remove one Instagram or Facebook account while keeping your DMPilot account:
            </p>
            <ol className="space-y-3 text-gray-600 dark:text-gray-300 list-decimal list-inside">
              <li>Sign in to DMPilot and open <strong>Dashboard → Accounts</strong>.</li>
              <li>Find the account you want removed and click <strong>Disconnect</strong>.</li>
            </ol>
            <p className="text-gray-600 dark:text-gray-300 mt-4">
              This immediately deletes the stored access token, the account record, and all automations
              attached to it. DMPilot stops receiving any data about that account from Meta.
            </p>
          </section>

          <section className="rounded-2xl p-8 border shadow-sm" style={{ background: 'var(--surface-0)', borderColor: 'var(--surface-3)' }}>
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Option 2 — Delete your entire DMPilot account</h2>
            <ol className="space-y-3 text-gray-600 dark:text-gray-300 list-decimal list-inside">
              <li>Sign in to DMPilot and open <strong>Dashboard → Settings</strong>.</li>
              <li>Scroll to <strong>Delete Account</strong> and confirm.</li>
            </ol>
            <p className="text-gray-600 dark:text-gray-300 mt-4">
              Everything is erased permanently and immediately: your profile, all connected accounts and
              their access tokens, every automation, all message history, and your Link-in-Bio page.
              This cannot be undone.
            </p>
          </section>

          <section className="rounded-2xl p-8 border shadow-sm" style={{ background: 'var(--surface-0)', borderColor: 'var(--surface-3)' }}>
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Option 3 — Remove DMPilot from Instagram or Facebook</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              You can also revoke access from Meta&apos;s side, without signing in to DMPilot:
            </p>
            <ul className="space-y-3 text-gray-600 dark:text-gray-300">
              <li className="flex items-start gap-3">
                <span className="text-[#22c55e] mt-1 flex-shrink-0">•</span>
                <span><strong>Instagram:</strong> Settings → Website Permissions → Apps and Websites → remove DMPilot</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#22c55e] mt-1 flex-shrink-0">•</span>
                <span><strong>Facebook:</strong> Settings &amp; Privacy → Settings → Apps and Websites → remove DMPilot</span>
              </li>
            </ul>
            <p className="text-gray-600 dark:text-gray-300 mt-4">
              Meta notifies DMPilot when you do this, and we delete the associated tokens and account data.
            </p>
          </section>

          <section className="rounded-2xl p-8 border shadow-sm" style={{ background: 'var(--surface-0)', borderColor: 'var(--surface-3)' }}>
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Option 4 — Email us</h2>
            <p className="text-gray-600 dark:text-gray-300">
              If you cannot access your account, email{' '}
              <a href={`mailto:${SUPPORT_EMAIL}`} className="text-[#DD2A7B] hover:underline">{SUPPORT_EMAIL}</a>{' '}
              from the address you signed up with, with the subject line <strong>&quot;Data Deletion Request&quot;</strong>.
              We verify ownership and delete everything within <strong>30 days</strong>, then confirm by email.
            </p>
          </section>

          <section className="rounded-2xl p-8 border shadow-sm" style={{ background: 'var(--surface-0)', borderColor: 'var(--surface-3)' }}>
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">What we delete</h2>
            <ul className="space-y-3 text-gray-600 dark:text-gray-300">
              {[
                'Your account profile and login credentials',
                'All Instagram and Facebook access tokens (stored encrypted, deleted outright)',
                'Connected account details — username, profile picture, follower count',
                'All automations, keywords, and message templates',
                'All DM delivery history and logs',
                'Your Link-in-Bio page and its analytics',
              ].map(item => (
                <li key={item} className="flex items-start gap-3">
                  <span className="text-[#22c55e] mt-1 flex-shrink-0">•</span>
                  {item}
                </li>
              ))}
            </ul>
            <p className="text-gray-600 dark:text-gray-300 mt-4">
              DMPilot does not store the content of comments or messages beyond what is needed to deliver
              a reply, and never sells or shares your data with third parties. See our{' '}
              <Link href="/privacy-policy" className="text-[#DD2A7B] hover:underline">Privacy Policy</Link> for details.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
