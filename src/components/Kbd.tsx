import React from 'react';

interface KbdProps { children: React.ReactNode; variant?: 'default' | 'accent' | 'subtle'; className?: string; size?: 'sm' | 'md' | 'lg'; }
export const Kbd: React.FC<KbdProps> = ({ children, variant = 'default', className = '', size = 'md' }) => (
  <kbd className={`mc-kbd mc-kbd-${variant} mc-kbd-${size} ${className}`}>{children}</kbd>
);