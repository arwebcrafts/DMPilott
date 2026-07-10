import Link from 'next/link';

type AuthShellProps = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

export function AuthShell({ title, subtitle, children, footer }: AuthShellProps) {
  return (
    <div className="auth-page min-h-screen flex items-center justify-center px-4 py-12" style={{ background: 'var(--background)' }}>
      <div className="w-full max-w-md">
        <div className="auth-card rounded-2xl p-8 space-y-6 shadow-xl">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#e85d3a] to-[#f09433] flex items-center justify-center">
                <span className="text-white text-lg font-bold">D</span>
              </div>
              <span className="text-3xl font-bold auth-title">DMPilot</span>
            </div>
            <h1>{title}</h1>
            <p className="auth-subtitle">{subtitle}</p>
          </div>

          {children}

          {footer}
        </div>

        <div className="text-center mt-6">
          <Link href="/" className="text-sm auth-muted transition-colors">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
