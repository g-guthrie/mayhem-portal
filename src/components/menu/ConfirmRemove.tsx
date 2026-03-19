import React from 'react';

/**
 * Inline "REMOVE? → YES / NO" confirmation pattern.
 * Used in friends list and party list for consistent remove UX.
 */
interface ConfirmRemoveProps {
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmRemove: React.FC<ConfirmRemoveProps> = ({ onConfirm, onCancel }) => (
  <div className="flex items-center gap-1.5">
    <span className="text-[8px] font-orbitron text-destructive tracking-wider">REMOVE?</span>
    <button
      className="pill-btn !px-1.5 !py-0.5 text-[8px] text-destructive border-destructive/30 bg-destructive/10 hover:bg-destructive/20"
      onClick={(e) => { e.stopPropagation(); onConfirm(); }}
    >
      YES
    </button>
    <button
      className="pill-btn !px-1.5 !py-0.5 text-[8px]"
      onClick={(e) => { e.stopPropagation(); onCancel(); }}
    >
      NO
    </button>
  </div>
);

export default ConfirmRemove;
