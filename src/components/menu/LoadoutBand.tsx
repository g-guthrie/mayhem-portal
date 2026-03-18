import React, { useState } from 'react';
import { Crosshair, Bomb, Sword, Disc, Zap, Shield, Wind, Flame, Snowflake, Sparkles } from 'lucide-react';

type ThrowableCategory = 'grenades' | 'blades' | 'objects';

interface LoadoutItem {
  id: string;
  name: string;
  icon: React.ReactNode;
}

const WEAPONS: LoadoutItem[] = [
  { id: 'ar', name: 'AR-15', icon: <Crosshair className="w-4 h-4" /> },
  { id: 'smg', name: 'SMG-X', icon: <Crosshair className="w-4 h-4" /> },
  { id: 'shotgun', name: 'PUMP', icon: <Crosshair className="w-4 h-4" /> },
  { id: 'sniper', name: 'BOLT', icon: <Crosshair className="w-4 h-4" /> },
  { id: 'pistol', name: 'DEAGLE', icon: <Crosshair className="w-4 h-4" /> },
  { id: 'lmg', name: 'HEAVY', icon: <Crosshair className="w-4 h-4" /> },
];

const THROWABLES: Record<ThrowableCategory, LoadoutItem[]> = {
  grenades: [
    { id: 'frag', name: 'FRAG', icon: <Bomb className="w-4 h-4" /> },
    { id: 'flash', name: 'FLASH', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'smoke', name: 'SMOKE', icon: <Wind className="w-4 h-4" /> },
    { id: 'molotov', name: 'FIRE', icon: <Flame className="w-4 h-4" /> },
  ],
  blades: [
    { id: 'knife', name: 'KNIFE', icon: <Sword className="w-4 h-4" /> },
    { id: 'axe', name: 'AXE', icon: <Sword className="w-4 h-4" /> },
    { id: 'shuriken', name: 'STAR', icon: <Disc className="w-4 h-4" /> },
  ],
  objects: [
    { id: 'decoy', name: 'DECOY', icon: <Disc className="w-4 h-4" /> },
    { id: 'mine', name: 'MINE', icon: <Bomb className="w-4 h-4" /> },
    { id: 'shield-obj', name: 'SHIELD', icon: <Shield className="w-4 h-4" /> },
  ],
};

const ABILITIES: LoadoutItem[] = [
  { id: 'dash', name: 'DASH', icon: <Zap className="w-4 h-4" /> },
  { id: 'shield-ab', name: 'SHIELD', icon: <Shield className="w-4 h-4" /> },
  { id: 'frost', name: 'FROST', icon: <Snowflake className="w-4 h-4" /> },
  { id: 'blaze', name: 'BLAZE', icon: <Flame className="w-4 h-4" /> },
  { id: 'stealth', name: 'STEALTH', icon: <Wind className="w-4 h-4" /> },
  { id: 'surge', name: 'SURGE', icon: <Sparkles className="w-4 h-4" /> },
];

const LoadoutBand: React.FC = () => {
  const [weaponSlot, setWeaponSlot] = useState<'primary' | 'secondary'>('primary');
  const [selectedWeapons, setSelectedWeapons] = useState<Record<string, string>>({ primary: 'ar', secondary: 'smg' });
  const [throwableCategory, setThrowableCategory] = useState<ThrowableCategory>('grenades');
  const [selectedThrowable, setSelectedThrowable] = useState('frag');
  const [abilitySlot, setAbilitySlot] = useState<'ability1' | 'ability2'>('ability1');
  const [selectedAbilities, setSelectedAbilities] = useState<Record<string, string>>({ ability1: 'dash', ability2: 'shield-ab' });

  const handleWeaponSelect = (id: string) => {
    setSelectedWeapons(prev => ({ ...prev, [weaponSlot]: id }));
  };

  const handleAbilitySelect = (id: string) => {
    setSelectedAbilities(prev => ({ ...prev, [abilitySlot]: id }));
  };

  return (
    <footer id="menu-loadout-band" className="border-t border-border/50 bg-background/40 backdrop-blur-md">
      <div className="px-4 sm:px-6 py-4">
        <div className="loadout-grid grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">

          {/* Weapons Column */}
          <div id="weapon-slot-panel" className="flex flex-col gap-3">
            <span className="section-label flex items-center gap-1.5">
              <Crosshair className="w-3 h-3 text-primary" /> ARSENAL
            </span>
            <div className="slot-row flex gap-2">
              <button
                className={`slot-btn flex-1 ${weaponSlot === 'primary' ? 'active' : ''}`}
                data-slot="primary"
                onClick={() => setWeaponSlot('primary')}
              >
                P1
              </button>
              <button
                className={`slot-btn flex-1 ${weaponSlot === 'secondary' ? 'active' : ''}`}
                data-slot="secondary"
                onClick={() => setWeaponSlot('secondary')}
              >
                S2
              </button>
            </div>
            <div className="item-selection-grid grid grid-cols-3 gap-1.5">
              {WEAPONS.map(w => (
                <button
                  key={w.id}
                  className={`item-grid-btn ${selectedWeapons[weaponSlot] === w.id ? 'selected' : ''}`}
                  onClick={() => handleWeaponSelect(w.id)}
                >
                  {w.icon}
                  <span className="text-[10px] font-bold font-orbitron">{w.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Throwables Column */}
          <div id="throwable-slot-panel" className="flex flex-col gap-3">
            <span className="section-label flex items-center gap-1.5">
              <Bomb className="w-3 h-3 text-primary" /> TACTICAL
            </span>
            <div className="category-tabs flex gap-1">
              {(['grenades', 'blades', 'objects'] as ThrowableCategory[]).map(cat => (
                <button
                  key={cat}
                  className={`tab-btn flex-1 ${throwableCategory === cat ? 'active' : ''}`}
                  onClick={() => setThrowableCategory(cat)}
                >
                  {cat.toUpperCase()}
                </button>
              ))}
            </div>
            <div className="item-selection-grid grid grid-cols-3 gap-1.5">
              {THROWABLES[throwableCategory].map(t => (
                <button
                  key={t.id}
                  className={`item-grid-btn ${selectedThrowable === t.id ? 'selected' : ''}`}
                  onClick={() => setSelectedThrowable(t.id)}
                >
                  {t.icon}
                  <span className="text-[10px] font-bold font-orbitron">{t.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Abilities Column */}
          <div id="ability-slot-panel" className="flex flex-col gap-3">
            <span className="section-label flex items-center gap-1.5">
              <Zap className="w-3 h-3 text-primary" /> ABILITIES
            </span>
            <div className="slot-row flex gap-2">
              <button
                className={`slot-btn flex-1 ${abilitySlot === 'ability1' ? 'active' : ''}`}
                data-slot="ability1"
                onClick={() => setAbilitySlot('ability1')}
              >
                A1
              </button>
              <button
                className={`slot-btn flex-1 ${abilitySlot === 'ability2' ? 'active' : ''}`}
                data-slot="ability2"
                onClick={() => setAbilitySlot('ability2')}
              >
                A2
              </button>
            </div>
            <div className="item-selection-grid grid grid-cols-3 gap-1.5">
              {ABILITIES.map(a => (
                <button
                  key={a.id}
                  className={`item-grid-btn ${selectedAbilities[abilitySlot] === a.id ? 'selected' : ''}`}
                  onClick={() => handleAbilitySelect(a.id)}
                >
                  {a.icon}
                  <span className="text-[10px] font-bold font-orbitron">{a.name}</span>
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
};

export default LoadoutBand;
