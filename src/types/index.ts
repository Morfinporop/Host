export interface Server {
  id: string;
  name: string;
  ip: string;
  port: number;
  gamemode: string;
  map: string;
  players: number;
  maxPlayers: number;
  status: 'online' | 'offline' | 'starting' | 'stopping';
  cpu: number;
  ram: number;
  ramMax: number;
  uptime: number;
  tickrate: number;
}

export interface Player {
  id: string;
  name: string;
  steamId: string;
  avatar: string;
  playtime: number;
  ping: number;
  score: number;
}

export interface Addon {
  id: string;
  name: string;
  workshopId: string;
  size: string;
  enabled: boolean;
  image: string;
}

export interface FileItem {
  name: string;
  type: 'file' | 'folder';
  size?: string;
  modified?: string;
  path: string;
}

export interface ConsoleLog {
  id: string;
  time: string;
  type: 'info' | 'warning' | 'error' | 'success';
  message: string;
}

export interface Tariff {
  id: string;
  name: string;
  price: number;
  slots: number;
  ram: number;
  cpu: number;
  storage: number;
  features: string[];
  popular?: boolean;
}
