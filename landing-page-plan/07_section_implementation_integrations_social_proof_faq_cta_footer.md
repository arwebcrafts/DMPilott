# DMPilot Landing Page Implementation Plan
## Part 7: Section Implementation - Integrations, Social Proof, FAQ, Final CTA, Footer

---

## Table of Contents
- [Integrations Section](#integrations-section)
- [Social Proof Section](#social-proof-section)
- [FAQ Section](#faq-section)
- [Final CTA Section](#final-cta-section)
- [Footer Section](#footer-section)

---

## Integrations Section

### Purpose
The Integrations section shows how DMPilot fits into existing workflows and tools, reducing friction for adoption.

### Content

**Headline**: "Works With Your Favorite Tools"

**Subtitle**: "DMPilot integrates seamlessly with the tools you already use."

**Integration Categories**:

1. **Social Media Platforms**
   - Instagram (Native)
   - TikTok (Coming Soon)
   - YouTube (Coming Soon)

2. **E-commerce**
   - Shopify
   - WooCommerce
   - Stripe

3. **Analytics**
   - Google Analytics
   - Meta Pixel
   - Custom Webhooks

4. **CRM & Email**
   - Mailchimp
   - ConvertKit
   - HubSpot

5. **Automation**
   - Zapier
   - Make (Integromat)
   - Custom API

### Key Implementation Details

**Component Structure**:
```typescript
'use client';

import { motion } from 'framer-motion';
import { SectionContainer } from '../shared/SectionContainer';
import { SectionHeader } from '../shared/SectionHeader';
import { IntegrationCard } from '../shared/IntegrationCard';
import { IntegrationMap } from '../data-viz/IntegrationMap';

export function Integrations() {
  const integrations = [
    {
      name: "Instagram",
      logo: "/images/integrations/instagram.png",
      category: "Social Media",
      description: "Native integration with Instagram Graph API",
    },
    {
      name: "Shopify",
      logo: "/images/integrations/shopify.png",
      category: "E-commerce",
      description: "Sync products and track conversions",
    },
    {
      name: "Stripe",
      logo: "/images/integrations/stripe.png",
      category: "E-commerce",
      description: "Process payments directly in DMs",
    },
    {
      name: "Google Analytics",
      logo: "/images/integrations/google-analytics.png",
      category: "Analytics",
      description: "Track conversions and user behavior",
    },
    {
      name: "Mailchimp",
      logo: "/images/integrations/mailchimp.png",
      category: "CRM & Email",
      description: "Add commenters to email lists",
    },
    {
      name: "Zapier",
      logo: "/images/integrations/zapier.png",
      category: "Automation",
      description: "Connect with 5000+ apps",
    },
  ];

  return (
    <SectionContainer variant="default" padding="lg">
      <SectionHeader
        title="Works With Your Favorite Tools"
        subtitle="DMPilot integrates seamlessly with the tools you already use."
        align="center"
      />
      
      <IntegrationMap integrations={integrations} />
      
      {/* Coming Soon */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mt-12 text-center"
      >
        <p className="text-gray-600 mb-4">
          Don't see your favorite tool? We're adding new integrations every month.
        </p>
        <button className="text-blue-600 font-semibold hover:text-blue-700 transition-colors">
          Request an integration →
        </button>
      </motion.div>
    </SectionContainer>
  );
}
```

### Styling Considerations

- **Integration Cards**: Clean cards with logo, name, and description
- **Category Grouping**: Organized by category for clarity
- **Logo Display**: Consistent logo sizing and placement
- **Hover Effects**: Cards lift on hover

### Responsive Design

- **Mobile**: Single column, stack categories
- **Tablet**: Two columns
- **Desktop**: Three columns

---

## Social Proof Section

### Purpose
The Social Proof section builds trust through testimonials, case studies, and usage statistics.

### Content

**Headline**: "Trusted by 500+ Creators Worldwide"

**Subtitle**: "See how creators are using DMPilot to grow their businesses."

**Testimonials**:

1. **Sarah Chen**
   - Role: Fitness Creator, 250K followers
   - Quote: "DMPilot transformed how I engage with my audience. I went from missing 80% of DMs to responding to every commenter within minutes. My course sales increased by 340%."
   - Rating: 5 stars
   - Avatar: Image

2. **Marcus Johnson**
   - Role: E-commerce Brand Owner, 50K followers
   - Quote: "We were losing customers because we couldn't respond fast enough. DMPilot solved that overnight. Our conversion rate from comments to sales jumped from 12% to 38%."
   - Rating: 5 stars
   - Avatar: Image

3. **Emily Rodriguez**
   - Role: Business Coach, 100K followers
   - Quote: "As a solo entrepreneur, time is my most valuable asset. DMPilot gives me 10+ hours back every week while actually improving my client acquisition. It's a no-brainer."
   - Rating: 5 stars
   - Avatar: Image

**Statistics**:
- "500+ Creators using DMPilot"
- "2M+ DMs automated"
- "340% Average conversion increase"
- "4.9/5 Average user rating"

### Key Implementation Details

**Component Structure**:
```typescript
'use client';

import { motion } from 'framer-motion';
import { SectionContainer } from '../shared/SectionContainer';
import { SectionHeader } from '../shared/SectionHeader';
import { TestimonialCard } from '../shared/TestimonialCard';
import { StatisticDisplay } from '../data-viz/StatisticDisplay';

export function SocialProof() {
  const testimonials = [
    {
      quote: "DMPilot transformed how I engage with my audience. I went from missing 80% of DMs to responding to every commenter within minutes. My course sales increased by 340%.",
      author: "Sarah Chen",
      role: "Fitness Creator, 250K followers",
      rating: 5,
      avatar: "/images/testimonials/sarah.jpg",
    },
    {
      quote: "We were losing customers because we couldn't respond fast enough. DMPilot solved that overnight. Our conversion rate from comments to sales jumped from 12% to 38%.",
      author: "Marcus Johnson",
      role: "E-commerce Brand Owner, 50K followers",
      rating: 5,
      avatar: "/images/testimonials/marcus.jpg",
    },
    {
      quote: "As a solo entrepreneur, time is my most valuable asset. DMPilot gives me 10+ hours back every week while actually improving my client acquisition. It's a no-brainer.",
      author: "Emily Rodriguez",
      role: "Business Coach, 100K followers",
      rating: 5,
      avatar: "/images/testimonials/emily.jpg",
    },
  ];

  const statistics = [
    { value: 500, label: "Creators using DMPilot", suffix: "+" },
    { value: 2, label: "DMs automated", suffix: "M+" },
    { value: 340, label: "Average conversion increase", suffix: "%" },
    { value: 4.9, label: "Average user rating", suffix: "/5" },
  ];

  return (
    <SectionContainer variant="light" padding="lg">
      <SectionHeader
        title="Trusted by 500+ Creators Worldwide"
        subtitle="See how creators are using DMPilot to grow their businesses."
        align="center"
      />
      
      {/* Statistics */}
      <StatisticDisplay statistics={statistics} className="mb-16" />
      
      {/* Testimonials */}
      <div className="grid md:grid-cols-3 gap-6">
        {testimonials.map((testimonial, index) => (
          <TestimonialCard
            key={index}
            quote={testimonial.quote}
            author={testimonial.author}
            role={testimonial.role}
            avatar={testimonial.avatar}
            rating={testimonial.rating}
          />
        ))}
      </div>
      
      {/* Social Logos */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mt-16 text-center"
      >
        <p className="text-gray-500 mb-6">Featured in</p>
        <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
          {['TechCrunch', 'Forbes', 'Entrepreneur', 'Social Media Today'].map((publication) => (
            <span key={publication} className="text-xl font-semibold text-gray-400">
              {publication}
            </span>
          ))}
        </div>
      </motion.div>
    </SectionContainer>
  );
}
```

### Styling Considerations

- **Testimonial Cards**: Clean cards with avatar, quote, and rating
- **Statistics Display**: Large numbers with animated counters
- **Publication Logos**: Subtle grayscale logos for credibility
- **Color Scheme**: Consistent with brand colors

### Responsive Design

- **Mobile**: Single column for testimonials
- **Tablet**: Two columns for testimonials
- **Desktop**: Three columns for testimonials

---

## FAQ Section

### Purpose
The FAQ section addresses common questions and objections, reducing friction in the decision-making process.

### Content

**Headline**: "Frequently Asked Questions"

**Subtitle**: "Everything you need to know about DMPilot."

**FAQ Categories**:

**Getting Started**
- How do I connect my Instagram account?
- How long does setup take?
- Do I need technical skills?

**Pricing & Plans**
- What are the pricing plans?
- Is there a free trial?
- What payment methods do you accept?

**Features & Functionality**
- How does the AI work?
- Can I customize the responses?
- What happens if Instagram changes their API?

**Privacy & Security**
- Is my data safe?
- Do you store my messages?
- Are you GDPR compliant?

**Support**
- What kind of support do you offer?
- How do I cancel my subscription?
- Can I get a refund?

### Key Implementation Details

**Component Structure**:
```typescript
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { SectionContainer } from '../shared/SectionContainer';
import { SectionHeader } from '../shared/SectionHeader';

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      category: "Getting Started",
      questions: [
        {
          question: "How do I connect my Instagram account?",
          answer: "Connecting your Instagram account takes just 2 clicks. Simply click 'Connect Instagram' in your dashboard, authorize DMPilot through Instagram's official login, and you're ready to go. We use Instagram's official Graph API for a secure connection.",
        },
        {
          question: "How long does setup take?",
          answer: "Most users are up and running in under 5 minutes. The basic setup involves connecting your Instagram account and setting up your first automation rule. Our guided walkthrough makes it simple even if you're not tech-savvy.",
        },
        {
          question: "Do I need technical skills?",
          answer: "Not at all! DMPilot is designed for creators, not developers. Our interface is intuitive and we provide step-by-step guides. If you can use Instagram, you can use DMPilot.",
        },
      ],
    },
    {
      category: "Pricing & Plans",
      questions: [
        {
          question: "What are the pricing plans?",
          answer: "We offer three plans: Starter ($29/month), Pro ($79/month), and Enterprise (custom pricing). Each plan includes different features and DM limits. All plans include a 14-day free trial.",
        },
        {
          question: "Is there a free trial?",
          answer: "Yes! All plans include a 14-day free trial with full access to features. No credit card required to start. You can upgrade, downgrade, or cancel at any time.",
        },
        {
          question: "What payment methods do you accept?",
          answer: "We accept all major credit cards (Visa, Mastercard, American Express), PayPal, and bank transfers for Enterprise plans. All payments are processed securely through Stripe.",
        },
      ],
    },
    {
      category: "Features & Functionality",
      questions: [
        {
          question: "How does the AI work?",
          answer: "Our AI analyzes comment context, tone, and intent to craft personalized responses. It learns from your previous responses to match your voice. The AI is designed to sound human, not robotic.",
        },
        {
          question: "Can I customize the responses?",
          answer: "Absolutely! You can create custom response templates, set up rules for different types of comments, and approve responses before they're sent. You have full control over the automation.",
        },
        {
          question: "What happens if Instagram changes their API?",
          answer: "We stay up-to-date with all Instagram API changes and update our platform accordingly. Your automation will continue working seamlessly. We monitor Instagram's developer updates daily.",
        },
      ],
    },
    {
      category: "Privacy & Security",
      questions: [
        {
          question: "Is my data safe?",
          answer: "Your data is encrypted at rest and in transit using industry-standard encryption. We never sell your data to third parties. Your security is our top priority.",
        },
        {
          question: "Do you store my messages?",
          answer: "We store message metadata (timestamps, response times) for analytics purposes, but we don't store the actual content of your DMs unless you explicitly enable message history for training purposes.",
        },
        {
          question: "Are you GDPR compliant?",
          answer: "Yes, DMPilot is fully GDPR compliant. We have a Data Processing Agreement (DPA) available, and you can request data deletion at any time. Our servers are hosted in the EU.",
        },
      ],
    },
  ];

  return (
    <SectionContainer variant="default" padding="lg">
      <SectionHeader
        title="Frequently Asked Questions"
        subtitle="Everything you need to know about DMPilot."
        align="center"
      />
      
      <div className="max-w-3xl mx-auto space-y-8">
        {faqs.map((category, categoryIndex) => (
          <div key={categoryIndex}>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {category.category}
            </h3>
            <div className="space-y-3">
              {category.questions.map((faq, faqIndex) => {
                const index = categoryIndex * 100 + faqIndex;
                const isOpen = openIndex === index;
                
                return (
                  <motion.div
                    key={index}
                    className="bg-gray-50 rounded-lg overflow-hidden"
                  >
                    <button
                      onClick={() => setOpenIndex(isOpen ? null : index)}
                      className="w-full px-6 py-4 flex items-center justify-between text-left"
                    >
                      <span className="font-medium text-gray-900">
                        {faq.question}
                      </span>
                      {isOpen ? (
                        <ChevronUp className="h-5 w-5 text-gray-500 flex-shrink-0 ml-4" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-500 flex-shrink-0 ml-4" />
                      )}
                    </button>
                    
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="px-6 pb-4 text-gray-600">
                            {faq.answer}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      
      {/* Still Have Questions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mt-12 text-center"
      >
        <p className="text-gray-600 mb-4">
          Still have questions?
        </p>
        <a
          href="mailto:support@dmpilot.com"
          className="text-blue-600 font-semibold hover:text-blue-700 transition-colors"
        >
          Contact our support team →
        </a>
      </motion.div>
    </SectionContainer>
  );
}
```

### Styling Considerations

- **Accordion Design**: Clean expandable sections
- **Category Grouping**: Organized by category for easy navigation
- **Typography**: Clear question/answer hierarchy
- **Animation**: Smooth expand/collapse transitions

### Responsive Design

- **Mobile**: Full-width accordions
- **Tablet**: Same as mobile
- **Desktop**: Centered with max-width

---

## Final CTA Section

### Purpose
The Final CTA section provides one last opportunity to convert visitors before they leave the page.

### Content

**Headline**: "Ready to Turn Comments into Customers?"

**Subtitle**: "Join 500+ creators who are already using DMPilot to grow their businesses."

**Primary CTA**: "Start Your Free Trial"
**Secondary CTA**: "Schedule a Demo"

**Trust Indicators**:
- "14-day free trial, no credit card required"
- "Cancel anytime, no questions asked"
- "24/7 support available"

### Key Implementation Details

**Component Structure**:
```typescript
'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Calendar, Shield, Headphones } from 'lucide-react';
import { SectionContainer } from '../shared/SectionContainer';
import { CTAButton } from '../shared/CTAButton';
import { EmailCapture } from '../shared/EmailCapture';

export function FinalCTA() {
  const handleEmailSubmit = async (email: string) => {
    // Submit to waitlist API
    await fetch('/api/waitlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
  };

  return (
    <SectionContainer variant="gradient" padding="xl" className="relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-blue-700" />
      <div className="absolute inset-0 bg-black/10" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative z-10 text-center"
      >
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
          Ready to Turn Comments into Customers?
        </h2>
        
        <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-3xl mx-auto">
          Join 500+ creators who are already using DMPilot to grow their businesses.
        </p>
        
        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <CTAButton
            variant="primary"
            size="lg"
            href="/signup"
            className="bg-white text-blue-600 hover:bg-gray-100"
          >
            Start Your Free Trial
            <ArrowRight className="ml-2 h-5 w-5" />
          </CTAButton>
          <CTAButton
            variant="outline"
            size="lg"
            href="/demo"
            className="border-white text-white hover:bg-white/10"
          >
            <Calendar className="mr-2 h-5 w-5" />
            Schedule a Demo
          </CTAButton>
        </div>
        
        {/* Email Capture */}
        <div className="max-w-md mx-auto mb-12">
          <EmailCapture
            onSubmit={handleEmailSubmit}
            placeholder="Enter your email"
            buttonText="Get Started"
            successMessage="Check your inbox for next steps!"
            className="bg-white/10 backdrop-blur-sm"
          />
        </div>
        
        {/* Trust Indicators */}
        <div className="flex flex-wrap justify-center gap-8 text-white/80">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            <span>14-day free trial</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            <span>No credit card required</span>
          </div>
          <div className="flex items-center gap-2">
            <Headphones className="h-5 w-5" />
            <span>24/7 support</span>
          </div>
        </div>
      </motion.div>
    </SectionContainer>
  );
}
```

### Styling Considerations

- **Gradient Background**: Blue to purple gradient for visual impact
- **White Text**: High contrast for readability
- **Trust Indicators**: Icons with text for credibility
- **Email Form**: Semi-transparent background with blur

### Responsive Design

- **Mobile**: Stack CTAs vertically
- **Tablet**: Horizontal CTAs
- **Desktop**: Full layout with all elements

---

## Footer Section

### Purpose
The Footer provides navigation, legal information, and additional resources.

### Content

**Columns**:

1. **Product**
   - Features
   - Pricing
   - Integrations
   - API

2. **Company**
   - About
   - Blog
   - Careers
   - Press

3. **Resources**
   - Documentation
   - Help Center
   - Community
   - Status

4. **Legal**
   - Privacy Policy
   - Terms of Service
   - Cookie Policy
   - GDPR

**Social Links**:
- Twitter
- Instagram
- LinkedIn
- YouTube

**Copyright**: © 2024 DMPilot. All rights reserved.

### Key Implementation Details

**Component Structure**:
```typescript
'use client';

import { motion } from 'framer-motion';
import { Twitter, Instagram, Linkedin, Youtube } from 'lucide-react';
import Link from 'next/link';

export function Footer() {
  const footerLinks = {
    product: [
      { label: 'Features', href: '/features' },
      { label: 'Pricing', href: '/pricing' },
      { label: 'Integrations', href: '/integrations' },
      { label: 'API', href: '/api' },
    ],
    company: [
      { label: 'About', href: '/about' },
      { label: 'Blog', href: '/blog' },
      { label: 'Careers', href: '/careers' },
      { label: 'Press', href: '/press' },
    ],
    resources: [
      { label: 'Documentation', href: '/docs' },
      { label: 'Help Center', href: '/help' },
      { label: 'Community', href: '/community' },
      { label: 'Status', href: '/status' },
    ],
    legal: [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Cookie Policy', href: '/cookies' },
      { label: 'GDPR', href: '/gdpr' },
    ],
  };

  const socialLinks = [
    { icon: Twitter, href: 'https://twitter.com/dmpilot', label: 'Twitter' },
    { icon: Instagram, href: 'https://instagram.com/dmpilot', label: 'Instagram' },
    { icon: Linkedin, href: 'https://linkedin.com/company/dmpilot', label: 'LinkedIn' },
    { icon: Youtube, href: 'https://youtube.com/dmpilot', label: 'YouTube' },
  ];

  return (
    <footer className="bg-gray-900 text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          {/* Logo & Description */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <h3 className="text-2xl font-bold text-white mb-4">DMPilot</h3>
            <p className="text-sm leading-relaxed">
              Turn comments into customers with intelligent DM automation.
            </p>
          </div>
          
          {/* Product Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Product</h4>
            <ul className="space-y-2">
              {footerLinks.product.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Company Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Resources Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Resources</h4>
            <ul className="space-y-2">
              {footerLinks.resources.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Legal Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Legal</h4>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* Social Links & Copyright */}
        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                aria-label={social.label}
                className="hover:text-white transition-colors"
              >
                <social.icon className="h-5 w-5" />
              </a>
            ))}
          </div>
          
          <p className="text-sm">
            © 2024 DMPilot. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
```

### Styling Considerations

- **Dark Background**: Gray-900 for contrast with white sections
- **Link Hover**: White on hover for visual feedback
- **Column Layout**: Organized by category
- **Social Icons**: Consistent sizing and spacing

### Responsive Design

- **Mobile**: Single column, stack all links
- **Tablet**: Two columns
- **Desktop**: Five columns

---

## Section Integration

### Complete Landing Page Flow

1. **Hero** → Capture attention, primary CTA
2. **Problem** → Validate pain points
3. **Data Visualization** → Build credibility
4. **Solution** → Present the answer
5. **Product Demo** → Show it in action
6. **Target Audience** → Help users identify
7. **Values** → Build trust and alignment
8. **Comparison** → Differentiate from competitors
9. **Integrations** → Show ecosystem fit
10. **Social Proof** → Build trust with testimonials
11. **FAQ** → Address objections
12. **Final CTA** → Last conversion opportunity
13. **Footer** → Navigation and legal

### Consistency Across Sections

- **Color Scheme**: Consistent blue/purple gradient
- **Typography**: Same font hierarchy
- **Animation**: Similar patterns throughout
- **Spacing**: Consistent padding and margins
- **Components**: Reuse shared components
