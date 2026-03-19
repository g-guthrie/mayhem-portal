import React, { useState } from 'react';
import { UserPlus, ArrowRight, Users, UserMinus, LogOut } from 'lucide-react';
import { useSocial, isValidId } from '@/hooks/useSocial';
import ConfirmRemove from '@/components/menu/ConfirmRemove';
import InlineError from '@/components/menu/InlineError';

const SocialScreen: React.FC = () => {
  const social = useSocial();
  const [friendId, setFriendId] = useState('');

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Add Friend */}
      <div className="glass-card p-4 flex flex-col gap-3">
        <span className="section-label">ADD / JOIN FRIEND</span>
        <div className="flex gap-2">
          <input
            className="glass-input flex-1 !py-2 !text-xs"
            placeholder="Enter Friend ID"
            maxLength={32}
            value={friendId}
            onChange={e => setFriendId(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && social.sendFriendRequest(friendId)) setFriendId(''); }}
          />
          <button
            className={`pill-btn active !rounded-xl !px-3 ${social.isInviteDisabled(friendId) ? 'opacity-50 cursor-not-allowed' : ''}`}
            title="Invite"
            onClick={() => {
              if (social.sendFriendRequest(friendId)) setFriendId('');
            }}
            disabled={social.isInviteDisabled(friendId)}
          >
            <UserPlus className="w-3.5 h-3.5" />
          </button>
          <button
            className={`pill-btn !rounded-xl !px-3 ${social.isInviteDisabled(friendId) ? 'opacity-50 cursor-not-allowed' : ''}`}
            title="Join"
            onClick={() => {
              const val = friendId.trim();
              if (!isValidId(val)) return;
              // TODO: wire to real join
              setFriendId('');
            }}
            disabled={social.isInviteDisabled(friendId)}
          >
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            className={`pill-btn !rounded-xl !px-3 gap-1.5 ${social.removeMode ? 'text-destructive border-destructive/50 bg-destructive/10' : 'text-destructive border-destructive/30 hover:bg-destructive/10'}`}
            title="Remove Friend"
            onClick={social.toggleRemoveMode}
          >
            <UserMinus className="w-3.5 h-3.5" />
            <span className="text-[10px] font-orbitron">REMOVE</span>
          </button>
        </div>
        <InlineError message={social.inlineError?.key === 'friend-add' ? social.inlineError.message : null} onDismiss={social.clearError} />
      </div>

      {/* Party Section */}
      {!social.isSolo && (
        <div id="menu-party-hero" className="glass-card p-4 flex flex-col gap-3">
          <span className="section-label flex items-center gap-1.5">
            <Users className="w-3 h-3 text-primary" /> YOUR PARTY
          </span>
          <div id="party-hero-members" className="flex flex-col gap-1.5 max-h-[150px] overflow-y-auto">
            {social.partyMembers.map(m => (
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
                    onClick={() => social.kickFromParty(m.name)}
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
              onClick={social.leaveParty}
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
          {social.friends.length === 0 && (
            <div className="text-center py-4 text-muted-foreground font-orbitron text-[9px] tracking-wider">
              NO FRIENDS YET — ADD SOMEONE!
            </div>
          )}
          {social.friends.map(f => (
            <div
              key={f.name}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors cursor-pointer group ${
                social.removeMode ? 'hover:bg-destructive/10 border border-transparent hover:border-destructive/20' : 'hover:bg-muted/30'
              } ${social.confirmingFriend === f.name ? 'bg-destructive/10 border border-destructive/20' : ''}`}
              onClick={() => { if (social.removeMode) social.startConfirm(f.name); }}
            >
              <div className="flex items-center gap-2.5">
                <div className={`w-2 h-2 rounded-full ${
                  f.status === 'online' ? 'bg-green-400' :
                  f.status === 'away' ? 'bg-yellow-500' : 'bg-muted-foreground/40'
                }`} />
                <span className="font-rajdhani font-semibold text-sm text-foreground">{f.name}</span>
              </div>
              <div className="flex items-center gap-2">
                {f.inGame && social.confirmingFriend !== f.name && (
                  <span className="text-[9px] font-orbitron text-primary tracking-wider">IN GAME</span>
                )}
                {social.confirmingFriend === f.name && (
                  <ConfirmRemove
                    onConfirm={() => social.removeFriend(f.name)}
                    onCancel={social.cancelConfirm}
                  />
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
