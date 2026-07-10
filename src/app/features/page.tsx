import { Metadata } from 'next';
import { FeaturesPageClient } from './FeaturesPageClient';

export const metadata: Metadata = {
  title: 'Features - DMPilot',
  description: 'Every live feature in DMPilot: comment-to-DM automation, public replies, Link in Bio, analytics, and more.',
};

export default function FeaturesPage() {
  return <FeaturesPageClient />;
}
