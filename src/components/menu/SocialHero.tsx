import React, { useState } from 'react';
import { UserPlus, ArrowRight, Users, Globe, UserMinus } from 'lucide-react';
import { useSocial, isValidId } from '@/hooks/useSocial';
import ConfirmRemove from '@/components/menu/ConfirmRemove';
import InlineError from '@/components/menu/InlineError';

const SocialHero: React.FC = () => {
  const social = useSocial();
  const [friendId, setFriendId] = useState('');
  const [roomCode, setRoomCode] = useState('');

  const friendIdValid = isValidId(friendId);
  const roomCodeValid = roomCode.trim().length >= 4;

  return (
    <div id="menu-social-hero" className="glass-card p-6 flex flex-col gap-5 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
      <div id="menu-social-layout" className="flex flex-col gap-4">
        <div id="menu-social-actions-pane" className="flex flex-col gap-3">
          {/* Friend ID */}
          <div id="social-friend-id-stack" className="flex gap-2">
            <input
              id="party-id-input"
              className="glass-input flex-1"
              placeholder="Friend ID"
              maxLength={32}
              value={friendId}
              onChange={e => setFriendId(e.target.value)}
            />
            <button
              id="invite-friend-btn"
              className={`pill-btn active !rounded-xl !px-3 ${!friendIdValid ? 'opacity-50 cursor-not-allowed' : ''}`}
              title="Invite"
              onClick={() => {
                if (social.sendFriendRequest(friendId)) setFriendId('');
              }}
              disabled={!friendIdValid}
            >
              <UserPlus className="w-4 h-4" />
            </button>
            <button
              id="join-friend-btn"
              className={`pill-btn !rounded-xl !px-3 ${!friendIdValid ? 'opacity-50 cursor-not-allowed' : ''}`}
              title="Join"
              onClick={() => {
                if (!isValidId(friendId)) return;
                // TODO: wire to real join
                setFriendId('');
              }}
              disabled={!friendIdValid}
            >
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              id="remove-friend-toggle-btn"
              className={`pill-btn !rounded-xl !px-3 gap-1.5 ${social.removeMode ? 'text-destructive border-destructive/50 bg-destructive/10' : 'text-destructive border-destructive/30 hover:bg-destructive/10'}`}
              title="Remove Friend"
              onClick={social.toggleRemoveMode}
            >
              <UserMinus className="w-4 h-4" />
              <span className="text-[10px] font-orbitron">REMOVE</span>
            </button>
          </div>
          <InlineError message={social.inlineError?.key === 'friend-add' ? social.inlineError.message : null} onDismiss={social.clearError} />

          {/* Room code */}
          <div id="social-room-join-stack" className="flex gap-2">
            <input
              id="room-code-input"
              className="glass-input flex-1"
              placeholder="Room Code"
              maxLength={8}
              value={roomCode}
              onChange={e => setRoomCode(e.target.value.toUpperCase().slice(0, 8))}
            />
            <button
              id="join-room-btn"
              className={`pill-btn !rounded-xl !px-3 ${!roomCodeValid ? 'opacity-50 cursor-not-allowed' : ''}`}
              title="Join Room"
              onClick={() => {
                if (!roomCodeValid) return;
                // TODO: wire to real room join
                setRoomCode('');
              }}
              disabled={!roomCodeValid}
            >
              <Globe className="w-4 h-4" />
            </button>
          </div>

          <div id="social-hero-status" className="text-xs text-muted-foreground font-rajdhani" />
        </div>

        {/* Friends list */}
        <div id="menu-social-friends-pane">
          <span className="section-label flex items-center gap-1.5">
            <Users className="w-3 h-3" /> FRIENDS
          </span>
          <div id="social-friends-list" className="flex flex-col gap-1.5 mt-1">
            {social.friends.map(f => (
              <div
                key={f.name}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors cursor-pointer ${
                  social.removeMode ? 'hover:bg-destructive/10 border border-transparent hover:border-destructive/20' : 'hover:bg-muted/30'
                } ${social.confirmingFriend === f.name ? 'bg-destructive/10 border border-destructive/20' : ''}`}
                onClick={() => { if (social.removeMode) social.startConfirm(f.name); }}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-2 h-2 rounded-full ${f.status === 'online' ? 'bg-green-400' : 'bg-yellow-500'}`} />
                  <span className="font-rajdhani font-semibold text-sm text-foreground">{f.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  {f.inGame && social.confirmingFriend !== f.name && (
                    <span className="text-[10px] font-orbitron text-primary tracking-wider">IN GAME</span>
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
    </div>
  );
};

export default SocialHero;
