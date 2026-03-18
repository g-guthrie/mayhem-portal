import React from 'react';
import { Settings, ChevronLeft, Copy } from 'lucide-react';
import { useMenuNav, type MenuScreen } from '@/hooks/useMenuNav';

const SCREEN_TITLES: Record<MenuScreen, string> = {
  home: 'MAYHEM',
  social: 'SOCIAL',
  room: 'PRIVATE ROOM',
  settings: 'SETTINGS',
  auth: 'ACCOUNT',
  manual: 'FIELD MANUAL',
  controls: 'CONTROLS',
};

interface MenuHeaderProps {
  partyId: string;
}

const MenuHeader: React.FC<MenuHeaderProps> = ({ partyId }) => {
  const { current, history, pop, push } = useMenuNav();
  const canGoBack = history.length > 1;

  return (
    <header id="menu-header" className="px-4 sm:px-5 py-3 border-b border-border/30 flex-shrink-0">
      <div id="menu-header-main" className="flex items-center justify-between">
        <div id="menu-header-leading" className="flex items-center gap-2.5">
          {canGoBack && (
            <button
              id="menu-return-btn"
              className="pill-btn w-8 h-8 !p-0 flex items-center justify-center !rounded-xl"
              onClick={pop}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
          <span className="font-orbitron text-xs font-bold tracking-wider text-foreground">
            {SCREEN_TITLES[current]}
          </span>
          {current === 'home' && (
            <div id="menu-party-id-btn" className="pill-btn !rounded-xl gap-1.5 cursor-pointer group ml-2">
              <span id="menu-party-id-label" className="text-muted-foreground group-hover:text-foreground transition-colors text-[10px]">ID</span>
              <span id="menu-party-id-value" className="text-primary font-bold text-[10px]">{partyId}</span>
              <Copy className="w-2.5 h-2.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          )}
        </div>
        <div id="menu-header-actions">
          {current !== 'settings' && (
            <button
              id="utility-toggle-btn"
              className="pill-btn !rounded-xl gap-1.5"
              onClick={() => push('settings')}
            >
              <Settings className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[10px]">SETTINGS</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default MenuHeader;
