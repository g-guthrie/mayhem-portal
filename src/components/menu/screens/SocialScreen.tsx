import React, { useState } from 'react';
import { UserPlus, ArrowRight, Users, UserMinus, MessageSquare } from 'lucide-react';

const SocialScreen: React.FC = () => {
  const [friendId, setFriendId] = useState('');

  const fakeFriends = [
    { name: 'xVortex', status: 'online' as const, inGame: true },
    { name: 'NightOwl', status: 'online' as const, inGame: false },
    { name: 'BlazeFury', status: 'away' as const, inGame: false },
    { name: 'ShadowKnight', status: 'offline' as const, inGame: false },
  ];

  const partyMembers = [
    { name: 'You', isLeader: true },
    { name: 'xVortex', isLeader: false },
  ];

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Invite banner placeholder */}
      <div id="social-direct-invite-banner" className="hidden glass-card p-4 border-primary/30">
        <div id="social-direct-invite-copy" className="text-sm font-rajdhani text-foreground mb-2" />
        <div id="social-direct-invite-actions" className="flex gap-2">
          <button id="social-direct-invite-accept-btn" className="pill-btn active !rounded-xl flex-1">ACCEPT</button>
          <button id="social-direct-invite-dismiss-btn" className="pill-btn !rounded-xl flex-1">DISMISS</button>
        </div>
      </div>

      {/* Add Friend */}
      <div className="glass-card p-4 flex flex-col gap-3">
        <span className="section-label">ADD / JOIN FRIEND</span>
        <div className="flex gap-2">
          <input
            className="glass-input flex-1 !py-2 !text-xs"
            placeholder="Enter Friend ID"
            value={friendId}
            onChange={e => setFriendId(e.target.value)}
          />
          <button className="pill-btn active !rounded-xl !px-3" title="Invite">
            <UserPlus className="w-3.5 h-3.5" />
          </button>
          <button className="pill-btn !rounded-xl !px-3" title="Join">
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Party Section */}
      <div id="menu-party-hero" className="glass-card p-4 flex flex-col gap-3">
        <span className="section-label flex items-center gap-1.5">
          <Users className="w-3 h-3 text-primary" /> YOUR PARTY
        </span>
        <div id="party-hero-members" className="flex flex-col gap-1.5">
          {partyMembers.map(m => (
            <div key={m.name} className="flex items-center justify-between px-3 py-2 rounded-xl bg-muted/20">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400" />
                <span className="font-rajdhani font-semibold text-sm text-foreground">{m.name}</span>
                {m.isLeader && <span className="text-[9px] font-orbitron text-primary tracking-wider">LEADER</span>}
              </div>
              {!m.isLeader && (
                <button className="pill-btn !rounded-lg !px-2 !py-1 text-[9px]" title="Remove">
                  <UserMinus className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
        </div>
        <div id="menu-party-actions">
          <button id="party-hero-leave-btn" className="pill-btn !rounded-xl w-full justify-center !py-2.5 text-destructive border-destructive/30 hover:bg-destructive/10">
            LEAVE PARTY
          </button>
        </div>
      </div>

      {/* Friends List */}
      <div id="menu-social-friends-pane" className="glass-card p-4 flex flex-col gap-3 flex-1">
        <span className="section-label flex items-center gap-1.5">
          <Users className="w-3 h-3 text-primary" /> FRIENDS ONLINE
        </span>
        <div id="social-friends-list" className="flex flex-col gap-1">
          {fakeFriends.map(f => (
            <div key={f.name} className="flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors hover:bg-muted/30 cursor-pointer group">
              <div className="flex items-center gap-2.5">
                <div className={`w-2 h-2 rounded-full ${
                  f.status === 'online' ? 'bg-green-400' :
                  f.status === 'away' ? 'bg-yellow-500' : 'bg-muted-foreground/40'
                }`} />
                <span className="font-rajdhani font-semibold text-sm text-foreground">{f.name}</span>
              </div>
              <div className="flex items-center gap-2">
                {f.inGame && (
                  <span className="text-[9px] font-orbitron text-primary tracking-wider">IN GAME</span>
                )}
                <button className="pill-btn !rounded-lg !px-2 !py-1 text-[9px] opacity-0 group-hover:opacity-100 transition-opacity">
                  <UserPlus className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SocialScreen;
