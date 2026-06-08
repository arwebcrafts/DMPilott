'use client';

import { Button } from '@/components/ui/button';
import { Loader2, ArrowRight, Play } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CTAButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  href?: string;
  className?: string;
}

const variants = {
  primary: 'bg-slate-900 text-white hover:bg-slate-800',
  secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
  outline: 'border-2 border-gray-300 text-gray-900 hover:bg-gray-50 bg-transparent',
  ghost: 'text-gray-700 hover:bg-gray-100 border-0 bg-transparent',
};

const sizes = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
};

export function CTAButton({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  onClick,
  href,
  className,
}: CTAButtonProps) {
  const button = (
    <Button
      disabled={disabled || isLoading}
      onClick={onClick}
      className={cn(
        variants[variant],
        sizes[size],
        'font-semibold rounded-lg transition-all duration-200',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Loading...
        </>
      ) : (
        children
      )}
    </Button>
  );

  if (href) {
    return <a href={href}>{button}</a>;
  }

  return button;
}
