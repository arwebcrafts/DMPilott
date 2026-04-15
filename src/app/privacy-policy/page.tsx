export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-white text-[#1C1E21] p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <p className="text-sm text-[#65676B] mb-8">Last updated: April 15, 2026</p>
      
      <div className="prose prose-gray max-w-none space-y-6">
        <section>
          <h2 className="text-xl font-semibold mb-3">1. Information We Collect</h2>
          <p>DMPilot collects information you provide directly, including:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Account information (email, name) when you sign up via Supabase Auth</li>
            <li>Meta API access tokens when you connect your Instagram or Facebook account</li>
            <li>Instagram/Facebook page data (username, profile picture, follower count)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">2. How We Use Your Information</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>To authenticate and manage your connected Meta accounts</li>
            <li>To send automated DMs on your behalf via Meta's official Graph API</li>
            <li>To display your account statistics in the dashboard</li>
            <li>To improve our service and communicate with you</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">3. Data Storage and Security</h2>
          <p>Access tokens are encrypted using AES-256 before storage. We use Supabase as our database provider and implement industry-standard security measures. Your tokens are stored securely and never shared with third parties.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">4. Meta API Compliance</h2>
          <p>DMPilot uses Meta's official Graph API to send messages. We comply with Meta's Platform Terms and Data Use Policy. All messaging operations are performed on your behalf using your authorized access tokens.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">5. Your Rights</h2>
          <p>You can disconnect your Meta accounts at any time through the dashboard. You can request deletion of your account data by contacting us at arwebcrafts@gmail.com.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">6. Contact</h2>
          <p>For privacy concerns, contact us at: <strong>arwebcrafts@gmail.com</strong></p>
        </section>
      </div>
    </div>
  )
}
