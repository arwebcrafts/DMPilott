import { Metadata } from 'next';
import { ServicesPageClient } from './ServicesPageClient';

export const metadata: Metadata = {
  title: 'Services - DMPilot',
  description: 'DMPilot services: comment-to-DM automation, DM auto-reply, Link in Bio, and analytics for Instagram and Facebook.',
};

export default function ServicesPage() {
  return <ServicesPageClient />;
}
