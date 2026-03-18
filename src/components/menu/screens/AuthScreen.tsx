import React, { useState, useRef } from 'react';
import { User, LogIn, LogOut, UserCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useMenuNav } from '@/hooks/useMenuNav';

const AuthScreen: React.FC = () => {
  const { isLoggedIn, user, displayName, login, logout } = useAuth();
  const { pop } = useMenuNav();
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const wasLoggedInOnMount = useRef(isLoggedIn);

  const handleLogin = () => {
    if (username.trim()) {
      login(username.trim());
      pop();
    }
  };

  const handleLogout = () => {
    logout();
    pop();
  };

  if (isLoggedIn && wasLoggedInOnMount.current) {
    return (
      <div className="flex flex-col gap-4">
        <div className="glass-card p-6 flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
            <UserCircle className="w-8 h-8 text-primary" />
          </div>
          <div className="text-center">
            <h2 className="font-orbitron text-lg font-bold text-foreground">{displayName}</h2>
            <p className="text-xs text-muted-foreground font-rajdhani mt-1">K/D: 2.4 · MATCHES: 142 · WIN RATE: 58%</p>
          </div>
        </div>

        <div className="glass-card p-4 flex flex-col gap-3">
          <div className="flex justify-between items-center px-2 py-1.5">
            <span className="font-rajdhani text-sm text-muted-foreground">RANK</span>
            <span className="font-orbitron text-xs font-bold text-primary">DIAMOND III</span>
          </div>
          <div className="flex justify-between items-center px-2 py-1.5">
            <span className="font-rajdhani text-sm text-muted-foreground">PLAYTIME</span>
            <span className="font-orbitron text-xs font-bold text-foreground">48H 23M</span>
          </div>
        </div>

        <button
          className="pill-btn w-full justify-center !py-3 text-destructive border-destructive/30 hover:bg-destructive/10 gap-2"
          onClick={handleLogout}
        >
          <LogOut className="w-3.5 h-3.5" /> LOG OUT
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="glass-card p-6 flex flex-col gap-4">
        <div className="text-center mb-2">
          <User className="w-8 h-8 text-primary mx-auto mb-2" />
          <h2 className="font-orbitron text-lg font-bold text-foreground">SIGN IN</h2>
          <p className="text-xs text-muted-foreground font-rajdhani mt-1">Enter your callsign and PIN</p>
        </div>

        <div className="flex flex-col gap-3">
          <input
            className="glass-input"
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
          />
          <input
            className="glass-input"
            type="password"
            placeholder="4-Digit PIN"
            maxLength={4}
            value={pin}
            onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
          />
        </div>

        <button
          className="launch-btn w-full gap-2"
          onClick={handleLogin}
        >
          <LogIn className="w-4 h-4" /> ENTER
        </button>
      </div>

      <button
        className="pill-btn w-full justify-center !py-3"
        onClick={pop}
      >
        PLAY AS GUEST
      </button>
    </div>
  );
};

export default AuthScreen;
