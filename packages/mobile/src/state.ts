import { atom } from 'jotai';

export type ConnectionState = 'idle' | 'connecting' | 'connected' | 'pairing-required' | 'error';

export const tvIpAtom = atom<string>('');
export const connectionStateAtom = atom<ConnectionState>('idle');
export const tokenAtom = atom<string | null>(null);
