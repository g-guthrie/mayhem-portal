import React, { useState } from 'react';
import { Crosshair, Bomb, Sword, Zap, Shield, Wind, Flame, Sparkles, Target, Eye, Heart, Anchor } from 'lucide-react';

type ThrowableCategory = 'grenade' | 'blade';

interface LoadoutItem {
  id: string;
  name: string;
  icon: React.ReactNode;
}

const WEAPONS: LoadoutItem[] = [
  { id: 'machinegun', name: 'MACHINE GUN', icon: <Crosshair className="w-4 h-4" /> },
  { id: 'shotgun', name: 'SHOTGUN', icon: <Crosshair className="w-4 h-4" /> },
  { id: 'rifle', name: 'RIFLE', icon: <Crosshair className="w-4 h-4" /> },
  { id: 'pistol', name: 'PISTOL', icon: <Crosshair className="w-4 h-4" /> },
  { id: 'sniper', name: 'SNIPER', icon: <Target className="w-4 h-4" /> },
];

const THROWABLE_CATEGORIES: { id: ThrowableCategory; label: string }[] = [
  { id: 'grenade', label: 'GRENADES' },
  { id: 'blade', label: 'BLADES & OBJECTS' },
];

const THROWABLES: Record<ThrowableCategory, LoadoutItem[]> = {
  grenade: [
    { id: 'frag', name: 'FRAG', icon: <Bomb className="w-4 h-4" /> },
    { id: 'plasma', name: 'PLASMA', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'molotov', name: 'MOLOTOV', icon: <Flame className="w-4 h-4" /> },
  ],
  blade: [
    { id: 'knife', name: 'KNIFE', icon: <Sword className="w-4 h-4" /> },
  ],
};

const ABILITIES: LoadoutItem[] = [
  { id: 'choke', name: 'VADER CHOKE', icon: <Wind className="w-4 h-4" /> },
  { id: 'hook', name: 'CHAIN HOOK', icon: <Anchor className="w-4 h-4" /> },
  { id: 'heal', name: 'HEAL', icon: <Heart className="w-4 h-4" /> },
  { id: 'missile', name: 'MISSILE', icon: <Zap className="w-4 h-4" /> },
  { id: 'deadeye', name: 'DEADEYE', icon: <Eye className="w-4 h-4" /> },
];

const LoadoutBand: React.FC = () => {
  const [weaponSlot, setWeaponSlot] = useState<0 | 1>(0);
  const [selectedWeapons, setSelectedWeapons] = useState<[string, string]>(['machinegun', 'shotgun']);
  const [throwableCategory, setThrowableCategory] = useState<ThrowableCategory>('grenade');
  const [selectedThrowable, setSelectedThrowable] = useState('frag');
  const [abilitySlot, setAbilitySlot] = useState<0 | 1>(0);
  const [selectedAbilities, setSelectedAbilities] = useState<[string, string]>(['choke', 'missile']);
  const [collapsed, setCollapsed] = useState(false);

  const handleWeaponSelect = (id: string) => {
    setSelectedWeapons(prev => {
      const next: [string, string] = [...prev] as [string, string];
      const otherSlot = weaponSlot === 0 ? 1 : 0;
      if (next[otherSlot] === id) {
        next[otherSlot] = next[weaponSlot];
      }
      next[weaponSlot] = id;
      return next;
    });
  };

  const handleAbilitySelect = (id: string) => {
    setSelectedAbilities(prev => {
      const next: [string, string] = [...prev] as [string, string];
      const otherSlot = abilitySlot === 0 ? 1 : 0;
      if (next[otherSlot] === id) {
        next[otherSlot] = next[abilitySlot];
      }
      next[abilitySlot] = id;
      return next;
    });
  };

  const getWeaponName = (id: string) => WEAPONS.find(w => w.id === id)?.name ?? id;
  const getAbilityName = (id: string) => ABILITIES.find(a => a.id === id)?.name ?? id;

  return (
    <footer id="menu-loadout-band" className="border-t border-border/30">
      <div className="px-4 sm:px-6 py-3">
        {/* Collapse / Summary row */}
        <div className="flex items-center justify-between mb-2">
          <button
            id="loadout-collapse-btn"
            className="pill-btn !py-1.5 !px-3 text-[10px]"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? '▲ EXPAND LOADOUT' : '▼ COLLAPSE'}
          </button>

          {collapsed && (
            <div id="loadout-collapsed-row" className="flex gap-3">
              <button id="weapon-slot-summary" className="pill-btn !rounded-xl !py-1.5 text-[10px]" onClick={() => setCollapsed(false)}>
                <Crosshair className="w-3 h-3" /> {getWeaponName(selectedWeapons[0])} / {getWeaponName(selectedWeapons[1])}
              </button>
              <button id="throwable-slot-summary" className="pill-btn !rounded-xl !py-1.5 text-[10px]" onClick={() => setCollapsed(false)}>
                <Bomb className="w-3 h-3" /> {selectedThrowable.toUpperCase()}
              </button>
              <button id="ability-slot-summary" className="pill-btn !rounded-xl !py-1.5 text-[10px]" onClick={() => setCollapsed(false)}>
                <Zap className="w-3 h-3" /> {getAbilityName(selectedAbilities[0])} / {getAbilityName(selectedAbilities[1])}
              </button>
            </div>
          )}
        </div>

        {/* Expanded loadout */}
        {!collapsed && (
          <div id="loadout-expanded-shell">
            <div id="loadout-row" className="loadout-grid grid grid-cols-1 sm:grid-cols-3 gap-3">

              {/* Weapons */}
              <div id="weapon-slot-panel" className="glass-card p-3 flex flex-col gap-3">
                <span className="section-label flex items-center gap-1.5">
                  <Crosshair className="w-3 h-3 text-primary" /> ARSENAL
                </span>
                <div className="slot-row flex gap-2">
                  <button
                    id="weapon-slot-primary"
                    className={`slot-btn flex-1 ${weaponSlot === 0 ? 'active' : ''}`}
                    onClick={() => setWeaponSlot(0)}
                  >
                    SLOT 1
                  </button>
                  <button
                    id="weapon-slot-secondary"
                    className={`slot-btn flex-1 ${weaponSlot === 1 ? 'active' : ''}`}
                    onClick={() => setWeaponSlot(1)}
                  >
                    SLOT 2
                  </button>
                </div>
                <div id="weapon-choice-grid" className="item-selection-grid grid grid-cols-3 gap-1.5 overflow-y-auto max-h-[200px]">
                  {WEAPONS.map(w => (
                    <button
                      key={w.id}
                      className={`weapon-choice-btn item-grid-btn ${selectedWeapons[weaponSlot] === w.id ? 'selected' : ''}`}
                      data-weapon-id={w.id}
                      onClick={() => handleWeaponSelect(w.id)}
                    >
                      {w.icon}
                      <span className="text-[10px] font-bold font-orbitron">{w.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Throwables */}
              <div id="throwable-slot-panel" className="glass-card p-3 flex flex-col gap-3">
                <span className="section-label flex items-center gap-1.5">
                  <Bomb className="w-3 h-3 text-primary" /> TACTICAL
                </span>
                <div id="throwable-category-tabs" className="category-tabs flex gap-1">
                  {THROWABLE_CATEGORIES.map(cat => (
                    <button
                      key={cat.id}
                      className={`throwable-cat-btn tab-btn flex-1 ${throwableCategory === cat.id ? 'active' : ''}`}
                      data-cat-id={cat.id}
                      onClick={() => setThrowableCategory(cat.id)}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
                <div id="throwable-choice-grid" className="item-selection-grid grid grid-cols-3 gap-1.5 overflow-y-auto max-h-[200px]">
                  {THROWABLES[throwableCategory].map(t => (
                    <button
                      key={t.id}
                      className={`throwable-choice-btn item-grid-btn ${selectedThrowable === t.id ? 'selected' : ''}`}
                      data-throwable-id={t.id}
                      data-category-id={throwableCategory}
                      onClick={() => setSelectedThrowable(t.id)}
                    >
                      {t.icon}
                      <span className="text-[10px] font-bold font-orbitron">{t.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Abilities */}
              <div id="ability-slot-panel" className="glass-card p-3 flex flex-col gap-3">
                <span className="section-label flex items-center gap-1.5">
                  <Zap className="w-3 h-3 text-primary" /> ABILITIES
                </span>
                <div className="slot-row flex gap-2">
                  <button
                    id="ability-slot-primary"
                    className={`slot-btn flex-1 ${abilitySlot === 0 ? 'active' : ''}`}
                    onClick={() => setAbilitySlot(0)}
                  >
                    ABILITY 1
                  </button>
                  <button
                    id="ability-slot-secondary"
                    className={`slot-btn flex-1 ${abilitySlot === 1 ? 'active' : ''}`}
                    onClick={() => setAbilitySlot(1)}
                  >
                    ABILITY 2
                  </button>
                </div>
                <div id="ability-choice-grid" className="item-selection-grid grid grid-cols-3 gap-1.5 overflow-y-auto max-h-[200px]">
                  {ABILITIES.map(a => (
                    <button
                      key={a.id}
                      className={`ability-choice-btn item-grid-btn ${selectedAbilities[abilitySlot] === a.id ? 'selected' : ''}`}
                      data-ability-id={a.id}
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
        )}
      </div>
    </footer>
  );
};

export default LoadoutBand;
