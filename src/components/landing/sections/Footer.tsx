'use client';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <p className="text-gray-600">Goodnight. Sleep well.</p>
          <p className="text-gray-500">— The DMPilot team</p>
        </div>
        <div className="text-center text-sm text-gray-500">
          <p>© {currentYear} DMPilot. All rights reserved.</p>
          <p className="mt-2">Made with care for creators</p>
        </div>
      </div>
    </footer>
  );
}
