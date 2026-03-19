import React from 'react';
import { MenuNavProvider } from '@/hooks/useMenuNav';
import { AuthProvider } from '@/hooks/useAuth';
import { RoomProvider, useRoom } from '@/hooks/useRoom';
import MenuHeader from '@/components/menu/MenuHeader';
import ScreenRouter from '@/components/menu/ScreenRouter';
import LoadoutBand from '@/components/menu/LoadoutBand';
import MatchOverlay from '@/components/menu/MatchOverlay';
import { GameBridgeSync } from '@/components/menu/GameBridgeSync';

/**
 * Overlay wrapper that toggles pointer-events based on match state.
 * During active unpaused gameplay, the overlay becomes transparent to input
 * so mouse/keyboard passes through to the Three.js canvas beneath.
 */
const OverlayShell: React.FC = () => {
  const { matchState, isPaused } = useRoom();

  // Overlay is interactive (blocks canvas input) when:
  // - Not in a match (menu is showing)
  // - In a match but paused (pause menu is showing)
  // - In post-match (results screen)
  // - In ready-check or countdown (overlay UI is active)
  const isOverlayInteractive = matchState !== 'in-match' || isPaused;

  // During active gameplay (in-match, not paused), hide the menu shell entirely
  // and only show the match overlay HUD
  const showMenuShell = matchState !== 'in-match' && matchState !== 'post-match';
  const showDimBackdrop = matchState !== 'in-match' || isPaused;

  return (
    <>
      <GameBridgeSync />

      <div
        id="overlay"
        className="fixed inset-0 z-40 grid place-items-center p-3 sm:p-5"
        style={{ pointerEvents: isOverlayInteractive ? 'auto' : 'none' }}
      >
        {/* Dim overlay — sits between canvas (z-0) and menu (z-40) */}
        {showDimBackdrop && (
          <div className="fixed inset-0 bg-background/40 backdrop-blur-sm pointer-events-none" />
        )}

        {showMenuShell && (
          <div id="menu-stage" className="w-full h-full flex items-center justify-center relative z-10">
            <main
              id="menu-shell"
              className="menu-shell-v4 glass-surface w-full max-w-[960px] max-h-full flex flex-col overflow-hidden relative"
              style={{ borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-lift)' }}
            >
              <div id="menu-surface" className="flex flex-col h-full overflow-hidden">
                <MenuHeader />
                <div id="menu-inline-toast" className="hidden px-5 py-1.5 text-xs text-primary font-orbitron" />
                <div id="active-match-shell" className="hidden" />
                <div id="active-match-header-feedback" className="hidden" />
                <section
                  id="menu-body"
                  className="flex-1 overflow-y-auto px-4 sm:px-5 py-4 min-h-0"
                >
                  <div id="menu-screen-mode" className="menu-screen" data-screen="main">
                    <ScreenRouter />
                  </div>
                </section>
                <LoadoutBand />
              </div>
            </main>
          </div>
        )}

        <MatchOverlay />
      </div>
    </>
  );
};

const Index: React.FC = () => {
  return (
    <AuthProvider>
    <RoomProvider>
    <MenuNavProvider>
      <OverlayShell />
    </MenuNavProvider>
    </RoomProvider>
    </AuthProvider>
  );
};

export default Index;
