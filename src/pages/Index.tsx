import React from 'react';
import menuBg from '@/assets/menu-bg.jpg';
import { MenuNavProvider } from '@/hooks/useMenuNav';
import { AuthProvider } from '@/hooks/useAuth';
import MenuHeader from '@/components/menu/MenuHeader';
import ScreenRouter from '@/components/menu/ScreenRouter';
import LoadoutBand from '@/components/menu/LoadoutBand';

const Index: React.FC = () => {
  return (
    <AuthProvider>
    <MenuNavProvider>
      <div
        id="overlay"
        className="grid place-items-center w-screen h-screen p-3 sm:p-5"
        style={{
          backgroundImage: `url(${menuBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Dim overlay for game visibility behind */}
        <div className="fixed inset-0 bg-background/60 backdrop-blur-sm pointer-events-none" />

        <div id="menu-stage" className="w-full h-full flex items-center justify-center relative z-10">
          <main
            id="menu-shell"
            className="menu-shell-v4 glass-surface w-full max-w-[960px] h-full max-h-[740px] flex flex-col overflow-hidden relative"
            style={{ borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-lift)' }}
          >
            <div id="menu-surface" className="flex flex-col h-full overflow-hidden">
              <MenuHeader />

              {/* Inline toast */}
              <div id="menu-inline-toast" className="hidden px-5 py-1.5 text-xs text-primary font-orbitron" />

              {/* Active match strip placeholder */}
              <div id="active-match-shell" className="hidden" />
              <div id="active-match-header-feedback" className="hidden" />

              {/* Scrollable body */}
              <section
                id="menu-body"
                className="flex-1 overflow-y-auto px-4 sm:px-5 py-4 min-h-0"
              >
                <div id="menu-screen-mode" className="menu-screen h-full" data-screen="main">
                  <ScreenRouter />
                </div>
              </section>

              {/* Loadout pinned at bottom */}
              <LoadoutBand />
            </div>
          </main>
        </div>
      </div>
    </MenuNavProvider>
  );
};

export default Index;
