import React from 'react';
import { User, Gamepad2, Volume2, BookOpen, LogIn } from 'lucide-react';
import { useMenuNav } from '@/hooks/useMenuNav';
import { useAuth } from '@/hooks/useAuth';

const SettingsScreen: React.FC = () => {
  const { push } = useMenuNav();
  const { isLoggedIn } = useAuth();

  const items = [
    {
      id: 'auth',
      label: isLoggedIn ? 'PROFILE' : 'LOGIN',
      icon: isLoggedIn ? <User className="w-4 h-4" /> : <LogIn className="w-4 h-4" />,
      action: () => push('auth'),
      disabled: false,
    },
    { id: 'controls', label: 'CONTROLS', icon: <Gamepad2 className="w-4 h-4" />, action: () => push('controls'), disabled: false },
    { id: 'sound', label: 'SOUND', icon: <Volume2 className="w-4 h-4" />, action: undefined, disabled: true, sublabel: 'COMING SOON' },
    { id: 'manual', label: 'INSTRUCTIONS', icon: <BookOpen className="w-4 h-4" />, action: () => push('manual'), disabled: false },
  ];

  return (
    <div id="utility-overlay" className="flex flex-col gap-3">
      <div id="utility-modal" className="flex flex-col gap-2">
        {items.map(item => (
          <button
            key={item.id}
            className={`glass-card p-4 flex items-center gap-3 text-left w-full ${item.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer group'}`}
            onClick={item.disabled ? undefined : item.action}
            disabled={item.disabled}
          >
            <span className={`${item.disabled ? 'text-muted-foreground' : 'text-primary'} group-hover:scale-110 transition-transform`}>{item.icon}</span>
            <div className="flex flex-col">
              <span className="font-orbitron text-xs font-bold tracking-wider text-foreground">{item.label}</span>
              {'sublabel' in item && item.sublabel && (
                <span className="font-orbitron text-[8px] text-muted-foreground tracking-wider">{item.sublabel}</span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SettingsScreen;
