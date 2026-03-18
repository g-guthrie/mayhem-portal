import React, { useState } from 'react';
import { Settings, ChevronLeft, Users, Copy, ArrowRight } from 'lucide-react';

interface MenuHeaderProps {
  partyId: string;
  onSettingsClick: () => void;
  onBackClick: () => void;
}

const MenuHeader: React.FC<MenuHeaderProps> = ({ partyId, onSettingsClick, onBackClick }) => {
  return (
    <header id="menu-header" className="px-6 py-4 border-b border-border/50">
      <div id="menu-header-main" className="flex items-center justify-between">
        <div id="menu-header-leading" className="flex items-center gap-3">
          <button
            id="menu-return-btn"
            className="pill-btn w-9 h-9 !p-0 flex items-center justify-center !rounded-xl"
            onClick={onBackClick}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div id="menu-party-id-btn" className="pill-btn !rounded-xl gap-1.5 cursor-pointer group">
            <span id="menu-party-id-label" className="text-muted-foreground group-hover:text-foreground transition-colors">PARTY</span>
            <span id="menu-party-id-value" className="text-primary font-bold">{partyId}</span>
            <Copy className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
        <div id="menu-header-actions">
          <button
            id="utility-toggle-btn"
            className="pill-btn !rounded-xl gap-1.5"
            onClick={onSettingsClick}
          >
            <Settings className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">SETTINGS</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default MenuHeader;
