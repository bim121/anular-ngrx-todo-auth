/** Realtime / WebSocket event contracts (SignalR later — Phase 5 / B-13). */

export type RealtimeConnectionStatus =
  | 'idle'
  | 'connecting'
  | 'connected'
  | 'disconnected'
  | 'error';

export interface TodoUpdatedRealtimeEvent {
  type: 'todo.updated';
  todo: { id: string; task?: string; completed?: boolean };
  byUserName: string;
  at: string;
}

export interface PresenceRealtimeEvent {
  type: 'presence';
  message: string;
  at: string;
}

export type RealtimeEvent = TodoUpdatedRealtimeEvent | PresenceRealtimeEvent;
