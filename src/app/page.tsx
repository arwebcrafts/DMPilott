import Link from 'next/link'
import { ArrowRight, Check, MessageSquare, Zap, Users, BarChart3, Gift, Shield } from 'lucide-react'
import { InstagramIcon, FacebookIcon } from '@/components/ui/brand-icons'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-[#F58529] via-[#DD2A7B] to-[#8134AF] bg-clip-text">
          <span className="text-xl font-bold text-transparent">DMPilot</span>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/pricing" className="text-sm text-[#65676B] hover:text-[#1C1E21]">Pricing</Link>
          <Link href="/blog" className="text-sm text-[#65676B] hover:text-[#1C1E21]">Blog</Link>
          <Link href="/login" className="text-sm text-[#65676B] hover:text-[#1C1E21]">Sign in</Link>
          <Link
            href="/signup"
            className="px-4 py-2 bg-gradient-to-r from-[#F58529] via-[#DD2A7B] to-[#8134AF] text-white rounded-lg text-sm font-medium hover:opacity-90"
          >
            Start Free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 py-20 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#E8F5E9] rounded-full text-sm text-[#31A24C] font-medium mb-6">
              <Shield className="w-4 h-4" />
              Official Meta API ✓
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-[#1C1E21] leading-tight mb-4">
              Turn Comments Into<br />
              <span className="bg-gradient-to-r from-[#F58529] via-[#DD2A7B] to-[#8134AF] bg-clip-text text-transparent">
                Customers.
              </span>
              <br />Automatically.
            </h1>
            <p className="text-lg text-[#65676B] mb-8 max-w-lg">
              Send personalized DMs to everyone who comments on your Instagram and Facebook posts. 
              100% safe, built on Meta&apos;s official API. Start free.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/signup"
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#F58529] via-[#DD2A7B] to-[#8134AF] text-white rounded-lg font-semibold hover:opacity-90 transition-opacity"
              >
                Start Free — No Credit Card <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/#how-it-works"
                className="flex items-center justify-center gap-2 px-6 py-3 border border-[#CED0D4] text-[#1C1E21] rounded-lg font-medium hover:bg-[#F0F2F5] transition-colors"
              >
                See How It Works
              </Link>
            </div>
            <div className="flex items-center gap-4 mt-6 text-sm text-[#65676B]">
              <span className="flex items-center gap-1">
                <Check className="w-4 h-4 text-[#31A24C]" /> 300 DMs free
              </span>
              <span className="flex items-center gap-1">
                <Check className="w-4 h-4 text-[#31A24C]" /> 3 min setup
              </span>
              <span className="flex items-center gap-1">
                <Check className="w-4 h-4 text-[#31A24C]" /> Cancel anytime
              </span>
            </div>
          </div>

          {/* Phone mockup */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-64 bg-[#1C1E21] rounded-[3rem] p-3 shadow-2xl">
                <div className="bg-white rounded-[2.5rem] overflow-hidden">
                  {/* Status bar */}
                  <div className="bg-[#F0F2F5] px-4 py-2 flex items-center justify-between text-xs text-[#65676B]">
                    <span>9:41</span>
                    <div className="flex gap-1">
                      <span>●●●</span>
                      <span>📶</span>
                      <span>🔋</span>
                    </div>
                  </div>
                  {/* Profile */}
                  <div className="p-4 flex items-center gap-3 border-b border-[#F0F2F5]">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#F58529] via-[#DD2A7B] to-[#8134AF]" />
                    <div>
                      <div className="font-semibold text-sm text-[#1C1E21]">yourbrand</div>
                      <div className="text-xs text-[#65676B]">Instagram</div>
                    </div>
                  </div>
                  {/* Post caption */}
                  <div className="px-4 py-3 text-sm text-[#1C1E21] border-b border-[#F0F2F5]">
                    <p>✨ Free guide in my bio! Comment <strong>LINK</strong> below and I&apos;ll DM it to you! 👇</p>
                  </div>
                  {/* Comments */}
                  <div className="p-4 space-y-3 max-h-48 overflow-y-auto">
                    {[
                      { user: 'fashionista_pk', comment: 'LINK', highlight: true },
                      { user: 'tech_creator_in', comment: 'link please!', highlight: true },
                      { user: 'designlover_bd', comment: 'This is amazing 🔥', highlight: false },
                      { user: 'foodblogger22', comment: 'LINK', highlight: true },
                    ].map((c, i) => (
                      <div key={i} className={`flex items-start gap-2 text-sm ${c.highlight ? 'bg-[#FDE8F0] p-2 rounded-lg' : ''}`}>
                        <span className="font-medium text-[#1C1E21]">@{c.user}:</span>
                        <span className={c.highlight ? 'text-[#E1306C] font-semibold' : 'text-[#65676B]'}>
                          {c.comment}
                          {c.highlight && <span className="ml-2 text-xs">✓ DM sent</span>}
                        </span>
                      </div>
                    ))}
                  </div>
                  {/* DM notification */}
                  <div className="mx-3 mb-3 bg-[#E8F5E9] border border-[#31A24C] rounded-xl p-3">
                    <div className="flex items-start gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#F58529] via-[#DD2A7B] to-[#8134AF] flex-shrink-0" />
                      <div>
                        <div className="text-xs font-semibold text-[#1C1E21]">yourbrand</div>
                        <div className="text-xs text-[#1C1E21]">Hey fashionista_pk! 👋 Here&apos;s the free guide you asked for: <span className="text-[#1877F2]">yourbrand.com/guide</span></div>
                        <div className="text-xs text-[#65676B] mt-1">Just now</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-[#F0F2F5] py-8">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: '2,400+', label: 'Creators' },
            { value: '4.8M+', label: 'DMs Sent' },
            { value: '2', label: 'Platforms' },
            { value: '3 min', label: 'Setup Time' },
          ].map((stat, i) => (
            <div key={i}>
              <div className="text-2xl lg:text-3xl font-bold text-[#1C1E21]">{stat.value}</div>
              <div className="text-sm text-[#65676B]">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="px-6 py-20 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-[#1C1E21] text-center mb-12">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              step: '1',
              title: 'Connect Your Account',
              desc: 'Link your Instagram Business or Facebook Page in seconds. Official Meta OAuth — completely safe.',
              icon: <Users className="w-6 h-6 text-white" />,
              color: 'from-[#F58529] to-[#DD2A7B]',
            },
            {
              step: '2',
              title: 'Set Your Trigger',
              desc: 'Pick a keyword (like LINK) and write your DM message. Use merge tags like {name} for personalization.',
              icon: <Zap className="w-6 h-6 text-white" />,
              color: 'from-[#DD2A7B] to-[#8134AF]',
            },
            {
              step: '3',
              title: 'DMs Go Out Automatically',
              desc: 'When someone comments your keyword, they get your DM instantly. No manual work. Ever.',
              icon: <MessageSquare className="w-6 h-6 text-white" />,
              color: 'from-[#8134AF] to-[#1877F2]',
            },
          ].map((item, i) => (
            <div key={i} className="relative bg-white rounded-xl border border-[#E4E6EA] p-6 hover:shadow-lg transition-shadow">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${item.color} flex items-center justify-center mb-4`}>
                {item.icon}
              </div>
              <div className="text-sm font-medium text-[#65676B] mb-1">Step {item.step}</div>
              <h3 className="text-lg font-bold text-[#1C1E21] mb-2">{item.title}</h3>
              <p className="text-sm text-[#65676B]">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Platforms */}
      <section className="px-6 py-16 bg-[#F0F2F5]">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-[#1C1E21] text-center mb-4">Works on Both Platforms</h2>
          <p className="text-[#65676B] text-center mb-12 max-w-lg mx-auto">No other $9 tool supports both Instagram AND Facebook in one plan.</p>
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Instagram */}
            <div className="bg-white rounded-xl overflow-hidden shadow-sm">
              <div className="h-2 bg-gradient-to-r from-[#F58529] via-[#DD2A7B] to-[#8134AF]" />
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <InstagramIcon className="w-8 h-8 text-[#E1306C]" />
                  <span className="text-xl font-bold text-[#1C1E21]">Instagram</span>
                </div>
                <ul className="space-y-2 text-sm text-[#65676B]">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#31A24C]" /> Posts & Reels comments</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#31A24C]" /> Story replies</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#31A24C]" /> 7-day messaging window</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#31A24C]" /> Auto comment replies</li>
                </ul>
              </div>
            </div>

            {/* Facebook */}
            <div className="bg-white rounded-xl overflow-hidden shadow-sm">
              <div className="h-2 bg-[#1877F2]" />
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <FacebookIcon className="w-8 h-8 text-[#1877F2]" />
                  <span className="text-xl font-bold text-[#1C1E21]">Facebook</span>
                </div>
                <ul className="space-y-2 text-sm text-[#65676B]">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#31A24C]" /> Page post comments</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#31A24C]" /> Messenger DMs</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#31A24C]" /> 24-hour messaging window</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#31A24C]" /> Auto comment replies</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-20 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-[#1C1E21] text-center mb-12">Everything You Need</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { title: 'Comment-to-DM Automation', desc: 'Set a keyword trigger and send personalized DMs instantly.', icon: '💬', featured: true },
            { title: 'Story Reply Automation', desc: 'When someone replies to your Story, send them a DM automatically.', icon: '📖', featured: false },
            { title: 'Auto Comment Replies', desc: 'Auto-reply in the comments section too. "Check your DMs! 📩"', icon: '💭', featured: false },
            { title: 'Giveaway Mode', desc: 'Collect entries, pick random winners, DM everyone automatically.', icon: <Gift className="w-6 h-6" />, featured: false },
            { title: 'Analytics Dashboard', desc: 'Track DMs sent, delivery rates, top keywords, and best posts.', icon: <BarChart3 className="w-6 h-6" />, featured: false },
            { title: 'AI Replies (Pro)', desc: 'AI continues the conversation when followers reply to your DMs.', icon: '🤖', featured: true },
          ].map((feature, i) => (
            <div
              key={i}
              className={`rounded-xl border p-6 ${
                feature.featured
                  ? 'bg-gradient-to-br from-[#FDE8F0] to-[#F5E8F0] border-[#DD2A7B]/20'
                  : 'bg-white border-[#E4E6EA]'
              }`}
            >
              <div className="text-3xl mb-3">{typeof feature.icon === 'string' ? feature.icon : ''}
                {feature.icon}
              </div>
              <h3 className="font-bold text-[#1C1E21] mb-2">{feature.title}</h3>
              <p className="text-sm text-[#65676B]">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="px-6 py-20 bg-[#F0F2F5]">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-[#1C1E21] text-center mb-4">Simple, Transparent Pricing</h2>
          <p className="text-[#65676B] text-center mb-12">Start free. Upgrade when you&apos;re ready to scale.</p>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Free */}
            <div className="bg-white rounded-xl border border-[#E4E6EA] p-6">
              <h3 className="text-lg font-bold text-[#1C1E21]">Free</h3>
              <div className="my-4">
                <span className="text-4xl font-bold text-[#1C1E21]">$0</span>
                <span className="text-[#65676B]">/month</span>
              </div>
              <p className="text-sm text-[#65676B] mb-6">Perfect for testing DMPilot with your followers.</p>
              <ul className="space-y-3 mb-6 text-sm">
                {['300 DMs/month', '1 Instagram account', 'Basic keyword triggers', '7-day analytics'].map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-[#1C1E21]">
                    <Check className="w-4 h-4 text-[#31A24C]" /> {f}
                  </li>
                ))}
                {['Facebook support', 'Giveaway mode', 'AI features'].map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-[#65676B]">
                    <span className="w-4 h-4 text-center">–</span> {f}
                  </li>
                ))}
              </ul>
              <Link href="/signup" className="block text-center py-2.5 border border-[#CED0D4] rounded-lg text-sm font-medium text-[#65676B] hover:bg-[#F0F2F5]">
                Start Free
              </Link>
            </div>

            {/* Creator */}
            <div className="bg-white rounded-xl border-2 border-[#DD2A7B] p-6 relative shadow-lg">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#F58529] via-[#DD2A7B] to-[#8134AF] text-white text-xs font-bold px-3 py-1 rounded-full">
                MOST POPULAR
              </div>
              <h3 className="text-lg font-bold text-[#1C1E21]">Creator</h3>
              <div className="my-4">
                <span className="text-4xl font-bold text-[#1C1E21]">$9</span>
                <span className="text-[#65676B]">/month</span>
              </div>
              <p className="text-sm text-[#65676B] mb-6">Everything you need to grow on Instagram and Facebook.</p>
              <ul className="space-y-3 mb-6 text-sm">
                {['3,000 DMs/month', '2 Instagram + 1 Facebook', 'All trigger types', 'Giveaway mode (1 active)', 'Unique discount codes', '30-day analytics'].map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-[#1C1E21]">
                    <Check className="w-4 h-4 text-[#31A24C]" /> {f}
                  </li>
                ))}
              </ul>
              <Link href="/signup" className="block text-center py-2.5 bg-gradient-to-r from-[#F58529] via-[#DD2A7B] to-[#8134AF] text-white rounded-lg text-sm font-medium hover:opacity-90">
                Start 7-Day Free Trial
              </Link>
            </div>

            {/* Pro */}
            <div className="bg-white rounded-xl border border-[#E4E6EA] p-6">
              <h3 className="text-lg font-bold text-[#1C1E21]">Pro</h3>
              <div className="my-4">
                <span className="text-4xl font-bold text-[#1C1E21]">$19</span>
                <span className="text-[#65676B]">/month</span>
              </div>
              <p className="text-sm text-[#65676B] mb-6">For serious creators running high-volume automation.</p>
              <ul className="space-y-3 mb-6 text-sm">
                {['Unlimited DMs', '10 Instagram + 10 Facebook', 'AI conversation replies', 'Multi-language auto-detect', 'Email lead capture', 'Unlimited giveaways', '90-day analytics + CSV', 'API access + Zapier'].map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-[#1C1E21]">
                    <Check className="w-4 h-4 text-[#31A24C]" /> {f}
                  </li>
                ))}
              </ul>
              <Link href="/signup" className="block text-center py-2.5 bg-[#1877F2] text-white rounded-lg text-sm font-medium hover:bg-[#166FE5]">
                Start 7-Day Free Trial
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-6 py-20 max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-[#1C1E21] text-center mb-12">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {[
            {
              q: 'Is DMPilot safe to use with Instagram?',
              a: 'Yes. DMPilot uses Meta\'s official Graph API — the exact same API that ManyChat, Meta\'s own tools, and 10,000+ other apps use. We never ask for your password and are fully compliant with Meta\'s platform policies.',
            },
            {
              q: 'Do I need an Instagram Business account?',
              a: 'Yes. Meta requires a Business or Creator account to use the messaging API. You can switch to a Business account in your Instagram settings — it takes 2 minutes and is free.',
            },
            {
              q: 'Does it work for Facebook too?',
              a: 'Yes! Unlike most competitors that are Instagram-only, DMPilot supports both Instagram and Facebook in all paid plans. One subscription covers both platforms.',
            },
            {
              q: 'What happens when I hit my DM limit?',
              a: 'Your automations pause until your monthly limit resets (on the 1st of each month). You\'ll see a warning in your dashboard when you reach 80% and 95% of your limit.',
            },
            {
              q: 'Can I cancel anytime?',
              a: 'Yes. Cancel your subscription at any time from your dashboard. You\'ll keep access to your current plan until the end of your billing period.',
            },
          ].map((faq, i) => (
            <details key={i} className="group bg-white rounded-lg border border-[#E4E6EA]">
              <summary className="flex items-center justify-between p-4 cursor-pointer font-medium text-[#1C1E21] list-none">
                {faq.q}
                <span className="text-[#65676B] group-open:rotate-45 transition-transform">+</span>
              </summary>
              <p className="px-4 pb-4 text-sm text-[#65676B]">{faq.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20 bg-gradient-to-r from-[#F58529] via-[#DD2A7B] to-[#8134AF]">
        <div className="max-w-2xl mx-auto text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to turn comments into customers?</h2>
          <p className="text-white/80 mb-8">Join 2,400+ creators already using DMPilot to automate their Instagram and Facebook DMs.</p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-8 py-3 bg-white text-[#DD2A7B] rounded-lg font-semibold hover:bg-white/90 transition-colors"
          >
            Start Free — No Credit Card <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12 bg-[#1C1E21] text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="bg-gradient-to-r from-[#F58529] via-[#DD2A7B] to-[#8134AF] bg-clip-text mb-3">
                <span className="text-lg font-bold text-transparent">DMPilot</span>
              </div>
              <p className="text-sm text-[#999]">Turn every comment into a conversation. Automatically.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Product</h4>
              <ul className="space-y-2 text-sm text-[#999]">
                <li><Link href="/#how-it-works" className="hover:text-white">How It Works</Link></li>
                <li><Link href="/pricing" className="hover:text-white">Pricing</Link></li>
                <li><Link href="/blog" className="hover:text-white">Blog</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Legal</h4>
              <ul className="space-y-2 text-sm text-[#999]">
                <li><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-white">Terms of Service</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Support</h4>
              <ul className="space-y-2 text-sm text-[#999]">
                <li><a href="mailto:support@dmautomation.app" className="hover:text-white">support@dmautomation.app</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-[#333] mt-8 pt-8 text-center text-sm text-[#999]">
            © 2026 DMPilot. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
