import type { LucideIcon } from 'lucide-react';
import {
  MessageSquare,
  Reply,
  Hash,
  Share2,
  Globe,
  Zap,
  Link2,
  BarChart3,
  Gift,
  Users,
  Store,
  Megaphone,
  GraduationCap,
} from 'lucide-react';

export type LiveFeature = {
  icon: LucideIcon;
  title: string;
  description: string;
  details: string[];
  badge: 'Live' | 'Coming soon';
};

export const LIVE_FEATURES: LiveFeature[] = [
  {
    icon: MessageSquare,
    title: 'Comment-to-DM Automation',
    description: 'When someone comments on your post or reel, DMPilot automatically sends them a personalized DM.',
    details: [
      'Works on Instagram posts and reels',
      'Works on Facebook Page posts',
      'Personalize with {name} and {username}',
      'Activity log for every send',
    ],
    badge: 'Live',
  },
  {
    icon: Reply,
    title: 'Public Comment Replies',
    description: 'Post a public reply under the comment after the DM goes out. Keeps engagement visible on your post.',
    details: [
      'Custom public reply template',
      'Fires after DM is queued',
      'Great for "Check your DMs!" flows',
    ],
    badge: 'Live',
  },
  {
    icon: Hash,
    title: 'Keyword & Any-Comment Triggers',
    description: 'Trigger on specific words like "PRICE" or "LINK", or automate every single comment.',
    details: [
      'Keyword match (case insensitive)',
      'Any-comment mode for max reach',
      'Multiple automations per account',
    ],
    badge: 'Live',
  },
  {
    icon: Share2,
    title: 'Instagram Business Login',
    description: 'Connect your Instagram Business or Creator account directly via official Meta OAuth.',
    details: [
      'No password sharing',
      'Secure token storage',
      'Reconnect anytime from dashboard',
    ],
    badge: 'Live',
  },
  {
    icon: Globe,
    title: 'Facebook Page Automation',
    description: 'Same comment-to-DM flow for Facebook Pages with public reply fallback.',
    details: [
      'Page post comment triggers',
      'DM when messaging is allowed',
      'Public reply fallback when blocked',
    ],
    badge: 'Live',
  },
  {
    icon: Zap,
    title: 'DM Auto-Reply',
    description: 'Automatically respond when someone DMs you first.',
    details: [
      'Template-based replies',
      'Variable personalization',
      'Separate from comment automations',
    ],
    badge: 'Live',
  },
  {
    icon: Link2,
    title: 'Link in Bio',
    description: 'Built-in Linktree-style page with links, themes, and analytics. No extra subscription.',
    details: [
      'Unlimited links and blocks',
      'Video embeds and product cards',
      'Email capture forms',
      'Custom themes and click analytics',
    ],
    badge: 'Live',
  },
  {
    icon: BarChart3,
    title: 'DM & Bio Analytics',
    description: 'Track DMs sent, delivery status, top automations, and link-in-bio clicks.',
    details: [
      'DM send history',
      'Automation performance',
      'Bio page click tracking',
    ],
    badge: 'Live',
  },
  {
    icon: Gift,
    title: 'Gift Offer Buttons',
    description: 'Send unlock links and gift offers inside Instagram and Facebook DMs.',
    details: [
      'Lead magnet delivery',
      'Unlock link buttons in DMs',
      'Great for freebies and downloads',
    ],
    badge: 'Live',
  },
];

export type Service = {
  icon: LucideIcon;
  title: string;
  tagline: string;
  description: string;
  benefits: string[];
  forWhom: string;
};

export const SERVICES: Service[] = [
  {
    icon: MessageSquare,
    title: 'Comment-to-DM',
    tagline: 'Turn comments into conversations',
    description:
      'Every comment on your post or reel is a warm lead. DMPilot catches it instantly and sends a personalized DM so you never miss a sale while you sleep.',
    benefits: [
      'Auto-DM on keyword or any comment',
      'Public reply under the comment',
      'Instagram + Facebook support',
      'Posts and reels covered',
    ],
    forWhom: 'Creators, coaches, and brands running comment-to-DM funnels',
  },
  {
    icon: Zap,
    title: 'DM Auto-Reply',
    tagline: 'Never leave a DM on read',
    description:
      'When someone messages you first, respond instantly with a template that sounds like you. Set it once and let it run.',
    benefits: [
      'Instant first-response',
      '{name} and {username} personalization',
      'Separate rules from comment automations',
      'Official Meta messaging APIs',
    ],
    forWhom: 'Busy founders and support-light teams',
  },
  {
    icon: Link2,
    title: 'Link in Bio',
    tagline: 'Your bio link, upgraded',
    description:
      'A premium link page built into DMPilot. Replace Linktree and keep clicks, design, and analytics in one place.',
    benefits: [
      'Drag-and-drop link blocks',
      'Custom themes and branding',
      'Video, product, and email blocks',
      'Click analytics included',
    ],
    forWhom: 'Anyone with "link in bio" in their Instagram profile',
  },
  {
    icon: BarChart3,
    title: 'Analytics & Insights',
    tagline: 'See what actually converts',
    description:
      'Know how many DMs went out, which automations perform best, and which bio links get clicked. No guessing.',
    benefits: [
      'DM delivery tracking',
      'Top automation rankings',
      'Bio page click stats',
      'Export-ready activity log',
    ],
    forWhom: 'Agencies and growth-minded creators',
  },
];

export const AUDIENCE_USE_CASES = [
  {
    icon: Users,
    title: 'Creators & Influencers',
    examples: ['Comment "LINK" for free guide', 'Reel comment funnels', 'Bio page for all offers'],
  },
  {
    icon: Megaphone,
    title: 'Agencies',
    examples: ['Multi-client automations', 'DM volume tracking', 'White-label bio pages'],
  },
  {
    icon: Store,
    title: 'E-commerce',
    examples: ['Price inquiry auto-DMs', 'Product link in bio', 'Gift offer delivery'],
  },
  {
    icon: GraduationCap,
    title: 'Coaches & Educators',
    examples: ['Webinar signup via comment', 'Lead magnet DMs', 'FAQ auto-replies'],
  },
];
