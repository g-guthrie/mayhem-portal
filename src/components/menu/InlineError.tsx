import React from 'react';

/**
 * Small inline error message shown next to action inputs.
 * Auto-clears via useSocial, but can also be dismissed by click.
 */
interface InlineErrorProps {
  message: string | null;
  onDismiss?: () => void;
}

const InlineError: React.FC<InlineErrorProps> = ({ message, onDismiss }) => {
  if (!message) return null;
  return (
    <span
      className="font-orbitron text-[8px] text-destructive tracking-wider animate-fade-in-up cursor-pointer"
      style={{ animationDuration: '0.15s' }}
      onClick={onDismiss}
    >
      {message}
    </span>
  );
};

export default InlineError;
