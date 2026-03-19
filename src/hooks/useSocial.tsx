import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRoom, MAX_PLAYERS } from '@/hooks/useRoom';
import { toast } from '@/hooks/use-toast';

/* ─── Types ─── */
export interface Friend {
  name: string;
  status: 'online' | 'away' | 'offline';
  inGame: boolean;
}

export interface PartyMember {
  name: string;
  isLeader: boolean;
}

export type InlineError = { key: string; message: string } | null;

/* ─── Validation ─── */
const MIN_ID_LEN = 2;
const MAX_ID_LEN = 32;

export function isValidId(val: string): boolean {
  const t = val.trim();
  return t.length >= MIN_ID_LEN && t.length <= MAX_ID_LEN;
}

/* ─── Initial data ─── */
const INITIAL_FRIENDS: Friend[] = [
  { name: 'xVortex', status: 'online', inGame: true },
  { name: 'NightOwl', status: 'online', inGame: false },
  { name: 'BlazeFury', status: 'away', inGame: false },
  { name: 'ShadowKnight', status: 'offline', inGame: false },
];

const DEMO_PARTY_NAMES = ['xVortex', 'NightOwl', 'BlazeFury', 'GhostRaven', 'IronWolf'];

/* ─── Context shape ─── */
interface SocialState {
  // Data
  friends: Friend[];
  partyMembers: PartyMember[];
  isSolo: boolean;
  isPartyLeader: boolean;

  // Remove-mode & confirmation (one pattern everywhere)
  removeMode: boolean;
  confirmingFriend: string | null;
  toggleRemoveMode: () => void;
  startConfirm: (name: string) => void;
  cancelConfirm: () => void;

  // Inline error
  inlineError: InlineError;
  clearError: () => void;

  // Click-outside ref for panels that need dismiss
  socialPanelRef: React.RefObject<HTMLDivElement>;

  // ─── Friend actions ───
  sendFriendRequest: (id: string) => boolean;
  addFriendDirect: (name: string) => void;
  removeFriend: (name: string) => void;

  // ─── Party actions ───
  inviteToParty: (name: string) => boolean;
  kickFromParty: (name: string) => void;
  leaveParty: () => void;
  transferLeader: (name: string) => void;

  // ─── Disabled rules ───
  canInviteToRoom: boolean;
  isInviteDisabled: (input: string) => boolean;
}

const SocialContext = createContext<SocialState | null>(null);

export const SocialProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoggedIn, displayName } = useAuth();
  const room = useRoom();

  const [friends, setFriends] = useState<Friend[]>(INITIAL_FRIENDS);
  const [partyMembers, setPartyMembers] = useState<PartyMember[]>([
    { name: displayName, isLeader: true },
  ]);
  const [removeMode, setRemoveMode] = useState(false);
  const [confirmingFriend, setConfirmingFriend] = useState<string | null>(null);
  const [inlineError, setInlineError] = useState<InlineError>(null);
  const socialPanelRef = useRef<HTMLDivElement>(null!);

  // Auto-clear inline error after 3s
  useEffect(() => {
    if (!inlineError) return;
    const t = setTimeout(() => setInlineError(null), 3000);
    return () => clearTimeout(t);
  }, [inlineError]);

  // Sync leader name with displayName changes
  useEffect(() => {
    setPartyMembers(prev => {
      const selfIdx = prev.findIndex(m => m.isLeader && m.name !== displayName);
      if (selfIdx === -1) return prev;
      const next = [...prev];
      next[selfIdx] = { ...next[selfIdx], name: displayName };
      return next;
    });
  }, [displayName]);

  // Login: populate demo party; Logout: reset
  const prevLoggedIn = useRef(isLoggedIn);
  useEffect(() => {
    if (!prevLoggedIn.current && isLoggedIn) {
      setPartyMembers([
        { name: displayName, isLeader: true },
        ...DEMO_PARTY_NAMES.map(n => ({ name: n, isLeader: false })),
      ]);
    }
    if (prevLoggedIn.current && !isLoggedIn) {
      if (room.isInRoom) room.leaveRoom();
      setPartyMembers([{ name: displayName, isLeader: true }]);
      setRemoveMode(false);
      setConfirmingFriend(null);
      setFriends(INITIAL_FRIENDS);
    }
    prevLoggedIn.current = isLoggedIn;
  }, [isLoggedIn, displayName, room]);

  // Click outside to dismiss remove mode + confirm
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (socialPanelRef.current && !socialPanelRef.current.contains(e.target as Node)) {
        setRemoveMode(false);
        setConfirmingFriend(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Clear selected player in room if that player was removed from party
  const clearStaleSelection = useCallback((removedName: string) => {
    if (room.selectedPlayer?.name === removedName) {
      room.selectPlayer(null);
    }
  }, [room]);

  /* ─── Computed ─── */
  const isSolo = partyMembers.length <= 1;
  const isPartyLeader = partyMembers.find(m => m.isLeader)?.name === displayName;
  const canInviteToRoom = room.isInRoom && (!room.isLocked || room.isCreator);

  const isInviteDisabled = useCallback((input: string) => {
    return !isValidId(input);
  }, []);

  /* ─── Friend actions ─── */
  const sendFriendRequest = useCallback((id: string): boolean => {
    const val = id.trim();
    if (!isValidId(val)) {
      setInlineError({ key: 'friend-add', message: 'ID must be 2–32 characters' });
      return false;
    }
    toast({ title: 'Friend request sent', description: `Sent to ${val}` });
    return true;
  }, []);

  const addFriendDirect = useCallback((name: string) => {
    setFriends(prev => {
      if (prev.find(f => f.name === name)) return prev;
      return [...prev, { name, status: 'online' as const, inGame: false }];
    });
    toast({ title: `Added ${name} as friend` });
  }, []);

  const removeFriend = useCallback((name: string) => {
    setFriends(prev => {
      const next = prev.filter(f => f.name !== name);
      if (next.length === 0) setRemoveMode(false);
      return next;
    });
    setConfirmingFriend(null);
    toast({ title: `Removed ${name}` });
  }, []);

  /* ─── Party actions ─── */
  const inviteToParty = useCallback((name: string): boolean => {
    const val = name.trim();
    if (!val) return false;
    const existing = partyMembers.find(m => m.name === val);
    if (existing) {
      setInlineError({ key: 'party-invite', message: `${val} is already in your party` });
      return false;
    }
    if (partyMembers.length >= MAX_PLAYERS) {
      setInlineError({ key: 'party-invite', message: `Party full (max ${MAX_PLAYERS})` });
      return false;
    }
    setPartyMembers(prev => [...prev, { name: val, isLeader: false }]);
    toast({ title: `${val} joined your party` });
    return true;
  }, [partyMembers]);

  const kickFromParty = useCallback((name: string) => {
    setPartyMembers(prev => prev.filter(p => p.name !== name));
    clearStaleSelection(name);
    toast({ title: `Kicked ${name}` });
  }, [clearStaleSelection]);

  const leaveParty = useCallback(() => {
    setPartyMembers([{ name: displayName, isLeader: true }]);
    toast({ title: 'Left party' });
  }, [displayName]);

  const transferLeader = useCallback((name: string) => {
    setPartyMembers(prev => prev.map(m => ({
      ...m,
      isLeader: m.name === name,
    })));
    toast({ title: `${name} is now party leader` });
  }, []);

  /* ─── Remove-mode / confirm ─── */
  const toggleRemoveMode = useCallback(() => {
    setRemoveMode(prev => !prev);
    setConfirmingFriend(null);
  }, []);

  const startConfirm = useCallback((name: string) => {
    setConfirmingFriend(prev => prev === name ? null : name);
  }, []);

  const cancelConfirm = useCallback(() => {
    setConfirmingFriend(null);
  }, []);

  const clearError = useCallback(() => {
    setInlineError(null);
  }, []);

  return (
    <SocialContext.Provider value={{
      friends, partyMembers, isSolo, isPartyLeader,
      removeMode, confirmingFriend, toggleRemoveMode, startConfirm, cancelConfirm,
      inlineError, clearError, socialPanelRef,
      sendFriendRequest, addFriendDirect, removeFriend,
      inviteToParty, kickFromParty, leaveParty, transferLeader,
      canInviteToRoom, isInviteDisabled,
    }}>
      {children}
    </SocialContext.Provider>
  );
};

export const useSocial = () => {
  const ctx = useContext(SocialContext);
  if (!ctx) throw new Error('useSocial must be used within SocialProvider');
  return ctx;
};
