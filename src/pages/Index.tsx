import React, { useState } from 'react';
import menuBg from '@/assets/menu-bg.jpg';
import MenuHeader from '@/components/menu/MenuHeader';
import HomeHero from '@/components/menu/HomeHero';
import SocialHero from '@/components/menu/SocialHero';
import LoadoutBand from '@/components/menu/LoadoutBand';

const Index: React.FC = () => {
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <div
      id="overlay"
      className="v4-overhaul grid place-items-center w-screen h-screen p-4 sm:p-5"
      style={{
        backgroundImage: `url(${menuBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div id="menu-stage" className="w-full h-full flex items-center justify-center">
        <main
          id="menu-shell"
          className="menu-shell-v4 glass-surface w-full max-w-[1100px] h-full max-h-[800px] flex flex-col overflow-hidden relative"
          style={{ borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-lift)' }}
        >
          <div id="menu-surface" className="flex flex-col h-full overflow-hidden">
            {/* Header */}
            <MenuHeader
              partyId="#4A7F"
              onSettingsClick={() => setSettingsOpen(!settingsOpen)}
              onBackClick={() => {}}
            />

            {/* Settings overlay */}
            {settingsOpen && (
              <div id="utility-overlay" className="absolute inset-0 z-50 bg-background/80 backdrop-blur-xl flex items-center justify-center p-6 animate-fade-in-up" style={{ animationDuration: '0.2s', borderRadius: 'var(--radius-xl)' }}>
                <div id="utility-modal" className="glass-card p-8 w-full max-w-md flex flex-col gap-4">
                  <h2 className="font-orbitron text-lg font-bold text-foreground">SETTINGS</h2>
                  {['ACCOUNT', 'CONTROLS', 'SOUND', 'GRAPHICS', 'MANUAL'].map(item => (
                    <button key={item} className="pill-btn w-full justify-center !py-3">{item}</button>
                  ))}
                  <button className="pill-btn active w-full justify-center !py-3 mt-2" onClick={() => setSettingsOpen(false)}>CLOSE</button>
                </div>
              </div>
            )}

            {/* Inline toast (hidden) */}
            <div id="menu-inline-toast" className="hidden px-6 py-2 text-xs text-primary font-orbitron" />

            {/* Main body - scrollable */}
            <section
              id="menu-body"
              className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-6"
            >
              <div id="menu-screen-mode" className="menu-screen" data-screen="main">
                <div id="menu-main-heroes" className="grid grid-cols-1 md:grid-cols-2 gap-4" data-columns="2">
                  <HomeHero />
                  <SocialHero />
                </div>
              </div>
            </section>

            {/* Loadout Band */}
            <LoadoutBand />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
