import React, { useState } from 'react';
import { UserPlus, ArrowRight, Users, UserMinus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface FakeFriend {
  name: string;
  status: 'online' | 'away' | 'offline';
  inGame: boolean;
}

const INITIAL_FRIENDS: FakeFriend[] = [
  { name: 'xVortex', status: 'online', inGame: true },
  { name: 'NightOwl', status: 'online', inGame: false },
  { name: 'BlazeFury', status: 'away', inGame: false },
  { name: 'ShadowKnight', status: 'offline', inGame: false },
];

const SocialScreen: React.FC = () => {
  const [friendId, setFriendId] = useState('');
  const [friends, setFriends] = useState<FakeFriend[]>(INITIAL_FRIENDS);
  const [removeMode, setRemoveMode] = useState(false);
  const [confirmingFriend, setConfirmingFriend] = useState<string | null>(null);

  const [partyMembers, setPartyMembers] = useState([
    { name: 'You', isLeader: true },
    { name: 'xVortex', isLeader: false },
  ]);

  const removeFriend = (name: string) => {
    setFriends(prev => {
      const next = prev.filter(f => f.name !== name);
      if (next.length === 0) setRemoveMode(false);
      return next;
    });
    setConfirmingFriend(null);
    toast({ title: `Removed ${name}` });
  };

  const isSolo = partyMembers.length <= 1;

  return (
    <div className="flex flex-col gap-4 h-full">
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
          <button
            className="pill-btn active !rounded-xl !px-3"
            title="Invite"
            onClick={() => {
              if (!friendId.trim()) return;
              toast({ title: 'Invite sent', description: `Invited ${friendId}` });
              setFriendId('');
            }}
          >
            <UserPlus className="w-3.5 h-3.5" />
          </button>
          <button
            className="pill-btn !rounded-xl !px-3"
            title="Join"
            onClick={() => {
              if (!friendId.trim()) return;
              toast({ title: 'Joining friend...', description: friendId });
              setFriendId('');
            }}
          >
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            className={`pill-btn !rounded-xl !px-3 gap-1.5 ${removeMode ? 'text-destructive border-destructive/50 bg-destructive/10' : 'text-destructive border-destructive/30 hover:bg-destructive/10'}`}
            title="Remove Friend"
            onClick={() => {
              setRemoveMode(!removeMode);
              setConfirmingFriend(null);
            }}
          >
            <UserMinus className="w-3.5 h-3.5" />
            <span className="text-[10px] font-orbitron">REMOVE</span>
          </button>
        </div>
      </div>

      {/* Party Section */}
      {!isSolo && (
        <div id="menu-party-hero" className="glass-card p-4 flex flex-col gap-3">
          <span className="section-label flex items-center gap-1.5">
            <Users className="w-3 h-3 text-primary" /> YOUR PARTY
          </span>
          <div id="party-hero-members" className="flex flex-col gap-1.5 max-h-[150px] overflow-y-auto">
            {partyMembers.map(m => (
              <div key={m.name} className="flex items-center justify-between px-3 py-2 rounded-xl bg-muted/20">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-400" />
                  <span className="font-rajdhani font-semibold text-sm text-foreground">{m.name}</span>
                  {m.isLeader && <span className="text-[9px] font-orbitron text-primary tracking-wider">LEADER</span>}
                </div>
                {!m.isLeader && (
                  <button
                    className="pill-btn !rounded-lg !px-2 !py-1 text-[9px]"
                    title="Remove"
                    onClick={() => {
                      setPartyMembers(prev => prev.filter(p => p.name !== m.name));
                      toast({ title: `Kicked ${m.name}` });
                    }}
                  >
                    <UserMinus className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
          <div id="menu-party-actions">
            <button
              id="party-hero-leave-btn"
              className="pill-btn !rounded-xl w-full justify-center !py-2.5 text-destructive border-destructive/30 hover:bg-destructive/10"
              onClick={() => {
                setPartyMembers([{ name: 'You', isLeader: true }]);
                toast({ title: 'Left party' });
              }}
            >
              LEAVE PARTY
            </button>
          </div>
        </div>
      )}

      {/* Friends List */}
      <div id="menu-social-friends-pane" className="glass-card p-4 flex flex-col gap-3 flex-1 min-h-0">
        <span className="section-label flex items-center gap-1.5">
          <Users className="w-3 h-3 text-primary" /> FRIENDS ONLINE
        </span>
        <div id="social-friends-list" className="flex flex-col gap-1 overflow-y-auto">
          {friends.length === 0 && (
            <div className="text-center py-4 text-muted-foreground font-orbitron text-[9px] tracking-wider">
              NO FRIENDS YET — ADD SOMEONE!
            </div>
          )}
          {friends.map(f => (
            <div
              key={f.name}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors cursor-pointer group ${
                removeMode ? 'hover:bg-destructive/10 border border-transparent hover:border-destructive/20' : 'hover:bg-muted/30'
              } ${confirmingFriend === f.name ? 'bg-destructive/10 border border-destructive/20' : ''}`}
              onClick={() => {
                if (removeMode) {
                  setConfirmingFriend(confirmingFriend === f.name ? null : f.name);
                }
              }}
            >
              <div className="flex items-center gap-2.5">
                <div className={`w-2 h-2 rounded-full ${
                  f.status === 'online' ? 'bg-green-400' :
                  f.status === 'away' ? 'bg-yellow-500' : 'bg-muted-foreground/40'
                }`} />
                <span className="font-rajdhani font-semibold text-sm text-foreground">{f.name}</span>
              </div>
              <div className="flex items-center gap-2">
                {f.inGame && !confirmingFriend && (
                  <span className="text-[9px] font-orbitron text-primary tracking-wider">IN GAME</span>
                )}
                {confirmingFriend === f.name && (
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-orbitron text-destructive tracking-wider">REMOVE?</span>
                    <button
                      className="pill-btn !rounded-xl !px-3 !py-1 text-destructive border-destructive/30 bg-destructive/10 hover:bg-destructive/20"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFriend(f.name);
                      }}
                    >
                      <span className="text-[10px] font-orbitron">YES</span>
                    </button>
                    <button
                      className="pill-btn !rounded-xl !px-3 !py-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        setConfirmingFriend(null);
                      }}
                    >
                      <span className="text-[10px] font-orbitron">NO</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SocialScreen;
