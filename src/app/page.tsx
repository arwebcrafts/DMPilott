'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { ArrowRight, Check, MessageSquare, Zap, Users, BarChart3, Gift, Shield, Star, X, Menu, XCircle } from 'lucide-react'
import { InstagramIcon, FacebookIcon } from '@/components/ui/brand-icons'

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [creatorCount, setCreatorCount] = useState(287)
  const { scrollY } = useScroll()
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0])
  const heroY = useTransform(scrollY, [0, 300], [0, 100])

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setCreatorCount(prev => prev + Math.floor(Math.random() * 3))
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const navVariants = {
    hidden: { y: -100, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
  }

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  }

  const staggerChildren = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden">
      {/* Animated background orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute top-20 left-10 w-96 h-96 bg-[#8134AF]/20 rounded-full blur-3xl orb-1"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div 
          className="absolute top-40 right-20 w-80 h-80 bg-[#DD2A7B]/15 rounded-full blur-3xl orb-2"
          animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 10, repeat: Infinity, delay: 1 }}
        />
        <motion.div 
          className="absolute bottom-20 left-1/3 w-72 h-72 bg-[#F58529]/10 rounded-full blur-3xl"
          animate={{ scale: [1, 1.1, 1], opacity: [0.15, 0.3, 0.15] }}
          transition={{ duration: 12, repeat: Infinity, delay: 2 }}
        />
      </div>

      {/* Navbar */}
      <motion.nav 
        initial="hidden"
        animate="visible"
        variants={navVariants}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'glass-card-static py-3' : 'py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="gradient-text text-2xl font-bold cursor-pointer"
          >
            DMPilot
          </motion.div>
          
          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/pricing" className="text-sm text-[#8a8a9a] hover:text-white transition-colors">Pricing</Link>
            <Link href="/blog" className="text-sm text-[#8a8a9a] hover:text-white transition-colors">Blog</Link>
            <Link href="/login" className="text-sm text-[#8a8a9a] hover:text-white transition-colors">Sign in</Link>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/signup"
                className="px-6 py-2.5 shimmer-btn rounded-lg text-sm font-semibold text-white"
              >
                Start Free
              </Link>
            </motion.div>
          </div>

          {/* Mobile menu button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-white"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden glass-card-static mt-2 mx-4 rounded-xl overflow-hidden"
            >
              <div className="p-4 space-y-4">
                <Link href="/pricing" className="block text-sm text-[#8a8a9a] hover:text-white">Pricing</Link>
                <Link href="/blog" className="block text-sm text-[#8a8a9a] hover:text-white">Blog</Link>
                <Link href="/login" className="block text-sm text-[#8a8a9a] hover:text-white">Sign in</Link>
                <Link href="/signup" className="block px-6 py-2.5 shimmer-btn rounded-lg text-sm font-semibold text-white text-center">Start Free</Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Hero Section */}
      <motion.section 
        style={{ opacity: heroOpacity, y: heroY }}
        className="relative pt-32 pb-20 px-6 max-w-7xl mx-auto"
      >
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={staggerChildren}
            className="space-y-6"
          >
            {/* Urgency badge */}
            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 glass-card rounded-full">
              <span className="text-lg">🔥</span>
              <span className="text-sm font-medium">
                <span className="text-[#F58529] font-bold">{creatorCount}</span> creators signed up this week
              </span>
            </motion.div>

            {/* Trust badge */}
            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 bg-[#22c55e]/10 border border-[#22c55e]/20 rounded-full">
              <Shield className="w-4 h-4 text-[#22c55e]" />
              <span className="text-sm font-medium text-[#22c55e]">Official Meta API ✓</span>
            </motion.div>

            {/* Headline */}
            <motion.h1 variants={fadeInUp} className="text-5xl lg:text-7xl font-bold leading-tight">
              Turn Comments Into<br />
              <span className="gradient-text">Customers.</span>
              <br />Automatically.
            </motion.h1>

            {/* Subheadline */}
            <motion.p variants={fadeInUp} className="text-lg text-[#8a8a9a] max-w-lg">
              Send personalized DMs to everyone who comments on your Instagram and Facebook posts. 
              100% safe, built on Meta's official API. Start free.
            </motion.p>

            {/* CTAs */}
            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href="/signup"
                  className="flex items-center justify-center gap-2 px-8 py-4 shimmer-btn rounded-xl font-semibold text-white pulse-glow"
                >
                  Start Free — No Credit Card <ArrowRight className="w-5 h-5" />
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href="/#how-it-works"
                  className="flex items-center justify-center gap-2 px-8 py-4 glass-card rounded-xl font-medium hover:bg-white/10 transition-colors"
                >
                  See How It Works
                </Link>
              </motion.div>
            </motion.div>

            {/* Trust signals */}
            <motion.div variants={fadeInUp} className="flex flex-wrap gap-6 text-sm text-[#8a8a9a]">
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#22c55e]" /> 300 DMs free
              </span>
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#22c55e]" /> 3 min setup
              </span>
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#22c55e]" /> Cancel anytime
              </span>
            </motion.div>

            {/* Social proof avatars */}
            <motion.div variants={fadeInUp} className="flex items-center gap-4 pt-4">
              <div className="flex -space-x-3">
                {['bg-gradient-to-r from-[#F58529] to-[#DD2A7B]', 'bg-gradient-to-r from-[#DD2A7B] to-[#8134AF]', 'bg-gradient-to-r from-[#8134AF] to-[#1877F2]', 'bg-gradient-to-r from-[#1877F2] to-[#F58529]'].map((gradient, i) => (
                  <div key={i} className={`w-10 h-10 rounded-full ${gradient} border-2 border-[#0a0a0f]`} />
                ))}
              </div>
              <div className="flex items-center gap-1">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-[#F58529] text-[#F58529]" />
                  ))}
                </div>
                <span className="text-sm text-[#8a8a9a] ml-2">4.9/5 from 2,400+ creators</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Phone mockup */}
          <motion.div 
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex justify-center lg:justify-end"
          >
            <div className="relative animate-float">
              <div className="w-72 bg-[#1a1a2e] rounded-[3rem] p-3 shadow-2xl border border-[#22223a]">
                <div className="bg-[#0d0d15] rounded-[2.5rem] overflow-hidden">
                  {/* Status bar */}
                  <div className="bg-[#1a1a2e] px-4 py-2 flex items-center justify-between text-xs text-[#8a8a9a]">
                    <span>9:41</span>
                    <div className="flex gap-1">
                      <span>●●●</span>
                      <span>📶</span>
                      <span>🔋</span>
                    </div>
                  </div>
                  {/* Profile */}
                  <div className="p-4 flex items-center gap-3 border-b border-[#22223a]">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#F58529] via-[#DD2A7B] to-[#8134AF]" />
                    <div>
                      <div className="font-semibold text-sm text-white">yourbrand</div>
                      <div className="text-xs text-[#8a8a9a]">Instagram</div>
                    </div>
                  </div>
                  {/* Post caption */}
                  <div className="px-4 py-3 text-sm text-white border-b border-[#22223a]">
                    <p>✨ Free guide in my bio! Comment <strong className="gradient-text">LINK</strong> below and I'll DM it to you! 👇</p>
                  </div>
                  {/* Comments */}
                  <div className="p-4 space-y-3 max-h-48 overflow-y-auto">
                    {[
                      { user: 'fashionista_pk', comment: 'LINK', highlight: true },
                      { user: 'tech_creator_in', comment: 'link please!', highlight: true },
                      { user: 'designlover_bd', comment: 'This is amazing 🔥', highlight: false },
                      { user: 'foodblogger22', comment: 'LINK', highlight: true },
                    ].map((c, i) => (
                      <motion.div 
                        key={i} 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + i * 0.2 }}
                        className={`flex items-start gap-2 text-sm ${c.highlight ? 'bg-[#DD2A7B]/10 p-2 rounded-lg border border-[#DD2A7B]/20' : ''}`}
                      >
                        <span className="font-medium text-white">@{c.user}:</span>
                        <span className={c.highlight ? 'text-[#DD2A7B] font-semibold' : 'text-[#8a8a9a]'}>
                          {c.comment}
                          {c.highlight && <span className="ml-2 text-xs text-[#22c55e]">✓ DM sent</span>}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                  {/* DM notification */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.5 }}
                    className="mx-3 mb-3 bg-[#22c55e]/10 border border-[#22c55e]/20 rounded-xl p-3"
                  >
                    <div className="flex items-start gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#F58529] via-[#DD2A7B] to-[#8134AF] flex-shrink-0" />
                      <div>
                        <div className="text-xs font-semibold text-white">yourbrand</div>
                        <div className="text-xs text-white">Hey fashionista_pk! 👋 Here's the free guide you asked for: <span className="text-[#1877F2]">yourbrand.com/guide</span></div>
                        <div className="text-xs text-[#8a8a9a] mt-1">Just now</div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Stats bar */}
      <section className="relative py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {[
              { value: '2,400+', label: 'Creators', icon: <Users className="w-5 h-5" /> },
              { value: '4.8M+', label: 'DMs Sent', icon: <MessageSquare className="w-5 h-5" /> },
              { value: '2', label: 'Platforms', icon: <Zap className="w-5 h-5" /> },
              { value: '3 min', label: 'Setup Time', icon: <BarChart3 className="w-5 h-5" /> },
            ].map((stat, i) => (
              <motion.div 
                key={i}
                whileHover={{ scale: 1.05 }}
                className="glass-card rounded-2xl p-6 text-center"
              >
                <div className="flex justify-center mb-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-[#F58529] via-[#DD2A7B] to-[#8134AF] flex items-center justify-center">
                    {stat.icon}
                  </div>
                </div>
                <div className="text-3xl lg:text-4xl font-bold gradient-text mb-1">{stat.value}</div>
                <div className="text-sm text-[#8a8a9a]">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Platform logos */}
      <section className="py-8 px-6 border-t border-[#22223a]">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-center items-center gap-12 opacity-60">
          <InstagramIcon className="w-12 h-12 hover:opacity-100 transition-opacity cursor-pointer" />
          <FacebookIcon className="w-12 h-12 hover:opacity-100 transition-opacity cursor-pointer" />
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="relative py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-4">How It Works</h2>
            <p className="text-lg text-[#8a8a9a] max-w-2xl mx-auto">Get started in 3 simple steps. No technical skills required.</p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-24 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-[#F58529] via-[#DD2A7B] to-[#8134AF]" />
            
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
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                whileHover={{ y: -10 }}
                className="relative glass-card rounded-2xl p-8 hover:border-[#DD2A7B]/30 transition-all"
              >
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${item.color} flex items-center justify-center mb-6 shadow-lg`}>
                  {item.icon}
                </div>
                <div className="text-sm font-medium text-[#DD2A7B] mb-2">Step {item.step}</div>
                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                <p className="text-sm text-[#8a8a9a]">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Platforms */}
      <section className="py-24 px-6 bg-gradient-to-b from-[#0d0d15] to-[#0a0a0f]">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-4">Works on Both Platforms</h2>
            <p className="text-lg text-[#8a8a9a] max-w-2xl mx-auto">No other $9 tool supports both Instagram AND Facebook in one plan.</p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Instagram */}
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02 }}
              className="glass-card rounded-2xl overflow-hidden"
            >
              <div className="h-2 bg-gradient-to-r from-[#F58529] via-[#DD2A7B] to-[#8134AF]" />
              <div className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <InstagramIcon className="w-10 h-10 text-[#E1306C]" />
                  <span className="text-2xl font-bold">Instagram</span>
                </div>
                <ul className="space-y-3">
                  {['Posts & Reels comments', 'Story replies', '7-day messaging window', 'Auto comment replies'].map((f, i) => (
                    <motion.li 
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 + i * 0.1 }}
                      className="flex items-center gap-3 text-[#8a8a9a]"
                    >
                      <Check className="w-5 h-5 text-[#22c55e] flex-shrink-0" /> {f}
                    </motion.li>
                  ))}
                </ul>
              </div>
            </motion.div>

            {/* Facebook */}
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02 }}
              className="glass-card rounded-2xl overflow-hidden"
            >
              <div className="h-2 bg-[#1877F2]" />
              <div className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <FacebookIcon className="w-10 h-10 text-[#1877F2]" />
                  <span className="text-2xl font-bold">Facebook</span>
                </div>
                <ul className="space-y-3">
                  {['Page post comments', 'Messenger DMs', '24-hour messaging window', 'Auto comment replies'].map((f, i) => (
                    <motion.li 
                      key={i}
                      initial={{ opacity: 0, x: 10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 + i * 0.1 }}
                      className="flex items-center gap-3 text-[#8a8a9a]"
                    >
                      <Check className="w-5 h-5 text-[#22c55e] flex-shrink-0" /> {f}
                    </motion.li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-4">Everything You Need</h2>
            <p className="text-lg text-[#8a8a9a] max-w-2xl mx-auto">Powerful features to automate your DM marketing.</p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: 'Comment-to-DM Automation', desc: 'Set a keyword trigger and send personalized DMs instantly.', icon: '💬', featured: true },
              { title: 'Story Reply Automation', desc: 'When someone replies to your Story, send them a DM automatically.', icon: '📖', featured: false },
              { title: 'Auto Comment Replies', desc: 'Auto-reply in the comments section too. "Check your DMs! 📩"', icon: '💭', featured: false },
              { title: 'Giveaway Mode', desc: 'Collect entries, pick random winners, DM everyone automatically.', icon: <Gift className="w-6 h-6" />, featured: false },
              { title: 'Analytics Dashboard', desc: 'Track DMs sent, delivery rates, top keywords, and best posts.', icon: <BarChart3 className="w-6 h-6" />, featured: false },
              { title: 'AI Replies (Pro)', desc: 'AI continues the conversation when followers reply to your DMs.', icon: '🤖', featured: true },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -5 }}
                className={`glass-card rounded-2xl p-6 relative overflow-hidden ${
                  feature.featured ? 'border-[#DD2A7B]/30' : ''
                }`}
              >
                {feature.featured && (
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[#DD2A7B]/20 to-transparent rounded-full blur-2xl" />
                )}
                <div className="text-4xl mb-4 relative z-10">{typeof feature.icon === 'string' ? feature.icon : ''}
                  {typeof feature.icon !== 'string' && feature.icon}
                </div>
                <h3 className="font-bold text-lg mb-2 relative z-10">{feature.title}</h3>
                <p className="text-sm text-[#8a8a9a] relative z-10">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6 pricing-bg">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#F58529]/10 border border-[#F58529]/20 rounded-full text-sm text-[#F58529] mb-6">
              <span className="text-lg">⚡</span>
              Limited: First 500 users get 30% off
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-lg text-[#8a8a9a]">Start free. Upgrade when you're ready to scale.</p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Free */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
              className="glass-card rounded-2xl p-8"
            >
              <h3 className="text-lg font-bold mb-2">Free</h3>
              <div className="my-6">
                <span className="text-5xl font-bold">$0</span>
                <span className="text-[#8a8a9a]">/month</span>
              </div>
              <p className="text-sm text-[#8a8a9a] mb-8">Perfect for testing DMPilot with your followers.</p>
              <ul className="space-y-4 mb-8 text-sm">
                {['300 DMs/month', '1 Instagram account', 'Basic keyword triggers', '7-day analytics'].map((f, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-[#22c55e] flex-shrink-0" /> {f}
                  </li>
                ))}
                {['Facebook support', 'Giveaway mode', 'AI features'].map((f, i) => (
                  <li key={i} className="flex items-center gap-3 text-[#5a5a6e]">
                    <XCircle className="w-5 h-5 flex-shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <Link href="/signup" className="block text-center py-3 glass-card rounded-xl font-medium hover:bg-white/10 transition-colors">
                Start Free
              </Link>
            </motion.div>

            {/* Creator */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              whileHover={{ y: -5 }}
              className="glass-card rounded-2xl p-8 relative gradient-border pulse-glow"
            >
              <motion.div 
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-4 left-1/2 -translate-x-1/2 shimmer-btn px-4 py-1.5 rounded-full text-xs font-bold text-white"
              >
                MOST POPULAR
              </motion.div>
              <h3 className="text-lg font-bold mb-2">Creator</h3>
              <div className="my-6">
                <span className="text-5xl font-bold gradient-text">$9</span>
                <span className="text-[#8a8a9a]">/month</span>
              </div>
              <p className="text-sm text-[#8a8a9a] mb-8">Everything you need to grow on Instagram and Facebook.</p>
              <ul className="space-y-4 mb-8 text-sm">
                {['3,000 DMs/month', '2 Instagram + 1 Facebook', 'All trigger types', 'Giveaway mode (1 active)', 'Unique discount codes', '30-day analytics'].map((f, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-[#22c55e] flex-shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <Link href="/signup" className="block text-center py-3 shimmer-btn rounded-xl font-semibold text-white hover:opacity-90 transition-opacity">
                Start 7-Day Free Trial
              </Link>
            </motion.div>

            {/* Pro */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              whileHover={{ y: -5 }}
              className="glass-card rounded-2xl p-8"
            >
              <h3 className="text-lg font-bold mb-2">Pro</h3>
              <div className="my-6">
                <span className="text-5xl font-bold">$19</span>
                <span className="text-[#8a8a9a]">/month</span>
              </div>
              <p className="text-sm text-[#8a8a9a] mb-8">For serious creators running high-volume automation.</p>
              <ul className="space-y-4 mb-8 text-sm">
                {['Unlimited DMs', '10 Instagram + 10 Facebook', 'AI conversation replies', 'Multi-language auto-detect', 'Email lead capture', 'Unlimited giveaways', '90-day analytics + CSV', 'API access + Zapier'].map((f, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-[#22c55e] flex-shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <Link href="/signup" className="block text-center py-3 bg-[#1877F2] rounded-xl font-semibold hover:bg-[#166FE5] transition-colors">
                Start 7-Day Free Trial
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-4">Loved by Creators</h2>
            <p className="text-lg text-[#8a8a9a] max-w-2xl mx-auto">See what our users are saying about DMPilot.</p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: 'Sarah Chen', role: 'Fashion Influencer', content: 'DMPilot saved me 10+ hours every week. My engagement went up 300%!', avatar: 'SC' },
              { name: 'Mike Rodriguez', role: 'Tech Creator', content: 'The AI replies feature is incredible. It feels like I have a 24/7 assistant.', avatar: 'MR' },
              { name: 'Emma Wilson', role: 'Fitness Coach', content: 'Best $9 I spend every month. The giveaway mode is a game changer.', avatar: 'EW' },
            ].map((testimonial, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card rounded-2xl p-6"
              >
                <div className="flex mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-[#F58529] text-[#F58529]" />
                  ))}
                </div>
                <p className="text-[#8a8a9a] mb-6">"{testimonial.content}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#F58529] via-[#DD2A7B] to-[#8134AF] flex items-center justify-center text-sm font-bold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-[#8a8a9a]">{testimonial.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-4">Frequently Asked Questions</h2>
          </motion.div>
          
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
              <motion.details 
                key={i}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="glass-card rounded-xl group overflow-hidden"
              >
                <summary className="flex items-center justify-between p-6 cursor-pointer font-medium list-none hover:bg-white/5 transition-colors">
                  {faq.q}
                  <motion.span 
                    className="text-[#8a8a9a] transition-transform"
                    animate={{ rotate: 0 }}
                    whileInView={{ rotate: 0 }}
                  >
                    +
                  </motion.span>
                </summary>
                <p className="px-6 pb-6 text-sm text-[#8a8a9a]">{faq.a}</p>
              </motion.details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="cta-bg rounded-3xl p-12 text-center text-white relative overflow-hidden"
          >
            <div className="relative z-10">
              <h2 className="text-4xl lg:text-5xl font-bold mb-4">Every minute you wait, your competitors are automating</h2>
              <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">Your free trial includes 300 DMs. No credit card required.</p>
              <motion.div 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-block"
              >
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-white text-[#DD2A7B] rounded-xl font-semibold hover:bg-white/90 transition-colors pulse-glow"
                >
                  Start Your Free Trial Now <ArrowRight className="w-5 h-5" />
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-16 border-t border-[#22223a]">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12">
            <div>
              <div className="gradient-text text-2xl font-bold mb-4">DMPilot</div>
              <p className="text-sm text-[#8a8a9a]">Turn every comment into a conversation. Automatically.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-3 text-sm text-[#8a8a9a]">
                <li><Link href="/#how-it-works" className="hover:text-white transition-colors">How It Works</Link></li>
                <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-3 text-sm text-[#8a8a9a]">
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-3 text-sm text-[#8a8a9a]">
                <li><a href="mailto:support@dmautomation.app" className="hover:text-white transition-colors">support@dmautomation.app</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-[#22223a] mt-12 pt-8 text-center text-sm text-[#5a5a6e]">
            2026 DMPilot. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
