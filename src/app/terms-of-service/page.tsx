export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-white text-[#1C1E21] p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
      <p className="text-sm text-[#65676B] mb-8">Last updated: April 15, 2026</p>
      
      <div className="prose prose-gray max-w-none space-y-6">
        <section>
          <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
          <p>By using DMPilot, you agree to these terms. If you do not agree, do not use our service.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">2. Service Description</h2>
          <p>DMPilot provides automated messaging automation for Instagram and Facebook Business accounts. Our service uses Meta's official Graph API to send direct messages on your behalf.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">3. User Responsibilities</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>You must have a valid Instagram Business/Creator account or Facebook Page to use our service</li>
            <li>You are responsible for the content of messages sent through DMPilot</li>
            <li>You must comply with Meta's community guidelines and terms of service</li>
            <li>You are responsible for maintaining the security of your connected accounts</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">4. Prohibited Use</h2>
          <p>You may not use DMPilot to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Send spam or unsolicited messages</li>
            <li>Harassment or target individuals without consent</li>
            <li>Violate any laws or regulations</li>
            <li>Send content that violates Meta's policies</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">5. Payment Terms</h2>
          <p>Paid plans are billed monthly or yearly. You can cancel anytime. No refunds for partial periods.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">6. Limitation of Liability</h2>
          <p>DMPilot is not responsible for any actions taken by Meta against your account, message deliverability issues, or any indirect damages arising from use of our service.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">7. Contact</h2>
          <p>For questions, contact us at: <strong>arwebcrafts@gmail.com</strong></p>
        </section>
      </div>
    </div>
  )
}
