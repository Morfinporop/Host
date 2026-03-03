import { Server, Page } from '../App';

interface Props {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  servers: Server[];
  selectedServer: string | null;
  onSelectServer: (id: string) => void;
}

const menuItems: { id: Page; label: string; icon: string }[] = [
  { id: 'dashboard', label: 'Дашборд', icon: '📊' },
  { id: 'servers', label: 'Серверы', icon: '🖥️' },
  { id: 'console', label: 'Консоль', icon: '💻' },
  { id: 'files', label: 'Файлы', icon: '📁' },
  { id: 'players', label: 'Игроки', icon: '👥' },
  { id: 'settings', label: 'Настройки', icon: '⚙️' },
  { id: 'install', label: 'Установка', icon: '📥' },
];

export function Sidebar({ currentPage, onNavigate, servers, selectedServer, onSelectServer }: Props) {
  return (
    <aside className="fixed left-0 top-0 bottom-0 w-72 glass border-r border-zinc-800/50 flex flex-col z-50">
      <div className="p-6 border-b border-zinc-800/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xl">
            🎮
          </div>
          <div>
            <h1 className="font-bold text-lg text-white">GMod Panel</h1>
            <p className="text-xs text-zinc-500">Управление серверами</p>
          </div>
        </div>
      </div>

      {servers.length > 0 && (
        <div className="p-4 border-b border-zinc-800/50">
          <label className="text-xs text-zinc-500 mb-2 block">Активный сервер</label>
          <select
            value={selectedServer || ''}
            onChange={(e) => onSelectServer(e.target.value)}
            className="w-full bg-zinc-900/50 border border-zinc-700/50 rounded-lg px-3 py-2 text-sm"
          >
            {servers.map(server => (
              <option key={server.id} value={server.id}>
                {server.name} {server.running ? '🟢' : '⚫'}
              </option>
            ))}
          </select>
        </div>
      )}

      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-1">
          {menuItems.map(item => (
            <li key={item.id}>
              <button
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                  currentPage === item.id
                    ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-white border border-blue-500/30'
                    : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-white'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-zinc-800/50">
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs text-zinc-400">Система</span>
          </div>
          <p className="text-xs text-zinc-500">
            Railway Node.js Environment
          </p>
        </div>
      </div>
    </aside>
  );
}
