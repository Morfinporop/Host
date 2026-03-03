import { create } from 'zustand';
import { Server, Player, Addon, FileItem, ConsoleLog } from '../types';

interface ServerState {
  servers: Server[];
  selectedServer: Server | null;
  players: Player[];
  addons: Addon[];
  files: FileItem[];
  consoleLogs: ConsoleLog[];
  currentPath: string;
  setSelectedServer: (server: Server | null) => void;
  updateServerStatus: (id: string, status: Server['status']) => void;
  addConsoleLog: (log: Omit<ConsoleLog, 'id' | 'time'>) => void;
  setCurrentPath: (path: string) => void;
  toggleAddon: (id: string) => void;
}

const mockServers: Server[] = [
  {
    id: '1',
    name: 'DarkRP Main Server',
    ip: 'gmod-host.railway.app',
    port: 27015,
    gamemode: 'darkrp',
    map: 'rp_downtown_v4c_v2',
    players: 24,
    maxPlayers: 64,
    status: 'online',
    cpu: 45,
    ram: 2048,
    ramMax: 4096,
    uptime: 86400,
    tickrate: 66
  },
  {
    id: '2',
    name: 'TTT Server #1',
    ip: 'gmod-host.railway.app',
    port: 27016,
    gamemode: 'terrortown',
    map: 'ttt_minecraft_b5',
    players: 12,
    maxPlayers: 32,
    status: 'online',
    cpu: 23,
    ram: 1024,
    ramMax: 2048,
    uptime: 43200,
    tickrate: 66
  },
  {
    id: '3',
    name: 'Sandbox Creative',
    ip: 'gmod-host.railway.app',
    port: 27017,
    gamemode: 'sandbox',
    map: 'gm_construct',
    players: 0,
    maxPlayers: 16,
    status: 'offline',
    cpu: 0,
    ram: 0,
    ramMax: 2048,
    uptime: 0,
    tickrate: 66
  }
];

const mockPlayers: Player[] = [
  { id: '1', name: 'ProGamer2024', steamId: 'STEAM_0:1:12345678', avatar: '🎮', playtime: 3600, ping: 45, score: 1250 },
  { id: '2', name: 'DarkRPKing', steamId: 'STEAM_0:0:87654321', avatar: '👑', playtime: 7200, ping: 32, score: 3400 },
  { id: '3', name: 'NewPlayer', steamId: 'STEAM_0:1:11111111', avatar: '🆕', playtime: 600, ping: 78, score: 100 },
  { id: '4', name: 'AdminBoss', steamId: 'STEAM_0:0:99999999', avatar: '⚡', playtime: 14400, ping: 15, score: 8900 },
];

const mockAddons: Addon[] = [
  { id: '1', name: 'DarkRP Modification', workshopId: '123456789', size: '15.2 MB', enabled: true, image: '🎭' },
  { id: '2', name: 'M9K Weapons Pack', workshopId: '234567890', size: '245.8 MB', enabled: true, image: '🔫' },
  { id: '3', name: 'Wiremod', workshopId: '345678901', size: '89.4 MB', enabled: true, image: '⚡' },
  { id: '4', name: 'ULX Admin Mod', workshopId: '456789012', size: '2.1 MB', enabled: true, image: '🛡️' },
  { id: '5', name: 'VCMod', workshopId: '567890123', size: '156.3 MB', enabled: false, image: '🚗' },
  { id: '6', name: 'PAC3', workshopId: '678901234', size: '34.7 MB', enabled: true, image: '👤' },
];

const mockFiles: FileItem[] = [
  { name: 'addons', type: 'folder', path: '/addons' },
  { name: 'cfg', type: 'folder', path: '/cfg' },
  { name: 'data', type: 'folder', path: '/data' },
  { name: 'gamemodes', type: 'folder', path: '/gamemodes' },
  { name: 'lua', type: 'folder', path: '/lua' },
  { name: 'maps', type: 'folder', path: '/maps' },
  { name: 'materials', type: 'folder', path: '/materials' },
  { name: 'models', type: 'folder', path: '/models' },
  { name: 'sound', type: 'folder', path: '/sound' },
  { name: 'server.cfg', type: 'file', size: '4.2 KB', modified: '2024-01-15 14:30', path: '/server.cfg' },
  { name: 'autoexec.cfg', type: 'file', size: '1.1 KB', modified: '2024-01-14 09:15', path: '/autoexec.cfg' },
];

const initialLogs: ConsoleLog[] = [
  { id: '1', time: '12:00:01', type: 'info', message: 'Server starting...' },
  { id: '2', time: '12:00:05', type: 'success', message: 'SteamCMD initialized successfully' },
  { id: '3', time: '12:00:10', type: 'info', message: 'Loading gamemode: darkrp' },
  { id: '4', time: '12:00:15', type: 'info', message: 'Loading map: rp_downtown_v4c_v2' },
  { id: '5', time: '12:00:30', type: 'success', message: 'Server started on port 27015' },
  { id: '6', time: '12:01:00', type: 'info', message: 'Player ProGamer2024 connected' },
  { id: '7', time: '12:05:22', type: 'warning', message: 'High CPU usage detected (78%)' },
  { id: '8', time: '12:10:45', type: 'info', message: 'Player DarkRPKing connected' },
];

export const useServerStore = create<ServerState>((set) => ({
  servers: mockServers,
  selectedServer: mockServers[0],
  players: mockPlayers,
  addons: mockAddons,
  files: mockFiles,
  consoleLogs: initialLogs,
  currentPath: '/',
  
  setSelectedServer: (server) => set({ selectedServer: server }),
  
  updateServerStatus: (id, status) => set((state) => ({
    servers: state.servers.map(s => s.id === id ? { ...s, status } : s),
    selectedServer: state.selectedServer?.id === id ? { ...state.selectedServer, status } : state.selectedServer
  })),
  
  addConsoleLog: (log) => set((state) => ({
    consoleLogs: [...state.consoleLogs, {
      ...log,
      id: Date.now().toString(),
      time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    }]
  })),
  
  setCurrentPath: (path) => set({ currentPath: path }),
  
  toggleAddon: (id) => set((state) => ({
    addons: state.addons.map(a => a.id === id ? { ...a, enabled: !a.enabled } : a)
  }))
}));
