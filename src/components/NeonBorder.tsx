import { ReactNode } from 'react';

interface NeonBorderProps {
  children: ReactNode;
  className?: string;
  height?: string; // optional
}

export const NeonBorder = ({ children, className = '', height = '' }: NeonBorderProps) => {
  return (
    <div className={`relative rounded-2xl border-2 border-blue-200 shadow-[0_0_6px_#3b82f6] ${className} ${height}`}>
      <div className="relative z-10 bg-background rounded-2xl p-2">
        {children}
      </div>
    </div>
  );
};
